'use client';

import React, { useState, ChangeEvent } from 'react';
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField } from '../InputField';
import { UserRole, User } from '../../types/user';
import { toast } from 'react-hot-toast';

interface NewUserProps {
  onClose: () => void;
  onUserAdded: (newUser: User) => void;
}

export const NewUser: React.FC<NewUserProps> = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.Admin,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const handleChange = (
      e:
        | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        | { target: { name?: string; value: string | string[] } }
    ) => {
      if (
        "target" in e &&
        typeof (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).type === "string"
      ) {
        const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (type === "checkbox") {
          setFormData(prev => ({
            ...prev,
            [name]: (e.target as HTMLInputElement).checked,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: value,
          }));
        }
      } else if ("target" in e && typeof e.target.value !== "undefined") {
        const { name, value } = e.target;
        if (name) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
          }));
        }
      }
    };


  const handleAddUser = async () => {
    setLoading(true);
    setError(null);

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("El correo electrónico no es válido.");
      setLoading(false);
      return;
    }

    if (!/^04\d{9}$/.test(formData.phone)) {
      setError("El teléfono debe tener el formato 04141234567 (11 dígitos).");
      setLoading(false);
      return;
    }

    const normalizedPhone = "58" + formData.phone.substring(1);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: normalizedPhone,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || 'Error al crear el usuario');
      }

      toast.success(`Agregado correctamente el Usuario ${formData.name}`);

      onUserAdded(responseData as User);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="max-w-xl w-full min-w-[600px] mx-4 sm:mx-6 md:mx-auto">
        <div className="flex flex-col py-9 px-6 sm:px-10 md:px-12 w-full bg-neutral-100 rounded-[30px] shadow-2xl">
          <header className="flex justify-between items-center w-full">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]"
              style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Nuevo Usuario
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
            >
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </header>

          <form className="flex flex-col mt-8 w-full text-neutral-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-6">
                <ServiceFormField<string>
                  label="Nombre:"
                  placeholder="Ingresa nombre..."
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <ServiceFormField<string>
                  label="Correo:"
                  placeholder="ejemplo@correo.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <ServiceFormField<string>
                  label="Contraseña:"
                  placeholder="********"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-6">
                <ServiceFormField<string>
                  label="Teléfono:"
                  placeholder="04141234567"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <ServiceFormField<string>
                  label="Rol:"
                  name="role"
                  type="select"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: UserRole.Admin, label: 'Admin' },
                    { value: UserRole.Coordinator, label: 'Coordinator' }
                  ]}
                />

                <ServiceFormField<string>
                  label="Confirmar Contraseña:"
                  placeholder="********"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

              </div>
            </div>

            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

            <button
              onClick={handleAddUser}
              type="button"
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
