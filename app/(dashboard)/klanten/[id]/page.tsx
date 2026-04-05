"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatBedrag, formatDatumKort } from "@/lib/utils";
import type { Client, DocumentWithClient } from "@/lib/types";

export default function KlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<DocumentWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      setClient(clientData);

      const { data: docs } = await supabase
        .from("documents")
        .select("*, client:clients(*)")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

      setDocuments((docs as DocumentWithClient[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !client) {
    return (
      <div>
        <PageHeader title="Klant" />
        <p className="text-gray-500">{loading ? "Laden..." : "Klant niet gevonden."}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={client.company_name}
        actions={
          <Link href={`/klanten/${id}/bewerken`}>
            <Button variant="secondary">Bewerken</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
          {client.contact_person && <p className="text-sm">{client.contact_person}</p>}
          {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
          {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Adres</h3>
          <p className="text-sm">{client.address_line1}</p>
          {client.address_line2 && <p className="text-sm">{client.address_line2}</p>}
          <p className="text-sm">{client.postal_code} {client.city}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Zakelijk</h3>
          {client.kvk_number && <p className="text-sm">KVK: {client.kvk_number}</p>}
          {client.btw_number && <p className="text-sm">BTW: {client.btw_number}</p>}
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Documenten</h2>
      {documents.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-4">Geen documenten voor deze klant.</p>
        </Card>
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => {
              const href = doc.type === "invoice" ? `/facturen/${doc.id}` : `/offertes/${doc.id}`;
              return (
                <Link key={doc.id} href={href} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.document_number}</p>
                    <p className="text-xs text-gray-500">{doc.type === "invoice" ? "Factuur" : "Offerte"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={doc.status} type={doc.type} />
                    <span className="text-sm font-medium tabular-nums">{formatBedrag(doc.total)}</span>
                    <span className="text-xs text-gray-400">{formatDatumKort(doc.issue_date)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
