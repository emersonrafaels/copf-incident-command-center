import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface OptimizedMetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  icon?: React.ReactNode
  isLoading?: boolean
  className?: string
}

// Componente de loading memoizado
const MetricCardSkeleton = memo(() => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-full" />
    </CardContent>
  </Card>
))

MetricCardSkeleton.displayName = 'MetricCardSkeleton'

// Componente principal memoizado para evitar re-renders desnecessários
const OptimizedMetricCard = memo<OptimizedMetricCardProps>(({
  title,
  value,
  description,
  trend,
  trendValue,
  variant = 'default',
  icon,
  isLoading = false,
  className
}) => {
  // Se estiver carregando, mostrar skeleton
  if (isLoading) {
    return <MetricCardSkeleton />
  }

  // Determinar cores baseadas na variante
  const variantStyles = {
    default: "border-border",
    success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
  }

  const valueStyles = {
    default: "text-foreground",
    success: "text-green-700 dark:text-green-300",
    warning: "text-yellow-700 dark:text-yellow-300",
    destructive: "text-red-700 dark:text-red-300"
  }

  // Determinar ícone de trend
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>
      case 'down':
        return <span className="text-red-500">↘</span>
      case 'stable':
        return <span className="text-gray-500">→</span>
      default:
        return null
    }
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueStyles[variant])}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {(description || trendValue) && (
          <div className="flex items-center justify-between mt-2">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            
            {trendValue && (
              <Badge 
                variant="outline" 
                className="text-xs flex items-center gap-1"
              >
                {getTrendIcon()}
                {trendValue}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

OptimizedMetricCard.displayName = 'OptimizedMetricCard'

export { OptimizedMetricCard }