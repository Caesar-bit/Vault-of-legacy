import React from 'react';
import { useState } from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Navigation
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}