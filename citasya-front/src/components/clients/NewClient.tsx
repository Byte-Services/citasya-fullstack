'use client';

import React, { useState } from 'react';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField } from '../InputField';
import { toast } from 'react-hot-toast';

interface NuevoClienteProps {
  onClose: () => void;
}

export const NuevoCliente: React.FC<NuevoClienteProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    nota: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name?: string; value: string | string[] } }
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    const newValue = typeof value === 'string' ? value : value[0];
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAddClient = async () => {
    setLoading(true);
    setError(null);

    if (!formData.nombre.trim() || !formData.cedula.trim() || !formData.telefono.trim()) {
      setError("Todos los campos obligatorios deben estar completos.");
      setLoading(false);
      return;
    }
    const cedulaRegex = /^\d{1,8}$/;
    if (!cedulaRegex.test(formData.cedula)) {
      setError("La cédula debe contener solo números y máximo 8 dígitos.");
      setLoading(false);
      return;
    }
    const telefonoRegex = /^58\d{10}$/; 
    if (!telefonoRegex.test(formData.telefono)) {
      setError("El teléfono debe estar en formato 58XXXXXXXXXXX (ej: 584143252123).");
      setLoading(false);
      return;
    }

    const clientData = {
      name: formData.nombre.trim(),
      documentId: formData.cedula.trim(),
      phone: formData.telefono.trim(),
      notes: formData.nota.trim() || "Sin notas registradas",
    };

    try {
      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients/document/${clientData.documentId}`);
      if (checkResponse.ok) {
        const existingClient = await checkResponse.json();
        if (existingClient) {
          setError("Ya existe un cliente con esa cédula.");
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el cliente. Por favor, intenta de nuevo.");
      }

      toast.success(`Agregado correctamente el Cliente ${formData.nombre}`);

      onClose();

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Ocurrió un error inesperado.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-xl bg-neutral-100 rounded-[25px] shadow-2xl p-6 sm:p-10 font-[Poppins,sans-serif]">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-medium text-[#447F98] text-center flex-1 font-[Roboto_Condensed,sans-serif]">
            Nuevo Cliente
          </h1>
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-800 transition-colors">
            <VscChromeClose className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); handleAddClient(); }} className="flex flex-col gap-5 text-neutral-600">
          <div className="flex flex-col sm:flex-row gap-5">
            <ServiceFormField label="Nombre del cliente:" name="nombre" placeholder="Ingresa nombre..." value={formData.nombre} onChange={handleChange} />
            <ServiceFormField label="Cédula:" name="cedula" placeholder="Ingresa cédula..." value={formData.cedula} onChange={handleChange} />
          </div>
          <ServiceFormField label="Teléfono:" name="telefono" placeholder="584141234567" value={formData.telefono} onChange={handleChange} />
          <ServiceFormField label="Nota:" name="nota" type="textarea" placeholder="Escribe una nota..." value={formData.nota} onChange={handleChange} />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 mx-auto w-full sm:w-[160px] py-4 bg-[#447F98] hover:bg-[#629BB5] text-white font-semibold rounded-[40px] transition-colors"
          >
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevoCliente;