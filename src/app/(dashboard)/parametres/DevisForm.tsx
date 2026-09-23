'use client';

import { updateDevis } from './actions';
import {
  Field,
  inputClass,
  textareaClass,
} from '@/components/settings/SettingsField';
import SaveButton from '@/components/settings/SaveButton';
import { useSettingsForm } from '@/components/settings/useSettingsForm';

export default function DevisForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const { status, error, handleSubmit } = useSettingsForm(updateDevis);

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Préfixe des devis"
          hint="Exemple : DEV → DEV-2026-001"
          required
        >
          <input
            name="quote_prefix"
            defaultValue={settings.quote_prefix}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Validité par défaut (jours)"
          hint="Durée avant expiration d'un devis"
          required
        >
          <input
            type="number"
            name="quote_validity_days"
            defaultValue={settings.quote_validity_days}
            min="1"
            required
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Conditions générales"
            hint="Ces conditions apparaîtront en bas de chaque devis PDF"
          >
            <textarea
              name="quote_conditions"
              defaultValue={settings.quote_conditions}
              rows={6}
              className={textareaClass}
            />
          </Field>
        </div>
      </div>

      <SaveButton status={status} error={error} />
    </form>
  );
}