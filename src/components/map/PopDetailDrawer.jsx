import React, { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import ModalCadastroPop from "@/components/bairro/ModalCadastroPop";
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

export default function PopDetailDrawer({ pop, pastas, onClose, onSaved }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  if (!pop) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.entities.Pop.delete(pop.id);
      toast({ title: "POP excluído" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Erro ao excluir POP", variant: "destructive" });
    }
    setDeleting(false);
  };

  const handleSave = async (data) => {
    await api.entities.Pop.update(pop.id, data);
    toast({ title: "POP atualizado" });
    onSaved();
    setEditOpen(false);
    onClose();
  };

  return (
    <div className="w-80 h-full bg-white rounded-2xl shadow-xl border border-border p-4 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-[#1A1A2E]">{pop.nome}</h3>
        <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold uppercase">Endereço</p>
            <p className="text-[#1A1A2E] font-medium">{pop.endereco || "Sem endereço"}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CIDADE</p><p>{pop.cidade || "N/A"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CEP</p><p>{pop.cep || "—"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">TIPO</p><p className="capitalize">{pop.tipo || "—"}</p></div>
          {pop.descricao && (
            <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
              <p className="text-[#9CA3AF] font-bold uppercase">Descrição</p>
              <p className="text-[#1A1A2E]">{pop.descricao}</p>
            </div>
          )}
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold">COORDENADAS</p>
            <p className="text-[#1A1A2E]">{pop.latitude != null ? `${pop.latitude}, ${pop.longitude}` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button onClick={() => setEditOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2D2D44] transition-colors">
          <Pencil className="w-4 h-4" /> Editar
        </button>
        <button onClick={() => setConfirmOpen(true)} disabled={deleting} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ModalCadastroPop
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editing={pop}
        pastas={pastas || []}
        onSave={handleSave}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá o POP "{pop.nome}" permanentemente.
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