import React from "react";

export default function PortCapacityBadge({ ocupadas, total }) {
  const percent = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  const livres = total - ocupadas;

  let colorClass = "text-emerald-600 bg-emerald-50";
  if (percent >= 80) colorClass = "text-red-600 bg-red-50";
  else if (percent >= 60) colorClass = "text-amber-600 bg-amber-50";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        percent >= 80 ? "bg-red-500" : percent >= 60 ? "bg-amber-500" : "bg-emerald-500"
      }`} />
      {livres}/{total} livres
    </span>
  );
}