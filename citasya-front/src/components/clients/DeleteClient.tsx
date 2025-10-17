'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from 'react-icons/vsc';

interface EliminarClienteProps {
  onClose: () => void;
  onConfirm: () => Promise<void>; 
}

export const EliminarCliente: React.FC<EliminarClienteProps> = ({ onClose, onConfirm }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "No se pudo eliminar el cliente.");
      } else {
        setError("No se pudo eliminar el cliente.");
      }
    }
  };

  return ReactDOM.createPortal(
     <div className="fixed inset-0 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm z-50 px-4 sm:px-6">
      <div className="w-full max-w-sm bg-neutral-100 rounded-[25px] shadow-2xl p-6 sm:p-10 font-[Poppins,sans-serif] text-center">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#447F98] flex-1 font-[Roboto_Condensed,sans-serif]">
            Eliminar Cliente
          </h1>
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-800 transition-colors">
            <VscChromeClose className="w-6 h-6" />
          </button>
        </header>

        {error ? (
          <p className="text-red-500 mb-6">{error}</p>
        ) : (
          <>
            <p className="text-neutral-600 mb-2">¿Estás seguro de que deseas eliminar este cliente?</p>
            <p className="text-neutral-500 mb-6">Esta acción no se puede deshacer.</p>
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 font-semibold rounded-[40px] bg-neutral-300 hover:bg-neutral-400 transition-colors"
          >
            Cancelar
          </button>
          {!error && (
            <button
              onClick={handleConfirm}
              className="px-8 py-3 font-semibold rounded-[40px] bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FFC1C1] transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
