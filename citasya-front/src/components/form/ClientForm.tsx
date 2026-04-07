

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/common/Input";
import { useClientStore } from "@/store/clientStore";
import { CreateClientRequest, UpdateClientRequest } from "@/interfaces/client";

type ClientFormValues = {
  name: string;
  documentId: string;
  phone: string;
  email?: string;
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
  onSuccess?: (values: ClientFormValues) => void;
};

const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  centerId,
  isOpen,
  onClose,
  title,
  submitLabel,
  onSuccess,
}) => {
  const { createClient, updateClient } = useClientStore();


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

  const saveClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const payload: CreateClientRequest | UpdateClientRequest = {
        name: data.name,
        documentId: data.documentId,
        phone: data.phone,
        notes: data.notes || "",
        center_id: centerId,
      };

      if (data.id) {
        await updateClient(data.id, payload as UpdateClientRequest);
      } else {
        await createClient(payload as CreateClientRequest);
      }
    },
    onSuccess: (_, variables) => {
      onSuccess?.(variables);
      onClose();
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    saveClientMutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={saveClientMutation.isPending ? "Guardando..." : submitLabel}
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
        {saveClientMutation.isError && (
          <p className="text-xs text-rose-600 mt-1">
            No se pudo guardar el cliente. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ClientForm;
