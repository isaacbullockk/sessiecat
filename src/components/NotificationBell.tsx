import React, { useState, useEffect } from "react";
import { Bell, Activity, Play, Square, Settings, CheckCircle, Search } from "lucide-react";
import { getAccessToken, db } from "../utils/firebaseAuth";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface AIAlert {
  id: string;
  timestamp: Date;
  message: string;
  links: string[];
  read: boolean;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [instrument, setInstrument] = useState("Drummer");
  const [location, setLocation] = useState("London");
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    if (isActive) {
      setIsScanning(true);
      // Real-time WebSocket Firebase Push instead of network polling
      const q = query(collection(db, "radar_alerts"), orderBy("timestamp", "desc"), limit(20));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setIsScanning(false);
        const fetchedAlerts: AIAlert[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedAlerts.push({
            id: doc.id,
            timestamp: data.timestamp?.toDate() || new Date(),
            message: data.message || "",
            links: data.links || [],
            read: data.read || false,
          });
        });
        setAlerts(fetchedAlerts);
        
        // Only keep the 'scanning' status active while it's fetching initial chunk
      }, (error) => {
        console.error("WebSocket Alert sync failed", error);
        setIsScanning(false);
      });

      return () => unsubscribe();
    } else {
      setIsScanning(false);
    }
  }, [isActive]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && showSettings) setShowSettings(false);
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={toggleOpen}
        className="relative p-2 text-white/70 hover:text-white transition-colors rounded-none"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-brand-accent animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-[#0A0A0A]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[340px] sm:w-[420px] bg-[#141414] border border-white/10 shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black">
            <div className="flex items-center gap-2">
              <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest font-black flex items-center gap-1.5">
                <Activity className={`w-3 h-3 ${isActive ? "animate-pulse" : ""}`} />
                <span>AI Live Radar</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[10px] uppercase font-mono text-white/40 hover:text-white flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark Read
                </button>
              )}
              <button onClick={() => setShowSettings(!showSettings)} className="text-white/40 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-white/5 border-b border-white/10 space-y-4 font-mono">
              <h4 className="text-[10px] text-white/40 uppercase tracking-widest">Radar Configuration</h4>
              <div className="space-y-3 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Instrument / Role</label>
                  <input 
                    type="text" 
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                    placeholder="e.g. Drummer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70">Location / City</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                    placeholder="e.g. London"
                  />
                </div>
                
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 p-3 border transition-colors ${
                    isActive 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                      : 'bg-brand-accent hover:bg-[#bce620] border-brand-accent text-black'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      Deactivate Radar
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      Activate Radar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-0">
             {!isActive && alerts.length === 0 && !showSettings && (
               <div className="p-8 text-center space-y-3">
                 <Search className="w-8 h-8 text-white/20 mx-auto" />
                 <p className="text-sm text-white/40 font-light">AI Radar is inactive. Open settings to configure and start real-time gig scraping.</p>
               </div>
             )}

             {isScanning && alerts.length === 0 && (
               <div className="p-8 text-center space-y-3">
                 <Activity className="w-8 h-8 text-brand-accent animate-spin mx-auto" />
                 <p className="text-sm font-mono text-brand-accent uppercase tracking-widest animate-pulse">Establishing Intel Link...</p>
                 <p className="text-xs text-white/40">Scraping global venues for {instrument} in {location}</p>
               </div>
             )}

             <div className="divide-y divide-white/5">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 transition-colors ${alert.read ? "bg-transparent opacity-70" : "bg-brand-accent/5"}`}
                    onClick={() => {
                       // Mark read on click
                       setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
                    }}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest font-black">
                           New Opportunity Detected
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                           {alert.timestamp.toLocaleTimeString()}
                        </span>
                     </div>
                     <div className="text-xs text-white/80 font-sans leading-relaxed line-clamp-3 mb-2">
                        {/* Strip markdown for concise preview */}
                        {alert.message.replace(/[*#_`]/g, '')}
                     </div>
                     
                     {alert.links.length > 0 && (
                       <div className="flex flex-wrap gap-1.5 mt-3">
                          {alert.links.slice(0, 2).map((link, i) => (
                             <a 
                               key={i}
                               href={link}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={(e) => e.stopPropagation()}
                               className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-brand-accent text-[9px] font-mono uppercase truncate max-w-[120px]"
                             >
                               {new URL(link).hostname}
                             </a>
                          ))}
                          {alert.links.length > 2 && (
                            <span className="px-2 py-1 bg-transparent text-white/40 text-[9px] font-mono">+{alert.links.length - 2} more</span>
                          )}
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
          
          {/* Status Footer */}
          {isActive && (
            <div className="p-2 border-t border-white/10 bg-black flex items-center justify-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
               <span className="text-[9px] font-mono text-brand-accent uppercase tracking-widest">
                  {isScanning ? "Scraping Data Space..." : "Monitoring Active"}
               </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
