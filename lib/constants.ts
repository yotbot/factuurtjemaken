import type { DocumentType, QuoteStatus, InvoiceStatus } from "./types";

export const BTW_TARIEVEN = [
  { value: 21, label: "21%" },
  { value: 9, label: "9%" },
  { value: 0, label: "0%" },
] as const;

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  quote: "Offerte",
  invoice: "Factuur",
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  concept: "Concept",
  verzonden: "Verzonden",
  geaccepteerd: "Geaccepteerd",
  afgewezen: "Afgewezen",
  verlopen: "Verlopen",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  concept: "Concept",
  verzonden: "Verzonden",
  betaald: "Betaald",
  deels_betaald: "Deels betaald",
  verlopen: "Verlopen",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  concept: { bg: "bg-gray-100", text: "text-gray-700" },
  verzonden: { bg: "bg-orange-100", text: "text-orange-700" },
  betaald: { bg: "bg-green-100", text: "text-green-700" },
  geaccepteerd: { bg: "bg-green-100", text: "text-green-700" },
  deels_betaald: { bg: "bg-yellow-100", text: "text-yellow-700" },
  afgewezen: { bg: "bg-red-100", text: "text-red-700" },
  verlopen: { bg: "bg-red-100", text: "text-red-700" },
};
