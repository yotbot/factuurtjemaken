"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/Button";
import type { DocumentWithClient } from "@/lib/types";

export default function DashboardPage() {
  const [recentDocs, setRecentDocs] = useState<DocumentWithClient[]>([]);
  const [stats, setStats] = useState({
    openstaand: { aantal: 0, bedrag: 0 },
    verlopen: { aantal: 0, bedrag: 0 },
    omzetMaand: 0,
    omzetKwartaal: 0,
  });
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load settings
      const { data: settings } = await supabase
        .from("settings")
        .select("company_name")
        .eq("user_id", user.id)
        .single();

      if (settings?.company_name) setCompanyName(settings.company_name);

      // Load recent documents
      const { data: docs } = await supabase
        .from("documents")
        .select("*, client:clients(*)")
        .order("created_at", { ascending: false })
        .limit(10);

      const typedDocs = (docs as DocumentWithClient[]) ?? [];
      setRecentDocs(typedDocs);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const startOfQuarter = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        1
      )
        .toISOString()
        .split("T")[0];

      const invoices = typedDocs.filter((d) => d.type === "invoice");

      const openstaand = invoices.filter(
        (d) => d.status === "verzonden" && (!d.due_date || d.due_date >= today)
      );
      const verlopen = invoices.filter(
        (d) =>
          (d.status === "verzonden" || d.status === "deels_betaald") &&
          d.due_date &&
          d.due_date < today
      );
      const betaald = invoices.filter((d) => d.status === "betaald");
      const omzetMaand = betaald
        .filter((d) => d.paid_date && d.paid_date >= startOfMonth)
        .reduce((sum, d) => sum + d.total, 0);
      const omzetKwartaal = betaald
        .filter((d) => d.paid_date && d.paid_date >= startOfQuarter)
        .reduce((sum, d) => sum + d.total, 0);

      setStats({
        openstaand: {
          aantal: openstaand.length,
          bedrag: openstaand.reduce((s, d) => s + d.total, 0),
        },
        verlopen: {
          aantal: verlopen.length,
          bedrag: verlopen.reduce((s, d) => s + d.total, 0),
        },
        omzetMaand,
        omzetKwartaal,
      });
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title={companyName ? `Welkom, ${companyName}` : "Dashboard"}
        actions={
          <div className="flex gap-3">
            <Link href="/facturen/nieuw">
              <Button>Nieuwe factuur</Button>
            </Link>
            <Link href="/offertes/nieuw">
              <Button variant="secondary">Nieuwe offerte</Button>
            </Link>
            <Link href="/klanten/nieuw">
              <Button variant="secondary">Nieuwe klant</Button>
            </Link>
          </div>
        }
      />

      <StatsCards {...stats} />
      <RecentActivity documents={recentDocs} />
    </div>
  );
}
