"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDocument, updateDocumentStatus, convertQuoteToInvoice } from "@/hooks/useDocuments";
import { useSettings } from "@/hooks/useSettings";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DownloadPDFButton } from "@/components/documents/DownloadPDFButton";

export default function OfferteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { document: doc, loading } = useDocument(id);
  const { settings } = useSettings();
  const [converting, setConverting] = useState(false);

  async function handleStatusChange(status: string) {
    await updateDocumentStatus(id, status);
    router.refresh();
    window.location.reload();
  }

  async function handleConvertToInvoice() {
    setConverting(true);
    try {
      const invoiceId = await convertQuoteToInvoice(id);
      router.push(`/facturen/${invoiceId}/bewerken`);
    } catch {
      setConverting(false);
    }
  }

  if (loading || !doc) {
    return (
      <div>
        <PageHeader title="Offerte" />
        <p className="text-gray-500">{loading ? "Laden..." : "Offerte niet gevonden."}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={doc.document_number}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={doc.status} type="quote" />
            {doc.status === "concept" && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange("verzonden")}>
                Markeer als verzonden
              </Button>
            )}
            {(doc.status === "concept" || doc.status === "verzonden") && (
              <Button size="sm" onClick={handleConvertToInvoice} disabled={converting}>
                {converting ? "Omzetten..." : "Omzetten naar factuur"}
              </Button>
            )}
            <DownloadPDFButton document={doc} settings={settings} />
            <Link href={`/offertes/${id}/bewerken`}>
              <Button variant="secondary" size="sm">Bewerken</Button>
            </Link>
          </div>
        }
      />

      <div className="bg-gray-100 rounded-xl p-8 print:p-0 print:bg-white print:rounded-none">
        <DocumentPreview document={doc} settings={settings} />
      </div>
    </div>
  );
}
