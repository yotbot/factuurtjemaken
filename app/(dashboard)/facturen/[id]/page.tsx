"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDocument, updateDocumentStatus, fixDocumentNumber } from "@/hooks/useDocuments";
import { useSettings } from "@/hooks/useSettings";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DownloadPDFButton } from "@/components/documents/DownloadPDFButton";

export default function FactuurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { document: doc, loading } = useDocument(id);
  const { settings } = useSettings();
  const [fixing, setFixing] = useState(false);

  async function handleStatusChange(status: string) {
    await updateDocumentStatus(id, status);
    router.refresh();
    window.location.reload();
  }

  async function handleFixNumber() {
    if (!doc) return;
    setFixing(true);
    try {
      await fixDocumentNumber(id, doc.type);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fout bij herstellen nummer.");
      setFixing(false);
    }
  }

  if (loading || !doc) {
    return (
      <div>
        <PageHeader title="Factuur" />
        <p className="text-gray-500">{loading ? "Laden..." : "Factuur niet gevonden."}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={doc.document_number}
        actions={
          <div className="flex items-center gap-3">
            {doc.document_number.endsWith("-TEMP") && (
              <Button variant="secondary" size="sm" onClick={handleFixNumber} disabled={fixing}>
                {fixing ? "Herstellen..." : "Nummering herstellen"}
              </Button>
            )}
            <StatusBadge status={doc.status} type="invoice" />
            {doc.status === "concept" && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange("verzonden")}>
                Markeer als verzonden
              </Button>
            )}
            {(doc.status === "verzonden" || doc.status === "deels_betaald") && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange("betaald")}>
                Markeer als betaald
              </Button>
            )}
            <DownloadPDFButton document={doc} settings={settings} />
            <Link href={`/facturen/${id}/bewerken`}>
              <Button variant="secondary" size="sm">Bewerken</Button>
            </Link>
            {doc.linked_quote_id && (
              <Link href={`/offertes/${doc.linked_quote_id}`}>
                <Button variant="ghost" size="sm">Bekijk offerte</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="bg-gray-100 rounded-xl p-8 print:p-0 print:bg-white print:rounded-none">
        <DocumentPreview document={doc} settings={settings} />
      </div>
    </div>
  );
}
