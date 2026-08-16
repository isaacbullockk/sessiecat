import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Tv, 
  RefreshCw, 
  Mic, 
  Video, 
  VolumeX, 
  Volume2, 
  Sparkles, 
  Activity, 
  Lock, 
  Eye, 
  Zap,
  Radio,
  FileVideo
} from 'lucide-react';

export function LiveStudioFeed() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [filterMode, setFilterMode] = useState<'rgb' | 'cyan' | 'night' | 'thermal' | 'golden'>('rgb');
  const [selectedStudio, setSelectedStudio] = useState<'ndsm' | 'wisseloord' | 'qfactory'>('ndsm');
  const [bitrate, setBitrate] = useState(8420);
  const [fps, setFps] = useState(60);
  const [inputLevel, setInputLevel] = useState(45);
  const [muteAudio, setMuteAudio] = useState(true);
  const [micActive, setMicActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Simulate moving audio/video tech specs
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setBitrate(prev => Math.floor(prev + (Math.random() * 300 - 150)));
        setFps(prev => Math.min(60, Math.max(57, prev + (Math.random() * 2 - 1))));
        setInputLevel(prev => {
          const delta = Math.sin(Date.now() / 200) * 15 + (Math.random() * 10 - 5);
          return Math.min(100, Math.max(5, Math.floor(prev + delta)));
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle HTML5 Canvas Generative Animated Video Stream
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPhase = 0;

    const render = () => {
      if (!isPlaying) {
        // Render offline screen
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // NO SIGNAL text
        ctx.fillStyle = '#ff3344';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STANDBY // LINK PAUSED', canvas.width / 2, canvas.height / 2);
        
        ctx.strokeStyle = '#ff3344';
        ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 25, 200, 50);

        animationRef.current = requestAnimationFrame(render);
        return;
      }

      // Clear with background color dependent on filter
      let bg = '#070709';
      if (filterMode === 'night') bg = '#021004';
      if (filterMode === 'thermal') bg = '#120220';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render aesthetic sci-fi video grids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      if (filterMode === 'night') ctx.strokeStyle = 'rgba(20, 230, 40, 0.08)';
      if (filterMode === 'thermal') ctx.strokeStyle = 'rgba(230, 40, 180, 0.08)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw mathematical simulated sessionists & gear as rotating vectors
      localPhase += 0.02 * (micActive ? 2.5 : 1.0);
      phaseRef.current = localPhase;

      const numNodes = 7;
      const points: {x: number, y: number, r: number, color: string, name: string}[] = [];

      // Generate nodes representing "Drummer", "Synth Rig", "Ferry Stream"
      const names = ['DRUM_KIT', 'SYNTH_MOOG', 'VOCAL_BOOTH', 'SSL_DESK', 'BASS_AMPEG', 'ROTOR_LES_PAUL', 'AMSTEL_CAM'];
      const colors = {
        rgb: ['#D1FF26', '#AC6CFF', '#FB4B87', '#33E6FF', '#FFAE33', '#FF4E33', '#AC6CFF'],
        cyan: ['#00FFFF', '#20B2AA', '#E0FFFF', '#00FFFF', '#00CED1', '#4682B4', '#00FFFF'],
        night: ['#00FF33', '#22FF55', '#44FF77', '#88FFaa', '#11BB33', '#33CC44', '#00FF44'],
        thermal: ['#FFFF00', '#FF3300', '#FF00FF', '#0000FF', '#00FFFF', '#FF9900', '#FFFF00'],
        golden: ['#D1FF26', '#FFD700', '#DAA520', '#B8860B', '#FFD755', '#FF8C00', '#FFD700']
      }[filterMode];

      for (let i = 0; i < numNodes; i++) {
        const offset = i * (Math.PI * 2 / numNodes);
        const radius = 60 + Math.sin(localPhase + i) * 15;
        const x = canvas.width / 2 + Math.cos(localPhase * 0.5 + offset) * radius;
        const y = canvas.height / 2 + Math.sin(localPhase * 0.5 + offset) * radius * 0.6;
        points.push({
          x,
          y,
          r: 6 + Math.sin(localPhase * 2 + i) * 3,
          color: colors[i % colors.length],
          name: names[i]
        });
      }

      // Draw constellation wireframe lines
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist/1000})`;
            if (filterMode === 'night') ctx.strokeStyle = `rgba(20, 230, 40, ${0.25 - dist/800})`;
            if (filterMode === 'thermal') ctx.strokeStyle = `rgba(230, 40, 180, ${0.25 - dist/800})`;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles / Nodes
      points.forEach((p, idx) => {
        const glowRad = p.r * 2.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, glowRad);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        if (filterMode === 'night') ctx.fillStyle = '#11ff55';
        if (filterMode === 'thermal') ctx.fillStyle = '#ffff66';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r / 2, 0, Math.PI * 2);
        ctx.fill();

        // Node technical label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        if (filterMode === 'night') ctx.fillStyle = 'rgba(20, 230, 40, 0.6)';
        ctx.font = '6px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - p.r - 4);
      });

      // Centered spinning radar sweep line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      if (filterMode === 'night') ctx.strokeStyle = 'rgba(20, 230, 40, 0.1)';
      if (filterMode === 'thermal') ctx.strokeStyle = 'rgba(230, 40, 180, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(
        canvas.width / 2 + Math.cos(localPhase) * 140,
        canvas.height / 2 + Math.sin(localPhase) * 140
      );
      ctx.stroke();

      // Top indicator bar / Recording flashing dot
      const isSecondsEven = Math.floor(Date.now() / 800) % 2 === 0;
      if (isSecondsEven) {
        ctx.fillStyle = '#ff3344';
        ctx.beginPath();
        ctx.arc(20, 20, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      if (filterMode === 'night') ctx.fillStyle = '#00ff44';
      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `• LIVE STREAM FEED REC // ${selectedStudio.toUpperCase()}_STAGE_CAM_01`, 
        30, 
        16
      );

      // Current Simulated Time
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      if (filterMode === 'night') ctx.fillStyle = 'rgba(0, 255, 44, 0.7)';
      ctx.textAlign = 'right';
      const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      ctx.fillText(`${timeStr} UTC`, canvas.width - 20, 16);

      // Camera focal parameters overlay at bottom
      ctx.font = '6.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      if (filterMode === 'night') ctx.fillStyle = '#00ff44';
      ctx.fillText(`ISO 800 | F/2.8 | CAO_SAFE_SECURE_HOLD`, 20, canvas.height - 25);
      ctx.fillText(`FILTER: ${filterMode.toUpperCase()} MODE | BITRATE: ${bitrate} kbps`, 20, canvas.height - 15);

      ctx.textAlign = 'right';
      ctx.fillText(`LATENCY: 4ms | RESOLUTION: 1080P`, canvas.width - 20, canvas.height - 25);
      ctx.fillText(`COORDS: 52.3702° N, 4.8952° E (AMS)`, canvas.width - 20, canvas.height - 15);

      // Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      if (filterMode === 'night') ctx.strokeStyle = 'rgba(20, 230, 40, 0.25)';
      ctx.lineWidth = 1;
      
      // Top Left corner bracket
      ctx.beginPath(); ctx.moveTo(10, 15); ctx.lineTo(10, 10); ctx.lineTo(15, 10); ctx.stroke();
      // Top Right corner bracket
      ctx.beginPath(); ctx.moveTo(canvas.width - 10, 15); ctx.lineTo(canvas.width - 10, 10); ctx.lineTo(canvas.width - 15, 10); ctx.stroke();
      // Bottom Left corner bracket
      ctx.beginPath(); ctx.moveTo(10, canvas.height - 15); ctx.lineTo(10, canvas.height - 10); ctx.lineTo(15, canvas.height - 10); ctx.stroke();
      // Bottom Right corner bracket
      ctx.beginPath(); ctx.moveTo(canvas.width - 10, canvas.height - 15); ctx.lineTo(canvas.width - 10, canvas.height - 10); ctx.lineTo(canvas.width - 15, canvas.height - 10); ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, filterMode, selectedStudio, bitrate, micActive]);

  const toggleMic = () => {
    setMicActive(prev => !prev);
  };

  return (
    <div id="live-studio-feed-card" className="bg-[#0b0b0d] border border-white/10 p-5 space-y-4 font-sans relative overflow-hidden">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-400/10 border border-red-500/20 text-red-400 animate-pulse rounded-none">
            <Radio className="w-5 h-5 text-brand-accent animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-brand-accent uppercase tracking-widest font-black block">Live HD Stream Hub</span>
            <h4 className="text-white text-sm font-black uppercase tracking-tight font-sans">
              Active Studio Broadcast Webcam Simulation
            </h4>
          </div>
        </div>

        <div className="text-[10px] text-white/40 font-mono flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Stream Engine Active (0.01% CPU)</span>
        </div>
      </div>

      {/* Main Stream Screen Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Vector Canvas Container */}
        <div className="lg:col-span-3 space-y-2">
          <div className="relative border border-white/15 bg-black overflow-hidden group aspect-[16/9]">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={360}
              className="w-full h-full object-cover block"
            />

            {/* Simulated Live Scanlines overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

            {/* Quick Play overlay for paused state */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="px-5 py-2.5 bg-brand-accent text-black uppercase font-mono text-[10px] font-black tracking-widest cursor-pointer hover:scale-105 transition"
                >
                  ► Establish Active Link
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/50 font-mono max-w-full overflow-x-auto gap-2">
            <div>
              <span>Latency: <strong className="text-white">4.2 ms</strong> (AMS-IX)</span>
              <span className="mx-2">|</span>
              <span>Bitrate: <strong className="text-white">{bitrate} Kbps</strong></span>
            </div>
            <div>
              <span>Render Clock: <strong className="text-[#D1FF26]">{fps} FPS</strong></span>
            </div>
          </div>
        </div>

        {/* Video Control Board */}
        <div className="space-y-4 bg-white/5 p-4 border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-mono font-black text-white/50 tracking-widest block uppercase">[ STREAM CONTROL DECK ]</span>
            
            {/* Studio selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-white/40 uppercase block">Cam Source</label>
              <div className="grid grid-cols-1 gap-1">
                {(['ndsm', 'wisseloord', 'qfactory'] as const).map((studio) => (
                  <button
                    key={studio}
                    type="button"
                    onClick={() => {
                      setSelectedStudio(studio);
                      setIsPlaying(true);
                    }}
                    className={`px-2.5 py-1.5 text-[9.5px] font-mono text-left uppercase font-bold transition rounded-none border ${
                      selectedStudio === studio 
                        ? 'bg-white/10 border-brand-accent text-white' 
                        : 'bg-black border-transparent text-white/40 hover:text-white/80'
                    }`}
                  >
                    {studio === 'ndsm' && '⚓ NDSM Container #4B'}
                    {studio === 'wisseloord' && '🎹 Wisseloord Live Room'}
                    {studio === 'qfactory' && '⚡ Q-Factory Stage A'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-white/40 uppercase block">Video Spectrum Sensor</label>
              <div className="grid grid-cols-3 gap-1">
                {(['rgb', 'cyan', 'night', 'thermal', 'golden'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-1.5 py-1 text-[8.5px] font-mono uppercase text-center font-bold truncate rounded-none border ${
                      filterMode === mode 
                        ? 'bg-brand-accent text-black border-brand-accent' 
                        : 'bg-black text-white/55 border-white/10 hover:border-white/30'
                    }`}
                    title={`${mode.toUpperCase()} Sensor Channel`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            {/* Action buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-1.5 px-2 font-mono text-[9px] uppercase font-black transition flex items-center justify-center gap-1 border cursor-pointer ${
                  isPlaying 
                    ? 'bg-red-950/40 text-red-400 border-red-500/20 hover:bg-red-900/30' 
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/30'
                }`}
              >
                {isPlaying ? <Pause className="w-3" /> : <Play className="w-3" />}
                <span>{isPlaying ? 'Pause Feed' : 'Go Live'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMic}
                className={`px-3 py-1.5 font-mono text-[9px] uppercase transition flex items-center justify-center gap-1 border cursor-pointer ${
                  micActive 
                    ? 'bg-brand-accent text-black font-extrabold border-brand-accent' 
                    : 'bg-black text-white/50 border-white/15'
                }`}
                title={micActive ? "Mute Simulated Talkback Mic" : "Open Local Talkback Microphone Simulation"}
              >
                <Mic className="w-3" />
                <span>{micActive ? 'Active' : 'Mic'}</span>
              </button>
            </div>

            <div className="p-2 bg-black border border-white/5 text-[9px] text-white/50 space-y-1">
              <div className="flex justify-between font-mono">
                <span>Talkback Audio:</span>
                <span className={micActive ? "text-brand-accent font-bold" : "text-white/30"}>
                  {micActive ? 'WARPED SIGNAL (2x SPEED)' : 'MUTED STANDBY'}
                </span>
              </div>
              <div className="h-1 bg-neutral-900 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-300 ${micActive ? 'bg-brand-accent' : 'bg-white/10'}`} 
                  style={{ width: micActive ? `${inputLevel}%` : '4%' }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
