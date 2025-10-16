'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { VscAccount } from "react-icons/vsc";
import { HiOutlineMenuAlt3 } from "react-icons/hi"; 
import { useUser } from '../context/UserContext'; 

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const handleLogout = () => {
    logout(); 
    router.push("/"); 
  };

  const toggleMenu = () => { 
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'CITAS', href: '/appointments' },
    { name: 'CLIENTES', href: '/clients' },
    { name: 'SERVICIOS', href: '/services' },
    ...(user?.role === 'Admin' ? [{ name: 'ESPECIALISTAS', href: '/workers' }] : [])
  ];

  return (
    <header className="flex shrink-0 justify-center items-center px-20 pt-0 pb-px w-full bg-white rounded-md max-md:px-8 max-md:pt-0 max-md:pb-px max-sm:px-4 max-sm:pt-0 max-sm:pb-px" style={{ boxShadow: '0 2px 12px 0 rgba(68, 127, 152, 0.08)' }}>
      <div className="flex shrink-0 justify-between items-center py-4 w-full max-w-screen-xl h-[68px] max-md:px-0 max-md:py-4">
        {user?.role === 'Coordinator' ? (
          <div className="flex shrink-0 justify-start items-start w-20 h-8">
            <div className="flex shrink-0 justify-center items-center h-8 w-[75px]">
              <h1 className="shrink-0 h-8 text-2xl font-bold leading-8 text-slate-300 w-[55px]" style={{ color: "#B9D8E1", fontFamily: 'Poppins, sans-serif' }}>
                Citas
              </h1>
            </div>
            <div className="flex flex-col shrink-0 justify-center items-center h-8 w-[25px]">
              <span className="shrink-0 h-8 text-2xl font-bold leading-8 text-slate-500 w-[25px]" style={{ color: "#447F98", fontFamily: 'Poppins, sans-serif' }}>
                Ya
              </span>
            </div>
          </div>
        ) : (
          <Link href="/" className="flex shrink-0 justify-start items-start w-20 h-8">
            <div className="flex shrink-0 justify-center items-center h-8 w-[75px]">
              <h1 className="shrink-0 h-8 text-2xl font-bold leading-8 text-slate-300 w-[55px]" style={{ color: "#B9D8E1", fontFamily: 'Poppins, sans-serif' }}>
                Citas
              </h1>
            </div>
            <div className="flex flex-col shrink-0 justify-center items-center h-8 w-[25px]">
              <span className="shrink-0 h-8 text-2xl font-bold leading-8 text-slate-500 w-[25px]" style={{ color: "#447F98", fontFamily: 'Poppins, sans-serif' }}>
                Ya
              </span>
            </div>
          </Link>
        )}

        <nav className="flex shrink-0 gap-1 justify-end items-center h-9 w-[431px] max-md:gap-2 max-md:w-auto max-sm:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className="flex relative flex-col items-center group">
                <button
                  className={`flex shrink-0 justify-center items-center px-4 pt-2 pb-2.5 rounded-md max-md:px-3 max-md:pt-1.5 max-md:pb-2
                  ${isActive ? '' : ''}
                  `}
                  style={isActive ? { background: '#D6EBF3' } : undefined}
                >
                  <span className={`shrink-0 text-base font-medium leading-6 ${isActive ? 'text-primary' : ''} max-md:text-base`} style={{ background: isActive ? '#D6EBF3' : undefined, color: "#447F98", fontFamily: 'Poppins, sans-serif' }}>
                  {link.name}
                  </span>
                </button>
              </Link>
            );
          })}

          {pathname === "/profile" ? (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-[#447F98] text-white text-xs rounded-lg hover:bg-[#629BB5] transition-colors ml-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Cerrar sesión
            </button>
          ) : (          
            <Link href="/profile" className="flex shrink-0 justify-center items-center w-9 h-9 ml-2">
              <VscAccount className="size-9 hover:text-primary/20 transition-colors duration-200 rounded-2xl " style={{  background: pathname === '/profile' ? '#D6EBF3' : undefined, color: "#447F98" }} />
            </Link>
          )}
        </nav>

        {/* MENÚ HAMBURGUESA Y PERFIL/LOGOUT PARA MÓVILES */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={toggleMenu}
            className="text-[#447F98] focus:outline-none"
            aria-label="Toggle Menu"
          >
            <HiOutlineMenuAlt3 className="size-8" />
          </button>
          {pathname === "/profile" ? (
            <button
              onClick={handleLogout}
              className="py-1 px-2 bg-[#447F98] text-white text-xs rounded-lg hover:bg-[#629BB5] transition-colors"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Cerrar sesión
            </button>
          ) : (
            <Link href="/profile" className="flex shrink-0 justify-center items-center w-8 h-8">
              <VscAccount className="size-8 hover:text-primary/20 transition-colors duration-200 rounded-2xl " style={{ background: pathname === '/profile' ? '#D6EBF3' : undefined, color: "#447F98" }} />
            </Link>
          )}
        </div>

      </div>

      {isMenuOpen && (
        <div className="sm:hidden absolute top-[69px] left-0 right-0 z-10 bg-white border-t border-gray-100 flex flex-col items-center py-2" style={{ boxShadow: '0 4px 6px -1px rgba(68, 127, 152, 0.1), 0 2px 4px -2px rgba(68, 127, 152, 0.06)' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={toggleMenu}
                className="w-full text-center py-2 hover:bg-[#D6EBF3] transition-colors"
              >
                <span className={`text-base font-medium leading-6 ${isActive ? 'font-bold' : ''}`} style={{ color: "#447F98", fontFamily: 'Poppins, sans-serif' }}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
