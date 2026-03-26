"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangleIcon } from "lucide-react";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	confirmVariant?: "danger" | "primary";
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Eliminar",
	confirmVariant = "danger",
}: ConfirmDialogProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
					/>

					{/* Centered Dialog */}
					<div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 pointer-events-auto"
						>
							<div className="flex flex-col items-center text-center">
								<div
									className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmVariant === "danger" ? "bg-rose-100 text-rose-600" : "bg-primary/10 text-primary"}`}
								>
									<AlertTriangleIcon className="w-6 h-6" />
								</div>

								<h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
								<p className="text-sm text-slate-500 mb-6">{message}</p>

								<div className="flex w-full space-x-3">
									<button
										onClick={onClose}
										className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors"
									>
										Cancelar
									</button>
									<button
										onClick={() => {
											onConfirm();
											onClose();
										}}
										className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors shadow-sm ${confirmVariant === "danger" ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary-hover"}`}
									>
										{confirmLabel}
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
