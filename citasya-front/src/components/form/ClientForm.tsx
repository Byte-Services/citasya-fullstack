

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/common/Input";
import { useClientStore } from "@/store/clientStore";
import { Client, CreateClientRequest, UpdateClientRequest } from "@/interfaces/client";
import {
  formatPhoneWithCodeDash,
  hasAtSymbol,
  sanitizeNumericValue,
  validatePhoneDigits,
} from "@/utils/formValidation";

type ClientFormValues = {
  name: string;
  documentId: string;
  phone: string;
  email: string;
  notes?: string;
  id?: number;
};

type FormNotification = {
  type: "success" | "error";
  message: string;
};

type ClientFormProps = {
  initialValues: Partial<ClientFormValues>;
  centerId: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSuccess?: (values: ClientFormValues) => void | Promise<void>;
  onNotify?: (notification: FormNotification) => void;
};

const EMPTY_CLIENT_FORM: ClientFormValues = {
  name: "",
  documentId: "",
  phone: "",
  email: "",
  notes: "",
};

const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  centerId,
  isOpen,
  onClose,
  title,
  submitLabel,
  onSuccess,
  onNotify,
}) => {
  const { clients, createClient, updateClient } = useClientStore();


  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<ClientFormValues>({
    defaultValues: {
      ...EMPTY_CLIENT_FORM,
      ...initialValues,
    },
  });

  React.useEffect(() => {
    clearErrors();
    reset({
      ...EMPTY_CLIENT_FORM,
      ...initialValues,
    });
  }, [initialValues, isOpen, reset, clearErrors]);

  const saveClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const payload: CreateClientRequest | UpdateClientRequest = {
        name: data.name.trim(),
        documentId: data.documentId.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        notes: data.notes?.trim() || "",
        center_id: centerId,
      };

      if (data.id) {
        await updateClient(data.id, payload as UpdateClientRequest);
      } else {
        await createClient(payload as CreateClientRequest);
      }
    },
    onSuccess: async (_, variables) => {
      try {
        await Promise.resolve(onSuccess?.(variables));
      } catch {
        // The record was saved successfully; avoid surfacing refresh errors as save failures.
      }

      reset(EMPTY_CLIENT_FORM);
      onNotify?.({
        type: "success",
        message: variables.id
          ? "Cliente actualizado correctamente."
          : "Cliente registrado correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar la informacion del cliente.";

      setError("root", {
        type: "server",
        message,
      });

      onNotify?.({
        type: "error",
        message,
      });
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    if (saveClientMutation.isPending) return;

    const normalizedDocId = sanitizeNumericValue(data.documentId.trim());
    const typedClients = clients as Client[];
    const duplicatedClient = typedClients.find((client) => {
      const clientDoc = sanitizeNumericValue((client.documentId || "").trim());
      const sameDocument = clientDoc === normalizedDocId;
      const sameRecord = Boolean(data.id) && client.id === data.id;
      return sameDocument && !sameRecord;
    });

    if (duplicatedClient) {
      setError("documentId", {
        type: "manual",
        message: "Ya existe un cliente con ese documento",
      });
      onNotify?.({
        type: "error",
        message: "Ya existe un cliente con ese documento.",
      });
      return;
    }

    clearErrors("root");
    saveClientMutation.reset();
    saveClientMutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={saveClientMutation.isPending ? "Guardando..." : submitLabel}
      noValidate
      isSubmitting={saveClientMutation.isPending}
    >
      <div className="space-y-4">
        <div>
          <Input
            label="Nombre Completo"
            {...register("name", {
              required: "El nombre es obligatorio",
              validate: (value) => value.trim().length > 0 || "El nombre es obligatorio",
            })}
            placeholder="Ej. Ana Martínez"
            className={errors.name ? "border-rose-500" : "border-gray-200"}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Input
            label="Documento de Identidad"
            {...register("documentId", {
              required: "El documento es obligatorio",
              validate: (value) => value.trim().length > 0 || "El documento es obligatorio",
              onChange: (e) => {
                e.target.value = sanitizeNumericValue(e.target.value);
              },
            })}
            placeholder="Ej. 12345678A"
            inputMode="numeric"
            className={errors.documentId ? "border-rose-500" : "border-gray-200"}
          />
          {errors.documentId && (
            <p className="text-xs text-rose-600 mt-1">{errors.documentId.message}</p>
          )}
        </div>
        <div>
          <Input
            variant="tel"
            label="Teléfono"
            {...register("phone", {
              required: "El telefono es obligatorio",
              validate: (value) => {
                if (value.trim().length === 0) return "El telefono es obligatorio";
                return validatePhoneDigits(value);
              },
              onChange: (e) => {
                e.target.value = formatPhoneWithCodeDash(e.target.value);
              },
            })}
            inputMode="numeric"
            placeholder="0412-1234567"
            className={errors.phone ? "border-rose-500" : "border-gray-200"}
          />
          {errors.phone && (
            <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <Input
            variant="email"
            label="Correo electrónico"
            {...register("email", {
              required: "El correo es obligatorio",
              validate: (value) => {
                const email = value.trim();
                if (!email) return "El correo es obligatorio";
                return hasAtSymbol(email) || "Correo invalido";
              },
            })}
            placeholder="ejemplo@email.com"
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
        {(saveClientMutation.isError || errors.root?.message) && (
          <p className="text-xs text-rose-600 mt-1">
            {errors.root?.message || "No se pudo guardar el cliente. Intentalo de nuevo."}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ClientForm;
