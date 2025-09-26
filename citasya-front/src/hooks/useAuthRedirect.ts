"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";

export const useAuthRedirect = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // esperar a que cargue
    if (!user && pathname !== "/") {
      router.push("/");
    }
  }, [user, loading, router, pathname]);
};
