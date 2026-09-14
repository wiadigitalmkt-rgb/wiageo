import React, { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import ModalCadastroCeo from "@/components/bairro/ModalCadastroCeo";
import PhotoGallery from "@/components/map/PhotoGallery";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const pad = (n) => String(n).padStart(2, "0");
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export default function CeoDetailDrawer({ ceo, bairros, pastas, onClose, onSaved }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  if (!ceo) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.entities.Ceo.delete(ceo.id);
      toast({ title: "CEO excluída" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Erro ao excluir CEO", variant: "destructive" });
    }
    setDeleting(false);
  };

  const handleSave = async (data) => {
    await api.entities.Ceo.update(ceo.id, { ...data, condominio_id: ceo.condominio_id });
    toast({ title: "CEO atualizada" });
    onSaved();
    setEditOpen(false);
    onClose();
  };

  const secundarios = (ceo.secundarios || []).filter((s) => s.endereco);

  return (
    <div className="w-80 h-full bg-white rounded-2xl shadow-xl border border-border p-4 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-[#1A1A2E]">{ceo.nome || ceo.codigo}</h3>
        <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold uppercase">Descrição</p>
            <p className="text-[#1A1A2E] font-medium">{ceo.descricao || "Sem descrição"}</p>
          </div>
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold uppercase">Endereço</p>
            <p className="text-[#1A1A2E] font-medium">{ceo.endereco || "Sem endereço"}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CIDADE</p><p>{ceo.cidade || "N/A"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CEP</p><p>{ceo.cep || "—"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">SPLITTER</p><p>{ceo.splitter || "1x8"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">TIPO</p><p className="capitalize">{ceo.tipo || "—"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">FIBRAS</p><p>{ceo.capacidade_fibras || "—"}</p></div>
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold">COORDENADAS</p>
            <p className="text-[#1A1A2E]">{ceo.latitude != null ? `${ceo.latitude}, ${ceo.longitude}` : "—"}</p>
          </div>
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold">ÚLTIMA ATUALIZAÇÃO</p>
            <p className="text-[#1A1A2E]">{formatDate(ceo.data_ultima_atualizacao)}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase text-[#6366F1] mb-2">Secundários ({secundarios.length})</p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {secundarios.length === 0 && <p className="text-xs text-[#9CA3AF]">Nenhum secundário cadastrado</p>}
            {secundarios.map((s) => (
              <div key={s.porta} className="flex items-start gap-2 text-xs bg-gray-50 rounded-lg p-2">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-[#6366F1]/10 text-[#6366F1] font-bold flex items-center justify-center">{pad(s.porta)}</span>
                <div>
                  <p className="text-[#1A1A2E] font-medium">{s.endereco}</p>
                  {s.potencia && <p className="text-[#9CA3AF]">{s.potencia}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <PhotoGallery fotos={ceo.fotos || []} />
      </div>

      <div className="mt-2 flex gap-2">
        <button onClick={() => setEditOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2D2D44] transition-colors">
          <Pencil className="w-4 h-4" /> Editar
        </button>
        <button onClick={() => setConfirmOpen(true)} disabled={deleting} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ModalCadastroCeo
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editing={ceo}
        bairros={bairros || []}
        pastas={pastas || []}
        onSave={handleSave}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá a CEO "{ceo.nome || ceo.codigo}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}