import React from "react";
import { Wrench, Pencil, Trash2, MapPin } from "lucide-react";

export default function CeoCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] flex items-center justify-center">
          <Wrench className="w-4 h-4 text-[#6366F1]" />
        </div>
        <div>
          <p className="font-semibold text-[#1A1A2E]">{item.codigo}</p>
          <p className="text-xs text-[#6B7280]">{item.tipo} · {item.capacidade_fibras || "—"} fibras</p>
          {item.descricao && <p className="text-xs text-[#9CA3AF] flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.descricao}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-[#6B7280] hover:border-[#00C7D9] hover:text-[#00C7D9] transition-colors text-xs font-medium">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium">
          <Trash2 className="w-3.5 h-3.5" /> Excluir
        </button>
      </div>
    </div>
  );
}