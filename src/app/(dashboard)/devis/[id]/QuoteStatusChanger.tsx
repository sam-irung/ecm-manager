'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  HardHat,
  AlertCircle,
} from 'lucide-react';
import { updateQuoteStatus, convertQuoteToProject } from '../actions';

interface Props {
  quoteId: string;
  status: string;
  hasProject: boolean;
  projectId: string | null;
  projectCode: string | null;
}

const STATUS_OPTIONS = [
  { value: 'BROUILLON', label: 'Brouillon', icon: Clock },
  { value: 'ENVOYE', label: 'Envoyé', icon: Send },
  { value: 'ACCEPTE', label: 'Accepté', icon: CheckCircle2 },
  { value: 'REFUSE', label: 'Refusé', icon: XCircle },
  { value: 'EXPIRE', label: 'Expiré', icon: Clock },
];

export default function QuoteStatusChanger({
  quoteId,
  status,
  hasProject,
  projectId,
  projectCode,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setError(null);
    await updateQuoteStatus(quoteId, newStatus);
    router.refresh();
    setLoading(false);
  }

  async function handleConvert() {
    setLoading(true);
    setError(null);

    const result = await convertQuoteToProject(quoteId);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.projectId) {
      router.push(`/chantiers/${result.projectId}`);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-3">
          Statut du devis
        </h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={loading || hasProject}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-ecm-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Conversion */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-3">
          Chantier
        </h3>
        {hasProject && projectId ? (
          <a
            href={`/chantiers/${projectId}`}
            className="flex items-center gap-2 text-sm font-medium text-ecm-blue hover:text-ecm-orange transition-colors"
          >
            <HardHat size={16} />
            Voir le chantier {projectCode}
          </a>
        ) : status === 'ACCEPTE' ? (
          <button
            onClick={handleConvert}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HardHat size={16} />
            {loading ? 'Conversion...' : 'Convertir en chantier'}
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            Marquez d'abord le devis comme <strong>Accepté</strong> pour
            pouvoir le convertir en chantier.
          </p>
        )}
      </div>
    </div>
  );
}