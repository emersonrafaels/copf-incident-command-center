import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "critical" | "high" | "medium" | "low" | "resolved" | "active" | "pending"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig = {
  critical: {
    label: "Crítico",
    variant: "destructive" as const,
    className: "bg-destructive/10 text-destructive border-destructive/20"
  },
  high: {
    label: "Alto",
    variant: "destructive" as const,
    className: "bg-warning/10 text-warning border-warning/20"
  },
  medium: {
    label: "Médio", 
    variant: "default" as const,
    className: "bg-primary/10 text-primary border-primary/20"
  },
  low: {
    label: "Baixo",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground"
  },
  resolved: {
    label: "Resolvido",
    variant: "secondary" as const,
    className: "bg-success/10 text-success border-success/20"
  },
  active: {
    label: "Ativo",
    variant: "default" as const,
    className: "bg-primary/10 text-primary border-primary/20"
  },
  pending: {
    label: "Pendente",
    variant: "secondary" as const,
    className: "bg-warning/10 text-warning-foreground border-warning/20"
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}