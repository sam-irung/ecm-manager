'use client';

import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  status: 'idle' | 'saving' | 'success' | 'error';
  error?: string | null;
  label?: string;
}

export default function SaveButton({
  status,
  error,
  label = 'Enregistrer les modifications',
}: Props) {
  return (
    <div className="space-y-3">
      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle2 size={18} />
          Modifications enregistrées avec succès.
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Save size={16} />
          {status === 'saving' ? 'Enregistrement...' : label}
        </button>
      </div>
    </div>
  );
}