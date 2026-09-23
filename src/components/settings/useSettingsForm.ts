'use client';

import { useState } from 'react';

export type FormStatus = 'idle' | 'saving' | 'success' | 'error';

export function useSettingsForm(
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => setStatus('idle'), 2500);
  }

  return { status, error, handleSubmit };
}