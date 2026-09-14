import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];

export default function ModalCadastroBairro({ isOpen, onClose, onSave, cidadePreSelecionada, editing }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState(cidadePreSelecionada || "Viamão");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setNome(editing?.nome || "");
      setCidade(editing?.cidade || cidadePreSelecionada || "Viamão");
    }
  }, [isOpen, editing, cidadePreSelecionada]);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Informe o nome do bairro", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({ nome: nome.trim(), cidade });
      setNome("");
      onClose();
    } catch {
      toast({ title: "Erro ao salvar bairro", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Bairro" : "Novo Bairro"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Nome do Bairro</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Centro" />
          </div>
          <div>
            <Label>Cidade</Label>
            <Select value={cidade} onValueChange={setCidade}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CIDADES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Bairro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}