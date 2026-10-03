import React, { useState } from "react";
import {
  Compass,
  Radio,
  Briefcase,
  Target,
  Menu,
  X,
  Users,
  Lock,
  Search,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Euro,
  Eye,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  ChevronRight,
  Globe,
} from "lucide-react";
import { SessiecatLogo } from "./SessiecatLogo";
import { LanguageToggle } from "./LanguageToggle";
import { Artist, TourEvent } from "../types";

interface MobileNavigationProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
  viewMode: "hire" | "work";
  onToggleViewMode: (mode: "hire" | "work") => void;
  myArtistProfile: Artist | null;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
  onLogout: () => void;
  toursCount: number;
  holdsCount: number;
}

export function MobileNavigation({
  currentTab,
  onNavigate,
  viewMode,
  onToggleViewMode,
  myArtistProfile,
  onOpenProfile,
  onOpenInvite,
  onLogout,
  toursCount,
  holdsCount,
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const primaryTabs: NavItem[] = [
    { id: "dashboard", label: "Overzicht ⚡", icon: Compass },
    { id: "jams", label: "Gigs 🎪", icon: Target },
    { id: "holds", label: "24u Opties ⏱️", icon: Lock, count: holdsCount },
    { id: "tours", label: "Tours 🚐", icon: Briefcase, count: toursCount },
  ];

  const secondaryModules: NavItem[] = [
    { id: "artists", label: "Muzikanten Zoeken 🎸", icon: Users },
    { id: "contracts", label: "Pop-CAO & Escrow 💶", icon: ShieldCheck },
    { id: "rehearsals", label: "Repetities Hub 🥁", icon: Calendar },
    { id: "finance", label: "Gage & Betaling 📊", icon: Euro },
    { id: "gear", label: "Gear & Reparaties 🔌", icon: ShoppingBag },
    { id: "leadScraper", label: "Zalen & Boekers 🔍", icon: Search },
    { id: "visitors", label: "Bezoekersgids 🐱", icon: Eye },
    { id: "settings", label: "Chat & Berichten 💬", icon: Settings },
  ];

  return (
    <>
      {/* Slide-up Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm sm:hidden animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-[#121212] border-t border-white/15 rounded-t-3xl p-5 pb-safe max-h-[85vh] overflow-y-auto z-10 shadow-2xl space-y-5 animate-slide-up">
            {/* Header bar of drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SessiecatLogo size="sm" />
                <span className="text-xs font-mono font-bold tracking-widest text-brand-accent uppercase">
                  Mobile Hub
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Role Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                Workspace Mode
              </label>
              <div className="grid grid-cols-2 bg-white/5 p-1 border border-white/10 rounded-lg gap-1">
                <button
                  onClick={() => {
                    onToggleViewMode("hire");
                    setIsMenuOpen(false);
                  }}
                  className={`py-2 text-[11px] font-mono uppercase font-bold tracking-wider rounded transition-colors ${
                    viewMode === "hire"
                      ? "bg-brand-accent text-black font-black shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Find Sessiecats
                </button>
                <button
                  onClick={() => {
                    onToggleViewMode("work");
                    setIsMenuOpen(false);
                  }}
                  className={`py-2 text-[11px] font-mono uppercase font-bold tracking-wider rounded transition-colors ${
                    viewMode === "work"
                      ? "bg-brand-accent text-black font-black shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Find Gigs / Dep
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenProfile();
                }}
                className="flex items-center justify-center gap-2 bg-[#D1FF26] text-black font-mono font-black text-[11px] uppercase tracking-wider py-3 px-3 rounded-lg shadow-sm cursor-pointer"
              >
                {myArtistProfile ? (
                  <>
                    <Settings className="w-4 h-4" />
                    <span>My Profile</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Listing</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenInvite();
                }}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-mono font-bold text-[11px] uppercase tracking-wider py-3 px-3 rounded-lg border border-white/15 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Invite Band</span>
              </button>
            </div>

            {/* All Workspaces Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                Workspaces & Modules
              </label>
              <div className="grid grid-cols-2 gap-2">
                {secondaryModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = currentTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onNavigate(mod.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isActive
                          ? "bg-brand-accent/20 border-brand-accent text-brand-accent font-bold"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="text-xs truncate font-medium">{mod.label}</span>
                      </div>
                      {mod.count !== undefined && mod.count > 0 && (
                        <span className="text-[9px] bg-brand-accent text-black font-black px-1.5 py-0.5 rounded-full shrink-0">
                          {mod.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Utilities */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LanguageToggle />
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar for Mobile Phones */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-white/15 px-2 pt-2 sm:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer rounded-lg ${
                  isActive
                    ? "text-[#D1FF26]"
                    : "text-white/50 hover:text-white/80 active:scale-95"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                    }`}
                  />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#D1FF26] text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9.5px] font-mono tracking-tight mt-1 truncate max-w-full ${
                    isActive ? "font-bold text-[#D1FF26]" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-[#D1FF26] rounded-full" />
                )}
              </button>
            );
          })}

          {/* More / Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer rounded-lg ${
              isMenuOpen
                ? "text-brand-accent"
                : "text-white/50 hover:text-white/80 active:scale-95"
            }`}
          >
            <div className="relative">
              <Menu
                className={`w-5 h-5 transition-transform ${
                  isMenuOpen ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                }`}
              />
              {holdsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-accent text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {holdsCount}
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-mono tracking-tight mt-1 font-medium">
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
