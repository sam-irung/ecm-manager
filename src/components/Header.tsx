'use client';

import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { useSidebarStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
  const { open } = useSidebarStore();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
      {/* Logo cliquable */}
      <button
        onClick={open}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label="Ouvrir le menu"
      >
        <Image
          src="/images/logo-ecm.png"
          alt="ECM"
          width={36}
          height={36}
          className="rounded"
          loading="eager"
        />
        <div className="text-left">
          <h1 className="text-sm font-bold text-ecm-blue leading-tight">
            ECM Manager
          </h1>
          <p className="text-[10px] text-ecm-orange leading-tight">
            Construction moderne
          </p>
        </div>
      </button>

      {/* Espace flexible */}
      <div className="flex-1" />

      {/* Menu utilisateur */}
      {session?.user && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-ecm-blue text-white flex items-center justify-center text-xs font-semibold">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-ecm-blue leading-tight">
                {session.user.name}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                {session.user.email}
              </p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-ecm-blue">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}