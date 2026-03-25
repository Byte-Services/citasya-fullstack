
"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  UserCheckIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    label: "Inicio",
    href: "/home",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Calendario",
    href: "/calendar",
    icon: CalendarIcon,
  },
  {
    label: "Historial",
    href: "/history",
    icon: ClockIcon,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: UsersIcon,
  },
  {
    label: "Servicios",
    href: "/services",
    icon: SparklesIcon,
  },
  {
    label: "Trabajadores",
    href: "/workers",
    icon: UserCheckIcon,
  },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-white w-64 border-r border-gray-800">
      <div className="p-6 flex flex-col items-center border-b border-gray-800/50">
        <h1 className="font-playfair text-3xl font-bold text-primary tracking-wide mb-1">
          Citas Ya
        </h1>
        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">
          Spa Demo
        </p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive ? 'bg-white/5 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/50">
        <div className="flex items-center p-3 rounded-lg bg-white/5 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3 border border-primary/30">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">admin@spa.com</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOutIcon className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar z-40 flex items-center justify-between px-4 border-b border-gray-800">
        <h1 className="font-playfair text-xl font-bold text-primary">
          Citas Ya
        </h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2">
          {sidebarOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
        {sidebarContent}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </>
  );

}