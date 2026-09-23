import { prisma } from './prisma';

export const DEFAULT_SETTINGS: Record<string, string> = {
  // Entreprise
  company_name: 'ECM',
  company_full_name: 'Équipe de Construction Moderne',
  company_slogan: "L'expertise fait la différence.",
  company_city: 'Lubumbashi',
  company_country: 'RDC',
  company_phone_1: '+243 853 192 622',
  company_phone_2: '+243 971 268 236',
  company_email_1: 'munyongamaymartens44@gmail.com',
  company_email_2: 'samirung65@gmail.com',
  company_address: 'Lubumbashi, RDC',

  // Finances
  exchange_rate: '2250',
  default_currency: 'FC',
  max_discount_percent: '30',

  // Devis
  quote_validity_days: '15',
  quote_prefix: 'DEV',
  quote_conditions:
    "• Validité du devis : 15 jours.\n• Délai d'exécution : à convenir selon le chantier.\n• Toute prestation supplémentaire fera l'objet d'un accord préalable.\n• Un acompte de 50% est requis avant le démarrage des travaux.",

  // Catalogue
  default_unit: 'pièce',
};

/**
 * Récupère un paramètre avec sa valeur par défaut si non défini
 */
export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? DEFAULT_SETTINGS[key] ?? '';
}

/**
 * Récupère le taux de change actuel
 */
export async function getExchangeRate(): Promise<number> {
  const value = await getSetting('exchange_rate');
  return parseFloat(value);
}

/**
 * Récupère tous les paramètres fusionnés avec les valeurs par défaut
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

/**
 * Récupère les paramètres par catégorie
 */
export async function getSettingsByCategory(
  category: string
): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({ where: { category } });
  const allDefaults = DEFAULT_SETTINGS;
  const result: Record<string, string> = {};

  // On ne garde que les clés qui appartiennent à cette catégorie
  // (mapping manuel, car on ne stocke pas la catégorie dans les defaults)
  const keysByCategory: Record<string, string[]> = {
    entreprise: [
      'company_name',
      'company_full_name',
      'company_slogan',
      'company_city',
      'company_country',
      'company_phone_1',
      'company_phone_2',
      'company_email_1',
      'company_email_2',
      'company_address',
    ],
    finances: ['exchange_rate', 'default_currency', 'max_discount_percent'],
    devis: [
      'quote_validity_days',
      'quote_prefix',
      'quote_conditions',
    ],
    catalogue: ['default_unit'],
  };

  for (const key of keysByCategory[category] ?? []) {
    result[key] = allDefaults[key];
  }
  for (const s of settings) {
    result[s.key] = s.value;
  }

  return result;
}

/**
 * Met à jour un paramètre
 */
export async function setSetting(
  key: string,
  value: string,
  category: string = 'general'
) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, category },
    create: { key, value, category },
  });
}

/**
 * Met à jour plusieurs paramètres en une fois
 */
export async function setSettings(
  entries: Array<{ key: string; value: string; category: string }>
) {
  return prisma.$transaction(
    entries.map((entry) =>
      prisma.setting.upsert({
        where: { key: entry.key },
        update: { value: entry.value, category: entry.category },
        create: entry,
      })
    )
  );
}