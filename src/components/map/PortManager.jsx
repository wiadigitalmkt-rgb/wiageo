import React, { useState } from "react";
import { UserPlus, Pencil, Trash2, X, Check, Eye } from "lucide-react";
import { api } from "@/api/apiClient";
import { useToast } from "@/components/ui/use-toast";
import PortCapacityBadge from "@/components/shared/PortCapacityBadge";
import StatusDot from "@/components/map/StatusDot";
import { useMkauthStatus } from "@/hooks/useMkauthStatus";

export default function PortManager({ cto, clientes, onSaved }) {
  const [editingPort, setEditingPort] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingPort, setViewingPort] = useState(null);
  const [form, setForm] = useState({ nome: "", endereco: "", pppoe: "", porta_conectada: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const total = !cto.splitter ? 8 : parseInt(cto.splitter.split("x")[1], 10);
  const ctoClients = clientes.filter((c) => c.id_cto === cto.id);
  const statuses = useMkauthStatus(ctoClients.map((c) => c.pppoe).filter(Boolean));
  const ocupadas = ctoClients.length;
  const getClientForPort = (port) => ctoClients.find((c) => c.porta_conectada === port);

  const startAdd = (port) => {
    setEditingPort(port);
    setEditingClient(null);
    setViewingPort(null);
    setForm({ nome: "", endereco: "", pppoe: "", porta_conectada: String(port) });
  };

  const startEdit = (port) => {
    const client = getClientForPort(port);
    setEditingPort(port);
    setEditingClient(client);
    setViewingPort(null);
    setForm({ nome: client.nome || "", endereco: client.endereco || "", pppoe: client.pppoe || "", porta_conectada: String(port) });
  };

  const cancel = () => { setEditingPort(null); setEditingClient(null); setViewingPort(null); };

  const touchCtoTimestamp = () =>
    api.entities.Cto.update(cto.id, { data_ultima_atualizacao: new Date().toISOString() }).catch(() => {});

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Informe o nome do cliente", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const data = { nome: form.nome.trim(), endereco: form.endereco, pppoe: form.pppoe, id_cto: cto.id, porta_conectada: parseInt(form.porta_conectada, 10) };
      if (editingClient) {
        await api.entities.ClienteFibra.update(editingClient.id, data);
        toast({ title: "Cliente atualizado" });
      } else {
        await api.entities.ClienteFibra.create(data);
        toast({ title: "Cliente cadastrado" });
      }
      await touchCtoTimestamp();
      onSaved();
      cancel();
    } catch { toast({ title: "Erro ao salvar cliente", variant: "destructive" }); }
    setSaving(false);
  };

  const handleRemove = async (port) => {
    const client = getClientForPort(port);
    if (!client) return;
    if (!window.confirm(`Remover "${client.nome}" da porta ${port}?`)) return;
    try {
      await api.entities.ClienteFibra.delete(client.id);
      await touchCtoTimestamp();
      toast({ title: "Cliente removido" });
      onSaved();
    } catch { toast({ title: "Erro ao remover", variant: "destructive" }); }
  };

  const occupiedPorts = new Set(ctoClients.map((c) => c.porta_conectada));
  const availablePorts = Array.from({ length: total }, (_, i) => i + 1).filter((p) => !occupiedPorts.has(p) || p === editingPort);

  const inputCls = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-white outline-none focus:border-[#00C7D9] transition-colors";

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Portas ({ocupadas}/{total})</p>
        <PortCapacityBadge ocupadas={ocupadas} total={total} />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: total }, (_, i) => {
          const portNum = i + 1;
          const client = getClientForPort(portNum);

          if (editingPort === portNum) {
            return (
              <div key={portNum} className="p-2.5 rounded-xl border border-[#00C7D9] bg-[#F0FDFF] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00C7D9] text-white flex items-center justify-center text-[10px] font-bold">{portNum}</span>
                  <span className="text-[11px] font-semibold text-[#00A8BD]">{editingClient ? "Editar cliente" : "Novo cliente"}</span>
                </div>
                <input autoFocus value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do cliente" className={inputCls} />
                <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço" className={inputCls} />
                <input value={form.pppoe} onChange={(e) => setForm({ ...form, pppoe: e.target.value })} placeholder="PPPoE (usuario@provedor)" className={inputCls} />
                {editingClient && (
                  <select value={form.porta_conectada} onChange={(e) => setForm({ ...form, porta_conectada: e.target.value })} className={inputCls}>
                    {availablePorts.map((p) => <option key={p} value={String(p)}>Mover para Porta {p}</option>)}
                  </select>
                )}
                <div className="flex gap-1.5 pt-0.5">
                  <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#00C7D9] text-white text-xs font-semibold hover:bg-[#00A8BD] disabled:opacity-50 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Salvar
                  </button>
                  <button onClick={cancel} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#6B7280] hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }

          if (viewingPort === portNum && client) {
            return (
              <div key={portNum} className="p-2.5 rounded-lg border border-[#00C7D9] bg-[#F0FDFF] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00C7D9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">{portNum}</span>
                  <span className="text-xs font-semibold text-[#1A1A2E] flex-1 truncate">{client.nome}</span>
                  <button onClick={() => setViewingPort(null)} className="p-1 rounded-lg text-gray-400 hover:text-[#1A1A2E] transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="text-[10px] space-y-1 pl-8">
                  <p className="flex items-center gap-1.5">
                    <StatusDot status={statuses[client.pppoe]?.status} />
                    <span className="text-[#9CA3AF] font-bold uppercase">Status: </span>
                    <span className="text-[#1A1A2E]">{statuses[client.pppoe]?.status === "online" ? "Online" : statuses[client.pppoe]?.status === "offline" ? "Offline" : "Verificando..."}</span>
                  </p>
                  <p><span className="text-[#9CA3AF] font-bold uppercase">Endereço: </span><span className="text-[#1A1A2E]">{client.endereco || "—"}</span></p>
                  <p><span className="text-[#9CA3AF] font-bold uppercase">PPPoE: </span><span className="text-[#1A1A2E]">{client.pppoe || "—"}</span></p>
                  {statuses[client.pppoe]?.ip && (
                    <p><span className="text-[#9CA3AF] font-bold uppercase">IP: </span><span className="text-[#1A1A2E] font-mono">{statuses[client.pppoe].ip}</span></p>
                  )}
                  {statuses[client.pppoe]?.mac && (
                    <p><span className="text-[#9CA3AF] font-bold uppercase">MAC: </span><span className="text-[#1A1A2E] font-mono">{statuses[client.pppoe].mac}</span></p>
                  )}
                  {statuses[client.pppoe]?.status === "online" && statuses[client.pppoe]?.connected_at && (
                    <p><span className="text-[#9CA3AF] font-bold uppercase">Conectado em: </span><span className="text-[#1A1A2E]">{statuses[client.pppoe].connected_at}</span></p>
                  )}
                  {statuses[client.pppoe]?.status === "offline" && statuses[client.pppoe]?.last_seen && (
                    <p><span className="text-[#9CA3AF] font-bold uppercase">Últ. conexão: </span><span className="text-[#1A1A2E]">{statuses[client.pppoe].last_seen}</span></p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={portNum} className={`group flex items-center gap-2 p-2 rounded-lg border transition-all ${client ? "bg-white border-blue-50" : "bg-gray-50 border-gray-100"}`}>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${client ? "bg-[#00C7D9] text-white" : "bg-gray-200 text-gray-400"}`}>{portNum}</span>
              {client ? (
                <>
                  <div className="flex-1 overflow-hidden flex items-center gap-1.5">
                    <StatusDot status={statuses[client.pppoe]?.status} />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#1A1A2E] truncate leading-tight">{client.nome}</p>
                      <p className="text-[10px] text-[#6B7280] truncate leading-tight">{client.endereco || "Sem endereço"}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setViewingPort(portNum)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#00C7D9] hover:bg-[#E0F7FA] transition-colors" title="Visualizar"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => startEdit(portNum)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#00C7D9] hover:bg-[#E0F7FA] transition-colors" title="Editar / Mover"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleRemove(portNum)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Remover"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-[#9CA3AF]">Livre</span>
                  <button onClick={() => startAdd(portNum)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#00C7D9] hover:bg-[#E0F7FA] transition-colors" title="Adicionar cliente"><UserPlus className="w-3.5 h-3.5" /></button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}