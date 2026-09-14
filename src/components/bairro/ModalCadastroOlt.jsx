import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function ModalCadastroOlt({ isOpen, onClose, editing, onSave }) {
  const [form, setForm] = useState({ nome: "", ip: "", modelo: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({ nome: editing.nome || "", ip: editing.ip || "", modelo: editing.modelo || "" });
    } else {
      setForm({ nome: "", ip: "", modelo: "" });
    }
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!form.nome.trim() || !form.ip.trim()) {
      toast({ title: "Preencha nome e IP", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      toast({ title: "Erro ao salvar OLT", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? "Editar OLT" : "Nova OLT"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="OLT-01" /></div>
          <div><Label>Endereço IP</Label><Input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="192.168.1.1" /></div>
          <div><Label>Modelo</Label><Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Huawei MA5800" /></div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar OLT"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}