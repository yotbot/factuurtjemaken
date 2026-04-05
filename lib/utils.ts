export function formatBedrag(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
}

export function formatDatum(isoDate: string): string {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatDatumKort(isoDate: string): string {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function berekenVervaldatum(issueDatum: string, termijnDagen: number): string {
  const date = new Date(issueDatum);
  date.setDate(date.getDate() + termijnDagen);
  return date.toISOString().split("T")[0];
}

export function vandaag(): string {
  return new Date().toISOString().split("T")[0];
}

export function berekenRegeltotaal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function berekenBtwBedrag(lineTotal: number, btwRate: number): number {
  return lineTotal * (btwRate / 100);
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
