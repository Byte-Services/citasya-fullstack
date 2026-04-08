import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, XCircleIcon, XIcon } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  autoCloseMs?: number;
}

export default function Toast({
  isOpen,
  message,
  type = 'success',
  onClose,
  autoCloseMs = 3500,
}: ToastProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(timeout);
  }, [isOpen, autoCloseMs, onClose]);

  const isError = type === 'error';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="fixed top-5 right-5 z-[80] w-[92vw] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={`rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${
              isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {isError ? (
              <XCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2Icon className="w-5 h-5 mt-0.5 shrink-0" />
            )}

            <p className="text-sm font-medium leading-5 flex-1">{message}</p>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-black/5 transition-colors"
              aria-label="Cerrar notificacion"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
