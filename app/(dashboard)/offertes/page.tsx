"use client";

import Link from "next/link";
import { useDocuments } from "@/hooks/useDocuments";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { formatBedrag, formatDatumKort } from "@/lib/utils";

export default function OffertesPage() {
  const { documents, loading } = useDocuments("quote");

  return (
    <div>
      <PageHeader
        title="Offertes"
        description={`${documents.length} offertes`}
        actions={
          <Link href="/offertes/nieuw">
            <Button>Nieuwe offerte</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : documents.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Nog geen offertes. Maak je eerste offerte aan.
          </p>
        </Card>
      ) : (
        <Card padding={false}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nummer</TableHeader>
                <TableHeader>Klant</TableHeader>
                <TableHeader>Datum</TableHeader>
                <TableHeader className="text-right">Bedrag</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="w-24" />
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-gray-900">
                    <Link href={`/offertes/${doc.id}`} className="hover:underline">
                      {doc.document_number}
                    </Link>
                  </TableCell>
                  <TableCell>{doc.client?.company_name}</TableCell>
                  <TableCell>{formatDatumKort(doc.issue_date)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatBedrag(doc.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="quote" />
                  </TableCell>
                  <TableCell>
                    <Link href={`/offertes/${doc.id}/bewerken`}>
                      <Button variant="ghost" size="sm">Bewerken</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
