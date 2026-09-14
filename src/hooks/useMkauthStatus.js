import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";

const cache = new Map();
const CACHE_TTL = 15000;

export function useMkauthStatus(logins) {
  const [statuses, setStatuses] = useState({});
  const loginsKey = (logins || []).filter(Boolean).join(",");

  useEffect(() => {
    if (!loginsKey) return;
    let cancelled = false;

    const fetchStatuses = async () => {
      const now = Date.now();
      const allLogins = loginsKey.split(",").filter(Boolean);
      const uncached = allLogins.filter((l) => {
        const c = cache.get(l);
        return !c || now - c.timestamp > CACHE_TTL;
      });

      if (!uncached.length) {
        const result = {};
        allLogins.forEach((l) => {
          const c = cache.get(l);
          if (c) result[l] = { status: c.status, ip: c.ip, mac: c.mac, connected_at: c.connected_at, last_seen: c.last_seen };
        });
        if (!cancelled) setStatuses(result);
        return;
      }

      try {
        const res = await api.functions.invoke("mkauthStatus", { logins: uncached });
        const now2 = Date.now();
        (res.data.statuses || []).forEach((s) => {
          cache.set(s.login, {
            status: s.status, ip: s.ip, mac: s.mac,
            connected_at: s.connected_at, last_seen: s.last_seen, timestamp: now2
          });
        });
        const merged = {};
        allLogins.forEach((l) => {
          const c = cache.get(l);
          if (c) merged[l] = { status: c.status, ip: c.ip, mac: c.mac, connected_at: c.connected_at, last_seen: c.last_seen };
        });
        if (!cancelled) setStatuses(merged);
      } catch {
        // silently fail - indicators just stay grey
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loginsKey]);

  return statuses;
}
