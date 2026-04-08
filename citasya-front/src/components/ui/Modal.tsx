"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	onSubmit?: (e: React.FormEvent) => void;
	submitLabel?: string;
	noValidate?: boolean;
	isSubmitting?: boolean;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	onSubmit,
	submitLabel = "Guardar",
	noValidate = false,
	isSubmitting = false,
}: ModalProps) {
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
						className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
					/>

					{/* Slide-over Panel */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 rounded-l-2xl flex flex-col overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10">
							<h2 className="text-xl font-bold text-slate-800">{title}</h2>
							<button
								onClick={onClose}
								className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
							>
								<XIcon className="w-5 h-5" />
							</button>
						</div>

						{/* Body */}
						<div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
							{onSubmit ? (
								<form id="modal-form" onSubmit={onSubmit} noValidate={noValidate} className="space-y-6">
									{children}
								</form>
							) : (
								<div className="space-y-6">{children}</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 rounded-lg font-medium border border-gray-200 text-slate-600 hover:bg-gray-100 transition-colors"
							>
								Cancelar
							</button>
							{onSubmit && (
								<button
									type="submit"
									form="modal-form"
									disabled={isSubmitting}
									className="bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
								>
									{submitLabel}
								</button>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
