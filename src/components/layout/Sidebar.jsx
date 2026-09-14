import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, Radio, Box, Wrench, Cable, Server, ChevronLeft, ChevronRight, ChevronDown, LogOut } from "lucide-react";
import { api } from "@/api/apiClient";
import FolderSection from "./FolderSection";
import { useSelection } from "@/hooks/useSelection";

const navConfig = [
  { label: "Mapa da Rede", path: "/", icon: Map, expandable: false },
  { label: "OLTs", icon: Radio, expandable: true, tipoItem: "olt", entity: "Olt", nameField: "nome", focusType: "olt" },
  { label: "CTOs", icon: Box, expandable: true, tipoItem: "cto", entity: "Cto", nameField: "codigo", hasCoords: true, focusType: "cto" },
  { label: "CEOs", icon: Wrench, expandable: true, tipoItem: "ceo", entity: "Ceo", nameField: "codigo", hasCoords: true, focusType: "ceo" },
  { label: "Cabos", icon: Cable, expandable: true, tipoItem: "cabo", entity: "Cabo", nameField: "codigo", focusType: "cabo" },
  { label: "POPs", icon: Server, expandable: true, tipoItem: "pop", entity: "Pop", nameField: "nome", hasCoords: true, focusType: "pop" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const selection = useSelection();

  const handleLogout = () => {
    api.auth.logout("/login");
  };

  const handleSectionClick = (item) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedSection(item.label);
      return;
    }
    setExpandedSection(expandedSection === item.label ? null : item.label);
  };

  const handleItemClick = (navItem, entity) => {
    const params = new URLSearchParams({ focus_type: navItem.focusType, focus_id: entity.id });
    navigate(`/?${params.toString()}`);
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-border flex flex-col transition-all duration-300 z-50 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="h-16 flex items-center px-4 border-b border-border gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#00C7D9] flex items-center justify-center flex-shrink-0">
          <Map className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-heading font-bold text-lg tracking-tight text-[#1A1A2E]">WIAGEO</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navConfig.map((item) => {
          const isActive = location.pathname === item.path;

          if (!item.expandable) {
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-[#E0F7FA] text-[#00A8BD]" : "text-[#6B7280] hover:bg-muted hover:text-foreground"}`} title={collapsed ? item.label : undefined}>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#00C7D9]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          const isExpanded = expandedSection === item.label;

          return (
            <div key={item.path}>
              <button
                onClick={() => handleSectionClick(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full ${isActive || isExpanded ? "bg-[#E0F7FA] text-[#00A8BD]" : "text-[#6B7280] hover:bg-muted hover:text-foreground"}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive || isExpanded ? "text-[#00C7D9]" : ""}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>
              {!collapsed && isExpanded && (
                <FolderSection
                  tipoItem={item.tipoItem}
                  entity={item.entity}
                  nameField={item.nameField}
                  selectedId={selection.kind === item.tipoItem ? selection.id : null}
                  onItemClick={(entity) => handleItemClick(item, entity)}
                />
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-1 flex-shrink-0">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all w-full" title={collapsed ? "Sair" : undefined}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center w-full py-2 rounded-xl text-[#9CA3AF] hover:bg-muted transition-all">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}