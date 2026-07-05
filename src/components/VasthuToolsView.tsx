'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Compass, 
  Grid3X3, 
  ArrowUp, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';

type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

interface RoomRule {
  best: string[];
  acceptable: string[];
  avoid: string[];
  advice: string;
}

const VASTHU_RULES: Record<Direction, RoomRule> = {
  N: {
    best: ['Living Room', 'Entrance', 'Puja Room', 'study_room'],
    acceptable: ['Guest Bedroom', 'Safe/Treasury'],
    avoid: ['Kitchen', 'Toilet', 'Master Bedroom'],
    advice: 'Ruled by Lord Kubera (Wealth). Best for main entrances, treasury vaults, and reception rooms to attract positive cash flow.'
  },
  NE: {
    best: ['Puja Room', 'Entrance', 'Living Room', 'study_room'],
    acceptable: ['Verandah', 'Balcony'],
    avoid: ['Toilet', 'Kitchen', 'Master Bedroom', 'Heavy Storage'],
    advice: 'Ishanya Corner (Water element / Lord Shiva). Most sacred zone. Keep it clean, light, and open. Best for worship, meditation, and study.'
  },
  E: {
    best: ['Entrance', 'Living Room', 'study_room', 'Guest Bedroom'],
    acceptable: ['Dining Room', 'Bathroom (no toilet)'],
    avoid: ['Toilet', 'Kitchen', 'Master Bedroom'],
    advice: 'Ruled by Lord Indra & Lord Surya (Health & Social Connect). Ideal for open corridors, large windows, and social gathering spaces.'
  },
  SE: {
    best: ['Kitchen'],
    acceptable: ['Electrical Controls', 'Office Space'],
    avoid: ['Bedroom', 'Toilet', 'Puja Room', 'Entrance'],
    advice: 'Agneya Corner (Fire element). Ruled by Lord Agni. Strictly reserved for fire-related rooms, primarily the Kitchen.'
  },
  S: {
    best: ['Master Bedroom', 'Living Room', 'Storage Room'],
    acceptable: ['Office Room', 'Elevators'],
    avoid: ['Puja Room', 'Kitchen', 'Entrance', 'Basement'],
    advice: 'Ruled by Lord Yama (Stability & Fame). Keep this sector heavy. Ideal for master bedrooms and high storage cabinets.'
  },
  SW: {
    best: ['Master Bedroom', 'Office Room', 'Heavy Storage'],
    acceptable: ['Wardrobes', 'Staircase'],
    avoid: ['Puja Room', 'Toilet', 'Kitchen', 'Entrance', 'Water Tank (underground)'],
    advice: 'Nairutya Corner (Earth element). Ruled by Demon Rahu. Zone of power and stability. Best for the owner\'s master bedroom to assert authority.'
  },
  W: {
    best: ['Dining Room', 'study_room', 'Children\'s Bedroom'],
    acceptable: ['Guest Bedroom', 'Toilet'],
    avoid: ['Puja Room', 'Entrance', 'Kitchen'],
    advice: 'Ruled by Lord Varuna (Water / Saturation). Ideal for study rooms, children\'s rooms, and dining zones.'
  },
  NW: {
    best: ['Guest Bedroom', 'Toilet', 'Dining Room'],
    acceptable: ['Garage', 'Store Room', 'Kitchen (alternative)'],
    avoid: ['Puja Room', 'Master Bedroom', 'Entrance (East/North alternative preferred)'],
    advice: 'Vayu Corner (Air element). Ruled by Lord Vayu. Zone of movement and travel. Ideal for guest rooms, toilets, and storing items to sell quickly.'
  }
};

const ROOM_OPTIONS = [
  'Empty Space',
  'Puja Room',
  'Kitchen',
  'Master Bedroom',
  'Guest Bedroom',
  'Living Room',
  'Dining Room',
  'Toilet',
  'Entrance'
];

