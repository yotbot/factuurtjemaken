import { Badge } from "./Badge";
import {
  QUOTE_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
} from "@/lib/constants";
import type { DocumentType } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  type: DocumentType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const labels = type === "quote" ? QUOTE_STATUS_LABELS : INVOICE_STATUS_LABELS;
  const label = (labels as Record<string, string>)[status] ?? status;

  return (
    <Badge variant="status" status={status}>
      {label}
    </Badge>
  );
}
