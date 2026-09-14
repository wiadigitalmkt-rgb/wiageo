import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const TIPOS = [
  { value: "emenda_fusao", label: "Emenda de Fusão" },
  { value: "pigtail", label: "Pigtail" },
  { value: "acoplador", label: "Acoplador" },
  { value: "splitter", label: "Splitter" },
  { value: "acessorio", label: "Acessório" },
  { value: "outro", label: "Outro" },
];

export default function ModalCadastroElemento({ isOpen, onClose, editing, onSave }) {
  const [form, setForm] = useState({ nome: "", tipo: "emenda_fusao", descricao: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({ nome: editing.nome || "", tipo: editing.tipo || "emenda_fusao", descricao: editing.descricao || "" });
    } else {
      setForm({ nome: "", tipo: "emenda_fusao", descricao: "" });
    }
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Informe o nome", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({ nome: form.nome.trim(), tipo: form.tipo, descricao: form.descricao });
      onClose();
    } catch {
      toast({ title: "Erro ao salvar elemento", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? "Editar Elemento" : "Novo Elemento de Rede"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Emenda de Fusão - Rua Augusta" /></div>
          <div>
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do elemento..." rows={3} /></div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Elemento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}