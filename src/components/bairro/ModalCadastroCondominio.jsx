import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function ModalCadastroCondominio({ isOpen, onClose, onSave }) {
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) setNome("");
  }, [isOpen]);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Informe o nome do condomínio", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({ nome: nome.trim() });
      setNome("");
      onClose();
    } catch {
      toast({ title: "Erro ao salvar condomínio", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>Novo Condomínio</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Nome do Condomínio</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Residencial Alpha" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : "Criar Condomínio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}