'use client';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField } from '../InputField'; 
import { toast } from 'react-hot-toast';

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
    if (!formData.nombre.trim()) {
      return "El nombre es obligatorio.";
    }
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

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

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
      toast.success(`Datos actualizados correctamente`);

      onClientUpdated();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;

    const area = phone.slice(2, 5);       
    const number = phone.slice(5);        
    return `0${area}${number}`;          
  };

  return ReactDOM.createPortal(
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm z-50 px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-xl bg-neutral-100 rounded-[25px] shadow-2xl p-6 sm:p-10 font-[Poppins,sans-serif]">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-medium text-[#447F98] text-center flex-1 font-[Roboto_Condensed,sans-serif]">
            Editar Cliente
          </h1>
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-800 transition-colors">
            <VscChromeClose className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); handleUpdateClient(); }} className="flex flex-col gap-4">
          <ServiceFormField 
            label="Nombre:" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
          />
          <ServiceFormField 
            label="Cédula:" 
            name="cedula" 
            value={formData.cedula} 
            onChange={handleChange} 
          />
          <ServiceFormField 
            label="Teléfono:" 
            name="telefono" 
            value={formatPhone(formData.telefono)} 
            onChange={handleChange} 
          />
          <ServiceFormField 
            label="Notas:" 
            name="notes" 
            type="textarea" 
            value={formData.notes} 
            onChange={handleChange} 
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 mx-auto w-full sm:w-[160px] py-4 bg-[#447F98] hover:bg-[#629BB5] text-white font-semibold rounded-[40px] transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditarCliente;
