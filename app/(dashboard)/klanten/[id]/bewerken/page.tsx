"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import type { Client } from "@/lib/types";

export default function KlantBewerkenPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      setClient(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(data: Record<string, unknown>) {
    const supabase = createClient();
    const { error } = await supabase.from("clients").update(data).eq("id", id);
    return { error };
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Klant bewerken" />
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Klant bewerken" />
      <ClientForm client={client} onSubmit={handleSubmit} />
    </div>
  );
}
