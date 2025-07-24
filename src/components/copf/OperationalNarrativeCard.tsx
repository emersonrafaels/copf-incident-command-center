import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OperationalNarrativeCardProps {
  title: string
  insight: string
  trend?: 'up' | 'down' | 'stable'
  priority?: 'high' | 'medium' | 'low'
  actionSuggestion?: string
  metric?: {
    value: string | number
    label: string
  }
  className?: string
}

export const OperationalNarrativeCard = memo(function OperationalNarrativeCard({
  title,
  insight,
  trend,
  priority = 'medium',
  actionSuggestion,
  metric,
  className
}: OperationalNarrativeCardProps) {
  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-destructive" />,
    down: <TrendingDown className="h-4 w-4 text-success" />,
    stable: <Info className="h-4 w-4 text-muted-foreground" />
  }

  const priorityConfig = {
    high: {
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'destructive' as const,
      bgClass: 'bg-destructive/5 border-destructive/20'
    },
    medium: {
      icon: <Info className="h-4 w-4" />,
      variant: 'default' as const,
      bgClass: 'bg-primary/5 border-primary/20'
    },
    low: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      variant: 'secondary' as const,
      bgClass: 'bg-muted/50 border-border'
    }
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-card-hover",
      priorityConfig[priority].bgClass,
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            {priorityConfig[priority].icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {trend && trendIcon[trend]}
            <Badge variant={priorityConfig[priority].variant} className="text-xs">
              {priority === 'high' ? 'Crítico' : priority === 'medium' ? 'Atenção' : 'Normal'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight}
        </p>

        {metric && (
          <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <span className="text-lg font-bold text-foreground">{metric.value}</span>
          </div>
        )}

        {actionSuggestion && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-primary mb-1">Ação Recomendada</p>
              <p className="text-xs text-muted-foreground">{actionSuggestion}</p>
            </div>
            <ArrowRight className="h-3 w-3 text-primary mt-1" />
          </div>
        )}
      </CardContent>
    </Card>
  )
})