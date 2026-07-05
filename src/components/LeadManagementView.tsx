'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead } from '../types/crm';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  Trash2, 
  Edit3, 
  Plus,
  Phone,
  PhoneCall,
  Copy,
  Share2,
  MessageCircle,
  FileSpreadsheet,
  FileCode,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  Check,
  Tag
} from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/export';

interface LeadManagementViewProps {
  onAddLeadClick: () => void;
  onEditLeadClick: (lead: Lead) => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = ({
  onAddLeadClick,
  onEditLeadClick
}) => {
  const { leads, deleteLead, toggleFavoriteLead, updateLead, addNotification } = useCRM();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [favFilter, setFavFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'company' | 'followUpDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Phone utilities active state
  const [activePhoneMenu, setActivePhoneMenu] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Phone action helpers
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    addNotification('success', `Copied number ${phone} to clipboard.`);
    setActivePhoneMenu(null);
  };

  const handleSharePhone = (lead: Lead) => {
    const text = `Contact: ${lead.name} from ${lead.company}. Phone: ${lead.phone}`;
    if (navigator.share) {
      navigator.share({
        title: 'Lead Contact Details',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      addNotification('success', 'Lead details copied to clipboard to share.');
    }
    setActivePhoneMenu(null);
  };

  const handleWhatsApp = (phone: string) => {
    // Sanitize phone number (keep only digits)
    const cleanNumber = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
    setActivePhoneMenu(null);
  };

  // Collect all unique tags in leads
  const allTags = Array.from(new Set(leads.flatMap(l => l.tags)));

  // Filter logic
  const filteredLeads = leads.filter(l => {
    const matchSearch = 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.notes.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter ? l.status === statusFilter : true;
    const matchPriority = priorityFilter ? l.priority === priorityFilter : true;
    const matchFav = favFilter ? l.favorite : true;
    const matchTag = selectedTag ? l.tags.includes(selectedTag) : true;

    return matchSearch && matchStatus && matchPriority && matchFav && matchTag;
  });

  // Sort logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal: string | number = a[sortBy] || '';
    let bVal: string | number = b[sortBy] || '';

    if (sortBy === 'createdAt') {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleStatusChange = (lead: Lead, nextStatus: Lead['status']) => {
    updateLead({ ...lead, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* View Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, filter, export and coordinate your construction prospects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export tools */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden divide-x divide-slate-200 dark:divide-slate-800 shadow-xs">
            <button
              onClick={() => exportToExcel(filteredLeads)}
              className="p-2.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
              title="Export filtered leads to Excel"
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => exportToCSV(filteredLeads)}
              className="p-2.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              title="Export filtered leads to CSV"
            >
              <FileCode className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => exportToPDF(filteredLeads)}
              className="p-2.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
              title="Export filtered leads to PDF"
            >
              <FileText className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            onClick={onAddLeadClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/15 transition-all cursor-pointer hover:translate-y-[-1px]"
          >
            <Plus className="h-4.5 w-4.5" />
            New Lead
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Search bar */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Filter Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Filter Tag */}
          <div>
            <select
              value={selectedTag}
              onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Tags</option>
              {allTags.map((tag, idx) => (
                <option key={idx} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Favorites filter toggle */}
          <div className="flex items-center">
            <button
              onClick={() => { setFavFilter(!favFilter); setCurrentPage(1); }}
              className={`flex w-full items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                favFilter 
                  ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80'
              }`}
            >
              <Star className={`h-4 w-4 ${favFilter ? 'fill-current' : ''}`} />
              Favorites Only
            </button>
          </div>

        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                <th className="py-4 px-6 text-center w-12">Fav</th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-600" onClick={() => toggleSort('name')}>
                  Name
                </th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-600" onClick={() => toggleSort('company')}>
                  Company
                </th>
                <th className="py-4 px-4">Contact Utilities</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-600" onClick={() => toggleSort('followUpDate')}>
                  Follow Up Date
                </th>
                <th className="py-4 px-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-800 dark:text-slate-200">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Favorite Star */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => toggleFavoriteLead(lead.id)}
                        className={`transition-colors hover:scale-105 cursor-pointer ${
                          lead.favorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        <Star className={`h-4.5 w-4.5 ${lead.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{lead.name}</span>
                        {lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lead.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Tag className="h-2 w-2" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">
                          {lead.company.charAt(0)}
                        </div>
                        <span className="font-medium">{lead.company}</span>
                      </div>
                    </td>

                    {/* Contact Phone & Utilities menu */}
                    <td className="py-4 px-4">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActivePhoneMenu(activePhoneMenu === lead.id ? null : lead.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5 text-blue-500" />
                          <span>{lead.phone || 'No Phone'}</span>
                        </button>

                        {/* Phone Utilities Dropdown Menu */}
                        {activePhoneMenu === lead.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActivePhoneMenu(null)}
                            />
                            <div className="absolute left-0 mt-1.5 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                onClick={() => setActivePhoneMenu(null)}
                              >
                                <PhoneCall className="h-4 w-4 text-emerald-500" />
                                Call Number
                              </a>
                              <button
                                onClick={() => handleCopyPhone(lead.phone)}
                                className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition-colors"
                              >
                                <Copy className="h-4 w-4 text-blue-500" />
                                Copy Number
                              </button>
                              <button
                                onClick={() => handleSharePhone(lead)}
                                className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition-colors"
                              >
                                <Share2 className="h-4 w-4 text-teal-500" />
                                Share Contact
                              </button>
                              <button
                                onClick={() => handleWhatsApp(lead.phone)}
                                className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition-colors"
                              >
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                Chat on WhatsApp
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{lead.city || 'N/A'}{lead.state ? `, ${lead.state}` : ''}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 bg-opacity-10 dark:bg-opacity-20 cursor-pointer ${
                          lead.status === 'new' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          lead.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          lead.status === 'contacted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-4 px-4 font-semibold uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded text-[9px] ${
                        lead.priority === 'high' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' :
                        lead.priority === 'medium' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Follow-up Date */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.followUpDate || 'None'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditLeadClick(lead)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Edit lead"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete lead for ${lead.name}?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Delete lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-slate-400 dark:text-slate-500">
                    <User className="h-12 w-12 stroke-1 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-medium text-sm">No construction leads found matching your criteria.</p>
                    <button 
                      onClick={onAddLeadClick}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 hover:underline"
                    >
                      Create a lead now
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} leads)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
