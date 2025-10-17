"use client";
import { useState, useEffect } from "react";
import { DeleteWorker } from "./DeleteWorker";
import { EditWorker } from "./EditWorker";
import { VscClose, VscEdit } from "react-icons/vsc";
import AvailabilitySelector from "./ScheduleWorker";
import { Specialist, Availability } from "../../types/worker";
import { toast } from "react-hot-toast";

interface SpecialistProfileProps {
  specialist: Specialist | null;
  onWorkerUpdated: () => void;
  allServices: { id: number; name: string }[];
  onClose?: () => void;
}

export function SpecialistProfile({
  specialist,
  onWorkerUpdated,
  allServices,
  onClose,
}: SpecialistProfileProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!specialist) {
    return (
      <section className="flex items-center justify-center h-full bg-white rounded-lg p-10 text-center text-neutral-500 text-base">
        Selecciona un especialista para ver su perfil
      </section>
    );
  }
  const serviceNames = specialist.services.map((s) => s.name).join(", ");
  const handleDeleteWorker = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers/${specialist.id}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "No se pudo eliminar el especialista.");
    }
    toast.success("Especialista eliminado correctamente");
    onWorkerUpdated();
    setShowDeleteModal(false);
  };

  const handleSaveAvailability = async (newAvailability: Availability) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers/${specialist.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: newAvailability }),
        }
      );
      if (!res.ok) throw new Error("Error al actualizar disponibilidad");
      onWorkerUpdated();
      setShowAvailabilityModal(false);
      toast.success("Disponibilidad actualizada");
    } catch {
      toast.error("No se pudo actualizar la disponibilidad");
    }
  };

  const dayOrder: (keyof Availability["days"])[] = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const dayLabels: Record<string, string> = {
    Mon: "Lun",
    Tue: "Mar",
    Wed: "Mié",
    Thu: "Jue",
    Fri: "Vie",
    Sat: "Sab",
    Sun: "Dom",
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;
    const area = phone.slice(2, 5);
    const number = phone.slice(5);
    return `0${area}-${number}`;
  };

  return (
    <section
      className={`w-full h-full bg-white rounded-lg shadow-sm border border-neutral-200 ${
        isMobile ? "overflow-y-auto max-h-[90vh]" : ""
      }`}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex justify-between items-center bg-[#D6EBF3] px-6 py-4 rounded-t-lg border-b border-[#447F98] shadow-sm sticky top-0 z-10">
        <h2 className="text-base font-medium text-[#447F98]">
          Perfil del Especialista
        </h2>
        <div className="flex items-center gap-2">
          <VscEdit
            onClick={() => setShowEditModal(true)}
            size={20}
            className="text-[#447F98] cursor-pointer hover:text-[#629BB5] transition-colors"
          />
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="ml-3 text-[#447F98] hover:text-[#2d5d6e] transition-colors"
              aria-label="Cerrar"
            >
              <VscClose size={22} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 space-y-5 text-sm text-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-neutral-500 mb-1">
              Nombre del especialista
            </p>
            <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
              {specialist.name}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Teléfono</p>
            <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
              {formatPhone(specialist.phone)}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Cédula</p>
            <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
              {specialist.documentId}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Correo electrónico</p>
            <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
              {specialist.email}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-500 mb-1">Especialidades</p>
          <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
            {specialist.specialties.length > 0
              ? specialist.specialties.join(", ")
              : "No hay especialidades asignadas"}
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-500 mb-1">Servicios asignados</p>
          <div className="bg-neutral-100 px-4 py-2 rounded border border-gray-200">
            {serviceNames || "No hay servicios asignados"}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-neutral-600">
              Disponibilidad
            </h3>
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="px-4 py-1.5 text-xs bg-[#B9D8E1] text-[#447F98] rounded-md hover:bg-[#A5C9D4]"
            >
              Editar
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-xs text-neutral-600">
              <thead className="bg-neutral-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-center">Día</th>
                  <th className="px-3 py-2 text-center">Horario</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
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
                        <td className="px-3 py-2 text-center">
                          {dayLabels[day]}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {data?.startTime} - {data?.endTime}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

        {specialist.schedule && specialist.schedule.breakTime !== "none" ? (
          <div className="mt-3 text-xs text-neutral-500 text-center">
            Descanso: {specialist.schedule.breakTime}
          </div>
        ) : (
          <div className="mt-3 text-xs text-neutral-500 text-center">
            Sin descanso
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2 text-xs font-medium rounded-md bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FFC1C1] transition"
          >
            Eliminar especialista
          </button>
        </div>
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
          initialAvailability={ specialist.schedule ?? 
            { days: 
              { Mon: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Tue: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Wed: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Thu: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Fri: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Sat: { enabled: false, startTime: "09:00", endTime: "17:00" }, 
              Sun: { enabled: false, startTime: "09:00", endTime: "17:00" }, }, 
              breakTime: "none", } }
          onSave={handleSaveAvailability}
          onClose={() => setShowAvailabilityModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteWorker
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteWorker}
        />
      )}
    </section>
  );
}
