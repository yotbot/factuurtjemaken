"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DocumentLineItems } from "./DocumentLineItems";
import { DocumentPreview } from "./DocumentPreview";
import { formatBedrag, vandaag, berekenVervaldatum } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { saveDocument } from "@/hooks/useDocuments";
import type { DocumentType, DocumentLineForm, DocumentFull } from "@/lib/types";

interface DocumentFormProps {
  type: DocumentType;
  document?: DocumentFull | null;
}

export function DocumentForm({ type, document }: DocumentFormProps) {
  const router = useRouter();
  const { clients, loading: clientsLoading } = useClients();
  const { settings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!document;
  const typeLabel = type === "invoice" ? "factuur" : "offerte";

  const [clientId, setClientId] = useState(document?.client_id ?? "");
  const [issueDate, setIssueDate] = useState(document?.issue_date ?? vandaag());
  const [dueDate, setDueDate] = useState(document?.due_date ?? "");
  const [notes, setNotes] = useState(document?.notes ?? "");
  const [footerText, setFooterText] = useState(
    document?.footer_text ?? ""
  );
  const [lines, setLines] = useState<DocumentLineForm[]>(
    document?.lines?.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      btw_rate: l.btw_rate,
    })) ?? [
      { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, btw_rate: 21 },
    ]
  );

  // Preview number
  const [previewNumber, setPreviewNumber] = useState(document?.document_number ?? "");

  useEffect(() => {
    if (!isEdit && settings) {
      const prefix = type === "invoice" ? settings.invoice_prefix : settings.quote_prefix;
      const nextNum = type === "invoice" ? settings.invoice_next_number : settings.quote_next_number;
      const year = new Date().getFullYear();
      const number = `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
      setPreviewNumber(number);

      if (type === "invoice" && settings.default_payment_terms && issueDate) {
        setDueDate(berekenVervaldatum(issueDate, settings.default_payment_terms));
      }

      if (type === "invoice") {
        setFooterText(prev =>
          prev === ""
            ? `Wij verzoeken u vriendelijk het factuurbedrag binnen ${settings.default_payment_terms} dagen na factuurdatum over te maken onder vermelding van factuurnummer ${number}.`
            : prev
        );
      }
    }
  }, [settings, type, isEdit, issueDate]);

  // Recalculate due date when issue date changes
  useEffect(() => {
    if (!isEdit && settings && type === "invoice" && issueDate) {
      setDueDate(berekenVervaldatum(issueDate, settings.default_payment_terms));
    }
  }, [issueDate, settings, type, isEdit]);

  // Calculate totals
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const btwAmount = lines.reduce(
    (sum, l) => sum + l.quantity * l.unit_price * (l.btw_rate / 100),
    0
  );
  const total = subtotal + btwAmount;

  // Build preview document from form state
  const selectedClient = clients.find((c) => c.id === clientId);
  const previewDoc = useMemo<DocumentFull | null>(() => {
    if (!selectedClient) return null;
    return {
      id: document?.id ?? "",
      user_id: "",
      client_id: clientId,
      type,
      document_number: previewNumber,
      status: document?.status ?? "concept",
      linked_quote_id: document?.linked_quote_id ?? null,
      issue_date: issueDate,
      due_date: dueDate || null,
      paid_date: null,
      subtotal,
      btw_amount: btwAmount,
      total,
      notes: notes || null,
      footer_text: footerText || null,
      created_at: "",
      updated_at: "",
      client: selectedClient,
      lines: lines.map((l, i) => ({
        id: l.id,
        document_id: document?.id ?? "",
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        btw_rate: l.btw_rate,
        line_total: l.quantity * l.unit_price,
        sort_order: i,
      })),
    };
  }, [selectedClient, clientId, type, previewNumber, issueDate, dueDate, subtotal, btwAmount, total, notes, footerText, lines, document]);

  async function handleSave(status: string) {
    if (!clientId) {
      setError("Selecteer een klant.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const docId = await saveDocument(
        {
          id: document?.id,
          client_id: clientId,
          type,
          status,
          issue_date: issueDate,
          due_date: dueDate,
          notes,
          footer_text: footerText,
          linked_quote_id: document?.linked_quote_id,
        },
        lines
      );

      const basePath = type === "invoice" ? "/facturen" : "/offertes";
      router.push(`${basePath}/${docId}`);
    } catch {
      setError("Fout bij opslaan. Probeer het opnieuw.");
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-8">
      {/* Left: Form */}
      <div className="w-2/5 min-w-95 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Document info */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {isEdit ? `${typeLabel} bewerken` : `Nieuwe ${typeLabel}`}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nummer
                </label>
                <p className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                  {previewNumber || "Wordt automatisch toegewezen"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klant
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  required
                >
                  <option value="">Selecteer een klant...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Uitgiftedatum"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              {type === "invoice" && (
                <Input
                  label="Vervaldatum"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Lines */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Regelitems</h2>
          <DocumentLineItems lines={lines} onChange={setLines} />
        </Card>

        {/* Totals */}
        <Card>
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotaal</span>
                <span className="tabular-nums">{formatBedrag(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BTW</span>
                <span className="tabular-nums">{formatBedrag(btwAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-semibold">
                <span>Totaal</span>
                <span className="tabular-nums">{formatBedrag(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <div className="space-y-4">
            <Textarea
              label="Opmerkingen"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optionele opmerkingen..."
            />
            <Textarea
              label="Voettekst"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              rows={2}
              placeholder="Betalingsvoorwaarden..."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
            Annuleren
          </Button>
          <Button variant="secondary" onClick={() => handleSave("concept")} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan als concept"}
          </Button>
          <Button onClick={() => handleSave("verzonden")} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-6">
          {previewDoc ? (
            <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm" style={{ maxHeight: "calc(100vh - 8rem)" }}>
              <div style={{ zoom: 0.5 }}>
                <DocumentPreview document={previewDoc} settings={settings} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="text-sm text-gray-400">
                Selecteer een klant om de preview te zien
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
