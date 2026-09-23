import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { prisma } from '@/lib/prisma';
import { getAllSettings } from '@/lib/settings';
import QuotePDF from '@/lib/pdf/QuotePDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const shouldDownload = searchParams.get('download') === '1';

    const [quote, settings] = await Promise.all([
      prisma.quote.findUnique({
        where: { id },
        include: {
          client: true,
          items: { orderBy: { id: 'asc' } },
        },
      }),
      getAllSettings(),
    ]);

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis introuvable' },
        { status: 404 }
      );
    }

    // Charger le logo en base64
    let logoUrl: string | undefined;
    try {
      const logoPath = path.join(
        process.cwd(),
        'public',
        'images',
        'logo-ecm.png'
      );
      const logoBuffer = await fs.readFile(logoPath);
      logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch {
      // Logo absent, on continue sans
    }

    // Générer le PDF
    const pdfBuffer = await renderToBuffer(
      QuotePDF({
        quote: {
          quoteNumber: quote.quoteNumber,
          date: quote.date,
          validUntil: quote.validUntil,
          projectName: quote.projectName,
          siteLocation: quote.siteLocation,
          exchangeRate: quote.exchangeRate,
          subtotalFc: quote.subtotalFc,
          discount: quote.discount,
          laborCostUsd: quote.laborCostUsd,
          transportUsd: quote.transportUsd,
          totalFc: quote.totalFc,
          totalUsd: quote.totalUsd,
          notes: quote.notes,
          client: {
            name: quote.client.name,
            code: quote.client.code,
            phone: quote.client.phone,
            email: quote.client.email,
            address: quote.client.address,
          },
          items: quote.items.map((i) => ({
            id: i.id,
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
        },
        settings: {
          company_name: settings.company_name,
          company_full_name: settings.company_full_name,
          company_slogan: settings.company_slogan,
          company_city: settings.company_city,
          company_country: settings.company_country,
          company_phone_1: settings.company_phone_1,
          company_phone_2: settings.company_phone_2,
          company_email_1: settings.company_email_1,
          company_email_2: settings.company_email_2,
          company_address: settings.company_address,
          quote_conditions: settings.quote_conditions,
        },
        logoUrl,
      })
    );

    // Nom du fichier
    const safeClientName = quote.client.name
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${quote.quoteNumber}_${safeClientName}.pdf`;

    // inline = affiche dans le navigateur / attachment = force le téléchargement
    const disposition = shouldDownload ? 'attachment' : 'inline';

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}