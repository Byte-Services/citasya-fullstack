"use client";
import { motion } from "framer-motion";
import { PlusIcon, UserPlusIcon, CalendarIcon } from "lucide-react";

export function QuickActions() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
			className="space-y-6"
		>
			<div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
				<h2 className="text-xl font-bold text-slate-800 mb-4">
					Acciones Rápidas
				</h2>
				<div className="space-y-3">
					<button className="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
						<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
							<PlusIcon className="w-5 h-5" />
						</div>
						<div className="text-left">
							<p className="font-medium text-slate-800">Nueva Cita</p>
							<p className="text-xs text-slate-500">
								Agendar un nuevo servicio
							</p>
						</div>
					</button>
					<button className="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
						<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
							<UserPlusIcon className="w-5 h-5" />
						</div>
						<div className="text-left">
							<p className="font-medium text-slate-800">
								Nuevo Cliente
							</p>
							<p className="text-xs text-slate-500">
								Registrar en el directorio
							</p>
						</div>
					</button>
					<button className="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
						<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
							<CalendarIcon className="w-5 h-5" />
						</div>
						<div className="text-left">
							<p className="font-medium text-slate-800">
								Ver Calendario
							</p>
							<p className="text-xs text-slate-500">
								Revisar disponibilidad
							</p>
						</div>
					</button>
				</div>
			</div>
			<div className="bg-gradient-to-br from-sidebar to-slate-800 p-6 rounded-2xl shadow-soft text-white relative overflow-hidden">
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
				<h3 className="font-playfair text-xl font-bold mb-2 relative z-10">
					Consejo del día
				</h3>
				<p className="text-sm text-gray-300 relative z-10 leading-relaxed">
					Ofrecer paquetes de servicios aumenta la retención de clientes
					en un 25%. Considera crear un paquete de .
				</p>
			</div>
		</motion.div>
	);
}
