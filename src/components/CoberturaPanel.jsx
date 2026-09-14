import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, MapPinned, Check, X, Pencil, Undo2, Eraser, Save } from "lucide-react";

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
const COB_PALETTE = ["#00C7D9", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6"];

export default function CoberturaPanel({
  coberturas,
  isDrawing,
  draftPointCount,
  selectedCobertura,
  onNewCobertura,
  onUndoPoint,
  onClearDraft,
  onFinishDrawing,
  onCancelDrawing,
  onSelectCobertura,
  onDeleteCobertura,
  onEditCobertura,
  onUpdateCoberturaStyle,
  isEditing,
  editPointCount,
  editCor,
  editOpacidade,
  onChangeEditCor,
  onChangeEditOpacidade,
  onUndoEditPoint,
  onSaveEdit,
  onCancelEdit,
}) {
  const [namingOpen, setNamingOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("Viamão");

  const handleFinish = () => {
    if (draftPointCount < 3) return;
    setNamingOpen(true);
  };

  const handleSave = () => {
    onFinishDrawing({ nome: nome || `Cobertura ${coberturas.length + 1}`, cidade });
    setNamingOpen(false);
    setNome("");
    setCidade("Viamão");
  };

  // ===== EDIT MODE (editar vértices de uma cobertura existente) =====
  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-[#8B5CF6] p-4 bg-[#F5F3FF]">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-5 h-5 text-[#8B5CF6]" />
            <p className="text-sm font-bold text-[#7C3AED]">Editando Cobertura</p>
          </div>
          <p className="text-xs text-[#6B7280] mb-3">
            Arraste os pontos para mover. Clique no mapa para adicionar. Clique num ponto para removê-lo.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-[#8B5CF6]">{editPointCount}</span>
            <span className="text-xs text-[#9CA3AF]">pontos</span>
          </div>

          <div className="space-y-3 mb-3">
            <div>
              <Label className="text-xs">Cor</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COB_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => onChangeEditCor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${editCor === c ? "border-[#1A1A2E] scale-110" : "border-white"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Transparência ({Math.round(editOpacidade * 100)}%)</Label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={editOpacidade}
                onChange={(e) => onChangeEditOpacidade(parseFloat(e.target.value))}
                className="w-full accent-[#8B5CF6] mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <Button
              onClick={onUndoEditPoint}
              disabled={editPointCount === 0}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Undo2 className="w-4 h-4 mr-1" /> Desfazer
            </Button>
            <Button
              onClick={onSaveEdit}
              disabled={editPointCount < 3}
              className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
            >
              <Save className="w-4 h-4 mr-1" /> Salvar
            </Button>
          </div>
          <Button onClick={onCancelEdit} variant="outline" className="w-full rounded-xl">
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ===== DRAW MODE (criando nova cobertura) =====
  if (isDrawing) {
    return (
      <div className="p-4 space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-[#00C7D9] p-4 bg-[#F0FDFA]">
          <div className="flex items-center gap-2 mb-2">
            <MapPinned className="w-5 h-5 text-[#00C7D9]" />
            <p className="text-sm font-bold text-[#00A8BD]">Desenhando Cobertura</p>
          </div>
          <p className="text-xs text-[#6B7280] mb-3">
            Clique no mapa para adicionar pontos. Mínimo 3 pontos. Use "Desfazer" para corrigir erros.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-[#00C7D9]">{draftPointCount}</span>
            <span className="text-xs text-[#9CA3AF]">pontos adicionados</span>
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              onClick={onUndoPoint}
              disabled={draftPointCount === 0}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Undo2 className="w-4 h-4 mr-1" /> Desfazer
            </Button>
            <Button
              onClick={onClearDraft}
              disabled={draftPointCount === 0}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <Eraser className="w-4 h-4 mr-1" /> Limpar
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFinish}
              disabled={draftPointCount < 3}
              className="flex-1 bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl"
            >
              <Check className="w-4 h-4 mr-1" /> Finalizar
            </Button>
            <Button
              onClick={onCancelDrawing}
              variant="outline"
              className="rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Dialog open={namingOpen} onOpenChange={(v) => !v && (setNamingOpen(false), setNome(""))}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nova Área de Cobertura</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Cobertura</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bairro Centro" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Select value={cidade} onValueChange={setCidade}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CIDADES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
                Salvar Cobertura
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== LIST MODE =====
  return (
    <div className="p-4 space-y-3">
      <Button onClick={onNewCobertura} className="w-full bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
        <Plus className="w-4 h-4 mr-2" /> Nova Cobertura
      </Button>

      <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider pt-2">
        Áreas Salvas ({coberturas.length})
      </p>

      <div className="space-y-2">
        {coberturas.map((cob) => {
          const isSelected = selectedCobertura?.id === cob.id;
          const cor = cob.cor || "#94A3B8";
          const opacidade = cob.opacidade != null ? cob.opacidade : 0.3;
          return (
            <div
              key={cob.id}
              className={`rounded-xl border transition-all ${
                isSelected ? "border-[#00C7D9] bg-[#F0FDFA]" : "border-border bg-white hover:border-[#00C7D9]/50"
              }`}
            >
              <div onClick={() => onSelectCobertura(cob)} className="p-3 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ background: cor }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">{cob.nome}</p>
                      <p className="text-xs text-[#6B7280]">{cob.cidade} · {cob.poligono?.length || 0} pontos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditCobertura(cob); }}
                      className="p-1.5 rounded-lg hover:bg-[#F0FDFA] text-[#9CA3AF] hover:text-[#00A8BD] transition-colors"
                      title="Editar pontos"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCobertura(cob.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="px-3 pb-3 pt-1 border-t border-[#00C7D9]/20 space-y-3">
                  <div>
                    <Label className="text-xs">Cor da área</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {COB_PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateCoberturaStyle(cob.id, { cor: c })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${cor === c ? "border-[#1A1A2E] scale-110" : "border-white"}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Transparência ({Math.round(opacidade * 100)}%)</Label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={opacidade}
                      onChange={(e) => onUpdateCoberturaStyle(cob.id, { opacidade: parseFloat(e.target.value) })}
                      className="w-full accent-[#00C7D9] mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {coberturas.length === 0 && (
          <div className="text-center py-10 text-[#9CA3AF]">
            <MapPinned className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma área de cobertura cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}