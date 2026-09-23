'use client';

import { updateCatalogue } from './actions';
import { Field, inputClass } from '@/components/settings/SettingsField';
import SaveButton from '@/components/settings/SaveButton';
import { useSettingsForm } from '@/components/settings/useSettingsForm';

export default function CatalogueForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const { status, error, handleSubmit } = useSettingsForm(updateCatalogue);

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Unité par défaut"
          hint="Utilisée quand on crée un nouveau produit"
          required
        >
          <input
            name="default_unit"
            defaultValue={settings.default_unit}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <SaveButton status={status} error={error} />
    </form>
  );
}