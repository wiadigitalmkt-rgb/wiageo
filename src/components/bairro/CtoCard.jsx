import React from "react";
import { Box, Pencil, Trash2, MapPin } from "lucide-react";
import PortCapacityBadge from "@/components/shared/PortCapacityBadge";

const STATUS_CONFIG = {
  ativo:      { bg: "#DCFCE7", icon: "#22C55E", label: "Ativa",       badge: "bg-emerald-50 text-emerald-700" },
  manutencao: { bg: "#FEF3C7", icon: "#F59E0B", label: "Manutenção",  badge: "bg-amber-50 text-amber-700" },
  rompido:    { bg: "#FEE2E2", icon: "#EF4444", label: "Rompimento",  badge: "bg-red-50 text-red-700" },
};

const getSplitterTotal = (splitter) => parseInt((splitter || "1x8").split("x")[1], 10);

export default function CtoCard({ cto, clientes, oltName, onEdit, onDelete, onOpenClient, onEditClient }) {
  const total = getSplitterTotal(cto.splitter);
  const ocupadas = clientes.filter((c) => c.id_cto === cto.id).length;
  const getClientForPort = (port) => clientes.find((c) => c.id_cto === cto.id && c.porta_conectada === port);
  const status = STATUS_CONFIG[cto.status] || STATUS_CONFIG.ativo;

  return (
    <div
      className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${status.icon}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: status.bg }}>
            <Box className="w-5 h-5" style={{ color: status.icon }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#1A1A2E]">{cto.codigo}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.badge}`}>{status.label}</span>
            </div>
            <p className="text-sm text-[#6B7280]">OLT: {oltName} · {cto.splitter}</p>
            {cto.descricao && (
              <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {cto.descricao}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PortCapacityBadge ocupadas={ocupadas} total={total} />
          <button onClick={() => onEdit(cto)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-[#6B7280] hover:border-[#00C7D9] hover:text-[#00C7D9] transition-colors text-xs font-medium"><Pencil className="w-3.5 h-3.5" /> Editar</button>
          <button onClick={() => onDelete(cto.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const portNum = i + 1;
          const client = getClientForPort(portNum);
          return (
            <button
              key={i}
              onClick={() => (client ? onEditClient(client) : onOpenClient(cto.id, portNum))}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                client ? "bg-[#00C7D9] text-white cursor-pointer hover:bg-[#00A8BD]" : "bg-[#F5F5F7] text-[#9CA3AF] border border-border hover:border-[#00C7D9]"
              }`}
              title={client ? `Porta ${portNum} — ${client.nome}` : `Porta ${portNum} — Livre`}
            >
              {portNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}