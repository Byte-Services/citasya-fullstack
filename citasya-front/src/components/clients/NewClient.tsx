'use client';

import React, { useState } from 'react';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField } from '../InputField';
import { toast } from 'react-hot-toast/headless';

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

    // Validaciones frontend
    if (!formData.nombre.trim() || !formData.cedula.trim() || !formData.telefono.trim()) {
      setError("Todos los campos obligatorios deben estar completos.");
      setLoading(false);
      return;
    }

    // Cedula: solo números, hasta 8 dígitos
    const cedulaRegex = /^\d{1,8}$/;
    if (!cedulaRegex.test(formData.cedula)) {
      setError("La cédula debe contener solo números y máximo 8 dígitos.");
      setLoading(false);
      return;
    }

    // Teléfono: validar 58 + código de 3 dígitos + número de 7 dígitos
    const telefonoRegex = /^58\d{10}$/; 
    if (!telefonoRegex.test(formData.telefono)) {
      setError("El teléfono debe estar en formato 58XXXXXXXXXXX (ej: 584143252123).");
      setLoading(false);
      return;
    }

    // Preparar datos
    const clientData = {
      name: formData.nombre.trim(),
      documentId: formData.cedula.trim(),
      phone: formData.telefono.trim(),
      notes: formData.nota.trim() || "Sin notas registradas",
    };

    try {
      // Validar si ya existe el cliente con esa cédula
      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients/document/${clientData.documentId}`);
      if (checkResponse.ok) {
        const existingClient = await checkResponse.json();
        if (existingClient) {
          setError("Ya existe un cliente con esa cédula.");
          setLoading(false);
          return;
        }
      }

      // Crear cliente
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
      console.error("Error al agregar cliente:", e);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center " style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-xl w-full mx-4 sm:mx-6 md:mx-auto">
        <div className="flex flex-col py-9 px-6 sm:px-10 md:px-12 w-full bg-neutral-100 rounded-[30px] shadow-2xl">
          <header className="flex justify-between items-center w-full">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Nuevo Cliente
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
            >
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </header>

          <form className="flex flex-col mt-8 w-full text-neutral-600" onSubmit={(e) => { e.preventDefault(); handleAddClient(); }}>
            <div className="flex flex-wrap gap-10 max-md:flex-col">
              <ServiceFormField
                label="Nombre del cliente:"
                placeholder="Ingresa nombre..."
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
              <ServiceFormField
                label="Cédula:"
                placeholder="Ingresa cédula..."
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>

            <div className="flex flex-wrap gap-10 mt-6 max-md:flex-col">
              <ServiceFormField
                label="Teléfono:"
                placeholder="xxxxxxxxxx"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="flex-1 grow shrink-0 basis-0 w-fit"
              />
            </div>
            
            <ServiceFormField
              label="Nota:"
              placeholder="Escribe una nota para el cliente..."
              type="textarea"
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              className="mt-6"
            />

            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

            <button
              type="submit"
              className="flex justify-center self-center px-11 py-5 mt-10 max-w-full text-sm font-semibold text-center text-white whitespace-nowrap bg-[#447F98] rounded-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[149px] max-md:px-5 hover:bg-[#629BB5] transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              disabled={loading}
            >
              <span>{loading ? 'Agregando...' : 'Agregar'}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default NuevoCliente;