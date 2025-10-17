import React, { useState } from 'react';
import { VscCheck, VscChromeClose } from 'react-icons/vsc';
import {Availability } from '../../types/worker';
import toast from 'react-hot-toast';

interface AvailabilitySelectorProps {
  onSave: (availability: Availability) => void;
  onClose: () => void;
  initialAvailability: Availability;
}

const dayLabels = {
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mié',
  Thu: 'Jue',
  Fri: 'Vie',
  Sat: 'Sab',
  Sun: 'Dom',
};

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({ onSave, onClose, initialAvailability }) => {
  const [currentAvailability, setCurrentAvailability] = useState<Availability>(initialAvailability);
  
  // Lógica para manejar el estado de los días y el descanso
  const toggleDay = (day: keyof Availability['days']) => {
    setCurrentAvailability(prevState => ({
      ...prevState,
      days: {
        ...prevState.days,
        [day]: {
          ...prevState.days[day],
          enabled: !prevState.days[day].enabled,
        },
      },
    }));
  };

  const handleTimeChange = (day: keyof Availability['days'], field: 'startTime' | 'endTime', value: string) => {
    setCurrentAvailability(prevState => ({
      ...prevState,
      days: {
        ...prevState.days,
        [day]: {
          ...prevState.days[day],
          [field]: value,
        },
      },
    }));
  };

  const handleBreakChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAvailability(prevState => ({
      ...prevState,
      breakTime: e.target.value,
    }));
  };

  const isTimeBefore = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return false;
    return sh < eh || (sh === eh && sm < em);
  };

  const handleSaveClick = () => {
    for (const key of Object.keys(currentAvailability.days) as (keyof Availability['days'])[]) {
      const day = currentAvailability.days[key];
      if (day.enabled) {
        if (!isTimeBefore(day.startTime, day.endTime)) {
          toast.error(`La hora de inicio debe ser menor que la hora de fin para ${dayLabels[key] ?? key}`);
          return;
        }
      }
    }

    onSave(currentAvailability);
    toast.success("Horario actualizado correctamente");
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="bg-white w-full sm:w-[90%] md:max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 sm:px-8 py-4 border-b border-gray-200 bg-[#D6EBF3]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#447F98] flex-1 text-center" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
            Editar Horario
          </h1>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-neutral-600 hover:text-neutral-800 transition-colors duration-200 ml-4"
          >
            <VscChromeClose className="w-6 h-6" />
          </button>
        </div>
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
            {Object.entries(dayLabels).map(([key, label]) => {
              const dayKey = key as keyof Availability['days'];
              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 pb-3">
                  <button
                    type="button"
                    className={`w-full sm:w-20 py-2 text-sm font-medium rounded transition-colors ${
                    currentAvailability.days[dayKey].enabled
                      ? 'bg-[#B9D8E1] text-[#447F98]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                     onClick={() => toggleDay(dayKey)}
                  >
                    {currentAvailability.days[dayKey].enabled && <VscCheck className="inline mr-1" />}
                    {label}
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-500  mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={currentAvailability.days[dayKey].startTime}
                        disabled={!currentAvailability.days[dayKey].enabled}
                        onChange={(e) => handleTimeChange(dayKey, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-[#447F98] rounded-md text-xs bg-white disabled:bg-gray-100 focus:ring-[#447F98] focus:border-[#447F98]"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-500 mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={currentAvailability.days[dayKey].endTime}
                        disabled={!currentAvailability.days[dayKey].enabled}
                        onChange={(e) => handleTimeChange(dayKey, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-[#447F98] rounded-md text-xs bg-white disabled:bg-gray-100 focus:ring-[#447F98] focus:border-[#447F98]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-xs text-gray-500 mb-1">Descanso (1 hora):</label>
              <select
                value={currentAvailability.breakTime}
                onChange={handleBreakChange}
                className="w-full sm:w-1/2 md:w-1/3 px-3 py-2 border border-[#447F98] rounded-md text-xs bg-white focus:ring-[#447F98] focus:border-[#447F98]"
              >
                <option value="none">Sin descanso</option>
                <option value="12:00-13:00">12:00 - 13:00</option>
                <option value="13:00-14:00">13:00 - 14:00</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-200 bg-neutral-50">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleSaveClick}
                    className="px-4 py-2 text-sm rounded-md bg-[#447F98] text-white hover:bg-[#629BB5]"
                >
                    Guardar cambios
                </button>
            </div>
          </div>
        </div>
    </main>
  );
};

export default AvailabilitySelector;