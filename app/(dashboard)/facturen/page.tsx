"use client";

import Link from "next/link";
import { useDocuments } from "@/hooks/useDocuments";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { formatBedrag, formatDatumKort } from "@/lib/utils";

export default function FacturenPage() {
  const { documents, loading } = useDocuments("invoice");

  return (
    <div>
      <PageHeader
        title="Facturen"
        description={`${documents.length} facturen`}
        actions={
          <Link href="/facturen/nieuw">
            <Button>Nieuwe factuur</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : documents.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Nog geen facturen. Maak je eerste factuur aan.
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
                <TableHeader>Vervaldatum</TableHeader>
                <TableHeader className="text-right">Bedrag</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="w-24" />
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-gray-900">
                    <Link href={`/facturen/${doc.id}`} className="hover:underline">
                      {doc.document_number}
                    </Link>
                  </TableCell>
                  <TableCell>{doc.client?.company_name}</TableCell>
                  <TableCell>{formatDatumKort(doc.issue_date)}</TableCell>
                  <TableCell>{doc.due_date ? formatDatumKort(doc.due_date) : "\u2014"}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatBedrag(doc.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="invoice" />
                  </TableCell>
                  <TableCell>
                    <Link href={`/facturen/${doc.id}/bewerken`}>
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
