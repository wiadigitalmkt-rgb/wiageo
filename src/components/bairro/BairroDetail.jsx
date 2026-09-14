import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Box, Layers, Plus, Pencil, Trash2 } from "lucide-react";
import CtoCard from "@/components/bairro/CtoCard";

const EmptyState = ({ icon: Icon, label, onAdd, canAdd }) => (
  <div className="text-center py-12 text-[#9CA3AF]">
    <Icon className="w-10 h-10 mx-auto mb-3 opacity-40" />
    <p className="font-medium mb-3">Nenhum registro</p>
    {canAdd && (
      <Button onClick={onAdd} size="sm" className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
        <Plus className="w-4 h-4 mr-1" /> Adicionar
      </Button>
    )}
  </div>
);

export default function BairroDetail({
  bairro, cidade, isSemBairro, ctos, elementos, olts, clientes,
  onAddCto, onEditCto, onDeleteCto,
  onAddElemento, onEditElemento, onDeleteElemento,
  onOpenClient, onEditClient,
}) {
  const [tab, setTab] = useState("ctos");
  const getOltName = (oltId) => olts.find((o) => o.id === oltId)?.nome || "—";

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="w-full justify-start bg-gray-100 rounded-xl p-1 h-auto">
        <TabsTrigger value="ctos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#00C7D9] data-[state=active]:shadow-sm flex items-center gap-1.5">
          <Box className="w-4 h-4" /> CTOs <span className="text-xs opacity-60">({ctos.length})</span>
        </TabsTrigger>
        {!isSemBairro && (
          <TabsTrigger value="elementos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#00C7D9] data-[state=active]:shadow-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Outros <span className="text-xs opacity-60">({elementos.length})</span>
          </TabsTrigger>
        )}
      </TabsList>

      {/* CTOs Tab */}
      <TabsContent value="ctos" className="mt-4">
        <div className="flex justify-end mb-3">
          <Button onClick={onAddCto} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Adicionar CTO
          </Button>
        </div>
        <div className="space-y-3">
          {ctos.map((cto) => (
            <CtoCard
              key={cto.id} cto={cto} clientes={clientes} oltName={getOltName(cto.id_olt)}
              onEdit={onEditCto} onDelete={onDeleteCto}
              onOpenClient={onOpenClient} onEditClient={onEditClient}
            />
          ))}
          {ctos.length === 0 && <EmptyState icon={Box} label="CTO" onAdd={onAddCto} canAdd />}
        </div>
      </TabsContent>

      {/* Elementos Tab */}
      <TabsContent value="elementos" className="mt-4">
        <div className="flex justify-end mb-3">
          <Button onClick={onAddElemento} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Elemento
          </Button>
        </div>
        <div className="space-y-3">
          {elementos.map((el) => (
            <div key={el.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center"><Layers className="w-4 h-4 text-[#6B7280]" /></div>
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{el.nome}</p>
                  <p className="text-xs text-[#6B7280]">{el.tipo}</p>
                  {el.descricao && <p className="text-xs text-[#9CA3AF]">{el.descricao}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEditElemento(el)} className="p-2 rounded-lg hover:bg-muted text-[#6B7280]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => onDeleteElemento(el.id)} className="p-2 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {elementos.length === 0 && <EmptyState icon={Layers} label="Elemento" onAdd={onAddElemento} canAdd />}
        </div>
      </TabsContent>
    </Tabs>
  );
}