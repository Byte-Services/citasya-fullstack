"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { VscAdd } from "react-icons/vsc";
import { NuevoCliente } from "./NewClient";
import { NewAppointment } from "../appointments/NewAppointment";
import ClientProfile from "./ClientProfile";
import { ServiceFormField } from "@/components/InputField";
import { UserIcon, X, CalendarPlus } from "lucide-react";

interface Client {
  id: number;
  cedula: string;
  nombre: string;
  telefono: string;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

export function ClientDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [appointmentClient, setAppointmentClient] = useState<Client | null>(null);
  const [searchNameOrCedula, setSearchNameOrCedula] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const isMobile = useIsMobile();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 15;

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/clients`);
      if (!response.ok) throw new Error(`Error en la respuesta de la red: ${response.statusText}`);
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
      setError(e instanceof Error ? "Error al cargar los clientes: " + e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const normalizePhone = (phone: string) => {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) digits = "58" + digits.slice(1);
    return digits;
  };

  const normalizePhoneForSearch = (input: string) => {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "58" + digits.slice(1);
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

  // Calcular paginación
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const startIndex = (currentPage - 1) * clientsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + clientsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    setCurrentPage(1); // Resetear a página 1 cuando cambian los filtros
  }, [searchNameOrCedula, searchPhone]);

  const handleOpenNewClientModal = () => setShowNewClientModal(true);
  const handleCloseNewClientModal = () => {
    setShowNewClientModal(false);
    fetchClients();
  };

  const handleOpenNewAppointmentModal = (client?: Client) => {
    if (client) setAppointmentClient(client);
    setShowNewAppointmentModal(true);
  };
  const handleCloseNewAppointmentModal = () => setShowNewAppointmentModal(false);

  const handleCloseProfile = () => {
    setSelectedClient(null);
    fetchClients();
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 12 || !phone.startsWith("58")) return phone;
    const area = phone.slice(2, 5);
    const number = phone.slice(5);
    return `0${area}-${number}`;
  };

  return (
    <div className="relative flex w-full h-screen" style={{ fontFamily: "Poppins, sans-serif" }}>
      <main
        className={`transition-all duration-500 transform ${
          selectedClient ? "translate-x-0 w-[68%] mr-auto" : " w-full"
        }`}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Filtros y botón */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center items-center p-5">
            <div className="w-full md:w-1/2">
              <ServiceFormField
                placeholder="Nombre o Cédula"
                value={searchNameOrCedula}
                onChange={(e) => setSearchNameOrCedula(
                  typeof e.target.value === "string" ? e.target.value : e.target.value[0] || ""
                )}
                type="text"
                whiteBg
                className="rounded-lg" label={""}              />
            </div>
            <div className="w-full md:w-1/2">
              <ServiceFormField
                placeholder="Teléfono"
                value={searchPhone}
                onChange={(e) => setSearchPhone(
                  typeof e.target.value === "string" ? e.target.value : e.target.value[0] || ""
                )}
                type="text"
                whiteBg
                className="rounded-lg" label={""}              />
            </div>
            <button
              onClick={handleOpenNewClientModal}
              className="bg-[#447F98] hover:bg-[#629BB5] p-3 mt-2 text-xs text-white rounded-md flex items-center whitespace-nowrap"
            >
              <VscAdd className="h-5 w-5 mr-1" />
              <span>Nuevo Cliente</span>
            </button>
          </div>

          {/* Tabla */}
          {loading && <div className="p-5 text-center">Cargando clientes...</div>}
          {error && <div className="p-5 text-center text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 p-5 rounded-lg">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Cédula</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                  {paginatedClients.length > 0 ? (
                    paginatedClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">{client.cedula}</td>
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
                              onClick={() =>
                                selectedClient?.id === client.id
                                  ? setSelectedClient(null)
                                  : setSelectedClient(client)
                              }
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

              {/* Paginación */}
              {filteredClients.length > clientsPerPage && (
                <div className="flex justify-between items-center mt-6 px-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-center text-xs shadow ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]"
                    }`}
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-600 text-center max-sm:text-xs max-sm:mx-1">
                    Pág. {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-xs shadow ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#D6EBF3] text-[#447F98] hover:bg-[#B0E0E6]"
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Perfil lateral o modal según dispositivo */}
      {!isMobile && selectedClient && (
        <aside className="absolute right-0 top-0 h-full overflow-y-auto transition-transform duration-500 w-[32%]">
          <div className="ml-8">
            <ClientProfile clientId={selectedClient.id} onCloseProfile={handleCloseProfile} />
          </div>
        </aside>
      )}
      {isMobile && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-[95%] h-[90%] bg-white rounded-xl shadow-lg overflow-y-auto">
            <button
              onClick={handleCloseProfile}
              className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <ClientProfile clientId={selectedClient.id} onCloseProfile={handleCloseProfile} />
          </div>
        </div>
      )}

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
