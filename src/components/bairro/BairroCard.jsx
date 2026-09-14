import React from "react";
import { Map, Box, Cable, Wrench, ChevronRight, Pencil, Trash2 } from "lucide-react";

export default function BairroCard({ bairro, counts, onClick, onEdit, onDelete }) {
  const { ctos = 0, ceos = 0, cabos = 0, elementos = 0 } = counts;
  const total = ctos + ceos + cabos + elementos;

  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-border p-5 hover:border-[#00C7D9] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
            <Map className="w-5 h-5 text-[#00C7D9]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A2E]">{bairro.nome}</p>
            <p className="text-xs text-[#9CA3AF]">{total} ativos no bairro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(bairro); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-[#6B7280] hover:border-[#00C7D9] hover:text-[#00C7D9] transition-colors text-xs font-medium">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(bairro.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          )}
          <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#00C7D9] transition-colors" />
        </div>
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1 text-[#6B7280]">
          <Box className="w-3.5 h-3.5 text-[#F59E0B]" /> {ctos} CTOs
        </span>
        <span className="flex items-center gap-1 text-[#6B7280]">
          <Wrench className="w-3.5 h-3.5 text-[#6366F1]" /> {ceos} CEOs
        </span>
        <span className="flex items-center gap-1 text-[#6B7280]">
          <Cable className="w-3.5 h-3.5 text-[#10B981]" /> {cabos} Cabos
        </span>
        <span className="flex items-center gap-1 text-[#6B7280]">
          <Map className="w-3.5 h-3.5 text-[#9CA3AF]" /> {elementos} Outros
        </span>
      </div>
    </div>
  );
}
