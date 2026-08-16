import React, { useState, useEffect, useRef } from 'react';
import { Booking, Artist } from '../types';
import { 
  X, 
  MapPin, 
  Navigation, 
  Car, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  MessageSquare, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  Info,
  Sliders,
  Layers,
  Globe
} from 'lucide-react';

interface TransitTrackerProps {
  booking: Booking;
  artist?: Artist; // Optional but let's pass it if possible
  onClose: () => void;
}

export function TransitTracker({ booking, artist, onClose }: TransitTrackerProps) {
  // Navigation variables & parameters
  const venueName = booking.location || "Melkweg, Lijnbaansgracht, Amsterdam";
  const artistName = booking.artistName;
  const transportDetail = artist?.transport || "Urban Arrow Cargo Bike (fits guitar, pedal case, and small session amps)";

  // Traffic Modes (Adapted for Amsterdam commuter flows)
  const TRAFFIC_MODES = {
    clear: { label: 'Optimal / Empty Canal Bike Lanes', speedMultiplier: 1.4, etaAdjustment: 0.8, color: '#D1FF26' },
    moderate: { label: 'Normal Traffic / Active Cycling Flows', speedMultiplier: 0.9, etaAdjustment: 1.0, color: '#FFB800' },
    gridlock: { label: 'Crowded Streets / Canal Bridge Construction', speedMultiplier: 0.45, etaAdjustment: 1.6, color: '#FF3B30' }
  };

  type TrafficType = 'clear' | 'moderate' | 'gridlock';
  const [trafficMode, setTrafficMode] = useState<TrafficType>('moderate');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(15); // Starts at 15% complete
  const [mapStyle, setMapStyle] = useState<'vector' | 'satellite'>('vector');
  
  // Detour / Emergency State
  const [hazardActive, setHazardActive] = useState<boolean>(false);
  const [hazardMessage, setHazardMessage] = useState<string>('');
  
  // Custom interactive Chat Pings for simulated Dispatch Comm
  const [pings, setPings] = useState<Array<{ sender: 'user' | 'artist', text: string, time: string }>>([
    {
      sender: 'artist',
      text: `Secured custom flight-cases in my cargo bike carrier box. Pedaling over to ${venueName} from the ferry now!`,
      time: '16:44'
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Dynamically generated speed & location logs based on progression
  const [currentSpeed, setCurrentSpeed] = useState<number>(45);
  const [remainingDistance, setRemainingDistance] = useState<number>(7.4);
  const [etaMinutes, setEtaMinutes] = useState<number>(14);
  const [telemetryAlert, setTelemetryAlert] = useState<string>('GPS Satellite Lock Active');

  // Ref to hold the track coordinates for the road network SVG path
  // Custom multi-point road curves representing high road & side avenues
  const pathCoordinates = [
    { x: 40, y: 190 },  // Depart (Garage)
    { x: 90, y: 175 },  // Avenue A turn
    { x: 140, y: 220 }, // High highway entry
    { x: 230, y: 220 }, // Expressway stretch
    { x: 280, y: 130 }, // River bridge
    { x: 370, y: 110 }, // Suburban Ring road
    { x: 440, y: 170 }, // Intersection roundabout
    { x: 470, y: 80 }   // Studio Target
  ];

  // Helper to calculate coordinate position along the polyline path segments
  const getCoordinatesAtProgress = (pct: number) => {
    const segments = pathCoordinates.length - 1;
    const totalStep = 100 / segments;
    const segmentIndex = Math.min(
      Math.floor(pct / totalStep),
      segments - 1
    );
    const segmentPct = (pct - segmentIndex * totalStep) / totalStep;

    const start = pathCoordinates[segmentIndex];
    const end = pathCoordinates[segmentIndex + 1];

    const currentX = start.x + (end.x - start.x) * segmentPct;
    const currentY = start.y + (end.y - start.y) * segmentPct;

    // Estimate vector heading angle
    const angleRad = Math.atan2(end.y - start.y, end.x - start.x);
    const angleDeg = (angleRad * 180) / Math.PI + 90;

    return { x: currentX, y: currentY, heading: angleDeg };
  };

  const currentPos = getCoordinatesAtProgress(progress);

  // Interval simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (hazardActive) {
          // Progress frozen due to hazard flat tire etc
          setCurrentSpeed(0);
          return prev;
        }

        // Calculate progress increments based on traffic mode and multiplier
        const baseIncrement = 0.5;
        const trafficFactor = TRAFFIC_MODES[trafficMode].speedMultiplier;
        const actualIncrement = baseIncrement * trafficFactor * speedMultiplier;
        
        const nextProgress = prev + actualIncrement;

        if (nextProgress >= 100) {
          clearInterval(interval);
          setCurrentSpeed(0);
          setRemainingDistance(0);
          setEtaMinutes(0);
          setTelemetryAlert(`Arrived at ${venueName}. Sessionist checking in.`);
          return 100;
        }

        // Live stats fluctuation
        const targetDistance = parseFloat((7.4 * (1 - nextProgress / 100)).toFixed(1));
        setRemainingDistance(targetDistance);

        const calculatedEta = Math.max(
          1,
          Math.ceil((14 * (1 - nextProgress / 100)) * TRAFFIC_MODES[trafficMode].etaAdjustment)
        );
        setEtaMinutes(calculatedEta);

        // Simulated fluctuating speed (between 25 and 65 km/h depending on traffic)
        let speedRange = { min: 40, max: 62 };
        if (trafficMode === 'gridlock') {
          speedRange = { min: 5, max: 18 };
        } else if (trafficMode === 'moderate') {
          speedRange = { min: 25, max: 48 };
        }
        
        const targetSpeed = Math.floor(
          Math.random() * (speedRange.max - speedRange.min) + speedRange.min
        );
        setCurrentSpeed(targetSpeed);

        // Dynamically update alert description logs with Amsterdam landmarks
        if (nextProgress < 25) {
          setTelemetryAlert("Cycling past Amsterdam Central Station. Load checked.");
        } else if (nextProgress >= 25 && nextProgress < 50) {
          setTelemetryAlert("Navigating historic canal rings. Pedestrians on the cycle lane.");
        } else if (nextProgress >= 50 && nextProgress < 75) {
          setTelemetryAlert("Crossing the Amstel bridge. Waterproof gig-bags buffered.");
        } else if (nextProgress >= 75 && nextProgress < 95) {
          setTelemetryAlert("Turning past Leidseplein. Preparing equipment manifests.");
        } else if (nextProgress >= 95) {
          setTelemetryAlert("Arriving at the venue load-in gate. Ready to deploy sheets.");
        }

        return nextProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, trafficMode, speedMultiplier, hazardActive]);

  // Handle hazard triggers
  const triggerHazard = () => {
    if (hazardActive) {
      // Resolve hazard
      setHazardActive(false);
      setHazardMessage('');
      setPings((prev) => [
        ...prev,
        {
          sender: 'artist',
          text: `Issue resolved! We are moving again. Apologies for the delay!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      // Create random hazard
      setHazardActive(true);
      const messages = [
        "Narrow bridge closure on Keizersgracht. Diverting cargo bike through Leidsestraat.",
        "Delayed for 5 mins waiting for the Amsterdam-Noord Buiksloterweg ferry crossing.",
        "Sudden rain storm over Vondelpark. Hooking the waterproof tarp over our amp rack."
      ];
      const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
      setHazardMessage(selectedMessage);
      setCurrentSpeed(0);

      setPings((prev) => [
        ...prev,
        {
          sender: 'artist',
          text: `🚨 Heads up: ${selectedMessage} Standing by momentarily.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Immediate location query simulation
  const sendDispatchPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userText = newMessage;
    setNewMessage('');
    
    // Log user chat
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPings((prev) => [...prev, { sender: 'user', text: userText, time: timeStr }]);

    // Trigger artist automatic simulated response based on progress & hazards
    setTimeout(() => {
      let reply = '';
      if (progress >= 100) {
        reply = `I've just loaded into the studio space! Setting up my pedalboard and tuning now. Let me know which channels to map.`;
      } else if (hazardActive) {
        reply = `Still stuck sorting this detour out. I'll pick up the pace the instant this road gets cleared!`;
      } else if (progress > 80) {
        reply = `Almost there! Just turning onto the final avenue block. Make sure someone is available near the back gate for the heavy amps.`;
      } else {
        const potentialReplies = [
          `Currently driving smoothly. ETA looks to be about ${etaMinutes} minutes. The gear is locked tight in the rear trunk.`,
          `On course! Cruising down the speedway stretch right now. See you soon!`,
          `Navigating moderate paths - no roadblocks. Keep a kettle boiled for a hot tea!`
        ];
        reply = potentialReplies[Math.floor(Math.random() * potentialReplies.length)];
      }

      setPings((prev) => [
        ...prev,
        {
          sender: 'artist',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 400);
  };

  // Reset progress to try the route again
  const handleResetRoute = () => {
    setProgress(1);
    setHazardActive(false);
    setHazardMessage('');
    setIsPlaying(true);
    setCurrentSpeed(40);
    setRemainingDistance(7.4);
    setEtaMinutes(14);
    setTelemetryAlert("Resetting route telemetry. Leaving depot.");
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0F0F11] border border-white/10 flex flex-col md:flex-row rounded-none overflow-hidden max-h-[92vh] shadow-[0_0_50px_rgba(172,108,255,0.15)] select-none">
        
        {/* Left Interactive Vector map */}
        <div className="flex-1 bg-black p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 min-h-[350px] md:min-h-[500px]">
          {/* Header readout */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping" />
              <div className="font-mono">
                <span className="text-[10px] text-white/40 uppercase block tracking-widest leading-none">REAL-TIME GPS DISPATCH</span>
                <span className="text-[11px] text-white font-extrabold uppercase mt-0.5 block">TRACKING: {artistName}</span>
              </div>
            </div>
            
            <div className="text-right font-mono">
              <span className="text-[9px] text-white/40 block">Booking Confirmed</span>
              <span className="text-brand-accent text-[9px] font-black uppercase tracking-wider bg-brand-accent/10 px-2 py-0.5 border border-brand-accent/20">
                {booking.securedIdeaHash || "PAYMENT-SECURED"}
              </span>
            </div>
          </div>

          {/* SVG Vector Map Canvas representing abstract city roads or Satellite scan view */}
          <div id="transit-tracker-map-canvas" className={`relative w-full h-[250px] sm:h-[300px] md:h-full border my-3 rounded-none overflow-hidden transition-all duration-500 ${
            mapStyle === 'satellite' 
              ? 'bg-[#030907] border-emerald-500/20 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]' 
              : 'bg-neutral-950/60 border-white/5'
          }`}>
            {/* Map Style Toggle Button */}
            <div className="absolute top-2.5 left-2.5 z-10 flex gap-2">
              <button
                id="map-style-toggle-btn"
                type="button"
                onClick={() => setMapStyle(mapStyle === 'vector' ? 'satellite' : 'vector')}
                className={`py-1.5 px-3 text-[9px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer border flex items-center gap-1.5 ${
                  mapStyle === 'satellite' 
                    ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-black/90 text-white border-white/10 hover:border-brand-accent/40 hover:text-brand-accent'
                }`}
                title="Toggle physical road map or satellite recon feedback"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Format: {mapStyle === 'vector' ? 'Vector' : 'Satellite Radar'}</span>
              </button>
            </div>

            {/* Dark grid background pattern overlay */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              mapStyle === 'satellite'
                ? "bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-100"
                : "bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-40"
            }`} />

            {/* Simulated Street Names / Elements / Satellite HUD Indicators */}
            {mapStyle === 'satellite' ? (
              <>
                <div className="absolute top-12 left-2.5 text-[8px] font-mono text-emerald-400/40 uppercase tracking-widest select-none font-bold animate-pulse">🛰️ ALTIMETRY SCAN: LOCK ACTIVE</div>
                <div className="absolute bottom-12 right-12 text-[8px] font-mono text-emerald-400/30 uppercase tracking-widest select-none">ORBITAL SWEEP: ACTIVE SHIELD</div>
                <div className="absolute top-[170px] left-[40px] text-[7px] font-mono text-emerald-500/25 uppercase tracking-widest select-none pointer-events-none">TERRAIN REFLECTANCE SENSOR</div>
              </>
            ) : (
              <>
                <div className="absolute top-12 left-2.5 text-[8px] font-mono text-white/20 uppercase tracking-widest select-none">Amsterdam Ringweg (A10)</div>
                <div className="absolute bottom-12 right-12 text-[8px] font-mono text-white/20 uppercase tracking-widest select-none">NDSM Wharf Creative Hub</div>
                <div className="absolute top-[160px] left-[180px] text-[8px] font-mono text-red-500/10 uppercase tracking-widest select-none pointer-events-none">Het IJ Crossing Ferry</div>
              </>
            )}

            {/* Vector Map SVG */}
            <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mapStyle === 'satellite' ? "#10B981" : "#8A46FF"} stopOpacity={mapStyle === 'satellite' ? "0.6" : "0.4"} />
                  <stop offset="100%" stopColor="#D1FF26" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Satellite topography contour scans and thermal boundaries */}
              {mapStyle === 'satellite' && (
                <g>
                  {/* High density residential structures represented as heat-colored rectangles */}
                  <rect x="25" y="25" width="85" height="55" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.15)" strokeWidth="1" strokeDasharray="2" />
                  <rect x="185" y="15" width="115" height="45" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.12)" strokeWidth="1" strokeDasharray="1" />
                  <rect x="360" y="145" width="110" height="75" fill="rgba(16,185,129,0.07)" stroke="rgba(16,185,129,0.18)" strokeWidth="1" strokeDasharray="2" />
                  
                  {/* Circular Radar Scan Range Sweeper lines */}
                  <circle cx="280" cy="130" r="140" fill="none" stroke="rgba(16,185,129,0.03)" strokeWidth="1" />
                  <circle cx="280" cy="130" r="80" fill="none" stroke="rgba(16,185,129,0.05)" strokeWidth="1.5" strokeDasharray="5,5" />
                  <circle cx="280" cy="130" r="30" fill="none" stroke="rgba(16,185,129,0.07)" strokeWidth="1" />
                  
                  {/* Scanning sweep wedge simulation representation */}
                  <path d="M 280 130 L 320 200 A 140 140 0 0 1 180 220 Z" fill="rgba(16,185,129,0.015)" />
                  
                  {/* Crosshair telemetry vectors */}
                  <line x1="280" y1="10" x2="280" y2="250" stroke="rgba(16,185,129,0.04)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="10" y1="130" x2="490" y2="130" stroke="rgba(16,185,129,0.04)" strokeWidth="1" strokeDasharray="4" />
                </g>
              )}

              {/* Grid river shape outline */}
              <path 
                d="M 270 0 C 275 80, 260 160, 290 240" 
                stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.16)" : "rgba(40,120,250,0.12)"} 
                strokeWidth="16" 
                fill="none" 
              />

              {/* City background secondary roads */}
              <path d="M 10 110 L 490 110" stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)"} strokeWidth="4" fill="none" />
              <path d="M 80 10 L 80 230" stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)"} strokeWidth="4" fill="none" />
              <path d="M 430 10 L 430 230" stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)"} strokeWidth="4" fill="none" />
              <path d="M 200 40 L 350 190" stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)"} strokeWidth="3" fill="none" />

              {/* Main routing road path */}
              <path
                d={`M ${pathCoordinates[0].x} ${pathCoordinates[0].y} ` +
                   pathCoordinates.slice(1).map(pt => `L ${pt.x} ${pt.y}`).join(' ')
                }
                stroke={mapStyle === 'satellite' ? "rgba(16,185,129,0.14)" : "rgba(255,255,255,0.08)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Active navigation path glowing colored overlay */}
              <path
                id="active-vector-polyline"
                d={`M ${pathCoordinates[0].x} ${pathCoordinates[0].y} ` +
                   pathCoordinates.slice(1).map(pt => `L ${pt.x} ${pt.y}`).join(' ')
                }
                stroke="url(#routeGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                filter="url(#glow)"
                strokeDasharray="500"
                strokeDashoffset={500 - (500 * progress) / 100}
                className="transition-all duration-300"
              />

              {/* Start (Depot/Home) Pin Marker */}
              <g transform={`translate(${pathCoordinates[0].x}, ${pathCoordinates[0].y})`}>
                <circle r="6" fill="#1E1E24" opacity="0.6" />
                <circle r="4" fill={mapStyle === 'satellite' ? "#10B981" : "#8A46FF"} />
              </g>

              {/* End (Studio Venue Target) glowing beacon */}
              <g transform={`translate(${pathCoordinates[pathCoordinates.length - 1].x}, ${pathCoordinates[pathCoordinates.length - 1].y})`}>
                <circle r="12" fill="#D1FF26" className="animate-ping" opacity="0.2" style={{ animationDuration: '2.5s' }} />
                <circle r="7" fill="black" stroke={mapStyle === 'satellite' ? "#10B981" : "#D1FF26"} strokeWidth="2" />
                <circle r="3" fill="#D1FF26" />
              </g>

              {/* Active Traveling Car Icon crawling along coordinates */}
              {progress < 100 && (
                <g 
                  transform={`translate(${currentPos.x}, ${currentPos.y}) rotate(${currentPos.heading - 90})`}
                  className="transition-all duration-300"
                >
                  {/* Glowing background halo */}
                  <circle r="11" fill={mapStyle === 'satellite' ? "rgba(16,185,129,0.3)" : "rgba(172,108,255,0.3)"} filter="url(#glow)" />
                  <circle r="8" fill="black" stroke={mapStyle === 'satellite' ? "#10B981" : "#AC6CFF"} strokeWidth="2.2" />
                  
                  {/* Arrow pin cursor pointing to destination */}
                  <polygon points="0,-4 3,3 0,1 -3,3" fill="#D1FF26" stroke="none" />
                </g>
              )}

              {/* Satellite Target Rect Overlay framing the moving vehicle */}
              {progress < 100 && mapStyle === 'satellite' && (
                <g 
                  transform={`translate(${currentPos.x}, ${currentPos.y})`}
                  className="transition-all duration-300 pointer-events-none"
                >
                  {/* Corner indicator ticks */}
                  <path d="M -13 -13 L -8 -13 M -13 -13 L -13 -8" stroke="#D1FF26" strokeWidth="1.5" fill="none" />
                  <path d="M 13 -13 L 8 -13 M 13 -13 L 13 -8" stroke="#D1FF26" strokeWidth="1.5" fill="none" />
                  <path d="M -13 13 L -8 13 M -13 13 L -13 8" stroke="#D1FF26" strokeWidth="1.5" fill="none" />
                  <path d="M 13 13 L 8 13 M 13 13 L 13 8" stroke="#D1FF26" strokeWidth="1.5" fill="none" />
                  
                  {/* Micro coordinate readout indicator floating */}
                  <text x="16" y="3" fill="#D1FF26" fontSize="6px" fontFamily="monospace" className="font-extrabold tracking-widest uppercase">
                    TRK-LOCKED
                  </text>
                </g>
              )}
            </svg>

            {/* On-Map HUD Layer */}
            <div className="absolute bottom-3 left-3 bg-black/85 border border-white/10 p-2 font-mono text-[9px] space-y-0.5 shadow-md">
              <span className="text-white/40 block">COORDINATE DOCKET:</span>
              <span className="text-white block font-bold">X: {currentPos.x.toFixed(1)} | Y: {currentPos.y.toFixed(1)}</span>
              <span className="text-brand-accent block text-[8px] tracking-widest uppercase font-black">
                HEADING: {currentPos.heading.toFixed(0)}° NNE
              </span>
            </div>

            {/* Destination Tag Flag overlay */}
            <div className="absolute top-2.5 right-2.5 bg-[#D1FF26] text-black border border-black/20 p-1.5 font-mono text-[9px] rounded-none font-bold uppercase tracking-wider max-w-[170px] leading-tight shadow-lg">
              <span className="text-[7px] text-black/50 block font-normal">VENUE TARGET PORT:</span>
              {venueName}
            </div>

            {/* Emergency Hazard Active warning sash on Map */}
            {hazardActive && (
              <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-black border border-red-500/40 p-3 max-w-xs space-y-1.5 animate-bounce">
                  <div className="flex items-center gap-1.5 text-red-500 font-mono text-[10px] uppercase font-black">
                    <AlertTriangle className="w-4 h-4" />
                    <span>⚠️ EMERGENCY DETOUR DETECTED</span>
                  </div>
                  <p className="text-[10px] font-sans text-white/80 leading-normal">
                    {hazardMessage || "Sessionist has paused transit. Dispatching dynamic routing updates."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick interactive buttons row */}
          <div className="p-3 bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 rounded-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 font-bold uppercase text-[9px] tracking-wider rounded-none border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPlaying ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-brand-accent text-black border-brand-accent hover:opacity-90'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? "Pause Tracking" : "Resume GPS"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetRoute}
                className="p-2 border border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 transition-all cursor-pointer rounded-none text-[9px] uppercase font-mono tracking-widest flex items-center gap-1"
                title="Reset simulation layout"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Traffic Selector HUD */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-white/40">TRAFFIC LEVEL:</span>
              <select
                value={trafficMode}
                onChange={(e) => setTrafficMode(e.target.value as TrafficType)}
                className="bg-black text-[10px] text-white border border-white/10 focus:border-brand-accent py-1 px-1.5 outline-none font-bold uppercase cursor-pointer"
              >
                <option value="clear">CLEAR (1.4x SPEED)</option>
                <option value="moderate">MODERATE (0.9x)</option>
                <option value="gridlock">HEAVY JAM (0.3x)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Dashboard, telemetry status panel & simulation feedback */}
        <div className="w-full md:w-[350px] bg-[#121214] p-5 sm:p-6 flex flex-col justify-between space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-sans font-black text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
              <Car className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Transit Telemetry</span>
            </h3>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-1 hover:bg-white/5"
              title="Close Dispatch Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Box on Artist vehicle cargo */}
          <div className="p-3 bg-black/60 border border-white/5 space-y-1 font-mono text-[10px]">
            <span className="text-white/40 block uppercase tracking-widest font-bold">Transport Fleet Vehicle:</span>
            <span className="text-white block font-sans text-xs leading-tight font-medium">
              {transportDetail}
            </span>
          </div>

          {/* Real-time stats readouts */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/40 border border-white/5 p-2.5 text-center font-mono">
              <span className="text-[8px] text-white/40 uppercase block tracking-widest mb-1.5">ETA TIME</span>
              <div className="flex items-center justify-center gap-0.5 text-brand-accent font-black text-lg">
                <Clock className="w-4 h-4 shrink-0 text-brand-accent" />
                <span>{progress >= 100 ? "0" : etaMinutes}m</span>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5 text-center font-mono">
              <span className="text-[8px] text-white/40 uppercase block tracking-widest mb-1.5">DISTANCE</span>
              <div className="flex items-center justify-center gap-0.5 text-white font-black text-lg">
                <Navigation className="w-3.5 h-3.5 shrink-0 text-white/60" />
                <span>{remainingDistance}km</span>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5 text-center font-mono">
              <span className="text-[8px] text-white/40 uppercase block tracking-widest mb-1.5">SPEED</span>
              <div className="flex items-center justify-center gap-0.5 text-white font-black text-lg">
                <Gauge className="w-4 h-4 shrink-0 text-white/60" />
                <span>{currentSpeed}h</span>
              </div>
            </div>
          </div>

          {/* Progress bar visual slider / indicator */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[9px] uppercase text-white/40">
              <span>Depot Origin</span>
              <span className="text-[#D1FF26] font-bold">{progress.toFixed(0)}% Complete</span>
              <span>Studio Port</span>
            </div>
            
            {/* Visual Progress bar with slider selector so user can manually advance path */}
            <div className="relative">
              <div className="h-1.5 bg-black border border-white/10 w-full relative">
                <div 
                  className="h-full bg-brand-accent border-r-2 border-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                id="transit-progress-scrubber"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  setProgress(parseInt(e.target.value));
                  setIsPlaying(false); // Stop auto progressive play when user manual scrubs
                }}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto cursor-pointer"
                title="Manual routing progression scrub"
              />
            </div>
            <p className="text-[9px] text-white/30 text-center italic">Drag/Scrub to manually travel along route</p>
          </div>

          {/* Telemetry Status alerts banner */}
          <div className="bg-black/80 border border-white/5 p-3 font-mono space-y-1">
            <div className="flex items-center gap-1 px-1 py-0.5 bg-white/5 text-white/50 text-[8px] tracking-widest uppercase font-black w-fit">
              <Info className="w-3 h-3 text-brand-accent" />
              <span>Current Status Docket:</span>
            </div>
            <p className="text-[10px] text-brand-accent font-bold mt-1.5">
              {telemetryAlert}
            </p>
          </div>

          {/* Advanced Simulation Controls block */}
          <div className="bg-black border border-white/10 p-3.5 space-y-3.5">
            <div className="flex items-center gap-1 text-[9px] font-mono text-white/40 uppercase tracking-widest pb-2 border-b border-white/5">
              <Sliders className="w-3 h-3 text-[#AC6CFF]" />
              <span className="font-bold">Dispatch Control center</span>
            </div>

            {/* Speeds triggers */}
            <div className="space-y-2">
              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-wider">GPS Time Compression Speed:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 5, 10].map((spd) => (
                  <button
                    key={`spd-${spd}`}
                    type="button"
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`py-1 text-[9px] font-mono border transition rounded-none cursor-pointer ${
                      speedMultiplier === spd 
                        ? 'bg-[#AC6CFF] text-black border-transparent font-black shadow-[0_0_8px_rgba(172,108,255,0.4)]' 
                        : 'bg-black text-white/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Sim Detours button */}
            <button
              type="button"
              onClick={triggerHazard}
              className={`w-full py-2 border text-[9px] font-mono uppercase tracking-widest font-black rounded-none cursor-pointer transition flex items-center justify-center gap-1.5 ${
                hazardActive 
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/35' 
                  : 'bg-black hover:bg-white/5 text-white border-white/15'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{hazardActive ? "⚠️ Resolve Road Obstruction" : "⚡ Trigger Road Obstruction"}</span>
            </button>
          </div>

          {/* Live conversation/ping messenger simulating call/dispatch */}
          <div className="flex-1 border border-white/10 bg-black/60 p-3 h-[180px] flex flex-col justify-between space-y-2.5">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">
              <MessageSquare className="w-3 h-3 text-brand-accent shrink-0" />
              <span>Direct Link Chat:</span>
            </div>

            {/* List pings message bubbles */}
            <div className="flex-1 overflow-y-auto space-y-1.5 h-[100px] text-[10px]">
              {pings.map((p, idx) => (
                <div key={idx} className={`space-y-0.5 ${p.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className="text-[7px] text-white/40 font-mono tracking-wide uppercase px-1">
                    {p.sender === 'user' ? 'ME (Platform Operator)' : artistName} - {p.time}
                  </span>
                  <div className={`p-2 rounded-none inline-block max-w-[90%] text-left ${
                    p.sender === 'user' 
                      ? 'bg-brand-accent text-black font-semibold' 
                      : 'bg-white/10 text-white'
                  }`}>
                    {p.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Send form interface */}
            <form onSubmit={sendDispatchPing} className="flex gap-1.5 border-t border-white/5 pt-1.5">
              <input
                type="text"
                placeholder="Message dispatch..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-black border border-white/10 text-white text-[10px] rounded-none outline-none focus:border-[#AC6CFF] px-2 py-1.5 font-sans"
              />
              <button
                type="submit"
                className="px-2.5 bg-brand-accent/20 hover:bg-brand-accent hover:text-black border border-brand-accent/30 text-brand-accent text-[9px] font-mono uppercase tracking-wider font-extrabold cursor-pointer rounded-none transition"
              >
                Send
              </button>
            </form>
          </div>

          {/* Fine Print payment info */}
          <div className="text-[9px] font-sans text-white/30 leading-normal flex items-start gap-1 p-2 bg-white/2 border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
            <p>
              Auto-released milestones occur safely upon confirmed arrival coordinate handshake.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
