import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";

export default function ModalCadastroCliente({ isOpen, onClose, ctoId, porta, onSave }) {
  const [form, setForm] = useState({ nome: "", endereco: "", pppoe: "", mac: "", serial: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setForm({ nome: "", endereco: "", pppoe: "", mac: "", serial: "" });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.endereco) {
      toast({ title: "Preencha nome e endereço", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api.entities.ClienteFibra.create({
        ...form,
        id_cto: ctoId,
        porta_conectada: porta
      });
      toast({ title: "Cliente cadastrado com sucesso!" });
      setForm({ nome: "", endereco: "", pppoe: "", mac: "", serial: "" });
      onSave();
      onClose();
    } catch (error) {
      toast({ title: "Erro ao cadastrar", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastro de Cliente — Porta {porta}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Cliente *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="João Silva" />
          </div>
          <div>
            <Label>Endereço Completo *</Label>
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro, complemento" />
          </div>
          <div>
            <Label>PPPoE</Label>
            <Input value={form.pppoe} onChange={(e) => setForm({ ...form, pppoe: e.target.value })} placeholder="usuario@provedor" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>MAC</Label>
              <Input value={form.mac} onChange={(e) => setForm({ ...form, mac: e.target.value })} placeholder="AA:BB:CC:DD:EE:FF" />
            </div>
            <div>
              <Label>Serial</Label>
              <Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} placeholder="HWTC12345678" />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : "Salvar Cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}