import { useState } from "react";
import { DeleteSpecialist } from "./DeleteWorker";
import { EditWorker } from "./EditWorker";
import { VscEdit } from "react-icons/vsc";
import AvailabilitySelector from "./ScheduleWorker"; // Renombrado para claridad
import {Specialist, Availability } from '../../types/worker';

interface SpecialistProfileProps {
  specialist: Specialist | null;
  onWorkerUpdated: () => void;
  allServices: { id: number; name: string }[];
}

export function SpecialistProfile({ specialist, onWorkerUpdated, allServices }: SpecialistProfileProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  if (!specialist) {
    return (
      <section className="ml-5 w-full max-md:ml-0 max-md:w-full flex items-start justify-center h-full bg-white rounded-lg p-10 max-md:p-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <p className="pt-10 text-neutral-500 text-base">
          Selecciona un especialista para ver su perfil
        </p>
      </section>
    );
  }

  const serviceNames = specialist.services.map(s => s.name).join(", ");
  const handleDeleteWorker = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers/${specialist.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar especialista");
      }

      onWorkerUpdated();
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el especialista");
    }
  };

  const handleSaveAvailability = async (newAvailability: Availability) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers/${specialist.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ schedule: newAvailability }),
    });

    if (!res.ok) throw new Error("Error al actualizar disponibilidad");

    onWorkerUpdated(); // vuelve a cargar especialistas
    setShowAvailabilityModal(false);
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar la disponibilidad");
  }
};

  const dayOrder: (keyof Availability["days"])[] = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  ];

  // Traducción de días para mostrar en la tabla
  const dayLabels: Record<string, string> = {
    Mon: "Lun",
    Tue: "Mar",
    Wed: "Mié",
    Thu: "Jue",
    Fri: "Vie",
    Sat: "Sab",
    Sun: "Dom",
  };

  return (
    <section className="ml-5 w-full h-full">
      <div className="mx-auto w-full rounded-lg bg-white pb-8 max-md:px-5 max-md:mt-7 max-md:max-w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-md:max-w-full">
          <div className="flex justify-between bg-[#D6EBF3] px-8 pt-6 pb-6 rounded-t-lg border-b border-[#447F98] shadow-sm">
            <h2 className="text-base font-medium tracking-wide leading-none text-[#447F98]">
              Perfil y Disponibilidad
            </h2>
          </div>
          <div className="flex justify-between px-8 gap-10 mt-4 text-xl font-semibold">
            <h3 className="text-sm font-medium text-neutral-600">
              Datos del especialista
            </h3>
            <VscEdit onClick={() => setShowEditModal(true)} size={18} className="text-[#447F98] cursor-pointer hover:text-[#629BB5] transition-colors" />
          </div>
          <div className="flex gap-5 px-8 max-md:flex-col max-md:px-0">
            {/* Columna izquierda: Nombre y Teléfono */}
            <div className="mt-6 w-full flex flex-col gap-4">
              <div>
                <div className="text-xs text-neutral-600">Nombre del especialista:</div>
                <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
                  <div>{specialist.name}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-600">Teléfono:</div>
                <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
                  <div>{specialist.phone}</div>
                </div>
              </div>
            </div>
            {/* Columna derecha: Cédula y Email */}
            <div className="mt-4 w-full flex flex-col gap-4">
              <div>
                <div className="text-xs text-neutral-600">Cédula:</div>
                <div className="flex flex-col px-5 py-3 mt-2 w-full text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
                  <div>{specialist.documentId}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-600">Email:</div>
                <div className="flex flex-col px-5 py-3 mt-2 w-full text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
                  <div>{specialist.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 px-8 mt-4 max-md:max-w-full">
          <div className="w-full max-md:w-full">
            <div className="text-xs text-neutral-600">Especialidades:</div>
            <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
              <div>{specialist.specialties.length > 0 ? specialist.specialties.join(", ") : "No hay especialidades asignadas"}</div>
            </div>
          </div>
          <div className="w-full max-md:w-full">
            <div className="text-xs text-neutral-600">Servicios asignados:</div>
            <div className="flex flex-col px-5 py-3 mt-2 text-xs bg-neutral-100 rounded-sm text-neutral-600 border border-gray-200">
              <div>{serviceNames || "No hay servicios asignados"}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="mt-8 px-8 text-sm font-medium text-neutral-600 max-md:mt-10">
            Disponibilidad
          </h3>
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="mt-8 mr-8 px-4 py-2 text-xs bg-[#B9D8E1] text-[#447F98] rounded-md hover:bg-[#A5C9D4]"
          >
            Editar disponibilidad
          </button>
        </div>
        <div className="px-8 mt-6">
          {/* Tabla resumen */}
          <div className="flex justify-center">
            <div className="w-1/2 rounded-lg border border-gray-200">
              <table className="w-full text-xs text-neutral-600">
                <thead className="bg-neutral-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-center text-neutral-600">Día</th>
                    <th className="px-3 py-2 text-center text-neutral-600">Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {!specialist.schedule ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-neutral-400"
                      >
                        No hay horario configurado
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const enabledDays = dayOrder.filter(
                        (day) => specialist.schedule?.days[day]?.enabled
                      );

                      if (enabledDays.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-3 py-4 text-center text-neutral-400"
                            >
                              No se han configurado los días de disponibilidad
                            </td>
                          </tr>
                        );
                      }

                      return enabledDays.map((day) => {
                        const data = specialist.schedule?.days[day];
                        return (
                          <tr key={day} className="border-t border-gray-200">
                            <td className="px-3 py-2 text-center text-neutral-600">
                              {dayLabels[day] || day}
                            </td>
                            <td className="px-3 py-2 text-center text-neutral-600">
                              {data?.startTime} - {data?.endTime}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
                </table>
              </div>
              </div>

              {/* Descanso */}
              {specialist.schedule && specialist.schedule.breakTime !== "none" && (
              <div className="mt-3 text-xs text-neutral-500 text-center">
                Descanso: {specialist.schedule.breakTime}
              </div>
              )}

        </div>
        <div className="flex justify-center">
          <button onClick={() => setShowDeleteModal(true)} className="flex justify-center items-center self-center px-10 py-3 mt-6 text-sm font-medium text-center rounded-lg bg-[#FEE2E2] text-[#B91C1C] shadow-md w-full max-w-[141px] hover:bg-[#FFC1C1] transition-colors">
            <span>Eliminar Especialista</span>
          </button>
        </div>
      </div>
      {showEditModal && specialist && (
        <EditWorker
          onClose={() => setShowEditModal(false)}
          specialistData={{
            id: String(specialist.id),
            name: specialist.name,
            phone: specialist.phone,
            services: specialist.services,
            cedula: specialist.documentId,
            email: specialist.email,
          }}
          allServices={allServices}
          onSaveSuccess={onWorkerUpdated}
        />
      )}
      {showAvailabilityModal && specialist && (
        <AvailabilitySelector
          initialAvailability={
            specialist.schedule ?? {
              days: {
                Mon: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Tue: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Wed: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Thu: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Fri: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Sat: { enabled: false, startTime: "09:00", endTime: "17:00" },
                Sun: { enabled: false, startTime: "09:00", endTime: "17:00" },
              },
              breakTime: "none",
            }
          }
          onSave={handleSaveAvailability}
          onClose={() => setShowAvailabilityModal(false)}
        />
      )}
      {showDeleteModal && (
        <DeleteSpecialist
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteWorker}
        />
      )}
    </section>
  );
}