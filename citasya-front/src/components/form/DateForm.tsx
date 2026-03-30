import React from "react";
import Dropdown from "@/components/common/Dropdown";
import Input from "@/components/common/Input";

interface DateFormProps {
  initialValues: {
    client: string;
    service: string;
    worker: string;
    date: string;
    time: string;
    notes: string;
  };
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  mockClients: string[];
  mockServices: string[];
  mockWorkers: string[];
}

const DateForm: React.FC<DateFormProps> = ({
  initialValues,
  errors,
  onChange,
  mockClients,
  mockServices,
  mockWorkers,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Dropdown
          name="client"
          value={initialValues.client}
          onChange={onChange}
          options={mockClients}
          placeholder="Seleccionar cliente..."
          error={!!errors.client}
          label="Cliente"
          required
        />
      </div>
      <div>
        <Dropdown
          name="service"
          value={initialValues.service}
          onChange={onChange}
          options={mockServices}
          placeholder="Seleccionar servicio..."
          error={!!errors.service}
          label="Servicio"
          required
        />
      </div>
      <div>
        <Dropdown
          name="worker"
          value={initialValues.worker}
          onChange={onChange}
          options={mockWorkers}
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
            value={initialValues.date}
            onChange={onChange}
            className={`${errors.date ? "border-rose-500" : "border-gray-200"}`}
          />
        </div>
        <div>
          <Input
            label="Hora"
            variant="time"
            name="time"
            value={initialValues.time}
            onChange={onChange}
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
          value={initialValues.notes}
          onChange={onChange}
          rows={3}
          placeholder="Instrucciones especiales..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
        />
      </div>
    </div>
  );
};

export default DateForm;
