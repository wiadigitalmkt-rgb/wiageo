import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Camera, X } from "lucide-react";
import FolderSelect from "@/components/shared/FolderSelect";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

const SPLITTER_OPTIONS = ["1x2", "1x4", "1x8", "1x16", "1x32", "1x64"];
const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativa" },
  { value: "manutencao", label: "Manutenção" },
  { value: "rompido", label: "Rompimento" },
];

export default function ModalCadastroCto({ isOpen, onClose, editing, bairros, olts, pastas, cidadeSelecionada, bairroPreSelecionado, preCoords, onSave }) {
  const [form, setForm] = useState({ codigo: "", descricao: "", endereco: "", cep: "", cidade: "Viamão", bairro_id: "", latitude: "", longitude: "", splitter: "1x8", potencia: "", id_olt: "", status: "ativo", fotos: [], pasta_id: "" });
  const [novasFotos, setNovasFotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useReverseGeocode(form.latitude, form.longitude, (res) => {
    setForm((f) => {
      const next = { ...f };
      if (res.endereco) next.endereco = res.endereco;
      if (res.cep) next.cep = res.cep;
      if (res.cidade) next.cidade = res.cidade;
      if (res.bairro_nome) {
        const match = (bairros || []).find((b) => b.nome.toLowerCase() === res.bairro_nome.toLowerCase() && (!res.cidade || b.cidade === res.cidade));
        if (match) next.bairro_id = match.id;
      }
      return next;
    });
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        codigo: editing.codigo || "", descricao: editing.descricao || "",
        endereco: editing.endereco || "", cep: editing.cep || "",
        cidade: editing.cidade || "Viamão", bairro_id: editing.bairro_id || "",
        latitude: String(editing.latitude || ""), longitude: String(editing.longitude || ""),
        splitter: editing.splitter || "1x8", potencia: editing.potencia != null ? String(editing.potencia) : "",
        id_olt: editing.id_olt || "", status: editing.status || "ativo", fotos: editing.fotos || [],
        pasta_id: editing.pasta_id || "",
      });
    } else {
      setForm({ codigo: "", descricao: "", endereco: "", cep: "", cidade: cidadeSelecionada || "Viamão", bairro_id: bairroPreSelecionado || "", latitude: preCoords ? String(preCoords.lat) : "", longitude: preCoords ? String(preCoords.lng) : "", splitter: "1x8", potencia: "", id_olt: "", status: "ativo", fotos: [], pasta_id: "" });
    }
    setNovasFotos([]);
  }, [isOpen, editing, preCoords]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => ["image/png", "image/jpeg"].includes(f.type));
    if (files.length + form.fotos.length + novasFotos.length > 4) {
      toast({ title: "Máximo de 4 fotos", variant: "destructive" });
      return;
    }
    setNovasFotos([...novasFotos, ...files]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let fotos = [...(form.fotos || [])];
      for (const file of novasFotos) {
        const { file_url } = await api.integrations.Core.UploadFile({ file });
        fotos.push(file_url);
      }
      const data = {
        codigo: form.codigo, descricao: form.descricao, endereco: form.endereco, cep: form.cep,
        cidade: form.cidade,
        bairro_id: form.bairro_id || null,
        latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
        splitter: form.splitter, potencia: form.potencia ? parseFloat(form.potencia) : null,
        id_olt: form.id_olt || null, status: form.status, fotos,
        pasta_id: form.pasta_id || null,
        data_ultima_atualizacao: new Date().toISOString(),
      };
      if (editing) {
        await api.entities.Cto.update(editing.id, data);
        toast({ title: "CTO atualizada" });
      } else {
        await api.entities.Cto.create(data);
        toast({ title: "CTO criada" });
      }
      setNovasFotos([]);
      onClose();
      onSave();
    } catch {
      toast({ title: "Erro ao salvar CTO", variant: "destructive" });
    }
    setSaving(false);
  };

  const bairrosDaCidade = bairros.filter((b) => b.cidade === form.cidade);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar CTO" : "Nova CTO"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="CTO-001" /></div>
          <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: CTO fixada em poste, 8 portas" /></div>
          <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua Exemplo, 123" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <Select value={form.cidade} onValueChange={(v) => setForm({ ...form, cidade: v, bairro_id: "", condominio_id: "" })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CIDADES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bairro</Label>
              <Select value={form.bairro_id} onValueChange={(v) => setForm({ ...form, bairro_id: v, condominio_id: "" })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sem bairro" /></SelectTrigger>
                <SelectContent>
                  {bairrosDaCidade.map((b) => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>CEP</Label><Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="95000-000" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-30.08" /></div>
            <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-51.02" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Splitter</Label>
              <Select value={form.splitter} onValueChange={(v) => setForm({ ...form, splitter: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{SPLITTER_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Potência (dBm)</Label><Input value={form.potencia} onChange={(e) => setForm({ ...form, potencia: e.target.value })} placeholder="-18.5" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>OLT</Label>
              <Select value={form.id_olt} onValueChange={(v) => setForm({ ...form, id_olt: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar OLT" /></SelectTrigger>
                <SelectContent>{olts.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome} ({o.ip})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <FolderSelect value={form.pasta_id} onChange={(v) => setForm({ ...form, pasta_id: v })} pastas={pastas} />
          <div>
            <Label>Fotos (máx. 4 — PNG/JPEG)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.fotos.map((url) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="foto" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, fotos: form.fotos.filter((f) => f !== url) })} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {novasFotos.map((file, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => setNovasFotos(novasFotos.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {form.fotos.length + novasFotos.length < 4 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-[#00C7D9] hover:text-[#00C7D9] transition-colors text-[#9CA3AF]">
                  <Camera className="w-5 h-5" /><span className="text-[10px] mt-1">Adicionar</span>
                  <input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={handlePhotoSelect} />
                </label>
              )}
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar CTO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}