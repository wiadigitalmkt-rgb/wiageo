import React, { useState, useMemo, useRef, useEffect } from "react";
import { Marker } from "react-leaflet";

// Approx distance between two points in degrees (with latitude correction).
function approxDist(a, b) {
  const cosLat = Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  const dLat = a.lat - b.lat;
  const dLng = (a.lng - b.lng) * cosLat;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Group markers that are close to each other (within ~30m).
const PROXIMITY_THRESHOLD = 0.0003;

function groupByProximity(items) {
  const groups = [];
  for (const it of items) {
    let placed = false;
    for (const g of groups) {
      for (const m of g) {
        if (approxDist(it, m) < PROXIMITY_THRESHOLD) {
          g.push(it);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) groups.push([it]);
  }
  return groups;
}

function getOffsetPosition(item, index, count) {
  const angle = ((2 * Math.PI) / count) * index - Math.PI / 2;
  const radius = 0.00025;
  const cosLat = Math.cos((item.lat * Math.PI) / 180);
  return {
    lat: item.lat + radius * Math.sin(angle),
    lng: item.lng + (radius * Math.cos(angle)) / cosLat,
  };
}

function ProximityGroup({ items }) {
  const [shifted, setShifted] = useState(false);
  const timer = useRef(null);

  const cancelCollapse = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const handleEnter = () => {
    cancelCollapse();
    setShifted(true);
  };
  const handleLeave = () => {
    cancelCollapse();
    timer.current = setTimeout(() => setShifted(false), 3000);
  };

  useEffect(() => () => cancelCollapse(), []);

  return (
    <>
      {items.map((item, i) => {
        const pos = shifted ? getOffsetPosition(item, i, items.length) : { lat: item.lat, lng: item.lng };
        return (
          <Marker
            key={item.id}
            position={[pos.lat, pos.lng]}
            icon={item.icon}
            eventHandlers={{
              ...(item.onClick ? { click: item.onClick } : {}),
              mouseover: handleEnter,
              mouseout: handleLeave,
            }}
          >
            {item.popup}
          </Marker>
        );
      })}
    </>
  );
}

export default function SpiderifiedMarkers({ items }) {
  const groups = useMemo(() => groupByProximity(items), [items]);

  return (
    <>
      {groups.map((group) => {
        if (group.length === 1) {
          const item = group[0];
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={item.icon}
              eventHandlers={item.onClick ? { click: item.onClick } : undefined}
            >
              {item.popup}
            </Marker>
          );
        }
        return <ProximityGroup key={group.map((g) => g.id).join("-")} items={group} />;
      })}
    </>
  );
}