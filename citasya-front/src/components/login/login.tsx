'use client';

import * as React from "react";
import { ServiceFormField } from "../InputField";
import { useUser } from "../../context/UserContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { login } = useUser(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, router);
    } catch (err: unknown) {
      let errorMessage = "Error al iniciar sesión. Inténtalo de nuevo.";
      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <main className="bg-white p-8 rounded-lg shadow-md w-[400px]">
        <header className="text-center"> 
          <h1 className="text-6xl font-bold leading-none text-slate-300 max-md:text-4xl flex justify-center items-center gap-2" style={{ color: "#B9D8E1", fontFamily: 'Poppins, sans-serif'}}> 
            Citas<span style={{ color: "#447F98", fontFamily: 'Poppins, sans-serif' }}>Ya</span> 
          </h1> 
          <h2 className="mt-10 text-xl font-medium text-neutral-600 max-md:mt-10"> 
            Inicia sesión en tu cuenta 
          </h2> 
        </header>         
        <form onSubmit={handleLogin} className="mt-10 space-y-4">
          <ServiceFormField
            value={email}
            label="Email"
            placeholder="info@gmail.com"
            type="email"
            name="email"
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          <ServiceFormField
            value={password}
            label="Contraseña"
            placeholder="******"
            type="password"
            name="password"
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />

          {error && (
            <div className="text-red-500 text-center text-sm font-medium mt-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-[#447F98] text-white rounded-lg hover:bg-[#629BB5]"
          >
            Iniciar Sesión
          </button>
        </form>
      </main>
    </div>
  );
}