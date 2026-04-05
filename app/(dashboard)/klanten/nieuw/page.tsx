"use client";

import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NieuweKlantPage() {
  async function handleSubmit(data: Record<string, unknown>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Niet ingelogd") };

    const { error } = await supabase
      .from("clients")
      .insert({ ...data, user_id: user.id });

    return { error };
  }

  return (
    <div>
      <PageHeader title="Nieuwe klant" />
      <ClientForm onSubmit={handleSubmit} />
    </div>
  );
}
