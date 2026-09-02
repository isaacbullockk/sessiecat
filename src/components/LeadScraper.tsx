import React, { useState } from 'react';
import { Search, MapPin, SearchCheck, ExternalLink, Activity } from 'lucide-react';
import { getAccessToken } from '../utils/firebaseAuth';
import Markdown from 'react-markdown';

export const LeadScraper: React.FC = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"both" | "gigs" | "people">("both");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult("");
    setLinks([]);
    setErrorMsg("");

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Must be logged in");
      }

      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, type })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResult(data.result);
      setLinks(data.links || []);
    } catch(err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not retrieve leads.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#111111] border border-white/5 shadow-2xl p-6 lg:p-8 space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-[#D1FF26]/10 border border-[#D1FF26]/30 text-[#D1FF26] text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest font-black flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Deep Web Scraping Module</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white font-sans flex items-center gap-3">
            <Search className="w-6 h-6 text-brand-accent shrink-0" />
            <span>Active Lead Generation</span>
          </h2>
          <p className="text-white/60 text-sm font-light leading-relaxed max-w-3xl">
            Input a location or genre, and our AI will actively scrape the internet to find real gigs and booking contacts. 
          </p>
        </div>

        <div className="p-4 border border-white/10 bg-black/40 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
              <input 
                 type="text"
                 value={query}
                 onChange={e => setQuery(e.target.value)}
                 placeholder="e.g. Jazz clubs in Amsterdam..."
                 className="w-full bg-white/5 border border-white/10 p-3.5 text-sm text-white focus:outline-none focus:border-brand-accent/50 font-mono"
                 onKeyDown={(e) => {
                     if (e.key === 'Enter') handleSearch();
                 }}
              />
              <select 
                 value={type}
                 onChange={(e: any) => setType(e.target.value)}
                 className="w-full bg-[#111] border border-white/10 p-3.5 text-sm text-white focus:outline-none focus:border-brand-accent/50 font-mono appearance-none"
              >
                  <option value="both">Gigs & Contacts</option>
                  <option value="gigs">Gigs / Venues only</option>
                  <option value="people">Booking Agents only</option>
              </select>
           </div>
           
           <button 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-brand-accent hover:bg-[#bce620] text-black w-full md:w-auto font-mono font-black uppercase tracking-widest text-xs px-6 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
              {loading ? (
                 <>
                   <Activity className="w-4 h-4 animate-spin" />
                   <span>Scraping the Web...</span>
                 </>
              ) : (
                 <>
                   <SearchCheck className="w-4 h-4" />
                   <span>Commence Scrape</span>
                 </>
              )}
           </button>
        </div>

        {errorMsg && (
           <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 font-mono text-xs">
              {errorMsg}
           </div>
        )}

        {result && (
           <div className="border border-white/10 bg-black/60 p-6 space-y-6 animate-fade-in relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="font-mono text-[#D1FF26] text-xs uppercase tracking-widest font-black">
                    Analysis Report
                 </h3>
                 <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                    Google Grounding Active
                 </span>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none text-white/80 font-sans leading-relaxed
                  prose-headings:text-white prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider
                  prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-bold">
                 <Markdown>{result}</Markdown>
              </div>

              {links.length > 0 && (
                 <div className="pt-6 border-t border-white/10 space-y-3">
                    <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Direct Source Links</h4>
                    <div className="flex flex-wrap gap-2">
                       {links.map((link, i) => (
                           <a 
                             key={i} 
                             href={link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-brand-accent text-[10px] font-mono whitespace-nowrap transition-colors"
                           >
                              <span className="truncate max-w-[250px]">{new URL(link).hostname}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                           </a>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};
