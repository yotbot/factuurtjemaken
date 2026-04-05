export interface Settings {
  id: string;
  user_id: string;
  company_name: string;
  company_email: string;
  company_phone: string | null;
  company_website: string | null;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  kvk_number: string;
  btw_number: string;
  iban: string;
  bank_name: string | null;
  logo_url: string | null;
  default_payment_terms: number;
  invoice_prefix: string;
  invoice_next_number: number;
  quote_prefix: string;
  quote_next_number: number;
  default_btw_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string | null;
  email: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  kvk_number: string | null;
  btw_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentType = "quote" | "invoice";

export type QuoteStatus = "concept" | "verzonden" | "geaccepteerd" | "afgewezen" | "verlopen";
export type InvoiceStatus = "concept" | "verzonden" | "betaald" | "deels_betaald" | "verlopen";
export type DocumentStatus = QuoteStatus | InvoiceStatus;

export interface Document {
  id: string;
  user_id: string;
  client_id: string;
  type: DocumentType;
  document_number: string;
  status: string;
  linked_quote_id: string | null;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  subtotal: number;
  btw_amount: number;
  total: number;
  notes: string | null;
  footer_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentLine {
  id: string;
  document_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  btw_rate: number;
  line_total: number;
  sort_order: number;
}

export interface DocumentWithClient extends Document {
  client: Client;
}

export interface DocumentWithLines extends Document {
  lines: DocumentLine[];
}

export interface DocumentFull extends Document {
  client: Client;
  lines: DocumentLine[];
}

export interface DocumentLineForm {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  btw_rate: number;
}

export interface DocumentFormData {
  client_id: string;
  type: DocumentType;
  issue_date: string;
  due_date: string;
  lines: DocumentLineForm[];
  notes: string;
  footer_text: string;
}
