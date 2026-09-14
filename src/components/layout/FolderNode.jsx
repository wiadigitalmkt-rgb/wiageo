import React, { useState } from "react";
import { ChevronDown, ChevronRight, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/api/apiClient";
import SidebarStatusBadges from "./SidebarStatusBadges";

const COLORS = [
  { dot: "bg-[#00C7D9]", text: "text-[#00A8BD]", hover: "hover:bg-[#E0F7FA]" },
  { dot: "bg-blue-500", text: "text-blue-600", hover: "hover:bg-blue-50" },
  { dot: "bg-purple-500", text: "text-purple-600", hover: "hover:bg-purple-50" },
  { dot: "bg-pink-500", text: "text-pink-600", hover: "hover:bg-pink-50" },
  { dot: "bg-orange-500", text: "text-orange-600", hover: "hover:bg-orange-50" },
  { dot: "bg-green-500", text: "text-green-600", hover: "hover:bg-green-50" },
];

export default function FolderNode({ folder, folders, items, depth, tipoItem, entity, nameField, selectedId, statusMap, onItemClick, onMoveItem, onRefresh }) {
  const isCto = tipoItem === "cto";
  const [expanded, setExpanded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [editName, setEditName] = useState(folder.nome);
  const [dragOver, setDragOver] = useState(false);

  const color = COLORS[depth % COLORS.length];
  const childFolders = folders.filter((f) => (f.parent_id || null) === folder.id);
  const childItems = items.filter((i) => (i.pasta_id || null) === folder.id);

  const handleCreate = async () => {
    if (!newName.trim()) { setCreating(false); setNewName(""); return; }
    await api.entities.Pasta.create({ nome: newName.trim(), parent_id: folder.id, tipo_item: tipoItem });
    setNewName("");
    setCreating(false);
    setExpanded(true);
    onRefresh();
  };

  const handleRename = async () => {
    if (!editName.trim() || editName === folder.nome) { setRenaming(false); setEditName(folder.nome); return; }
    await api.entities.Pasta.update(folder.id, { nome: editName.trim() });
    setRenaming(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Excluir "${folder.nome}" e suas subpastas? Os itens serão movidos para a raiz.`)) return;
    await deleteFolderRecursive(folder.id);
    onRefresh();
  };

  const deleteFolderRecursive = async (folderId) => {
    const subs = folders.filter((f) => (f.parent_id || null) === folderId);
    for (const sub of subs) {
      await deleteFolderRecursive(sub.id);
    }
    const folderItems = items.filter((i) => i.pasta_id === folderId);
    for (const item of folderItems) {
      await api.entities[entity].update(item.id, { pasta_id: null });
    }
    await api.entities.Pasta.delete(folderId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.itemId) {
        onMoveItem(data.itemId, folder.id);
      }
    } catch {}
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-1 w-full px-2 py-1.5 rounded-lg ${color.hover} transition-all group ${dragOver ? "ring-2 ring-[#00C7D9] bg-[#E0F7FA]" : ""}`}
      >
        <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
        </button>
        <span className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
        {renaming ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setRenaming(false); setEditName(folder.nome); } }}
            onBlur={handleRename}
            className="flex-1 px-1 text-xs border border-[#00C7D9] rounded outline-none bg-white min-w-0"
          />
        ) : (
          <span className={`flex-1 text-left truncate text-xs font-medium ${color.text}`}>{folder.nome}</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setCreating(true); setExpanded(true); }} className="p-0.5 rounded hover:bg-white/60" title="Nova subpasta">
            <FolderPlus className="w-3 h-3 text-gray-400" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setRenaming(true); }} className="p-0.5 rounded hover:bg-white/60" title="Renomear">
            <Pencil className="w-3 h-3 text-gray-400" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-0.5 rounded hover:bg-white/60" title="Excluir">
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-3 border-l border-border pl-1.5 mt-0.5 space-y-0.5">
          {creating && (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
              onBlur={handleCreate}
              placeholder="Nome da subpasta..."
              className="w-full px-2 py-1 text-xs border border-[#00C7D9] rounded-lg outline-none"
            />
          )}
          {childFolders.map((sub) => (
            <FolderNode
              key={sub.id}
              folder={sub}
              folders={folders}
              items={items}
              depth={depth + 1}
              tipoItem={tipoItem}
              entity={entity}
              nameField={nameField}
              selectedId={selectedId}
              statusMap={statusMap}
              onItemClick={onItemClick}
              onMoveItem={onMoveItem}
              onRefresh={onRefresh}
            />
          ))}
          {childItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", JSON.stringify({ itemId: item.id })); e.dataTransfer.effectAllowed = "move"; }}
              onClick={() => onItemClick(item)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-gray-600 ${color.hover} transition-colors text-left cursor-grab active:cursor-grabbing ${item.id === selectedId ? "bg-[#E0F7FA] text-[#00A8BD] ring-1 ring-[#00C7D9] font-semibold" : ""}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${color.dot} flex-shrink-0`} />
              <span className="truncate flex-1">{item[nameField] || "Sem nome"}</span>
              {isCto && statusMap?.[item.id] && <SidebarStatusBadges counts={statusMap[item.id]} />}
            </div>
          ))}
          {childFolders.length === 0 && childItems.length === 0 && !creating && (
            <p className="text-[10px] text-gray-300 px-2 py-1">Arraste itens aqui</p>
          )}
        </div>
      )}
    </div>
  );
}