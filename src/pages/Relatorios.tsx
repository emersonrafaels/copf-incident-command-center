import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from "lucide-react";
import { MetricCard } from "@/components/copf/MetricCard";

const Relatorios = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análises e métricas detalhadas do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Período
            </Button>
            <Button variant="premium">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Ocorrências Totais"
                value="1,234"
                change="+12%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Resolução"
                value="87.5%"
                change="+5.2%"
                changeType="positive"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricCard
                title="MTTR Médio"
                value="4.2h"
                change="-15%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Satisfação"
                value="94%"
                change="+8%"
                changeType="positive"
                icon={<PieChart className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ocorrências por Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ATMs</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Climatização</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conectividade</span>
                      <span className="text-sm font-medium">27%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severidade das Ocorrências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Crítica</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alta</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Média</span>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-success h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gráficos de performance em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Análise de tendências em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de SLA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Relatórios de SLA em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </COPFLayout>
  );
};

export default Relatorios;