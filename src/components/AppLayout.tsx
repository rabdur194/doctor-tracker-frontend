"use client";

import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Main layout for authenticated pages
 * Includes Sidebar + content area
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 hpfull overflow-y-auto overflow-x-hidden">
          <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
