import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Thermometer, Activity, Clock, Building2 } from "lucide-react";

const mockMapaData = [
  { agencia: "AG0001 - Centro (São Paulo)", ocorrencias: 8, regiao: "São Paulo Centro", equipamentos: 45, criticidade: "Média", horarioPico: "14h-16h" },
  { agencia: "AG0015 - Paulista (São Paulo)", ocorrencias: 12, regiao: "São Paulo Zona Sul", equipamentos: 62, criticidade: "Alta", horarioPico: "09h-11h" },
  { agencia: "AG0032 - Vila Madalena (São Paulo)", ocorrencias: 6, regiao: "São Paulo Zona Oeste", equipamentos: 38, criticidade: "Baixa", horarioPico: "16h-18h" },
  { agencia: "AG0045 - Pinheiros (São Paulo)", ocorrencias: 15, regiao: "São Paulo Zona Oeste", equipamentos: 78, criticidade: "Crítica", horarioPico: "10h-12h" },
  { agencia: "AG0067 - Moema (São Paulo)", ocorrencias: 4, regiao: "São Paulo Zona Sul", equipamentos: 28, criticidade: "Baixa", horarioPico: "15h-17h" },
  { agencia: "AG0089 - Vila Mariana (São Paulo)", ocorrencias: 9, regiao: "São Paulo Zona Sul", equipamentos: 54, criticidade: "Média", horarioPico: "08h-10h" },
  { agencia: "AG0102 - Itaim Bibi (São Paulo)", ocorrencias: 7, regiao: "São Paulo Zona Sul", equipamentos: 41, criticidade: "Média", horarioPico: "13h-15h" }
];

const Mapa = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mapa de Calor</h1>
          <p className="text-muted-foreground">Visualização geográfica da concentração de ocorrências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa Interativo
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-950/20 dark:to-red-950/20 h-full rounded-lg relative overflow-hidden">
                  {/* Simulação de mapa de calor */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-4">
                    {Array.from({ length: 48 }, (_, i) => {
                      const intensity = Math.random();
                      const getColor = () => {
                        if (intensity > 0.8) return 'bg-red-500/60';
                        if (intensity > 0.6) return 'bg-orange-500/50';
                        if (intensity > 0.4) return 'bg-yellow-500/40';
                        if (intensity > 0.2) return 'bg-green-500/30';
                        return 'bg-blue-500/20';
                      };
                      return (
                        <div 
                          key={i} 
                          className={`rounded ${getColor()} transition-all hover:scale-110 cursor-pointer`}
                          title={`Intensidade: ${(intensity * 100).toFixed(0)}%`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Marcadores de agências */}
                  {mockMapaData.slice(0, 5).map((item, index) => (
                    <div 
                      key={index}
                      className="absolute bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${20 + (index * 15)}%`,
                        top: `${25 + (index * 10)}%`
                      }}
                      title={item.agencia}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        item.ocorrencias > 10 ? 'bg-red-500' :
                        item.ocorrencias > 5 ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                    </div>
                  ))}
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg">
                    <p className="text-xs font-medium mb-2">Mapa de Calor - São Paulo</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Alta</span>
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>Média</span>
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Baixa</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="agencias" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="agencias">Por Agência</TabsTrigger>
                <TabsTrigger value="metricas">Métricas</TabsTrigger>
              </TabsList>

              <TabsContent value="agencias">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Concentração por Agência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockMapaData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.agencia}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>📍 {item.regiao}</span>
                            <span>🔧 {item.equipamentos} equip.</span>
                            <span>⏰ {item.horarioPico}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            item.criticidade === "Crítica" ? "destructive" :
                            item.criticidade === "Alta" ? "secondary" :
                            item.criticidade === "Média" ? "default" : "outline"
                          } className="text-xs">
                            {item.criticidade}
                          </Badge>
                          <Badge variant={
                            item.ocorrencias > 10 ? "destructive" :
                            item.ocorrencias > 5 ? "secondary" : "outline"
                          }>
                            {item.ocorrencias}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metricas">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Estatísticas Gerais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{mockMapaData.reduce((acc, item) => acc + item.ocorrencias, 0)}</div>
                          <div className="text-xs text-muted-foreground">Total Ocorrências</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-secondary">{mockMapaData.length}</div>
                          <div className="text-xs text-muted-foreground">Agências Ativas</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-500">{mockMapaData.filter(item => item.criticidade === "Crítica" || item.criticidade === "Alta").length}</div>
                          <div className="text-xs text-muted-foreground">Alta Criticidade</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-500">{Math.round(mockMapaData.reduce((acc, item) => acc + item.ocorrencias, 0) / mockMapaData.length)}</div>
                          <div className="text-xs text-muted-foreground">Média por Agência</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horários de Pico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {[...new Set(mockMapaData.map(item => item.horarioPico))].map((horario, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span>{horario}</span>
                            <Badge variant="outline">
                              {mockMapaData.filter(item => item.horarioPico === horario).length} agências
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded-full"></div>
                  <span className="text-sm">Crítica/Alta concentração (10+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  <span className="text-sm">Média concentração (5-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <span className="text-sm">Baixa concentração (1-5)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </COPFLayout>
  );
};

export default Mapa;