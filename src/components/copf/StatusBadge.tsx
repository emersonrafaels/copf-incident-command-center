import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "pending" | "resolved"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig = {
  pending: {
    label: "Pendente",
    variant: "secondary" as const,
    className: "bg-warning/10 text-warning border-warning/20"
  },
  resolved: {
    label: "Encerrado",
    variant: "secondary" as const,
    className: "bg-success/10 text-success border-success/20"
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  // Fallback para status inválido
  if (!config) {
    console.warn(`Status inválido: ${status}`)
    return (
      <Badge 
        variant="outline"
        className={cn("bg-muted text-muted-foreground", className)}
      >
        {status || "N/A"}
      </Badge>
    )
  }
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}