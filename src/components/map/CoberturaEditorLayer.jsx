import { Polygon, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const vertexIcon = (i, cor) =>
  new L.DivIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${cor};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:700">${i + 1}</div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export default function CoberturaEditorLayer({ points, cor, opacidade, onChangePoint, onRemovePoint }) {
  if (!points || points.length === 0) return null;
  const positions = points.map((p) => [p.lat, p.lng]);
  return (
    <>
      <Polygon
        positions={positions}
        pathOptions={{ color: cor, weight: 2, fillColor: cor, fillOpacity: opacidade, dashArray: "6 4" }}
      />
      {points.map((p, i) => (
        <Marker
          key={i}
          position={[p.lat, p.lng]}
          icon={vertexIcon(i, cor)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = e.target.getLatLng();
              onChangePoint(i, { lat: ll.lat, lng: ll.lng });
            },
          }}
        >
          <Popup>
            <div className="text-xs space-y-2 p-1">
              <p className="font-semibold text-[#1A1A2E]">Ponto {i + 1}</p>
              <p className="text-[#6B7280]">{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</p>
              <p className="text-[10px] text-[#9CA3AF]">Arraste para mover</p>
              <button
                onClick={() => onRemovePoint(i)}
                className="w-full px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Remover ponto
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}