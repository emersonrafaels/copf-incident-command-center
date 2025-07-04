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
    id: "COPF-2024-001",
    agencia: "AG0001 - Centro (São Paulo)",
    equipamento: "ATM Diebold 9800 - Slot 01",
    severidade: "Crítica",
    status: "aberta",
    dataAbertura: "2024-01-15 08:30",
    dataDeteccao: "2024-01-15 08:25",
    descricao: "ATM não está dispensando cédulas - erro de hardware na gaveta",
    fornecedor: "Diebold Nixdorf",
    responsavel: "João Silva - NOC"
  },
  {
    id: "COPF-2024-002", 
    agencia: "AG0015 - Paulista (São Paulo)",
    equipamento: "Split Carrier 18k BTU - Térreo",
    severidade: "Média",
    status: "internalizada",
    dataAbertura: "2024-01-14 14:20",
    dataDeteccao: "2024-01-14 14:15",
    descricao: "Temperatura ambiente elevada - possível falha no compressor",
    fornecedor: "Carrier do Brasil",
    responsavel: "Maria Santos - Facilities"
  },
  {
    id: "COPF-2024-003",
    agencia: "AG0032 - Vila Madalena (São Paulo)", 
    equipamento: "Link MPLS Principal - Roteador Cisco",
    severidade: "Alta",
    status: "aberta",
    dataAbertura: "2024-01-15 09:45",
    dataDeteccao: "2024-01-15 09:40",
    descricao: "Perda total de conectividade - link primário inoperante",
    fornecedor: "Vivo Empresas",
    responsavel: "Carlos Oliveira - Redes"
  },
  {
    id: "COPF-2024-004",
    agencia: "AG0008 - Moema (São Paulo)",
    equipamento: "Terminal POS Ingenico - Caixa 03",
    severidade: "Baixa",
    status: "fechada",
    dataAbertura: "2024-01-13 16:10",
    dataDeteccao: "2024-01-13 16:05",
    descricao: "Lentidão nas transações - possível problema de comunicação",
    fornecedor: "Ingenico Brasil",
    responsavel: "Ana Costa - Suporte"
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
                  <TableHead>Responsável</TableHead>
                  <TableHead>Fornecedor</TableHead>
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
                        ocorrencia.status === "aberta" ? "active" :
                        ocorrencia.status === "fechada" ? "resolved" : 
                        ocorrencia.status === "internalizada" ? "pending" : "pending"
                      } />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ocorrencia.dataAbertura}</TableCell>
                    <TableCell className="text-sm">{ocorrencia.responsavel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ocorrencia.fornecedor}</TableCell>
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