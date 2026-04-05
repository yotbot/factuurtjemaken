"use client";

import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";

export default function KlantenPage() {
  const { clients, loading } = useClients();

  return (
    <div>
      <PageHeader
        title="Klanten"
        description={`${clients.length} klanten`}
        actions={
          <Link href="/klanten/nieuw">
            <Button>Nieuwe klant</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : clients.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Nog geen klanten. Maak je eerste klant aan.
          </p>
        </Card>
      ) : (
        <Card padding={false}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Bedrijfsnaam</TableHeader>
                <TableHeader>Contactpersoon</TableHeader>
                <TableHeader>E-mail</TableHeader>
                <TableHeader>Plaats</TableHeader>
                <TableHeader className="w-20" />
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-gray-900">
                    <Link href={`/klanten/${client.id}`} className="hover:underline">
                      {client.company_name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.contact_person}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>
                    <Link href={`/klanten/${client.id}/bewerken`}>
                      <Button variant="ghost" size="sm">
                        Bewerken
                      </Button>
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
