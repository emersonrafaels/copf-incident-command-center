import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Loader2 } from "lucide-react";

interface PopulateOccurrencesButtonProps {
  onSuccess?: () => void;
}

export const PopulateOccurrencesButton = ({ onSuccess }: PopulateOccurrencesButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePopulateData = async () => {
    setLoading(true);

    try {
      console.log('Calling populate-occurrences function...');

      const { data, error } = await supabase.functions.invoke('populate-occurrences', {
        body: {}
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Sucesso",
          description: `${data.message}`,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error populating occurrences:', error);
      toast({
        title: "Erro",
        description: "Erro ao popular ocorrências. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePopulateData} 
      disabled={loading}
      variant="outline"
      className="bg-primary/5 hover:bg-primary/10 border-primary/20"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-2" />
      )}
      {loading ? "Populando..." : "Popular 50 Ocorrências"}
    </Button>
  );
};