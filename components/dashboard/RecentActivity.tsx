"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatBedrag, formatDatumKort } from "@/lib/utils";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import type { DocumentWithClient } from "@/lib/types";

interface RecentActivityProps {
  documents: DocumentWithClient[];
}

export function RecentActivity({ documents }: RecentActivityProps) {
  return (
    <Card padding={false}>
      <CardHeader className="px-6 pt-6">
        <CardTitle>Recente activiteit</CardTitle>
      </CardHeader>
      {documents.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-gray-500">
          Nog geen documenten aangemaakt.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => {
            const href =
              doc.type === "invoice"
                ? `/facturen/${doc.id}`
                : `/offertes/${doc.id}`;

            return (
              <Link
                key={doc.id}
                href={href}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.document_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {DOCUMENT_TYPE_LABELS[doc.type]} &middot;{" "}
                      {doc.client?.company_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={doc.status} type={doc.type} />
                  <span className="text-sm font-medium text-gray-900 tabular-nums w-24 text-right">
                    {formatBedrag(doc.total)}
                  </span>
                  <span className="text-xs text-gray-400 w-20 text-right">
                    {formatDatumKort(doc.issue_date)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
