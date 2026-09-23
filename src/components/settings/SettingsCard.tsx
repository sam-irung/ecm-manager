'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function SettingsCard({
  icon,
  title,
  description,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-ecm-blue/5 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-ecm-blue">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-gray-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}