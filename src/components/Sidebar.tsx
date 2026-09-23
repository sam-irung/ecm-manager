'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  HardHat,
  Wallet,
  Receipt,
  Package,
  Settings,
  X,
} from 'lucide-react';
import { useSidebarStore } from '@/lib/store';

const menuItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/chantiers', label: 'Chantiers', icon: HardHat },
  { href: '/paiements', label: 'Paiements', icon: Wallet },
  { href: '/depenses', label: 'Dépenses', icon: Receipt },
  { href: '/catalogue', label: 'Catalogue', icon: Package },
  { href: '/parametres', label: 'Paramètres', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Overlay sombre quand la sidebar est ouverte */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72 bg-ecm-blue text-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* En-tête avec logo + bouton X */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo-ecm.png"
              alt="ECM"
              width={40}
              height={40}
              className="rounded shrink-0"
              loading="eager"
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                ECM
              </h1>
              <p className="text-xs text-ecm-orange">Manager</p>
            </div>
          </Link>

          <button
            onClick={close}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                  text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-ecm-orange text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={20} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pied de la sidebar */}
        <div className="p-4 border-t border-white/10 text-xs text-white/60">
          <p>© 2026 ECM</p>
          <p className="text-ecm-orange">L'expertise fait la différence.</p>
        </div>
      </aside>
    </>
  );
}