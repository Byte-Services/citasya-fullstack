import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store';

interface LoginFormProps {
	onLogin?: (email: string, password: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const { login, isLoading } = useAuthStore();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			if (onLogin) {
				await onLogin(email, password);
			} else {
				await login({ email, password });
			}
			router.replace('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Input
				id="email"
				label="Correo Electronico"
				variant="text"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				inputMode="email"
				autoComplete="email"
				placeholder="admin@spa.com"
				required
			/>

			<div>
				<Input
					id="password"
					label="Contrasena"
					variant="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="current-password"
					placeholder="••••••••"
					required
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

			{error ? <p className="text-sm text-red-600">{error}</p> : null}
		</form>
	);
}
