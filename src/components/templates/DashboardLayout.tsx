import React, { useState } from "react";
import Sidebar from "../molecules/Sidebar";
import Header from "../molecules/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
