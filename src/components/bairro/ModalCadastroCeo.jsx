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

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
const TIPOS = [
  { value: "emenda", label: "Emenda" },
  { value: "distribuicao", label: "Distribuição" },
  { value: "transicao", label: "Transição" },
];
const SPLITTER_OPTIONS = ["1x2", "1x4", "1x8", "1x16", "1x32", "1x64"];

const splitCount = (s) => (!s ? 8 : parseInt(s.split("x")[1], 10));

const resizeSecundarios = (arr, n) => {
  const res = [...arr];
  while (res.length < n) res.push({ porta: res.length + 1, endereco: "", potencia: "" });
  if (res.length > n) res.length = n;
  return res.map((s, i) => ({ ...s, porta: i + 1 }));
};

const pad = (n) => String(n).padStart(2, "0");

export default function ModalCadastroCeo({ isOpen, onClose, editing, bairros, pastas, preCoords, onSave }) {
  const [form, setForm] = useState({
    codigo: "", nome: "", descricao: "", endereco: "", cep: "", cidade: "Viamão", bairro_id: "",
    tipo: "emenda", capacidade_fibras: "", splitter: "1x8", secundarios: [],
    latitude: "", longitude: "", pasta_id: "", fotos: [],
  });
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
      const sp = editing.splitter || "1x8";
      setForm({
        codigo: editing.codigo || "", nome: editing.nome || "", descricao: editing.descricao || "",
        endereco: editing.endereco || "", cep: editing.cep || "",
        cidade: editing.cidade || "Viamão", bairro_id: editing.bairro_id || "",
        tipo: editing.tipo || "emenda",
        capacidade_fibras: editing.capacidade_fibras != null ? String(editing.capacidade_fibras) : "",
        splitter: sp,
        secundarios: resizeSecundarios(editing.secundarios || [], splitCount(sp)),
        latitude: editing.latitude != null ? String(editing.latitude) : "",
        longitude: editing.longitude != null ? String(editing.longitude) : "",
        pasta_id: editing.pasta_id || "",
        fotos: editing.fotos || [],
      });
    } else {
      const sp = "1x8";
      setForm({
        codigo: "", nome: "", descricao: "", endereco: "", cep: "", cidade: "Viamão", bairro_id: "",
        tipo: "emenda", capacidade_fibras: "", splitter: sp,
        secundarios: resizeSecundarios([], splitCount(sp)),
        latitude: preCoords ? String(preCoords.lat) : "", longitude: preCoords ? String(preCoords.lng) : "",
        pasta_id: "", fotos: [],
      });
    }
    setNovasFotos([]);
  }, [isOpen, editing, preCoords]);

  const handleSplitterChange = (v) => {
    setForm((f) => ({ ...f, splitter: v, secundarios: resizeSecundarios(f.secundarios, splitCount(v)) }));
  };

  const updateSecundario = (i, patch) => {
    setForm((f) => ({ ...f, secundarios: f.secundarios.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => ["image/png", "image/jpeg"].includes(f.type));
    if (files.length + form.fotos.length + novasFotos.length > 6) {
      toast({ title: "Máximo de 6 fotos", variant: "destructive" });
      return;
    }
    setNovasFotos([...novasFotos, ...files]);
  };

  const handleSave = async () => {
    if (!form.codigo.trim()) {
      toast({ title: "Informe o código", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let fotos = [...(form.fotos || [])];
      for (const file of novasFotos) {
        const { file_url } = await api.integrations.Core.UploadFile({ file });
        fotos.push(file_url);
      }
      await onSave({
        codigo: form.codigo.trim(),
        nome: form.nome.trim(),
        descricao: form.descricao,
        endereco: form.endereco,
        cep: form.cep,
        cidade: form.cidade,
        bairro_id: form.bairro_id || null,
        tipo: form.tipo,
        capacidade_fibras: form.capacidade_fibras ? parseInt(form.capacidade_fibras, 10) : null,
        splitter: form.splitter,
        secundarios: form.secundarios.map((s) => ({
          porta: s.porta,
          endereco: s.endereco,
          potencia: s.potencia,
        })),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        pasta_id: form.pasta_id || null,
        fotos,
        data_ultima_atualizacao: new Date().toISOString(),
      });
      setNovasFotos([]);
      onClose();
    } catch {
      toast({ title: "Erro ao salvar CEO", variant: "destructive" });
    }
    setSaving(false);
  };

  const bairrosDaCidade = (bairros || []).filter((b) => b.cidade === form.cidade);
  const portCount = splitCount(form.splitter);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar Caixa de Emenda" : "Nova Caixa de Emenda (CEO)"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="CEO-001" /></div>
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="CEO-01-PON1" /></div>
          </div>
          <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: CEO 1X8 PRIMARIO DISTRIBUINDO SECUNDARIOS" /></div>
          <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua Exemplo, 123" /></div>
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
          <div><Label>CEP</Label><Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="95000-000" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Splitter</Label>
              <Select value={form.splitter} onValueChange={handleSplitterChange}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{SPLITTER_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Cap. Fibras</Label><Input type="number" value={form.capacidade_fibras} onChange={(e) => setForm({ ...form, capacidade_fibras: e.target.value })} placeholder="12" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-30.08" /></div>
            <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-51.02" /></div>
          </div>

          <div className="rounded-2xl border border-border p-3 bg-muted/40">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold uppercase text-[#6B7280]">Saídas (Secundários / CTOs)</Label>
              <span className="text-xs text-[#9CA3AF]">{portCount} portas</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {form.secundarios.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-7 h-9 rounded-lg bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center">{pad(s.porta)}</span>
                  <Input
                    value={s.endereco}
                    onChange={(e) => updateSecundario(i, { endereco: e.target.value })}
                    placeholder="Endereço do secundário / CTO"
                    className="flex-1"
                  />
                  <Input
                    value={s.potencia}
                    onChange={(e) => updateSecundario(i, { potencia: e.target.value })}
                    placeholder="dBm"
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </div>

          <FolderSelect value={form.pasta_id} onChange={(v) => setForm({ ...form, pasta_id: v })} pastas={pastas} />

          <div>
            <Label>Fotos (máx. 6 — PNG/JPEG)</Label>
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
              {form.fotos.length + novasFotos.length < 6 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-[#00C7D9] hover:text-[#00C7D9] transition-colors text-[#9CA3AF]">
                  <Camera className="w-5 h-5" /><span className="text-[10px] mt-1">Adicionar</span>
                  <input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={handlePhotoSelect} />
                </label>
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar CEO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}