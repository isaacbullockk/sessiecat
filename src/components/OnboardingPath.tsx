import React, { useState } from 'react';
import { 
  Check, 
  HelpCircle, 
  User, 
  Sparkles,
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
  const [sessionistChecklist, setSessionistChecklist] = useState([
    { id: 's1', text: 'Selecteer je instrumenten & speelstijlen', checked: true },
    { id: 's2', text: 'Stel je officiële Pop-CAO gage & tariefkaart in', checked: false },
    { id: 's3', text: 'Zet je beschikbaarheid & 24u-opties open voor boekers', checked: false },
    { id: 's4', text: 'Koppel je audio- & videosamples voor directe screening', checked: false },
    { id: 's5', text: 'Bekijk openstaande gigs en reageer met één klik', checked: false }
  ]);

  const [managerChecklist, setManagerChecklist] = useState([
    { id: 'm1', text: 'Definieer je tour- of showplanning & speeldata', checked: true },
    { id: 'm2', text: 'Stel budget per bezetting in (drums, bas, toetsen)', checked: false },
    { id: 'm3', text: 'Leg 24-uurs opties vast bij geverifieerde sessiecats', checked: false },
    { id: 'm4', text: 'Controleer Pop-CAO fair pay & escrow borging', checked: false },
    { id: 'm5', text: 'Deel de digitale callsheet & backlinelijst met de crew', checked: false }
  ]);

  const [organizerChecklist, setOrganizerChecklist] = useState([
    { id: 'o1', text: 'Publiceer je jam- of theaterproductie op het overzicht', checked: true },
    { id: 'o2', text: 'Configureer backline & zaalspecificaties', checked: false },
    { id: 'o3', text: 'Filter muzikanten op instrument, gage en reactietijd', checked: false },
    { id: 'o4', text: 'Plan repetities en leg speeldata direct digitaal vast', checked: false },
    { id: 'o5', text: 'Beheer aanmeldingen en bevestig sessies via WhatsApp', checked: false }
  ]);

  const [allRounderChecklist, setAllRounderChecklist] = useState([
    { id: 'ar1', text: 'Stel je tarief- en vaardighedenprofiel compleet in', checked: true },
    { id: 'ar2', text: 'Activeer zowel boeker- als speelmodules', checked: false },
    { id: 'ar3', text: 'Koppel je facturatie- & bankgegevens voor uitbetaling', checked: false },
    { id: 'ar4', text: 'Ontvang en beheer simultaan aanvragen en boekingen', checked: false }
  ]);

  const [investorChecklist, setInvestorChecklist] = useState([
    { id: 'i1', text: 'Bekijk het live muziek-ecosysteem en transactieflow', checked: true },
    { id: 'i2', text: 'Analyseer Pop-CAO escrow contracten & uitbetalingen', checked: false },
    { id: 'i3', text: 'Verken marktwaarde en schaalbaarheid van Sessiecat', checked: false }
  ]);

  const [tipMessage, setTipMessage] = useState<string | null>(null);

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
    if (onboardingPath === 'sessionist') return sessionistChecklist;
    if (onboardingPath === 'touring_manager') return managerChecklist;
    if (onboardingPath === 'jam_organizer') return organizerChecklist;
    if (onboardingPath === 'all_rounder') return allRounderChecklist;
    return investorChecklist;
  };

  const handleQuickAction = (actionId: string) => {
    setTipMessage(null);
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
        setTipMessage("Tip: Pas je gage en beschikbaarheid aan onder Profiel Instellingen!");
        setCurrentActiveTab('settings');
      } else if (actionId === 's4') {
        setCurrentActiveTab('settings');
      } else {
        setCurrentActiveTab('jams');
      }
    }
  };

  const completedCount = getActiveChecklist().filter(i => i.checked).length;
  const progressPercent = Math.round((completedCount / getActiveChecklist().length) * 100);

  return (
    <div className="bg-black/60 border border-white/10 p-6 space-y-6 rounded-xl">
      {/* Selector Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#D1FF26] uppercase tracking-widest font-black block mb-1">
            ⚡ interactieve checklist & onboarding
          </span>
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            Wat is jouw rol in het muziekveld?
          </h3>
          <p className="text-xs text-white/60">
            Kies jouw focus om direct de juiste tools, stappen en tarieven te activeren.
          </p>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex flex-wrap bg-neutral-900 border border-white/10 p-1 rounded-lg gap-1">
          <button
            onClick={() => setOnboardingPath('sessionist')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded ${
              onboardingPath === 'sessionist' ? 'bg-[#D1FF26] text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            🎸 Muzikant (Ik wil spelen)
          </button>
          <button
            onClick={() => setOnboardingPath('touring_manager')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded ${
              onboardingPath === 'touring_manager' ? 'bg-[#D1FF26] text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            🚐 Bandleider / Boeker
          </button>
          <button
            onClick={() => setOnboardingPath('jam_organizer')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded ${
              onboardingPath === 'jam_organizer' ? 'bg-[#D1FF26] text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            🎪 Zaal / Organisatie
          </button>
          <button
            onClick={() => setOnboardingPath('all_rounder')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded ${
              onboardingPath === 'all_rounder' ? 'bg-[#D1FF26] text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            ⚡ Allround
          </button>
          <button
            onClick={() => setOnboardingPath('investor')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-extrabold transition cursor-pointer rounded ${
              onboardingPath === 'investor' ? 'bg-[#D1FF26] text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            📊 Partner
          </button>
        </div>
      </div>

      {tipMessage && (
        <div className="bg-[#D1FF26]/10 border border-[#D1FF26]/30 text-[#D1FF26] p-3 text-xs font-mono font-bold rounded-lg animate-fade-in flex items-center justify-between">
          <span>{tipMessage}</span>
          <button onClick={() => setTipMessage(null)} className="text-white/60 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      {/* Main Checklist card split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 cols: Guided "Start Here" checklist */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider font-bold">
              [ STAPPENPLAN • {progressPercent}% VOLTOOID ]
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
                className={`flex items-center gap-3.5 p-3.5 border transition cursor-pointer select-none rounded-lg ${
                  item.checked 
                    ? 'bg-[#D1FF26]/10 border-[#D1FF26]/30 text-white/80' 
                    : 'bg-black/50 border-white/10 text-white hover:border-white/30'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  item.checked ? 'bg-[#D1FF26] border-[#D1FF26] text-black' : 'border-white/30 bg-black/60'
                }`}>
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs ${item.checked ? 'line-through text-white/40' : 'text-white/90'}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 col: Smart helper card & Quick actions */}
        <div className="bg-black/50 border border-white/10 p-5 flex flex-col justify-between space-y-4 rounded-lg">
          <div>
            <span className="text-[10px] font-mono text-[#D1FF26] uppercase block font-black mb-2">[ DIRECTE TIP ]</span>
            
            {onboardingPath === 'sessionist' && (
              <div className="space-y-2 text-xs text-white/70 leading-relaxed font-normal">
                <p><strong>Welkom muzikant!</strong> Stel direct je minimale gage in volgens de Pop-CAO. Boekers kunnen je dan met 24-uurs optie reserveren zonder dat je gratis je agenda hoeft vast te houden.</p>
              </div>
            )}

            {onboardingPath === 'touring_manager' && (
              <div className="space-y-2 text-xs text-white/70 leading-relaxed font-normal">
                <p><strong>Welkom bandleider!</strong> Vind binnen 5 minuten geverifieerde sessiemuzikanten voor je tour of optreden. Zet 24-uurs opties vast met CAO-borging.</p>
              </div>
            )}
            
            {onboardingPath === 'jam_organizer' && (
              <div className="space-y-2 text-xs text-white/70 leading-relaxed font-normal">
                <p><strong>Welkom organisator!</strong> Plaats openstaande sessies of jamsessies en vul open plekken razendsnel in met lokale topspelers.</p>
              </div>
            )}

            {onboardingPath === 'all_rounder' && (
              <div className="space-y-2 text-xs text-white/70 leading-relaxed font-normal">
                <p><strong>Welkom!</strong> Je hebt volledige toegang: reageer op gigs als muzikant én plaats oproepen als boeker.</p>
              </div>
            )}

            {onboardingPath === 'investor' && (
              <div className="space-y-2 text-xs text-white/70 leading-relaxed font-normal">
                <p><strong>Welkom partner!</strong> Bekijk hoe Sessiecat het live muziekeiland in Nederland professionaliseert met escrow en automatische CAO-verrekening.</p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[8.5px] font-mono text-white/40 uppercase tracking-widest block font-bold">SNELLE ACTIES:</span>
            
            <div className="grid grid-cols-1 gap-2 font-mono text-[9px] font-black uppercase">
              {onboardingPath === 'sessionist' ? (
                <>
                  <button onClick={() => handleQuickAction('s2')} className="w-full text-left p-2.5 border border-white/10 hover:border-[#D1FF26] bg-[#D1FF26]/10 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer rounded">
                    1. GAGE & PROFIEL INSTELLEN →
                  </button>
                  <button onClick={() => handleQuickAction('s5')} className="w-full text-left p-2.5 border border-white/10 hover:border-white bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer rounded">
                    2. BEKIJK ACTIEVE GIGS →
                  </button>
                </>
              ) : onboardingPath === 'touring_manager' ? (
                <>
                  <button onClick={() => handleQuickAction('m2')} className="w-full text-left p-2.5 border border-white/10 hover:border-[#AC6CFF] bg-[#AC6CFF]/10 hover:bg-black text-[#AC6CFF] transition-colors cursor-pointer rounded">
                    1. ROLBUDGETTEN BEPALEN →
                  </button>
                  <button onClick={() => handleQuickAction('m3')} className="w-full text-left p-2.5 border border-white/10 hover:border-brand-accent bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer rounded">
                    2. MUZIKANTEN VASTLEGGEN →
                  </button>
                </>
              ) : onboardingPath === 'jam_organizer' ? (
                <>
                  <button onClick={() => handleQuickAction('o3')} className="w-full text-left p-2.5 border border-white/10 hover:border-[#D1FF26] bg-[#D1FF26]/10 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer rounded">
                    1. MUZIKANTEN ZOEKEN →
                  </button>
                  <button onClick={() => handleQuickAction('o4')} className="w-full text-left p-2.5 border border-white/10 hover:border-white bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer rounded">
                    2. REPETITIE PLANNING →
                  </button>
                </>
              ) : onboardingPath === 'all_rounder' ? (
                <>
                  <button onClick={() => handleQuickAction('ar2')} className="w-full text-left p-2.5 border border-white/10 hover:border-brand-accent bg-brand-accent/10 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer rounded">
                    1. NIEUWE TOUR AANMAKEN →
                  </button>
                  <button onClick={() => handleQuickAction('ar3')} className="w-full text-left p-2.5 border border-white/10 hover:border-white bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer rounded">
                    2. ALLE GIGS DOORZOEKEN →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleQuickAction('i2')} className="w-full text-left p-2.5 border border-white/10 hover:border-brand-accent bg-brand-accent/10 hover:bg-black text-[#D1FF26] transition-colors cursor-pointer rounded">
                    1. TRANSACTIE ENGINE BEKIJKEN →
                  </button>
                  <button onClick={() => handleQuickAction('i3')} className="w-full text-left p-2.5 border border-white/10 hover:border-white bg-black hover:bg-white/10 text-white/80 transition-colors cursor-pointer rounded">
                    2. EVENEMENTEN OVERZICHT →
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
