'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================
// LECTURE
// ============================================
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      products: {
        orderBy: { name: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: { orderBy: { name: 'asc' } },
    },
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

// ============================================
// CATÉGORIES
// ============================================
const categorySchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire'),
  icon: z.string().optional().default(''),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createCategory(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    icon: (formData.get('icon') as string) || '',
    order: formData.get('order') || 0,
  };

  const parsed = categorySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Vérifier unicité
  const existing = await prisma.category.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: 'Une catégorie avec ce nom existe déjà.' };
  }

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      icon: parsed.data.icon || null,
      order: parsed.data.order,
    },
  });

  revalidatePath('/catalogue');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    icon: (formData.get('icon') as string) || '',
    order: formData.get('order') || 0,
  };

  const parsed = categorySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Vérifier unicité (hors cette catégorie)
  const existing = await prisma.category.findFirst({
    where: {
      name: parsed.data.name,
      NOT: { id },
    },
  });
  if (existing) {
    return { error: 'Une autre catégorie a déjà ce nom.' };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      icon: parsed.data.icon || null,
      order: parsed.data.order,
    },
  });

  revalidatePath('/catalogue');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return { error: 'Catégorie introuvable' };

  if (category._count.products > 0) {
    return {
      error: `Impossible de supprimer : ${category._count.products} produit(s) sont liés à cette catégorie. Supprimez ou déplacez-les d'abord.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath('/catalogue');
  return { success: true };
}

// ============================================
// PRODUITS
// ============================================
const productSchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire'),
  description: z.string().optional().default(''),
  unit: z.string().min(1, "L'unité est obligatoire"),
  priceFc: z.coerce.number().min(0, 'Le prix doit être positif'),
  priceUsd: z
    .union([z.coerce.number().min(0), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v)),
  categoryId: z.string().min(1, 'Catégorie requise'),
  active: z.coerce.boolean().default(true),
});

export async function createProduct(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || '',
    unit: (formData.get('unit') as string) || 'pièce',
    priceFc: formData.get('priceFc') || 0,
    priceUsd: formData.get('priceUsd') || '',
    categoryId: formData.get('categoryId') as string,
    active: formData.get('active') === 'on',
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      unit: parsed.data.unit,
      priceFc: parsed.data.priceFc,
      priceUsd: parsed.data.priceUsd,
      categoryId: parsed.data.categoryId,
      active: parsed.data.active,
    },
  });

  revalidatePath('/catalogue');
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || '',
    unit: (formData.get('unit') as string) || 'pièce',
    priceFc: formData.get('priceFc') || 0,
    priceUsd: formData.get('priceUsd') || '',
    categoryId: formData.get('categoryId') as string,
    active: formData.get('active') === 'on',
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      unit: parsed.data.unit,
      priceFc: parsed.data.priceFc,
      priceUsd: parsed.data.priceUsd,
      categoryId: parsed.data.categoryId,
      active: parsed.data.active,
    },
  });

  revalidatePath('/catalogue');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { quoteItems: true },
      },
    },
  });

  if (!product) return { error: 'Produit introuvable' };

  if (product._count.quoteItems > 0) {
    return {
      error: `Impossible de supprimer : ce produit est utilisé dans ${product._count.quoteItems} ligne(s) de devis. Désactivez-le plutôt.`,
    };
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath('/catalogue');
  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean) {
  await prisma.product.update({
    where: { id },
    data: { active },
  });
  revalidatePath('/catalogue');
  return { success: true };
}