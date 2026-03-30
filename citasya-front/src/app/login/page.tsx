'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from 'lucide-react'
import LoginForm from '@/components/form/LoginForm'


export default function LoginPage() {

	return (
		<div className="min-h-screen flex w-full bg-background">
			{/* Left Panel - Brand/Illustration */}
			<div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden flex-col justify-between p-12">
				{/* Decorative elements */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
					<div className="absolute bottom-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
				</div>

				<div className="relative z-10">
					<div className="flex items-center space-x-2 mb-8">
						<SparklesIcon className="w-8 h-8 text-primary" />
						<h1 className="font-playfair text-4xl font-bold text-white">Citas Ya</h1>
					</div>
				</div>

				<div className="relative z-10 max-w-lg">
					<motion.h2
						initial={{
							opacity: 0,
							y: 20,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							delay: 0.2,
						}}
						className="text-4xl md:text-5xl font-playfair font-medium text-white leading-tight mb-6"
					>
						Gestiona tu negocio con{' '}
						<span className="text-primary italic">elegancia</span>.
					</motion.h2>
					<motion.p
						initial={{
							opacity: 0,
							y: 20,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							delay: 0.3,
						}}
						className="text-gray-400 text-lg"
					>
						La plataforma definitiva para spas y centros de belleza. Organiza tus citas,
						clientes y equipo en un solo lugar.
					</motion.p>
				</div>

				<div></div>
			</div>

			{/* Right Panel - Login Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
				<div className="w-full max-w-md">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-10 text-center lg:text-left"
					>
						<motion.h2
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.4 }}
							className="text-3xl font-bold text-slate-800 mb-2"
						>
							Iniciar Sesión
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.4 }}
							className="text-slate-500"
						>
							Usa tus credenciales para acceder a tu panel.
						</motion.p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3, duration: 0.5 }}
					>
						<LoginForm />
					</motion.div>
				</div>
			</div>
		</div>
	)
}
