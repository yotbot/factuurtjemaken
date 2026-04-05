"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { DocumentFull, Settings } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.5,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  logo: {
    height: 40,
    width: "auto",
    objectFit: "contain",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  companyEmail: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
  },
  docTypeLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#999999",
    textTransform: "uppercase",
    textAlign: "right",
  },
  docNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 2,
  },
  // Addresses + dates
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  addressLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#999999",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  addressName: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 2,
  },
  dateLabel: {
    color: "#999999",
    marginRight: 6,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 8,
    marginBottom: 4,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#999999",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f3f3",
  },
  colDescription: { flex: 1 },
  colQuantity: { width: 50, textAlign: "right" },
  colPrice: { width: 70, textAlign: "right" },
  colBtw: { width: 40, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  // Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 30,
  },
  totalsTable: {
    width: 200,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: {
    color: "#999999",
  },
  totalsFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#999999",
  },
  footerLeft: {
    maxWidth: "50%",
  },
  footerRight: {
    maxWidth: "50%",
    textAlign: "right",
  },
  footerValue: {
    color: "#666666",
  },
});

function formatBedrag(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
}

function formatDatum(isoDate: string): string {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

interface DocumentPDFProps {
  document: DocumentFull;
  settings: Settings | null;
}

export function DocumentPDF({ document: doc, settings }: DocumentPDFProps) {
  const typeLabel = doc.type === "invoice" ? "FACTUUR" : "OFFERTE";

  const btwGroups = doc.lines.reduce(
    (acc, l) => {
      const btw = l.line_total * (l.btw_rate / 100);
      const existing = acc.find((g) => g.rate === l.btw_rate);
      if (existing) {
        existing.btw += btw;
      } else {
        acc.push({ rate: l.btw_rate, btw });
      }
      return acc;
    },
    [] as { rate: number; btw: number }[]
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {settings?.logo_url && (
              <Image src={settings.logo_url} style={styles.logo} />
            )}
            {settings?.company_name && (
              <Text style={styles.companyName}>{settings.company_name}</Text>
            )}
            {settings?.address_line1 && (
              <Text style={styles.companyEmail}>{settings.address_line1}</Text>
            )}
            {settings?.address_line2 && (
              <Text style={styles.companyEmail}>{settings.address_line2}</Text>
            )}
            {(settings?.postal_code || settings?.city) && (
              <Text style={styles.companyEmail}>{[settings.postal_code, settings.city].filter(Boolean).join(" ")}</Text>
            )}
            {settings?.company_email && (
              <Text style={styles.companyEmail}>{settings.company_email}</Text>
            )}
          </View>
          <View>
            <Text style={styles.docTypeLabel}>{typeLabel}</Text>
            <Text style={styles.docNumber}>{doc.document_number}</Text>
          </View>
        </View>

        {/* Addresses + dates */}
        <View style={styles.addressSection}>
          <View>
            <Text style={styles.addressLabel}>Aan</Text>
            <Text style={styles.addressName}>{doc.client.company_name}</Text>
            {doc.client.contact_person && <Text>{doc.client.contact_person}</Text>}
            <Text>{doc.client.address_line1}</Text>
            <Text>
              {doc.client.postal_code} {doc.client.city}
            </Text>
          </View>
          <View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Datum:</Text>
              <Text>{formatDatum(doc.issue_date)}</Text>
            </View>
            {doc.due_date && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Vervaldatum:</Text>
                <Text>{formatDatum(doc.due_date)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Omschrijving</Text>
          <Text style={styles.colQuantity}>Aantal</Text>
          <Text style={styles.colPrice}>Prijs</Text>
          <Text style={styles.colBtw}>BTW</Text>
          <Text style={styles.colTotal}>Bedrag</Text>
        </View>
        {doc.lines.map((line) => (
          <View key={line.id} style={styles.tableRow} wrap={false}>
            <Text style={styles.colDescription}>{line.description || "\u2014"}</Text>
            <Text style={styles.colQuantity}>{line.quantity}</Text>
            <Text style={styles.colPrice}>{formatBedrag(line.unit_price)}</Text>
            <Text style={styles.colBtw}>{line.btw_rate}%</Text>
            <Text style={styles.colTotal}>{formatBedrag(line.line_total)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotaal</Text>
              <Text>{formatBedrag(doc.subtotal)}</Text>
            </View>
            {btwGroups.map((g) => (
              <View key={g.rate} style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>BTW {g.rate}%</Text>
                <Text>{formatBedrag(g.btw)}</Text>
              </View>
            ))}
            <View style={styles.totalsFinal}>
              <Text>Totaal</Text>
              <Text>{formatBedrag(doc.total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {settings?.iban && (
              <Text>
                IBAN <Text style={styles.footerValue}>{settings.iban}</Text>
              </Text>
            )}
            {settings?.btw_number && (
              <Text>
                BTW <Text style={styles.footerValue}>{settings.btw_number}</Text>
              </Text>
            )}
            {settings?.kvk_number && (
              <Text>
                KVK <Text style={styles.footerValue}>{settings.kvk_number}</Text>
              </Text>
            )}
          </View>
          <View style={styles.footerRight}>
            {doc.notes && <Text style={styles.footerValue}>{doc.notes}</Text>}
            {doc.footer_text && <Text>{doc.footer_text}</Text>}
          </View>
        </View>
      </Page>
    </Document>
  );
}
