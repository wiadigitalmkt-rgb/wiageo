import { withHandler } from './_supabase.js';

export default withHandler(async (req, { empresa }) => {
  const logins = Array.isArray(req.body?.logins)
    ? req.body.logins.filter((l) => typeof l === 'string' && l.trim())
    : [];
  if (!logins.length) return { statuses: [] };

  // mkauth_url agora vem da empresa (multi-tenant) em vez de fixo no código.
  const rawUrl = empresa.mkauth_url;
  if (!rawUrl) {
    const err = new Error('MK-AUTH URL não configurada para esta empresa (empresas.mkauth_url)');
    err.status = 400;
    throw err;
  }
  const baseUrl = rawUrl.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
  const statusApiUrl = `${baseUrl}/api/check_status.php`;

  const results = await processBatch(logins, 10, async (login) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let response;
      try {
        const cb = Date.now();
        response = await fetch(`${statusApiUrl}?login=${encodeURIComponent(login)}&_t=${cb}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) return { login, status: 'unknown', ip: null, mac: null, connected_at: null, last_seen: null };
      const data = await response.json();

      const stopTime = extractStopTime(data);
      let isOnline;
      if (stopTime) {
        isOnline = false;
      } else {
        isOnline = data.online === true || data.status === 'online';
      }
      const startTime = extractStartTime(data);

      return {
        login,
        status: isOnline ? 'online' : 'offline',
        ip: isOnline ? data.ip || data.framedipaddress || data.framed_ip_address || null : null,
        mac: isOnline ? data.mac || data.callingstationid || data.calling_station_id || data.mac_address || null : null,
        connected_at: isOnline ? data.connected_at || startTime || null : null,
        last_seen: !isOnline ? data.last_seen || stopTime || null : null,
        stop_time: stopTime || null,
      };
    } catch {
      return { login, status: 'unknown', ip: null, mac: null, connected_at: null, last_seen: null };
    }
  });

  return { statuses: results };
});

function extractStopTime(data) {
  const fields = ['acctstoptime', 'acctstop_time', 'stop_time', 'hora_final', 'data_fim', 'stoptime', 'stop'];
  return findField(data, fields);
}
function extractStartTime(data) {
  const fields = ['acctstarttime', 'acctstart_time', 'start_time', 'hora_inicial', 'data_inicio', 'starttime', 'connected_at', 'start'];
  return findField(data, fields);
}
function findField(obj, names) {
  if (!obj || typeof obj !== 'object') return null;
  for (const n of names) {
    if (obj[n] !== undefined && obj[n] !== null && obj[n] !== '' && obj[n] !== '0000-00-00 00:00:00') return String(obj[n]);
  }
  for (const key of Object.keys(obj)) {
    const child = obj[key];
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      for (const n of names) {
        if (child[n] !== undefined && child[n] !== null && child[n] !== '' && child[n] !== '0000-00-00 00:00:00') return String(child[n]);
      }
    }
  }
  return null;
}
async function processBatch(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}
