"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Client } from "@/lib/types";

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: Omit<Client, "id" | "user_id" | "created_at" | "updated_at">) => Promise<{ error?: unknown }>;
}

export function ClientForm({ client, onSubmit }: ClientFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: client?.company_name ?? "",
    contact_person: client?.contact_person ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address_line1: client?.address_line1 ?? "",
    address_line2: client?.address_line2 ?? "",
    postal_code: client?.postal_code ?? "",
    city: client?.city ?? "",
    country: client?.country ?? "Nederland",
    kvk_number: client?.kvk_number ?? "",
    btw_number: client?.btw_number ?? "",
    notes: client?.notes ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const result = await onSubmit({
      company_name: form.company_name,
      contact_person: form.contact_person || null,
      email: form.email,
      phone: form.phone || null,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || null,
      postal_code: form.postal_code,
      city: form.city,
      country: form.country,
      kvk_number: form.kvk_number || null,
      btw_number: form.btw_number || null,
      notes: form.notes || null,
    });

    setSaving(false);
    if (result.error) {
      const msg = result.error instanceof Error
        ? result.error.message
        : typeof result.error === "object" && result.error !== null && "message" in result.error
          ? String((result.error as { message: string }).message)
          : "Fout bij opslaan. Probeer het opnieuw.";
      setError(msg);
    } else {
      router.push("/klanten");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Klantgegevens</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bedrijfsnaam" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} required />
            <Input label="Contactpersoon" value={form.contact_person} onChange={(e) => update("contact_person", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            <Input label="Telefoon" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <Input label="Adresregel 1" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} />
          <Input label="Adresregel 2" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Postcode" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
            <Input label="Plaats" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <Input label="Land" value={form.country} onChange={(e) => update("country", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="KVK-nummer" value={form.kvk_number} onChange={(e) => update("kvk_number", e.target.value)} />
            <Input label="BTW-nummer" value={form.btw_number} onChange={(e) => update("btw_number", e.target.value)} />
          </div>
          <Textarea label="Notities" value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}
