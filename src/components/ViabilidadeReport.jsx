import React from "react";
import { CheckCircle2, XCircle, Loader2, MapPin, Navigation, Box, Award } from "lucide-react";

export default function ViabilidadeReport({ resultado, loading, pin }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C7D9] mb-3" />
        <p className="text-sm font-medium">Verificando viabilidade...</p>
      </div>
    );
  }

  if (!resultado && !pin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
        <MapPin className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium text-center">Clique no mapa para verificar<br />a viabilidade do endereço</p>
      </div>
    );
  }

  if (!resultado) return null;

  const { viavel, motivo, cobertura, ctos_proximas, melhor_cto } = resultado;

  return (
    <div className="p-4 space-y-4">
      {/* Status Principal */}
      <div className={`rounded-2xl p-4 ${viavel ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
        <div className="flex items-center gap-3">
          {viavel ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
          )}
          <div>
            <p className={`text-lg font-bold ${viavel ? "text-emerald-700" : "text-red-700"}`}>
              {viavel ? "Viável" : "Inviável"}
            </p>
            <p className="text-xs text-[#6B7280]">{motivo}</p>
          </div>
        </div>
      </div>

      {/* Cobertura */}
      {cobertura && (
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00C7D9]" />
          <div>
            <p className="text-xs text-[#9CA3AF]">Área de Cobertura</p>
            <p className="text-sm font-semibold text-[#1A1A2E]">{cobertura.nome} · {cobertura.cidade}</p>
          </div>
        </div>
      )}

      {/* Melhor CTO */}
      {melhor_cto && (
        <div className="rounded-2xl border-2 border-[#00C7D9] p-4 bg-[#F0FDFA]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-[#00C7D9]" />
            <p className="text-xs font-bold text-[#00A8BD] uppercase tracking-wider">Melhor CTO para Instalação</p>
          </div>
          <p className="font-bold text-[#1A1A2E]">{melhor_cto.codigo}</p>
          {melhor_cto.descricao && <p className="text-xs text-[#6B7280]">{melhor_cto.descricao}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1 text-[#6B7280]">
              <Navigation className="w-3 h-3" /> {melhor_cto.distancia}m
            </span>
            <span className="font-semibold text-emerald-600">
              {melhor_cto.portas_disponiveis} portas disponíveis
            </span>
          </div>
        </div>
      )}

      {/* Lista de CTOs Próximas */}
      {ctos_proximas.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            CTOs próximas (raio 400m) — {ctos_proximas.length}
          </p>
          <div className="space-y-2">
            {ctos_proximas.map((cto) => (
              <div key={cto.id} className="bg-white border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-sm font-semibold text-[#1A1A2E]">{cto.codigo}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    cto.viavel ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {cto.viavel ? `${cto.portas_disponiveis} livres` : "Sem portas"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {cto.distancia}m
                  </span>
                  <span>{cto.portas_ocupadas}/{cto.total_portas} ocupadas</span>
                </div>
                {/* Barra de ocupação */}
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cto.viavel ? "bg-emerald-400" : "bg-red-400"}`}
                    style={{ width: `${(cto.portas_ocupadas / cto.total_portas) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ctos_proximas.length === 0 && resultado.dentro_cobertura && (
        <div className="text-center py-6 text-[#9CA3AF]">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma CTO encontrada no raio de 400m</p>
        </div>
      )}
    </div>
  );
}