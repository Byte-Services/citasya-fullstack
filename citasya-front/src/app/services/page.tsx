'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServiceGrid } from '../../components/services/ServiceGrid';
import { NewService } from '../../components/services/NewService';
import { EditService } from '../../components/services/EditService';
import { DeleteService } from '../../components/services/DeleteService';
import { VscAdd } from "react-icons/vsc";
import { VscChromeClose } from "react-icons/vsc";
import { ServiceFormField, SelectOption } from "@/components/InputField";
import { toast } from 'react-hot-toast';
import { useUser } from '@/context/UserContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface SpecialtyData {
  id: number;
  name: string;
}

interface ServiceData {
  id: string;
  name: string;
  specialty: SpecialtyData;
  description: string;
  minutes_duration: number;
  price: number;
  status: string;
}

const Services: React.FC = () => {
  useAuthRedirect();
  const { user } = useUser();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState('');
  const [deletingErrorMessage, setDeletingErrorMessage] = useState<string | null>(null); 
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [specialties, setSpecialties] = useState<SpecialtyData[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null);
  const [showManageSpecialtyModal, setShowManageSpecialtyModal] = useState(false);
  const [newSpecialtyValue, setNewSpecialtyValue] = useState('');
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [newSpecialtyError, setNewSpecialtyError] = useState<string | null>(null);

  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`;


  const handleOpenNewModal = () => setShowNewModal(true);
  const handleCloseNewModal = () => {
    setShowNewModal(false); 
    fetchSpecialties();
    fetchServices();
  };

  const handleOpenEditModal = (serviceData: ServiceData) => {
    setEditingService(serviceData);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    fetchSpecialties();
    fetchServices();
  };

  const handleOpenDeleteModal = (serviceId: string) => {
      setDeletingServiceId(serviceId);
      setDeletingErrorMessage(null); 
      setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    fetchServices();
  };

  const handleOpenManageSpecialtyModal = () => setShowManageSpecialtyModal(true);
  const handleCloseManageSpecialtyModal = () => {
    setShowManageSpecialtyModal(false);
    fetchSpecialties(); 
  };

  const handleAddSpecialty = async () => {
    if (newSpecialtyValue.trim() !== '') {
      try {
        const response = await fetch(`${API_URL}/specialties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newSpecialtyValue.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // ⬇️ Guardamos el error en estado en lugar de alert
          setNewSpecialtyError(errorData.error || 'Error al agregar la especialidad.');
          return;
        }

        setNewSpecialtyValue('');
        setNewSpecialtyError(null); // limpiar error si se agregó bien
        fetchSpecialties();
      } catch (error: unknown) {
        setNewSpecialtyError(error instanceof Error ? error.message : String(error));
      }
    }
  };


  const handleRemoveSpecialty = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/specialties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la especialidad.');
      }

      fetchSpecialties();
      toast.success("Especialidad eliminada correctamente");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };


  const handleSpecialtyChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: string | string[] } }
  ) => {
    const value =
      'target' in e && typeof e.target.value === 'string'
        ? e.target.value
        : Array.isArray(e.target.value)
        ? e.target.value[0]
        : '';
    if (value === 'manage_specialties') {
      handleOpenManageSpecialtyModal();
    } else {
      setSelectedSpecialty(value);
    }
  };

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: string | string[] } }
  ) => {
    const value =
      'target' in e && typeof e.target.value === 'string'
        ? e.target.value
        : Array.isArray(e.target.value)
        ? e.target.value[0]
        : '';
    setSelectedStatus(value);
  };

  const confirmDelete = async () => {
      try {
          const response = await fetch(`${API_URL}/services/${deletingServiceId}`, {
              method: 'DELETE',
          });

          if (!response.ok) {
              // Si la respuesta no es 2xx, leemos el mensaje de error del backend
              const errorData = await response.json();
              // ➡️ Actualizamos el estado de error
              setDeletingErrorMessage(errorData.error || 'Error al eliminar el servicio.');
              return; // Detenemos la ejecución aquí
          }

          // Si la eliminación fue exitosa (código 204), limpiamos el error
          setDeletingErrorMessage(null);
          handleCloseDeleteModal();
          fetchServices();
      } catch (error: unknown) {
          console.error('Error al eliminar el servicio:', error);
          // ➡️ En caso de un error de red, también actualizamos el estado
          setDeletingErrorMessage('Error de conexión. Intente de nuevo más tarde.');
      }
  };

  const handleEditService = (serviceData: ServiceData) => {
    handleOpenEditModal(serviceData);
  };

  const handleDeleteService = (id: string) => {
    handleOpenDeleteModal(id);
  };

  const fetchSpecialties = useCallback(async () => {
    setLoadingSpecialties(true);
    setSpecialtiesError(null);
    try {
      const response = await fetch(`${API_URL}/specialties`);
      if (!response.ok) {
        throw new Error('Error al cargar las especialidades');
      }
      const data = await response.json();
      setSpecialties(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
    } finally {
      setLoadingSpecialties(false);
    }
  }, [API_URL]);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    setServicesError(null);
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) {
        throw new Error('Error al cargar los servicios');
      }
      const data = await response.json();
      setServices(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
    } finally {
      setLoadingServices(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSpecialties();
    fetchServices();
  }, [fetchServices, fetchSpecialties]);

  // Opciones para los selects
  const specialtySelectOptions: SelectOption<string>[] = [
    { value: '', label: 'Todos' },
    ...specialties.map(s => ({ value: s.id.toString(), label: s.name })),
    ...(user?.role === 'Admin'
      ? [{ value: 'manage_specialties', label: 'Añadir especialidad...' }]
      : [])
  ];

  const statusSelectOptions: SelectOption<string>[] = [
    { value: '', label: 'Todos' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
  ];

  // Lógica de filtrado de servicios
  const filteredServices = services.filter(service => {
    const isSpecialtyMatch = selectedSpecialty === '' || service.specialty.id.toString() === selectedSpecialty;
    const isStatusMatch = selectedStatus === 'Todos' || selectedStatus === '' || service.status === selectedStatus;
    return isSpecialtyMatch && isStatusMatch;
  });

  return (
      <div className="relative w-full min-h-screen px-30 max-md:px-8 max-sm:px-4 bg-[#F9FAFB]">
          <h1 className="mx-0 mb-8 pt-8 text-4xl font-semibold text-center max-sm:mx-0 max-sm:py-8 max-sm:text-3xl" style={{ fontFamily: 'Roboto Condensed, sans-serif', color: "#447F98", }}>
            Servicios
          </h1>
        {/* Nuevo diseño de filtros y botón */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-14 " style={{ fontFamily: 'Poppins, sans-serif'}}>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Select de especialidad */}
            <div className="w-full sm:w-50">
              <ServiceFormField
                placeholder="Selecciona una especialidad"
                label="Especialidad"
                options={specialtySelectOptions}
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
                whiteBg
              />
            </div>
            {/* Select de estado */}
            <div className="w-full sm:w-50">
              <ServiceFormField
                placeholder="Selecciona un estado"
                label="Estado"
                options={statusSelectOptions}
                value={selectedStatus}
                onChange={handleStatusChange}
                whiteBg
              />
            </div>
          </div>
          {/* Botón Nuevo Servicio */}
          {user?.role === 'Admin' ? (
            <button
              onClick={handleOpenNewModal}
              className="bg-[#447F98] hover:bg-[#629BB5] text-white text-sm py-2 px-4 rounded-md flex items-center"
            >
              <VscAdd className="h-5 w-5 mr-1" />
            <span>Nuevo Servicio</span>
          </button>
          ) : null}
        </div>

        {/* Grid de servicios */}
        <ServiceGrid
          services={filteredServices}
          loading={loadingServices}
          error={servicesError}
          onEditService={handleEditService}
          onDeleteService={handleDeleteService}
        />

        <div className="mb-50" />


      {/* Renderizado condicional del modal de nuevo servicio */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
          <NewService onClose={handleCloseNewModal} specialties={specialties} />
        </div>
      )}

      {/* Renderizado condicional del modal de edición */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
          <EditService onClose={handleCloseEditModal} serviceData={editingService} specialties={specialties} />
        </div>
      )}

      {/* Renderizado condicional del modal de eliminación */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
              <DeleteService 
                  onClose={handleCloseDeleteModal} 
                  onConfirm={confirmDelete} 
                  errorMessage={deletingErrorMessage ?? undefined} // ⬅️ Pasamos el mensaje de error aquí
              />
          </div>
      )}

      {/* Modal para administrar especialidades */}
      {showManageSpecialtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm" style={{ fontFamily: 'Poppins, sans-serif'}}>
          <div className="relative w-full max-w-sm mx-4 p-6 sm:p-8 rounded-xl shadow-2xl bg-neutral-100">
            <button
              className="absolute top-2 right-2 text-2xl text-neutral-500 hover:text-neutral-900"
              onClick={handleCloseManageSpecialtyModal}
            >
              <VscChromeClose className="mr-2 mt-2 text-xl sm:text-2xl text-neutral-600 hover:text-neutral-800 transition-colors duration-200" />
            </button>
            <h2 className="text-2xl font-medium mb-4 text-center text-[#447F98]" >
              Administrar Especialidades
            </h2>
            <div className="max-h-[25vh] overflow-y-auto pr-1">
              {loadingSpecialties ? (
                <p className="text-center text-neutral-600">Cargando especialidades...</p>
              ) : specialtiesError ? (
                <p className="text-center text-red-500">{specialtiesError}</p>
              ) : specialties.length > 0 ? (
                specialties.map((specialty) => (
                  <div key={specialty.id} className="flex justify-between items-center bg-white p-2 rounded-md mb-2">
                    <span className="text-neutral-600">{specialty.name}</span>
                    <button
                      type="button"
                      className="ml-4 text-red-500 hover:text-red-700 font-bold"
                      onClick={() => handleRemoveSpecialty(specialty.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-600">No hay especialidades añadidas.</p>
              )}
            </div>
            <div className="mt-4 flex gap-2 text-sm">
              <input
              type="text"
              className="flex-1 p-2 border border-[#447F98] rounded-md focus:outline-none focus:ring-1 focus:ring-[#447F98]"
              value={newSpecialtyValue}
              onChange={(e) => setNewSpecialtyValue(e.target.value)}
              placeholder="Añadir nueva especialidad"
              />
              <button
              type="button"
              className="px-4 py-2 rounded-lg shadow-lg bg-[#447F98] text-white font-bold hover:bg-[#629BB5] transition-colors"
              onClick={handleAddSpecialty}
              >
              Agregar
              </button>
            </div>
            {newSpecialtyError && (
              <p className="text-red-500 text-sm flex items-center justify-center mt-3 text-center w-full">
                {newSpecialtyError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
