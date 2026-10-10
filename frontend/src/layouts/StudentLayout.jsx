import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AmbientBackground } from '../components/ui/AmbientBackground';

export const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AmbientBackground>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </AmbientBackground>
  );
};
