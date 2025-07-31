import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Thermometer, Activity, Clock, Building2, Layers } from "lucide-react";
import { HeatMap } from "@/components/copf/HeatMap";
import { ComingSoonOverlay } from "@/components/copf/ComingSoonOverlay";

const mockMapaData = [
  { agencia: "AG0001 - Centro (São Paulo/SP)", ocorrencias: 23, regiao: "São Paulo Centro", equipamentos: 45, criticidade: "Alta", horarioPico: "14h-16h" },
  { agencia: "AG0015 - Paulista (São Paulo/SP)", ocorrencias: 18, regiao: "São Paulo Zona Sul", equipamentos: 62, criticidade: "Média", horarioPico: "09h-11h" },
  { agencia: "AG0032 - Vila Madalena (São Paulo/SP)", ocorrencias: 12, regiao: "São Paulo Zona Oeste", equipamentos: 38, criticidade: "Baixa", horarioPico: "16h-18h" },
  { agencia: "AG0045 - Pinheiros (São Paulo/SP)", ocorrencias: 31, regiao: "São Paulo Zona Oeste", equipamentos: 78, criticidade: "Crítica", horarioPico: "10h-12h" },
  { agencia: "AG0067 - Moema (São Paulo/SP)", ocorrencias: 8, regiao: "São Paulo Zona Sul", equipamentos: 28, criticidade: "Baixa", horarioPico: "15h-17h" },
  { agencia: "AG0089 - Vila Mariana (São Paulo/SP)", ocorrencias: 15, regiao: "São Paulo Zona Sul", equipamentos: 54, criticidade: "Média", horarioPico: "08h-10h" },
  { agencia: "AG0102 - Itaim Bibi (São Paulo/SP)", ocorrencias: 19, regiao: "São Paulo Zona Sul", equipamentos: 41, criticidade: "Alta", horarioPico: "13h-15h" },
  { agencia: "AG0134 - Copacabana (Rio de Janeiro/RJ)", ocorrencias: 26, regiao: "Rio de Janeiro Zona Sul", equipamentos: 67, criticidade: "Crítica", horarioPico: "11h-13h" },
  { agencia: "AG0201 - Pelourinho (Salvador/BA)", ocorrencias: 14, regiao: "Salvador Centro", equipamentos: 32, criticidade: "Média", horarioPico: "15h-17h" },
  { agencia: "AG0298 - Boa Viagem (Recife/PE)", ocorrencias: 22, regiao: "Recife Zona Sul", equipamentos: 56, criticidade: "Alta", horarioPico: "09h-11h" },
  { agencia: "AG0456 - Centro (Belo Horizonte/MG)", ocorrencias: 17, regiao: "BH Centro", equipamentos: 43, criticidade: "Média", horarioPico: "12h-14h" },
  { agencia: "AG0789 - Meireles (Fortaleza/CE)", ocorrencias: 20, regiao: "Fortaleza Zona Nobre", equipamentos: 51, criticidade: "Alta", horarioPico: "16h-18h" },
  { agencia: "AG1023 - Água Verde (Curitiba/PR)", ocorrencias: 11, regiao: "Curitiba Centro-Sul", equipamentos: 29, criticidade: "Baixa", horarioPico: "14h-16h" },
  { agencia: "AG1456 - Aldeota (Fortaleza/CE)", ocorrencias: 25, regiao: "Fortaleza Zona Leste", equipamentos: 58, criticidade: "Crítica", horarioPico: "08h-10h" },
  { agencia: "AG1789 - Funcionários (Belo Horizonte/MG)", ocorrencias: 16, regiao: "BH Zona Sul", equipamentos: 39, criticidade: "Média", horarioPico: "13h-15h" }
];

const Mapa = () => {
  return (
    <COPFLayout>
      <ComingSoonOverlay
        title="Mapa de Calor"
        description="Visualização geográfica avançada da concentração de ocorrências em tempo real"
        version="MVP 2.0"
        releaseDate="Q2 2024"
        features={[
          "Mapa interativo com clusters dinâmicos",
          "Filtros avançados por região e criticidade",
          "Visualização em tempo real das ocorrências",
          "Análise de tendências geográficas",
          "Exportação de relatórios por localização"
        ]}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mapa de Calor</h1>
            <p className="text-muted-foreground">Visualização geográfica da concentração de ocorrências</p>
          </div>

          {/* Filtros */}
          <FilterSection />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[500px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Mapa de Calor Interativo
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <HeatMap />
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
                            <div className="text-2xl font-bold text-foreground">2.360</div>
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
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Média concentração (5-10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Baixa concentração (1-5)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ComingSoonOverlay>
    </COPFLayout>
  );
};

export default Mapa;