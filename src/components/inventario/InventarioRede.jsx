import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ChevronRight, Home, MapPin, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BairroCard from "@/components/bairro/BairroCard";
import CondominioCard from "@/components/bairro/CondominioCard";
import GeralCard from "@/components/bairro/GeralCard";
import ModalCadastroBairro from "@/components/bairro/ModalCadastroBairro";
import ModalCadastroCondominio from "@/components/bairro/ModalCadastroCondominio";

const CIDADES = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];

export default function InventarioRede({
  entityName,
  labelSingular,
  labelPlural,
  countField,
  icon: Icon,
  CardComponent,
  ModalComponent,
}) {
  const [bairros, setBairros] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("Viamão");
  const [bairroSelecionado, setBairroSelecionado] = useState(null);
  const [condominioSelecionado, setCondominioSelecionado] = useState(null);

  const [modalBairro, setModalBairro] = useState(false);
  const [editingBairro, setEditingBairro] = useState(null);
  const [modalCondominio, setModalCondominio] = useState(false);
  const [modalEntity, setModalEntity] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const { toast } = useToast();

  const load = async () => {
    const [b, cond, ent] = await Promise.all([
      api.entities.Bairro.list(),
      api.entities.Condominio.list(),
      api.entities[entityName].list(),
    ]);
    setBairros(b); setCondominios(cond); setEntities(ent);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const bairrosDaCidade = bairros.filter((b) => b.cidade === cidadeSelecionada);
  const condominiosDoBairro = condominios.filter((c) => c.bairro_id === bairroSelecionado?.id);

  const filterByCondominio = (items, condId, bairroId) =>
    condId === null
      ? items.filter((i) => i.bairro_id === bairroId && !i.condominio_id)
      : items.filter((i) => i.condominio_id === condId);

  const countByCondominio = (items, condId, bairroId) => filterByCondominio(items, condId, bairroId).length;

  const buildCounts = (count) => ({
    ctos: countField === "ctos" ? count : 0,
    ceos: countField === "ceos" ? count : 0,
    cabos: countField === "cabos" ? count : 0,
    elementos: 0,
  });

  const handleSaveBairro = async (data) => {
    if (editingBairro) {
      await api.entities.Bairro.update(editingBairro.id, data);
      toast({ title: "Bairro atualizado" });
      setEditingBairro(null);
    } else {
      await api.entities.Bairro.create(data);
      toast({ title: "Bairro criado" });
    }
    load();
  };
  const handleDeleteBairro = async (id) => {
    await api.entities.Bairro.delete(id);
    toast({ title: "Bairro excluído" });
    load();
  };
  const handleSaveCondominio = async (data) => {
    await api.entities.Condominio.create({ ...data, bairro_id: bairroSelecionado.id, cidade: cidadeSelecionada });
    toast({ title: "Condomínio criado" });
    load();
  };

  const currentCondominioId = condominioSelecionado?.id ?? null;
  const handleSaveEntity = async (data) => {
    if (editingEntity) {
      await api.entities[entityName].update(editingEntity.id, data);
      toast({ title: `${labelSingular} atualizado` });
    } else {
      await api.entities[entityName].create({
        ...data, bairro_id: bairroSelecionado.id, condominio_id: currentCondominioId, cidade: cidadeSelecionada,
      });
      toast({ title: `${labelSingular} criado` });
    }
    setEditingEntity(null); load();
  };
  const handleDeleteEntity = async (id) => {
    await api.entities[entityName].delete(id);
    toast({ title: `${labelSingular} excluído` });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#00C7D9]" /></div>;

  // ── VIEW 3: Condomínio/Geral detail ──
  if (condominioSelecionado) {
    const cid = condominioSelecionado.id;
    const bid = bairroSelecionado.id;
    const filtered = filterByCondominio(entities, cid, bid);

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => { setCondominioSelecionado(null); setBairroSelecionado(null); }} className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#00C7D9]"><Home className="w-3.5 h-3.5" /> Início</button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <button onClick={() => setCondominioSelecionado(null)} className="text-[#6B7280] hover:text-[#00C7D9]">{cidadeSelecionada}</button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <button onClick={() => setCondominioSelecionado(null)} className="text-[#6B7280] hover:text-[#00C7D9]">{bairroSelecionado.nome}</button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="font-semibold text-[#1A1A2E]">{condominioSelecionado.nome}</span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1A1A2E]">{condominioSelecionado.nome}</h1>
          <p className="text-sm text-[#9CA3AF]">{bairroSelecionado.nome} · {cidadeSelecionada}</p>
        </div>

        <div className="flex justify-end mb-3">
          <Button onClick={() => { setEditingEntity(null); setModalEntity(true); }} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Adicionar {labelSingular}
          </Button>
        </div>
        <div className="space-y-3">
          {filtered.map((item) => (
            <CardComponent key={item.id} item={item}
              onEdit={() => { setEditingEntity(item); setModalEntity(true); }}
              onDelete={() => handleDeleteEntity(item.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Icon className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum {labelSingular.toLowerCase()}</p>
            </div>
          )}
        </div>

        <ModalComponent isOpen={modalEntity} onClose={() => { setModalEntity(false); setEditingEntity(null); }} editing={editingEntity} bairros={bairros} onSave={handleSaveEntity} />
      </div>
    );
  }

  // ── VIEW 2: Bairro detail ──
  if (bairroSelecionado) {
    const bid = bairroSelecionado.id;
    const geralCount = countByCondominio(entities, null, bid);

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => setBairroSelecionado(null)} className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#00C7D9]"><Home className="w-3.5 h-3.5" /> Início</button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <button onClick={() => setBairroSelecionado(null)} className="text-[#6B7280] hover:text-[#00C7D9]">{cidadeSelecionada}</button>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="font-semibold text-[#1A1A2E]">{bairroSelecionado.nome}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">{bairroSelecionado.nome}</h1>
            <p className="text-sm text-[#9CA3AF]">{condominiosDoBairro.length} condomínios · {cidadeSelecionada}</p>
          </div>
          <Button onClick={() => setModalCondominio(true)} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Novo Condomínio
          </Button>
        </div>

        <div className="space-y-3">
          {condominiosDoBairro.map((cond) => (
            <CondominioCard key={cond.id} condominio={cond}
              counts={buildCounts(countByCondominio(entities, cond.id, bid))}
              onClick={() => setCondominioSelecionado(cond)} />
          ))}
          <GeralCard counts={buildCounts(geralCount)}
            onClick={() => setCondominioSelecionado({ id: null, nome: "Geral" })} />
          {condominiosDoBairro.length === 0 && geralCount === 0 && (
            <div className="text-center py-16 text-[#9CA3AF]">
              <Building className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-3">Nenhum condomínio em {bairroSelecionado.nome}</p>
              <Button onClick={() => setModalCondominio(true)} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Criar primeiro condomínio
              </Button>
            </div>
          )}
        </div>

        <ModalCadastroCondominio isOpen={modalCondominio} onClose={() => setModalCondominio(false)} onSave={handleSaveCondominio} />
      </div>
    );
  }

  // ── VIEW 1: City → Bairro list ──
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">{labelPlural}</h1>
          <p className="text-sm text-[#9CA3AF]">{bairrosDaCidade.length} bairros em {cidadeSelecionada}</p>
        </div>
        <Button onClick={() => { setEditingBairro(null); setModalBairro(true); }} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Novo Bairro
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CIDADES.map((cidade) => (
          <button key={cidade} onClick={() => setCidadeSelecionada(cidade)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              cidadeSelecionada === cidade ? "bg-[#00C7D9] text-white shadow-sm" : "bg-white text-[#6B7280] border border-border hover:border-[#00C7D9] hover:text-[#00C7D9]"
            }`}>
            {cidade}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bairrosDaCidade.map((bairro) => (
          <BairroCard key={bairro.id} bairro={bairro}
            counts={buildCounts(entities.filter((e) => e.bairro_id === bairro.id).length)}
            onClick={() => setBairroSelecionado(bairro)}
            onEdit={(b) => { setEditingBairro(b); setModalBairro(true); }}
            onDelete={handleDeleteBairro} />
        ))}
        {bairrosDaCidade.length === 0 && (
          <div className="text-center py-16 text-[#9CA3AF]">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-3">Nenhum bairro em {cidadeSelecionada}</p>
            <Button onClick={() => { setEditingBairro(null); setModalBairro(true); }} className="bg-[#00C7D9] hover:bg-[#00A8BD] text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Criar primeiro bairro
            </Button>
          </div>
        )}
      </div>

      <ModalCadastroBairro isOpen={modalBairro} onClose={() => { setModalBairro(false); setEditingBairro(null); }} onSave={handleSaveBairro} cidadePreSelecionada={cidadeSelecionada} editing={editingBairro} />
    </div>
  );
}