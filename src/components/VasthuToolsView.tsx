'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';
import { jsPDF } from 'jspdf';
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
  RefreshCw,
  Layout,
  Download,
  Building2,
  FileText,
  Sparkles,
  Maximize
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

interface AttachedToilet {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RoomPlan {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  doorWall?: 'top' | 'bottom' | 'left' | 'right';
  doorPos?: number;
  windowWalls?: ('top' | 'bottom' | 'left' | 'right')[];
  attachedToilet?: AttachedToilet;
  vastuNotes: string;
  isVastuDoor?: boolean;
}

export const VasthuToolsView: React.FC = () => {
  const { addNotification } = useCRM();
  const [activeTab, setActiveTab] = useState<'compass' | 'planner' | 'floorplan'>('compass');
  
  // --- Compass States ---
  const [heading, setHeading] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [manualAngle, setManualAngle] = useState(0);
  const [selectedDirection, setSelectedDirection] = useState<Direction>('N');

  const angle = isTracking ? heading : manualAngle;

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

  const startCompassTracking = async () => {
    if (typeof window === 'undefined') return;

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
      setIsTracking(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    const compassHeading = (e as any).webkitCompassHeading;
    if (compassHeading !== undefined) {
      setHeading(Math.round(compassHeading));
    } else if (e.alpha !== null) {
      setHeading(Math.round(360 - e.alpha));
    }
  };

  const stopCompassTracking = () => {
    setIsTracking(false);
    window.removeEventListener('deviceorientation', handleOrientation, true);
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
  };

  // --- Mandala Planner States ---
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

  const calculateVasthuScore = () => {
    let score = 100;
    let placedRooms = 0;
    const details: { direction: string; room: string; status: 'best' | 'acceptable' | 'avoid'; points: number; note: string }[] = [];

    Object.entries(plannerGrid).forEach(([dir, room]) => {
      if (room === 'Empty Space') return;
      placedRooms++;
      const rule = VASTHU_RULES[dir as Direction];
      
      if (dir === 'C') {
        if (room === 'Living Room' || room === 'Entrance') {
          details.push({ direction: dir, room, status: 'acceptable', points: 0, note: 'Brahmasthan (Center) is open. Acceptable.' });
        } else {
          score -= 20;
          details.push({ direction: dir, room, status: 'avoid', points: -20, note: 'Brahmasthan (Center) should remain open. Avoid toilets/kitchens.' });
        }
        return;
      }

      if (rule) {
        if (rule.best.includes(room)) {
          details.push({ direction: dir, room, status: 'best', points: 0, note: `${room} in ${dir} is perfectly aligned.` });
        } else if (rule.acceptable.includes(room)) {
          score -= 10;
          details.push({ direction: dir, room, status: 'acceptable', points: -10, note: `${room} in ${dir} is acceptable, but not ideal.` });
        } else if (rule.avoid.includes(room)) {
          score -= 25;
          details.push({ direction: dir, room, status: 'avoid', points: -25, note: `${room} in ${dir} violates Vasthu rules!` });
        } else {
          score -= 5;
          details.push({ direction: dir, room, status: 'acceptable', points: -5, note: `${room} in ${dir} has a neutral impact.` });
        }
      }
    });

    if (placedRooms === 0) return { score: 100, details: [], placedCount: 0 };
    return { score: Math.max(0, score), details, placedCount: placedRooms };
  };

  const { score, details, placedCount } = calculateVasthuScore();

  // --- 2D Floor Plan Blueprint Creator ---
  const [plotWidth, setPlotWidth] = useState(23);
  const [plotLength, setPlotLength] = useState(39);
  const [plotFacing, setPlotFacing] = useState<'East' | 'West' | 'North' | 'South'>('West');
  const [bedroomCount, setBedroomCount] = useState<2 | 3>(3);
  const [includePooja, setIncludePooja] = useState(true);
  const [includeStairs, setIncludeStairs] = useState(true);
  const [includeParking, setIncludeParking] = useState(true);
  const [includeGarden, setIncludeGarden] = useState(false); // respected strictly

  // Requirements text parser box
  const [rawTextRequirements, setRawTextRequirements] = useState(
    `Plot Size: 23 × 39\nFacing: West\nFollow Vastu principles.\nInclude:\n- 1 Living Hall\n- 1 Master Bedroom with Attached Bathroom\n- 2 Bedrooms with Attached Bathrooms\n- 1 Kitchen\n- 1 Dining Area\n- 1 Pooja Room\n- Staircase\n- Car Parking`
  );

  // Blueprint Metadata inputs matching Sample 2pdf.pdf
  const [clientName, setClientName] = useState('AMMU');
  const [constructionType, setConstructionType] = useState('RESIDENTIAL');
  const [drawingTitle, setDrawingTitle] = useState('GROUND FLOOR PLAN');
  const [dwgNo, setDwgNo] = useState('HVD-2026-002');
  const [scaleLabel, setScaleLabel] = useState('1:100');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AI Requirements parser
  const handleParseRequirements = () => {
    const text = rawTextRequirements.toLowerCase();

    const sizeRegex = /(\d+)\s*[\*xX×\s]+\s*(\d+)/;
    const sizeMatch = rawTextRequirements.match(sizeRegex);
    if (sizeMatch) {
      setPlotWidth(Math.max(10, parseInt(sizeMatch[1])));
      setPlotLength(Math.max(10, parseInt(sizeMatch[2])));
    }

    if (text.includes('west')) setPlotFacing('West');
    else if (text.includes('east')) setPlotFacing('East');
    else if (text.includes('north')) setPlotFacing('North');
    else if (text.includes('south')) setPlotFacing('South');

    const bedRegex = /(\d+)\s*(bhk|bedroom)/;
    const bedMatch = text.match(bedRegex);
    if (bedMatch) {
      const count = parseInt(bedMatch[1]);
      if (count === 2 || count === 3) setBedroomCount(count as 2 | 3);
    }

    setIncludePooja(text.includes('pooja') || text.includes('poojai') || text.includes('altar'));
    setIncludeStairs(text.includes('stair') || text.includes('staircase') || text.includes('steps'));
    setIncludeParking(text.includes('park') || text.includes('parking') || text.includes('car'));
    setIncludeGarden(text.includes('garden') || text.includes('garder') || text.includes('thottam'));

    addNotification('success', 'Vastu requirements parsed successfully. Blueprint updated!');
  };

  const generateRoomsList = (W: number, L: number, facing: 'East' | 'West' | 'North' | 'South', bedCount: number): RoomPlan[] => {
    const list: RoomPlan[] = [];
    
    const leftW = Math.round(W * 0.52);
    const rightW = W - leftW;
    
    const rearH = Math.round(L * 0.32);
    const midH = Math.round(L * 0.38);
    const frontH = L - rearH - midH;

    if (facing === 'West') {
      // 1. Kitchen (SE - Top Right)
      list.push({
        name: 'Kitchen',
        x: leftW,
        y: 0,
        w: rightW,
        h: rearH,
        type: 'kitchen',
        doorWall: 'bottom',
        doorPos: 0.25,
        windowWalls: ['top', 'right'],
        vastuNotes: 'SE Agneya Fire Zone - Ideal location.'
      });

      const poojaW = Math.round(leftW * 0.45);
      if (includePooja) {
        list.push({
          name: 'pooja',
          x: 0,
          y: 0,
          w: poojaW,
          h: Math.round(rearH * 0.75),
          type: 'pooja',
          doorWall: 'right',
          doorPos: 0.5,
          windowWalls: ['top'],
          vastuNotes: 'NE Ishanya Spiritual Zone - Perfect.',
          isVastuDoor: true
        });
      }

      list.push({
        name: 'Bed Room',
        x: includePooja ? poojaW : 0,
        y: 0,
        w: includePooja ? (leftW - poojaW) : leftW,
        h: rearH,
        type: 'bedroom',
        doorWall: 'bottom',
        doorPos: 0.5,
        windowWalls: ['top'],
        attachedToilet: {
          name: 'A.Bath',
          x: includePooja ? poojaW : 0,
          y: Math.round(rearH * 0.7),
          w: Math.round(leftW * 0.35),
          h: rearH - Math.round(rearH * 0.7)
        },
        vastuNotes: 'N/NE Zone - Good placement.',
        isVastuDoor: true
      });

      list.push({
        name: 'Hall',
        x: 0,
        y: rearH,
        w: leftW,
        h: midH,
        type: 'living',
        doorWall: 'bottom',
        doorPos: 0.15,
        windowWalls: ['left'],
        vastuNotes: 'North/West - Central welcoming hall.',
        isVastuDoor: true
      });

      list.push({
        name: 'Dining Area',
        x: leftW,
        y: rearH,
        w: rightW,
        h: midH,
        type: 'dining',
        windowWalls: ['right'],
        vastuNotes: 'South/East center - Close to kitchen.'
      });

      const mBedH = frontH;
      list.push({
        name: 'Bed Room',
        x: leftW,
        y: rearH + midH,
        w: rightW,
        h: mBedH,
        type: 'master',
        doorWall: 'top',
        doorPos: 0.2,
        windowWalls: ['right', 'bottom'],
        attachedToilet: {
          name: 'A.Bath',
          x: leftW + Math.round(rightW * 0.6),
          y: rearH + midH,
          w: rightW - Math.round(rightW * 0.6),
          h: Math.round(mBedH * 0.5)
        },
        vastuNotes: 'SW Nairutya Stability Zone - Owner\'s bedroom.',
        isVastuDoor: true
      });

      if (bedCount === 3) {
        list.push({
          name: 'Bed Room',
          x: 0,
          y: rearH + midH,
          w: leftW,
          h: frontH,
          type: 'bedroom',
          doorWall: 'top',
          doorPos: 0.8,
          windowWalls: ['left', 'bottom'],
          attachedToilet: {
            name: 'A.Bath',
            x: 0,
            y: rearH + midH,
            w: Math.round(leftW * 0.35),
            h: Math.round(frontH * 0.45)
          },
          vastuNotes: 'NW Vayu Zone - Excellent guest bedroom.',
          isVastuDoor: true
        });
      } else if (includeParking) {
        // If garden not requested, parking occupies full Northwest front row width
        const parkW = includeGarden ? Math.round(leftW * 0.65) : leftW;
        list.push({
          name: 'Portico',
          x: 0,
          y: rearH + midH,
          w: parkW,
          h: frontH,
          type: 'parking',
          windowWalls: ['bottom'],
          vastuNotes: 'NW Entry - Portico parking area.'
        });
        
        if (includeGarden) {
          list.push({
            name: 'Garden',
            x: parkW,
            y: rearH + midH,
            w: leftW - parkW,
            h: frontH,
            type: 'garden',
            vastuNotes: 'Open green garden area.'
          });
        }
      }

      if (includeStairs) {
        list.push({
          name: 'STAIRCASE',
          x: 0,
          y: rearH + Math.round(midH * 0.55),
          w: Math.round(leftW * 0.45),
          h: midH - Math.round(midH * 0.55),
          type: 'staircase',
          vastuNotes: 'South/West/NW movement - Clockwise staircases.'
        });
      }

    } else {
      list.push({
        name: 'Kitchen',
        x: leftW,
        y: rearH + midH,
        w: rightW,
        h: frontH,
        type: 'kitchen',
        doorWall: 'top',
        doorPos: 0.3,
        windowWalls: ['right', 'bottom'],
        vastuNotes: 'Agneya Fire Corner - Traditional layout.'
      });

      list.push({
        name: 'Bed Room',
        x: 0,
        y: 0,
        w: leftW,
        h: rearH,
        type: 'master',
        doorWall: 'bottom',
        doorPos: 0.7,
        windowWalls: ['top', 'left'],
        attachedToilet: {
          name: 'A.Bath',
          x: 0,
          y: 0,
          w: Math.round(leftW * 0.35),
          h: Math.round(rearH * 0.55)
        },
        vastuNotes: 'SW Nairutya corner - High stability bedroom.',
        isVastuDoor: true
      });

      if (includePooja) {
        list.push({
          name: 'pooja',
          x: leftW,
          y: 0,
          w: rightW,
          h: Math.round(rearH * 0.75),
          type: 'pooja',
          doorWall: 'bottom',
          doorPos: 0.5,
          windowWalls: ['top'],
          vastuNotes: 'NE Ishanya Corner - Spiritual altar.',
          isVastuDoor: true
        });
      }

      list.push({
        name: 'Hall',
        x: 0,
        y: rearH,
        w: W,
        h: midH,
        type: 'living',
        doorWall: 'bottom',
        doorPos: 0.5,
        windowWalls: ['left', 'right'],
        vastuNotes: 'Central Brahmasthan connection - Open.'
      });

      list.push({
        name: 'Bed Room',
        x: 0,
        y: rearH + midH,
        w: leftW,
        h: frontH,
        type: 'bedroom',
        doorWall: 'top',
        doorPos: 0.5,
        windowWalls: ['left', 'bottom'],
        attachedToilet: {
          name: 'A.Bath',
          x: 0,
          y: rearH + midH,
          w: Math.round(leftW * 0.35),
          h: Math.round(frontH * 0.45)
        },
        vastuNotes: 'NW Vayu Corner - Ideal room.',
        isVastuDoor: true
      });
    }

    return list;
  };

  const drawDimensionLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, text: string) => {
    ctx.strokeStyle = '#ef4444'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLen = 5;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowLen * Math.cos(angle + Math.PI/6), y1 + arrowLen * Math.sin(angle + Math.PI/6));
    ctx.lineTo(x1 + arrowLen * Math.cos(angle - Math.PI/6), y1 + arrowLen * Math.sin(angle - Math.PI/6));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI/6), y2 - arrowLen * Math.sin(angle + Math.PI/6));
    ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI/6), y2 - arrowLen * Math.sin(angle - Math.PI/6));
    ctx.closePath();
    ctx.fill();

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, 0, -2);
    ctx.restore();
  };

  // --- PROGRAMMATIC FURNITURE DRAWING HELPERS ---
  const drawBedBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#7d4e57'; 
    ctx.lineWidth = 0.8;
    const bW = rw * 0.58;
    const bH = rh * 0.58;
    const bx = rx + (rw - bW) / 2;
    const by = ry + 6;

    // Bed frame
    ctx.strokeRect(bx, by, bW, bH);
    ctx.strokeRect(bx - 1.5, by - 1.5, bW + 3, bH + 3);
    ctx.strokeRect(bx, by, bW, bH * 0.12); // Headboard
    
    // Pillows
    const pW = bW * 0.38;
    const pH = bH * 0.18;
    ctx.strokeRect(bx + (bW * 0.08), by + (bH * 0.16), pW, pH);
    ctx.strokeRect(bx + (bW * 0.54), by + (bH * 0.16), pW, pH);

    // Blanket creases
    ctx.strokeRect(bx, by + (bH * 0.44), bW, bH * 0.56);
    ctx.beginPath();
    ctx.moveTo(bx, by + (bH * 0.48));
    ctx.bezierCurveTo(bx + (bW * 0.25), by + (bH * 0.44), bx + (bW * 0.75), by + (bH * 0.52), bx + bW, by + (bH * 0.48));
    ctx.stroke();

    // DRAW 2 REALISTIC SIDE TABLES WITH LAMPS ON SIDES OF BED
    const tableW = Math.round(bW * 0.2);
    const tableH = Math.round(bH * 0.2);
    // Left side table
    ctx.strokeRect(bx - tableW - 3, by, tableW, tableH);
    ctx.strokeRect(bx - tableW - 1, by + 2, tableW - 4, tableH - 4);
    // Lamp circle left
    ctx.beginPath();
    ctx.arc(bx - (tableW / 2) - 3, by + (tableH / 2), 2, 0, Math.PI * 2);
    ctx.stroke();

    // Right side table
    ctx.strokeRect(bx + bW + 3, by, tableW, tableH);
    ctx.strokeRect(bx + bW + 5, by + 2, tableW - 4, tableH - 4);
    // Lamp circle right
    ctx.beginPath();
    ctx.arc(bx + bW + (tableW / 2) + 3, by + (tableH / 2), 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawCarBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#475569'; 
    ctx.lineWidth = 1;
    const cW = rw * 0.56;
    const cH = rh * 0.75;
    const cx = rx + (rw - cW) / 2;
    const cy = ry + (rh - cH) / 2;

    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + cW - 10, cy);
    ctx.quadraticCurveTo(cx + cW, cy, cx + cW, cy + 10);
    ctx.lineTo(cx + cW, cy + cH - 10);
    ctx.quadraticCurveTo(cx + cW, cy + cH, cx + cW - 10, cy + cH);
    ctx.lineTo(cx + 10, cy + cH);
    ctx.quadraticCurveTo(cx, cy + cH, cx, cy + cH - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.quadraticCurveTo(cx, cy, cx + 10, cy);
    ctx.stroke();

    ctx.strokeRect(cx + (cW * 0.12), cy + (cH * 0.22), cW * 0.76, cH * 0.12);
    ctx.strokeRect(cx + (cW * 0.12), cy + (cH * 0.68), cW * 0.76, cH * 0.08); // back screen

    ctx.beginPath();
    ctx.moveTo(cx + (cW * 0.25), cy); ctx.lineTo(cx + (cW * 0.25), cy + (cH * 0.22));
    ctx.moveTo(cx + (cW * 0.5), cy); ctx.lineTo(cx + (cW * 0.5), cy + (cH * 0.22));
    ctx.moveTo(cx + (cW * 0.75), cy); ctx.lineTo(cx + (cW * 0.75), cy + (cH * 0.22));
    ctx.stroke();

    ctx.strokeRect(cx + (cW * 0.18), cy + (cH * 0.28), cW * 0.26, cH * 0.14);
    ctx.strokeRect(cx + (cW * 0.56), cy + (cH * 0.28), cW * 0.26, cH * 0.14);
    ctx.beginPath();
    ctx.arc(cx + (cW * 0.31), cy + (cH * 0.26), 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeRect(cx - 3.5, cy + (cH * 0.24), 3.5, cH * 0.06);
    ctx.strokeRect(cx + cW, cy + (cH * 0.24), 3.5, cH * 0.06);

    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 2, cy + (cH * 0.12), 2, cH * 0.16);
    ctx.fillRect(cx + cW, cy + (cH * 0.12), 2, cH * 0.16);
    ctx.fillRect(cx - 2, cy + (cH * 0.68), 2, cH * 0.16);
    ctx.fillRect(cx + cW, cy + (cH * 0.68), 2, cH * 0.16);
  };

  const drawSofaBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#475569'; 
    ctx.lineWidth = 0.8;
    
    const sx = rx + 8;
    const sy = ry + 8;
    const sW = rw * 0.76;
    const sH = rh * 0.66;
    
    ctx.strokeRect(sx, sy, sW, sH * 0.22);
    ctx.strokeRect(sx - 2, sy, 2, sH * 0.6); 
    ctx.strokeRect(sx + sW, sy, 2, sH * 0.6); 

    ctx.strokeRect(sx, sy + (sH * 0.22), sW * 0.33, sH * 0.45);
    ctx.strokeRect(sx + (sW * 0.33), sy + (sH * 0.22), sW * 0.33, sH * 0.45);
    ctx.strokeRect(sx + (sW * 0.66), sy + (sH * 0.22), sW * 0.34, sH * 0.45);

    ctx.strokeRect(sx + (sW * 0.2), sy + (sH * 0.82), sW * 0.6, sH * 0.2);
  };

  const drawDiningBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#475569'; 
    ctx.lineWidth = 0.8;

    const tW = rw * 0.46;
    const tH = rh * 0.46;
    const tx = rx + (rw - tW) / 2;
    const ty = ry + (rh - tH) / 2;
    
    ctx.strokeRect(tx, ty, tW, tH); // rectangular table

    // Draw circular plates on table
    ctx.beginPath();
    ctx.arc(tx + (tW * 0.25), ty + (tH / 2), 2.5, 0, Math.PI * 2);
    ctx.arc(tx + (tW * 0.75), ty + (tH / 2), 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Chairs with rounded backs
    const chairsX = [tx - 5, tx + tW];
    chairsX.forEach((cx) => {
      // chair 1
      ctx.strokeRect(cx, ty + (tH * 0.15), 5, tH * 0.22);
      ctx.beginPath();
      ctx.arc(cx + (cx === tx - 5 ? 0 : 5), ty + (tH * 0.26), 2, -Math.PI/2, Math.PI/2);
      ctx.stroke();

      // chair 2
      ctx.strokeRect(cx, ty + (tH * 0.62), 5, tH * 0.22);
      ctx.beginPath();
      ctx.arc(cx + (cx === tx - 5 ? 0 : 5), ty + (tH * 0.73), 2, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    });
  };

  const drawKitchenBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#475569'; 
    ctx.lineWidth = 0.8;

    const slabW = 10;
    ctx.strokeRect(rx, ry, slabW, rh);
    ctx.strokeRect(rx, ry, rw, slabW);

    const stX = rx + (rw * 0.42);
    const stY = ry + 2.5;
    ctx.strokeRect(stX, stY, 22, 5.5);
    ctx.beginPath();
    ctx.arc(stX + 5.5, stY + 2.75, 1.8, 0, Math.PI * 2);
    ctx.arc(stX + 16.5, stY + 2.75, 1.8, 0, Math.PI * 2);
    ctx.stroke();

    // Kitchen wash sink with detailed water faucet
    ctx.strokeRect(rx + 2, ry + (rh * 0.48), 6.5, 13);
    ctx.beginPath();
    ctx.moveTo(rx + 5, ry + (rh * 0.48));
    ctx.lineTo(rx + 5, ry + (rh * 0.48) + 3); // faucet pipe
    ctx.stroke();
  };

  const drawGardenBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#22c55e'; 
    ctx.lineWidth = 0.8;

    const gap = 16;
    for (let gx = rx + 10; gx < rx + rw - 10; gx += gap) {
      for (let gy = ry + 10; gy < ry + rh - 10; gy += gap) {
        ctx.beginPath();
        ctx.arc(gx, gy, 4, 0, Math.PI * 2);
        ctx.arc(gx + 3, gy + 1, 3.5, 0, Math.PI * 2);
        ctx.arc(gx - 2, gy + 2, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const drawPoojaBlock = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
    ctx.strokeStyle = '#fb8500';
    ctx.lineWidth = 0.8;
    const pW = rw * 0.52;
    const pH = rh * 0.52;
    const px = rx + (rw - pW) / 2;
    const py = ry + (rh - pH) / 2;
    
    ctx.strokeRect(px, py, pW, pH);
    ctx.strokeRect(px - 1.5, py - 1.5, pW + 3, pH + 3); 
    
    ctx.beginPath();
    ctx.arc(px + (pW / 2), py + (pH / 2), 2.5, 0, Math.PI * 2);
    ctx.stroke();
  };

  // REALISTIC TOILET COMMODE BLOCK
  const drawToiletCommode = (ctx: CanvasRenderingContext2D, tx: number, ty: number, tw: number, th: number) => {
    ctx.strokeStyle = '#62899c';
    ctx.lineWidth = 0.8;
    const cx = tx + (tw / 2);
    const cy = ty + (th * 0.65);

    // Flush tank outline
    ctx.strokeRect(cx - 5.5, cy - 8, 11, 3.5);
    
    // Oval commode bowl
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(cx, cy - 1, 4.5, 6, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(cx, cy - 1, 5, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Inner seat line
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(cx, cy - 1, 3, 4.2, 0, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Washbasin corner outline in NE corner of toilet
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 7, ty);
    ctx.lineTo(tx, ty + 7);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tx + 2.5, ty + 2.5, 1.8, 0, Math.PI * 2);
    ctx.stroke();
  };

  // concrete/gray solid hatching for building walls
  const drawThickWalls = (ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number, thick: number = 4) => {
    ctx.strokeStyle = '#11151c'; 
    ctx.lineWidth = 1.0;
    
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.strokeRect(rx + thick, ry + thick, rw - (thick * 2), rh - (thick * 2));
    
    // Fill the inner wall spacing (gray concrete hatch)
    ctx.fillStyle = '#e2e8f0'; 
    ctx.fillRect(rx + 0.5, ry + 0.5, rw - 1, thick - 1); // top
    ctx.fillRect(rx + 0.5, ry + rh - thick + 0.5, rw - 1, thick - 1); // bottom
    ctx.fillRect(rx + 0.5, ry + thick, thick - 1, rh - (thick * 2)); // left
    ctx.fillRect(rx + rw - thick + 0.5, ry + thick, thick - 1, rh - (thick * 2)); // right
  };

  const drawFloorPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(4, 4); // 4x density upscaling for retina crisp vector exports!

    const pad = 35;
    const cw = 500 - (pad * 2); 
    const ch = 460 - (pad * 2);

    const scaleX = cw / plotWidth;
    const scaleY = ch / plotLength;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = pad + (cw - (plotWidth * scale)) / 2;
    const offsetY = pad + (ch - (plotLength * scale)) / 2;

    const scaleFeet = (ft: number) => ft * scale;
    const transX = (ftX: number) => offsetX + scaleFeet(ftX);
    const transY = (ftY: number) => offsetY + scaleFeet(ftY);

    const rooms = generateRoomsList(plotWidth, plotLength, plotFacing, bedroomCount);

    // DRAW PURE WHITE PAPER SHEET BACKGROUND
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, 500, 660);

    // Outer double borders (Royal Blue `#005198`)
    ctx.strokeStyle = '#005198'; 
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, 490, 650);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(8, 8, 484, 644);

    // Plot boundaries (Black outline)
    ctx.strokeStyle = '#11151c'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, scaleFeet(plotWidth), scaleFeet(plotLength));

    // 2. Draw partitions with double wall hatching & detailed furniture
    rooms.forEach((room) => {
      const rx = transX(room.x);
      const ry = transY(room.y);
      const rw = scaleFeet(room.w);
      const rh = scaleFeet(room.h);

      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(rx, ry, rw, rh);

      // --- Draw Concrete Hatched Double Walls ---
      drawThickWalls(ctx, rx, ry, rw, rh, 4);

      // Components
      const innerX = rx + 4;
      const innerY = ry + 4;
      const innerW = rw - 8;
      const innerH = rh - 8;

      if (room.type === 'bedroom' || room.type === 'master') {
        drawBedBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'parking') {
        drawCarBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'living') {
        drawSofaBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'dining') {
        drawDiningBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'kitchen') {
        drawKitchenBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'garden') {
        drawGardenBlock(ctx, innerX, innerY, innerW, innerH);
      } else if (room.type === 'pooja') {
        drawPoojaBlock(ctx, innerX, innerY, innerW, innerH);
      }

      // Toilets with detailed toilet bowl layout commodes
      if (room.attachedToilet) {
        const tx = transX(room.attachedToilet.x);
        const ty = transY(room.attachedToilet.y);
        const tw = scaleFeet(room.attachedToilet.w);
        const th = scaleFeet(room.attachedToilet.h);

        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(tx, ty, tw, th);
        drawThickWalls(ctx, tx, ty, tw, th, 3.5);

        // Commode block drawing
        const toiletX = tx + 3.5;
        const toiletY = ty + 3.5;
        const toiletW = tw - 7;
        const toiletH = th - 7;
        drawToiletCommode(ctx, toiletX, toiletY, toiletW, toiletH);

        // Toilet labels
        ctx.fillStyle = '#11151c';
        ctx.font = 'bold 7.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.attachedToilet.name, tx + (tw / 2), ty + 12);
        ctx.fillStyle = '#ef4444'; 
        ctx.fillText("5'x11'2.5\"", tx + (tw / 2), ty + 20);
      }

      // Staircase steps
      if (room.type === 'staircase') {
        ctx.strokeStyle = '#005198';
        ctx.lineWidth = 0.8;
        const stepsCount = 10;
        const stepW = rw / stepsCount;
        for (let i = 0; i < stepsCount; i++) {
          ctx.strokeRect(rx + (i * stepW), ry, stepW, rh);
        }
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('UP ➔', rx + (rw / 2), ry + (rh / 2));
      }

      // Room labels
      ctx.fillStyle = '#11151c'; 
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelY = room.attachedToilet ? ry + (rh * 0.35) : ry + (rh / 2);
      ctx.fillText(room.name, rx + (rw / 2), labelY);

      // Red sizes text
      ctx.fillStyle = '#ef4444'; 
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`${room.w}'x${room.h}'`, rx + (rw / 2), labelY + 12);

      // --- VASTHU DOOR SYMBOLS: RED CIRCLE + HINGE SWING + VASTHU HALO ---
      if (room.doorWall && room.doorPos !== undefined) {
        const doorSize = scaleFeet(2.8); 
        let dx = rx;
        let dy = ry;

        if (room.doorWall === 'bottom') {
          dx = rx + (rw * room.doorPos);
          dy = ry + rh;
        } else if (room.doorWall === 'top') {
          dx = rx + (rw * room.doorPos);
          dy = ry;
        } else if (room.doorWall === 'left') {
          dx = rx;
          dy = ry + (rh * room.doorPos);
        } else if (room.doorWall === 'right') {
          dx = rx + rw;
          dy = ry + (rh * room.doorPos);
        }

        // Green leaf swing
        ctx.strokeStyle = '#22c55e'; 
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (room.doorWall === 'bottom') {
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + doorSize, dy);
          ctx.arc(dx, dy, doorSize, 0, Math.PI * 0.25);
        } else if (room.doorWall === 'top') {
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + doorSize, dy);
          ctx.arc(dx, dy, doorSize, 0, -Math.PI * 0.25);
        } else if (room.doorWall === 'left') {
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx, dy + doorSize);
          ctx.arc(dx, dy, doorSize, Math.PI * 0.5, Math.PI * 0.75);
        } else if (room.doorWall === 'right') {
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx, dy + doorSize);
          ctx.arc(dx, dy, doorSize, Math.PI * 0.5, Math.PI * 0.25, true);
        }
        ctx.stroke();

        // Hinge circle (red)
        ctx.fillStyle = '#ef4444'; 
        ctx.beginPath();
        ctx.arc(dx, dy, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const doorLabel = room.type === 'kitchen' || room.type === 'master' ? 'D' : 
                          room.type === 'pooja' ? 'D2' : 'MD';
        ctx.fillText(doorLabel, dx, dy);

        // --- DRAW GREEN GLOW HALO AROUND VASTHU COMPLIANT DOORS ---
        if (room.isVastuDoor) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(dx, dy, 11, 0, Math.PI * 2);
          ctx.stroke();
          
          // Tiny label text
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 5.5px sans-serif';
          ctx.fillText('VASTHU OK', dx, dy - 13);
        }
      }

      // Windows
      if (room.windowWalls) {
        ctx.strokeStyle = '#005198'; 
        ctx.lineWidth = 2.5;
        
        room.windowWalls.forEach((wWall) => {
          ctx.beginPath();
          const winSize = Math.min(rw, rh) * 0.4;
          if (wWall === 'top') {
            ctx.moveTo(rx + (rw / 2) - (winSize / 2), ry);
            ctx.lineTo(rx + (rw / 2) + (winSize / 2), ry);
          } else if (wWall === 'bottom') {
            ctx.moveTo(rx + (rw / 2) - (winSize / 2), ry + rh);
            ctx.lineTo(rx + (rw / 2) + (winSize / 2), ry + rh);
          } else if (wWall === 'left') {
            ctx.moveTo(rx, ry + (rh / 2) - (winSize / 2));
            ctx.lineTo(rx, ry + (rh / 2) + (winSize / 2));
          } else if (wWall === 'right') {
            ctx.moveTo(rx + rw, ry + (rh / 2) - (winSize / 2));
            ctx.lineTo(rx + rw, ry + (rh / 2) + (winSize / 2));
          }
          ctx.stroke();
        });
      }
    });

    // 3. Draw Plot dimensions arrowlines
    drawDimensionLine(ctx, offsetX, offsetY - 18, offsetX + scaleFeet(plotWidth), offsetY - 18, `${plotWidth}'0"`);
    drawDimensionLine(ctx, offsetX - 18, offsetY + scaleFeet(plotLength), offsetX - 18, offsetY, `${plotLength}'0"`);

    // 4. North Direction Arrow Indicator
    const navX = 40;
    const navY = 40;
    ctx.strokeStyle = '#005198';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(navX, navY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(navX, navY - 13);
    ctx.lineTo(navX - 4, navY);
    ctx.lineTo(navX + 4, navY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#005198';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillText('N', navX, navY - 16);

    // Label road facing direction
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText(`⚡ ${plotFacing.toUpperCase()} FACING ROAD ACCESS ⚡`, offsetX + (scaleFeet(plotWidth) / 2), offsetY + scaleFeet(plotLength) + 16);

    // --- 5. DRAW BLUEPRINT TITLE BLOCK TABLE (bottom from y = 490 to y = 645 in royal blue) ---
    const tY = 490;
    ctx.strokeStyle = '#005198'; 
    ctx.lineWidth = 2.5;
    ctx.strokeRect(12, tY, 476, 150);
    ctx.strokeRect(14, tY + 2, 472, 146);

    // Draw Column Dividers
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(110, tY + 2); ctx.lineTo(110, tY + 148);
    ctx.moveTo(220, tY + 2); ctx.lineTo(220, tY + 148);
    ctx.moveTo(310, tY + 2); ctx.lineTo(310, tY + 148);
    ctx.moveTo(410, tY + 2); ctx.lineTo(410, tY + 148);
    ctx.stroke();

    // Box 1 details (CONSTRUCTION & CLIENT)
    ctx.fillStyle = '#005198';
    ctx.textAlign = 'left';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillText('CONSTRUCTION:', 18, tY + 15);
    ctx.fillStyle = '#11151c';
    ctx.font = 'normal 8px sans-serif';
    ctx.fillText(constructionType.toUpperCase(), 18, tY + 30);

    ctx.fillStyle = '#005198';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillText('CLIENT:', 18, tY + 80);
    ctx.fillStyle = '#11151c';
    ctx.font = 'normal 8.5px sans-serif';
    ctx.fillText(clientName.toUpperCase(), 18, tY + 95);

    // Box 2 details (JOINERIES DETAILS Table)
    ctx.fillStyle = '#005198';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOINERIES DETAILS', 165, tY + 15);
    
    ctx.fillStyle = '#11151c';
    ctx.font = 'normal 7.5px sans-serif';
    ctx.textAlign = 'left';
    const jData = [
      'MD   Main Door     3\'6" x 7\'0"',
      'D     Door              3\'0" x 7\'0"',
      'D2   Door              2\'6" x 7\'0"',
      'W1   Window         5\'0" x 4\'0"',
      'W2   Window         4\'0" x 4\'0"',
      'V     Ventilator      2\'0" x 2\'0"'
    ];
    jData.forEach((row, i) => {
      ctx.fillText(row, 115, tY + 32 + (i * 18));
    });

    // Box 3 details (TOTAL AREA & COMPASS)
    ctx.fillStyle = '#005198';
    ctx.textAlign = 'center';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillText('TOTAL AREA', 265, tY + 15);
    ctx.font = 'normal 8px sans-serif';
    ctx.fillText('Buildup Area:', 265, tY + 35);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ef4444'; 
    ctx.fillText(`${(plotWidth * plotLength * 0.85).toFixed(2)} Sqft`, 265, tY + 50);

    // Compass rose
    const cX = 265;
    const cY = tY + 100;
    ctx.strokeStyle = '#005198';
    ctx.beginPath();
    ctx.arc(cX, cY, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#005198';
    ctx.fillText('N', cX, cY - 24);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cX, cY - 18);
    ctx.lineTo(cX - 4, cY);
    ctx.lineTo(cX + 4, cY);
    ctx.closePath();
    ctx.fill();

    // Box 4 details (DRAWING TITLE & DWG INFO)
    ctx.fillStyle = '#005198';
    ctx.textAlign = 'left';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('DRAWING TITLE:', 315, tY + 15);
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillStyle = '#005198';
    ctx.fillText(drawingTitle.toUpperCase(), 315, tY + 30);

    ctx.fillStyle = '#11151c';
    ctx.font = 'bold 8px sans-serif';
    const cDate = new Date().toLocaleDateString();
    ctx.fillText(`DATE:  ${cDate}`, 315, tY + 70);
    ctx.fillText(`SCALE: ${scaleLabel}`, 315, tY + 90);
    ctx.fillText(`DWG NO: ${dwgNo.toUpperCase()}`, 315, tY + 110);

    // Box 5 details (SIGNATURES BLOCK)
    ctx.fillStyle = '#005198';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('CHECKED BY:', 415, tY + 15);
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillStyle = '#005198';
    ctx.fillText('ENGINEER', 415, tY + 30);

    ctx.fillStyle = '#005198';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('APPROVED BY:', 415, tY + 80);
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillStyle = '#005198';
    ctx.fillText('CHIEF ENG.', 415, tY + 95);

    ctx.restore();
  };

  useEffect(() => {
    if (activeTab === 'floorplan') {
      drawFloorPlan();
    }
  }, [
    activeTab, 
    plotWidth, 
    plotLength, 
    plotFacing, 
    bedroomCount, 
    includePooja, 
    includeStairs, 
    includeParking,
    includeGarden,
    clientName,
    constructionType,
    drawingTitle,
    dwgNo,
    scaleLabel
  ]);

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Himalaya_CAD_Plan_${clientName}_${plotWidth}x${plotLength}.png`;
      a.click();
      addNotification('success', 'Blueprint image (PNG) exported successfully.');
    }
  };

  const handleExportPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use PNG (lossless format) at A4 scaling for absolute laser-sharp output quality
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [540, 700]
    });

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 540, 700, 'F');
    // Draw high-resolution png to prevent blurriness/pixelation
    pdf.addImage(imgData, 'PNG', 20, 20, 500, 660);

    pdf.save(`Himalaya_CAD_Blueprint_${clientName}_${plotWidth}x${plotLength}.pdf`);
    addNotification('success', 'Blueprint document (PDF) exported successfully.');
  };

  const handleExportDXF = () => {
    const rooms = generateRoomsList(plotWidth, plotLength, plotFacing, bedroomCount);
    const dxfLines: string[] = [];

    dxfLines.push('0', 'SECTION', '2', 'ENTITIES');

    const pushLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
      dxfLines.push(
        '0', 'LINE',
        '8', layer,
        '10', x1.toFixed(3),
        '20', y1.toFixed(3),
        '30', '0.0',
        '11', x2.toFixed(3),
        '21', y2.toFixed(3),
        '31', '0.0'
      );
    };

    const pushText = (txt: string, x: number, y: number, h: number, layer: string) => {
      dxfLines.push(
        '0', 'TEXT',
        '8', layer,
        '10', x.toFixed(3),
        '20', y.toFixed(3),
        '30', '0.0',
        '40', h.toFixed(3),
        '1', txt
      );
    };

    pushLine(0, 0, plotWidth, 0, 'PLOT_BOUNDARY');
    pushLine(plotWidth, 0, plotWidth, plotLength, 'PLOT_BOUNDARY');
    pushLine(plotWidth, plotLength, 0, plotLength, 'PLOT_BOUNDARY');
    pushLine(0, plotLength, 0, 0, 'PLOT_BOUNDARY');

    rooms.forEach((room) => {
      pushLine(room.x, room.y, room.x + room.w, room.y, 'WALLS');
      pushLine(room.x + room.w, room.y, room.x + room.w, room.y + room.h, 'WALLS');
      pushLine(room.x + room.w, room.y + room.h, room.x, room.y + room.h, 'WALLS');
      pushLine(room.x, room.y + room.h, room.x, room.y, 'WALLS');

      pushText(room.name, room.x + (room.w / 2), room.y + (room.h / 2), 1.1, 'ROOM_NAMES');
      pushText(`${room.w}' x ${room.h}'`, room.x + (room.w / 2), room.y + (room.h / 2) - 1.2, 0.75, 'ROOM_DIMENSIONS');

      if (room.attachedToilet) {
        const t = room.attachedToilet;
        pushLine(t.x, t.y, t.x + t.w, t.y, 'TOILETS');
        pushLine(t.x + t.w, t.y, t.x + t.w, t.y + t.h, 'TOILETS');
        pushLine(t.x + t.w, t.y + t.h, t.x, t.y + t.h, 'TOILETS');
        pushLine(t.x, t.y + t.h, t.x, t.y, 'TOILETS');
        pushText(t.name, t.x + (t.w / 2), t.y + (t.h / 2), 0.65, 'TOILET_LABELS');
      }
    });

    dxfLines.push('0', 'ENDSEC', '0', 'EOF');

    const dxfString = dxfLines.join('\n');

    const blob = new Blob([dStringResolve(dxfString)], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Himalaya_CAD_${clientName}_${plotWidth}x${plotLength}.dxf`;
    a.click();

    addNotification('success', 'CAD drawing (DXF) file downloaded successfully. Ready to open in AutoCAD!');
  };

  const dStringResolve = (val: string) => {
    return val.replace(/\r\n/g, '\n').trim();
  };

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
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'floorplan'
                ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layout className="h-4 w-4" />
            2D Floor Plan CAD Suite
          </button>
        </div>
      </div>

      {/* --- COMPASS TAB --- */}
      {activeTab === 'compass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between min-h-[500px]">
            
            <div className="w-full text-center mb-4">
              <span className="text-[10px] font-bold text-[#fb8500] uppercase tracking-wider bg-[#fb8500]/10 px-2.5 py-1 rounded-full">
                {isTracking ? 'Active Orientation Tracking' : 'Manual Rotation Mode'}
              </span>
              <h3 className="text-lg font-extrabold text-slate-955 dark:text-white mt-2">
                Facing Sector: <span className="text-[#fb8500]">{selectedDirection} ({VASTHU_RULES[selectedDirection].best[0]} Zone)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Heading Angle: {angle}°
              </p>
            </div>

            <div className="relative w-72 h-72 my-5 flex items-center justify-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <ArrowUp className="h-6 w-6 text-[#fb8500] animate-bounce" />
                <span className="text-[9px] font-extrabold text-white bg-[#fb8500] px-1.5 py-0.5 rounded uppercase tracking-wider">Facing</span>
              </div>

              <div 
                className="w-64 h-64 rounded-full bg-slate-950 border-4 border-slate-900 shadow-xl relative transition-transform duration-200 flex items-center justify-center select-none"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <div className="absolute inset-2 rounded-full border border-slate-800/60 flex items-center justify-center">
                  <span className="absolute top-2.5 text-base font-black text-rose-500">N</span>
                  <span className="absolute top-4.5 right-4.5 text-xs font-bold text-slate-400 rotate-45">NE</span>
                  
                  <span className="absolute right-3.5 text-base font-black text-[#ffb703]">E</span>
                  <span className="absolute bottom-5 right-5 text-xs font-bold text-slate-400 rotate-135">SE</span>
                  
                  <span className="absolute bottom-2.5 text-base font-black text-slate-300">S</span>
                  <span className="absolute bottom-5 left-5 text-xs font-bold text-slate-400 rotate-225">SW</span>
                  
                  <span className="absolute left-3.5 text-base font-black text-slate-300">W</span>
                  <span className="absolute top-4.5 left-4.5 text-xs font-bold text-slate-400 rotate-315">NW</span>

                  <div className="w-full h-[1px] bg-slate-800/40 absolute top-1/2 left-0 -translate-y-1/2" />
                  <div className="h-full w-[1px] bg-slate-800/40 absolute left-1/2 top-0 -translate-x-1/2" />
                  
                  <div className="h-14 w-14 rounded-full bg-slate-900 border-2 border-[#219ebc]/40 flex items-center justify-center shadow-inner">
                    <Compass className="h-6 w-6 text-[#ffb703] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

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

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#219ebc] dark:bg-slate-800 uppercase tracking-wider">
                  Zone rules
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                  Guideline Properties: Sector {selectedDirection}
                </h3>
              </div>

              <p className="text-xs text-slate-655 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50">
                {VASTHU_RULES[selectedDirection].advice}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Best Rooms to Place
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {VASTHU_RULES[selectedDirection].best.map((r, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 px-2 py-1 rounded-lg">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {VASTHU_RULES[selectedDirection].acceptable.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-[#ffb703] shrink-0" />
                      Acceptable Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {VASTHU_RULES[selectedDirection].acceptable.map((r, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-amber-50 text-amber-850 dark:bg-amber-950/20 dark:text-[#ffb703] px-2 py-1 rounded-lg">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    Avoid Placing (Strictly)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {VASTHU_RULES[selectedDirection].avoid.map((r, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-rose-50 text-rose-705 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-1 rounded-lg">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PLANNER TAB --- */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Grid (3x3 Matrix)
              </h2>
              <p className="text-xs text-slate-500">Click on any directional cell to assign and place home rooms.</p>
            </div>

            <div className="grid grid-cols-3 gap-3.5 max-w-sm mx-auto aspect-square">
              {Object.entries(plannerGrid).map(([dir, room]) => {
                const isSelected = activeCell === dir;
                let cellClass = 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200';
                
                if (room !== 'Empty Space') {
                  const rule = VASTHU_RULES[dir as Direction];
                  if (dir === 'C') {
                    cellClass = room === 'Living Room' || room === 'Entrance' 
                      ? 'border-emerald-200 bg-emerald-50/30 text-emerald-805' 
                      : 'border-rose-250 bg-rose-50/20 text-rose-805';
                  } else if (rule) {
                    if (rule.best.includes(room)) {
                      cellClass = 'border-emerald-300 bg-emerald-50 text-emerald-850 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-450';
                    } else if (rule.acceptable.includes(room)) {
                      cellClass = 'border-amber-300 bg-amber-50 text-amber-850 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-455';
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

            {activeCell && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Place room in sector: <span className="text-[#fb8500] font-extrabold">{activeCell}</span>
                  </h4>
                  <button onClick={() => setActiveCell(null)} className="text-xs text-slate-400 hover:text-slate-655">Close</button>
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

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <button
                onClick={handleResetPlanner}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Layout Grid
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
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
                
                <div className="inline-block">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    placedCount === 0 ? 'bg-slate-105 text-slate-500' :
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
                        item.status === 'best' ? 'border-emerald-100 bg-emerald-50/20 text-emerald-808 dark:border-emerald-950/40 dark:bg-emerald-950/5' :
                        item.status === 'acceptable' ? 'border-amber-100 bg-amber-50/20 text-amber-808 dark:border-amber-955/40 dark:bg-amber-955/5' :
                        'border-rose-100 bg-rose-50/20 text-rose-808 dark:border-rose-955/40 dark:bg-rose-955/5'
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
                    <HelpCircle className="h-10 w-10 text-slate-350 stroke-1 mb-2" />
                    <p className="text-xs">Select directions on the grid board to analyze your plans.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2D FLOOR PLAN TAB --- */}
      {activeTab === 'floorplan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-250">
          
          {/* Controls Input Form (Left) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* AI Text Requirement Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#fb8500]" />
                  AI Plan Parser
                </h3>
                <span className="text-[9px] text-[#fb8500] bg-[#fb8500]/10 px-2 py-0.5 rounded font-bold uppercase">Auto-Draft</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Paste client raw requirements (e.g. plot size, facing, rooms) to auto-configure controls instantly.
              </p>
              <textarea
                value={rawTextRequirements}
                onChange={(e) => setRawTextRequirements(e.target.value)}
                placeholder="Paste plan requirements here..."
                rows={5}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                onClick={handleParseRequirements}
                className="w-full bg-[#fb8500] hover:bg-[#e07500] text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#fb8500]/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                Parse & Generate Plan
              </button>
            </div>

            {/* Plot settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="h-4.5 w-4.5 text-[#fb8500]" />
                  Plot Parameters
                </h3>
              </div>

              {/* Plot Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-655 uppercase">Width (Feet)</label>
                  <input
                    type="number"
                    value={plotWidth}
                    onChange={(e) => setPlotWidth(Math.max(10, parseInt(e.target.value) || 23))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-655 uppercase">Length (Feet)</label>
                  <input
                    type="number"
                    value={plotLength}
                    onChange={(e) => setPlotLength(Math.max(10, parseInt(e.target.value) || 39))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Road Facing */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-655 uppercase">Road Facing Direction</label>
                <select
                  value={plotFacing}
                  onChange={(e: any) => setPlotFacing(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="West">West (Road on West)</option>
                  <option value="East">East (Road on East)</option>
                  <option value="North">North (Road on North)</option>
                  <option value="South">South (Road on South)</option>
                </select>
              </div>

              {/* Bedroom count */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-655 uppercase">Bedrooms</label>
                <div className="flex gap-2">
                  {[2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setBedroomCount(num as 2 | 3)}
                      className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bedroomCount === num
                          ? 'bg-[#fb8500] border-[#fb8500] text-white'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-855 dark:text-slate-300'
                      }`}
                    >
                      {num} BHK Layout
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist additions */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <label className="text-[11px] font-bold text-slate-655 uppercase block">Include Spaces</label>
                
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePooja}
                    onChange={(e) => setIncludePooja(e.target.checked)}
                    className="rounded border-slate-300 accent-[#fb8500] h-4 w-4"
                  />
                  <span>Pooja Room (NE Ishanya)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStairs}
                    onChange={(e) => setIncludeStairs(e.target.checked)}
                    className="rounded border-slate-300 accent-[#fb8500] h-4 w-4"
                  />
                  <span>Staircase (Internal/External)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGarden}
                    onChange={(e) => setIncludeGarden(e.target.checked)}
                    className="rounded border-slate-300 accent-[#fb8500] h-4 w-4"
                  />
                  <span>Garden/Landscaping (SE/NW)</span>
                </label>

                {bedroomCount === 2 && (
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeParking}
                      onChange={(e) => setIncludeParking(e.target.checked)}
                      className="rounded border-slate-300 accent-[#fb8500] h-4 w-4"
                    />
                    <span>Car Parking / Portico</span>
                  </label>
                )}
              </div>
            </div>

            {/* Blueprint Title Block Metadata Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-[#fb8500]" />
                  Blueprint Details
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Construction Type</label>
                  <input
                    type="text"
                    value={constructionType}
                    onChange={(e) => setConstructionType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Drawing Title</label>
                  <input
                    type="text"
                    value={drawingTitle}
                    onChange={(e) => setDrawingTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Dwg No</label>
                    <input
                      type="text"
                      value={dwgNo}
                      onChange={(e) => setDwgNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Scale</label>
                    <input
                      type="text"
                      value={scaleLabel}
                      onChange={(e) => setScaleLabel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Plan Canvas drawing (Right) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between min-h-[500px]">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800/40 mb-4 gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-955 dark:text-white flex items-center gap-1.5">
                  <Maximize className="h-4.5 w-4.5 text-[#fb8500]" />
                  Paper Print blueprint View
                </h3>
                <p className="text-xs text-slate-500">AutoCAD paper plot style with double-ruled royal blue border blocks & red sizes.</p>
              </div>

              {/* Multiple Exporters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1 bg-[#fb8500] hover:bg-[#e07500] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Export to PDF"
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </button>
                
                <button
                  onClick={handleExportDXF}
                  className="flex items-center gap-1 bg-[#219ebc] hover:bg-[#1a7f98] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Download DXF file for AutoCAD"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  CAD (DXF)
                </button>

                <button
                  onClick={handleExportPNG}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Save as PNG image"
                >
                  <Download className="h-3.5 w-3.5" />
                  IMG
                </button>
              </div>
            </div>

            {/* Canvas Wrapper (High resolution upscaled canvas) */}
            <div className="border border-slate-200 dark:border-slate-800 bg-[#ffffff] rounded-2xl p-2.5 flex justify-center items-center shadow-inner relative max-w-full overflow-auto">
              <canvas
                ref={canvasRef}
                width={2000} // 4x of 500 for maximum pixel clarity on zoom!
                height={2640} // 4x of 660
                style={{ width: '500px', height: '660px' }} // locked aspect ratio
                className="max-w-full block rounded-xl border border-slate-250 bg-white"
              />
            </div>

            {/* Vastu checklist cards */}
            <div className="w-full pt-6 space-y-3.5 border-t border-slate-100 dark:border-slate-800/40 mt-5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Vastu Placement Compliance Feedback:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {generateRoomsList(plotWidth, plotLength, plotFacing, bedroomCount).map((room, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-855 dark:text-white">{room.name}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{room.vastuNotes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
