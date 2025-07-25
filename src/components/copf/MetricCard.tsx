import React, { ReactNode, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: ReactNode
  description?: string
  className?: string
  onClick?: () => void
  clickable?: boolean
}

export const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  description,
  className,
  onClick,
  clickable = false
}: MetricCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType]

  return (
    <Card 
      className={cn(
        "hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02]",
        clickable && "cursor-pointer hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {isNaN(Number(value)) ? "—" : Number(value).toLocaleString()}
        </div>
        <div className="flex items-center justify-between">
          {change && (
            <p className={cn("text-xs", changeColor)}>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {clickable && (
          <div className="text-xs text-primary mt-2 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
            ↗ Clique para filtrar ocorrências
          </div>
        )}
      </CardContent>
    </Card>
  )
})