import { supabaseAdmin, withHandler } from './_supabase.js';

export default withHandler(async (req, { empresa }) => {
  const latitude = parseFloat(req.body?.latitude);
  const longitude = parseFloat(req.body?.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const err = new Error('Coordenadas inválidas');
    err.status = 400;
    throw err;
  }

  // PASSO A: ponto está dentro de algum polígono de Cobertura?
  const { data: coberturas, error: covError } = await supabaseAdmin
    .from('coberturas')
    .select('*')
    .eq('empresa_id', empresa.id);
  if (covError) throw covError;

  const pointInPolygon = (pLat, pLng, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const lati = polygon[i].lat;
      const lngi = polygon[i].lng;
      const latj = polygon[j].lat;
      const lngj = polygon[j].lng;
      const intersect =
        lati > pLat !== latj > pLat && pLng < ((lngj - lngi) * (pLat - lati)) / (latj - lati) + lngi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  let coberturaMatch = null;
  for (const cob of coberturas) {
    if (!cob.poligono || cob.poligono.length < 3) continue;
    if (pointInPolygon(latitude, longitude, cob.poligono)) {
      coberturaMatch = cob;
      break;
    }
  }

  if (!coberturaMatch) {
    return {
      viavel: false,
      motivo: 'Endereço fora da área de cobertura',
      dentro_cobertura: false,
      cobertura: null,
      ctos_proximas: [],
      melhor_cto: null,
      ponto: { latitude, longitude },
    };
  }

  // PASSO B: CTOs num raio de 400m
  const { data: ctos, error: ctosError } = await supabaseAdmin
    .from('ctos')
    .select('*')
    .eq('empresa_id', empresa.id);
  if (ctosError) throw ctosError;

  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from('clientes_fibra')
    .select('id_cto')
    .eq('empresa_id', empresa.id);
  if (clientesError) throw clientesError;

  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const RAIO = 400;
  const ctosProximas = [];
  for (const cto of ctos) {
    if (cto.latitude == null || cto.longitude == null) continue;
    const distancia = haversine(latitude, longitude, cto.latitude, cto.longitude);
    if (distancia <= RAIO) {
      const total = parseInt((cto.splitter || '1x8').split('x')[1], 10);
      const ocupadas = clientes.filter((c) => c.id_cto === cto.id).length;
      const disponiveis = total - ocupadas;
      ctosProximas.push({
        id: cto.id,
        codigo: cto.codigo,
        descricao: cto.descricao || '',
        cidade: cto.cidade || '',
        status: cto.status || 'ativo',
        distancia: Math.round(distancia),
        total_portas: total,
        portas_ocupadas: ocupadas,
        portas_disponiveis: disponiveis,
        viavel: disponiveis > 0 && (cto.status || 'ativo') === 'ativo',
      });
    }
  }
  ctosProximas.sort((a, b) => a.distancia - b.distancia);

  const melhorCto = ctosProximas.find((c) => c.viavel) || null;
  const viavel = melhorCto !== null;

  return {
    viavel,
    motivo: viavel
      ? 'Endereço viável para instalação'
      : 'Dentro da área de cobertura, mas sem portas disponíveis nas CTOs próximas (raio de 400m)',
    dentro_cobertura: true,
    cobertura: { id: coberturaMatch.id, nome: coberturaMatch.nome, cidade: coberturaMatch.cidade },
    ctos_proximas: ctosProximas,
    melhor_cto: melhorCto,
    ponto: { latitude, longitude },
  };
});
