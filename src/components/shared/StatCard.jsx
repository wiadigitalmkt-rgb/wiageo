import React from "react";

export default function StatCard({ icon: Icon, label, value, color = "#00C7D9" }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A1A2E] font-heading">{value}</p>
        <p className="text-xs text-[#9CA3AF] font-medium">{label}</p>
      </div>
    </div>
  );
}