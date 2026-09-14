import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

export default function ModalEdicaoCliente({ isOpen, onClose, cliente, ctos, onSave }) {
  const [form, setForm] = useState({ nome: "", endereco: "", pppoe: "", mac: "", serial: "", id_cto: "", porta_conectada: "" });
  const [portasDisponiveis, setPortasDisponiveis] = useState([]);
  const [loadingPortas, setLoadingPortas] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || "",
        endereco: cliente.endereco || "",
        pppoe: cliente.pppoe || "",
        mac: cliente.mac || "",
        serial: cliente.serial || "",
        id_cto: cliente.id_cto || "",
        porta_conectada: String(cliente.porta_conectada || ""),
      });
      fetchPortas(cliente.id_cto, cliente.porta_conectada);
    }
  }, [cliente]);

  const fetchPortas = async (ctoId, currentPort) => {
    if (!ctoId) { setPortasDisponiveis([]); return; }
    setLoadingPortas(true);
    try {
      const res = await api.functions.invoke("checkPortaLivre", { id_cto: ctoId });
      let portas = res.data?.data?.portas_disponiveis || [];
      if (currentPort && !portas.includes(currentPort)) {
        portas = [...portas, currentPort].sort((a, b) => a - b);
      }
      setPortasDisponiveis(portas);
    } catch { setPortasDisponiveis([]); }
    setLoadingPortas(false);
  };

  const handleCtoChange = (v) => {
    setForm({ ...form, id_cto: v, porta_conectada: "" });
    fetchPortas(v, null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.entities.ClienteFibra.update(cliente.id, {
        nome: form.nome,
        endereco: form.endereco,
        pppoe: form.pppoe,
        mac: form.mac,
        serial: form.serial,
        id_cto: form.id_cto,
        porta_conectada: parseInt(form.porta_conectada, 10),
      });
      toast({ title: "Cliente atualizado" });
      onSave();
      onClose();
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await api.entities.ClienteFibra.delete(cliente.id);
      toast({ title: "Cliente removido" });
      onSave();
      onClose();
    } catch (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  if (!cliente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar / Transferir Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Endereço Completo</Label>
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div>
            <Label>PPPoE</Label>
            <Input value={form.pppoe} onChange={(e) => setForm({ ...form, pppoe: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>MAC</Label>
              <Input value={form.mac} onChange={(e) => setForm({ ...form, mac: e.target.value })} />
            </div>
            <div>
              <Label>Serial</Label>
              <Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Transferência de Porta/CTO</p>
            <div className="space-y-3">
              <div>
                <Label>CTO de Destino</Label>
                <Select value={form.id_cto} onValueChange={handleCtoChange}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecionar CTO" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctos.map((cto) => (
                      <SelectItem key={cto.id} value={cto.id}>{cto.codigo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.id_cto && (
                <div>
                  <Label>Porta</Label>
                  <Select value={form.porta_conectada} onValueChange={(v) => setForm({ ...form, porta_conectada: v })} disabled={loadingPortas}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={loadingPortas ? "Carregando..." : "Selecionar porta"} />
                    </SelectTrigger>
                    <SelectContent>
                      {portasDisponiveis.map((p) => (
                        <SelectItem key={p} value={String(p)}>Porta {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 rounded-xl">
              <Trash2 className="w-4 h-4 mr-1" /> Remover
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.id_cto || !form.porta_conectada} className="flex-1 bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}