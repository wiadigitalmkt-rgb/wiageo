import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
