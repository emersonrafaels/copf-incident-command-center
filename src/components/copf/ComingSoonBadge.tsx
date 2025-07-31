import { Badge } from "@/components/ui/badge"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComingSoonBadgeProps {
  className?: string
  size?: "sm" | "default" | "lg"
}

export function ComingSoonBadge({ className, size = "default" }: ComingSoonBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-warning/10 text-warning border-warning/20 animate-pulse",
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
    >
      <Rocket className={cn(
        "mr-1",
        size === "sm" && "h-2.5 w-2.5",
        size === "default" && "h-3 w-3",
        size === "lg" && "h-4 w-4"
      )} />
      Futuro
    </Badge>
  )
}