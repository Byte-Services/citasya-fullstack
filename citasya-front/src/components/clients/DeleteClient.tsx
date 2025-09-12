'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from 'react-icons/vsc';

interface EliminarClienteProps {
  onClose: () => void;
  onConfirm: () => Promise<void>; // ahora async
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-300/50 backdrop-blur-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <main className="max-w-[400px] w-full">
        <div className="flex flex-col py-9 px-8 w-full bg-neutral-100 rounded-[30px] shadow-lg">
          <div className="flex flex-row justify-between items-center w-full px-10 gap-6">
            <div className="flex-1"></div>
            <h1 className="text-2xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Eliminar Cliente
            </h1>
            <button onClick={onClose} aria-label="Cerrar modal" className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200">
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </div>

            <div className="text-center mt-6 mb-8 text-neutral-600">
            {error ? (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            ) : (
              <>
              <p>¿Estás seguro de que deseas eliminar este cliente?</p>
              <p>Esta acción no se puede deshacer.</p>
              </>
            )}
            </div>
          
          <div className="flex justify-center gap-4">
            {error ? (
            <button onClick={onClose} className="px-8 py-3 text-base font-bold text-neutral-600 bg-neutral-300 rounded-[40px] hover:bg-neutral-400 transition-colors">
              Cancelar
            </button>
            ) : (
            <button onClick={handleConfirm} className="px-8 py-3 text-base font-bold bg-[#FEE2E2] text-[#B91C1C] rounded-[40px] hover:bg-[#FFC1C1] transition-colors">
              Eliminar
            </button>
            )}
          </div>
        </div>
      </main>
    </div>,
    document.body
  );
};
