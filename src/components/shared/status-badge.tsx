import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  READY: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PICKED_UP: "bg-purple-100 text-purple-800 border-purple-200",
  IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  DISPUTED: "bg-orange-100 text-orange-800 border-orange-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        STATUS_STYLES[status] || "bg-gray-100 text-gray-800 border-gray-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
