"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/user";
import { NextRouter } from 'next/router'; 
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'; 

type UserContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, router: AppRouterInstance | NextRouter) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, router: AppRouterInstance | NextRouter) => {
    const res = await fetch("http://localhost:3000/admin/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.message || "Error al iniciar sesión. Inténtalo de nuevo.";
      throw new Error(errorMessage);
    }

    setToken(data.token);
    setUser(data.user); 

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("🔑 Token recibido en frontend:", data.token);

    // Redirección condicional ahora que 'data.user' es seguro
    if (data.user.role === "Coordinator") {
      router.push("/appointments");
    } else if (data.user.role === "Admin") {
      router.push("/");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de UserProvider");
  return ctx;
};