import React from "react";
import { Cable, Pencil, Trash2 } from "lucide-react";

export default function CaboCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
          <Cable className="w-4 h-4 text-[#10B981]" />
        </div>
        <div>
          <p className="font-semibold text-[#1A1A2E]">{item.codigo}</p>
          <p className="text-xs text-[#6B7280]">{item.tipo} · {item.quantidade_fibras || "—"} fibras · {item.metragem || "—"}m</p>
          {(item.origem || item.destino) && <p className="text-xs text-[#9CA3AF]">{item.origem || "?"} → {item.destino || "?"}</p>}
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
