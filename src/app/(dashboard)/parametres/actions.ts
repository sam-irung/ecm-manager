'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { setSettings } from '@/lib/settings';

// ============================================
// ENTREPRISE
// ============================================
const companySchema = z.object({
  company_name: z.string().min(1, 'Le nom est obligatoire'),
  company_full_name: z.string().min(1, 'Le nom complet est obligatoire'),
  company_slogan: z.string().optional().default(''),
  company_city: z.string().optional().default(''),
  company_country: z.string().optional().default(''),
  company_phone_1: z.string().optional().default(''),
  company_phone_2: z.string().optional().default(''),
  company_email_1: z.string().email('Email 1 invalide').or(z.literal('')),
  company_email_2: z.string().email('Email 2 invalide').or(z.literal('')),
  company_address: z.string().optional().default(''),
});

export async function updateCompany(formData: FormData) {
  const rawData = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
  );

  const parsed = companySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    category: 'entreprise',
  }));

  await setSettings(entries);
  revalidatePath('/parametres');
  return { success: true };
}

// ============================================
// FINANCES
// ============================================
const financesSchema = z.object({
  exchange_rate: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'Le taux doit être un nombre positif',
    }),
  default_currency: z.enum(['FC', 'USD']),
  max_discount_percent: z
    .string()
    .refine(
      (v) =>
        !isNaN(parseFloat(v)) &&
        parseFloat(v) >= 0 &&
        parseFloat(v) <= 100,
      { message: 'La remise doit être entre 0 et 100' }
    ),
});

export async function updateFinances(formData: FormData) {
  const rawData = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
  );

  const parsed = financesSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    category: 'finances',
  }));

  await setSettings(entries);
  revalidatePath('/parametres');
  revalidatePath('/');
  return { success: true };
}

// ============================================
// DEVIS
// ============================================
const devisSchema = z.object({
  quote_validity_days: z
    .string()
    .refine(
      (v) => !isNaN(parseInt(v)) && parseInt(v) > 0,
      { message: 'La validité doit être un nombre positif' }
    ),
  quote_prefix: z.string().min(1, 'Le préfixe est obligatoire'),
  quote_conditions: z.string().optional().default(''),
});

export async function updateDevis(formData: FormData) {
  const rawData = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
  );

  const parsed = devisSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    category: 'devis',
  }));

  await setSettings(entries);
  revalidatePath('/parametres');
  return { success: true };
}

// ============================================
// CATALOGUE
// ============================================
const catalogueSchema = z.object({
  default_unit: z.string().min(1, "L'unité par défaut est obligatoire"),
});

export async function updateCatalogue(formData: FormData) {
  const rawData = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
  );

  const parsed = catalogueSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
    category: 'catalogue',
  }));

  await setSettings(entries);
  revalidatePath('/parametres');
  return { success: true };
}