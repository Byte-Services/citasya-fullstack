import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";

interface Appointment {
	id: number;
	day: number;
	startHour: number;
	duration: number;
	client: string;
	service: string;
	worker: string;
	color: string;
}

interface CalendarProps {
	days: string[];
	hours: number[];
	appointments: Appointment[];
	highlightDayIndex?: number | null;
}

export default function Calendar({
	days,
	hours,
	appointments,
	highlightDayIndex = null,
}: CalendarProps) {
	const safeDaysCount = Math.max(1, days.length);

	const formatDuration = (durationInHours: number) => {
		const totalMinutes = Math.max(30, Math.round(durationInHours * 60));
		if (totalMinutes % 60 === 0) {
			return `${totalMinutes / 60}h`;
		}
		return `${totalMinutes} min`;
	};

	const formatHourLabel = (hourValue: number) => {
		const normalized = Math.max(0, Math.min(23.99, hourValue));
		const hoursPart = Math.floor(normalized);
		const minutesPart = Math.round((normalized - hoursPart) * 60);
		const date = new Date();
		date.setHours(hoursPart, minutesPart, 0, 0);
		return date.toLocaleTimeString("es-ES", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const positionedAppointments = useMemo(() => {
		const byDay = new Map<number, Appointment[]>();

		for (const appointment of appointments) {
			const list = byDay.get(appointment.day) ?? [];
			list.push(appointment);
			byDay.set(appointment.day, list);
		}

		type Positioned = Appointment & { lane: number; laneCount: number };
		const result: Positioned[] = [];

		for (const dayAppointments of byDay.values()) {
			const sorted = [...dayAppointments].sort((a, b) => {
				if (a.startHour !== b.startHour) return a.startHour - b.startHour;
				return a.duration - b.duration;
			});

			let cluster: Appointment[] = [];
			let clusterEnd = -1;

			const flushCluster = () => {
				if (cluster.length === 0) return;

				const clusterSorted = [...cluster].sort((a, b) => {
					if (a.startHour !== b.startHour) return a.startHour - b.startHour;
					return a.duration - b.duration;
				});

				const laneEndTimes: number[] = [];
				const positionedCluster: Array<Appointment & { lane: number }> = [];

				for (const appointment of clusterSorted) {
					const start = appointment.startHour;
					const end = appointment.startHour + appointment.duration;

					let lane = laneEndTimes.findIndex((laneEnd) => laneEnd <= start);
					if (lane === -1) {
						lane = laneEndTimes.length;
						laneEndTimes.push(end);
					} else {
						laneEndTimes[lane] = end;
					}

					positionedCluster.push({
						...appointment,
						lane,
					});
				}

				const laneCount = Math.max(1, laneEndTimes.length);
				for (const appointment of positionedCluster) {
					result.push({ ...appointment, laneCount });
				}

				cluster = [];
				clusterEnd = -1;
			};

			for (const appointment of sorted) {
				const start = appointment.startHour;
				const end = appointment.startHour + appointment.duration;

				if (cluster.length === 0) {
					cluster.push(appointment);
					clusterEnd = end;
					continue;
				}

				if (start < clusterEnd) {
					cluster.push(appointment);
					clusterEnd = Math.max(clusterEnd, end);
					continue;
				}

				flushCluster();
				cluster.push(appointment);
				clusterEnd = end;
			}

			flushCluster();
		}

		return result;
	}, [appointments]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col"
		>
			<div
				className="grid border-b border-gray-100 bg-gray-50/50"
				style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))` }}
			>
				<div className="p-4 flex items-center justify-center border-r border-gray-100">
					<CalendarIcon className="w-5 h-5 text-slate-400" />
				</div>
				{days.map((day, i) => {
					const [weekday, date] = day.split(' ');
					const isHighlighted = highlightDayIndex === i;

					return (
						<div
							key={`${day}-${i}`}
							className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${isHighlighted ? 'bg-primary/5' : ''}`}
						>
							<p className={`text-sm font-medium ${isHighlighted ? 'text-primary' : 'text-slate-600'}`}>
								{weekday}
							</p>
							<p className={`text-2xl font-bold mt-1 ${isHighlighted ? 'text-primary' : 'text-slate-800'}`}>
								{date}
							</p>
						</div>
					);
				})}
			</div>

			<div className="flex-1 overflow-y-auto custom-scrollbar">
				<div className="relative" style={{ height: `${hours.length * 80}px` }}>
					{hours.map((hour, i) => (
						<div
							key={hour}
							className="absolute w-full grid border-b border-gray-100"
							style={{
								top: `${i * 80}px`,
								height: '80px',
								gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))`,
							}}
						>
							<div className="border-r border-gray-100 flex items-start justify-center p-2">
								<span className="text-xs font-medium text-slate-400">
									{hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
								</span>
							</div>
							{days.map((_, dayIndex) => (
								<div
									key={dayIndex}
									className={`border-r border-gray-100 last:border-r-0 ${highlightDayIndex === dayIndex ? 'bg-primary/5' : ''}`}
								/>
							))}
						</div>
					))}

					{positionedAppointments.map((appointment) => {
						const top = (appointment.startHour - hours[0]) * 80;
						const height = appointment.duration * 80;
						const durationLabel = formatDuration(appointment.duration);
						const startTime = formatHourLabel(appointment.startHour);
						const endTime = formatHourLabel(appointment.startHour + appointment.duration);
						const safeDay = Math.max(0, Math.min(days.length - 1, appointment.day));
						const safeLaneCount = Math.max(1, appointment.laneCount);
						const safeLane = Math.max(0, Math.min(safeLaneCount - 1, appointment.lane));
						const leftExpr = `80px + ((100% - 80px) / ${safeDaysCount}) * (${safeDay} + ${safeLane} / ${safeLaneCount}) + 4px`;
						const widthExpr = `((100% - 80px) / ${safeDaysCount} / ${safeLaneCount}) - 8px`;

						return (
							<motion.div
								key={appointment.id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								whileHover={{ scale: 1.02, zIndex: 30 }}
								className={`group absolute rounded-lg border px-3 py-2 shadow-sm cursor-pointer overflow-visible ${appointment.color}`}
								style={{
									top: `${top + 2}px`,
									left: `calc(${leftExpr})`,
									width: `calc(${widthExpr})`,
									height: `${Math.max(height - 4, 28)}px`,
									zIndex: 10,
								}}
							>
								<div className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
									<div className="rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2 min-w-[210px] text-xs text-slate-700">
										<p><span className="font-semibold">Cliente:</span> {appointment.client}</p>
										<p><span className="font-semibold">Servicio:</span> {appointment.service}</p>
										<p><span className="font-semibold">Trabajador:</span> {appointment.worker}</p>
										<p><span className="font-semibold">Hora:</span> {startTime} - {endTime}</p>
									</div>
								</div>

								<span className="absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/70 border border-white/70">
									{durationLabel}
								</span>
								<div className="h-full flex flex-col items-center justify-center text-center pr-0">
									<p className="text-xs font-bold truncate w-full">{appointment.client}</p>
									<p className="text-[11px] truncate opacity-90 w-full">{appointment.service}</p>
									<p className="text-[11px] truncate opacity-80 w-full">{appointment.worker}</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
}
