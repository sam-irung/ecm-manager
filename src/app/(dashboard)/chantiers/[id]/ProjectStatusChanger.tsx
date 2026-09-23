'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { updateProjectStatus } from '../actions';

interface Props {
  projectId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'PREPARATION', label: 'Préparation', icon: Clock, color: 'text-gray-600' },
  { value: 'EN_COURS', label: 'En cours', icon: Play, color: 'text-blue-600' },
  { value: 'EN_PAUSE', label: 'En pause', icon: Pause, color: 'text-orange-600' },
  { value: 'TERMINE', label: 'Terminé', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'ANNULE', label: 'Annulé', icon: XCircle, color: 'text-red-600' },
];

export default function ProjectStatusChanger({
  projectId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: string) {
    if (newStatus === currentStatus) return;

    setLoading(true);
    setError(null);

    const result = await updateProjectStatus(projectId, newStatus);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-3">
        Changer le statut
      </h2>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              disabled={loading || isActive}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-ecm-orange text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
                disabled:cursor-not-allowed disabled:opacity-60
              `}
            >
              <Icon size={16} className={isActive ? 'text-white' : opt.color} />
              <span>{opt.label}</span>
              {isActive && (
                <span className="ml-auto text-xs">Actuel</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}