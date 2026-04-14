import React from "react";

interface DropdownProps {
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	options: string[];
	placeholder?: string;
	error?: boolean;
	errorMessage?: string;
	className?: string;
	label?: string;
	required?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
	name,
	value,
	onChange,
	options,
	placeholder = "Seleccionar...",
	error = false,
	errorMessage,
	className = "",
	label,
	required = false,
}) => {
		return (
			<div className="relative">
				{label && (
					<label className="block text-sm font-medium text-slate-700 mb-2">
						{label} {required && <span className="text-rose-500">*</span>}
					</label>
				)}
				<select
					name={name}
					value={value}
					onChange={onChange}
					aria-invalid={error}
					className={`w-full px-4 py-3 pr-10 rounded-xl border appearance-none ${error ? 'border-rose-500' : 'border-gray-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white ${className}`}
				>
					<option value="">{placeholder}</option>
					{options.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
				{/* Custom arrow icon */}
				<svg
					className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
				{errorMessage ? <p className="mt-1 text-sm text-rose-600">{errorMessage}</p> : null}
			</div>
		);
};

export default Dropdown;
