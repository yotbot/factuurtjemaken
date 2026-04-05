"use client";

import { useParams } from "next/navigation";
import { useDocument } from "@/hooks/useDocuments";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentForm } from "@/components/documents/DocumentForm";

export default function OfferteBewerkenPage() {
  const { id } = useParams<{ id: string }>();
  const { document: doc, loading } = useDocument(id);

  if (loading) {
    return (
      <div>
        <PageHeader title="Offerte bewerken" />
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`${doc?.document_number ?? "Offerte"} bewerken`} />
      <DocumentForm type="quote" document={doc} />
    </div>
  );
}
