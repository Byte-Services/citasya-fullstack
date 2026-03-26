import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";

interface Appointment {
	id: number;
	day: number;
	startHour: number;
	duration: number;
	client: string;
	service: string;
	color: string;
}

interface CalendarProps {
	days: string[];
	hours: number[];
	appointments: Appointment[];
}

const Calendar: React.FC<CalendarProps> = ({ days, hours, appointments }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex flex-col"
		>
			{/* Calendar Header */}
			<div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50/50">
				<div className="p-4 flex items-center justify-center border-r border-gray-100">
					<CalendarIcon className="w-5 h-5 text-slate-400" />
				</div>
				{days.map((day, i) => (
					<div
						key={i}
						className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${i === 2 ? 'bg-primary/5' : ''}`}
					>
						<p className={`text-sm font-medium ${i === 2 ? 'text-primary' : 'text-slate-600'}`}>{day.split(' ')[0]}</p>
						<p className={`text-2xl font-bold mt-1 ${i === 2 ? 'text-primary' : 'text-slate-800'}`}>{day.split(' ')[1]}</p>
					</div>
				))}
			</div>
			{/* Calendar Grid */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				<div className="relative" style={{ height: `${hours.length * 80}px` }}>
					{/* Grid Lines */}
					{hours.map((hour, i) => (
						<div
							key={i}
							className="absolute w-full grid grid-cols-8 border-b border-gray-100"
							style={{ top: `${i * 80}px`, height: '80px' }}
						>
							<div className="border-r border-gray-100 flex items-start justify-center p-2">
								<span className="text-xs font-medium text-slate-400">
									{hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
								</span>
							</div>
							{days.map((_, j) => (
								<div
									key={j}
									className={`border-r border-gray-100 last:border-r-0 ${j === 2 ? 'bg-primary/5' : ''}`}
								></div>
							))}
						</div>
					))}
					{/* Current Time Indicator (Mocked at 10:30 AM on Wed) */}
					<div
						className="absolute w-full grid grid-cols-8 pointer-events-none"
						style={{ top: `${2.5 * 80}px` }}
					>
						<div className="col-start-2 col-span-7 relative">
							<div className="absolute left-0 right-0 border-t-2 border-primary z-20"></div>
							<div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-primary z-20"></div>
						</div>
					</div>
					{/* Appointments */}
					{appointments.map((apt) => {
						const top = (apt.startHour - 8) * 80;
						const height = apt.duration * 80;
						return (
							<motion.div
								key={apt.id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								whileHover={{ scale: 1.02, zIndex: 30 }}
								className={`absolute rounded-lg border p-2 shadow-sm cursor-pointer overflow-hidden ${apt.color}`}
								style={{
									top: `${top + 2}px`,
									height: `${height - 4}px`,
									left: `calc(${(apt.day + 1) * 12.5}% + 4px)` ,
									width: `calc(12.5% - 8px)` ,
									zIndex: 10,
								}}
							>
								<p className="text-xs font-bold truncate">{apt.client}</p>
								<p className="text-xs truncate opacity-90">{apt.service}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
};

export default Calendar;
