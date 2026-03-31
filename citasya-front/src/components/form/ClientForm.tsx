

import React from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/common/Input";

type ClientFormValues = {
  name: string;
  documentId: string;
  phone: string;
  email: string;
  notes?: string;
  id?: number;
};

type ClientFormProps = {
  initialValues: Partial<ClientFormValues>;
  centerId: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
};

const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  centerId,
  isOpen,
  onClose,
  title,
  submitLabel,
}) => {


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    reset(initialValues);
  }, [initialValues, isOpen, reset]);

  const onSubmit = (data: ClientFormValues) => {
    // Añadir center_id al payload
    const payload = { ...data, center_id: centerId };
    // Aquí puedes manejar la lógica de guardado local o llamada a API
    // Por ejemplo, agregar a clients local o mostrar un mensaje
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={submitLabel}
    >
      <div className="space-y-4">
        <div>
          <Input
            label="Nombre Completo"
            {...register("name", { required: "El nombre es obligatorio" })}
            placeholder="Ej. Ana Martínez"
            required
            className={errors.name ? "border-rose-500" : "border-gray-200"}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Input
            label="Documento de Identidad"
            {...register("documentId", { required: "El documento es obligatorio" })}
            placeholder="Ej. 12345678A"
            required
            className={errors.documentId ? "border-rose-500" : "border-gray-200"}
          />
          {errors.documentId && (
            <p className="text-xs text-rose-600 mt-1">{errors.documentId.message}</p>
          )}
        </div>
        <div>
          <Input
            label="Teléfono"
            {...register("phone", { required: "El teléfono es obligatorio" })}
            placeholder="+34 600 000 000"
            required
            className={errors.phone ? "border-rose-500" : "border-gray-200"}
          />
          {errors.phone && (
            <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <Input
            label="Correo electrónico"
            {...register("email", { required: "El correo es obligatorio" })}
            placeholder="ejemplo@email.com"
            required
            className={errors.email ? "border-rose-500" : "border-gray-200"}
          />
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            {...register("notes")}
            placeholder="Alergias, preferencias, etc."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ClientForm;
