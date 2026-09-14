import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Folder, Check } from "lucide-react";
import { flattenFolderTree, getFolderPath } from "@/lib/folders";

export default function FolderSelect({ value, onChange, pastas }) {
  const [open, setOpen] = useState(false);
  const flat = flattenFolderTree(pastas || []);
  const selected = flat.find((f) => f.id === value);
  const displayText = selected ? getFolderPath(selected.id, pastas) : "Sem pasta";

  return (
    <div>
      <Label>Pasta</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between rounded-xl font-normal text-sm mt-1 h-9">
            <span className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{displayText}</span>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-1 max-h-64 overflow-y-auto" align="start">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors ${!value ? "bg-[#E0F7FA] text-[#00A8BD] font-medium" : "text-gray-600"}`}
          >
            <Folder className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Sem pasta</span>
            {!value && <Check className="w-3.5 h-3.5 ml-auto text-[#00C7D9]" />}
          </button>
          {flat.map((p) => {
            const parent = (pastas || []).find((f) => f.id === p.parent_id);
            return (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); }}
                style={{ paddingLeft: `${p.depth * 16 + 8}px` }}
                className={`flex items-center gap-2 w-full pr-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors ${value === p.id ? "bg-[#E0F7FA] text-[#00A8BD] font-medium" : "text-gray-600"}`}
              >
                <Folder className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{p.nome}</span>
                <span className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                  {parent && <span className="text-[10px] text-gray-400">em {parent.nome}</span>}
                  {value === p.id && <Check className="w-3.5 h-3.5 text-[#00C7D9]" />}
                </span>
              </button>
            );
          })}
          {flat.length === 0 && (
            <p className="text-xs text-gray-400 px-2 py-3 text-center">Nenhuma pasta criada</p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
