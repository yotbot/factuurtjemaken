"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function NieuweOffertePage() {
  return (
    <div>
      <PageHeader title="Nieuwe offerte" />
      <DocumentForm type="quote" />
    </div>
  );
}
