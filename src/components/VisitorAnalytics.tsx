import React, { useEffect, useState } from 'react';
import { Eye, Users, RefreshCw, Download, Monitor, Smartphone, Globe, Search, Clock } from 'lucide-react';

export interface VisitorEntry {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  browser: string;
  device: string;
  path: string;
  referrer: string;
  userEmail?: string;
  userName?: string;
  language?: string;
}

interface VisitorData {
  metrics: {
    totalVisits: number;
    uniqueIps: number;
    identifiedUsers: number;
  };
  visitors: VisitorEntry[];
}

export const VisitorAnalytics: React.FC = () => {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visitors');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.error('Failed to fetch visitor logs:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 12000); // Auto refresh every 12 seconds
    return () => clearInterval(interval);
  }, []);

  const downloadCSV = () => {
    if (!data || !data.visitors.length) return;
    const headers = ['Timestamp', 'IP', 'Identity', 'Browser', 'Device', 'Path', 'Referrer'];
    const rows = data.visitors.map(v => [
      new Date(v.timestamp).toLocaleString(),
      v.ip,
      v.userName || v.userEmail || 'Anonymous',
      v.browser,
      v.device,
      v.path,
      v.referrer || 'Direct'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sessiecat_visitors_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVisitors = data?.visitors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.ip.toLowerCase().includes(q) ||
      v.browser.toLowerCase().includes(q) ||
      v.device.toLowerCase().includes(q) ||
      (v.userName && v.userName.toLowerCase().includes(q)) ||
      (v.userEmail && v.userEmail.toLowerCase().includes(q)) ||
      v.path.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs uppercase font-bold tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D1FF26] animate-ping" />
            Live Visitor Tracker & Traffic Logs
          </div>
          <h2 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
            <Eye className="w-8 h-8 text-[#D1FF26]" />
            Audience Traffic & Visitor Logs
          </h2>
          <p className="text-white/50 text-sm mt-1 max-w-2xl">
            Real-time breakdown of musicians, organizers, and guests accessing Sessiecat. Track IPs, devices, sessions, and active users in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchVisitors}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded font-mono text-xs uppercase font-bold text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D1FF26]' : ''}`} />
            Refresh Logs
          </button>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-[#D1FF26] text-black px-4 py-2.5 rounded font-mono text-xs uppercase font-bold hover:bg-[#bce61e] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-white/50 font-mono text-xs uppercase tracking-wider">Total App Visits</span>
            <Eye className="w-5 h-5 text-[#D1FF26]" />
          </div>
          <p className="text-4xl font-light font-mono text-white">
            {data?.metrics.totalVisits ?? 0}
          </p>
          <p className="text-xs text-white/40 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-[#D1FF26]" /> Updated {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-white/50 font-mono text-xs uppercase tracking-wider">Unique IP Addresses</span>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-light font-mono text-white">
            {data?.metrics.uniqueIps ?? 0}
          </p>
          <p className="text-xs text-white/40 font-mono">Distinct network sessions</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-white/50 font-mono text-xs uppercase tracking-wider">Identified Roster Users</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-light font-mono text-white">
            {data?.metrics.identifiedUsers ?? 0}
          </p>
          <p className="text-xs text-white/40 font-mono">Logged-in musicians & managers</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded">
        <Search className="w-4 h-4 text-white/40 ml-2" />
        <input
          type="text"
          placeholder="Search by IP, Browser, User Email, Device or Path..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white placeholder-white/30 w-full font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-white/40 hover:text-white text-xs font-mono uppercase px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Visitor Logs Table */}
      <div className="border border-white/10 rounded overflow-hidden bg-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-white/5 font-mono text-[11px] uppercase tracking-wider text-white/60 border-b border-white/10">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Visitor Identity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Device & Browser</th>
                <th className="p-4">Visited Tab</th>
                <th className="p-4">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-white/5 transition-colors font-mono text-xs">
                    <td className="p-4 whitespace-nowrap text-white/70">
                      {new Date(visitor.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {visitor.userName || visitor.userEmail ? (
                        <div>
                          <p className="font-bold text-white font-sans text-sm">{visitor.userName || 'Member'}</p>
                          <p className="text-[#D1FF26] text-[10px]">{visitor.userEmail}</p>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Guest Visitor</span>
                      )}
                    </td>
                    <td className="p-4 text-white/90">
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px]">
                        {visitor.ip}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {visitor.device === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span className="text-white/80">{visitor.browser}</span>
                        <span className="text-white/30 text-[10px]">({visitor.device})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                        {visitor.path}
                      </span>
                    </td>
                    <td className="p-4 text-white/50 truncate max-w-[150px]">
                      {visitor.referrer || 'Direct Entry'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40 font-mono text-xs">
                    {loading ? 'Fetching live visitor logs...' : 'No visitor records found matching your query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
