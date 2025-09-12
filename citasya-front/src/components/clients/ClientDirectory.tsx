"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { VscAdd } from "react-icons/vsc";
import { NuevoCliente } from "./NewClient";
import { NewAppointment } from "../appointments/NewAppointment";
import ClientProfile from "./ClientProfile";
import { ServiceFormField } from "@/components/InputField";
import { UserIcon } from "lucide-react";
import { CalendarPlus } from "lucide-react";

interface Client {
  id: number;
  cedula: string;
  nombre: string;
  telefono: string;
}

export function ClientDirectory() {
  // Estados para la data de la API
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales y selección
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [appointmentClient, setAppointmentClient] = useState<Client | null>(null);

  // Estados para los inputs de búsqueda
  const [searchNameOrCedula, setSearchNameOrCedula] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta de la red: ${response.statusText}`);
      }
      const data = await response.json();
      interface BackendClient {
        id: number;
        documentId: string;
        name: string;
        phone: string;
      }
      const mappedClients = data.map((client: BackendClient) => ({
        id: client.id,
        cedula: client.documentId,
        nombre: client.name,
        telefono: client.phone,
      }));
      setClients(mappedClients);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError("Error al cargar los clientes: " + e.message);
        console.error("Error fetching clients:", e);
      } else {
        setError("Error al cargar los clientes: error desconocido");
        console.error("Error fetching clients:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const normalizePhone = (phone: string) => {
    if (!phone) return "";
    // Eliminar todo lo que no sea número
    let digits = phone.replace(/\D/g, "");

    // Si el número tiene 11 dígitos y empieza con 0 → convertir a 58XXXXXXXXXX
    if (digits.length === 11 && digits.startsWith("0")) {
      digits = "58" + digits.slice(1);
    }

    // Dejar números más cortos como están para que includes funcione
    return digits;
  };

  const normalizePhoneForSearch = (input: string) => {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");

    // Si empieza con 0 y tiene menos de 12 dígitos, asumir código nacional
    if (digits.startsWith("0")) {
      digits = "58" + digits.slice(1);
    }

    return digits;
  };



  const filteredClients = clients.filter((client) => {
    const searchNC = searchNameOrCedula.toLowerCase();
    const searchPh = normalizePhoneForSearch(searchPhone);

    const matchesNameOrCedula =
      client.nombre.toLowerCase().includes(searchNC) ||
      client.cedula.toLowerCase().includes(searchNC);

    const matchesPhone = normalizePhone(client.telefono).includes(searchPh);

    return matchesNameOrCedula && matchesPhone;
  });



  const handleOpenNewClientModal = () => setShowNewClientModal(true);

  const handleCloseNewClientModal = () => {
    setShowNewClientModal(false);
    fetchClients();
  };

  const handleOpenNewAppointmentModal = (client?: Client) => {
    if (client) {
      setAppointmentClient(client);
    }
    setShowNewAppointmentModal(true);
  };
  const handleCloseNewAppointmentModal = () => setShowNewAppointmentModal(false);

  const handleCloseProfile = () => {
    setSelectedClient(null);
    fetchClients();
  };

  const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;

  const area = phone.slice(2, 5);       // "414"
  const number = phone.slice(5);        // "3252123"

  return `0${area}-${number}`;          // "0414-3252123"
};


  return (
    <div className="relative flex w-full h-screen" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <main
        className={`transition-all duration-500 transform ${
          selectedClient ? "translate-x-0 w-[68%] mr-auto" : "mx-auto w-[70%]"
        }`}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center items-center p-5">
            <div className="w-full md:w-1/2 mt-0">
              <ServiceFormField
                label=""
                placeholder="Nombre o Cédula"
                value={searchNameOrCedula}
                onChange={(e) => setSearchNameOrCedula(typeof e.target.value === "string" ? e.target.value : e.target.value[0] || "")}
                type="text"
                whiteBg
                className="rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2">
              <ServiceFormField
                label=""
                placeholder="Teléfono"
                value={searchPhone}
                onChange={(e) => setSearchPhone(typeof e.target.value === "string" ? e.target.value : e.target.value[0] || "")}
                type="text"
                whiteBg
                className="rounded-lg"
              />
            </div>
            <div>
              <button
                onClick={handleOpenNewClientModal}
                className="bg-[#447F98] hover:bg-[#629BB5] p-3 mt-2 text-xs text-white rounded-md flex items-center whitespace-nowrap"
              >
              <VscAdd className="h-5 w-5 mr-1" />
              <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>

          {/* Estado de carga y error */}
          {loading && <div className="p-5 text-center">Cargando clientes...</div>}
          {error && <div className="p-5 text-center text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 p-5 rounded-lg">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 rounded-lg ">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">
                          {client.cedula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-600">
                          {client.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">
                          {formatPhone(client.telefono)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">
                          <div className="flex space-x-2">
                            <button
                              className="text-[#447F98] hover:text-[#629BB5] bg-[#D6EBF3] p-1.5 rounded-md flex items-center gap-1"
                              onClick={() => {
                              if (selectedClient?.id === client.id) {
                                setSelectedClient(null);
                              } else {
                                setSelectedClient(client);
                              }
                              }}
                            >
                              <UserIcon className="h-4 w-4" />
                              <span>Ver Perfil</span>
                            </button>
                            <button
                              className="text-[#447F98] hover:text-[#629BB5] bg-[#D6EBF3] p-1.5 rounded-md flex items-center gap-1"
                              onClick={() => handleOpenNewAppointmentModal(client)}
                            >
                              <CalendarPlus className="h-4 w-4" />
                              <span>Agendar Cita</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-5 text-center text-neutral-600">
                        No hay clientes que coincidan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <aside
        className={`absolute right-0 top-0 h-full overflow-y-auto transition-transform duration-500 w-[32%] ${
          selectedClient ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="ml-8">
          {selectedClient && (
            <ClientProfile
              clientId={selectedClient.id}
              onCloseProfile={handleCloseProfile}
            />
          )}
        </div>
      </aside>

      {/* Modales */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
          <NuevoCliente onClose={handleCloseNewClientModal} />
        </div>
      )}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
          <NewAppointment
            onClose={handleCloseNewAppointmentModal}
            initialDocumentId={appointmentClient?.cedula || ""}
          />
        </div>
      )}
    </div>
  );
}