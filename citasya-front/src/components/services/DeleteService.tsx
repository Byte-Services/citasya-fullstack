'use client';

import React from 'react';
import { VscChromeClose } from "react-icons/vsc";

interface DeleteServiceProps {
  onClose: () => void;
  onConfirm: () => void;
  errorMessage?: string; 
}

export const DeleteService: React.FC<DeleteServiceProps> = ({ onClose, onConfirm, errorMessage }) => {
  return (
    <main className="max-w-[400px] w-full mx-4 sm:mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex flex-col py-6 px-4 sm:px-8 w-full bg-neutral-100 rounded-[20px] sm:rounded-[30px] shadow-lg">

        <header className="flex flex-col self-stretch text-xl sm:text-2xl font-medium leading-none text-center text-stone-400">
          <div className="flex justify-between items-start mb-2 sm:mb-0">
            <h1 className="text-[#447F98] text-xl sm:text-2xl" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Eliminar Servicio
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-[30px] h-[30px] cursor-pointer"
            >
              <VscChromeClose className="text-xl sm:text-2xl text-neutral-600 hover:text-neutral-800 transition-colors duration-200" />
            </button>
          </div>
        </header>
        
        <div className="text-center mt-4 mb-4 text-neutral-600 text-sm sm:text-base">
          {errorMessage ? (
            <p className="text-red-600 font-medium px-2">
              {errorMessage}
            </p>
          ) : (
            <div className="space-y-1">
              <p>¿Estás seguro de que deseas eliminar este servicio?</p>
              <p>Esta acción no se puede deshacer.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-center text-neutral-600 whitespace-nowrap bg-neutral-300 rounded-[40px] shadow hover:bg-neutral-400 transition-colors duration-200"
          >
            {errorMessage ? "Cerrar" : "Cancelar"}
          </button>

          {!errorMessage && (
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-center text-[#B91C1C] whitespace-nowrap bg-[#FEE2E2] rounded-[40px] shadow hover:bg-[#FFC1C1] transition-colors duration-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </main>
  );
};