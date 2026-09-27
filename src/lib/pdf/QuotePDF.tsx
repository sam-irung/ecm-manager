import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// ============================================
// COULEURS ECM
// ============================================
const ECM_BLUE = '#0D1F4D';
const ECM_ORANGE = '#FF6A00';
const GRAY_BG = '#F5F7FA';
const GRAY_BORDER = '#E5E7EB';
const GRAY_TEXT = '#6B7280';

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#172033',
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: ECM_BLUE,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 55,
    height: 55,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
  },
  companySlogan: {
    fontSize: 8,
    color: ECM_ORANGE,
    marginTop: 1,
  },
  companyInfo: {
    fontSize: 8,
    color: GRAY_TEXT,
    marginTop: 4,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quoteTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
  },
  currencyBadge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: ECM_ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 3,
  },
  quoteNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ECM_ORANGE,
    marginTop: 4,
  },
  quoteDate: {
    fontSize: 9,
    color: GRAY_TEXT,
    marginTop: 4,
  },

  // Client section
  clientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  clientBox: {
    flex: 1,
    backgroundColor: GRAY_BG,
    padding: 10,
    borderRadius: 4,
  },
  clientLabel: {
    fontSize: 7,
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 9,
    color: '#172033',
    marginBottom: 1,
  },

  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: ECM_BLUE,
    color: 'white',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: GRAY_BG,
  },
  tableCell: {
    fontSize: 9,
    color: '#172033',
  },
  tableCellRight: {
    textAlign: 'right',
  },

  // Column widths
  colDescription: { flex: 4 },
  colUnit: { width: 55, textAlign: 'center' },
  colQuantity: { width: 45, textAlign: 'center' },
  colUnitPrice: { width: 85, textAlign: 'right' },
  colTotal: { width: 95, textAlign: 'right' },

  // Totals
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBox: {
    width: 260,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  totalsLabel: {
    fontSize: 9,
    color: GRAY_TEXT,
  },
  totalsValue: {
    fontSize: 9,
    color: '#172033',
  },
  totalsRowBold: {
    backgroundColor: GRAY_BG,
  },
  totalsLabelBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
  },
  totalsValueBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
  },
  totalsRowHighlight: {
    backgroundColor: ECM_BLUE,
    borderBottomWidth: 0,
  },
  totalsLabelHighlight: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
  },
  totalsValueHighlight: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ECM_ORANGE,
  },

  // Conditions
  conditionsSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: GRAY_BG,
    borderRadius: 4,
  },
  conditionsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ECM_BLUE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  conditionsText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },

  // Signatures
  signaturesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 20,
  },
  signatureBox: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: 8,
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 25,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF',
    paddingTop: 3,
  },
  signatureName: {
    fontSize: 8,
    color: GRAY_TEXT,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: GRAY_TEXT,
  },
  footerPage: {
    fontSize: 7,
    color: GRAY_TEXT,
  },
});

// ============================================
// PROPS
// ============================================
interface QuotePDFProps {
  quote: {
    quoteNumber: string;
    date: Date;
    validUntil: Date | null;
    projectName: string;
    siteLocation: string | null;
    currency: string;
    exchangeRate: number;
    subtotalFc: number;
    discount: number;
    laborCostUsd: number;
    transportUsd: number;
    totalFc: number;
    totalUsd: number;
    notes: string | null;
    client: {
      name: string;
      code: string;
      phone: string;
      email: string | null;
      address: string | null;
    };
    items: Array<{
      id: string;
      description: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
  settings: {
    company_name: string;
    company_full_name: string;
    company_slogan: string;
    company_city: string;
    company_country: string;
    company_phone_1: string;
    company_phone_2: string;
    company_email_1: string;
    company_email_2: string;
    company_address: string;
    quote_conditions: string;
  };
  logoUrl?: string;
}

// ============================================
// HELPERS
// ============================================
function formatFC(amount: number): string {
  return new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u202F|\u00A0/g, ' ');
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `${formatUSD(amount)} $`;
  }
  return `${formatFC(amount)} FC`;
}

