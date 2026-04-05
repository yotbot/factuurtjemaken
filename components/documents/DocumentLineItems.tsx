"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatBedrag } from "@/lib/utils";
import { BTW_TARIEVEN } from "@/lib/constants";
import type { DocumentLineForm } from "@/lib/types";

interface DocumentLineItemsProps {
  lines: DocumentLineForm[];
  onChange: (lines: DocumentLineForm[]) => void;
}

export function DocumentLineItems({ lines, onChange }: DocumentLineItemsProps) {
  function updateLine(index: number, field: keyof DocumentLineForm, value: string | number) {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function addLine() {
    onChange([
      ...lines,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
        btw_rate: 21,
      },
    ]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs text-gray-500 px-1">
        <span className="flex-1">Omschrijving</span>
        <span className="w-20 text-right">Aantal</span>
        <span className="w-28 text-right">Prijs</span>
        <span className="w-20 text-right">BTW</span>
        <span className="w-24 text-right">Totaal</span>
        <span className="w-8" />
      </div>

      {lines.map((line, index) => {
        const lineTotal = line.quantity * line.unit_price;
        return (
          <div key={line.id} className="flex gap-2 items-start">
            <input
              type="text"
              placeholder="Omschrijving"
              value={line.description}
              onChange={(e) => updateLine(index, "description", e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            />
            <input
              type="number"
              value={line.quantity}
              onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            />
            <input
              type="number"
              value={line.unit_price || ""}
              onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="0,00"
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            />
            <select
              value={line.btw_rate}
              onChange={(e) => updateLine(index, "btw_rate", parseFloat(e.target.value))}
              className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              {BTW_TARIEVEN.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="w-24 py-2 text-sm text-right text-gray-600 tabular-nums">
              {formatBedrag(lineTotal)}
            </span>
            <button
              type="button"
              onClick={() => removeLine(index)}
              disabled={lines.length <= 1}
              className="px-2 py-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
              title="Verwijderen"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addLine}
        className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        + Regel toevoegen
      </button>
    </div>
  );
}
