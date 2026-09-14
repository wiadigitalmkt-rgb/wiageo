import React from "react";
import { Route as Road, Box, Cable, Wrench, Layers, ChevronRight } from "lucide-react";

export default function GeralCard({ counts, onClick }) {
  const { ctos = 0, ceos = 0, cabos = 0, elementos = 0 } = counts;
  const total = ctos + ceos + cabos + elementos;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] p-5 hover:border-[#00C7D9] hover:bg-white transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E2E8F0] flex items-center justify-center">
            <Road className="w-5 h-5 text-[#64748B]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A2E]">Geral</p>
            <p className="text-xs text-[#94A3B8]">Clientes de rua · {total} ativos</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#00C7D9] transition-colors" />
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1 text-[#6B7280]"><Box className="w-3.5 h-3.5 text-[#F59E0B]" /> {ctos} CTOs</span>
        <span className="flex items-center gap-1 text-[#6B7280]"><Wrench className="w-3.5 h-3.5 text-[#6366F1]" /> {ceos} CEOs</span>
        <span className="flex items-center gap-1 text-[#6B7280]"><Cable className="w-3.5 h-3.5 text-[#10B981]" /> {cabos} Cabos</span>
        <span className="flex items-center gap-1 text-[#6B7280]"><Layers className="w-3.5 h-3.5 text-[#9CA3AF]" /> {elementos} Outros</span>
      </div>
    </button>
  );
}