import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "a_iniciar" | "em_andamento" | "encerrado" | "com_impedimentos" | "cancelado"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig = {
  a_iniciar: {
    label: "A iniciar",
    variant: "secondary" as const,
    className: "bg-muted/10 text-muted-foreground border-muted/20"
  },
  em_andamento: {
    label: "Em andamento",
    variant: "secondary" as const,
    className: "bg-warning/10 text-warning border-warning/20"
  },
  encerrado: {
    label: "Encerrado",
    variant: "secondary" as const,
    className: "bg-success/10 text-success border-success/20"
  },
  com_impedimentos: {
    label: "Com impedimentos",
    variant: "secondary" as const,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  cancelado: {
    label: "Cancelado",
    variant: "secondary" as const,
    className: "bg-destructive/10 text-destructive border-destructive/20"
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