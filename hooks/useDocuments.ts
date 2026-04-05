"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentType, DocumentWithClient, DocumentFull, DocumentLineForm } from "@/lib/types";

export function useDocuments(type?: DocumentType) {
  const [documents, setDocuments] = useState<DocumentWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("documents")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data } = await query;
    setDocuments((data as DocumentWithClient[]) ?? []);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return { documents, loading, reload: loadDocuments };
}

export function useDocument(id: string) {
  const [document, setDocument] = useState<DocumentFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: doc } = await supabase
        .from("documents")
        .select("*, client:clients(*)")
        .eq("id", id)
        .single();

      if (doc) {
        const { data: lines } = await supabase
          .from("document_lines")
          .select("*")
          .eq("document_id", id)
          .order("sort_order");

        setDocument({
          ...doc,
          client: doc.client,
          lines: lines ?? [],
        } as DocumentFull);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return { document, loading };
}

export async function saveDocument(
  docData: {
    id?: string;
    client_id: string;
    type: DocumentType;
    status: string;
    issue_date: string;
    due_date: string;
    notes: string;
    footer_text: string;
    linked_quote_id?: string | null;
  },
  lines: DocumentLineForm[]
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  // Calculate totals
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const btwAmount = lines.reduce(
    (sum, l) => sum + l.quantity * l.unit_price * (l.btw_rate / 100),
    0
  );
  const total = subtotal + btwAmount;

  let documentId = docData.id;

  if (documentId) {
    // Auto-fix TEMP document numbers on edit
    const updatePayload: Record<string, unknown> = {
      client_id: docData.client_id,
      status: docData.status,
      issue_date: docData.issue_date,
      due_date: docData.due_date,
      notes: docData.notes || null,
      footer_text: docData.footer_text || null,
      subtotal,
      btw_amount: btwAmount,
      total,
    };

    const { data: existing } = await supabase
      .from("documents")
      .select("document_number")
      .eq("id", documentId)
      .single();

    if (existing?.document_number?.endsWith("-TEMP")) {
      const { data: docNumber } = await supabase.rpc("generate_document_number", {
        p_user_id: user.id,
        p_type: docData.type,
      });
      if (docNumber) updatePayload.document_number = docNumber;
    }

    await supabase.from("documents").update(updatePayload).eq("id", documentId);

    // Delete old lines and re-insert
    await supabase.from("document_lines").delete().eq("document_id", documentId);
  } else {
    // Generate document number
    const { data: docNumber, error: rpcError } = await supabase.rpc("generate_document_number", {
      p_user_id: user.id,
      p_type: docData.type,
    });

    if (rpcError || !docNumber) {
      throw new Error("Kon geen factuurnummer genereren. Sla eerst je instellingen op.");
    }

    // Create new document
    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        client_id: docData.client_id,
        type: docData.type,
        document_number: docNumber,
        status: docData.status,
        issue_date: docData.issue_date,
        due_date: docData.due_date,
        notes: docData.notes || null,
        footer_text: docData.footer_text || null,
        linked_quote_id: docData.linked_quote_id || null,
        subtotal,
        btw_amount: btwAmount,
        total,
      })
      .select()
      .single();

    if (error || !newDoc) throw error ?? new Error("Document niet aangemaakt");
    documentId = newDoc.id;
  }

  // Insert lines
  if (lines.length > 0) {
    await supabase.from("document_lines").insert(
      lines.map((line, index) => ({
        document_id: documentId!,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        btw_rate: line.btw_rate,
        line_total: line.quantity * line.unit_price,
        sort_order: index,
      }))
    );
  }

  return documentId;
}

export async function updateDocumentStatus(id: string, status: string) {
  const supabase = createClient();
  const updates: Record<string, unknown> = { status };

  if (status === "betaald") {
    updates.paid_date = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase.from("documents").update(updates).eq("id", id);
  return { error };
}

export async function convertQuoteToInvoice(quoteId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  // Get the quote with lines
  const { data: quote } = await supabase
    .from("documents")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (!quote) throw new Error("Offerte niet gevonden");

  const { data: lines } = await supabase
    .from("document_lines")
    .select("*")
    .eq("document_id", quoteId)
    .order("sort_order");

  // Generate invoice number
  const { data: docNumber } = await supabase.rpc("generate_document_number", {
    p_user_id: user.id,
    p_type: "invoice" as DocumentType,
  });

  // Get payment terms
  const { data: settings } = await supabase
    .from("settings")
    .select("default_payment_terms")
    .eq("user_id", user.id)
    .single();

  const issueDate = new Date().toISOString().split("T")[0];
  const dueDate = new Date(
    Date.now() + (settings?.default_payment_terms ?? 30) * 86400000
  )
    .toISOString()
    .split("T")[0];

  // Create invoice
  const { data: invoice, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      client_id: quote.client_id,
      type: "invoice" as DocumentType,
      document_number: docNumber ?? "INV-TEMP",
      status: "concept",
      linked_quote_id: quoteId,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal: quote.subtotal,
      btw_amount: quote.btw_amount,
      total: quote.total,
      notes: quote.notes,
      footer_text: quote.footer_text,
    })
    .select()
    .single();

  if (error || !invoice) throw error ?? new Error("Factuur niet aangemaakt");

  // Copy lines
  if (lines && lines.length > 0) {
    await supabase.from("document_lines").insert(
      lines.map((line) => ({
        document_id: invoice.id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        btw_rate: line.btw_rate,
        line_total: line.line_total,
        sort_order: line.sort_order,
      }))
    );
  }

  // Update quote status
  await supabase
    .from("documents")
    .update({ status: "geaccepteerd" })
    .eq("id", quoteId);

  return invoice.id;
}

export async function fixDocumentNumber(documentId: string, type: DocumentType): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const { data: docNumber, error } = await supabase.rpc("generate_document_number", {
    p_user_id: user.id,
    p_type: type,
  });

  if (error || !docNumber) throw new Error("Kon geen nummer genereren. Controleer je instellingen.");

  await supabase.from("documents").update({ document_number: docNumber }).eq("id", documentId);
  return docNumber;
}
