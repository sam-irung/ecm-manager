'use server';

import { prisma } from '@/lib/prisma';

export async function getAllExpenses() {
  return prisma.expense.findMany({
    orderBy: { date: 'desc' },
    include: {
      project: {
        select: {
          id: true,
          projectCode: true,
          name: true,
          client: { select: { name: true } },
        },
      },
    },
  });
}