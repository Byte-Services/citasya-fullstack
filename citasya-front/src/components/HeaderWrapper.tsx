'use client';

import { useUser } from "../context/UserContext";
import { Header } from "./Header";

export function HeaderWrapper() {
  const { user } = useUser();
  if (!user) return null; // No mostrar si no hay usuario logueado
  return <Header />;
}
