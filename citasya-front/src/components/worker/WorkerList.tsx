import * as React from "react";
import { VscAccount, VscAdd} from "react-icons/vsc";
import { NewSpecialist } from "./NewWorker";
import { SpecialistProfile } from "./WorkerProfile";
import { ServiceFormField } from "../InputField";
import {Service, Specialist, Availability } from '../../types/worker';

interface BackendSpecialist {
  id: number;
  name: string;
  phone: string;
  documentId: string;
  email: string;
  services: Service[];
  schedule: Availability;
}

type SpecialistCardProps = {
  id: number;
  name: string;
  specialties: string[];
  onClick: (id: number) => void;
  selected: boolean;
};

function SpecialistCard({
  id,
  name,
  specialties,
  onClick,
  selected,
}: SpecialistCardProps) {
  return (
    <div
      onClick={() => onClick(id)}
      className={`flex items-center px-10 py-3 w-full max-md:px-5 max-md:max-w-full border-b-[2px] border-neutral-200 cursor-pointer
      ${selected ? "bg-[#D6EBF3]/50" : "bg-white"}`} style={{ fontFamily: 'Poppins, sans-serif'}}
    >
      <VscAccount className="text-4xl text-[#447F98] bg-[#D9E8F6] rounded-full mr-4"/>
      <div className="flex flex-col mt-2">
      <h3 className="text-sm tracking-tight leading-none text-black">{name}</h3>
      {specialties.length > 0 && (
        <p className="text-xs tracking-tight leading-6 text-neutral-600 mt-1">
        {specialties.join(", ")}
        </p>
      )}
      </div>
    </div>
  );
}

export function SpecialistList() {
const [specialists, setSpecialists] = React.useState<Specialist[]>([]);
  const [allServices, setAllServices] = React.useState<{ id: number; name: string }[]>([]); 
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showNewSpecialistModal, setShowNewSpecialistModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = React.useState<number | null>(null);
  const [forceReload, setForceReload] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const specialistsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/workers`);
        if (!specialistsRes.ok) throw new Error("Error al obtener especialistas");
        const specialistsData: BackendSpecialist[] = await specialistsRes.json();

        const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/services`); 
        if (!servicesRes.ok) throw new Error("Error al obtener servicios");
        const servicesData = await servicesRes.json();
        setAllServices(servicesData.map((s: Service) => ({ id: s.id, name: s.name }))); 

      const formattedData: Specialist[] = specialistsData.map((spec) => {
        const uniqueSpecialties = Array.from(
          new Set(spec.services.map((service) => service.specialty.name))
        );

        return {
          id: spec.id,
          name: spec.name,
          specialties: uniqueSpecialties,
          phone: spec.phone,
          documentId: spec.documentId,
          email: spec.email,
          services: spec.services.map((service) => ({ id: service.id, name: service.name })),
          schedule: spec.schedule || {
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
          },
        };
      });
        
        setSpecialists(formattedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [forceReload]);

  const filteredSpecialists = specialists.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSpecialist = specialists.find(
    (spec) => spec.id === selectedSpecialistId
  );
    const handleWorkerUpdated = () => {
    setForceReload(prev => prev + 1);
  };
  if (loading) return <p>Cargando especialistas...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex w-full max-md:flex-col max-md:max-h-auto overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <aside className="w-[36%] max-md:w-full max-md:mb-5 max-md:px-4">
        <div className="flex flex-col mx-auto w-full h-full font-medium rounded-lg bg-white max-md:pb-24 max-md:max-w-full">
          <div className="flex gap-4 px-6 self-center max-w-full text-sm tracking-normal bg text-neutral-600 w-full max-md:w-full">
            <div className="flex flex-auto items-center px-2.5 py-3 pb-4 bg-white rounded-lg w-full">
              <ServiceFormField
                  type="text"
                  placeholder="Buscar por cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(Array.isArray(e.target.value) ? e.target.value.join(", ") : e.target.value)}
                  label=""
                  className="rounded-lg text-neutral-600 w-full" 
                  whiteBg
                />
            </div>
            <button onClick={() => setShowNewSpecialistModal(true)}>
              <VscAdd className="mt-2 h-10 w-10 text-white bg-[#447F98] rounded-lg px-2.5 py-3" />
            </button>
          </div>
          <div className="bg-neutral-100">
            <h2 className="px-8.5 p-4 border-b border-t border-gray-200 text-neutral-600">Lista de Especialistas</h2>
          </div>
          <div className="flex flex-col max-md:mt-5 overflow-y-auto max-h-[calc(100vh-200px)]">
            {filteredSpecialists.map((spec) => (
              <SpecialistCard
                key={spec.id}
                id={spec.id}
                name={spec.name}
                specialties={spec.specialties}
                onClick={setSelectedSpecialistId}
                selected={selectedSpecialistId === spec.id}
                
              />
            ))}
          </div>
        </div>
        {showNewSpecialistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
            <NewSpecialist
              onClose={() => setShowNewSpecialistModal(false)}
              onWorkerAdded={(newSpecialist: Specialist) => {
                setSpecialists((prev) => [...prev, newSpecialist]);
              }}
            />
          </div>
        )}
      </aside>

      <section className="ml-5 w-[60%] max-md:ml-0 max-md:w-full">
        <SpecialistProfile 
          specialist={selectedSpecialist || null} 
          onWorkerUpdated={handleWorkerUpdated}
          allServices={allServices} 
        />
      </section>
    </div>
  );
}