"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("company_name");
    setClients(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function createClientRecord(client: Omit<Client, "id" | "user_id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Niet ingelogd") };

    const { data, error } = await supabase
      .from("clients")
      .insert({ ...client, user_id: user.id })
      .select()
      .single();

    if (!error) loadClients();
    return { data, error };
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error) loadClients();
    return { data, error };
  }

  async function deleteClient(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) loadClients();
    return { error };
  }

  return { clients, loading, createClient: createClientRecord, updateClient, deleteClient, reload: loadClients };
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      setClient(data);
      setLoading(false);
    }
    load();
  }, [id]);

  return { client, loading };
}
