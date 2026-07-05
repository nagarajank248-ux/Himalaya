'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { Sidebar } from '../components/Sidebar';
import { LoginView } from '../components/LoginView';
import { DashboardView } from '../components/DashboardView';
import { BuilderSearchView } from '../components/BuilderSearchView';
import { LeadManagementView } from '../components/LeadManagementView';
import { OCRExtractionView } from '../components/OCRExtractionView';
import { AnalyticsView } from '../components/AnalyticsView';
import { AdminPanelView } from '../components/AdminPanelView';
import { SettingsView } from '../components/SettingsView';
import { QuotationView } from '../components/QuotationView';
import { LeadModal } from '../components/LeadModal';
import { NotificationToast } from '../components/NotificationToast';
import { Menu, Loader2, Users, Bell } from 'lucide-react';
import { Lead, BuilderBusiness } from '../types/crm';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addLead, updateLead, notifications } = useCRM();

  // Tab State
  const [currentTab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Reminders / Notification dropdown status
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-650 dark:text-slate-400">Loading your lead workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <NotificationToast />
      </>
    );
  }

  // Open modal in "Add" mode
  const handleAddNewLead = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  // Open modal in "Edit" mode
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  // Import business records from directory into modal prefill
  const handleAddBuilderAsLead = (builder: BuilderBusiness) => {
    setEditingLead({
      id: '', // dummy
      name: '', // User will input this
      company: builder.name,
      phone: builder.phone,
      address: builder.address,
      city: builder.city,
      state: builder.state,
      notes: builder.notes || `Imported builder business from directory. Category: ${builder.category}`,
      status: 'new',
      priority: 'medium',
      followUpDate: '',
      tags: ['Imported', builder.category],
      favorite: false,
      createdAt: ''
    });
    setIsModalOpen(true);
  };

  // Import OCR numbers as lead prefill
  const handleAddOCRAsLead = (prefill: { phone: string; name?: string; company?: string }) => {
    setEditingLead({
      id: '',
      name: prefill.name || '',
      company: prefill.company || 'OCR Extracted Builder',
      phone: prefill.phone,
      address: '',
      city: '',
      state: '',
      notes: 'Extracted contact details from image using OCR scan.',
      status: 'new',
      priority: 'medium',
      followUpDate: '',
      tags: ['OCR Scan'],
      favorite: false,
      createdAt: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveLead = (leadData: any) => {
    if (leadData.id) {
      updateLead(leadData as Lead);
    } else {
      addLead(leadData);
    }
  };

  // Tab Renderer switcher
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setTab={setTab} onAddLeadClick={handleAddNewLead} />;
      case 'builders':
        return <BuilderSearchView onAddAsLead={handleAddBuilderAsLead} />;
      case 'leads':
        return (
          <LeadManagementView 
            onAddLeadClick={handleAddNewLead} 
            onEditLeadClick={handleEditLead} 
          />
        );
      case 'ocr':
        return <OCRExtractionView onSaveAsLead={handleAddOCRAsLead} />;
      case 'quotations':
        return <QuotationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanelView /> : <DashboardView setTab={setTab} onAddLeadClick={handleAddNewLead} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setTab={setTab} onAddLeadClick={handleAddNewLead} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main page panel */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-[#219ebc]/30 bg-[#023047] px-6 text-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-200 hover:bg-[#219ebc]/20"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-white capitalize">
              {currentTab === 'ocr' ? 'OCR Extraction' : currentTab.replace('-', ' ')}
            </h2>
          </div>

          {/* Right navbar profile details / Notifications dropdown */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 border border-slate-700 text-slate-200 hover:bg-[#219ebc]/20 rounded-xl relative transition-colors cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#fb8500] animate-pulse" />
                )}
              </button>

              {showNotifMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowNotifMenu(false)} />
                  <div className="absolute right-0 mt-2 z-30 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 max-h-[350px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Reminders & Alerts
                    </h3>
                    <div className="space-y-2.5">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className="text-xs border-b border-slate-50 dark:border-slate-850 pb-2 last:border-0 last:pb-0"
                          >
                            <p className="text-slate-705 dark:text-slate-300 font-semibold leading-normal">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-450 text-center py-4">
                          No notifications or scheduled reminders.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick stats mini layout */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-250/20 dark:border-slate-800/40 select-none">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span>Lead Workspace: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">Active</strong></span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Global Modals & Toasts */}
      <LeadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={editingLead}
        onSave={handleSaveLead}
      />
      
      <NotificationToast />
    </div>
  );
}
