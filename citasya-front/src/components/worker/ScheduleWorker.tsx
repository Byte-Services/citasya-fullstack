import React, { useState } from 'react';
import { VscCheck, VscChromeClose } from 'react-icons/vsc';
import {Availability } from '../../types/worker';

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

  const handleSaveClick = () => {
    onSave(currentAvailability);
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ fontFamily: 'Poppins, sans-serif'}}>
      <div className="max-w-xl w-full mx-4 sm:mx-6 md:mx-auto">
        <div className="w-full px-8 mt-4 bg-white h-[500px] rounded-lg overflow-y-auto">
          <div className="mt-4 px-8 flex justify-between items-center w-full">
            <h1 className="text-4xl font-medium leading-none text-center text-[#447F98]" style={{ fontFamily: 'Roboto Condensed, sans-serif' }}>
              Editar Horario
            </h1>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="flex-1 text-right text-neutral-600 hover:text-neutral-800 transition-colors duration-200"
            >
              <VscChromeClose className="inline-block w-6 h-6" />
            </button>
          </div>
          <div className="m-4 rounded-lg p-4 space-y-4">
            {Object.entries(dayLabels).map(([key, label]) => {
              const dayKey = key as keyof Availability['days'];
              return (
                <div key={key} className="flex items-center gap-4 border-b border-gray-200 pb-3">
                  <button
                    type="button"
                    className={`h-15 w-16 text-sm flex items-center justify-center rounded ${currentAvailability.days[dayKey].enabled ? 'bg-[#B9D8E1] text-[#447F98]' : 'bg-gray-100 text-gray-400'}`}
                    onClick={() => toggleDay(dayKey)}
                  >
                    {currentAvailability.days[dayKey].enabled && <VscCheck className="mr-1" />}
                    {label}
                  </button>
                  <div className="flex gap-4 flex-1 w-full">
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs text-gray-500">Hora Inicio</label>
                      <input
                        type="time"
                        value={currentAvailability.days[dayKey].startTime}
                        disabled={!currentAvailability.days[dayKey].enabled}
                        onChange={(e) => handleTimeChange(dayKey, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-[#447F98] focus:border-[#447F98] focus:ring-[#447F98] ring-1 ring-[#447F98] rounded-md text-xs bg-white disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="text-xs text-gray-500">Hora Fin</label>
                      <input
                        type="time"
                        value={currentAvailability.days[dayKey].endTime}
                        disabled={!currentAvailability.days[dayKey].enabled}
                        onChange={(e) => handleTimeChange(dayKey, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-[#447F98] focus:border-[#447F98] focus:ring-[#447F98] ring-1 ring-[#447F98] rounded-md text-xs bg-white disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 w-full">
              <label className="block text-xs text-gray-500 mb-1">
                Descanso (1 hora):
              </label>
              <select
                value={currentAvailability.breakTime}
                onChange={handleBreakChange}
                className="w-full md:w-1/3 px-3 py-2 border border-[#447F98] focus:border-[#447F98] focus:ring-[#447F98] ring-1 ring-[#447F98] rounded-md text-xs bg-white"
              >
                <option value="none">Sin descanso</option>
                <option value="12:00-13:00">12:00 - 13:00</option>
                <option value="13:00-14:00">13:00 - 14:00</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
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
      </div>
    </main>
  );
};

export default AvailabilitySelector;