import React, { useState } from 'react';
import { 
  Compass, 
  Check, 
  HelpCircle, 
  User, 
  TrendingUp, 
  Grid, 
  Sliders, 
  Calendar, 
  ShieldCheck, 
  Unlock 
} from 'lucide-react';

interface OnboardingPathProps {
  onboardingPath: 'touring_manager' | 'jam_organizer' | 'sessionist' | 'all_rounder' | 'investor';
  setOnboardingPath: (path: 'touring_manager' | 'jam_organizer' | 'sessionist' | 'all_rounder' | 'investor') => void;
  setCurrentActiveTab: (tab: string) => void;
}

export function OnboardingPath({
  onboardingPath,
  setOnboardingPath,
  setCurrentActiveTab
}: OnboardingPathProps) {
  // Checklists based on onboarding path selection
  const [managerChecklist, setManagerChecklist] = useState([
    { id: 'm1', text: 'Define Tour Workspace & Event details', checked: true },
    { id: 'm2', text: 'Establish target show budgets per role', checked: false },
    { id: 'm3', text: 'Select session specialists & place exclusive Rate Holds', checked: false },
    { id: 'm4', text: 'Validate Popmuziek CAO union fair pay status', checked: false },
    { id: 'm5', text: 'Activate legal songwriter IP protective shield', checked: false }
  ]);

  const [organizerChecklist, setOrganizerChecklist] = useState([
    { id: 'o1', text: 'Publish open Jam session or Theater dates on directory', checked: true },
    { id: 'o2', text: 'Configure local rotational back-line or pit orchestra setup specs', checked: false },
    { id: 'o3', text: 'Filter artists by lowest rate and fast reply score', checked: false },
    { id: 'o4', text: 'Authorize digital rehearsal planners', checked: false },
    { id: 'o5', text: 'Sync security vault backup logs to Google Drive', checked: false }
  ]);

  const [sessionistChecklist, setSessionistChecklist] = useState([
    { id: 's1', text: 'Declare your primary instrument and styles', checked: true },
    { id: 's2', text: 'Set up your definitive show and rehearsal Rate Card', checked: false },
    { id: 's3', text: 'Configure emergency rush and minimum booking fees', checked: false },
    { id: 's4', text: 'Upload 3 high-contrast audio portfolio samples', checked: false },
    { id: 's5', text: 'Set your standby calendar and transport locks', checked: false }
  ]);

  const [allRounderChecklist, setAllRounderChecklist] = useState([
    { id: 'ar1', text: 'Configure comprehensive Rate & Skill Card', checked: true },
    { id: 'ar2', text: 'Initialize tour management hub & gig boards', checked: false },
    { id: 'ar3', text: 'Setup global payment settings', checked: false },
    { id: 'ar4', text: 'Build universal shortlists & review portfolio', checked: false }
  ]);

  const [investorChecklist, setInvestorChecklist] = useState([
    { id: 'i1', text: 'Review live music ecosystem workflows', checked: true },
    { id: 'i2', text: 'Analyze transaction routing mechanisms', checked: false },
    { id: 'i3', text: 'Explore platform value proposition metrics', checked: false }
  ]);

  const handleToggleCheck = (path: 'manager' | 'organizer' | 'sessionist' | 'all_rounder' | 'investor', id: string) => {
    if (path === 'manager') {
      setManagerChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    } else if (path === 'organizer') {
      setOrganizerChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    } else if (path === 'sessionist') {
      setSessionistChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    } else if (path === 'investor') {
      setInvestorChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    } else {
      setAllRounderChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }
  };

  const getActiveChecklist = () => {
    if (onboardingPath === 'touring_manager') return managerChecklist;
    if (onboardingPath === 'jam_organizer') return organizerChecklist;
    if (onboardingPath === 'all_rounder') return allRounderChecklist;
    if (onboardingPath === 'investor') return investorChecklist;
    return sessionistChecklist;
  };

  const handleQuickAction = (actionId: string) => {
    if (onboardingPath === 'touring_manager') {
      if (actionId === 'm2') setCurrentActiveTab('tours');
      else if (actionId === 'm3') setCurrentActiveTab('artists');
      else if (actionId === 'm4') setCurrentActiveTab('contracts');
      else setCurrentActiveTab('settings');
    } else if (onboardingPath === 'jam_organizer') {
      if (actionId === 'o3') setCurrentActiveTab('artists');
      else if (actionId === 'o4') setCurrentActiveTab('rehearsals');
      else setCurrentActiveTab('settings');
    } else if (onboardingPath === 'all_rounder') {
      if (actionId === 'ar2') setCurrentActiveTab('tours');
      else if (actionId === 'ar3') setCurrentActiveTab('settings');
      else setCurrentActiveTab('artists');
    } else if (onboardingPath === 'investor') {
      if (actionId === 'i2') setCurrentActiveTab('contracts');
      else setCurrentActiveTab('tours');
    } else {
      if (actionId === 's2' || actionId === 's3') {
        alert("Tip: Modify your Rate Card directly under your Profile Settings!");
        setCurrentActiveTab('settings');
      } else if (actionId === 's4') {
        setCurrentActiveTab('settings');
      } else {
        setCurrentActiveTab('settings');
      }
    }
  };

  const completedCount = getActiveChecklist().filter(i => i.checked).length;
  const progressPercent = Math.round((completedCount / getActiveChecklist().length) * 100);

  return (
    <div className="bg-black/55 border border-white/10 p-6 space-y-6">
      
      {/* Selector Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest font-black block mb-1">
            ⚡ interactive workspace onboarding
          </span>
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Select Your Workspace Focus
          </h3>
          <p className="text-xs text-white/50">Configure custom workflows and dashboard widgets dynamically by selecting your stakeholder role.</p>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex flex-wrap bg-black border border-white/10 p-1">
          <button
            onClick={() => setOnboardingPath('touring_manager')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded-none ${
              onboardingPath === 'touring_manager' ? 'bg-[#D1FF26] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Touring Manager
          </button>
          <button
            onClick={() => setOnboardingPath('jam_organizer')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded-none ${
              onboardingPath === 'jam_organizer' ? 'bg-[#D1FF26] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Theater / Jam Organizer
          </button>
          <button
            onClick={() => setOnboardingPath('sessionist')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded-none ${
              onboardingPath === 'sessionist' ? 'bg-[#D1FF26] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Sessionist (Artist)
          </button>
          <button
            onClick={() => setOnboardingPath('all_rounder')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded-none ${
              onboardingPath === 'all_rounder' ? 'bg-[#D1FF26] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            All-Rounder
          </button>
          <button
            onClick={() => setOnboardingPath('investor')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded-none ${
              onboardingPath === 'investor' ? 'bg-[#D1FF26] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Investor
          </button>
        </div>
      </div>

      {/* Main Checklist card split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Guided "Start Here" checklist */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">
              [ WORKSPACE CHECKLIST • {progressPercent}% COMPLETED ]
            </span>
          </div>

          <div className="space-y-2.5">
            {getActiveChecklist().map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleToggleCheck(
                  onboardingPath === 'touring_manager' ? 'manager' : onboardingPath === 'jam_organizer' ? 'organizer' : onboardingPath === 'all_rounder' ? 'all_rounder' : onboardingPath === 'investor' ? 'investor' : 'sessionist', 
                  item.id
                )}
                className={`flex items-center gap-3.5 p-3 border transition cursor-pointer select-none ${
                  item.checked 
                    ? 'bg-[#D1FF26]/5 border-[#D1FF26]/10 text-white/70' 
                    : 'bg-black/40 border-white/5 text-white hover:border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-none border flex items-center justify-center shrink-0 transition-colors ${
                  item.checked ? 'bg-[#D1FF26] border-[#D1FF26] text-black' : 'border-white/20 bg-black/50'
                }`}>
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs ${item.checked ? 'line-through text-white/40' : 'text-white/80'}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 col: Smart helper card & Quick actions */}
        <div className="bg-black/40 border border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase block font-black mb-2">[ GUIDE SUGGESTIONS ]</span>
            
            {onboardingPath === 'touring_manager' && (
              <div className="space-y-2 text-xs text-white/60 leading-relaxed font-light">
                <p>Welcome, Manager! We locked in pre-vetted Dutch CAO popmuziek sessionists.</p>
                <p>Your workspace is optimized for **48h full band locking**.</p>
              </div>
            )}
            
            {onboardingPath === 'jam_organizer' && (
              <div className="space-y-2 text-xs text-white/60 leading-relaxed font-light">
                <p>Hello Theater Maker / Organizer! Promote your local Amstel club jam session or theater production.</p>
                <p>Sort directory by **lowest rate** or **fastest reply** to assemble pit orchestras or rotational band sheets.</p>
              </div>
            )}

            {onboardingPath === 'sessionist' && (
              <div className="space-y-2 text-xs text-white/60 leading-relaxed font-light">
                <p>Hi Sessionist! Publish instrument-based show rates to receive instant client contracts automatically.</p>
              </div>
            )}

            {onboardingPath === 'all_rounder' && (
              <div className="space-y-2 text-xs text-white/60 leading-relaxed font-light">
                <p>Welcome, All-Rounder! You have access to every module: gig searching, event creation, and booking management.</p>
              </div>
            )}

            {onboardingPath === 'investor' && (
              <div className="space-y-2 text-xs text-white/60 leading-relaxed font-light">
                <p>Welcome, Investor! Please review the platform's robust feature set, transaction pipeline, and ecosystem scaling potential without needing an artist resume.</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[8.5px] font-mono text-white/40 uppercase tracking-widest block font-bold">NEXT DIRECT COMMANDS:</span>
            
            <div className="grid grid-cols-1 gap-1.5 font-mono text-[9px] font-black uppercase">
              {onboardingPath === 'touring_manager' ? (
                <>
                  <button onClick={() => handleQuickAction('m2')} className="w-full text-left p-2 border border-white/10 hover:border-brand-accent bg-[#AC6CFF]/5 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer">
                    1. ESTABLISH ROLE BUDGETS →
                  </button>
                  <button onClick={() => handleQuickAction('m3')} className="w-full text-left p-2 border border-white/10 hover:border-brand-accent bg-black hover:bg-white/5 text-white/80 transition-colors cursor-pointer">
                    2. BIND RATE HOLDS →
                  </button>
                </>
              ) : onboardingPath === 'jam_organizer' ? (
                <>
                  <button onClick={() => handleQuickAction('o3')} className="w-full text-left p-2 border border-white/10 hover:border-[#D1FF26] bg-[#D1FF26]/5 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer">
                    1. FIND LOW-PRICE ARTISTS →
                  </button>
                  <button onClick={() => handleQuickAction('o4')} className="w-full text-left p-2 border border-white/10 hover:border-white bg-black hover:bg-white/5 text-white/80 transition-colors cursor-pointer">
                    2. REHEARSAL PLANNING →
                  </button>
                </>
              ) : onboardingPath === 'all_rounder' ? (
                <>
                  <button onClick={() => handleQuickAction('ar2')} className="w-full text-left p-2 border border-white/10 hover:border-brand-accent bg-brand-accent/5 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer">
                    1. BUILD NEW TOUR →
                  </button>
                  <button onClick={() => handleQuickAction('ar3')} className="w-full text-left p-2 border border-white/10 hover:border-white bg-black hover:bg-white/5 text-white/80 transition-colors cursor-pointer">
                    2. BROWSE ALL GIGS →
                  </button>
                </>
              ) : onboardingPath === 'investor' ? (
                <>
                  <button onClick={() => handleQuickAction('i2')} className="w-full text-left p-2 border border-white/10 hover:border-brand-accent bg-brand-accent/5 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer">
                    1. VIEW TRANSACTION ENGINE →
                  </button>
                  <button onClick={() => handleQuickAction('i3')} className="w-full text-left p-2 border border-white/10 hover:border-white bg-black hover:bg-white/5 text-white/80 transition-colors cursor-pointer">
                    2. BROWSE EVENTS PIPELINE →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleQuickAction('s2')} className="w-full text-left p-2 border border-white/10 hover:border-brand-accent bg-brand-accent/5 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer">
                    1. CONFIGURE RATE CARD →
                  </button>
                  <button onClick={() => handleQuickAction('s4')} className="w-full text-left p-2 border border-white/10 hover:border-white bg-black hover:bg-white/5 text-white/80 transition-colors cursor-pointer">
                    2. UPLOAD AUDIO CLIPS →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
