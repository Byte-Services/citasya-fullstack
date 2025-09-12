'use client';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField } from '../InputField'; 

interface ClientData {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  notes: string;
}

interface EditarClienteProps {
  onClose: () => void;
  onClientUpdated: () => void;
  clientData: ClientData;
}

export const EditarCliente: React.FC<EditarClienteProps> = ({ onClose, clientData, onClientUpdated }) => {
  const toLocalPhone = (phone: string) => {
    if (phone.startsWith("58") && phone.length === 12) {
      return "0" + phone.slice(2);
    }
    return phone;
  };

  const [formData, setFormData] = useState({
    ...clientData,
    telefono: toLocalPhone(clientData.telefono),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/admin`;

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name?: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target;
    const newValue = typeof value === 'string' ? value : value[0];
    setFormData(prev => ({ ...prev, [name as string]: newValue }));
  };

  const validateForm = () => {
    // Validar nombre
    if (!formData.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    // Validar cédula
    const cedulaRegex = /^\d{1,8}$/;
    if (!formData.cedula.trim()) {
      return "El campo cédula es obligatorio.";
    }
    if (!cedulaRegex.test(formData.cedula)) {
      return "La cédula debe tener máximo 8 dígitos numéricos.";
    }
    if (!cedulaRegex.test(formData.cedula)) {
      return "La cédula debe tener exactamente 8 números.";
    }

    // Validar teléfono (formato input: 0414xxxxxxx)
    if (!formData.telefono.trim()) {
      return "El campo teléfono es obligatorio.";
    }
    const telefonoRegex = /^(0414|0416|0424|0426|0412|0422)\d{7}$/;
    if (!telefonoRegex.test(formData.telefono)) {
      return "El teléfono debe comenzar con 0414, 0416, 0424, 0426, 0412 o 0422 y tener 11 dígitos en total.";
    }

    return null;
  };

  const handleUpdateClient = async () => {
    setLoading(true);
    setError(null);

    // Validar antes de enviar
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Transformar teléfono de 0414xxxxxxx → 58414xxxxxxx
    const formattedPhone = formData.telefono.replace(/^0/, "58");

    const clientUpdateData = {
      name: formData.nombre,
      documentId: formData.cedula,
      phone: formattedPhone,
      notes: formData.notes, 
    };

    try {
      const response = await fetch(`${API_URL}/clients/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientUpdateData),
      });

      if (!response.ok) {
        throw new Error('Error al editar cliente');
      }
      onClientUpdated();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;

    const area = phone.slice(2, 5);       // "414"
    const number = phone.slice(5);        // "3252123"

    return `0${area}${number}`;          // "0414-3252123"
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0  flex items-center justify-center z-50 bg-neutral-300/50 backdrop-blur-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <main className="max-w-[679px] w-full">
        <div className="flex flex-col py-9 w-full bg-neutral-100 rounded-[30px] shadow-lg">
          <div className="flex flex-row justify-between items-center w-full px-10">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Editar Perfil Cliente
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
            >
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </div>

          <form
            className="flex flex-col px-10 mt-8 w-full text-neutral-600"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateClient();
            }}
          >
            <ServiceFormField
              label="Nombre:"
              placeholder="Nombre del cliente"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className='mb-4'
            />
            <ServiceFormField
              label="Cédula:"
              placeholder="Ej: 12345678"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className='mb-4'
            />
            <ServiceFormField
              label="Teléfono:"
              placeholder="Ej: 04141234567"
              name="telefono"
              value={formatPhone(formData.telefono)}
              onChange={handleChange}
              className='mb-4'
            />
            <ServiceFormField
              label="Notas:"
              placeholder="Notas adicionales..."
              type="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className='mb-4'
            />

            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

            <button
              type="submit"
              className="flex self-center justify-center px-11 py-5 mt-6 w-[149px] text-base font-bold text-center text-white bg-[#447F98] rounded-[40px] hover:bg-[#629BB5] transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      </main>
    </div>,
    document.body
  );
};

export default EditarCliente;
