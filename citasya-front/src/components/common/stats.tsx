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
			className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10"
		>
			{stats.map((stat, index) => {
				const Icon = stat.icon;
				return (
					<motion.div
						key={index}
						// variants={itemVariants}
						className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-soft border border-gray-100"
					>
						<div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
								<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
							</div>
							<span
								className={`inline-flex items-center text-[11px] sm:text-xs leading-tight font-medium px-2.5 py-1 rounded-full max-w-[65%] sm:max-w-none ${stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
							>
								{stat.trend}
							</span>
						</div>
						<h3 className="text-slate-500 text-sm sm:text-base font-medium mb-1">
							{stat.label}
						</h3>
						<p className="text-4xl sm:text-3xl lg:text-4xl leading-none font-bold text-slate-800 break-words">{stat.value}</p>
					</motion.div>
				);
			})}
		</motion.div>
	);
}
