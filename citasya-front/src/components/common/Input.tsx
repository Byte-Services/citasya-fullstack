import React from 'react'

type InputVariant = 'text' | 'password' | 'time' | 'date' | 'tel' | 'email' | 'number'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	variant?: InputVariant
	label?: string
	containerClassName?: string
	labelClassName?: string
	error?: string
}

export default function Input({
	variant = 'text',
	label,
	className = '',
	containerClassName = '',
	labelClassName = '',
	error,
	id,
	...props
}: InputProps) {
	let inputType: string;
	if (variant === 'password') inputType = 'password';
	else if (variant === 'time') inputType = 'time';
	else if (variant === 'date') inputType = 'date';
	else if (variant === 'tel') inputType = 'tel';
	else if (variant === 'email') inputType = 'email';
	else if (variant === 'number') inputType = 'number';
	else inputType = 'text';

	return (
		<div className={containerClassName}>
			{label ? (
				<label
					htmlFor={id}
					className={`block text-sm font-medium text-slate-700 mb-2 ${labelClassName}`}
				>
					{label}
				</label>
			) : null}
			<input
				id={id}
				type={inputType}
				aria-invalid={Boolean(error)}
				className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'} ${className}`}
				{...props}
			/>
			{error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
		</div>
	)
}
