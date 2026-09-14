// Reverse geocoding via OpenStreetMap Nominatim.
// Returns normalized address components for a given lat/lng.
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Nominatim requires a meaningful UA; browser UA is fine here
    },
  });
  if (!res.ok) throw new Error("reverse geocode failed");
  const data = await res.json();
  const a = data?.address || {};
  const rua = a.road || a.pedestrian || a.footway || a.path || a.residential || "";
  const numero = a.house_number || "";
  const endereco = [rua, numero].filter(Boolean).join(", ");
  const bairro_nome = a.suburb || a.neighbourhood || a.city_district || a.borough || "";
  const cidade = a.city || a.town || a.village || a.municipality || "";
  const cep = a.postcode || "";
  return { endereco, numero, cep, bairro_nome, cidade };
}

// Map a city name returned from Nominatim to one of the app's known cities.
const CIDADES_APP = ["Viamão", "Porto Alegre", "Alvorada", "Canoas"];
export function normalizarCidade(nome) {
  if (!nome) return null;
  const n = nome.toLowerCase();
  return CIDADES_APP.find((c) => c.toLowerCase() === n) || null;
}