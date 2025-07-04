import { MetricCard } from "./MetricCard"
import { StatusBadge } from "./StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  MapPin,
  Users,
  Calendar,
  Download
} from "lucide-react"

// Mock data para demonstração
const mockOccurrences = [
  {
    id: "OCR-2024-001",
    agency: "AG-SP-001 Paulista",
    equipment: "ATM Bradesco 24h",
    description: "Falha de conectividade - sem comunicação com servidor central",
    severity: "critical" as const,
    status: "active" as const,
    createdAt: "2024-01-15T08:30:00",
    assignedTo: "Equipe Conectividade",
    vendor: "TechSolution"
  },
  {
    id: "OCR-2024-002", 
    agency: "AG-RJ-045 Copacabana",
    equipment: "Sistema Climatização",
    description: "Temperatura ambiente acima do normal - 28°C",
    severity: "high" as const,
    status: "pending" as const,
    createdAt: "2024-01-15T09:15:00",
    assignedTo: "Manutenção Predial",
    vendor: "ClimaMax"
  },
  {
    id: "OCR-2024-003",
    agency: "AG-MG-012 Centro",
    equipment: "Porta Giratória",
    description: "Travamento intermitente do mecanismo de rotação",
    severity: "medium" as const,
    status: "resolved" as const,
    createdAt: "2024-01-14T14:20:00",
    assignedTo: "Segurança Física",
    vendor: "SecureAccess"
  }
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard COPF</h1>
          <p className="text-muted-foreground">
            Visão geral das ocorrências em estabelecimentos físicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Último 30 dias
          </Button>
          <Button variant="corporate" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Ocorrências"
          value={1247}
          change="+12% vs mês anterior"
          changeType="negative"
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Últimos 30 dias"
        />
        <MetricCard
          title="Ocorrências Resolvidas"
          value={1089}
          change="+8% vs mês anterior"
          changeType="positive"
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="87% taxa de resolução"
        />
        <MetricCard
          title="MTTR Médio"
          value="4.2h"
          change="-15min vs mês anterior"
          changeType="positive"
          icon={<Clock className="h-5 w-5" />}
          description="Tempo médio de resolução"
        />
        <MetricCard
          title="Agências Afetadas"
          value={89}
          change="2 novas esta semana"
          changeType="neutral"
          icon={<MapPin className="h-5 w-5" />}
          description="De 234 totais"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuição por Severidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status="critical" />
                  <span className="text-sm">Crítico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-destructive rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">23</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status="high" />
                  <span className="text-sm">Alto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-warning rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">47</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status="medium" />
                  <span className="text-sm">Médio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">89</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status="low" />
                  <span className="text-sm">Baixo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-muted-foreground rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">88</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Agencies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Agências com Mais Ocorrências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "AG-SP-001 Paulista", count: 23, severity: "critical" },
                { name: "AG-RJ-045 Copacabana", count: 18, severity: "high" },
                { name: "AG-MG-012 Centro", count: 15, severity: "medium" },
                { name: "AG-RS-089 Porto Alegre", count: 12, severity: "medium" },
                { name: "AG-BA-034 Salvador", count: 9, severity: "low" }
              ].map((agency, index) => (
                <div key={agency.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{agency.name}</p>
                      <StatusBadge status={agency.severity as any} />
                    </div>
                  </div>
                  <span className="text-sm font-bold">{agency.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Occurrences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Ocorrências Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOccurrences.map((occurrence) => (
              <div 
                key={occurrence.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={occurrence.severity} />
                    <StatusBadge status={occurrence.status} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{occurrence.id}</p>
                    <p className="text-sm text-muted-foreground">{occurrence.agency}</p>
                    <p className="text-sm">{occurrence.equipment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{occurrence.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{occurrence.assignedTo}</p>
                  <p className="text-xs text-muted-foreground">{occurrence.vendor}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Ver Todas as Ocorrências
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}