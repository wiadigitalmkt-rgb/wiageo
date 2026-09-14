import React from "react";
import { Box, Package, Server, Radio, Cable, X } from "lucide-react";

const ITEMS = [
  { type: "cto", label: "CTO", icon: Box, placeable: true },
  { type: "ceo", label: "CEO", icon: Package, placeable: true },
  { type: "pop", label: "POP", icon: Server, placeable: true },
  { type: "olt", label: "OLT", icon: Radio, placeable: false },
  { type: "cabo", label: "Cabo", icon: Cable, drawMode: true },
];

export default function MapToolbar({ placementMode, isDrawingCable, onPick, onCancel }) {
  const showBanner = placementMode || isDrawingCable;
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
      {showBanner && (
        <div className="mb-2 flex items-center gap-3 bg-[#1A1A2E] text-white px-4 py-2 rounded-xl shadow-lg text-sm">
          <span>{isDrawingCable ? "Clique no mapa para traçar o cabo" : "Clique no mapa para posicionar o item"}</span>
          <button onClick={onCancel} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex items-center gap-1 bg-white rounded-2xl shadow-lg border border-border p-1.5">
        <span className="px-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Adicionar</span>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = placementMode === item.type || (item.type === "cabo" && isDrawingCable);
          return (
            <button
              key={item.type}
              onClick={() => onPick(item)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? "bg-[#00C7D9] text-white shadow-sm" : "text-[#6B7280] hover:bg-[#E0F7FA] hover:text-[#00A8BD]"
              }`}
              title={`Adicionar ${item.label}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}