import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "status";
  status?: string;
  className?: string;
}

export function Badge({ children, variant = "default", status, className }: BadgeProps) {
  const colors = status
    ? STATUS_COLORS[status] ?? STATUS_COLORS.concept
    : { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      {children}
    </span>
  );
}
