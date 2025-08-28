import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type Version = 'MVP' | 'VERSAO_FUTURA';

interface VersionSelectorProps {
  version: Version;
  onVersionChange: (version: Version) => void;
}

export const VersionSelector = ({ version, onVersionChange }: VersionSelectorProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">Versão:</span>
      <Select value={version} onValueChange={(value: Version) => onVersionChange(value)}>
        <SelectTrigger className="w-48 bg-background border-border shadow-sm hover:shadow-md transition-shadow">
          <SelectValue placeholder="Selecione a versão" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border shadow-lg z-50">
          <SelectItem value="MVP" className="hover:bg-accent hover:text-accent-foreground">
            <div className="flex items-center gap-2">
              <span>MVP</span>
              <Badge variant="secondary" className="text-xs">
                Atual
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="VERSAO_FUTURA" className="hover:bg-accent hover:text-accent-foreground">
            <div className="flex items-center gap-2">
              <span>Versão Futura</span>
              <Badge variant="outline" className="text-xs">
                Completa
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};