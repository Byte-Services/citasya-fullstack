'use client';


import { useEffect
 } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    router.replace(isAuthenticated ? '/home' : '/login');
  }, [hasHydrated, isAuthenticated, router]);

  // Loader con color primario del login
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 p-6">
        <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          
        </svg>
        <p className="text-primary text-base font-medium">Redireccionando...</p>
      </div>
    </div>
  );
}
