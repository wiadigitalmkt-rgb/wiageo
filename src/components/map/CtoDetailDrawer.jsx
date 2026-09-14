import React, { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import PortManager from "@/components/map/PortManager";
import PhotoGallery from "@/components/map/PhotoGallery";
import ClientStatusSummary from "@/components/map/ClientStatusSummary";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import ModalCadastroCto from "@/components/bairro/ModalCadastroCto";
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

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export default function CtoDetailDrawer({ cto, clientes, bairros, olts, pastas, onClose, onSaved }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  if (!cto) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.entities.Cto.delete(cto.id);
      toast({ title: "CTO excluída" });
      onSaved();
      onClose();
    } catch { toast({ title: "Erro ao excluir CTO", variant: "destructive" }); }
    setDeleting(false);
  };

  return (
    <div className="w-80 h-full bg-white rounded-2xl shadow-xl border border-border p-4 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-[#1A1A2E]">{cto.codigo}</h3>
        <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold uppercase">Endereço</p>
            <p className="text-[#1A1A2E] font-medium">{cto.endereco || "Sem endereço"}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CIDADE</p><p>{cto.cidade || "N/A"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">CEP</p><p>{cto.cep || "—"}</p></div>
          <div className="bg-gray-50 p-2 rounded-lg"><p className="text-[#9CA3AF] font-bold">POTÊNCIA</p><p>{cto.potencia != null ? `${cto.potencia} dBm` : "N/A"}</p></div>
          {cto.descricao && (
            <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
              <p className="text-[#9CA3AF] font-bold uppercase">Descrição</p>
              <p className="text-[#1A1A2E]">{cto.descricao}</p>
            </div>
          )}
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold">OLT</p>
            <p className="text-[#1A1A2E] truncate">{cto.olt_nome || "Não definida"}</p>
          </div>
          <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
            <p className="text-[#9CA3AF] font-bold">ÚLTIMA ATUALIZAÇÃO</p>
            <p className="text-[#1A1A2E]">{formatDate(cto.data_ultima_atualizacao)}</p>
          </div>
        </div>

        <ClientStatusSummary ctoClients={clientes.filter((c) => c.id_cto === cto.id)} />

        <PortManager cto={cto} clientes={clientes} onSaved={onSaved} />

        <PhotoGallery fotos={cto.fotos || []} />
      </div>

      <div className="mt-2 flex gap-2">
        <button onClick={() => setEditOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-semibold hover:bg-[#2D2D44] transition-colors">
          <Pencil className="w-4 h-4" /> Editar
        </button>
        <button onClick={() => setConfirmOpen(true)} disabled={deleting} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ModalCadastroCto
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editing={cto}
        bairros={bairros || []}
        olts={olts || []}
        pastas={pastas || []}
        onSave={() => { onSaved(); onClose(); }}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá a CTO "{cto.codigo}" permanentemente.
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