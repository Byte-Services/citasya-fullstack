'use client';
import React from 'react';
import { CiClock1 } from 'react-icons/ci';
import { MdOutlineCurrencyExchange } from 'react-icons/md';
import { TbCategory } from 'react-icons/tb';
import { VscChromeClose, VscEdit, VscPulse } from 'react-icons/vsc';
import { ServiceData } from '../../types/service';
import { useUser } from '@/context/UserContext';

interface ServiceGridProps {
  services: ServiceData[];
  loading: boolean;
  error: string | null;
  onEditService: (serviceData: ServiceData) => void;
  onDeleteService: (serviceId: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  loading,
  error,
  onEditService,
  onDeleteService,
}) => {
  const { user } = useUser();

  if (loading) {
    return <div className="text-center text-neutral-600">Cargando servicios...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!services || services.length === 0) {
    return <div className="text-center text-neutral-600">No hay servicios disponibles.</div>;
  }

  return (
    <div className="flex flex-col items-center " style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md p-8 relative"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-[#447F98] font-medium text-xl">{service.name}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <TbCategory className="mr-2" />
                  <span>{service.specialty.name}</span>
                </div>
              </div>
              {user?.role === 'Admin' ? (
              <div className="flex space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => onEditService(service)}
                  title="Editar"
                >
                  <VscEdit className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => onDeleteService(service.id)}
                  title="Eliminar"
                >
                  <VscChromeClose className="h-5 w-5" />
                </button>
              </div>
              ) : null}
            </div>
            <div className="text-sm text-gray-600 mb-5">
              <p className="mt-1">{service.description}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <CiClock1 className="h-4 w-4 mr-2" />
                <span>Duración: {service.minutes_duration} min</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MdOutlineCurrencyExchange className="h-4 w-4 mr-2 text-light" />
                <span>Precio: ${service.price}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="flex items-center">
                  <VscPulse className="h-4 w-4 mr-2"/>
                  Estado:
                  <span
                    className={
                      service.status === 'Activo'
                        ? 'text-green-500 ml-1 font-semibold'
                        : 'text-red-500 ml-1 font-semibold'
                    }
                  >
                    {service.status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
