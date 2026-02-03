import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Overlay sombre pour mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Responsive */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* Header Mobile Uniquement */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-100 bg-white z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-indigo-600 tracking-tight">Clerivo</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Contenu Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
