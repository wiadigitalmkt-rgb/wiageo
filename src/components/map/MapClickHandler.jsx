import { useMapEvents } from "react-leaflet";

export default function MapClickHandler({ onClick, enabled }) {
  useMapEvents({
    click: (e) => {
      if (enabled) onClick(e.latlng);
    }
  });
  return null;
}