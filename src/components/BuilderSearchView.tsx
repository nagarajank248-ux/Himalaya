'use client';

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Globe, 
  Map, 
  Plus, 
  Star,
  Search,
  SlidersHorizontal,
  X,
  Wifi,
  WifiOff,
  Loader2,
  Info,
  ExternalLink
} from 'lucide-react';
import { BuilderBusiness } from '../types/crm';

interface BuilderSearchViewProps {
  onAddAsLead: (builder: BuilderBusiness) => void;
}

export const BuilderSearchView: React.FC<BuilderSearchViewProps> = ({ onAddAsLead }) => {
  const { builders, categories, addNotification } = useCRM();

  // Search mode state: 'local' (offline mock) vs 'internet' (Google Places API)
  const [searchMode, setSearchMode] = useState<'local' | 'internet'>('local');

  // Search filter states
  const [showFilters, setShowFilters] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [minRating, setMinRating] = useState<number | ''>('');

  // Internet Search API states
  const [isLoading, setIsLoading] = useState(false);
  const [apiResults, setApiResults] = useState<BuilderBusiness[]>([]);
  const [apiSource, setApiSource] = useState<'google_places_api_live' | 'local_database_fallback' | ''>('');

  // Clear filters
  const resetFilters = () => {
    setName('');
    setCity('');
    setDistrict('');
    setState('');
    setCategory('');
    setMinRating('');
    setApiResults([]);
    setApiSource('');
  };

  // Offline / Local Filter logic
  const filteredBuilders = builders.filter((b) => {
    const matchesName = name ? b.name.toLowerCase().includes(name.toLowerCase()) : true;
    const matchesCity = city ? b.city.toLowerCase().includes(city.toLowerCase()) : true;
    const matchesDistrict = district ? b.district.toLowerCase().includes(district.toLowerCase()) : true;
    const matchesState = state ? b.state.toLowerCase().includes(state.toLowerCase()) : true;
    const matchesCategory = category ? b.category.toLowerCase().includes(category.toLowerCase()) : true;
    const matchesRating = minRating ? (b.rating || 0) >= Number(minRating) : true;

    return matchesName && matchesCity && matchesDistrict && matchesState && matchesCategory && matchesRating;
  });

  // Internet Search execution
  const handleInternetSearch = async () => {
    // Requires at least a city or business name to hit search
    if (!city.trim() && !name.trim()) {
      addNotification('error', 'Please enter a City or Business Name to search Google Maps.');
      return;
    }

    setIsLoading(true);
    setApiResults([]);
    setApiSource('');

    try {
      const urlCategory = category || 'construction builder';
      const response = await fetch(
        `/api/builders?city=${encodeURIComponent(city.trim())}&name=${encodeURIComponent(name.trim())}&category=${encodeURIComponent(urlCategory)}`
      );
      const data = await response.json();

      if (response.ok) {
        setApiResults(data.builders || []);
        setApiSource(data.source);
        
        if (data.source === 'local_database_fallback') {
          addNotification('info', 'Offline Database Fallback: No API Key configured.');
        } else {
          addNotification('success', `Fetched ${data.builders.length} live builders from Google Maps!`);
        }
      } else {
        const errorMsg = data.details 
          ? `${data.error} Details: ${data.details}` 
          : (data.error || 'Failed to search Google Maps.');
        addNotification('error', errorMsg);
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Network error connecting to Search API.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeResults = searchMode === 'local' ? filteredBuilders : apiResults;

  return (
    <div className="space-y-6">
      {/* Page Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Builder Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find construction businesses and import their public contact details as CRM leads.
          </p>
        </div>

        {/* Mode Selector Segment */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
          <button
            onClick={() => { setSearchMode('local'); resetFilters(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'local'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <WifiOff className="h-3.5 w-3.5" />
            Offline Database
          </button>
          <button
            onClick={() => { setSearchMode('internet'); resetFilters(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'internet'
                ? 'bg-[#fb8500] text-white shadow-sm shadow-[#fb8500]/10'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            Google Maps Live
          </button>
        </div>
      </div>

      {/* API Key Fallback Notice */}
      {searchMode === 'internet' && apiSource === 'local_database_fallback' && (
        <div className="flex gap-2.5 p-3.5 rounded-xl border border-amber-250 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 text-xs text-amber-800 dark:text-amber-450 items-start">
          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Offline Search Fallback Mode:</span> No Google Maps API Key has been configured in the backend environment. Running local database search. To retrieve live Google Maps details for any location, set <code className="font-mono bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">GOOGLE_PLACES_API_KEY</code> inside <code className="font-mono">.env.local</code>.
          </div>
        </div>
      )}

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={searchMode === 'local' ? "Search offline database..." : "Enter company name (optional)..."}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          
          {/* Filters, Clear, and Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                showFilters 
                  ? 'border-blue-200 bg-[#fff3e0] text-[#fb8500] dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-450' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800/80'
              }`}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Location Filters
              {(city || district || state || category || minRating) && (
                <span className="h-2 w-2 rounded-full bg-[#fb8500] animate-pulse" />
              )}
            </button>

            {searchMode === 'internet' && (
              <button
                onClick={handleInternetSearch}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#fb8500] hover:bg-[#e07500] disabled:bg-[#fb8500]/60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#fb8500]/10 transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Internet'
                )}
              </button>
            )}

            {(name || city || district || state || category || minRating) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Extended Filters */}
        {(showFilters || searchMode === 'internet') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* City */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                City / Location *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Chennai, Chicago"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                District
              </label>
              <input
                type="text"
                disabled={searchMode === 'internet'}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Coimbatore"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                disabled={searchMode === 'internet'}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Min Rating
              </label>
              <select
                value={minRating}
                disabled={searchMode === 'internet'}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ ★</option>
                <option value="4.0">4.0+ ★</option>
                <option value="3.5">3.5+ ★</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Loading skeletons for API Search */}
        {isLoading && (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-250 dark:bg-slate-800 rounded w-10" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-5/6" />
              </div>
            </div>
          ))
        )}

        {!isLoading && activeResults.length > 0 ? (
          activeResults.map((builder) => (
            <div 
              key={builder.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between group hover:border-[#8ecae6]/50 dark:hover:border-blue-900/50 hover:shadow-md transition-all duration-300 animate-in fade-in duration-200"
            >
              <div className="space-y-3.5">
                {/* Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#219ebc] dark:text-blue-400 uppercase tracking-wider">
                      {builder.category || 'Construction Builder'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white truncate mt-0.5">
                      {builder.name}
                    </h3>
                  </div>

                  {/* Rating */}
                  {builder.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                      <Star className="h-3 w-3 fill-current" />
                      {builder.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{builder.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{builder.address}</span>
                  </div>

                  {builder.notes && (
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100/70 dark:border-slate-805/30">
                      {builder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Utility / Call to action links */}
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/40">
                {builder.website && (
                  <a
                    href={builder.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#219ebc] dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                
                {builder.googleMapsLink && (
                  <a
                    href={builder.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Maps
                  </a>
                )}

                <button
                  onClick={() => onAddAsLead(builder)}
                  className="flex items-center gap-1.5 bg-[#fff3e0] hover:bg-[#ffe0b2] text-[#fb8500] dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/60 ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add to Leads
                </button>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <Building2 className="h-12 w-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-medium text-sm">
                {searchMode === 'local' 
                  ? 'No builders match these offline search filters.' 
                  : 'Search Google Maps to retrieve live records from the internet.'}
              </p>
              {searchMode === 'internet' && !city.trim() && (
                <p className="text-xs text-slate-500 mt-1">Please enter a City/Location to search.</p>
              )}
              {searchMode === 'local' && (
                <button 
                  onClick={resetFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
