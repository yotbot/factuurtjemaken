"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";

export default function InstellingenPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_website: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    country: "Nederland",
    kvk_number: "",
    btw_number: "",
    iban: "",
    bank_name: "",
    default_payment_terms: 30,
    invoice_prefix: "INV",
    invoice_next_number: 1,
    quote_prefix: "OFF",
    quote_next_number: 1,
    default_btw_rate: 21,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name || "",
        company_email: settings.company_email || "",
        company_phone: settings.company_phone || "",
        company_website: settings.company_website || "",
        address_line1: settings.address_line1 || "",
        address_line2: settings.address_line2 || "",
        postal_code: settings.postal_code || "",
        city: settings.city || "",
        country: settings.country || "Nederland",
        kvk_number: settings.kvk_number || "",
        btw_number: settings.btw_number || "",
        iban: settings.iban || "",
        bank_name: settings.bank_name || "",
        default_payment_terms: settings.default_payment_terms,
        invoice_prefix: settings.invoice_prefix || "INV",
        invoice_next_number: settings.invoice_next_number,
        quote_prefix: settings.quote_prefix || "OFF",
        quote_next_number: settings.quote_next_number,
        default_btw_rate: settings.default_btw_rate,
      });
      setLogoUrl(settings.logo_url);
    }
  }, [settings]);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("logos").upload(filePath, file);

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(filePath);
      setLogoUrl(publicUrl);
      await saveSettings({ logo_url: publicUrl });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await saveSettings({
      ...form,
      company_phone: form.company_phone || null,
      company_website: form.company_website || null,
      address_line2: form.address_line2 || null,
      bank_name: form.bank_name || null,
    });

    setSaving(false);
    if (result?.error) {
      setMessage("Fout bij opslaan. Probeer het opnieuw.");
    } else {
      setMessage("Instellingen opgeslagen.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Instellingen" />
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Instellingen" description="Beheer je bedrijfsgegevens en voorkeuren" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {message && (
          <div className={`text-sm px-4 py-3 rounded-lg ${message.includes("Fout") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {/* Logo */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Logo</h2>
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded border border-gray-200" />
              <button
                type="button"
                onClick={async () => {
                  setLogoUrl(null);
                  await saveSettings({ logo_url: null });
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Verwijderen
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-gray-400 w-full"
              >
                Klik om een logo te uploaden
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          )}
        </Card>

        {/* Bedrijfsgegevens */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Bedrijfsgegevens</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bedrijfsnaam" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} required />
              <Input label="E-mail" type="email" value={form.company_email} onChange={(e) => update("company_email", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Telefoon" value={form.company_phone} onChange={(e) => update("company_phone", e.target.value)} />
              <Input label="Website" value={form.company_website} onChange={(e) => update("company_website", e.target.value)} />
            </div>
            <Input label="Adresregel 1" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} required />
            <Input label="Adresregel 2" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Postcode" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required />
              <Input label="Plaats" value={form.city} onChange={(e) => update("city", e.target.value)} required />
              <Input label="Land" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="KVK-nummer" value={form.kvk_number} onChange={(e) => update("kvk_number", e.target.value)} />
              <Input label="BTW-nummer" value={form.btw_number} onChange={(e) => update("btw_number", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="IBAN" value={form.iban} onChange={(e) => update("iban", e.target.value)} />
              <Input label="Banknaam" value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Nummering */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Nummering & Standaarden</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Factuur prefix" value={form.invoice_prefix} onChange={(e) => update("invoice_prefix", e.target.value)} />
              <Input label="Volgend factuurnummer" type="number" value={String(form.invoice_next_number)} onChange={(e) => update("invoice_next_number", parseInt(e.target.value) || 1)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Offerte prefix" value={form.quote_prefix} onChange={(e) => update("quote_prefix", e.target.value)} />
              <Input label="Volgend offertenummer" type="number" value={String(form.quote_next_number)} onChange={(e) => update("quote_next_number", parseInt(e.target.value) || 1)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Betalingstermijn (dagen)" type="number" value={String(form.default_payment_terms)} onChange={(e) => update("default_payment_terms", parseInt(e.target.value) || 30)} />
              <Input label="Standaard BTW-tarief (%)" type="number" value={String(form.default_btw_rate)} onChange={(e) => update("default_btw_rate", parseFloat(e.target.value) || 21)} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
