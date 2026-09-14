import React from "react";

export default function SidebarStatusBadges({ counts }) {
  if (!counts) return null;
  const { online = 0, offline = 0 } = counts;
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-bold leading-none">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{online}
      </span>
      <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold leading-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{offline}
      </span>
    </span>
  );
}