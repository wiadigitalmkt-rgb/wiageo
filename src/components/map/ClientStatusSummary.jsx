import React from "react";
import { useMkauthStatus } from "@/hooks/useMkauthStatus";

export default function ClientStatusSummary({ ctoClients }) {
  const logins = ctoClients.map((c) => c.pppoe).filter(Boolean);
  const statuses = useMkauthStatus(logins);
  let online = 0;
  let offline = 0;
  ctoClients.forEach((c) => {
    if (!c.pppoe) return;
    const s = statuses[c.pppoe]?.status;
    if (s === "online") online++;
    else if (s === "offline") offline++;
  });
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-green-50 border border-green-100 rounded-lg p-2 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
        <div className="leading-none">
          <p className="text-[9px] font-bold text-green-700 uppercase">Online</p>
          <p className="text-base font-bold text-green-700">{online}</p>
        </div>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-lg p-2 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
        <div className="leading-none">
          <p className="text-[9px] font-bold text-red-600 uppercase">Offline</p>
          <p className="text-base font-bold text-red-600">{offline}</p>
        </div>
      </div>
    </div>
  );
}