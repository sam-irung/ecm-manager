'use client';

import { updateFinances } from './actions';
import { Field, inputClass } from '@/components/settings/SettingsField';
import SaveButton from '@/components/settings/SaveButton';
import { useSettingsForm } from '@/components/settings/useSettingsForm';

export default function FinancesForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const { status, error, handleSubmit } = useSettingsForm(updateFinances);

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Taux de change"
          hint="1 USD = ? FC"
          required
        >
          <input
            type="number"
            name="exchange_rate"
            defaultValue={settings.exchange_rate}
            min="1"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Devise par défaut" required>
          <select
            name="default_currency"
            defaultValue={settings.default_currency}
            className={inputClass}
          >
            <option value="FC">FC (Franc Congolais)</option>
            <option value="USD">USD (Dollar Américain)</option>
          </select>
        </Field>

        <Field
          label="Remise maximale (%)"
          hint="Limite autorisée sur les devis"
        >
          <input
            type="number"
            name="max_discount_percent"
            defaultValue={settings.max_discount_percent}
            min="0"
            max="100"
            className={inputClass}
          />
        </Field>
      </div>

      <SaveButton status={status} error={error} />
    </form>
  );
}