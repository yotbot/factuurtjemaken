"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function NieuweFactuurPage() {
  return (
    <div>
      <PageHeader title="Nieuwe factuur" />
      <DocumentForm type="invoice" />
    </div>
  );
}
