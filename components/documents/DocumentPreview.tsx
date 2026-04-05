"use client";

import { Card } from "@/components/ui/Card";
import { formatBedrag, formatDatum } from "@/lib/utils";
import type { DocumentFull, Settings } from "@/lib/types";

interface DocumentPreviewProps {
  document: DocumentFull;
  settings: Settings | null;
}

export function DocumentPreview({ document: doc, settings }: DocumentPreviewProps) {
  const subtotal = doc.lines.reduce((sum, l) => sum + l.line_total, 0);
  const btwGroups = doc.lines.reduce(
    (acc, l) => {
      const btw = l.line_total * (l.btw_rate / 100);
      const existing = acc.find((g) => g.rate === l.btw_rate);
      if (existing) {
        existing.basis += l.line_total;
        existing.btw += btw;
      } else {
        acc.push({ rate: l.btw_rate, basis: l.line_total, btw });
      }
      return acc;
    },
    [] as { rate: number; basis: number; btw: number }[]
  );

  const typeLabel = doc.type === "invoice" ? "FACTUUR" : "OFFERTE";

  return (
    <div className="document-template w-[210mm] min-h-[297mm] bg-white text-gray-900 p-[20mm] mx-auto shadow-lg text-[13px] leading-relaxed font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-200">
        <div>
          {settings?.logo_url && (
            <img src={settings.logo_url} alt="Logo" className="h-14 w-auto object-contain mb-3" />
          )}
          {settings?.company_name && (
            <p className="text-lg font-semibold text-gray-900">{settings.company_name}</p>
          )}
          {settings?.address_line1 && (
            <p className="text-sm text-gray-500">{settings.address_line1}</p>
          )}
          {settings?.address_line2 && (
            <p className="text-sm text-gray-500">{settings.address_line2}</p>
          )}
          {(settings?.postal_code || settings?.city) && (
            <p className="text-sm text-gray-500">{[settings.postal_code, settings.city].filter(Boolean).join(" ")}</p>
          )}
          {settings?.company_email && (
            <p className="text-sm text-gray-500">{settings.company_email}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">
            {typeLabel}
          </p>
          <p className="text-xl font-semibold text-gray-900 tabular-nums">
            {doc.document_number}
          </p>
        </div>
      </div>

      {/* Dates + Address */}
      <div className="flex justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Aan</p>
          <p className="font-semibold">{doc.client.company_name}</p>
          {doc.client.contact_person && <p>{doc.client.contact_person}</p>}
          <p>{doc.client.address_line1}</p>
          <p>{doc.client.postal_code} {doc.client.city}</p>
        </div>
        <div className="text-right text-sm space-y-1">
          <div>
            <span className="text-gray-400">Datum: </span>
            <span>{formatDatum(doc.issue_date)}</span>
          </div>
          {doc.due_date && (
            <div>
              <span className="text-gray-400">Vervaldatum: </span>
              <span>{formatDatum(doc.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400">
            <th className="text-left py-3 font-normal">Omschrijving</th>
            <th className="text-right py-3 font-normal w-16">Aantal</th>
            <th className="text-right py-3 font-normal w-24">Prijs</th>
            <th className="text-right py-3 font-normal w-14">BTW</th>
            <th className="text-right py-3 font-normal w-24">Bedrag</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.id} className="border-b border-gray-50" style={{ breakInside: "avoid" }}>
              <td className="py-3">{line.description || "\u2014"}</td>
              <td className="text-right py-3 tabular-nums">{line.quantity}</td>
              <td className="text-right py-3 tabular-nums">{formatBedrag(line.unit_price)}</td>
              <td className="text-right py-3 text-gray-400">{line.btw_rate}%</td>
              <td className="text-right py-3 tabular-nums">{formatBedrag(line.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-400">Subtotaal</span>
            <span className="tabular-nums">{formatBedrag(subtotal)}</span>
          </div>
          {btwGroups.map((g) => (
            <div key={g.rate} className="flex justify-between py-1">
              <span className="text-gray-400">BTW {g.rate}%</span>
              <span className="tabular-nums">{formatBedrag(g.btw)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2 border-t border-gray-200 text-base font-semibold">
            <span>Totaal</span>
            <span className="tabular-nums">{formatBedrag(doc.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
        <div className="space-y-0.5">
          {settings?.iban && (
            <p>IBAN <span className="text-gray-600 font-mono">{settings.iban}</span></p>
          )}
          {settings?.btw_number && (
            <p>BTW <span className="text-gray-600">{settings.btw_number}</span></p>
          )}
          {settings?.kvk_number && (
            <p>KVK <span className="text-gray-600">{settings.kvk_number}</span></p>
          )}
        </div>
        {(doc.footer_text || doc.notes) && (
          <div className="text-right max-w-[50%]">
            {doc.notes && <p className="text-gray-500 whitespace-pre-line">{doc.notes}</p>}
            {doc.footer_text && <p className="text-gray-400 whitespace-pre-line mt-1">{doc.footer_text}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
