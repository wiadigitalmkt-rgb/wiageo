import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Loader2, Crosshair, MapPinned, Radio, Box, Users, X } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import CtoDetailDrawer from "@/components/map/CtoDetailDrawer";
import MapClickHandler from "@/components/map/MapClickHandler";
import MapFlyTo from "@/components/map/MapFlyTo";
import CoverageLayer from "@/components/map/CoverageLayer";
import DraftPolygon from "@/components/map/DraftPolygon";
import ViabilidadeReport from "@/components/ViabilidadeReport";
import CoberturaPanel from "@/components/CoberturaPanel";
import AddressSearchBar from "@/components/AddressSearchBar";
import { useToast } from "@/components/ui/use-toast";
import ModalCadastroCto from "@/components/bairro/ModalCadastroCto";
import ModalCadastroCeo from "@/components/bairro/ModalCadastroCeo";
import ModalCadastroPop from "@/components/bairro/ModalCadastroPop";
import ModalCadastroCabo from "@/components/bairro/ModalCadastroCabo";
import ModalCadastroOlt from "@/components/bairro/ModalCadastroOlt";
import MapToolbar from "@/components/map/MapToolbar";
import DraftPolyline from "@/components/map/DraftPolyline";
import CableLayer from "@/components/map/CableLayer";
import CoberturaEditorLayer from "@/components/map/CoberturaEditorLayer";
import SpiderifiedMarkers from "@/components/map/SpiderifiedMarkers";
import CeoDetailDrawer from "@/components/map/CeoDetailDrawer";
import PopDetailDrawer from "@/components/map/PopDetailDrawer";
import { useMkauthStatus } from "@/hooks/useMkauthStatus";
import { setSelection, clearSelection } from "@/hooks/useSelection";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLocation } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CTO_COLORS = {
  livre: "#00B050",
  lotada: "#F79646",
  offline: "#F64C4C",
};

const SELECT_RING = `<div class="wiageo-pulse-ring" style="position:absolute;top:50%;left:50%;width:100%;height:100%;border-radius:50%;border:3px solid #00C7D9;transform:translate(-50%,-50%);pointer-events:none"></div>`;