export const VasthuToolsView: React.FC = () => {
  const { addNotification } = useCRM();
  const [activeTab, setActiveTab] = useState<'compass' | 'planner'>('compass');
  
  // --- Compass States ---
  const [heading, setHeading] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [manualAngle, setManualAngle] = useState(0);
  const [selectedDirection, setSelectedDirection] = useState<Direction>('N');

  // Rotate handler
  const angle = isTracking ? heading : manualAngle;

  // Sync angle to selected direction sector
  useEffect(() => {
    const normalized = (360 - (angle % 360)) % 360;
    let dir: Direction = 'N';
    
    if (normalized >= 337.5 || normalized < 22.5) dir = 'N';
    else if (normalized >= 22.5 && normalized < 67.5) dir = 'NE';
    else if (normalized >= 67.5 && normalized < 112.5) dir = 'E';
    else if (normalized >= 112.5 && normalized < 157.5) dir = 'SE';
    else if (normalized >= 157.5 && normalized < 202.5) dir = 'S';
    else if (normalized >= 202.5 && normalized < 247.5) dir = 'SW';
    else if (normalized >= 247.5 && normalized < 292.5) dir = 'W';
    else if (normalized >= 292.5 && normalized < 337.5) dir = 'NW';

    setSelectedDirection(dir);
  }, [angle]);

  // Activate device compass listeners
  const startCompassTracking = async () => {
    if (typeof window === 'undefined') return;

    // Check iOS permission request
    const deviceOrient = (DeviceOrientationEvent as any);
    if (deviceOrient && typeof deviceOrient.requestPermission === 'function') {
      try {
        const permission = await deviceOrient.requestPermission();
        if (permission === 'granted') {
          setIsTracking(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          addNotification('error', 'Device Orientation permission was denied.');
        }
      } catch (e) {
        addNotification('error', 'Could not request sensor access.');
      }
    } else {
      // Android / Desktop fallback
      setIsTracking(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading is iOS specific
    const compassHeading = (e as any).webkitCompassHeading;
    if (compassHeading !== undefined) {
      setHeading(Math.round(compassHeading));
    } else if (e.alpha !== null) {
      // alpha is 0-360 relative, not absolute north, but best fallback
      setHeading(Math.round(360 - e.alpha));
    }
  };

  const stopCompassTracking = () => {
    setIsTracking(false);
    window.removeEventListener('deviceorientation', handleOrientation, true);
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
  };

  // --- Mandala Planner States ---
  // 3x3 Grid directions layout:
  // [NW, N, NE]
  // [W,  C, E ]
  // [SW, S, SE]
  const initialGrid: Record<string, string> = {
    NW: 'Empty Space', N: 'Empty Space', NE: 'Empty Space',
    W: 'Empty Space',  C: 'Empty Space', E: 'Empty Space',
    SW: 'Empty Space', S: 'Empty Space', SE: 'Empty Space'
  };
  
  const [plannerGrid, setPlannerGrid] = useState<Record<string, string>>(initialGrid);
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const handleResetPlanner = () => {
    setPlannerGrid(initialGrid);
    setActiveCell(null);
    addNotification('success', 'Planner grid reset.');
  };

  // Calculate Vasthu Score
  const calculateVasthuScore = () => {
    let score = 100;
    let placedRooms = 0;
    const details: { direction: string; room: string; status: 'best' | 'acceptable' | 'avoid'; points: number; note: string }[] = [];

    Object.entries(plannerGrid).forEach(([dir, room]) => {
      if (room === 'Empty Space') return;
      placedRooms++;
      const rule = VASTHU_RULES[dir as Direction];
      
      // Central zone check (Brahmasthan should be open)
      if (dir === 'C') {
        if (room === 'Living Room' || room === 'Entrance') {
          details.push({ direction: dir, room, status: 'acceptable', points: 0, note: 'Brahmasthan (Center) is open/living hall. Acceptable.' });
        } else {
          score -= 20;
          details.push({ direction: dir, room, status: 'avoid', points: -20, note: 'Brahmasthan (Center) should remain open, empty or light. Avoid heavy rooms.' });
        }
        return;
      }

      if (rule) {
        if (rule.best.includes(room)) {
          details.push({ direction: dir, room, status: 'best', points: 0, note: `${room} in ${dir} is perfectly aligned according to Vasthu.` });
        } else if (rule.acceptable.includes(room)) {
          score -= 10;
          details.push({ direction: dir, room, status: 'acceptable', points: -10, note: `${room} in ${dir} is acceptable, but not ideal.` });
        } else if (rule.avoid.includes(room)) {
          score -= 25;
          details.push({ direction: dir, room, status: 'avoid', points: -25, note: `${room} in ${dir} violates Vasthu Shastra! Try to relocate.` });
        } else {
          // Neutral
          score -= 5;
          details.push({ direction: dir, room, status: 'acceptable', points: -5, note: `${room} in ${dir} has a neutral placement impact.` });
        }
      }
    });

    if (placedRooms === 0) return { score: 100, details: [], placedCount: 0 };
    
    // Bounds check
    const finalScore = Math.max(0, score);
    return { score: finalScore, details, placedCount: placedRooms };
  };

  const { score, details, placedCount } = calculateVasthuScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vasthu Consultant Suite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Interactive utility tools to design, analyze, and verify architectural plans according to Vasthu directions.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('compass')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compass'
                ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            Digital Compass
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Mandala Grid Planner
          </button>
        </div>
      </div>

      {/* --- COMPASS TAB --- */}
      {activeTab === 'compass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Visual Compass Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between min-h-[500px]">
            
            {/* Header info */}
            <div className="w-full text-center mb-4">
              <span className="text-[10px] font-bold text-[#fb8500] uppercase tracking-wider bg-[#fb8500]/10 px-2.5 py-1 rounded-full">
                {isTracking ? 'Active Orientation Tracking' : 'Manual Rotation Mode'}
              </span>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-2">
                Facing Sector: <span className="text-[#fb8500]">{selectedDirection} ({VASTHU_RULES[selectedDirection].best[0]} Zone)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Heading Angle: {angle}°
              </p>
            </div>

            {/* Compass Outer SVG */}
            <div className="relative w-72 h-72 my-5 flex items-center justify-center">
              {/* Stationary alignment pointer */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <ArrowUp className="h-6 w-6 text-[#fb8500] animate-bounce" />
                <span className="text-[9px] font-extrabold text-white bg-[#fb8500] px-1.5 py-0.5 rounded uppercase tracking-wider">Facing</span>
              </div>

              {/* Rotatable Compass wheel */}
              <div 
                className="w-64 h-64 rounded-full bg-slate-950 border-4 border-slate-900 shadow-xl relative transition-transform duration-200 flex items-center justify-center select-none"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                {/* Dial Marks */}
                <div className="absolute inset-2 rounded-full border border-slate-800/60 flex items-center justify-center">
                  {/* Directions labels */}
                  <span className="absolute top-2.5 text-base font-black text-rose-500">N</span>
                  <span className="absolute top-4.5 right-4.5 text-xs font-bold text-slate-400 rotate-45">NE</span>
                  
                  <span className="absolute right-3.5 text-base font-black text-[#ffb703]">E</span>
                  <span className="absolute bottom-5 right-5 text-xs font-bold text-slate-400 rotate-135">SE</span>
                  
                  <span className="absolute bottom-2.5 text-base font-black text-slate-300">S</span>
                  <span className="absolute bottom-5 left-5 text-xs font-bold text-slate-400 rotate-225">SW</span>
                  
                  <span className="absolute left-3.5 text-base font-black text-slate-300">W</span>
                  <span className="absolute top-4.5 left-4.5 text-xs font-bold text-slate-400 rotate-315">NW</span>

                  {/* Grid Lines inside Dial */}
                  <div className="w-full h-[1px] bg-slate-800/40 absolute top-1/2 left-0 -translate-y-1/2" />
                  <div className="h-full w-[1px] bg-slate-800/40 absolute left-1/2 top-0 -translate-x-1/2" />
                  
                  {/* Center Circle */}
                  <div className="h-14 w-14 rounded-full bg-slate-900 border-2 border-[#219ebc]/40 flex items-center justify-center shadow-inner">
                    <Compass className="h-6 w-6 text-[#ffb703] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Rotation Control Sliders */}
            <div className="w-full space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              {!isTracking ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Rotate Compass Angle</span>
                    <span>{manualAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={manualAngle}
                    onChange={(e) => setManualAngle(parseInt(e.target.value))}
                    className="w-full accent-[#fb8500] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                  />
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-650 font-medium">
                  Rotate your mobile device physically. Compass sensor is active.
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-center gap-3">
                {isTracking ? (
                  <button
                    onClick={stopCompassTracking}
                    className="flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Stop Compass Sensor
                  </button>
                ) : (
                  <button
                    onClick={startCompassTracking}
                    className="flex items-center gap-1.5 bg-[#fb8500] hover:bg-[#e07500] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#fb8500]/15 transition-all cursor-pointer hover:translate-y-[-1px]"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Calibrate Live Device Sensor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines info side panel */}
          <div className="lg:col-span-5 space-y-4">
            {/* Advice card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#219ebc] dark:bg-slate-800 uppercase tracking-wider">
                  Zone rules
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                  Guideline Properties: Sector {selectedDirection}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50">
                {VASTHU_RULES[selectedDirection].advice}
              </p>

              {/* Rules Lists */}
              <div className="space-y-3.5 pt-2">
                
                {/* BEST FIT */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Best Rooms to Place
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {VASTHU_RULES[selectedDirection].best.map((r, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-1 rounded-lg">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACCEPTABLE FIT */}
                {VASTHU_RULES[selectedDirection].acceptable.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-[#ffb703] shrink-0" />
                      Acceptable Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {VASTHU_RULES[selectedDirection].acceptable.map((r, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-[#ffb703] px-2 py-1 rounded-lg">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AVOID COMPLETELY */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    Avoid Placing (Strictly)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {VASTHU_RULES[selectedDirection].avoid.map((r, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-1 rounded-lg">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick reference guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-[#ffb703] shrink-0" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                  Did you know?
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In Vasthu Shastra, the Northeast direction represents the <strong>water element</strong> and rules mental clarity. The Southeast direction represents the <strong>fire element</strong>, which controls health and digestion. Interchanging the kitchen and worship spots causes spiritual and financial conflicts.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* --- PLANNER TAB --- */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 3x3 Mandala grid */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Grid (3x3 Matrix)
              </h2>
              <p className="text-xs text-slate-500">Click on any directional cell to assign and place home rooms.</p>
            </div>

            {/* Grid structure */}
            <div className="grid grid-cols-3 gap-3.5 max-w-sm mx-auto aspect-square">
              {Object.entries(plannerGrid).map(([dir, room]) => {
                const isSelected = activeCell === dir;
                
                // Color codes cell status
                let cellClass = 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200';
                
                if (room !== 'Empty Space') {
                  const rule = VASTHU_RULES[dir as Direction];
                  if (dir === 'C') {
                    cellClass = room === 'Living Room' || room === 'Entrance' 
                      ? 'border-emerald-200 bg-emerald-50/30 text-emerald-800' 
                      : 'border-rose-250 bg-rose-50/20 text-rose-800';
                  } else if (rule) {
                    if (rule.best.includes(room)) {
                      cellClass = 'border-emerald-300 bg-emerald-50 text-emerald-850 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-450';
                    } else if (rule.acceptable.includes(room)) {
                      cellClass = 'border-amber-300 bg-amber-50 text-amber-850 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-450';
                    } else if (rule.avoid.includes(room)) {
                      cellClass = 'border-rose-300 bg-rose-50 text-rose-850 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-450';
                    }
                  }
                }

                if (isSelected) {
                  cellClass += ' ring-2 ring-[#fb8500] scale-95 z-10';
                }

                return (
                  <button
                    key={dir}
                    onClick={() => setActiveCell(isSelected ? null : dir)}
                    className={`rounded-2xl border p-3 flex flex-col items-center justify-between transition-all cursor-pointer ${cellClass}`}
                  >
                    <div className="flex justify-between w-full">
                      <span className="text-[10px] font-bold text-slate-400">{dir}</span>
                    </div>
                    
                    <span className="text-center font-bold text-[11px] leading-tight select-none my-auto">
                      {room}
                    </span>
                    
                    <span className="text-[9px] text-slate-400 capitalize">
                      {dir === 'C' ? 'Brahma' : 
                       dir === 'NW' ? 'Vayu' :
                       dir === 'NE' ? 'Ishanya' :
                       dir === 'SE' ? 'Agneya' :
                       dir === 'SW' ? 'Nairutya' : 'Zone'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selection Selector panel */}
            {activeCell && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Place room in sector: <span className="text-[#fb8500] font-extrabold">{activeCell}</span>
                  </h4>
                  <button onClick={() => setActiveCell(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ROOM_OPTIONS.map((room) => {
                    const isPlacedInCell = plannerGrid[activeCell] === room;
                    return (
                      <button
                        key={room}
                        onClick={() => {
                          setPlannerGrid(prev => ({ ...prev, [activeCell]: room }));
                          setActiveCell(null);
                        }}
                        className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold text-center transition-all cursor-pointer ${
                          isPlacedInCell
                            ? 'bg-[#fb8500] text-white border-[#fb8500]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350'
                        }`}
                      >
                        {room}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <button
                onClick={handleResetPlanner}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Layout Grid
              </button>
            </div>

          </div>

          {/* Real-time score & logs details */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Score display card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="text-center space-y-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Vasthu Shastra Score</span>
                <div className="flex justify-center items-baseline gap-1">
                  <span className={`text-5xl font-black ${
                    score >= 90 ? 'text-emerald-600' :
                    score >= 70 ? 'text-[#ffb703]' : 'text-rose-600'
                  }`}>
                    {placedCount > 0 ? score : '100'}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </div>
                
                {/* Score badge summary */}
                <div className="inline-block">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    placedCount === 0 ? 'bg-slate-100 text-slate-500' :
                    score >= 90 ? 'bg-emerald-50 text-emerald-700' :
                    score >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {placedCount === 0 ? 'No rooms placed yet' :
                     score >= 90 ? 'Excellent Vasthu Compliance' :
                     score >= 70 ? 'Moderate Compliance' : 'Severe Vasthu Conflicts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Logs panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Compliance Feedback Check
                </h3>
                <p className="text-xs text-slate-500">Real-time analysis details based on selected room positions.</p>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {placedCount > 0 && details.length > 0 ? (
                  details.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`flex gap-3 p-3 rounded-xl border text-xs leading-normal items-start ${
                        item.status === 'best' ? 'border-emerald-100 bg-emerald-50/20 text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/5' :
                        item.status === 'acceptable' ? 'border-amber-100 bg-amber-50/20 text-amber-800 dark:border-amber-950/40 dark:bg-amber-950/5' :
                        'border-rose-100 bg-rose-50/20 text-rose-800 dark:border-rose-950/40 dark:bg-rose-950/5'
                      }`}
                    >
                      {item.status === 'best' && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />}
                      {item.status === 'acceptable' && <AlertTriangle className="h-4.5 w-4.5 text-[#ffb703] shrink-0" />}
                      {item.status === 'avoid' && <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />}

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-[11px] uppercase tracking-wider">
                            Sector {item.direction}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            item.points >= 0 ? 'text-emerald-700' :
                            item.status === 'acceptable' ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {item.points >= 0 ? `+${item.points}` : item.points} pts
                          </span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-400 font-medium">{item.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center">
                    <HelpCircle className="h-10 w-10 text-slate-350 stroke-1 mb-2 animate-bounce" />
                    <p className="text-xs">Select directions on the grid board to analyze your plans.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
