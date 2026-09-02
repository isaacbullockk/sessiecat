import React, { useState } from 'react';
import { Play, Database, Trash2, Settings, X, Loader2, Users, CheckCircle2 } from 'lucide-react';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseAuth';
import { INITIAL_ARTISTS, INITIAL_BOOKINGS, INITIAL_GIGS } from '../mockData';

export function DemoTools({ onClose }: { onClose: () => void }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleSeedData = async () => {
    setLoadingAction('seed');
    try {
      const batch = writeBatch(db);
      
      // Artists
      INITIAL_ARTISTS.forEach((a) => {
        batch.set(doc(db, "artists", a.id), a);
      });
      // Gigs
      INITIAL_GIGS.forEach((g) => {
        batch.set(doc(db, "gigs", g.id), g);
      });
      // Bookings
      INITIAL_BOOKINGS.forEach((b) => {
        batch.set(doc(db, "bookings", b.id), b);
      });

      // Dummy Tours for Martijn demo
      const demoTourId = "demo_tour_martijn";
      batch.set(doc(db, "tours", demoTourId), {
        id: demoTourId,
        name: "European Fall Tour 2026",
        artistName: "The Midnight Echoes",
        status: "planning",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        budget: 15000,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      await batch.commit();
      alert("✅ Demo data successfully seeded!");
    } catch (err: any) {
      alert("Error seeding data: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateAcceptance = async () => {
    setLoadingAction('simulate');
    try {
      const bookingsRef = collection(db, "bookings");
      const snap = await getDocs(bookingsRef);
      const batch = writeBatch(db);
      let count = 0;

      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === "held") {
          batch.update(docSnap.ref, { status: "confirmed", updatedAt: Date.now() });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`✅ Automatically accepted ${count} pending holds!`);
      } else {
        alert("No pending holds to accept.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure? This will delete ALL artists, tours, gigs, and bookings from the database!")) return;
    setLoadingAction('clear');
    try {
      const collections = ["artists", "tours", "gigs", "bookings", "chats", "events"];
      
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        snap.docs.forEach(d => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }
      
      alert("🗑️ Database wiped clean!");
    } catch (err: any) {
      alert("Error clearing data: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-2xl">
      <div className="bg-neutral-900 border border-[#D1FF26]/30 p-4 w-72 flex flex-col gap-4 shadow-[0_0_30px_rgba(209,255,38,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D1FF26] to-[#AC6CFF]" />
        
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#D1FF26] flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Demo Controls
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Action 1: Seed Data */}
          <button
            disabled={loadingAction !== null}
            onClick={handleSeedData}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider py-2.5 px-3 flex items-center gap-3 transition-colors text-left disabled:opacity-50"
          >
            {loadingAction === 'seed' ? <Loader2 className="w-4 h-4 animate-spin text-[#D1FF26]" /> : <Database className="w-4 h-4 text-[#D1FF26]" />}
            1. Populate Mock Data
          </button>

          {/* Action 2: Simulate Accept */}
          <button
            disabled={loadingAction !== null}
            onClick={handleSimulateAcceptance}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider py-2.5 px-3 flex items-center gap-3 transition-colors text-left disabled:opacity-50"
          >
            {loadingAction === 'simulate' ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            2. Auto-Accept All Holds
          </button>

          {/* Action 3: Clear Data */}
          <button
            disabled={loadingAction !== null}
            onClick={handleClearData}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-white font-mono text-[10px] uppercase tracking-wider py-2.5 px-3 flex items-center gap-3 transition-colors text-left disabled:opacity-50"
          >
            {loadingAction === 'clear' ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
            3. Reset / Wipe Database
          </button>
        </div>
        
        <p className="text-[9px] text-white/30 font-mono text-center leading-tight">
          Use these to instantly set up a demo scenario for Martijn.
        </p>
      </div>
    </div>
  );
}
