"use client";

import { Card } from "@/components/ui/Card";
import { formatBedrag } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </Card>
  );
}

interface StatsCardsProps {
  openstaand: { aantal: number; bedrag: number };
  verlopen: { aantal: number; bedrag: number };
  omzetMaand: number;
  omzetKwartaal: number;
}

export function StatsCards({ openstaand, verlopen, omzetMaand, omzetKwartaal }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Openstaande facturen"
        value={formatBedrag(openstaand.bedrag)}
        sublabel={`${openstaand.aantal} facturen`}
      />
      <StatCard
        label="Verlopen facturen"
        value={formatBedrag(verlopen.bedrag)}
        sublabel={`${verlopen.aantal} facturen`}
      />
      <StatCard label="Omzet deze maand" value={formatBedrag(omzetMaand)} />
      <StatCard label="Omzet dit kwartaal" value={formatBedrag(omzetKwartaal)} />
    </div>
  );
}
