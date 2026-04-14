"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "@/components/common/Dropdown";
import Input from "@/components/common/Input";
import { Modal } from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useClientStore } from "@/store/clientStore";
import { useServiceStore } from "@/store/serviceStore";
import { useWorkerStore } from "@/store/workerStore";
import { Client } from "@/interfaces/client";
import { Service } from "@/interfaces/service";
import { Worker } from "@/interfaces/workers";

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

const normalizeHourValue = (value: string): string => {
  // HTML time input should already provide HH:mm, but we normalize defensively.
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return normalized;

  const hour = Number(match[1]);
  const minute = match[2];

  if (Number.isNaN(hour) || hour < 0 || hour > 23) return normalized;

  return `${String(hour).padStart(2, "0")}:${minute}`;
};

const DateForm: React.FC<DateFormProps> = ({ isOpen, onClose, onCreated }) => {
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const { clients, fetchClients } = useClientStore();
  const { services, fetchServices } = useServiceStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const { createAppointment } = useAppointmentStore();

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<DateFormValues>({
    defaultValues: initialValues,
  });

  const typedClients = clients as Client[];
  const typedServices = services as Service[];
  const typedWorkers = workers as Worker[];

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
    queryKey: ["date-form-workers"],
    enabled: isOpen,
    queryFn: async () => {
      await fetchWorkers({ page: 1, limit: 100 });
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
    () => typedWorkers.map((worker) => worker.name),
    [typedWorkers],
  );

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
      clearErrors();
    }
  }, [isOpen, reset, clearErrors]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (values: DateFormValues) => {
      const selectedClient = typedClients.find(
        (client) => client.name === values.client,
      );
      const selectedService = typedServices.find(
        (service) => service.name === values.service,
      );
      const selectedWorker = typedWorkers.find(
        (worker) => worker.name === values.worker,
      );

      if (!selectedClient || !selectedService || !selectedWorker) {
        throw new Error("No se pudieron resolver los datos de la cita");
      }

      const durationMinutes = selectedService.minutes_duration || 60;
      const hourValue = normalizeHourValue(values.time);
      const [hourPart, minutePart] = hourValue.split(":").map(Number);
      const endDateTime = new Date(`${values.date}T00:00:00`);
      endDateTime.setHours(hourPart, minutePart + durationMinutes, 0, 0);
      const endDate = endDateTime.toISOString().slice(0, 10);

      await createAppointment({
        date: values.date,
        end_date: endDate,
        hour: hourValue,
        status: "Pendiente",
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
      setToast({
        open: true,
        type: "success",
        message: "Cita agendada correctamente.",
      });
      onCreated?.(createdSummary);
      reset(initialValues);
      onClose();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo agendar la cita. Intentalo de nuevo.";

      setError("root", {
        type: "server",
        message,
      });

      setToast({
        open: true,
        type: "error",
        message,
      });
    },
  });

  const submitHandler = (data: DateFormValues) => {
    clearErrors("root");
    createAppointmentMutation.mutate(data);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nueva Cita"
        onSubmit={handleSubmit(submitHandler)}
        submitLabel={createAppointmentMutation.isPending ? "Agendando..." : "Agendar Cita"}
        noValidate
        isSubmitting={createAppointmentMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Controller
              name="client"
              control={control}
              rules={{ required: "El cliente es requerido" }}
              render={({ field }) => (
                <Dropdown
                  name={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={clientOptions}
                  placeholder="Seleccionar cliente..."
                  error={!!errors.client}
                  errorMessage={errors.client?.message}
                  label="Cliente"
                  required
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="service"
              control={control}
              rules={{ required: "El servicio es requerido" }}
              render={({ field }) => (
                <Dropdown
                  name={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={serviceOptions}
                  placeholder="Seleccionar servicio..."
                  error={!!errors.service}
                  errorMessage={errors.service?.message}
                  label="Servicio"
                  required
                />
              )}
            />
          </div>
          <div>
            <Controller
              name="worker"
              control={control}
              rules={{ required: "El trabajador es requerido" }}
              render={({ field }) => (
                <Dropdown
                  name={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={workerOptions}
                  placeholder="Seleccionar trabajador..."
                  error={!!errors.worker}
                  errorMessage={errors.worker?.message}
                  label="Trabajador"
                  required
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha"
                variant="date"
                error={errors.date?.message}
                {...register("date", { required: "La fecha es requerida" })}
              />
            </div>
            <div>
              <Input
                label="Hora"
                variant="time"
                error={errors.time?.message}
                {...register("time", { required: "La hora es requerida" })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              rows={3}
              placeholder="Instrucciones especiales..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
              {...register("notes")}
            />
          </div>

          {(createAppointmentMutation.isError || errors.root?.message) && (
            <p className="text-sm text-rose-600">
              {errors.root?.message || "No se pudo agendar la cita. Intentalo de nuevo."}
            </p>
          )}

      
        </div>
      </Modal>

      <Toast
        isOpen={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default DateForm;
