import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";

const mockOcorrencias = [
  {
    id: "OC-2024-001",
    agencia: "0001 - Centro",
    equipamento: "ATM Bradesco 24h",
    severidade: "Alta",
    status: "ativa",
    dataAbertura: "2024-01-15 08:30",
    descricao: "ATM não está dispensando cédulas",
    fornecedor: "Diebold Nixdorf"
  },
  {
    id: "OC-2024-002", 
    agencia: "0015 - Paulista",
    equipamento: "Ar Condicionado Split",
    severidade: "Média",
    status: "resolvida",
    dataAbertura: "2024-01-14 14:20",
    descricao: "Temperatura ambiente elevada",
    fornecedor: "Carrier"
  },
  {
    id: "OC-2024-003",
    agencia: "0032 - Vila Madalena", 
    equipamento: "Conectividade MPLS",
    severidade: "Crítica",
    status: "ativa",
    dataAbertura: "2024-01-15 09:45",
    descricao: "Perda total de conectividade",
    fornecedor: "Vivo Empresas"
  }
];

const Ocorrencias = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
            <p className="text-muted-foreground">Lista detalhada de todas as ocorrências registradas</p>
          </div>
          <Button variant="premium">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input 
                  placeholder="Buscar por ID, agência ou descrição..." 
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Ocorrências</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Abertura</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOcorrencias.map((ocorrencia) => (
                  <TableRow key={ocorrencia.id}>
                    <TableCell className="font-medium">{ocorrencia.id}</TableCell>
                    <TableCell>{ocorrencia.agencia}</TableCell>
                    <TableCell>{ocorrencia.equipamento}</TableCell>
                    <TableCell>
                      <Badge variant={
                        ocorrencia.severidade === "Crítica" ? "destructive" :
                        ocorrencia.severidade === "Alta" ? "secondary" : "outline"
                      }>
                        {ocorrencia.severidade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={
                        ocorrencia.status === "ativa" ? "active" :
                        ocorrencia.status === "resolvida" ? "resolved" : "pending"
                      } />
                    </TableCell>
                    <TableCell>{ocorrencia.dataAbertura}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </COPFLayout>
  );
};

export default Ocorrencias;