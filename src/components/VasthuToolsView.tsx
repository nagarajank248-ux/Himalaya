'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Layout,
  Download,
  Building2
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

// --- 2D Plan Data Structures ---
interface AttachedToilet {
  name: string;
  x: number; // feet
  y: number; // feet
  w: number; // feet
  h: number; // feet
}

interface RoomPlan {
  name: string;
  x: number; // feet
  y: number; // feet
  w: number; // feet
  h: number; // feet
  type: string;
  doorWall?: 'top' | 'bottom' | 'left' | 'right';
  doorPos?: number; // ratio 0 to 1
  windowWalls?: ('top' | 'bottom' | 'left' | 'right')[];
  attachedToilet?: AttachedToilet;
  vastuNotes: string;
}

export const VasthuToolsView: React.FC = () => {
  const { addNotification } = useCRM();
  const [activeTab, setActiveTab] = useState<'compass' | 'planner' | 'floorplan'>('compass');
  
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

  // Calculate Vasthu Score
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
          details.push({ direction: dir, room, status: 'acceptable', points: 0, note: 'Brahmasthan (Center) is open/living hall. Acceptable.' });
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

  // --- 2D Floor Plan Generator States ---
  const [plotWidth, setPlotWidth] = useState(23);
  const [plotLength, setPlotLength] = useState(39);
  const [plotFacing, setPlotFacing] = useState<'East' | 'West' | 'North' | 'South'>('West');
  const [bedroomCount, setBedroomCount] = useState<2 | 3>(3);
  const [includePooja, setIncludePooja] = useState(true);
  const [includeStairs, setIncludeStairs] = useState(true);
  const [includeParking, setIncludeParking] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate Vastu Compliant 2D Room Coordinates
  const generateRoomsList = (W: number, L: number, facing: 'East' | 'West' | 'North' | 'South', bedCount: number): RoomPlan[] => {
    const list: RoomPlan[] = [];
    
    // Column and Row spacing calculations
    const leftW = Math.round(W * 0.52);
    const rightW = W - leftW;
    
    const rearH = Math.round(L * 0.32);
    const midH = Math.round(L * 0.38);
    const frontH = L - rearH - midH;

    if (facing === 'West') {
      // West road is at bottom (y = L). East is rear (y = 0).
      // Left side is North (x = 0). Right side is South (x = W).
      // NE (Top-Left): Puja Room / Bedroom
      // SE (Top-Right): Kitchen
      // SW (Bottom-Right): Master Bedroom
      // NW (Bottom-Left): Entrance / Parking / Stairs

      // 1. Kitchen (SE - Top Right)
      list.push({
        name: 'KITCHEN',
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

      // 2. Pooja Room & study (NE - Top Left)
      const poojaW = Math.round(leftW * 0.45);
      if (includePooja) {
        list.push({
          name: 'POOJA',
          x: 0,
          y: 0,
          w: poojaW,
          h: Math.round(rearH * 0.75),
          type: 'pooja',
          doorWall: 'right',
          doorPos: 0.5,
          windowWalls: ['top'],
          vastuNotes: 'NE Ishanya Spiritual Zone - Perfect.'
        });
      }

      // 3. Bedroom 2 (Northeast quadrant - Center rear)
      list.push({
        name: 'BEDROOM 2',
        x: includePooja ? poojaW : 0,
        y: 0,
        w: includePooja ? (leftW - poojaW) : leftW,
        h: rearH,
        type: 'bedroom',
        doorWall: 'bottom',
        doorPos: 0.5,
        windowWalls: ['top'],
        attachedToilet: {
          name: 'A.TOILET',
          x: includePooja ? poojaW : 0,
          y: Math.round(rearH * 0.7),
          w: Math.round(leftW * 0.35),
          h: rearH - Math.round(rearH * 0.7)
        },
        vastuNotes: 'N/NE Zone - Good for children/guest room.'
      });

      // 4. Living Hall (West/Northwest - Center Left)
      list.push({
        name: 'LIVING HALL',
        x: 0,
        y: rearH,
        w: leftW,
        h: midH,
        type: 'living',
        doorWall: 'bottom',
        doorPos: 0.15, // Main entrance door opens from parking
        windowWalls: ['left'],
        vastuNotes: 'North/West - Central welcoming hall.'
      });

      // 5. Dining Area (Center South - Center Right)
      list.push({
        name: 'DINING AREA',
        x: leftW,
        y: rearH,
        w: rightW,
        h: midH,
        type: 'dining',
        windowWalls: ['right'],
        vastuNotes: 'South/East center - Close to kitchen.'
      });

      // 6. Master Bedroom (SW - Bottom Right)
      const mBedH = frontH;
      list.push({
        name: 'MASTER BEDROOM',
        x: leftW,
        y: rearH + midH,
        w: rightW,
        h: mBedH,
        type: 'master',
        doorWall: 'top',
        doorPos: 0.2,
        windowWalls: ['right', 'bottom'],
        attachedToilet: {
          name: 'A.TOILET',
          x: leftW + Math.round(rightW * 0.6),
          y: rearH + midH,
          w: rightW - Math.round(rightW * 0.6),
          h: Math.round(mBedH * 0.5)
        },
        vastuNotes: 'SW Nairutya Stability Zone - Owner\'s bedroom.'
      });

      // 7. Parking / Bedroom 3 (NW - Bottom Left)
      if (bedCount === 3) {
        list.push({
          name: 'BEDROOM 3',
          x: 0,
          y: rearH + midH,
          w: leftW,
          h: frontH,
          type: 'bedroom',
          doorWall: 'top',
          doorPos: 0.8,
          windowWalls: ['left', 'bottom'],
          attachedToilet: {
            name: 'A.TOILET',
            x: 0,
            y: rearH + midH,
            w: Math.round(leftW * 0.35),
            h: Math.round(frontH * 0.45)
          },
          vastuNotes: 'NW Vayu Zone - Excellent guest/children bedroom.'
        });
      } else if (includeParking) {
        list.push({
          name: 'CAR PARKING / PORTICO',
          x: 0,
          y: rearH + midH,
          w: leftW,
          h: frontH,
          type: 'parking',
          windowWalls: ['bottom'],
          vastuNotes: 'NW Road facing entry - Perfect parking gate.'
        });
      }

      // 8. Staircase (West center - NW sector)
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
      // General default layout for East/North/South facing
      // 1. Kitchen (SE - Bottom Right)
      list.push({
        name: 'KITCHEN',
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

      // 2. Master Bed (SW - Top Left)
      list.push({
        name: 'MASTER BEDROOM',
        x: 0,
        y: 0,
        w: leftW,
        h: rearH,
        type: 'master',
        doorWall: 'bottom',
        doorPos: 0.7,
        windowWalls: ['top', 'left'],
        attachedToilet: {
          name: 'A.TOILET',
          x: 0,
          y: 0,
          w: Math.round(leftW * 0.35),
          h: Math.round(rearH * 0.55)
        },
        vastuNotes: 'SW Nairutya corner - High stability bedroom.'
      });

      // 3. Pooja (NE - Bottom Left or Top Right depending on entry)
      if (includePooja) {
        list.push({
          name: 'POOJA',
          x: leftW,
          y: 0,
          w: rightW,
          h: Math.round(rearH * 0.75),
          type: 'pooja',
          doorWall: 'bottom',
          doorPos: 0.5,
          windowWalls: ['top'],
          vastuNotes: 'NE Ishanya Corner - Spiritual altar.'
        });
      }

      // 4. Living Hall (Center Center)
      list.push({
        name: 'LIVING HALL',
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

      // 5. Bedroom 2 (NW - Bottom Left)
      list.push({
        name: 'BEDROOM 2',
        x: 0,
        y: rearH + midH,
        w: leftW,
        h: frontH,
        type: 'bedroom',
        doorWall: 'top',
        doorPos: 0.5,
        windowWalls: ['left', 'bottom'],
        attachedToilet: {
          name: 'A.TOILET',
          x: 0,
          y: rearH + midH,
          w: Math.round(leftW * 0.35),
          h: Math.round(frontH * 0.45)
        },
        vastuNotes: 'NW Vayu Corner - Ideal room.'
      });
    }

    return list;
  };

  // Render 2D Floor Plan Canvas Drawing
  const drawFloorPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Padding settings
    const pad = 40;
    const cw = canvas.width - (pad * 2);
    const ch = canvas.height - (pad * 2);

    // Scaling calculations
    const scaleX = cw / plotWidth;
    const scaleY = ch / plotLength;
    const scale = Math.min(scaleX, scaleY);

    // Center offsets
    const offsetX = pad + (cw - (plotWidth * scale)) / 2;
    const offsetY = pad + (ch - (plotLength * scale)) / 2;

    const scaleFeet = (ft: number) => ft * scale;
    const transX = (ftX: number) => offsetX + scaleFeet(ftX);
    const transY = (ftY: number) => offsetY + scaleFeet(ftY);

    // Generate room list
    const rooms = generateRoomsList(plotWidth, plotLength, plotFacing, bedroomCount);

    // 1. Draw outer boundary / Road
    ctx.strokeStyle = '#364156'; // Charcoal Blue
    ctx.lineWidth = 5;
    ctx.strokeRect(offsetX, offsetY, scaleFeet(plotWidth), scaleFeet(plotLength));

    // Fill plot background lightly
    ctx.fillStyle = '#fffcf7'; // Soft cream
    ctx.fillRect(offsetX, offsetY, scaleFeet(plotWidth), scaleFeet(plotLength));

    // 2. Draw room partitions
    rooms.forEach((room) => {
      const rx = transX(room.x);
      const ry = transY(room.y);
      const rw = scaleFeet(room.w);
      const rh = scaleFeet(room.h);

      // Color fills according to room type
      if (room.type === 'kitchen') ctx.fillStyle = '#fef3c7'; // agni flame tint
      else if (room.type === 'pooja') ctx.fillStyle = '#ffedd5'; // spiritual orange tint
      else if (room.type === 'master') ctx.fillStyle = '#ecfdf5'; // stable green tint
      else if (room.type === 'living') ctx.fillStyle = '#f0f9ff'; // open air tint
      else if (room.type === 'parking') ctx.fillStyle = '#f3f4f6'; // parking gray
      else if (room.type === 'staircase') ctx.fillStyle = '#fff7ed';
      else ctx.fillStyle = '#fffbf5'; // standard room

      ctx.fillRect(rx, ry, rw, rh);

      // Draw Room Walls
      ctx.strokeStyle = '#219ebc'; // Blue Green walls
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx, ry, rw, rh);

      // Draw attached toilets
      if (room.attachedToilet) {
        const tx = transX(room.attachedToilet.x);
        const ty = transY(room.attachedToilet.y);
        const tw = scaleFeet(room.attachedToilet.w);
        const th = scaleFeet(room.attachedToilet.h);

        ctx.fillStyle = '#f5f3ff'; // violet toilet tint
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeRect(tx, ty, tw, th);

        // Toilet labels
        ctx.fillStyle = '#11151c';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.attachedToilet.name, tx + (tw / 2), ty + (th / 2));
      }

      // Draw staircase steps
      if (room.type === 'staircase') {
        ctx.strokeStyle = '#62899c';
        ctx.lineWidth = 1;
        const stepsCount = 10;
        const stepW = rw / stepsCount;
        for (let i = 0; i < stepsCount; i++) {
          ctx.strokeRect(rx + (i * stepW), ry, stepW, rh);
        }
        // Draw directional text
        ctx.fillStyle = '#fb8500';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('UP ➔', rx + (rw / 2), ry + (rh / 2));
      }

      // Room labels & Dimensions
      ctx.fillStyle = '#023047'; // Deep space blue labels
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Label text
      const labelY = room.attachedToilet ? ry + (rh * 0.35) : ry + (rh / 2);
      ctx.fillText(room.name, rx + (rw / 2), labelY);

      // Dimension text (e.g. 11'0" x 13'0")
      ctx.fillStyle = '#798390'; // Charcoal text
      ctx.font = 'normal 9px sans-serif';
      ctx.fillText(`${room.w}'0" x ${room.h}'0"`, rx + (rw / 2), labelY + 14);

      // Draw Doors swing arc
      if (room.doorWall && room.doorPos !== undefined) {
        ctx.strokeStyle = '#fb8500'; // Princeton Orange doors
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const doorSize = scaleFeet(3); // 3 feet door width
        let dx = rx;
        let dy = ry;

        if (room.doorWall === 'bottom') {
          dx = rx + (rw * room.doorPos);
          dy = ry + rh;
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + doorSize, dy);
          ctx.arc(dx, dy, doorSize, 0, Math.PI * 0.25);
        } else if (room.doorWall === 'top') {
          dx = rx + (rw * room.doorPos);
          dy = ry;
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + doorSize, dy);
          ctx.arc(dx, dy, doorSize, 0, -Math.PI * 0.25);
        } else if (room.doorWall === 'left') {
          dx = rx;
          dy = ry + (rh * room.doorPos);
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx, dy + doorSize);
          ctx.arc(dx, dy, doorSize, Math.PI * 0.5, Math.PI * 0.75);
        } else if (room.doorWall === 'right') {
          dx = rx + rw;
          dy = ry + (rh * room.doorPos);
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx, dy + doorSize);
          ctx.arc(dx, dy, doorSize, Math.PI * 0.5, Math.PI * 0.25, true);
        }
        ctx.stroke();
      }

      // Draw Windows indicator
      if (room.windowWalls) {
        ctx.strokeStyle = '#8ecae6'; // Sky Blue Light windows
        ctx.lineWidth = 3.5;
        
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

    // 3. Draw Plot dimension lines on margins
    ctx.fillStyle = '#023047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    
    // Top dimension tag
    ctx.fillText(`${plotWidth}'0"`, offsetX + (scaleFeet(plotWidth) / 2), offsetY - 12);
    // Left dimension tag
    ctx.save();
    ctx.translate(offsetX - 15, offsetY + (scaleFeet(plotLength) / 2));
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${plotLength}'0"`, 0, 0);
    ctx.restore();

    // 4. Draw North Arrow in bottom left
    const navX = offsetX + scaleFeet(plotWidth) - 35;
    const navY = offsetY + scaleFeet(plotLength) - 35;
    ctx.strokeStyle = '#364156';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(navX, navY, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#fb8500';
    ctx.beginPath();
    ctx.moveTo(navX, navY - 18); // North pointer
    ctx.lineTo(navX - 5, navY);
    ctx.lineTo(navX + 5, navY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#023047';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('N', navX, navY - 22);

    // Label road facing direction
    ctx.fillStyle = '#fb8500';
    ctx.font = 'bold 10px sans-serif';
    if (plotFacing === 'West') {
      ctx.fillText('⚡ MAIN ROAD ACCESS (WEST FACING) ⚡', offsetX + (scaleFeet(plotWidth) / 2), offsetY + scaleFeet(plotLength) + 22);
    } else {
      ctx.fillText(`⚡ ROAD ACCESS (${plotFacing.toUpperCase()} FACING) ⚡`, offsetX + (scaleFeet(plotWidth) / 2), offsetY + scaleFeet(plotLength) + 22);
    }
  };

  // Trigger draw on tab active or parameters change
  useEffect(() => {
    if (activeTab === 'floorplan') {
      drawFloorPlan();
    }
  }, [activeTab, plotWidth, plotLength, plotFacing, bedroomCount, includePooja, includeStairs, includeParking]);

  // Export Plan JPG
  const handleDownloadPlan = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL('image/jpeg');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Himalaya_Vasthu_2D_Plan_${plotWidth}x${plotLength}_${plotFacing}.jpg`;
      a.click();
      addNotification('success', '2D Floor Plan downloaded successfully.');
    }
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
            2D Floor Plan Generator
          </button>
        </div>
      </div>

      {/* --- COMPASS TAB --- */}
      {activeTab === 'compass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Visual Compass Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between min-h-[500px]">
            
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

          {/* Guidelines info side panel */}
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

              <p className="text-xs text-slate-650 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50">
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
                      <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-1 rounded-lg">
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
                        <span key={i} className="text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-[#ffb703] px-2 py-1 rounded-lg">
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
                      <span key={i} className="text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-1 rounded-lg">
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
                  <button onClick={() => setActiveCell(null)} className="text-xs text-slate-400 hover:text-slate-650">Close</button>
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
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                        item.status === 'acceptable' ? 'border-amber-100 bg-amber-50/20 text-amber-808 dark:border-amber-950/40 dark:bg-amber-950/5' :
                        'border-rose-100 bg-rose-50/20 text-rose-808 dark:border-rose-950/40 dark:bg-rose-950/5'
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
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-[#fb8500]" />
                Plot Parameters
              </h3>
              <p className="text-xs text-slate-500">Configure plot specifications and room requirements.</p>
            </div>

            {/* Plot Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Width (Feet)</label>
                <input
                  type="number"
                  value={plotWidth}
                  onChange={(e) => setPlotWidth(Math.max(10, parseInt(e.target.value) || 23))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#fb8500] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Length (Feet)</label>
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
              <label className="text-[11px] font-bold text-slate-600 uppercase">Road Facing Direction</label>
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
              <label className="text-[11px] font-bold text-slate-600 uppercase">Bedrooms</label>
              <div className="flex gap-2">
                {[2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBedroomCount(num as 2 | 3)}
                    className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bedroomCount === num
                        ? 'bg-[#fb8500] border-[#fb8500] text-white'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-850 dark:text-slate-300'
                    }`}
                  >
                    {num} BHK Layout
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist additions */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/40">
              <label className="text-[11px] font-bold text-slate-600 uppercase block">Include Spaces</label>
              
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

          {/* Plan Canvas drawing (Right) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between min-h-[500px]">
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-805/40 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  2D Structural Floor Plan Blueprint
                </h3>
                <p className="text-xs text-slate-500">Vastu compliant scale drawing for {plotWidth}ft × {plotLength}ft.</p>
              </div>

              <button
                onClick={handleDownloadPlan}
                className="flex items-center gap-1.5 bg-[#fb8500] hover:bg-[#e07500] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:translate-y-[-1px]"
              >
                <Download className="h-4 w-4" />
                Export Plan JPG
              </button>
            </div>

            {/* Canvas Wrapper */}
            <div className="border border-slate-200 dark:border-slate-800 bg-[#fffcf7] dark:bg-slate-950 rounded-2xl p-2 flex justify-center items-center shadow-inner relative max-w-full overflow-auto">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="max-w-full block"
              />
            </div>

            {/* Core Vastu Checks table logs */}
            <div className="w-full pt-6 space-y-3.5 border-t border-slate-100 dark:border-slate-800/40 mt-5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Vastu Placement Compliance Feedback:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {generateRoomsList(plotWidth, plotLength, plotFacing, bedroomCount).map((room, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">{room.name}</span>
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
