import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FolderSelect from "@/components/shared/FolderSelect";

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
const TIPOS = [
  { value: "at", label: "AT (Assinante)" },
  { value: "ressal", label: "Ressal" },
  { value: "drop", label: "Drop" },
  { value: "indoor", label: "Indoor" },
];

export default function ModalCadastroCabo({ isOpen, onClose, editing, bairros, pastas, preCoords, preMetragem, onSave }) {
  const [form, setForm] = useState({ codigo: "", cidade: "Viamão", bairro_id: "", tipo: "at", quantidade_fibras: "", metragem: "", origem: "", destino: "", pasta_id: "", coordenadas: [] });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        codigo: editing.codigo || "", cidade: editing.cidade || "Viamão", bairro_id: editing.bairro_id || "",
        tipo: editing.tipo || "at",
        quantidade_fibras: editing.quantidade_fibras != null ? String(editing.quantidade_fibras) : "",
        metragem: editing.metragem != null ? String(editing.metragem) : "",
        origem: editing.origem || "", destino: editing.destino || "",
        pasta_id: editing.pasta_id || "",
        coordenadas: editing.coordenadas || [],
      });
    } else {
      setForm({ codigo: "", cidade: "Viamão", bairro_id: "", tipo: "at", quantidade_fibras: "", metragem: preMetragem ? String(preMetragem) : "", origem: "", destino: "", pasta_id: "", coordenadas: preCoords || [] });
    }
  }, [isOpen, editing, preCoords, preMetragem]);

  const handleSave = async () => {
    if (!form.codigo.trim()) {
      toast({ title: "Informe o código", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        codigo: form.codigo.trim(), cidade: form.cidade, bairro_id: form.bairro_id || null,
        tipo: form.tipo,
        quantidade_fibras: form.quantidade_fibras ? parseInt(form.quantidade_fibras, 10) : null,
        metragem: form.metragem ? parseFloat(form.metragem) : null,
        origem: form.origem, destino: form.destino,
        pasta_id: form.pasta_id || null,
        coordenadas: form.coordenadas || [],
      });
      onClose();
    } catch {
      toast({ title: "Erro ao salvar cabo", variant: "destructive" });
    }
    setSaving(false);
  };

  const bairrosDaCidade = (bairros || []).filter((b) => b.cidade === form.cidade);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? "Editar Cabo" : "Novo Cabo"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="CAB-001" /></div>
            <div>
              <Label>Tipo de Cabo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <Select value={form.cidade} onValueChange={(v) => setForm({ ...form, cidade: v, bairro_id: "" })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CIDADES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bairro</Label>
              <Select value={form.bairro_id} onValueChange={(v) => setForm({ ...form, bairro_id: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sem bairro" /></SelectTrigger>
                <SelectContent>{bairrosDaCidade.map((b) => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantidade de Fibras</Label><Input type="number" value={form.quantidade_fibras} onChange={(e) => setForm({ ...form, quantidade_fibras: e.target.value })} placeholder="12" /></div>
            <div><Label>Metragem (m)</Label><Input type="number" value={form.metragem} onChange={(e) => setForm({ ...form, metragem: e.target.value })} placeholder="150" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Origem</Label><Input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} placeholder="Ex: CTO-001" /></div>
            <div><Label>Destino</Label><Input value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} placeholder="Ex: CEO-002" /></div>
          </div>
          <FolderSelect value={form.pasta_id} onChange={(v) => setForm({ ...form, pasta_id: v })} pastas={pastas} />
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Cabo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}