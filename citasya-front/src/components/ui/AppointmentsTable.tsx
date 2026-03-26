"use client";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

export interface Appointment {
	id: number;
	time: string;
	client: string;
	service: string;
	specialist: string;
	status: string;
}

interface AppointmentsTableProps {
	appointments: Appointment[];
	title?: string;
}

export function AppointmentsTable({ appointments, title = "Próximas Citas" }: AppointmentsTableProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
		>
			<div className="p-6 border-b border-gray-100 flex items-center justify-between">
				<h2 className="text-xl font-bold text-slate-800">
					{title}
				</h2>
				<button className="text-sm text-primary hover:text-primary-hover font-medium flex items-center">
					Ver todas <ArrowRightIcon className="w-4 h-4 ml-1" />
				</button>
			</div>
			<div className="divide-y divide-gray-50">
				{appointments.map((apt, index) => (
					<motion.div
						key={apt.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 + index * 0.1 }}
						className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
					>
						<div className="flex items-center space-x-4">
							<div className="text-center min-w-[80px]">
								<p className="text-sm font-bold text-slate-800">
									{apt.time}
								</p>
							</div>
							<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
								{apt.client.charAt(0)}
							</div>
							<div>
								<p className="font-medium text-slate-800">
									{apt.client}
								</p>
								<p className="text-sm text-slate-500">
									{apt.service} • con {apt.specialist}
								</p>
							</div>
						</div>
						<div>
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === "confirmada" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
							>
								{apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
							</span>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
