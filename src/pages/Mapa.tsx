import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer } from "lucide-react";

const mockMapaData = [
  { agencia: "0001 - Centro", ocorrencias: 8, lat: -23.5505, lng: -46.6333 },
  { agencia: "0015 - Paulista", ocorrencias: 12, lat: -23.5489, lng: -46.6388 },
  { agencia: "0032 - Vila Madalena", ocorrencias: 6, lat: -23.5448, lng: -46.6920 },
  { agencia: "0045 - Pinheiros", ocorrencias: 15, lat: -23.5629, lng: -46.7009 },
  { agencia: "0067 - Moema", ocorrencias: 4, lat: -23.6005, lng: -46.6639 }
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
                <div className="bg-gradient-subtle h-full rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Mapa em Desenvolvimento</p>
                    <p className="text-sm">Integração com Google Maps será implementada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Concentração por Agência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockMapaData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.agencia}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </p>
                    </div>
                    <Badge variant={
                      item.ocorrencias > 10 ? "destructive" :
                      item.ocorrencias > 5 ? "secondary" : "outline"
                    }>
                      {item.ocorrencias}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded-full"></div>
                  <span className="text-sm">Alta concentração (10+)</span>
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