"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Dropdown from "@/components/common/Dropdown";
import Input from "@/components/common/Input";
import { Modal } from "@/components/ui/Modal";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useClientStore } from "@/store/clientStore";
import { useServiceStore } from "@/store/serviceStore";
import { useUserStore } from "@/store/userStore";
import { Client } from "@/interfaces/client";
import { Service } from "@/interfaces/service";
import { User } from "@/interfaces/userEntity";

type DateFormValues = {
  client: string;
  service: string;
  worker: string;
  date: string;
  time: string;
  notes: string;
};

export interface CreatedAppointmentSummary {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
}

interface DateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (appointment: CreatedAppointmentSummary) => void;
}

const initialValues: DateFormValues = {
  client: "",
  service: "",
  worker: "",
  date: "",
  time: "10:00",
  notes: "",
};

const DateForm: React.FC<DateFormProps> = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState<DateFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { clients, fetchClients } = useClientStore();
  const { services, fetchServices } = useServiceStore();
  const { users, fetchUsers } = useUserStore();
  const { createAppointment } = useAppointmentStore();

  const typedClients = clients as Client[];
  const typedServices = services as Service[];
  const typedUsers = users as User[];

  useQuery({
    queryKey: ["date-form-clients"],
    enabled: isOpen,
    queryFn: async () => {
      await fetchClients({ page: 1, limit: 100 });
      return true;
    },
  });

  useQuery({
    queryKey: ["date-form-services"],
    enabled: isOpen,
    queryFn: async () => {
      await fetchServices({ page: 1, limit: 100 });
      return true;
    },
  });

  useQuery({
    queryKey: ["date-form-users"],
    enabled: isOpen,
    queryFn: async () => {
      await fetchUsers({ page: 1, limit: 100 });
      return true;
    },
  });

  const clientOptions = useMemo(
    () => typedClients.map((client) => client.name),
    [typedClients],
  );
  const serviceOptions = useMemo(
    () => typedServices.map((service) => service.name),
    [typedServices],
  );
  const workerOptions = useMemo(
    () => typedUsers.map((user) => user.name),
    [typedUsers],
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues);
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const createAppointmentMutation = useMutation({
    mutationFn: async (values: DateFormValues) => {
      const selectedClient = typedClients.find(
        (client) => client.name === values.client,
      );
      const selectedService = typedServices.find(
        (service) => service.name === values.service,
      );
      const selectedWorker = typedUsers.find(
        (user) => user.name === values.worker,
      );

      if (!selectedClient || !selectedService || !selectedWorker) {
        throw new Error("No se pudieron resolver los datos de la cita");
      }

      const durationMinutes = selectedService.minutes_duration || 60;
      const [hourPart, minutePart] = values.time.split(":").map(Number);
      const endDateTime = new Date(`${values.date}T00:00:00`);
      endDateTime.setHours(hourPart, minutePart + durationMinutes, 0, 0);

      await createAppointment({
        date: values.date,
        end_date: endDateTime.toISOString(),
        hour: values.time,
        status: "scheduled",
        service_id: selectedService.id,
        client_id: selectedClient.id,
        worker_id: selectedWorker.id,
      });

      return {
        clientName: selectedClient.name,
        serviceName: selectedService.name,
        date: values.date,
        time: values.time,
        durationMinutes,
      } as CreatedAppointmentSummary;
    },
    onSuccess: (createdSummary) => {
      onCreated?.(createdSummary);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.client) newErrors.client = "Requerido";
    if (!formData.service) newErrors.service = "Requerido";
    if (!formData.worker) newErrors.worker = "Requerido";
    if (!formData.date) newErrors.date = "Requerido";
    if (!formData.time) newErrors.time = "Requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createAppointmentMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Cita"
      onSubmit={handleSubmit}
      submitLabel={createAppointmentMutation.isPending ? "Agendando..." : "Agendar Cita"}
    >
      <div className="space-y-4">
        <div>
          <Dropdown
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            options={clientOptions}
            placeholder="Seleccionar cliente..."
            error={!!errors.client}
            label="Cliente"
            required
          />
        </div>
        <div>
          <Dropdown
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            options={serviceOptions}
            placeholder="Seleccionar servicio..."
            error={!!errors.service}
            label="Servicio"
            required
          />
        </div>
        <div>
          <Dropdown
            name="worker"
            value={formData.worker}
            onChange={handleInputChange}
            options={workerOptions}
            placeholder="Seleccionar especialista..."
            error={!!errors.worker}
            label="Especialista"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Fecha"
              variant="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`${errors.date ? "border-rose-500" : "border-gray-200"}`}
            />
          </div>
          <div>
            <Input
              label="Hora"
              variant="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`${errors.time ? "border-rose-500" : "border-gray-200"}`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Instrucciones especiales..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
          />
        </div>

        {createAppointmentMutation.isError && (
          <p className="text-sm text-rose-600">
            No se pudo agendar la cita. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default DateForm;