// ============================================
// COMPOSANT
// ============================================
export default function QuotePDF({ quote, settings, logoUrl }: QuotePDFProps) {
  const currency = quote.currency || 'FC';
  const otherCurrency = currency === 'FC' ? 'USD' : 'FC';

  return (
    <Document
      title={`Devis ${quote.quoteNumber}`}
      author={settings.company_full_name}
      subject={`Devis pour ${quote.client.name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.companyName}>
                {settings.company_name}
              </Text>
              <Text style={styles.companySlogan}>
                {settings.company_slogan}
              </Text>
              <Text style={styles.companyInfo}>
                {settings.company_address}
                {'\n'}
                Tél : {settings.company_phone_1}
                {settings.company_phone_2 ? ` / ${settings.company_phone_2}` : ''}
                {'\n'}
                {settings.company_email_1}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.quoteTitle}>DEVIS</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            <Text style={styles.quoteDate}>
              Date : {formatDate(quote.date)}
            </Text>
            {quote.validUntil && (
              <Text style={styles.quoteDate}>
                Valide jusqu'au : {formatDate(quote.validUntil)}
              </Text>
            )}
          </View>
        </View>

        {/* CLIENT + PROJET */}
        <View style={styles.clientSection}>
          <View style={styles.clientBox}>
            <Text style={styles.clientLabel}>Client</Text>
            <Text style={styles.clientName}>{quote.client.name}</Text>
            <Text style={styles.clientDetail}>{quote.client.code}</Text>
            <Text style={styles.clientDetail}>
              Tél : {quote.client.phone}
            </Text>
            {quote.client.email && (
              <Text style={styles.clientDetail}>{quote.client.email}</Text>
            )}
            {quote.client.address && (
              <Text style={styles.clientDetail}>{quote.client.address}</Text>
            )}
          </View>

          <View style={styles.clientBox}>
            <Text style={styles.clientLabel}>Projet</Text>
            <Text style={styles.clientName}>{quote.projectName}</Text>
            {quote.siteLocation && (
              <Text style={styles.clientDetail}>
                Lieu : {quote.siteLocation}
              </Text>
            )}
            <Text style={styles.clientDetail}>
              Taux : 1 USD = {quote.exchangeRate} FC
            </Text>
          </View>
        </View>

        {/* TABLEAU DES ARTICLES */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>
              Unité
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              Qté
            </Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
              Prix U. ({currency})
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Total ({currency})
            </Text>
          </View>

          {quote.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colUnit]}>
                {item.unit}
              </Text>
              <Text style={[styles.tableCell, styles.colQuantity]}>
                {item.quantity}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colUnitPrice,
                  styles.tableCellRight,
                ]}
              >
                {formatCurrency(item.unitPrice, currency)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colTotal,
                  styles.tableCellRight,
                ]}
              >
                {formatCurrency(item.total, currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* TOTAUX */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sous-total articles</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(quote.subtotalFc, currency)}
              </Text>
            </View>

            {quote.laborCostUsd > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Main-d'œuvre</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(quote.laborCostUsd, currency)}
                </Text>
              </View>
            )}

            {quote.transportUsd > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Transport</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(quote.transportUsd, currency)}
                </Text>
              </View>
            )}

            {quote.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Remise</Text>
                <Text style={styles.totalsValue}>
                  - {formatCurrency(quote.discount, currency)}
                </Text>
              </View>
            )}

            <View style={[styles.totalsRow, styles.totalsRowBold]}>
              <Text style={styles.totalsLabelBold}>
                Total {currency}
              </Text>
              <Text style={styles.totalsValueBold}>
                {formatCurrency(quote.totalFc, currency)}
              </Text>
            </View>

            <View style={[styles.totalsRow, styles.totalsRowHighlight]}>
              <Text style={styles.totalsLabelHighlight}>
                ÉQUIVALENT {otherCurrency}
              </Text>
              <Text style={styles.totalsValueHighlight}>
                {formatCurrency(quote.totalUsd, otherCurrency)}
              </Text>
            </View>
          </View>
        </View>

        {/* NOTES */}
        {quote.notes && (
          <View style={styles.conditionsSection}>
            <Text style={styles.conditionsTitle}>Notes</Text>
            <Text style={styles.conditionsText}>{quote.notes}</Text>
          </View>
        )}

        {/* CONDITIONS */}
        {settings.quote_conditions && (
          <View style={styles.conditionsSection}>
            <Text style={styles.conditionsTitle}>
              Conditions générales
            </Text>
            <Text style={styles.conditionsText}>
              {settings.quote_conditions}
            </Text>
          </View>
        )}

        {/* SIGNATURES */}
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Pour ECM</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>
                {settings.company_full_name}
              </Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Accord client</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>
                Nom et signature
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {settings.company_full_name} — {settings.company_address}
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}