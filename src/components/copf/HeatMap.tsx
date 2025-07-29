import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useFilters } from '@/contexts/FiltersContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HeatMapPoint {
  lat: number;
  lng: number;
  intensity: number;
  label: string;
  ocorrencias: number;
  criticidade: string;
  agencia: string;
}

const mockHeatData: HeatMapPoint[] = [
  // São Paulo e região
  { lat: -23.5505, lng: -46.6333, intensity: 0.9, label: "São Paulo Centro", ocorrencias: 23, criticidade: "Alta", agencia: "AG0001 - Centro" },
  { lat: -23.5629, lng: -46.6544, intensity: 0.8, label: "Paulista", ocorrencias: 18, criticidade: "Média", agencia: "AG0015 - Paulista" },
  { lat: -23.5440, lng: -46.6419, intensity: 0.7, label: "Vila Madalena", ocorrencias: 12, criticidade: "Baixa", agencia: "AG0032 - Vila Madalena" },
  { lat: -23.5672, lng: -46.7006, intensity: 0.95, label: "Pinheiros", ocorrencias: 31, criticidade: "Crítica", agencia: "AG0045 - Pinheiros" },
  { lat: -23.5505, lng: -46.6333, intensity: 0.4, label: "Moema", ocorrencias: 8, criticidade: "Baixa", agencia: "AG0067 - Moema" },
  
  // Rio de Janeiro
  { lat: -22.9068, lng: -43.1729, intensity: 0.85, label: "Copacabana", ocorrencias: 26, criticidade: "Crítica", agencia: "AG0134 - Copacabana" },
  { lat: -22.9035, lng: -43.2096, intensity: 0.6, label: "Ipanema", ocorrencias: 15, criticidade: "Média", agencia: "AG0156 - Ipanema" },
  
  // Belo Horizonte
  { lat: -19.9191, lng: -43.9386, intensity: 0.65, label: "Centro BH", ocorrencias: 17, criticidade: "Média", agencia: "AG0456 - Centro" },
  { lat: -19.9208, lng: -43.9378, intensity: 0.55, label: "Funcionários", ocorrencias: 16, criticidade: "Média", agencia: "AG1789 - Funcionários" },
  
  // Salvador
  { lat: -12.9714, lng: -38.5014, intensity: 0.6, label: "Pelourinho", ocorrencias: 14, criticidade: "Média", agencia: "AG0201 - Pelourinho" },
  
  // Recife
  { lat: -8.0476, lng: -34.8770, intensity: 0.75, label: "Boa Viagem", ocorrencias: 22, criticidade: "Alta", agencia: "AG0298 - Boa Viagem" },
  
  // Fortaleza
  { lat: -3.7172, lng: -38.5433, intensity: 0.7, label: "Meireles", ocorrencias: 20, criticidade: "Alta", agencia: "AG0789 - Meireles" },
  { lat: -3.7327, lng: -38.5267, intensity: 0.8, label: "Aldeota", ocorrencias: 25, criticidade: "Crítica", agencia: "AG1456 - Aldeota" },
  
  // Curitiba
  { lat: -25.4284, lng: -49.2733, intensity: 0.45, label: "Água Verde", ocorrencias: 11, criticidade: "Baixa", agencia: "AG1023 - Água Verde" },
  
  // Brasília
  { lat: -15.7942, lng: -47.8822, intensity: 0.55, label: "Asa Sul", ocorrencias: 13, criticidade: "Média", agencia: "AG2001 - Asa Sul" },
  
  // Porto Alegre
  { lat: -30.0346, lng: -51.2177, intensity: 0.5, label: "Centro POA", ocorrencias: 12, criticidade: "Baixa", agencia: "AG3001 - Centro" },
];

// Componente para adicionar camada de calor
const HeatLayer: React.FC<{ points: HeatMapPoint[] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    // Converter pontos para formato do leaflet.heat
    const heatPoints = points.map(point => [
      point.lat,
      point.lng,
      point.intensity
    ]) as [number, number, number][];

    // Criar camada de calor
    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 30,
      blur: 25,
      maxZoom: 18,
      max: 1.0,
      gradient: {
        0.0: '#3b82f6', // blue-500
        0.2: '#10b981', // green-500  
        0.4: '#f59e0b', // yellow-500
        0.6: '#f97316', // orange-500
        0.8: '#ef4444', // red-500
        1.0: '#dc2626'  // red-600
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

// Ícones customizados por criticidade
const getMarkerIcon = (criticidade: string) => {
  const color = 
    criticidade === "Crítica" ? '#dc2626' :
    criticidade === "Alta" ? '#f97316' :
    criticidade === "Média" ? '#f59e0b' : '#10b981';

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export const HeatMap: React.FC = () => {
  const navigate = useNavigate();
  const { clearAllFilters, updateFilter } = useFilters();

  const handleMarkerClick = (point: HeatMapPoint) => {
    // Extrair código da agência do nome completo
    const agencyCode = point.agencia.split(' - ')[0];
    
    clearAllFilters();
    setTimeout(() => {
      updateFilter('agenciaFilter', [agencyCode]);
      navigate('/ocorrencias');
      toast.success(`Filtrando por agência: ${point.agencia}`, {
        description: `${point.ocorrencias} ocorrências encontradas`
      });
    }, 100);
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[-15.7942, -47.8822]} // Centro do Brasil (Brasília)
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <HeatLayer points={mockHeatData} />
        
        {mockHeatData.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            icon={getMarkerIcon(point.criticidade)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{point.agencia}</h3>
                <p className="text-xs text-muted-foreground mb-2">{point.label}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Ocorrências:</span>
                    <span className="font-medium">{point.ocorrencias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Criticidade:</span>
                    <span className={`font-medium ${
                      point.criticidade === "Crítica" ? 'text-red-600' :
                      point.criticidade === "Alta" ? 'text-orange-600' :
                      point.criticidade === "Média" ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {point.criticidade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intensidade:</span>
                    <span className="font-medium">{Math.round(point.intensity * 100)}%</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => handleMarkerClick(point)}
                >
                  Ver Ocorrências
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};