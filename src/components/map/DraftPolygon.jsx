import { Polyline, CircleMarker } from "react-leaflet";

export default function DraftPolygon({ points }) {
  if (points.length === 0) return null;

  const positions = points.map((p) => [p.lat, p.lng]);
  const hasClosing = points.length >= 3;

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: "#00C7D9", weight: 2, dashArray: "6 4" }}
      />
      {hasClosing && (
        <Polyline
          positions={[positions[positions.length - 1], positions[0]]}
          pathOptions={{ color: "#00C7D9", weight: 1, dashArray: "3 6", opacity: 0.5 }}
        />
      )}
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={5}
          pathOptions={{
            color: "#00C7D9",
            fillColor: i === 0 ? "#00C7D9" : "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}
    </>
  );
}