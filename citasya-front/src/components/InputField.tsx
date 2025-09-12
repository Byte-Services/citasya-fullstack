'use client';

import React, { ChangeEvent } from 'react';
import Select from 'react-select';

export interface SelectOption<T> {
  value: T;
  label: string;
}

interface ServiceFormFieldProps<T extends string | number> {
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  options?: SelectOption<T>[];
  multiple?: boolean;
  name?: string;
  value: T | T[] | ''; 
  onChange?: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    | { target: { name?: string; value: T | T[] } }
  ) => void;
  readOnly?: boolean;
  whiteBg?: boolean;
  disabled?: boolean;
  pattern?: string;
}

export const ServiceFormField = <T extends string | number>({
  label,
  placeholder,
  type = 'text',
  className,
  options,
  multiple = false,
  name,
  value,
  onChange,
  readOnly = false,
  whiteBg = false,
  disabled = false,
  pattern,
}: ServiceFormFieldProps<T>) => {
  const bgColorClass = whiteBg ? 'bg-white' : 'bg-[#D6EBF3]/30';

  // Manejador de cambio para react-select
  const handleSelectChange = (
    selected: SelectOption<T> | readonly SelectOption<T>[] | null,
  ) => {
    if (!onChange) return;

    if (multiple) {
      const selectedValues = (selected as readonly SelectOption<T>[]).map(opt => opt.value);
      onChange({ target: { name, value: selectedValues } });
    } else {
      const selectedValue = (selected as SelectOption<T>).value;
      onChange({ target: { name, value: selectedValue } });
    }
  };

  if (readOnly) {
    if (options) {
      const displayValues = multiple && Array.isArray(value)
        ? options.filter(opt => value.includes(opt.value)).map(opt => opt.label).join(', ')
        : options.find(opt => opt.value === value)?.label || '';

      return (
        <div className={`flex flex-col mt-4 ${className}`}>
          <label className="text-sm font-medium text-neutral-600">{label}</label>
          <div className="px-5 pt-2 pb-4 mt-2 text-sm bg-white w-full border-[#D6EBF3] rounded-lg max-md:pr-5 ">
            {displayValues || '-'}
          </div>
        </div>
      );
    }
    return (
      <div className={`flex flex-col mt-4 ${className}`}>
        <label className="text-sm font-medium text-neutral-600">{label}</label>
        <div className="px-5 pt-2 pb-4 mt-2 text-sm bg-white rounded-lg border-[#D6EBF3] w-full max-md:pr-5 whitespace-pre-wrap">
          {String(value) || '-'}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-sm text-neutral-600 mb-2">
        {label}
      </label>
      {options ? (
        multiple ? (
          <Select
            isMulti
            options={options}
            placeholder={placeholder}
            value={options.filter(opt => Array.isArray(value) && value.includes(opt.value))}
            onChange={handleSelectChange}
            classNamePrefix="custom-select"
            isDisabled={disabled}
            noOptionsMessage={() => "No hay más opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: whiteBg ? 'white' : 'rgba(214, 235, 243, 0.3)',
                borderRadius: '0.5rem',
                padding: '2px',
                borderColor: '#447F98',
                boxShadow: 'none',
                minHeight: '42px',
                fontSize: '0.85rem', // text-xs = 12px, reduce a 0.65rem (~10px)
                ':hover': { borderColor: '#629BB5' }
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#629BB5',
                fontSize: '0.75rem', // reduce font size
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: 'white',
                fontSize: '0.75rem' // reduce font size
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: 'white',
                fontSize: '0.75rem', // reduce font size
                ':hover': { backgroundColor: '#447F98', color: 'white' }
              }),
              placeholder: (base) => ({
                ...base,
                color: 'text-neutral-400',
                fontSize: '0.75rem' // reduce font size
              }),
              option: (base, state) => ({
                ...base,
                fontSize: '0.75rem', // reduce font size
                color: 'text-white',
                backgroundColor: state.isFocused
                  ? '#D6EBF3'
                  : 'transparent',
                ':active': { backgroundColor: '#D6EBF3' }
              })
            }}
          />
        ) : (
          <select
            className={`rounded-lg ${bgColorClass} p-3 text-xs text-neutral-600 ring-1 ring-[#447F98] focus:outline-none transition-all duration-200`}
            value={String(value)} // Convierte el valor a string para el HTML select
            onChange={onChange as (e: ChangeEvent<HTMLSelectElement>) => void}
            name={name}
            disabled={disabled}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        )
      ) : type === 'textarea' ? (
        <textarea
          className={`rounded-lg ${bgColorClass} p-3 text-xs text-neutral-600
            focus:outline-none focus:ring-2 focus:ring-[#447F98] transition-all duration-200`}
          placeholder={placeholder}
          rows={4}
          value={value as string}
          onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
          name={name}
          disabled={disabled}
        />
      ) : type === 'date' ? (
        <input
          type="date"
          className={`rounded-lg ${bgColorClass} p-3 text-xs text-neutral-600 border border-[#447F98]
            focus:outline-none focus:ring-1 focus:ring-[#447F98] transition-all duration-200`}
          placeholder={placeholder}
          value={value as string}
          onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
          name={name}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className={`rounded-lg ${bgColorClass} p-3 text-xs text-neutral-600 border border-[#447F98]
            focus:outline-none focus:ring-1 focus:ring-[#447F98] transition-all duration-200`}
          placeholder={placeholder}
          value={value as string}
          onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
          name={name}
          disabled={disabled}
          pattern={pattern}
        />
      )}
    </div>
  );
};