const getMarkerIcon = (status, selected) => {
  const color = CTO_COLORS[status] || CTO_COLORS.livre;
  const warning =
    status === "offline"
      ? `<div style="position:absolute;top:-7px;left:-7px;width:16px;height:14px;z-index:2">
           <svg width="16" height="14" viewBox="0 0 16 14">
             <polygon points="8,0 16,14 0,14" fill="#FFD966" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/>
             <text x="8" y="11.5" text-anchor="middle" font-size="9" font-weight="bold" fill="#1A1A2E">!</text>
           </svg>
         </div>`
      : "";
  return new L.DivIcon({
    html: `<div style="position:relative;width:24px;height:24px">
             ${selected ? SELECT_RING : ""}
             <div style="position:relative;width:24px;height:24px;border-radius:50%;background:${color};border:3px solid ${selected ? "#00C7D9" : "#fff"};box-shadow:0 2px 4px rgba(0,0,0,0.2)"></div>
             ${warning}
           </div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getPinIcon = () =>
  new L.DivIcon({
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:#00C7D9;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

const getCeoIcon = (selected) =>
  new L.DivIcon({
    html: `<div style="position:relative;width:28px;height:28px">
             ${selected ? SELECT_RING : ""}
             <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#6366F1;border:3px solid ${selected ? "#00C7D9" : "#fff"};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:9px;letter-spacing:0.5px">CEO</div>
           </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const getPopIcon = (selected) =>
  new L.DivIcon({
    html: `<div style="position:relative;width:30px;height:30px">
             ${selected ? SELECT_RING : ""}
             <div style="position:relative;width:30px;height:30px;border-radius:50%;background:#0EA5E9;border:3px solid ${selected ? "#00C7D9" : "#fff"};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:8px;letter-spacing:0.5px">POP</div>
           </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

export default function Dashboard() {
  const { toast } = useToast();
  const [mode, setMode] = useState("consulta");
  const [coberturas, setCoberturas] = useState([]);
  const [ctos, setCtos] = useState([]);
  const [olts, setOlts] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ceos, setCeos] = useState([]);
  const [pops, setPops] = useState([]);
  const [cabos, setCabos] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [loading, setLoading] = useState(true);

  // MK-Auth status polling for all client PPPoE logins
  const allPppoeLogins = clientes.map((c) => c.pppoe).filter(Boolean);
  const mkauthStatuses = useMkauthStatus(allPppoeLogins);

  const [editingCeo, setEditingCeo] = useState(null);
  const [ceoModalOpen, setCeoModalOpen] = useState(false);
  const [editingPop, setEditingPop] = useState(null);
  const [popModalOpen, setPopModalOpen] = useState(false);
  const [ctoModalOpen, setCtoModalOpen] = useState(false);
  const [editingCabo, setEditingCabo] = useState(null);
  const [caboModalOpen, setCaboModalOpen] = useState(false);
  const [editingOlt, setEditingOlt] = useState(null);
  const [oltModalOpen, setOltModalOpen] = useState(false);
  const [placementMode, setPlacementMode] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [isDrawingCable, setIsDrawingCable] = useState(false);
  const [cableDraftPoints, setCableDraftPoints] = useState([]);

  // Viability state
  const [pin, setPin] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);

  // CTO / CEO / POP drawer state (only one open at a time)
  const [selectedCto, setSelectedCto] = useState(null);
  const [selectedCeo, setSelectedCeo] = useState(null);
  const [selectedPop, setSelectedPop] = useState(null);

  // Sync current selection (CTO / CEO / POP) with the shared store so the sidebar highlights the active item
  const selectedId = selectedCto?.id || selectedCeo?.id || selectedPop?.id;
  useEffect(() => {
    if (selectedCto) setSelection({ kind: "cto", id: selectedCto.id });
    else if (selectedCeo) setSelection({ kind: "ceo", id: selectedCeo.id });
    else if (selectedPop) setSelection({ kind: "pop", id: selectedPop.id });
    else clearSelection();
  }, [selectedCto, selectedCeo, selectedPop]);

  // Track CTOs already alerted to avoid duplicate emails
  const alertedCtosRef = useRef(new Set());
  // Track consecutive offline observations per CTO to debounce transient errors
  const offlineStreakRef = useRef({});

  // Detect CTOs going offline and trigger email alert (requires 2 consecutive all-offline polls)
  useEffect(() => {
    if (!ctos.length || !clientes.length || !Object.keys(mkauthStatuses).length) return;

    ctos.forEach((cto) => {
      const status = getCtoStatus(cto);
      const wasAlerted = alertedCtosRef.current.has(cto.id);

      if (status === "offline") {
        offlineStreakRef.current[cto.id] = (offlineStreakRef.current[cto.id] || 0) + 1;
        // only alert after 2 consecutive all-offline observations AND not already alerted
        if (offlineStreakRef.current[cto.id] >= 2 && !wasAlerted) {
          alertedCtosRef.current.add(cto.id);
          api.functions
            .invoke("notifyCtoOffline", { cto_id: cto.id })
            .then(() => {
              toast({ title: `🚨 Alerta enviado: CTO ${cto.codigo} offline`, description: "Email enviado aos responsáveis" });
            })
            .catch(() => {
              alertedCtosRef.current.delete(cto.id);
            });
        }
      } else {
        offlineStreakRef.current[cto.id] = 0;
      }

      if (status !== "offline" && wasAlerted) {
        alertedCtosRef.current.delete(cto.id);
        // CTO restored — collect online client PPPoE logins and trigger restored alert
        const ctoClients = clientes.filter((c) => c.id_cto === cto.id);
        const onlineClients = ctoClients
          .filter((c) => c.pppoe && mkauthStatuses[c.pppoe]?.status === "online")
          .map((c) => c.pppoe);
        api.functions
          .invoke("notifyCtoRestored", { cto_id: cto.id, online_clients: onlineClients })
          .then(() => {
            toast({ title: `✅ CTO ${cto.codigo} restaurada`, description: "Email de restauração enviado aos responsáveis" });
          })
          .catch(() => {});
      }
    });
  }, [mkauthStatuses, ctos, clientes]);

  // Focus from sidebar navigation
  const location = useLocation();
  const focusType = new URLSearchParams(location.search).get("focus_type");
  const focusId = new URLSearchParams(location.search).get("focus_id");

  // Coverage drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [selectedCobertura, setSelectedCobertura] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Coverage edit state (editar vértices de uma cobertura existente)
  const [editingCoberturaId, setEditingCoberturaId] = useState(null);
  const [editPoints, setEditPoints] = useState([]);
  const [editCor, setEditCor] = useState("#00C7D9");
  const [editOpacidade, setEditOpacidade] = useState(0.3);

  const COB_PALETTE = ["#00C7D9", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6"];

  const load = async () => {
    const [cobs, c, o, cl, ce, po, br, cd, pa, ca] = await Promise.all([
      api.entities.Cobertura.list(),
      api.entities.Cto.list(),
      api.entities.Olt.list(),
      api.entities.ClienteFibra.list(),
      api.entities.Ceo.list(),
      api.entities.Pop.list(),
      api.entities.Bairro.list(),
      api.entities.Condominio.list(),
      api.entities.Pasta.list(),
      api.entities.Cabo.list(),
    ]);
    setCoberturas(cobs);
    setCtos(c);
    setOlts(o);
    setClientes(cl);
    setCeos(ce);
    setPops(po);
    setBairros(br);
    setCondominios(cd);
    setPastas(pa);
    setCabos(ca);
    setLoading(false);
    window.dispatchEvent(new CustomEvent("wiageo-data-changed"));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!focusType || !focusId || loading) return;
    if (focusType === "cto") {
      const cto = ctos.find((c) => c.id === focusId);
      if (cto) {
        const olt = olts.find((o) => o.id === cto.id_olt);
        setSelectedCto({ ...cto, olt_nome: olt?.nome });
        setFlyTarget({ lat: cto.latitude, lng: cto.longitude });
      }
    } else if (focusType === "ceo") {
      const ceo = ceos.find((c) => c.id === focusId);
      if (ceo) {
        if (ceo.latitude != null && ceo.longitude != null) setFlyTarget({ lat: ceo.latitude, lng: ceo.longitude });
        setEditingCeo(ceo);
        setCeoModalOpen(true);
        setSelectedCto(null);
      }
    } else if (focusType === "pop") {
      const pop = pops.find((p) => p.id === focusId);
      if (pop) {
        if (pop.latitude != null && pop.longitude != null) setFlyTarget({ lat: pop.latitude, lng: pop.longitude });
        setEditingPop(pop);
        setPopModalOpen(true);
        setSelectedCto(null);
      }
    } else if (focusType === "cabo") {
      const cabo = cabos.find((c) => c.id === focusId);
      if (cabo) {
        setEditingCabo(cabo);
        setCaboModalOpen(true);
        setSelectedCto(null);
      }
    } else if (focusType === "olt") {
      const olt = olts.find((o) => o.id === focusId);
      if (olt) {
        setEditingOlt(olt);
        setOltModalOpen(true);
        setSelectedCto(null);
      }
    }
  }, [focusType, focusId, loading, ctos, ceos, pops, olts, cabos]);

  useEffect(() => {
    if (!selectedCto) return;
    const updated = ctos.find((c) => c.id === selectedCto.id);
    if (updated && updated.data_ultima_atualizacao !== selectedCto.data_ultima_atualizacao) {
      const olt = olts.find((o) => o.id === updated.id_olt);
      setSelectedCto({ ...updated, olt_nome: olt?.nome });
    }
  }, [ctos, olts]);

  const getClientsCount = (ctoId) => clientes.filter((c) => c.id_cto === ctoId).length;
  const getSplitterTotal = (splitter) => (!splitter ? 8 : parseInt(splitter.split("x")[1], 10));

  // CTO status: "offline" (all clients offline) | "lotada" (full) | "livre" (available)
  const getCtoStatus = (cto) => {
    const ctoClients = clientes.filter((c) => c.id_cto === cto.id);
    const total = getSplitterTotal(cto.splitter);

    if (ctoClients.length > 0) {
      const withStatus = ctoClients.filter((c) => c.pppoe && mkauthStatuses[c.pppoe]);
      const knownClients = withStatus.filter((c) => mkauthStatuses[c.pppoe].status !== "unknown");
      if (knownClients.length === ctoClients.length) {
        const onlineCount = knownClients.filter((c) => mkauthStatuses[c.pppoe].status === "online").length;
        if (onlineCount === 0) return "offline";
      }
    }

    if (ctoClients.length >= total) return "lotada";
    return "livre";
  };

  const runViability = (lat, lng) => {
    setPin({ lat, lng });
    setFlyTarget({ lat, lng });
    setConsultando(true);
    setResultado(null);
    setSelectedCto(null);
    api.functions
      .invoke("verificarViabilidadeEndereco", { latitude: lat, longitude: lng })
      .then((res) => setResultado(res.data))
      .catch(() => setResultado(null))
      .finally(() => setConsultando(false));
  };

  const handleMapClick = (latlng) => {
    if (editingCoberturaId) {
      setEditPoints((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
      return;
    }
    if (placementMode) {
      setPendingCoords(latlng);
      if (placementMode === "cto") setCtoModalOpen(true);
      if (placementMode === "ceo") { setEditingCeo(null); setCeoModalOpen(true); }
      if (placementMode === "pop") { setEditingPop(null); setPopModalOpen(true); }
      setPlacementMode(null);
      return;
    }
    if (isDrawingCable) {
      setCableDraftPoints((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
      return;
    }
    if (mode === "consulta") {
      runViability(latlng.lat, latlng.lng);
    } else if (isDrawing) {
      setDraftPoints((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
    }
  };

  const handleAddressSearch = (lat, lng) => {
    if (mode !== "consulta") setMode("consulta");
    runViability(lat, lng);
  };

  const handleCtoClick = (cto) => {
    const olt = olts.find((o) => o.id === cto.id_olt);
    setSelectedCeo(null);
    setSelectedPop(null);
    setSelectedCto({ ...cto, olt_nome: olt?.nome });
  };

  const handleSelectCeo = (ceo) => {
    setSelectedCto(null);
    setSelectedPop(null);
    setSelectedCeo(ceo);
  };

  const handleSelectPop = (pop) => {
    setSelectedCto(null);
    setSelectedCeo(null);
    setSelectedPop(pop);
  };

  const handleEditCeo = (ceo) => { setEditingCeo(ceo); setCeoModalOpen(true); };
  const handleSaveCeo = async (data) => {
    if (editingCeo) {
      await api.entities.Ceo.update(editingCeo.id, {
        ...data,
        condominio_id: editingCeo.condominio_id,
      });
      toast({ title: "CEO atualizado" });
    } else {
      await api.entities.Ceo.create(data);
      toast({ title: "CEO criada" });
    }
    load();
  };
  const handleDeleteCeo = async (id) => {
    if (!window.confirm("Excluir este CEO?")) return;
    await api.entities.Ceo.delete(id);
    toast({ title: "CEO excluído" });
    load();
  };

  const handleEditPop = (pop) => { setEditingPop(pop); setPopModalOpen(true); };
  const handleSavePop = async (data) => {
    if (editingPop) {
      await api.entities.Pop.update(editingPop.id, data);
      toast({ title: "POP atualizado" });
    } else {
      await api.entities.Pop.create(data);
      toast({ title: "POP criado" });
    }
    load();
  };
  const handleDeletePop = async (id) => {
    if (!window.confirm("Excluir este POP?")) return;
    await api.entities.Pop.delete(id);
    toast({ title: "POP excluído" });
    load();
  };

  const handleToolbarPick = (item) => {
    if (item.drawMode) {
      setIsDrawingCable(true);
      setCableDraftPoints([]);
      return;
    }
    if (item.placeable) {
      setPlacementMode(placementMode === item.type ? null : item.type);
    } else {
      if (item.type === "olt") setOltModalOpen(true);
    }
  };

  const handleSaveCabo = async (data) => {
    if (editingCabo) {
      await api.entities.Cabo.update(editingCabo.id, data);
      toast({ title: "Cabo atualizado" });
    } else {
      await api.entities.Cabo.create(data);
      toast({ title: "Cabo criado" });
    }
    setIsDrawingCable(false);
    setCableDraftPoints([]);
    setEditingCabo(null);
    load();
  };

  const handleSaveOlt = async (data) => {
    if (editingOlt) {
      await api.entities.Olt.update(editingOlt.id, data);
      toast({ title: "OLT atualizada" });
    } else {
      await api.entities.Olt.create(data);
      toast({ title: "OLT criada" });
    }
    setEditingOlt(null);
    load();
  };

  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const cableMetragem = (pts) => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += haversine(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
    return Math.round(total);
  };

  const handleFinishCable = () => {
    if (cableDraftPoints.length < 2) {
      toast({ title: "Trace ao menos 2 pontos", variant: "destructive" });
      return;
    }
    setCaboModalOpen(true);
  };

  const handleCancelCable = () => {
    setIsDrawingCable(false);
    setCableDraftPoints([]);
  };

  // Coverage handlers
  const handleNewCobertura = () => {
    setEditingCoberturaId(null);
    setEditPoints([]);
    setIsDrawing(true);
    setDraftPoints([]);
    setSelectedCobertura(null);
  };

  const handleFinishDrawing = ({ nome, cidade }) => {
    const cor = COB_PALETTE[coberturas.length % COB_PALETTE.length];
    api.entities.Cobertura
      .create({ nome, cidade, poligono: draftPoints, cor, opacidade: 0.3 })
      .then(() => {
        setIsDrawing(false);
        setDraftPoints([]);
        load();
      });
  };

  const handleDeleteCobertura = async (id) => {
    await api.entities.Cobertura.delete(id);
    setSelectedCobertura(null);
    load();
  };

  const handleEditCobertura = (cob) => {
    setMode("cobertura");
    setPanelOpen(true);
    setIsDrawing(false);
    setDraftPoints([]);
    setEditingCoberturaId(cob.id);
    setEditPoints([...(cob.poligono || [])]);
    setEditCor(cob.cor || COB_PALETTE[0]);
    setEditOpacidade(cob.opacidade != null ? cob.opacidade : 0.3);
    setSelectedCobertura(cob);
    if (cob.poligono?.length) {
      const lat = cob.poligono.reduce((s, p) => s + p.lat, 0) / cob.poligono.length;
      const lng = cob.poligono.reduce((s, p) => s + p.lng, 0) / cob.poligono.length;
      setFlyTarget({ lat, lng });
    }
  };

  const handleSaveEditCobertura = async () => {
    if (editPoints.length < 3) {
      toast({ title: "Mínimo de 3 pontos", variant: "destructive" });
      return;
    }
    await api.entities.Cobertura.update(editingCoberturaId, {
      poligono: editPoints,
      cor: editCor,
      opacidade: editOpacidade,
    });
    setEditingCoberturaId(null);
    setEditPoints([]);
    toast({ title: "Cobertura atualizada" });
    load();
  };

  const handleCancelEditCobertura = () => {
    setEditingCoberturaId(null);
    setEditPoints([]);
  };

  const handleUpdateCoberturaStyle = async (id, patch) => {
    await api.entities.Cobertura.update(id, patch);
    load();
  };

  const center = ctos.length > 0 ? [ctos[0].latitude, ctos[0].longitude] : [-30.08, -51.02];

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#00C7D9]" /></div>;

  const allMapItems = [
    ...ctos.map((cto) => ({
      id: `cto-${cto.id}`,
      lat: cto.latitude,
      lng: cto.longitude,
      icon: getMarkerIcon(getCtoStatus(cto), cto.id === selectedId),
      onClick: () => handleCtoClick(cto),
      popup: null,
    })),
    ...ceos.filter((e) => e.latitude != null && e.longitude != null).map((ceo) => ({
      id: `ceo-${ceo.id}`,
      lat: ceo.latitude,
      lng: ceo.longitude,
      icon: getCeoIcon(ceo.id === selectedId),
      onClick: () => handleSelectCeo(ceo),
      popup: null,
    })),
    ...pops.filter((e) => e.latitude != null && e.longitude != null).map((pop) => ({
      id: `pop-${pop.id}`,
      lat: pop.latitude,
      lng: pop.longitude,
      icon: getPopIcon(pop.id === selectedId),
      onClick: () => handleSelectPop(pop),
      popup: null,
    })),
  ];

  const clickEnabled = mode === "consulta" || isDrawing || !!placementMode || isDrawingCable || !!editingCoberturaId;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#1A1A2E]">Mapa da Rede</h1>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode("consulta"); setPanelOpen(true); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === "consulta" ? "bg-white text-[#00C7D9] shadow-sm" : "text-[#9CA3AF]"
              }`}
            >
              <Crosshair className="w-4 h-4" /> Consulta
            </button>
            <button
              onClick={() => { setMode("cobertura"); setPanelOpen(true); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === "cobertura" ? "bg-white text-[#00C7D9] shadow-sm" : "text-[#9CA3AF]"
              }`}
            >
              <MapPinned className="w-4 h-4" /> Cobertura
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={MapPinned} label="Áreas de Cobertura" value={coberturas.length} color="#00C7D9" />
          <StatCard icon={Box} label="CTOs no Mapa" value={ctos.length} color="#F59E0B" />
          <StatCard icon={Users} label="Clientes Conectados" value={clientes.length} color="#10B981" />
        </div>
      </div>

      {/* Map + Panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <CoverageLayer
              coberturas={coberturas.filter((c) => c.id !== editingCoberturaId)}
              selectedId={selectedCobertura?.id}
              onSelect={mode === "cobertura" && !isDrawing && !editingCoberturaId ? setSelectedCobertura : undefined}
            />

            {editingCoberturaId && (
              <CoberturaEditorLayer
                points={editPoints}
                cor={editCor}
                opacidade={editOpacidade}
                onChangePoint={(i, ll) => setEditPoints((prev) => prev.map((p, idx) => (idx === i ? ll : p)))}
                onRemovePoint={(i) => setEditPoints((prev) => prev.filter((_, idx) => idx !== i))}
              />
            )}

            <SpiderifiedMarkers items={allMapItems} />

            {pin && <Marker position={[pin.lat, pin.lng]} icon={getPinIcon()} />}

            {isDrawing && <DraftPolygon points={draftPoints} />}
            {isDrawingCable && <DraftPolyline points={cableDraftPoints} />}
            <CableLayer cabos={cabos} />

            <MapClickHandler onClick={handleMapClick} enabled={clickEnabled} />
            <MapFlyTo target={flyTarget} />
          </MapContainer>

          {/* Floating Search Bar */}
          {mode === "consulta" && !isDrawingCable && (
            <div className="absolute top-4 left-4 z-30 w-96 max-w-[calc(100%-2rem)]">
              <AddressSearchBar onResult={handleAddressSearch} />
            </div>
          )}

          {/* Cable Drawing Panel */}
          {isDrawingCable && (
            <div className="absolute top-4 left-4 z-30 w-72 bg-white rounded-2xl shadow-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#1A1A2E]">Traçar Cabo</h3>
                <span className="text-xs text-[#9CA3AF]">{cableDraftPoints.length} pts</span>
              </div>
              <div className="bg-[#E0F7FA] rounded-xl px-3 py-2 mb-3">
                <p className="text-[10px] text-[#00A8BD] font-bold uppercase">Metragem</p>
                <p className="text-lg font-bold text-[#1A1A2E]">{cableMetragem(cableDraftPoints)} m</p>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-3">Clique no mapa para adicionar pontos ao trajeto.</p>
              <div className="flex gap-2">
                <button onClick={handleFinishCable} disabled={cableDraftPoints.length < 2} className="flex-1 py-2 rounded-xl bg-[#00C7D9] text-white text-sm font-semibold hover:bg-[#00A8BD] transition-colors disabled:opacity-50">Finalizar</button>
                <button onClick={handleCancelCable} className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-[#6B7280] hover:bg-muted transition-colors">Cancelar</button>
              </div>
              {cableDraftPoints.length > 0 && (
                <button onClick={() => setCableDraftPoints((prev) => prev.slice(0, -1))} className="mt-2 w-full text-xs text-[#9CA3AF] hover:text-red-500 transition-colors">Desfazer último ponto</button>
              )}
            </div>
          )}

          {/* Detail Drawer (fixed right — CTO / CEO / POP, only one open at a time) */}
          {(selectedCto || selectedCeo || selectedPop) && (
            <div className="absolute top-4 right-4 z-40 h-[calc(100vh-220px)]">
              {selectedCto && (
                <CtoDetailDrawer
                  cto={selectedCto}
                  clientes={clientes}
                  bairros={bairros}
                  olts={olts}
                  pastas={pastas.filter((p) => p.tipo_item === "cto")}
                  onClose={() => setSelectedCto(null)}
                  onSaved={load}
                />
              )}
              {selectedCeo && (
                <CeoDetailDrawer
                  ceo={selectedCeo}
                  bairros={bairros}
                  pastas={pastas.filter((p) => p.tipo_item === "ceo")}
                  onClose={() => setSelectedCeo(null)}
                  onSaved={load}
                />
              )}
              {selectedPop && (
                <PopDetailDrawer
                  pop={selectedPop}
                  pastas={pastas.filter((p) => p.tipo_item === "pop")}
                  onClose={() => setSelectedPop(null)}
                  onSaved={load}
                />
              )}
            </div>
          )}

          {/* CTO Status Legend */}
          <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-border p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wide">Status CTO</p>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: "#00B050" }} />
              <span className="text-xs font-semibold text-[#1A1A2E]">CTO Livre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: "#F79646" }} />
              <span className="text-xs font-semibold text-[#1A1A2E]">CTO Lotada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative w-3.5 h-3.5">
                <span className="absolute inset-0 rounded-full" style={{ background: "#F64C4C" }} />
                <span className="absolute -top-1.5 -left-1.5 text-[8px]">⚠️</span>
              </span>
              <span className="text-xs font-semibold text-[#1A1A2E]">CTO Offline</span>
            </div>
          </div>

          {/* Floating Add Toolbar */}
          <MapToolbar
            placementMode={placementMode}
            isDrawingCable={isDrawingCable}
            onPick={handleToolbarPick}
            onCancel={() => { setPlacementMode(null); setIsDrawingCable(false); setCableDraftPoints([]); }}
          />
        </div>

        {/* Side Panel */}
        {panelOpen && (
        <div className="w-96 bg-white border-l border-border overflow-y-auto flex-shrink-0 relative">
          <button onClick={() => setPanelOpen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#6B7280]">
            <X className="w-4 h-4" />
          </button>
          {mode === "consulta" ? (
            <ViabilidadeReport resultado={resultado} loading={consultando} pin={pin} />
          ) : (
            <CoberturaPanel
              coberturas={coberturas}
              isDrawing={isDrawing}
              draftPointCount={draftPoints.length}
              selectedCobertura={selectedCobertura}
              onNewCobertura={handleNewCobertura}
              onUndoPoint={() => setDraftPoints((prev) => prev.slice(0, -1))}
              onClearDraft={() => setDraftPoints([])}
              onFinishDrawing={handleFinishDrawing}
              onCancelDrawing={() => { setIsDrawing(false); setDraftPoints([]); }}
              onSelectCobertura={setSelectedCobertura}
              onDeleteCobertura={handleDeleteCobertura}
              onEditCobertura={handleEditCobertura}
              onUpdateCoberturaStyle={handleUpdateCoberturaStyle}
              isEditing={!!editingCoberturaId}
              editPointCount={editPoints.length}
              editCor={editCor}
              editOpacidade={editOpacidade}
              onChangeEditCor={setEditCor}
              onChangeEditOpacidade={setEditOpacidade}
              onUndoEditPoint={() => setEditPoints((prev) => prev.slice(0, -1))}
              onSaveEdit={handleSaveEditCobertura}
              onCancelEdit={handleCancelEditCobertura}
            />
          )}
        </div>
        )}
      </div>

      <ModalCadastroCto
        isOpen={ctoModalOpen}
        onClose={() => { setCtoModalOpen(false); setPendingCoords(null); }}
        editing={null}
        bairros={bairros}
        olts={olts}
        pastas={pastas.filter((p) => p.tipo_item === "cto")}
        preCoords={pendingCoords}
        onSave={() => { load(); setPendingCoords(null); }}
      />
      <ModalCadastroCeo
        isOpen={ceoModalOpen}
        onClose={() => { setCeoModalOpen(false); setPendingCoords(null); }}
        editing={editingCeo}
        bairros={bairros}
        pastas={pastas.filter((p) => p.tipo_item === "ceo")}
        preCoords={pendingCoords}
        onSave={handleSaveCeo}
      />
      <ModalCadastroPop
        isOpen={popModalOpen}
        onClose={() => { setPopModalOpen(false); setPendingCoords(null); }}
        editing={editingPop}
        pastas={pastas.filter((p) => p.tipo_item === "pop")}
        preCoords={pendingCoords}
        onSave={handleSavePop}
      />
      <ModalCadastroCabo
        isOpen={caboModalOpen}
        onClose={() => { setCaboModalOpen(false); setIsDrawingCable(false); setCableDraftPoints([]); setEditingCabo(null); }}
        editing={editingCabo}
        bairros={bairros}
        pastas={pastas.filter((p) => p.tipo_item === "cabo")}
        preCoords={cableDraftPoints}
        preMetragem={cableMetragem(cableDraftPoints)}
        onSave={handleSaveCabo}
      />
      <ModalCadastroOlt
        isOpen={oltModalOpen}
        onClose={() => { setOltModalOpen(false); setEditingOlt(null); }}
        editing={editingOlt}
        onSave={handleSaveOlt}
      />
    </div>
  );
}
