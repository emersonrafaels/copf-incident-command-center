import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Thermometer, Activity, Clock, Building2 } from "lucide-react";

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
                <div className="bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 h-full rounded-lg relative overflow-hidden border-2 border-muted">
                  {/* Mapa do Brasil estilizado */}
                  <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                    {/* Contorno do Brasil simplificado */}
                    <path 
                      d="M50 80 Q80 60 120 70 Q160 65 200 75 Q240 70 280 80 Q320 85 350 95 L360 120 Q350 150 340 180 Q330 210 310 240 Q290 260 260 270 Q220 275 180 270 Q140 265 100 250 Q70 230 50 200 Q40 170 45 140 Q48 110 50 80 Z" 
                      fill="transparent" 
                      stroke="hsl(var(--border))" 
                      strokeWidth="2"
                      className="opacity-60"
                    />
                  </svg>
                  
                  {/* Heatmap points distribuídos pelo Brasil */}
                  {[
                    // São Paulo
                    { x: 45, y: 70, intensity: 0.9, label: "São Paulo" },
                    { x: 50, y: 68, intensity: 0.7, label: "ABC Paulista" },
                    { x: 48, y: 72, intensity: 0.8, label: "Campinas" },
                    
                    // Rio de Janeiro  
                    { x: 55, y: 65, intensity: 0.85, label: "Rio de Janeiro" },
                    { x: 58, y: 67, intensity: 0.6, label: "Niterói" },
                    
                    // Minas Gerais
                    { x: 52, y: 62, intensity: 0.75, label: "Belo Horizonte" },
                    { x: 48, y: 60, intensity: 0.5, label: "Uberlândia" },
                    
                    // Bahia
                    { x: 60, y: 45, intensity: 0.65, label: "Salvador" },
                    { x: 65, y: 48, intensity: 0.4, label: "Feira de Santana" },
                    
                    // Pernambuco
                    { x: 70, y: 35, intensity: 0.7, label: "Recife" },
                    
                    // Ceará
                    { x: 72, y: 25, intensity: 0.6, label: "Fortaleza" },
                    
                    // Paraná
                    { x: 42, y: 75, intensity: 0.55, label: "Curitiba" },
                    
                    // Santa Catarina
                    { x: 45, y: 80, intensity: 0.4, label: "Florianópolis" },
                    
                    // Rio Grande do Sul
                    { x: 40, y: 85, intensity: 0.5, label: "Porto Alegre" },
                    
                    // Goiás
                    { x: 45, y: 50, intensity: 0.45, label: "Goiânia" },
                    
                    // Distrito Federal
                    { x: 48, y: 48, intensity: 0.65, label: "Brasília" },
                    
                    // Mato Grosso
                    { x: 35, y: 45, intensity: 0.3, label: "Cuiabá" },
                    
                    // Amazonas
                    { x: 25, y: 25, intensity: 0.25, label: "Manaus" },
                    
                    // Pará
                    { x: 35, y: 20, intensity: 0.35, label: "Belém" }
                  ].map((point, index) => {
                    const getHeatColor = (intensity: number) => {
                      if (intensity > 0.8) return 'fill-red-500';
                      if (intensity > 0.6) return 'fill-orange-500';
                      if (intensity > 0.4) return 'fill-yellow-500';
                      if (intensity > 0.2) return 'fill-green-500';
                      return 'fill-blue-500';
                    };
                    
                    const getOpacity = (intensity: number) => {
                      return 0.3 + (intensity * 0.7);
                    };
                    
                    return (
                      <circle
                        key={index}
                        cx={`${point.x}%`}
                        cy={`${point.y}%`}
                        r={6 + (point.intensity * 8)}
                        className={`${getHeatColor(point.intensity)} hover:opacity-100 cursor-pointer transition-all`}
                        style={{ opacity: getOpacity(point.intensity) }}
                      >
                        <title>{`${point.label}: ${Math.round(point.intensity * 100)}% concentração`}</title>
                      </circle>
                    );
                  })}
                  
                  {/* Marcadores de agências principais */}
                  {mockMapaData.slice(0, 8).map((item, index) => {
                    const positions = [
                      { x: 45, y: 70 }, // São Paulo
                      { x: 55, y: 65 }, // Rio
                      { x: 52, y: 62 }, // BH
                      { x: 60, y: 45 }, // Salvador
                      { x: 70, y: 35 }, // Recife
                      { x: 72, y: 25 }, // Fortaleza
                      { x: 42, y: 75 }, // Curitiba
                      { x: 48, y: 48 }  // Brasília
                    ];
                    
                    return (
                      <div 
                        key={index}
                        className="absolute bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border cursor-pointer hover:scale-110 transition-transform z-10"
                        style={{
                          left: `${positions[index]?.x || 50}%`,
                          top: `${positions[index]?.y || 50}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={item.agencia}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          item.ocorrencias > 25 ? 'bg-red-500' :
                          item.ocorrencias > 15 ? 'bg-orange-500' : 
                          item.ocorrencias > 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      </div>
                    );
                  })}
                  
                  <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-lg border">
                    <p className="text-xs font-medium mb-2">Mapa de Calor - Brasil (2.360 agências)</p>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Crítica</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Alta</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Média</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Baixa</span>
                      </div>
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
                          <div className="text-2xl font-bold text-secondary">2.360</div>
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