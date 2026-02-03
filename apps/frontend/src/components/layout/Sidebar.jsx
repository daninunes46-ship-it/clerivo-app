import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, Kanban, Users, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Inbox, label: 'Inbox', path: '/inbox' },
    { icon: Kanban, label: 'Pipeline', path: '/pipeline' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
  ];

  return (
    <>
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col font-sans transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
            Clerivo
          </h1>
          
          {/* Bouton fermeture mobile uniquement */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-zinc-400 hover:text-indigo-600 rounded-md transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => onClose()} // Ferme le menu au clic sur un lien (mobile UX)
              className={({ isActive }) => `group flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-r-md transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-l-4 border-transparent'
              }`}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} 
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
              AG
            </div>
            <div className="text-sm">
              <p className="font-bold text-zinc-900">Agent</p>
              <p className="text-xs text-zinc-500 font-medium">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
