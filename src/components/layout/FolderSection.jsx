import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/api/apiClient";
import { Loader2, FolderPlus } from "lucide-react";
import FolderNode from "./FolderNode";
import SidebarStatusBadges from "./SidebarStatusBadges";
import { useMkauthStatus } from "@/hooks/useMkauthStatus";
import { useClickVsDrag } from "@/hooks/useClickVsDrag";

export default function FolderSection({ tipoItem, entity, nameField, selectedId, onItemClick }) {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const isCto = tipoItem === "cto";
  const allLogins = useMemo(
    () => (isCto ? clientes.map((c) => c.pppoe).filter(Boolean) : []),
    [isCto, clientes]
  );
  const statuses = useMkauthStatus(allLogins);

  const statusMap = useMemo(() => {
    if (!isCto) return {};
    const map = {};
    clientes.forEach((c) => {
      if (!c.id_cto) return;
      if (!map[c.id_cto]) map[c.id_cto] = { online: 0, offline: 0 };
      const s = c.pppoe ? statuses[c.pppoe]?.status : null;
      if (s === "online") map[c.id_cto].online++;
      else if (s === "offline") map[c.id_cto].offline++;
    });
    return map;
  }, [isCto, clientes, statuses]);

  const load = async () => {
    try {
      const [f, i, cl] = await Promise.all([
        api.entities.Pasta.filter({ tipo_item: tipoItem }),
        api.entities[entity].list(),
        isCto ? api.entities.ClienteFibra.list() : Promise.resolve([]),
      ]);
      setFolders(f);
      setItems(i);
      setClientes(cl);
    } catch {
      setFolders([]);
      setItems([]);
      setClientes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("wiageo-data-changed", handler);
    return () => window.removeEventListener("wiageo-data-changed", handler);
  }, []);

  const handleCreateRoot = async () => {
    if (!newName.trim()) { setCreating(false); setNewName(""); return; }
    await api.entities.Pasta.create({ nome: newName.trim(), parent_id: null, tipo_item: tipoItem });
    setNewName("");
    setCreating(false);
    load();
  };

  const handleMoveItem = async (itemId, targetFolderId) => {
    await api.entities[entity].update(itemId, { pasta_id: targetFolderId });
    load();
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.itemId) {
        handleMoveItem(data.itemId, null);
      }
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-[#00C7D9]" /></div>;

  const rootFolders = folders.filter((f) => !f.parent_id);
  const unfiledItems = items.filter((i) => !i.pasta_id);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleRootDrop}
      className="mt-1 ml-2 space-y-0.5"
    >
      {creating ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreateRoot(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
          onBlur={handleCreateRoot}
          placeholder="Nome da pasta..."
          className="w-full px-2 py-1.5 text-xs border border-[#00C7D9] rounded-lg outline-none"
        />
      ) : (
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs text-[#9CA3AF] hover:bg-muted hover:text-[#00C7D9] transition-colors">
          <FolderPlus className="w-3.5 h-3.5" /> Nova Pasta
        </button>
      )}

      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          folders={folders}
          items={items}
          depth={0}
          tipoItem={tipoItem}
          entity={entity}
          nameField={nameField}
          selectedId={selectedId}
          statusMap={statusMap}
          onItemClick={onItemClick}
          onMoveItem={handleMoveItem}
          onRefresh={load}
        />
      ))}

      {unfiledItems.length > 0 && (
        <div className={`pt-1 ${rootFolders.length > 0 ? "mt-1 border-t border-border" : ""}`}>
          {rootFolders.length > 0 && <p className="text-[10px] text-gray-400 px-2 py-1 font-medium">Sem pasta</p>}
          {unfiledItems.map((item) => (
            <UnfiledItemRow
              key={item.id}
              item={item}
              nameField={nameField}
              selectedId={selectedId}
              isCto={isCto}
              statusMap={statusMap}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}

      {rootFolders.length === 0 && unfiledItems.length === 0 && !creating && (
        <p className="text-xs text-gray-400 px-2 py-3">Nenhum item cadastrado</p>
      )}
    </div>
  );
}

// Mesma lógica de clique-vs-arraste do FolderNode.jsx, aqui pros itens que
// ainda não estão em nenhuma pasta.
function UnfiledItemRow({ item, nameField, selectedId, isCto, statusMap, onItemClick }) {
  const { onMouseDown, onMouseUp } = useClickVsDrag(() => onItemClick(item));

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", JSON.stringify({ itemId: item.id })); e.dataTransfer.effectAllowed = "move"; }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-[#E0F7FA] hover:text-[#00A8BD] transition-colors text-left cursor-grab active:cursor-grabbing ${item.id === selectedId ? "bg-[#E0F7FA] text-[#00A8BD] ring-1 ring-[#00C7D9] font-semibold" : ""}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
      <span className="truncate flex-1">{item[nameField] || "Sem nome"}</span>
      {isCto && statusMap[item.id] && <SidebarStatusBadges counts={statusMap[item.id]} />}
    </div>
  );
}
