import { Polygon } from "react-leaflet";

export default function CoverageLayer({ coberturas, selectedId, onSelect }) {
  return coberturas.map((cob) => {
    if (!cob.poligono || cob.poligono.length < 3) return null;
    const positions = cob.poligono.map((p) => [p.lat, p.lng]);
    const isSelected = selectedId === cob.id;
    const cor = cob.cor || "#94A3B8";
    const opacidade = cob.opacidade != null ? cob.opacidade : 0.2;
    return (
      <Polygon
        key={cob.id}
        positions={positions}
        pathOptions={{
          color: cor,
          weight: isSelected ? 3 : 2,
          fillColor: cor,
          fillOpacity: isSelected ? Math.min(opacidade + 0.1, 0.8) : opacidade,
          dashArray: isSelected ? null : "6 4",
        }}
        eventHandlers={onSelect ? { click: () => onSelect(cob) } : {}}
      />
    );
  });
}