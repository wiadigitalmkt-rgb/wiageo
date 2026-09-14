import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FolderSelect from "@/components/shared/FolderSelect";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
const TIPOS = [
  { value: "principal", label: "Principal" },
  { value: "secundario", label: "Secundário" },
  { value: "edge", label: "Edge" },
];

export default function ModalCadastroPop({ isOpen, onClose, editing, pastas, preCoords, onSave }) {
  const [form, setForm] = useState({ nome: "", endereco: "", cep: "", cidade: "Viamão", latitude: "", longitude: "", descricao: "", tipo: "principal", pasta_id: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useReverseGeocode(form.latitude, form.longitude, (res) => {
    setForm((f) => {
      const next = { ...f };
      if (res.endereco) next.endereco = res.endereco;
      if (res.cep) next.cep = res.cep;
      if (res.cidade) next.cidade = res.cidade;
      return next;
    });
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        nome: editing.nome || "", endereco: editing.endereco || "", cep: editing.cep || "", cidade: editing.cidade || "Viamão",
        latitude: editing.latitude != null ? String(editing.latitude) : "",
        longitude: editing.longitude != null ? String(editing.longitude) : "",
        descricao: editing.descricao || "", tipo: editing.tipo || "principal",
        pasta_id: editing.pasta_id || "",
      });
    } else {
      setForm({ nome: "", endereco: "", cep: "", cidade: "Viamão", latitude: preCoords ? String(preCoords.lat) : "", longitude: preCoords ? String(preCoords.lng) : "", descricao: "", tipo: "principal", pasta_id: "" });
    }
  }, [isOpen, editing, preCoords]);

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await onSave({
        nome: form.nome.trim(),
        endereco: form.endereco,
        cep: form.cep,
        cidade: form.cidade,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        descricao: form.descricao,
        tipo: form.tipo,
        pasta_id: form.pasta_id || null,
      });
      onClose();
    } catch {
      toast({ title: "Erro ao salvar POP", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? "Editar POP" : "Novo POP"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="POP Centro" /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua Exemplo, 123" /></div>
          <div><Label>CEP</Label><Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="95000-000" /></div>
          <div>
            <Label>Cidade</Label>
            <Select value={form.cidade} onValueChange={(v) => setForm({ ...form, cidade: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{CIDADES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-30.08" /></div>
            <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-51.02" /></div>
          </div>
          <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Observações sobre o POP" /></div>
          <FolderSelect value={form.pasta_id} onChange={(v) => setForm({ ...form, pasta_id: v })} pastas={pastas} />
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar POP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}