'use client';

import { updateCompany } from './actions';
import {
  Field,
  inputClass,
  textareaClass,
} from '@/components/settings/SettingsField';
import SaveButton from '@/components/settings/SaveButton';
import { useSettingsForm } from '@/components/settings/useSettingsForm';

export default function CompanyForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const { status, error, handleSubmit } = useSettingsForm(updateCompany);

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nom court" required>
          <input
            name="company_name"
            defaultValue={settings.company_name}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Nom complet" required>
          <input
            name="company_full_name"
            defaultValue={settings.company_full_name}
            required
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Slogan">
            <input
              name="company_slogan"
              defaultValue={settings.company_slogan}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Ville">
          <input
            name="company_city"
            defaultValue={settings.company_city}
            className={inputClass}
          />
        </Field>

        <Field label="Pays">
          <input
            name="company_country"
            defaultValue={settings.company_country}
            className={inputClass}
          />
        </Field>

        <Field label="Téléphone 1">
          <input
            name="company_phone_1"
            defaultValue={settings.company_phone_1}
            className={inputClass}
          />
        </Field>

        <Field label="Téléphone 2">
          <input
            name="company_phone_2"
            defaultValue={settings.company_phone_2}
            className={inputClass}
          />
        </Field>

        <Field label="Email 1">
          <input
            type="email"
            name="company_email_1"
            defaultValue={settings.company_email_1}
            className={inputClass}
          />
        </Field>

        <Field label="Email 2">
          <input
            type="email"
            name="company_email_2"
            defaultValue={settings.company_email_2}
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Adresse complète">
            <input
              name="company_address"
              defaultValue={settings.company_address}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <SaveButton status={status} error={error} />
    </form>
  );
}