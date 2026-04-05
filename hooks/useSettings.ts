"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setSettings(data);
    setLoading(false);
  }

  async function saveSettings(updates: Partial<Settings>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("settings")
      .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" })
      .select()
      .single();

    if (!error && data) {
      setSettings(data);
    }
    return { data, error };
  }

  return { settings, loading, saveSettings, reload: loadSettings };
}
