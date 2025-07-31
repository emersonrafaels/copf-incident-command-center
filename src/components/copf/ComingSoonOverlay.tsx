import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Calendar, Eye, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComingSoonOverlayProps {
  title: string
  description: string
  version: string
  releaseDate: string
  features?: string[]
  className?: string
  children: React.ReactNode
}

export function ComingSoonOverlay({ 
  title, 
  description, 
  version, 
  releaseDate, 
  features = [],
  className,
  children 
}: ComingSoonOverlayProps) {
  const [showPreview, setShowPreview] = useState(false)

  if (showPreview) {
    return (
      <div className={cn("relative", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("relative min-h-[600px]", className)}>
      {/* Background content (blurred) */}
      <div className="opacity-20 blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-20 p-6 bg-background/60 backdrop-blur-sm">
        <Card className="max-w-md w-full border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Calendar className="mr-1 h-3 w-3" />
                {version}
              </Badge>
            </div>

            {features.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">Funcionalidades em desenvolvimento:</h4>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}