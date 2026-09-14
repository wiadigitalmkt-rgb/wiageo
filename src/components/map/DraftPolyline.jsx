import React from "react";
import { Polyline, CircleMarker } from "react-leaflet";

export default function DraftPolyline({ points }) {
  if (!points || points.length === 0) return null;
  const positions = points.map((p) => [p.lat, p.lng]);

  return (
    <>
      <Polyline positions={positions} pathOptions={{ color: "#1A1A2E", weight: 4, opacity: 0.85 }} />
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={i === 0 ? 7 : 5}
          pathOptions={{
            color: i === 0 ? "#00C7D9" : "#1A1A2E",
            fillColor: i === 0 ? "#00C7D9" : "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}
    </>
  );
}