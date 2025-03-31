import { Badge } from "./badge";
import { PaymentStatus, statusLabels } from "@/types/payment";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusVariantMap: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "warning",
  [PaymentStatus.COMPLETED]: "success",
  [PaymentStatus.FAILED]: "destructive",
  [PaymentStatus.REFUNDED]: "info",
  [PaymentStatus.CANCELLED]: "secondary",
};

const statusClassMap: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  [PaymentStatus.FAILED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  [PaymentStatus.REFUNDED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
  [PaymentStatus.CANCELLED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500",
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const label = statusLabels[status] || status;
  const variant = statusVariantMap[status] || "default";
  const statusClass = statusClassMap[status];
  
  return (
    <Badge 
      variant={variant as any} 
      className={cn(
        "font-medium",
        statusClass,
        className
      )}
    >
      {label}
    </Badge>
  );
} 