'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { createClient } from '../actions';

export default function NewClientPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await createClient(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ecm-blue transition-colors mb-3 sm:mb-4"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
          <UserPlus size={28} />
          Nouveau client
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Remplissez les informations pour créer un nouveau client.
        </p>
      </div>

      {/* Formulaire */}
      <form
        action={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Nom */}
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex : Jean Mukendi"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="+243 XXX XXX XXX"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="client@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all"
            />
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Ex : Lubumbashi, Golf"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all"
            />
          </div>

          {/* Type */}
          <div className="md:col-span-2">
            <label
              htmlFor="type"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Type de client <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue="Particulier"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all bg-white"
            >
              <option value="Particulier">Particulier</option>
              <option value="Entreprise">Entreprise</option>
              <option value="Commerce">Commerce</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Notes internes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/clients"
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer le client'}
          </button>
        </div>
      </form>
    </div>
  );
}