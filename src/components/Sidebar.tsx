'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  ScanQrCode, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  LogOut,
  UserCheck,
  UserX,
  Menu,
  X,
  FileText
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, isOpen, setIsOpen }) => {
  const { user, logout, switchRole } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { id: 'builders', label: 'Builder Search', icon: Search, roles: ['admin', 'user'] },
    { id: 'leads', label: 'Lead Management', icon: Users, roles: ['admin', 'user'] },
    { id: 'ocr', label: 'OCR Extraction', icon: ScanQrCode, roles: ['admin', 'user'] },
    { id: 'quotations', label: 'Quotation Builder', icon: FileText, roles: ['admin', 'user'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'user'] },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'user'] },
  ];

  const handleTabClick = (tabId: string) => {
    setTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-blue-900 bg-blue-950 text-blue-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Builder<span className="text-amber-500">CRM</span>
            </span>
          </div>
          <button 
            className="lg:hidden p-1.5 rounded-lg text-blue-300 hover:bg-blue-900"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {menuItems
            .filter((item) => item.roles.includes(user?.role || 'user'))
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                      : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-slate-950' : 'text-blue-300 group-hover:text-white'
                  }`} />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* User Profile / Quick Actions Footer */}
        <div className="p-4 border-t border-blue-900 bg-blue-950/60">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'} 
              alt={user?.name || 'User'} 
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-blue-300 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Quick Role Switcher for Demo Purposes */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-4 rounded-lg bg-blue-900/60 text-[11px] font-semibold text-blue-200">
            <span>Role: <strong className="text-amber-500 uppercase">{user?.role}</strong></span>
            <button
              onClick={() => switchRole(user?.role === 'admin' ? 'user' : 'admin')}
              className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors"
              title="Toggle role for testing features"
            >
              {user?.role === 'admin' ? (
                <><UserX className="h-3 w-3" /> User Mode</>
              ) : (
                <><UserCheck className="h-3 w-3" /> Admin Mode</>
              )}
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-900 text-blue-300 hover:bg-blue-900 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
