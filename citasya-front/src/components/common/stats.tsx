"use client";
import React from "react";
import { motion } from "framer-motion";

interface Stat {
	label: string;
	value: string;
	icon: React.ElementType;
	trend: string;
	trendUp: boolean;
}

interface StatsGridProps {
	stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};
	// const itemVariants = {
	// 	hidden: { opacity: 0, y: 20 },
	// 	show: {
	// 		opacity: 1,
	// 		y: 0,
	// 		transition: { type: 'spring', stiffness: 300, damping: 24 },
	// 	},
	// };
	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="show"
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
		>
			{stats.map((stat, index) => {
				const Icon = stat.icon;
				return (
					<motion.div
						key={index}
						// variants={itemVariants}
						className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
								<Icon className="w-6 h-6" />
							</div>
							<span
								className={`text-xs font-medium px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
							>
								{stat.trend}
							</span>
						</div>
						<h3 className="text-slate-500 text-sm font-medium mb-1">
							{stat.label}
						</h3>
						<p className="text-3xl font-bold text-slate-800">{stat.value}</p>
					</motion.div>
				);
			})}
		</motion.div>
	);
}
