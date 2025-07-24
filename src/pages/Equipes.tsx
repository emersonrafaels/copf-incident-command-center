import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Settings, Phone, Mail, MapPin } from "lucide-react";

const mockEquipes = [
  {
    id: 1,
    nome: "João Silva",
    cargo: "Coordenador Regional",
    regiao: "São Paulo - Centro",
    status: "online",
    ocorrenciasAtivas: 5,
    telefone: "(11) 99999-0001",
    email: "joao.silva@itau.com.br"
  },
  {
    id: 2,
    nome: "Maria Santos",
    cargo: "Supervisora de Agência",
    regiao: "São Paulo - Zona Sul",
    status: "ocupado",
    ocorrenciasAtivas: 3,
    telefone: "(11) 99999-0002",
    email: "maria.santos@itau.com.br"
  },
  {
    id: 3,
    nome: "Carlos Oliveira",
    cargo: "Técnico NOC",
    regiao: "Suporte Remoto",
    status: "online",
    ocorrenciasAtivas: 8,
    telefone: "(11) 99999-0003",
    email: "carlos.oliveira@itau.com.br"
  },
  {
    id: 4,
    nome: "Ana Costa",
    cargo: "Analista de Facilities",
    regiao: "São Paulo - Zona Oeste",
    status: "offline",
    ocorrenciasAtivas: 2,
    telefone: "(11) 99999-0004",
    email: "ana.costa@itau.com.br"
  }
];

const Equipes = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipes</h1>
            <p className="text-muted-foreground">Gestão de usuários e equipes operacionais</p>
          </div>
          <Button variant="premium">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        {/* Filtros */}
        <FilterSection />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <div className="h-6 w-6 bg-success rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <div className="h-6 w-6 bg-warning rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">Ocupado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <div className="h-6 w-6 bg-muted rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Membros da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockEquipes.map((membro) => (
                <Card key={membro.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {membro.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{membro.nome}</h3>
                          <p className="text-sm text-muted-foreground">{membro.cargo}</p>
                        </div>
                        <Badge variant={
                          membro.status === "online" ? "default" :
                          membro.status === "ocupado" ? "secondary" : "outline"
                        }>
                          {membro.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{membro.regiao}</span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ocorrências ativas: </span>
                        <span className="font-medium">{membro.ocorrenciasAtivas}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </COPFLayout>
  );
};

export default Equipes;