import React from 'react'

type InputVariant = 'text' | 'password'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	variant?: InputVariant
	label?: string
	containerClassName?: string
	labelClassName?: string
}

export default function Input({
	variant = 'text',
	label,
	className = '',
	containerClassName = '',
	labelClassName = '',
	id,
	...props
}: InputProps) {
	const inputType = variant === 'password' ? 'password' : 'text'

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
				className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white ${className}`}
				{...props}
			/>
		</div>
	)
}
