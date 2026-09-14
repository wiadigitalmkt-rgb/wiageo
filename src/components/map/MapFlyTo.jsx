import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 17, { duration: 1.2 });
    }
  }, [target]);
  return null;
}