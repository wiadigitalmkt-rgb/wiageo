import React from "react";
import { Polyline } from "react-leaflet";

export default function CableLayer({ cabos }) {
  if (!cabos || cabos.length === 0) return null;
  return (
    <>
      {cabos
        .filter((c) => c.coordenadas && c.coordenadas.length > 1)
        .map((cabo) => (
          <Polyline
            key={cabo.id}
            positions={cabo.coordenadas.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#1A1A2E", weight: 3, opacity: 0.7 }}
          />
        ))}
    </>
  );
}
