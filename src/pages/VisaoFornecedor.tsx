import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Building2,
  Wrench,
  MessageSquare,
  Phone
} from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VisaoFornecedor = () => {
  const { occurrences, isLoading, metrics } = useDashboardData()
  const { toast } = useToast()
  const [selectedVendor, setSelectedVendor] = useState('all')

  // Filtrar ocorrências por fornecedor e prioridade
  const priorityOccurrences = occurrences.filter(occ => 
    occ.severity === 'critical' || occ.severity === 'high'
  )

  type VendorStats = {
    total: number
    critical: number
    high: number
    active: number
    avgResponseTime: string
  }

  const vendorStats: Record<string, VendorStats> = occurrences.reduce((acc, occ) => {
    if (!acc[occ.vendor]) {
      acc[occ.vendor] = {
        total: 0,
        critical: 0,
        high: 0,
        active: 0,
        avgResponseTime: '2.5h'
      }
    }
    acc[occ.vendor].total++
    if (occ.severity === 'critical') acc[occ.vendor].critical++
    if (occ.severity === 'high') acc[occ.vendor].high++
    if (occ.status === 'active') acc[occ.vendor].active++
    return acc
  }, {} as Record<string, VendorStats>)

  const handleContactVendor = (vendor: string) => {
    toast({
      title: "Contato Iniciado",
      description: `Comunicação estabelecida com ${vendor}`,
    })
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return severity
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      default: return 'outline'
    }
  }

  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Visão do Fornecedor</h1>
            <p className="text-muted-foreground">Prioridades e comunicação centralizada com fornecedores</p>
          </div>
        </div>

        {/* Alertas Prioritários */}
        <Alert className="border-destructive bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {priorityOccurrences.length} ocorrências críticas/altas necessitam atenção imediata dos fornecedores
          </AlertDescription>
        </Alert>

        {/* Métricas por Fornecedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(vendorStats).length}</div>
              <p className="text-xs text-muted-foreground">
                Fornecedores com ocorrências ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Crítico</CardTitle>
              <Clock className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {occurrences.filter(o => o.severity === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ocorrências com SLA de 2 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Resp. Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.1h</div>
              <p className="text-xs text-muted-foreground">
                Tempo médio de primeira resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Dentro do SLA estabelecido
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="priority" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="priority">Ocorrências Prioritárias</TabsTrigger>
            <TabsTrigger value="vendors">Performance por Fornecedor</TabsTrigger>
            <TabsTrigger value="communication">Central de Comunicação</TabsTrigger>
          </TabsList>

          <TabsContent value="priority" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências Críticas e Altas - Ação Imediata</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Tempo Decorrido</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priorityOccurrences.map((occurrence) => {
                      const hoursSince = Math.floor(
                        (Date.now() - new Date(occurrence.createdAt).getTime()) / (1000 * 60 * 60)
                      )
                      const slaLimit = occurrence.severity === 'critical' ? 2 : 4
                      const slaProgress = (hoursSince / slaLimit) * 100

                      return (
                        <TableRow key={occurrence.id}>
                          <TableCell className="font-medium">{occurrence.id}</TableCell>
                          <TableCell>{occurrence.vendor}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{occurrence.equipment}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(occurrence.severity)}>
                              {getSeverityLabel(occurrence.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{hoursSince}h</div>
                              <Progress 
                                value={Math.min(slaProgress, 100)} 
                                className={`h-2 ${slaProgress > 80 ? 'bg-destructive/20' : 'bg-muted'}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slaProgress > 100 ? 'destructive' : 'outline'}>
                              {slaLimit}h
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="premium"
                              onClick={() => handleContactVendor(occurrence.vendor)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Contatar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(vendorStats).map(([vendor, stats]) => (
                <Card key={vendor}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{vendor}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{stats.total} total</Badge>
                        <Badge variant="destructive">{stats.critical} críticas</Badge>
                        <Badge variant="secondary">{stats.high} altas</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-destructive">{stats.active}</div>
                        <p className="text-sm text-muted-foreground">Ativas</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                        <p className="text-sm text-muted-foreground">Tempo Resp.</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">92%</div>
                        <p className="text-sm text-muted-foreground">SLA</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactVendor(vendor)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comunicar
                        </Button>
                        <Button 
                          variant="premium" 
                          size="sm"
                          onClick={() => handleContactVendor(vendor)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Escalar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Central de Comunicação com Fornecedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      Utilize esta central para comunicação direta e escalação de ocorrências críticas.
                      Todas as interações são registradas e monitoradas.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    {Object.keys(vendorStats).map((vendor) => (
                      <Card key={vendor} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{vendor}</h3>
                              <p className="text-sm text-muted-foreground">
                                {vendorStats[vendor].active} ocorrências ativas
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Mensagem
                              </Button>
                              <Button variant="premium" size="sm">
                                <Phone className="h-4 w-4 mr-1" />
                                Ligar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </COPFLayout>
  );
};

export default VisaoFornecedor;