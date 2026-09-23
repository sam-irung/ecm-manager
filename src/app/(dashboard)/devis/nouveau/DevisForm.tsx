'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  UserPlus,
  X,
} from 'lucide-react';
import { createQuote, createQuickClient } from '../actions';
import { formatFC, formatUSD } from '@/lib/format';

interface Client {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  priceFc: number;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface QuoteLine {
  id: string;
  productId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  clients: Client[];
  categories: Category[];
  defaultExchangeRate: number;
  defaultUnit: string;
}

export default function DevisForm({
  clients,
  categories,
  defaultExchangeRate,
  defaultUnit,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Infos générales
  const [clientId, setClientId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Finances
  const [exchangeRate, setExchangeRate] = useState(defaultExchangeRate);
  const [laborCostUsd, setLaborCostUsd] = useState(0);
  const [transportUsd, setTransportUsd] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Lignes
  const [lines, setLines] = useState<QuoteLine[]>([
    {
      id: crypto.randomUUID(),
      productId: null,
      description: '',
      unit: defaultUnit,
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  // Création rapide de client
  const [localClients, setLocalClients] = useState<Client[]>(clients);
  const [quickClientMode, setQuickClientMode] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);

  // ============================================
  // CALCULS
  // ============================================
  const totals = useMemo(() => {
    const itemsTotal = lines.reduce(
      (sum, l) => sum + l.quantity * l.unitPrice,
      0
    );
    const subtotal = itemsTotal;
    const totalFc = subtotal - discount;
    const totalUsd = totalFc / exchangeRate + laborCostUsd + transportUsd;
    return { subtotal, totalFc, totalUsd };
  }, [lines, discount, exchangeRate, laborCostUsd, transportUsd]);

  // ============================================
  // GESTION DES LIGNES
  // ============================================
  function addLine() {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        productId: null,
        description: '',
        unit: defaultUnit,
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeLine(id: string) {
    if (lines.length === 1) return;
    setLines(lines.filter((l) => l.id !== id));
  }

  function updateLine(id: string, updates: Partial<QuoteLine>) {
    setLines(lines.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }

  function selectProduct(lineId: string, productId: string) {
    if (!productId) {
      updateLine(lineId, { productId: null });
      return;
    }

    let product: Product | undefined;
    for (const cat of categories) {
      product = cat.products.find((p) => p.id === productId);
      if (product) break;
    }

    if (product) {
      updateLine(lineId, {
        productId: product.id,
        description: product.name,
        unit: product.unit,
        unitPrice: product.priceFc,
      });
    }
  }

  // ============================================
  // CRÉATION RAPIDE DE CLIENT
  // ============================================
  async function handleQuickClient() {
    setQuickSaving(true);
    setError(null);

    const result = await createQuickClient({
      name: quickName,
      phone: quickPhone,
    });

    if (result?.error) {
      setError(result.error);
      setQuickSaving(false);
      return;
    }

    if (result?.success && result.client) {
      setLocalClients([...localClients, result.client]);
      setClientId(result.client.id);
      setQuickClientMode(false);
      setQuickName('');
      setQuickPhone('');
    }
    setQuickSaving(false);
  }

  // ============================================
  // SOUMISSION
  // ============================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError('Veuillez sélectionner un client ou en créer un nouveau');
      return;
    }

    if (!projectName.trim()) {
      setError('Veuillez saisir le nom du projet');
      return;
    }

    const validLines = lines.filter(
      (l) => l.description.trim() && l.quantity > 0
    );

    if (validLines.length === 0) {
      setError('Ajoutez au moins une ligne valide');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append(
      'data',
      JSON.stringify({
        clientId,
        projectName,
        siteLocation,
        notes,
        exchangeRate,
        laborCostUsd,
        transportUsd,
        discount,
        items: validLines.map((l) => ({
          description: l.description,
          unit: l.unit,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      })
    );

    const result = await createQuote(formData);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (result?.success && result.id) {
      router.push(`/devis/${result.id}`);
    }
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/devis"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ecm-blue transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Retour aux devis
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
          <FileText size={28} />
          Nouveau devis
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Remplissez les informations ci-dessous pour créer un devis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* SECTION 1 : INFOS GÉNÉRALES */}
        <Section title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CLIENT */}
            <div className="md:col-span-2">
              {!quickClientMode ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className={inputClass + ' flex-1'}
                    >
                      <option value="">— Sélectionner un client —</option>
                      {localClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickClientMode(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-ecm-blue hover:bg-ecm-blue/90 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      <UserPlus size={16} />
                      <span className="hidden sm:inline">Nouveau</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-ecm-blue/5 border border-ecm-blue/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-ecm-blue">
                      Création rapide d'un client
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickClientMode(false);
                        setQuickName('');
                        setQuickPhone('');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Nom complet *"
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      placeholder="Téléphone *"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={handleQuickClient}
                      disabled={
                        quickSaving || !quickName.trim() || !quickPhone.trim()
                      }
                      className="flex items-center gap-2 bg-ecm-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <UserPlus size={16} />
                      {quickSaving ? 'Création...' : 'Créer et sélectionner'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Le client sera enregistré avec le type "Particulier".
                    Modifiable ensuite dans la page Clients.
                  </p>
                </div>
              )}
            </div>

            <Field label="Nom du projet" required>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="Ex : Faux plafond + décoration"
                className={inputClass}
              />
            </Field>

            <Field label="Lieu du chantier">
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="Ex : Lubumbashi, Golf"
                className={inputClass}
              />
            </Field>

            <Field label="Taux de change (1 USD = ? FC)" required>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) =>
                  setExchangeRate(parseFloat(e.target.value) || 0)
                }
                required
                min="1"
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Notes internes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observations, remarques..."
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* SECTION 2 : LIGNES */}
        <Section title="Articles / Prestations">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                    Produit
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase w-20">
                    Unité
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase w-24">
                    Qté
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase w-32">
                    Prix U. (FC)
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase w-32">
                    Total
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(line.id, { description: e.target.value })
                        }
                        placeholder="Description..."
                        className="w-full px-2 py-1.5 text-sm border border-transparent hover:border-gray-200 focus:border-ecm-orange focus:outline-none rounded transition-colors"
                      />
                      <select
                        value={line.productId ?? ''}
                        onChange={(e) => selectProduct(line.id, e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-xs text-gray-500 border-none focus:outline-none bg-transparent cursor-pointer"
                      >
                        <option value="">
                          — Choisir depuis le catalogue —
                        </option>
                        {categories.map((cat) => (
                          <optgroup key={cat.id} label={cat.name}>
                            {cat.products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({formatFC(p.priceFc)})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={line.unit}
                        onChange={(e) =>
                          updateLine(line.id, { unit: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.id, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(line.id, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                        step="1"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none text-right"
                      />
                    </td>
                    <td className="py-2 px-2 text-right text-sm font-medium text-ecm-blue">
                      {formatFC(line.quantity * line.unitPrice)}
                    </td>
                    <td className="py-2 px-1">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {lines.map((line) => (
              <div
                key={line.id}
                className="bg-gray-50 rounded-lg p-3 space-y-2"
              >
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) =>
                    updateLine(line.id, { description: e.target.value })
                  }
                  placeholder="Description..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                />
                <select
                  value={line.productId ?? ''}
                  onChange={(e) => selectProduct(line.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded bg-white focus:border-ecm-orange focus:outline-none"
                >
                  <option value="">— Catalogue —</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatFC(p.priceFc)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={line.unit}
                    onChange={(e) =>
                      updateLine(line.id, { unit: e.target.value })
                    }
                    placeholder="Unité"
                    className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                  />
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.id, {
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    placeholder="Qté"
                    className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                  />
                  <input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) =>
                      updateLine(line.id, {
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    placeholder="Prix"
                    className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">Total ligne</span>
                  <span className="text-sm font-bold text-ecm-blue">
                    {formatFC(line.quantity * line.unitPrice)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed py-1"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-ecm-orange hover:text-orange-700 transition-colors"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </Section>

        {/* SECTION 3 : FINANCES */}
        <Section title="Main-d'œuvre et frais">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Main-d'œuvre (USD)">
              <input
                type="number"
                value={laborCostUsd}
                onChange={(e) =>
                  setLaborCostUsd(parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                className={inputClass}
              />
            </Field>
            <Field label="Transport (USD)">
              <input
                type="number"
                value={transportUsd}
                onChange={(e) =>
                  setTransportUsd(parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                className={inputClass}
              />
            </Field>
            <Field label="Remise (FC)">
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* SECTION 4 : RÉCAPITULATIF */}
        <div className="bg-ecm-blue text-white rounded-xl p-5 sm:p-6 shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
            Récapitulatif
          </h3>
          <div className="space-y-2 text-sm">
            <Row
              label="Sous-total articles"
              value={formatFC(totals.subtotal)}
            />
            {discount > 0 && (
              <Row label="Remise" value={`- ${formatFC(discount)}`} />
            )}
            <Row label="Total FC" value={formatFC(totals.totalFc)} bold />
            {laborCostUsd > 0 && (
              <Row label="Main-d'œuvre" value={formatUSD(laborCostUsd)} />
            )}
            {transportUsd > 0 && (
              <Row label="Transport" value={formatUSD(transportUsd)} />
            )}
            <div className="pt-3 mt-3 border-t border-white/20">
              <Row
                label="TOTAL USD (équivalent)"
                value={formatUSD(totals.totalUsd)}
                bold
                highlight
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
          <Link
            href="/devis"
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer le devis'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// UI HELPERS
// ============================================
const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

const textareaClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all resize-none';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`${bold ? 'font-semibold' : 'text-white/70'} ${
          highlight ? 'text-ecm-orange' : ''
        }`}
      >
        {label}
      </span>
      <span
        className={`${bold ? 'font-bold text-base' : ''} ${
          highlight ? 'text-ecm-orange' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}