import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store';

interface LoginFormProps {
	onLogin?: (email: string, password: string) => void;
}

type LoginFormValues = {
	email: string;
	password: string;
};

export default function LoginForm({ onLogin }: LoginFormProps) {
	const { login, isLoading } = useAuthStore();
	const router = useRouter();
	const {
		register,
		handleSubmit,
		clearErrors,
		setError,
		formState: { errors },
	} = useForm<LoginFormValues>({
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (values: LoginFormValues) => {
		clearErrors('root');
		try {
			if (onLogin) {
				await onLogin(values.email, values.password);
			} else {
				await login({ email: values.email, password: values.password });
			}
			router.replace('/home');
		} catch (err) {
			setError('root', {
				type: 'server',
				message: err instanceof Error ? err.message : 'No se pudo iniciar sesion',
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
			<Input
				id="email"
				label="Correo Electronico"
				variant="text"
				inputMode="email"
				autoComplete="email"
				placeholder="admin@spa.com"
				error={errors.email?.message}
				{...register('email', {
					required: 'El correo es requerido',
					validate: (value) => value.trim().length > 0 || 'El correo es requerido',
				})}
			/>

			<div>
				<Input
					id="password"
					label="Contrasena"
					variant="password"
					autoComplete="current-password"
					placeholder="••••••••"
					error={errors.password?.message}
					{...register('password', {
						required: 'La contrasena es requerida',
						validate: (value) => value.trim().length > 0 || 'La contrasena es requerida',
					})}
				/>
				<div className="mt-2 flex justify-end">
					<a href="#" className="text-sm text-primary hover:text-primary-hover font-medium">
						Olvidaste tu contrasena?
					</a>
				</div>
			</div>

			<Button
				type="submit"
				loading={isLoading}
				iconRight={<ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
			>
				Iniciar Sesion
			</Button>

			{errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
		</form>
	);
}
