'use server';

import { prisma } from '@/lib/prisma';

export async function getAllPayments() {
  return prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
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