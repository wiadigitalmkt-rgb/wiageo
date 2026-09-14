import { useEffect, useRef } from "react";
import { reverseGeocode, normalizarCidade } from "@/lib/reverseGeocode";

/**
 * When both lat & lng are present (typed or pre-filled), perform a debounced
 * reverse geocode and call onResult({ endereco, numero, cep, bairro_nome, cidade }).
 */
export function useReverseGeocode(lat, lng, onResult, { skip } = {}) {
  const timer = useRef(null);
  useEffect(() => {
    if (skip) return;
    if (timer.current) clearTimeout(timer.current);
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (!la || !lo || !isFinite(la) || !isFinite(lo)) return;
    timer.current = setTimeout(async () => {
      try {
        const res = await reverseGeocode(la, lo);
        onResult({ ...res, cidade: normalizarCidade(res.cidade) || res.cidade });
      } catch {
        // silent fail
      }
    }, 900);
    return () => timer.current && clearTimeout(timer.current);
  }, [lat, lng, skip]);
}