import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddOccurrenceFormProps {
  onSuccess?: () => void;
}

export const AddOccurrenceForm = ({ onSuccess }: AddOccurrenceFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    agencia: "",
    equipamento: "",
    numero_serie: "",
    descricao: "",
    status: "aberto",
    prioridade: "media",
    severidade: "medium",
    fornecedor: "",
    segmento: "",
    uf: "",
    tipo_agencia: "",
    supt: "",
    transportadora: "",
    observacoes: "",
    motivo_ocorrencia: "",
    vip: false,
    possui_impedimento: false,
    reincidencia: false
  });

  const equipmentOptions = [
    "ATM Saque", "ATM Depósito", "Cassete", "Notebook", "Desktop",
    "Leitor de Cheques/documentos", "Leitor biométrico", "PIN PAD",
    "Scanner de Cheque", "Impressora", "Impressora térmica",
    "Impressora multifuncional", "Monitor LCD/LED", "Teclado",
    "Servidor", "Televisão", "Senheiro", "TCR", "Classificadora",
    "Fragmentadora de Papel"
  ];

  const statusOptions = [
    "aberto", "em_andamento", "aguardando_peca", "aguardando_terceiro",
    "encerrado", "cancelado"
  ];

  const priorityOptions = ["baixa", "media", "alta", "critica"];
  const severityOptions = ["low", "medium", "high", "critical"];
  const segmentOptions = ["Varejo", "Atacado", "Corporativo", "Private"];
  const vendorOptions = ["Fornecedor A", "Fornecedor B", "Fornecedor C", "Fornecedor D"];
  const ufOptions = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "PE", "CE"];
  const tipoAgenciaOptions = ["Convencional (Ag)", "Convencional (PAB)", "Terceirizada (Espaço Itaú)", "Terceirizada (PAB)"];
  const transportadoraOptions = ["Transportadora A", "Transportadora B", "Transportadora C"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('occurrences')
        .insert([{
          agencia: formData.agencia,
          equipamento: formData.equipamento,
          numero_serie: formData.numero_serie,
          descricao: formData.descricao,
          status: formData.status,
          prioridade: formData.prioridade,
          severidade: formData.severidade,
          fornecedor: formData.fornecedor,
          segmento: formData.segmento,
          uf: formData.uf,
          tipo_agencia: formData.tipo_agencia,
          supt: formData.supt,
          transportadora: formData.transportadora,
          observacoes: formData.observacoes || null,
          motivo_ocorrencia: formData.motivo_ocorrencia || null,
          vip: formData.vip,
          possui_impedimento: formData.possui_impedimento,
          reincidencia: formData.reincidencia
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ocorrência criada com sucesso!",
      });

      setOpen(false);
      setFormData({
        agencia: "",
        equipamento: "",
        numero_serie: "",
        descricao: "",
        status: "aberto",
        prioridade: "media",
        severidade: "medium",
        fornecedor: "",
        segmento: "",
        uf: "",
        tipo_agencia: "",
        supt: "",
        transportadora: "",
        observacoes: "",
        motivo_ocorrencia: "",
        vip: false,
        possui_impedimento: false,
        reincidencia: false
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating occurrence:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar ocorrência. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Criar Nova Ocorrência</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-extrabold">Informações da Agência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agencia" className="font-semibold">Agência *</Label>
                  <Input
                    id="agencia"
                    value={formData.agencia}
                    onChange={(e) => handleInputChange("agencia", e.target.value)}
                    placeholder="Ex: Agência Centro - 001"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="uf" className="font-semibold">UF *</Label>
                  <Select value={formData.uf} onValueChange={(value) => handleInputChange("uf", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ufOptions.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo_agencia" className="font-semibold">Tipo do Ponto *</Label>
                  <Select value={formData.tipo_agencia} onValueChange={(value) => handleInputChange("tipo_agencia", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoAgenciaOptions.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="segmento" className="font-semibold">Segmento *</Label>
                  <Select value={formData.segmento} onValueChange={(value) => handleInputChange("segmento", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segmentOptions.map(segment => (
                        <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="supt" className="font-semibold">SUPT *</Label>
                  <Input
                    id="supt"
                    value={formData.supt}
                    onChange={(e) => handleInputChange("supt", e.target.value)}
                    placeholder="Ex: SUPT01"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-extrabold">Informações do Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="equipamento" className="font-semibold">Equipamento *</Label>
                  <Select value={formData.equipamento} onValueChange={(value) => handleInputChange("equipamento", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentOptions.map(equipment => (
                        <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numero_serie" className="font-semibold">Número de Série *</Label>
                  <Input
                    id="numero_serie"
                    value={formData.numero_serie}
                    onChange={(e) => handleInputChange("numero_serie", e.target.value)}
                    placeholder="Ex: SN123456789"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fornecedor" className="font-semibold">Fornecedor *</Label>
                  <Select value={formData.fornecedor} onValueChange={(value) => handleInputChange("fornecedor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorOptions.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transportadora" className="font-semibold">Transportadora *</Label>
                  <Select value={formData.transportadora} onValueChange={(value) => handleInputChange("transportadora", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportadoraOptions.map(transportadora => (
                        <SelectItem key={transportadora} value={transportadora}>{transportadora}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-extrabold">Detalhes da Ocorrência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descricao" className="font-semibold">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  placeholder="Descreva o problema encontrado"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status" className="font-semibold">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridade" className="font-semibold">Prioridade *</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => handleInputChange("prioridade", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severidade" className="font-semibold">Severidade *</Label>
                  <Select value={formData.severidade} onValueChange={(value) => handleInputChange("severidade", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map(severity => (
                        <SelectItem key={severity} value={severity}>
                          {severity.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="motivo_ocorrencia" className="font-semibold">Motivo da Ocorrência</Label>
                <Textarea
                  id="motivo_ocorrencia"
                  value={formData.motivo_ocorrencia}
                  onChange={(e) => handleInputChange("motivo_ocorrencia", e.target.value)}
                  placeholder="Detalhe o motivo da ocorrência"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="font-semibold">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vip"
                    checked={formData.vip}
                    onCheckedChange={(checked) => handleInputChange("vip", checked)}
                  />
                  <Label htmlFor="vip" className="font-semibold">VIP</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="possui_impedimento"
                    checked={formData.possui_impedimento}
                    onCheckedChange={(checked) => handleInputChange("possui_impedimento", checked)}
                  />
                  <Label htmlFor="possui_impedimento" className="font-semibold">Possui Impedimento</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reincidencia"
                    checked={formData.reincidencia}
                    onCheckedChange={(checked) => handleInputChange("reincidencia", checked)}
                  />
                  <Label htmlFor="reincidencia" className="font-semibold">Reincidência</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Criar Ocorrência"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};