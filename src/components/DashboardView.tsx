'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Users, 
  UserPlus, 
  PhoneCall, 
  Clock, 
  Star, 
  Plus, 
  Search, 
  Scan,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { Lead } from '../types/crm';

interface DashboardViewProps {
  setTab: (tab: string) => void;
  onAddLeadClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setTab, onAddLeadClick }) => {
  const { leads, activityLogs } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const pending = leads.filter(l => l.status === 'pending').length;
  const favorites = leads.filter(l => l.favorite).length;

  // Search filtered leads preview
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.city.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const stats = [
    { label: 'Total Leads', value: total, icon: Users, color: 'bg-[#fb8500]/10 text-[#fb8500] dark:text-blue-400' },
    { label: 'New Leads', value: newLeads, icon: UserPlus, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Contacted', value: contacted, icon: PhoneCall, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-[#ffb703]/10 text-[#ffb703] dark:text-amber-400' },
    { label: 'Favorites', value: favorites, icon: Star, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here is an overview of your builder lead pipelines.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onAddLeadClick}
            className="flex items-center gap-2 bg-[#fb8500] hover:bg-[#e07500] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#fb8500]/15 transition-all cursor-pointer hover:translate-y-[-1px]"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Lead
          </button>
          <button
            onClick={() => setTab('ocr')}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <Scan className="h-4.5 w-4.5 text-[#fb8500]" />
            OCR Phone Scan
          </button>
          <button
            onClick={() => setTab('builders')}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <Search className="h-4.5 w-4.5 text-teal-500" />
            Find Builders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>updated just now</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Search Everywhere + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search & Leads Preview (Col-Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Global Lead Directory
              </h2>
              <p className="text-xs text-slate-500">Search leads by name, company, or city.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search everywhere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Search Result List */}
          <div className="space-y-3 min-h-[220px]">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead: Lead) => (
                <div 
                  key={lead.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors cursor-pointer"
                  onClick={() => setTab('leads')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#fff3e0] dark:bg-blue-950/20 text-[#fb8500] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {lead.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lead.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-0.5"><Building2 className="h-3 w-3" /> {lead.company}</span>
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {lead.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      lead.status === 'new' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                      lead.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                      lead.status === 'contacted' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {lead.status}
                    </span>
                    {/* Priority Badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      lead.priority === 'high' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                      lead.priority === 'medium' ? 'bg-[#fff3e0] text-[#fb8500] dark:bg-blue-950/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {lead.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                <FileText className="h-10 w-10 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs">No leads found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-xs text-slate-500">Latest updates across the CRM.</p>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-slate-50 dark:border-slate-800/30 pb-3 last:border-0 last:pb-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fb8500] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    <strong className="text-slate-900 dark:text-white">{log.userName}</strong> {log.action.toLowerCase()}{' '}
                    <span className="text-slate-500 dark:text-slate-400 italic font-normal">{log.target}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {activityLogs.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p className="text-xs">No activity logged yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
