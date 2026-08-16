import React, { useState, useEffect } from 'react';
import { TourEvent, Artist, TourRoleRequirement, NegotiationStep, HoldDetails } from '../types';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar, 
  Lock, 
  ShieldAlert, 
  Check, 
  X, 
  MessageSquare, 
  ChevronRight, 
  Timer, 
  ArrowRight,
  UserCheck,
  Award,
  Sparkles,
  Send,
  Cpu,
  FileText,
  Share2,
  Bell,
  MapPin,
  Mail,
  Clock
} from 'lucide-react';
import { auth } from '../utils/firebaseAuth';
import { SafeImage } from './SafeImage';
import { db } from '../utils/firebaseAuth';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

interface TourWorkspaceProps {
  artists: Artist[];
  tours: TourEvent[];
  setTours: React.Dispatch<React.SetStateAction<TourEvent[]>>;
  onOpenArtists: () => void;
  onTriggerChat: (artist: Artist, draftText?: string) => void;
  setCurrentActiveTab: (tab: string) => void;
  selectedTourIdRoute?: string;
}

export function TourWorkspace({
  artists,
  tours,
  setTours,
  onOpenArtists,
  onTriggerChat,
  setCurrentActiveTab,
  selectedTourIdRoute
}: TourWorkspaceProps) {
  const [selectedTourId, setSelectedTourId] = useState<string>(selectedTourIdRoute || tours[0]?.id || '');

  useEffect(() => {
    if (selectedTourIdRoute) {
      setSelectedTourId(selectedTourIdRoute);
    }
  }, [selectedTourIdRoute]);
  
  // Creation modal states
  const [isCreatingTour, setIsCreatingTour] = useState(false);
  const [newTourName, setNewTourName] = useState('');
  const [newTourDesc, setNewTourDesc] = useState('');
  const [newTourStart, setNewTourStart] = useState('2026-06-01');
  const [newTourEnd, setNewTourEnd] = useState('2026-06-15');
  const [newTourBudget, setNewTourBudget] = useState(2400);
  const [tourTemplate, setTourTemplate] = useState<'standard' | 'mahler'>('standard');

  // Active role editing/negotiation overlay states
  const [activeRoleReqId, setActiveRoleReqId] = useState<string | null>(null);
  const [offerValue, setOfferValue] = useState<number>(400);
  const [offerRehearsal, setOfferRehearsal] = useState<number>(150);
  const [offerNote, setOfferNote] = useState('');

  // Call Sheet State Hooks
  const [csVenue, setCsVenue] = useState('Melkweg (Oude Zaal), Lijnbaansgracht 234A, Amsterdam');
  const [csDate, setCsDate] = useState('2026-06-12');
  const [csBandCall, setCsBandCall] = useState('16:00');
  const [csSoundcheck, setCsSoundcheck] = useState('17:00');
  const [csDoors, setCsDoors] = useState('19:30');
  const [csShowTime, setCsShowTime] = useState('20:30');
  const [csNotes, setCsNotes] = useState('Backstage load-in is located at the rear canal dock side. Strictly complies with CAO Popmuziek catering standards. Roster compliance forms are pre-locked in Workspace.');
  const [csEmergencyContact, setCsEmergencyContact] = useState('+31 6 4488 9911 (Tour Coordinator)');
  const [csShareUrl, setCsShareUrl] = useState('');
  const [csNotifySuccess, setCsNotifySuccess] = useState(false);
  const [csBroadcastLogs, setCsBroadcastLogs] = useState<string[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // AI Copilot State
  const [copilotExpanded, setCopilotExpanded] = useState(true);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    actions?: Array<{
      intent: 'build_roster' | 'shortlist_candidates' | 'place_holds' | 'draft_messages' | 'summarize_status';
      description: string;
      params?: any;
    }>;
  }>>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hey! I'm your grounded **Sessiecat AI Copilot**. I analyze this tour's budget and requirements to help match elite verified artists.\n\nAsk me to **'Build roster under budget'**, **'Suggest artists for open slots'** or **'Draft hold invitations'**."
    }
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Send Prompt to our proxy backend endpoint
  const handleSendCopilotPrompt = async (promptText: string) => {
    if (!promptText.trim() || !activeTour) return;

    const userMsg = {
      id: `cop_user_${Date.now()}`,
      sender: 'user' as const,
      text: promptText
    };

    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: promptText,
          tour: activeTour,
          artists: artists,
          history: copilotMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Copilot response error');
      }

      const data = await response.json();
      
      setCopilotMessages(prev => [...prev, {
        id: `cop_res_${Date.now()}`,
        sender: 'assistant',
        text: data.response,
        actions: data.actions
      }]);

    } catch (err) {
      console.error(err);
      setCopilotMessages(prev => [...prev, {
        id: `cop_err_${Date.now()}`,
        sender: 'assistant',
        text: "I experienced a connection issue loading Gemini's workspace models. However, you can manage and book available artists directly using our manual bid tools below!"
      }]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Place holds dynamically inside our local state engine
  const handleCopilotPlaceHold = async (artistId: string, roleName: string, rate: number) => {
    if (!activeTour) return;
    const artist = artists.find(m => m.id === artistId);
    if (!artist) return;

    let roleReq = activeTour.roleRequirements.find(r => 
      r.status === 'Open' && r.roleName.toLowerCase().includes(roleName.toLowerCase().split(' ')[0])
    );

    if (!roleReq) {
      roleReq = activeTour.roleRequirements.find(r => r.status === 'Open');
    }

    let targetRoleId = roleReq?.id;
    if (!targetRoleId) {
      const newRoleId = `role_cop_${Date.now()}`;
      targetRoleId = newRoleId;
      const newRole: TourRoleRequirement = {
        id: newRoleId,
        roleName: roleName,
        status: 'Open',
        targetBudgetShow: rate || 400,
        negotiationHistory: []
      };
      updateActiveTour(t => ({ ...t, 
          roleRequirements: [...t.roleRequirements, newRole] 
        }));
    }

    const showRate = rate || artist.dailyRate || 400;
    const duration = 1; 
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    const activeHold: HoldDetails = {
      id: `hold_cop_${Date.now()}`,
      durationDays: duration,
      expiryDate: expiry.toISOString(),
      releaseNoticeHours: 24,
      backupBench: [],
      isLocked: true
    };

    // Send WhatsApp Alert via Backend Twilio API
    fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: artist.whatsapp || artist.phone || '000000',
        isWhatsApp: true,
        body: `*Sessiecat Tour Hold Request*\n\nHi ${artist.name}, you have been placed on an exclusive 24H hold by the Tour Organizer for the role of ${roleName} at a locked rate of €${showRate}/show.\n\nPlease log in to confirm your availability.`
      })
    }).catch(console.error);

    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === targetRoleId) {
              return {
                ...r,
                assignedArtistId: artist.id,
                status: 'Hold',
                actualRatePaidShow: showRate,
                activeHold
              };
            }
            return r;
          }) 
        }));

    setCopilotMessages(prev => [...prev, {
      id: `feedback_${Date.now()}`,
      sender: 'assistant',
      text: `🔐 **Exclusive Hold locked for ${artist.name}** as **${roleName}** at the pre-locked rate of **€${showRate}**! Hold will expire in 24 hours.`
    }]);
  };

  const handleAutoPilotRun = async () => {
    handleSendCopilotPrompt("Fully automate this tour. Find matches for all open roles, shortlist candidates, lock 24H holds matching budget, and draft messages.");
  };

  const activeTour = tours.find(t => t.id === selectedTourId) || tours[0];

  const updateActiveTour = async (updater: (tour: TourEvent) => TourEvent) => {
    if (!activeTour) return;
    const newTour = updater(activeTour);
    
    // Optimistic local update
    setTours(prev => prev.map(t => t.id === activeTour.id ? newTour : t));
    
    try {
      await updateDoc(doc(db, 'tours', newTour.id), newTour as any);
    } catch(err) {
      console.error("Failed to update tour in firestore", err);
    }
  };

  useEffect(() => {
    if (activeTour && !selectedTourId) {
      setSelectedTourId(activeTour.id);
    }
  }, [tours, activeTour]);

  // Handle tour budget creation
  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName.trim()) return;

    let baseRoles: TourRoleRequirement[] = [];

    if (tourTemplate === 'mahler') {
      const classicalRoles = [
        'Violin I (Principal)', 'Violin I (Tutti)', 'Violin II (Principal)', 'Violin II (Tutti)',
        'Viola (Principal)', 'Viola (Tutti)', 'Cello (Principal)', 'Double Bass (Principal)',
        'Flute (Piccolo)', 'Oboe (English Horn)', 'Clarinet', 'Bassoon',
        'Horn', 'Trumpet', 'Trombone', 'Tuba', 'Timpani'
      ];
      baseRoles = classicalRoles.map((roleName, index) => ({
        id: `role_${Date.now()}_${index}`,
        roleName: roleName,
        status: 'Open',
        targetBudgetShow: 350,
        negotiationHistory: []
      }));
    } else {
      // Build standard default 3 roles
      baseRoles = [
        {
          id: `role_${Date.now()}_1`,
          roleName: 'Bass Guitarist',
          status: 'Open',
          targetBudgetShow: 450,
          negotiationHistory: []
        },
        {
          id: `role_${Date.now()}_2`,
          roleName: 'Keyboardist',
          status: 'Open',
          targetBudgetShow: 400,
          negotiationHistory: []
        },
        {
          id: `role_${Date.now()}_3`,
          roleName: 'Drummer',
          status: 'Open',
          targetBudgetShow: 500,
          negotiationHistory: []
        }
      ];
    }

    const newTour: TourEvent = {
      id: `tour_${Date.now()}`,
      name: newTourName.trim(),
      description: newTourDesc.trim(),
      startDate: newTourStart,
      endDate: newTourEnd,
      budgetShow: newTourBudget,
      roleRequirements: baseRoles
    };

    try {
      await setDoc(doc(db, 'tours', newTour.id), newTour as any);
      setTours(prev => [newTour, ...prev]);
      setSelectedTourId(newTour.id);
      setIsCreatingTour(false);
    } catch(err) {
      console.error(err);
    }
    
    // Reset fields
    setNewTourName('');
    setNewTourDesc('');
    setNewTourBudget(2400);
  };

  const handleDeleteTour = async (id: string) => {
    const updated = tours.filter(t => t.id !== id);
    try {
      await deleteDoc(doc(db, 'tours', id));
      setTours(updated);
      if (selectedTourId === id && updated.length > 0) {
        setSelectedTourId(updated[0].id);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleAddRoleRequirement = (roleName: string, targetBudget: number) => {
    if (!activeTour) return;
    const newRole: TourRoleRequirement = {
      id: `role_${Date.now()}`,
      roleName,
      status: 'Open',
      targetBudgetShow: targetBudget,
      negotiationHistory: []
    };

    updateActiveTour(t => ({ ...t, 
          roleRequirements: [...t.roleRequirements, newRole] 
        }));
  };

  const handleDeleteRoleRequirement = (roleId: string) => {
    if (!activeTour) return;
    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.filter(r => r.id !== roleId) 
        }));
  };

  // Structured Negotiations: "Make Offer"
  const handleInitiateNegotiation = (roleId: string, artist: Artist, isOffer: boolean) => {
    if (!activeTour) return;
    
    // Base Rates
    const showRate = artist.dailyRate || 450;
    const rehearsalRate = artist.hourlyRate ? Math.round(artist.hourlyRate * 3) : 200;

    const roleReq = activeTour.roleRequirements.find(r => r.id === roleId);
    if (!roleReq) return;

    if (!isOffer) {
      // Direct Hold at listed rate (locks rate implicitly)
      const duration = 3; // 3-day hold duration
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + duration);

      const activeHold: HoldDetails = {
        id: `hold_${Date.now()}`,
        durationDays: duration,
        expiryDate: expiry.toISOString(),
        releaseNoticeHours: 24,
        backupBench: [],
        isLocked: true
      };

      updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
              if (r.id === roleId) {
                return {
                  ...r,
                  assignedArtistId: artist.id,
                  status: 'Hold',
                  actualRatePaidShow: showRate,
                  activeHold
                };
              }
              return r;
            }) 
        }));
    } else {
      // Standard Offer Negotiation
      const initialStep: NegotiationStep = {
        id: `step_${Date.now()}`,
        sender: 'manager',
        rateOfferShow: offerValue,
        rateOfferRehearsal: offerRehearsal,
        note: offerNote || 'Offer to lock booking for this tour cycle.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending'
      };

      updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
              if (r.id === roleId) {
                return {
                  ...r,
                  assignedArtistId: artist.id,
                  status: 'Negotiation',
                  negotiatedOfferShow: offerValue,
                  negotiatedOfferRehearsal: offerRehearsal,
                  negotiationHistory: [initialStep]
                };
              }
              return r;
            }) 
        }));

      // Auto reply simulation after 2 seconds
      simulateNegotiationReply(activeTour.id, roleId, artist, offerValue);
    }

    setActiveRoleReqId(null);
    setOfferNote('');
  };

  // Helper to handle simulation responses
  const simulateNegotiationReply = (tourId: string, roleId: string, artist: Artist, showOffer: number) => {
    setTimeout(async () => {
      const tour = tours.find(t => t.id === tourId);
      if (!tour) return;
      
      const newTour = {
        ...tour,
        roleRequirements: tour.roleRequirements.map(r => {
            if (r.id !== roleId) return r;

            const listed = artist.dailyRate || 450;
            const diff = showOffer - listed;

            let replyOffer = showOffer;
            let status: 'accepted' | 'countered' | 'declined' = 'accepted';
            let note = '';

            if (diff >= 0) {
              status = 'accepted';
              note = `Fantastic! Listed rate of €${listed} met. Show dates locked in. Let's arrange rehearsal.`;
            } else if (Math.abs(diff) <= 60) {
              status = 'countered';
              replyOffer = Math.round(listed - Math.abs(diff)/2);
              note = `Almost there. Let's split the difference. I can do €${replyOffer} per show if transit cover is included.`;
            } else {
              status = 'declined';
              note = `Too far below flat card standards. Listed show rate remains €${listed}. Let me know if budget expands!`;
            }

            const step: NegotiationStep = {
              id: `step_${Date.now()}`,
              sender: 'artist',
              rateOfferShow: replyOffer,
              note,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status
            };

            return {
              ...r,
              negotiatedOfferShow: replyOffer,
              negotiationHistory: [...r.negotiationHistory, step],
              status: status === 'accepted' ? 'Confirmed' : r.status,
              actualRatePaidShow: status === 'accepted' ? replyOffer : r.actualRatePaidShow
            };
          })
      };

      try {
        await updateDoc(doc(db, 'tours', tourId), newTour as any);
        setTours(prev => prev.map(t => t.id === tourId ? newTour : t));
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  const handleConfirmOffer = (roleId: string, acceptedRate: number) => {
    if (!activeTour) return;

    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === roleId) {
              const confirmStep: NegotiationStep = {
                id: `step_${Date.now()}`,
                sender: 'manager',
                rateOfferShow: acceptedRate,
                note: 'Offer confirmed and rate locked for show dates!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'accepted'
              };
              return {
                ...r,
                status: 'Confirmed',
                actualRatePaidShow: acceptedRate,
                negotiationHistory: [...r.negotiationHistory, confirmStep]
              };
            }
            return r;
          }) 
        }));
  };

  const handleCounterOffer = (roleId: string, counterRate: number) => {
    if (!activeTour) return;

    const roleReq = activeTour.roleRequirements.find(r => r.id === roleId);
    if (!roleReq || !roleReq.assignedArtistId) return;

    const artist = artists.find(m => m.id === roleReq.assignedArtistId);
    if (!artist) return;

    const step: NegotiationStep = {
      id: `step_${Date.now()}`,
      sender: 'manager',
      rateOfferShow: counterRate,
      note: `Revised budget constraints. Proposing updated show quote of €${counterRate}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === roleId) {
              return {
                ...r,
                negotiatedOfferShow: counterRate,
                negotiationHistory: [...r.negotiationHistory, step],
                status: 'Negotiation'
              };
            }
            return r;
          }) 
        }));

    simulateNegotiationReply(activeTour.id, roleId, artist, counterRate);
  };

  const handleCancelNegotiation = (roleId: string) => {
    if (!activeTour) return;
    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === roleId) {
              return {
                ...r,
                assignedArtistId: undefined,
                status: 'Open',
                actualRatePaidShow: undefined,
                negotiatedOfferShow: undefined,
                negotiationHistory: []
              };
            }
            return r;
          }) 
        }));
  };

  const handleUpdateBackupBench = (roleId: string, backupIds: string[]) => {
    if (!activeTour) return;
    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === roleId && r.activeHold) {
              return {
                ...r,
                activeHold: {
                  ...r.activeHold,
                  backupBench: backupIds
                }
              };
            }
            return r;
          }) 
        }));
  };

  const handleReleaseHold = (roleId: string) => {
    if (!activeTour) return;
    updateActiveTour(t => ({ ...t, 
          roleRequirements: t.roleRequirements.map(r => {
            if (r.id === roleId) {
              return {
                ...r,
                assignedArtistId: undefined,
                status: 'Open',
                actualRatePaidShow: undefined,
                activeHold: undefined
              };
            }
            return r;
          }) 
        }));
  };

  // Live total calculations
  const totalCostShow = activeTour?.roleRequirements.reduce((sum, r) => {
    if (r.status === 'Confirmed' && r.actualRatePaidShow) {
      return sum + r.actualRatePaidShow;
    }
    if (r.status === 'Hold' && r.actualRatePaidShow) {
      return sum + r.actualRatePaidShow;
    }
    return sum;
  }, 0) || 0;

  const rolesOverBudget = activeTour?.roleRequirements.filter(r => {
    const rate = r.status === 'Confirmed' || r.status === 'Hold' ? r.actualRatePaidShow : undefined;
    if (rate && rate > r.targetBudgetShow) {
      return true;
    }
    return false;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Tour Workspaces Top bar Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-none">
        <div className="flex items-center gap-3.5">
          <Briefcase className="w-5 h-5 text-brand-accent shrink-0 animate-pulse" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D1FF26] font-bold">[ SUBSCRIPTION TOUR WORKSPACE ]</span>
            <div className="flex items-center gap-2">
              {tours.length === 0 ? (
                <span className="font-bold text-white text-base">No active tour workspaces found</span>
              ) : (
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className="bg-black text-white text-sm font-sans font-extrabold uppercase border border-white/20 px-3 py-1.5 focus:border-brand-accent outline-none"
                >
                  {tours.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
              {activeTour && (
                <span className="text-white/40 text-xs font-mono lowercase shrink-0 hidden sm:inline">
                  (cycle: {activeTour.startDate} to {activeTour.endDate})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsCreatingTour(true)}
            className="px-4 py-2.5 bg-[#D1FF26] hover:bg-white text-black text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Tour Workspace</span>
          </button>
          
          {activeTour && (
            <button
              onClick={() => handleDeleteTour(activeTour.id)}
              className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black hover:border-transparent border border-red-500/25 transition cursor-pointer"
              title="Delete Workspace file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isCreatingTour && (
        <form onSubmit={handleCreateTour} className="bg-black/80 border border-brand-accent/30 p-5 space-y-4 animate-fade-in text-xs">
          <h4 className="font-sans font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-accent" />
            Initialize Professional Campaign Workspace
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">Production Template *</label>
              <select 
                value={tourTemplate}
                onChange={(e) => setTourTemplate(e.target.value as 'standard' | 'mahler')}
                className="w-full bg-black/95 border border-white/10 text-white p-2 outline-none focus:border-brand-accent rounded-none uppercase font-mono text-xs"
              >
                <option value="standard">Standard Band / Pop Tour (3 Roles)</option>
                <option value="mahler">Classical Production: Mahler Orchestral Run</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">Tour Name *</label>
              <input 
                type="text" 
                required
                value={newTourName}
                onChange={(e) => setNewTourName(e.target.value)}
                placeholder="e.g. Amsterdam Jazz Fusion Tour 2026"
                className="w-full bg-black/95 border border-white/10 text-white placeholder-white/20 p-2 outline-none focus:border-brand-accent rounded-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">Cumulative Target Show Budget (€) *</label>
              <input 
                type="number" 
                required
                value={newTourBudget}
                onChange={(e) => setNewTourBudget(Number(e.target.value))}
                className="w-full bg-black/95 border border-white/10 text-white p-2 outline-none focus:border-brand-accent rounded-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">Start Date</label>
              <input 
                type="date" 
                value={newTourStart}
                onChange={(e) => setNewTourStart(e.target.value)}
                className="w-full bg-black/95 border border-white/10 text-white p-2 outline-none focus:border-brand-accent rounded-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase">End Date</label>
              <input 
                type="date" 
                value={newTourEnd}
                onChange={(e) => setNewTourEnd(e.target.value)}
                className="w-full bg-black/95 border border-white/10 text-white p-2 outline-none focus:border-brand-accent rounded-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/50 uppercase">Workspace Memo/Rider Descriptions</label>
            <textarea
              rows={2}
              value={newTourDesc}
              onChange={(e) => setNewTourDesc(e.target.value)}
              placeholder="Configure special constraints, instruments requested and digital NDA rules..."
              className="w-full bg-black/95 border border-white/10 text-white placeholder-white/20 p-2 outline-none focus:border-brand-accent rounded-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button 
              type="button" 
              onClick={() => setIsCreatingTour(false)} 
              className="px-3 py-1.5 border border-white/15 hover:border-white text-white/70 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-brand-accent hover:bg-white text-black font-bold uppercase tracking-wider cursor-pointer"
            >
              Initialize Workspace
            </button>
          </div>
        </form>
      )}

      {/* Workspace Dashboard & Budget Analytics Row */}
      {activeTour && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Workspace Roles board (Left Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest font-black">
                [ {activeTour.name} • ROLE ROSTER ]
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleAutoPilotRun}
                  className="flex items-center gap-1 text-[9px] font-black font-mono uppercase bg-[#AC6CFF] text-black hover:bg-white border border-[#AC6CFF] hover:border-white py-1 px-2.5 transition cursor-pointer"
                >
                  <Cpu className="w-3 h-3" /> Auto-Pilot Roster
                </button>
                <button
                  onClick={() => {
                    const roleName = prompt("Enter Instrumental Role Title (e.g. Pedal Steel Guitar, Backing Trumpet):");
                    if (roleName) {
                      const budget = Number(prompt("Target rate per show (€):", "400") || "400");
                      if (!isNaN(budget)) {
                        handleAddRoleRequirement(roleName, budget);
                      }
                    }
                  }}
                  className="text-[9px] font-mono uppercase bg-white/5 hover:bg-brand-accent border border-white/10 hover:text-black hover:border-brand-accent py-1 px-2.5 transition cursor-pointer"
                >
                  + Add Custom Role
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              {activeTour.roleRequirements.map((req) => {
                const assignedArtist = artists.find(m => m.id === req.assignedArtistId);
                const isOverBudget = req.actualRatePaidShow && req.actualRatePaidShow > req.targetBudgetShow;

                return (
                  <div 
                    key={req.id} 
                    className={`border p-4 transition-all duration-300 ${
                      req.status === 'Confirmed' 
                        ? 'bg-[#D1FF26]/5 border-[#D1FF26]/30' 
                        : req.status === 'Hold' 
                        ? 'bg-[#AC6CFF]/5 border-[#AC6CFF]/30'
                        : req.status === 'Negotiation'
                        ? 'bg-amber-500/5 border-amber-500/35'
                        : 'bg-black/45 border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      
                      {/* Left: Role identification */}
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-mono text-white/40 uppercase tracking-widest block">TOUR INSTRUMENT CHAIR</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          {req.roleName}
                          {req.status === 'Confirmed' ? (
                            <span className="bg-[#D1FF26]/10 text-[#D1FF26] text-[8px] border border-[#D1FF26]/35 px-1.5 py-0.5 font-mono">RATE LOCKED & FIXED</span>
                          ) : req.status === 'Hold' ? (
                            <span className="bg-[#AC6CFF]/15 text-[#AC6CFF] text-[8px] border border-[#AC6CFF]/35 px-1.5 py-0.5 font-mono">HOLD LOCKED RA_L</span>
                          ) : req.status === 'Negotiation' ? (
                            <span className="bg-amber-500/10 text-amber-400 text-[8px] border border-amber-500/35 px-1.5 py-0.5 font-mono animate-pulse">NEGOTIATION ON THREAD</span>
                          ) : (
                            <span className="bg-white/5 text-white/35 text-[8px] border border-white/10 px-1.5 py-0.5 font-mono">CHAIR OPEN</span>
                          )}
                        </h4>
                        
                        <div className="flex items-center gap-3 pt-0.5 text-[10px] font-mono text-white/50">
                          <span>Target Budget: <strong className="text-white">€{req.targetBudgetShow}</strong></span>
                        </div>
                      </div>

                      {/* Middle: Assigned Artist */}
                      <div className="flex-grow flex items-center gap-3">
                        {assignedArtist ? (
                          <div className="bg-black/60 border border-white/5 p-2 flex items-center gap-2.5 max-w-full">
                            <SafeImage
                              src={assignedArtist.avatarUrl}
                              alt={assignedArtist.name}
                              textSeed={assignedArtist.name}
                              fallbackType="avatar"
                              className="w-10 h-10 object-cover shrink-0"
                            />
                            <div className="min-w-0 max-w-[140px] xs:max-w-none">
                              <span className="text-xs text-white font-bold block truncate">{assignedArtist.name}</span>
                              <span className="text-[9px] text-white/40 block truncate">
                                {req.status === 'Confirmed' || req.status === 'Hold' ? (
                                  <>Active rate: <strong className="text-brand-accent">€{req.actualRatePaidShow || req.negotiatedOfferShow}/show</strong></>
                                ) : (
                                  <>Offered: <strong className="text-amber-400">€{req.negotiatedOfferShow}/show</strong></>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentActiveTab('artists');
                            }}
                            className="text-[9.5px] font-mono uppercase bg-brand-accent/15 hover:bg-brand-accent border border-brand-accent/25 hover:text-black py-2 px-3 transition cursor-pointer"
                          >
                            🔎 Browse Directory to Bid
                          </button>
                        )}
                      </div>

                      {/* Right side: Actions & cost variance */}
                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-[8.5px] font-mono text-white/40 uppercase tracking-widest block">VARIANCE</span>
                        {req.actualRatePaidShow ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`text-xs font-mono font-black ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                              €{req.actualRatePaidShow}
                            </span>
                            {req.actualRatePaidShow > req.targetBudgetShow ? (
                              <span className="text-[8px] font-mono text-red-500 font-bold bg-red-500/10 px-1 rounded-none uppercase">Over (+€{req.actualRatePaidShow - req.targetBudgetShow})</span>
                            ) : (
                              <span className="text-[8px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded-none uppercase">Under Show</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-white/20">Pending assignment</span>
                        )}

                        <div className="flex justify-end gap-1.5 pt-1">
                          {req.status !== 'Open' && (
                            <button
                              onClick={() => {
                                if(confirm("Are you sure you want to release this artist role?")) {
                                  handleReleaseHold(req.id);
                                }
                              }}
                              className="text-[9px] font-mono text-red-400 hover:text-red-300 font-bold bg-red-400/10 hover:bg-red-400/20 px-1.5 py-0.5"
                            >
                              Release
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRoleRequirement(req.id)}
                            className="text-[9.5px] text-white/40 hover:text-white"
                            title="Remove Role"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Collapsible Holds Management Console */}
                    {req.status === 'Hold' && req.activeHold && assignedArtist && (
                      <div className="mt-4 pt-3.5 border-t border-dashed border-[#AC6CFF]/30 space-y-2 text-[11px] font-mono">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#AC6CFF]/10 p-2.5 border border-[#AC6CFF]/20 gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#AC6CFF] font-black uppercase flex items-center gap-1">
                              <Timer className="w-3.5 h-3.5 shrink-0" />
                              Active Exclusive Rate Hold (Duration: {req.activeHold.durationDays} Days)
                            </span>
                            <div className="text-white/80">
                              Expiry: <span className="text-emerald-400 font-bold">23h 58m remaining</span> (locked rate: €{req.actualRatePaidShow}/show)
                            </div>
                          </div>
                          
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => {
                                handleConfirmOffer(req.id, req.actualRatePaidShow || 450);
                              }}
                              className="px-2 py-1 bg-brand-accent text-black font-extrabold uppercase text-[9px] transition hover:bg-white"
                            >
                              ✓ Confirm Show
                            </button>
                            <button
                              onClick={() => handleReleaseHold(req.id)}
                              className="px-2 py-1 bg-black text-white/70 border border-white/20 text-[9px] uppercase transition hover:text-white"
                            >
                              Decline / Release
                            </button>
                          </div>
                        </div>

                        {/* Backup Bench selectors */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[8.5px] text-white/50 uppercase tracking-wider font-bold block">[ EMERGENCY STAGE BACKUP BENCH ]</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {artists
                              .filter(m => m.id !== assignedArtist.id && m.instruments.some(inst => inst.toLowerCase().includes(req.roleName.split(' ')[0].toLowerCase())))
                              .slice(0, 2)
                              .map(backup => {
                                const isAssignedBackup = req.activeHold?.backupBench.includes(backup.id);
                                return (
                                  <div key={backup.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-1 px-2">
                                    <span className="text-[10px] text-white/70 truncate">{backup.name} (Listed: €{backup.dailyRate})</span>
                                    <button
                                      onClick={() => {
                                        const bench = req.activeHold?.backupBench || [];
                                        const updatedBench = isAssignedBackup 
                                          ? bench.filter(id => id !== backup.id)
                                          : [...bench, backup.id];
                                        handleUpdateBackupBench(req.id, updatedBench);
                                      }}
                                      className={`px-1 text-[8.5px] uppercase font-bold border ${
                                        isAssignedBackup 
                                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                          : 'bg-transparent border-white/20 hover:border-[#AC6CFF] text-[#AC6CFF]'
                                      }`}
                                    >
                                      {isAssignedBackup ? '✓ On Deck' : 'Add Standby'}
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Negotiation Thread streams */}
                    {req.status === 'Negotiation' && assignedArtist && (
                      <div className="mt-4 pt-3.5 border-t border-neutral-800 space-y-3">
                        <span className="text-[9px] font-mono text-amber-500 font-extrabold uppercase block tracking-wider">[ INTERACTIVE DISPATCH THREAD ]</span>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto bg-black border border-white/5 p-2 px-3 font-mono text-[10px]">
                          {req.negotiationHistory.map((step) => (
                            <div key={step.id} className={`p-2 border border-white/5 leading-relaxed ${step.sender === 'manager' ? 'text-right bg-brand-accent/5' : 'text-left bg-neutral-900 border-l-2 border-l-amber-500'}`}>
                              <div className="flex justify-between text-[8px] text-white/30 uppercase font-black mb-1">
                                <span>{step.sender === 'manager' ? 'MY PLATFORM OFFER' : `${assignedArtist.name}`}</span>
                                <span>{step.timestamp}</span>
                              </div>
                              <div className="font-bold text-white text-xs">
                                Rate Offer: <span className="text-brand-accent">€{step.rateOfferShow}/show</span>
                              </div>
                              {step.note && <p className="text-white/70 mt-1 italic font-light">"{step.note}"</p>}
                              
                              <div className="mt-1 flex justify-end">
                                <span className={`text-[8.5px] px-1 font-black ${
                                  step.status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' :
                                  step.status === 'declined' ? 'text-red-400 bg-red-500/10' :
                                  'text-amber-400 bg-amber-500/10'
                                }`}>
                                  {step.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Negotiation input board */}
                        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10.5px]">
                          <button
                            onClick={() => {
                              const lastOffer = req.negotiationHistory[req.negotiationHistory.length - 1];
                              if (lastOffer) {
                                handleConfirmOffer(req.id, lastOffer.rateOfferShow);
                              }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 font-bold uppercase cursor-pointer"
                          >
                            ✓ Accept Artist's Counter
                          </button>
                          
                          <button
                            onClick={() => {
                              const countRate = Number(prompt("Enter counter rate offer (€):", "410"));
                              if (countRate && !isNaN(countRate)) {
                                handleCounterOffer(req.id, countRate);
                              }
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 uppercase cursor-pointer"
                          >
                            Make Counter Offer
                          </button>

                          <button
                            onClick={() => handleCancelNegotiation(req.id)}
                            className="bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 px-3 py-1.5 uppercase transition cursor-pointer"
                          >
                            Cancel & Decline
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* CALL SHEET GENERATOR & ROSTER SHARER CONSOLE */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-5 mt-6 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#D1FF26]/10 p-2 border border-[#D1FF26]/20">
                    <FileText className="w-5 h-5 text-brand-accent shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-white text-xs uppercase tracking-widest block">
                      ROSTER CALL SHEET & COMPLIANCE SHARER
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono uppercase mt-0.5">
                      Campaign Context: {activeTour.name}
                    </p>
                  </div>
                </div>
                
                <span className="bg-[#D1FF26]/10 text-brand-accent text-[9px] font-mono uppercase border border-[#D1FF26]/20 py-0.5 px-2.5 tracking-wider">
                  CAO-Popmuziek Compliant
                </span>
              </div>

              {/* Call Sheet Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Venue / Location Address</label>
                  <input
                    type="text"
                    value={csVenue}
                    onChange={(e) => setCsVenue(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Performance Target Date</label>
                  <input
                    type="date"
                    value={csDate}
                    onChange={(e) => setCsDate(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Emergency Roster Contact</label>
                  <input
                    type="text"
                    value={csEmergencyContact}
                    onChange={(e) => setCsEmergencyContact(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">General Artist Call</label>
                  <input
                    type="text"
                    placeholder="e.g. 15:30"
                    value={csBandCall}
                    onChange={(e) => setCsBandCall(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">rehearsal / soundcheck</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:00"
                    value={csSoundcheck}
                    onChange={(e) => setCsSoundcheck(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Doors Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 19:30"
                    value={csDoors}
                    onChange={(e) => setCsDoors(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Showtime / Downbeat</label>
                  <input
                    type="text"
                    placeholder="e.g. 20:30"
                    value={csShowTime}
                    onChange={(e) => setCsShowTime(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase block">Special Load-in Instructions / Rider Specs</label>
                  <input
                    type="text"
                    value={csNotes}
                    onChange={(e) => setCsNotes(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-brand-accent text-white p-2 outline-none text-[11.5px] font-mono"
                  />
                </div>
              </div>

              {/* Roster Integration Summary List */}
              <div className="bg-black/45 border border-white/5 p-4 space-y-3">
                <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                  [ CURRENT ASSIGNED BAND ROSTER ({activeTour.roleRequirements.filter(r => r.assignedArtistId).length} ARTISTS) ]
                </span>

                {activeTour.roleRequirements.filter(r => r.assignedArtistId).length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-white/10 text-white/30 text-xs uppercase font-mono tracking-tight">
                    No validated artists confirmed on tour roster yet. Use AI suggestions to add roles.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeTour.roleRequirements.filter(r => r.assignedArtistId).map((req) => {
                      const artist = artists.find(m => m.id === req.assignedArtistId);
                      if (!artist) return null;
                      return (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-white/5 p-2.5">
                          <div className="flex items-center gap-3">
                            <SafeImage
                              src={artist.avatarUrl}
                              alt={artist.name}
                              textSeed={artist.name}
                              fallbackType="avatar"
                              className="w-9 h-9 object-cover rounded-none"
                            />
                            <div>
                              <span className="text-xs text-white font-black block uppercase tracking-tight">{artist.name}</span>
                              <span className="text-[9px] font-mono text-brand-accent uppercase block">{req.roleName} ({req.status})</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="bg-white/5 px-2 py-0.5 border border-white/5 text-white/60">
                              Transit: {artist.location.split(' ')[0]}
                            </span>
                            <span className="bg-[#D1FF26]/5 px-2 py-0.5 border border-[#D1FF26]/10 text-brand-accent font-bold">
                              Rate: €{req.actualRatePaidShow || req.negotiatedOfferShow}/show
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Share & Broadcast Control Actions */}
              <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
                {/* Public Link Share */}
                <button
                  type="button"
                  onClick={() => {
                    const mockUrl = `https://sessiecat.nl/shares/campaign-callsheet-${activeTour.id.slice(0, 6)}`;
                    setCsShareUrl(mockUrl);
                    navigator.clipboard?.writeText?.(mockUrl);
                    alert(`Public Shareable Roster Call Sheet URL generated & written to clipboard:\n${mockUrl}`);
                  }}
                  className="px-4 py-2.5 bg-brand-accent hover:bg-white text-black font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Generate Shared Public Page</span>
                </button>

                {/* Broadcast SMS/Email Command */}
                <button
                  type="button"
                  disabled={isBroadcasting || activeTour.roleRequirements.filter(r => r.assignedArtistId).length === 0}
                  onClick={() => {
                    setIsBroadcasting(true);
                    setCsBroadcastLogs([`[${new Date().toLocaleTimeString()}] Accessing Sessiecat SMTP and SMS Gateway...`]);
                    
                    setTimeout(() => {
                      const confirmed = activeTour.roleRequirements.filter(r => r.assignedArtistId);
                      const finalLogs = [`[${new Date().toLocaleTimeString()}] Accessing Sessiecat SMTP and SMS Gateway...`];
                      
                      confirmed.forEach(c => {
                        const m = artists.find(mus => mus.id === c.assignedArtistId);
                        if (m) {
                          finalLogs.push(`[${new Date().toLocaleTimeString()}] Dispatched SMS with GPS token lock to ${m.name} (+31 6 ... ${m.id === 'm1' ? '1947' : '8252'})`);
                          finalLogs.push(`[${new Date().toLocaleTimeString()}] Queued CAO-Popmuziek dispatch email to ${m.name.toLowerCase().replace(/\s/g, '')}@sessiecat.nl`);
                        }
                      });
                      
                      finalLogs.push(`[${new Date().toLocaleTimeString()}] ✓ Operational broadcast broadcasted successfully! All ${confirmed.length} crew checked in.`);
                      setCsBroadcastLogs(finalLogs);
                      setIsBroadcasting(false);
                      setCsNotifySuccess(true);
                    }, 1200);
                  }}
                  className="px-4 py-2.5 bg-black hover:bg-white/5 text-white border border-white/20 hover:border-white font-mono font-bold uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer disabled:opacity-35"
                >
                  <Bell className="w-4 h-4 text-brand-accent" />
                  <span>{isBroadcasting ? 'Broadcasting now...' : 'SMS & Email Broadcast to Roster'}</span>
                </button>
              </div>

              {/* Public Share Success Overlay notification */}
              {csShareUrl && (
                <div className="p-3 bg-[#D1FF26]/5 border border-[#D1FF26]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-mono text-[#D1FF26] font-black uppercase tracking-widest block font-bold">✓ Call Sheet Share Available</span>
                    <p className="text-white/85">The band sheet is public. Share this URL with your clients or booking agency representatives:</p>
                    <code className="text-[10px] text-brand-accent font-mono block select-all bg-black/60 p-1 mt-1 border border-white/5">{csShareUrl}</code>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText?.(csShareUrl);
                      alert("Link copied!");
                    }}
                    className="px-3 py-1.5 bg-neutral-800 text-white font-mono hover:bg-neutral-700 uppercase"
                  >
                    Copy Link
                  </button>
                </div>
              )}

              {/* Live Broadcast Feed Logs Terminal */}
              {csBroadcastLogs.length > 0 && (
                <div className="bg-black/80 border border-neutral-800 p-3.5 space-y-2 font-mono text-[10px] text-neutral-400">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-white/55">
                    <span className="uppercase text-[8.5px] font-black tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-accent shrink-0 animate-pulse" /> Live Broadcast dispatch terminal
                    </span>
                    <span className="text-[#D1FF26] animate-pulse">● PORT 3000 SECURE</span>
                  </div>
                  
                  <div className="space-y-1">
                    {csBroadcastLogs.map((log, idx) => (
                      <div key={idx} className={log.includes('✓') ? 'text-emerald-400 font-bold' : log.includes('Queued') ? 'text-blue-300' : 'text-neutral-400'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live cumulative Budget Telemetry & Platform KPI */}
          <div className="space-y-6">
            
            {/* Live budget gauges */}
            <div className="bg-black/60 border border-white/10 p-5 space-y-4 font-sans">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-black border-b border-white/15 pb-2">
                📂 workspace cost projection
              </span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/60">Limit budget / show:</span>
                  <span className="text-sm font-bold font-mono">€{activeTour.budgetShow}</span>
                </div>
                
                <div className="flex justify-between items-baseline py-1">
                  <span className="text-xs text-white/60">Cumulative rates (locked):</span>
                  <span className="text-lg font-black font-mono text-brand-accent">
                    €{totalCostShow}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-900 rounded-none overflow-hidden relative border border-white/15">
                  <div 
                    className={`h-full transition-all duration-300 ${totalCostShow > activeTour.budgetShow ? 'bg-red-500' : 'bg-brand-accent'}`}
                    style={{ width: `${Math.min((totalCostShow / activeTour.budgetShow) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono pt-1">
                  <span>Usage: {Math.round((totalCostShow / activeTour.budgetShow) * 100)}%</span>
                  {totalCostShow > activeTour.budgetShow ? (
                    <span className="text-red-400 font-extrabold uppercase">⚠️ OVER CONSTRAINED BY €{totalCostShow - activeTour.budgetShow}</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">✓ BALANCED RUNNING VALUE</span>
                  )}
                </div>
              </div>

              {/* Roles Alert panel */}
              {rolesOverBudget.length > 0 && (
                <div className="p-3 bg-red-500/5 border border-red-500/25 flex gap-2 text-red-300 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <strong className="text-red-200 block mb-0.5 uppercase text-[9.5px] font-mono">Cost Breaches</strong>
                    These roles are currently negotiated or locked above their respective budgets:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[9px]">
                      {rolesOverBudget.map(role => (
                        <li key={role.id}>
                          {role.roleName}: €{role.actualRatePaidShow} (limit: €{role.targetBudgetShow})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Platform KPI performance score */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-none space-y-3.5">
              <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest block font-extrabold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-accent" />
                PLATFORM TRUST REPORT CARD
              </span>

              <p className="text-xs text-white/60 leading-normal font-light">
                Sessiecat platform secures pre-negotiated elite artists and locks contracts instantly.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                <div className="p-2.5 bg-black/40 border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">Time-To-Confirm</span>
                  <span className="text-sm font-sans font-black text-brand-accent">18.5 Hours</span>
                </div>
                <div className="p-2.5 bg-black/40 border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">Mutual NDAs</span>
                  <span className="text-sm font-sans font-black text-white">100% Locked</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#D1FF26] uppercase font-bold text-center bg-[#D1FF26]/5 py-1.5 border border-[#D1FF26]/20">
                ⭐ 48H ALL-BAND CONFIRM GUARANTEE
              </div>
            </div>

            {/* AI Copilot Workspace Companion */}
            <div id="ai-copilot-panel" className="bg-black/80 border-2 border-brand-accent/30 p-5 space-y-4 font-sans animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-accent/10 p-1.5 border border-brand-accent/30">
                    <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-tight block">AI WORKSPACE COPILOT</span>
                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest block flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5 text-brand-accent" />
                      CONTEXT: {activeTour.name}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setCopilotExpanded(!copilotExpanded)}
                  className="text-[9px] font-mono uppercase px-2 py-0.5 border border-white/10 hover:border-white text-white/50 hover:text-white transition cursor-pointer"
                >
                  {copilotExpanded ? "COLLAPSE" : "EXPAND"}
                </button>
              </div>

              {copilotExpanded && (
                <div className="space-y-4">
                  {/* Chat Feeds */}
                  <div id="copilot-chat-feed" className="bg-black/50 border border-white/10 p-4 h-[300px] overflow-y-auto space-y-3.5 scrollbar-thin">
                    {copilotMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[7.5px] font-mono uppercase text-white/30 mb-0.5">
                          {msg.sender === "user" ? "TOUR MANAGER" : "Sessiecat AI"}
                        </span>
                        
                        <div className={`p-3 text-xs leading-relaxed max-w-[95%] ${
                          msg.sender === "user" 
                            ? "bg-white/5 text-white border border-white/10" 
                            : "bg-[#D1FF26]/5 text-white border border-[#D1FF26]/20"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          
                          {/* Render Structured action suggestions */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-white/10 space-y-2.5">
                              <span className="text-[8.5px] font-mono text-brand-accent uppercase block tracking-widest">
                                ✦ Actionable Workflows
                              </span>
                              
                              {msg.actions.map((act, index) => {
                                // Renders Build Roster or Candidate Shortlist Actions
                                if (act.intent === 'build_roster' || act.intent === 'shortlist_candidates') {
                                  const artistIds: string[] = act.params?.artistIds || [];
                                  return (
                                    <div key={index} className="bg-black/60 border border-white/5 p-2.5 space-y-2">
                                      <span className="text-[9px] font-mono text-white/50 block font-bold uppercase">
                                        Suggested Shortlist ({artistIds.length})
                                      </span>
                                      
                                      <div className="space-y-1.5">
                                        {artistIds.map((mId) => {
                                          const item = artists.find(m => m.id === mId);
                                          if (!item) return null;
                                          return (
                                            <div key={mId} className="flex items-center justify-between bg-white/5 p-1.5 border border-white/5 text-[10px]">
                                              <div className="flex items-center gap-1.5">
                                                <SafeImage src={item.avatarUrl} alt={item.name} textSeed={item.name} fallbackType="avatar" className="w-5 h-5 object-cover" />
                                                <span className="text-white font-bold">{item.name}</span>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  // Directly place hold on this candidate
                                                  const roleMatch = activeTour.roleRequirements.find(r => r.status === 'Open')?.roleName || "Session Spot";
                                                  handleCopilotPlaceHold(item.id, roleMatch, item.dailyRate);
                                                }}
                                                className="bg-brand-accent text-black font-extrabold px-2 py-0.5 text-[8.5px] font-mono tracking-tight hover:bg-white cursor-pointer"
                                              >
                                                + SELECT HOLD
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                // Renders Place Holds action card
                                if (act.intent === 'place_holds') {
                                  const holdsList: any[] = act.params?.holds || [];
                                  return (
                                    <div key={index} className="bg-black/60 border border-brand-accent/20 p-2.5 space-y-2">
                                      <span className="text-[9px] text-amber-400 font-mono uppercase block font-bold">
                                        Pending Exclusive Locks ({holdsList.length})
                                      </span>
                                      
                                      <div className="space-y-2">
                                        {holdsList.map((h, i) => {
                                          const m = artists.find(mus => mus.id === h.artistId);
                                          if (!m) return null;
                                          return (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-black/40 border border-white/10 p-2 text-[10px] gap-2">
                                              <div>
                                                <span className="text-white font-bold block">{m.name}</span>
                                                <span className="text-[8.5px] text-white/40 block font-mono uppercase">{h.role} • €{h.rate}/show</span>
                                              </div>
                                              <button
                                                onClick={() => handleCopilotPlaceHold(m.id, h.role, h.rate)}
                                                className="bg-amber-400 hover:bg-brand-accent text-black font-black uppercase tracking-tighter px-2.5 py-1 text-[8.5px] font-mono self-end sm:self-auto cursor-pointer"
                                              >
                                                🔒 Lock 24h Hold
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                // Renders Custom Message Draft actions
                                if (act.intent === 'draft_messages') {
                                  const drafts: any[] = act.params?.drafts || [];
                                  return (
                                    <div key={index} className="bg-black/60 border border-purple-500/20 p-2.5 space-y-2">
                                      <span className="text-[9px] text-[#AC6CFF] font-mono uppercase block font-bold">
                                        Draft holds & invites ({drafts.length})
                                      </span>
                                      
                                      <div className="space-y-2">
                                        {drafts.map((d, i) => {
                                          const m = artists.find(mus => mus.id === d.artistId);
                                          if (!m) return null;
                                          return (
                                            <div key={i} className="bg-white/5 p-2 text-[10px] space-y-1.5 border border-white/10">
                                              <div className="flex justify-between items-center text-white/55 font-bold">
                                                <span>To: {m.name}</span>
                                                <span className="text-[8px] uppercase tracking-wider font-mono">Invite Draft</span>
                                              </div>
                                              <p className="text-[9.5px] bg-black/30 p-1.5 border border-white/5 text-white/70 italic leading-snug">
                                                "{d.text}"
                                              </p>
                                              <button
                                                onClick={() => {
                                                  // Open conversation thread and pre-populate draft text
                                                  onTriggerChat(m, d.text);
                                                }}
                                                className="bg-purple-500 text-white font-extrabold px-2.5 py-1 text-[8.5px] font-mono tracking-wider hover:bg-purple-400 uppercase w-full cursor-pointer"
                                              >
                                                ✓ Review & Dispatch
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                return null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isCopilotThinking && (
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-900 border border-brand-accent p-2.5 text-brand-accent flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider animate-pulse">
                          <Cpu className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini model resolving campaign...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prompt Box */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendCopilotPrompt(copilotInput);
                    }} 
                    className="flex gap-2"
                  >
                    <input 
                      type="text"
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      placeholder="e.g. 'Build roster under budget' or 'Lock SVND'"
                      className="flex-1 bg-black text-white px-3 py-2 text-xs border border-white/15 outline-none focus:border-brand-accent placeholder-white/20 font-sans"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-accent hover:bg-white text-black p-2.5 flex items-center justify-center transition border border-brand-accent hover:border-white cursor-pointer"
                      title="Ask Copilot"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Heuristic suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button 
                      onClick={() => handleSendCopilotPrompt("Build roster under budget")}
                      className="text-[8.5px] font-mono uppercase px-2 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-brand-accent transition cursor-pointer"
                    >
                      💡 Build roster
                    </button>
                    <button 
                      onClick={() => handleSendCopilotPrompt("Place 24h holds on open slots")}
                      className="text-[8.5px] font-mono uppercase px-2 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-brand-accent transition cursor-pointer"
                    >
                      🔒 Lock Holds
                    </button>
                    <button 
                      onClick={() => handleSendCopilotPrompt("Draft hold invitations")}
                      className="text-[8.5px] font-mono uppercase px-2 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-brand-accent transition cursor-pointer"
                    >
                      ✉️ Draft messages
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Trigger offer input modal/panel */}
      {activeRoleReqId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-brand-accent p-6 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">[ PROPOSE STRUCTURED DISPATCH ]</h4>
            
            <div className="space-y-3 font-mono text-xs text-white/80">
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase">Offer per show (€):</label>
                <input 
                  type="number" 
                  value={offerValue}
                  onChange={(e) => setOfferValue(Number(e.target.value))}
                  className="w-full bg-black text-white p-2 border border-white/20 outline-none rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase">Offer per rehearsal (optional €):</label>
                <input 
                  type="number" 
                  value={offerRehearsal}
                  onChange={(e) => setOfferRehearsal(Number(e.target.value))}
                  className="w-full bg-black text-white p-2 border border-white/20 outline-none rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase">Note / Spec details:</label>
                <input 
                  type="text" 
                  value={offerNote}
                  placeholder={`e.g., Lock in May 15-20, 2026. Charts provided.`}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full bg-black text-white p-2 border border-white/20 outline-none rounded-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 font-mono text-[10px] font-black">
              <button
                onClick={() => setActiveRoleReqId(null)}
                className="px-3 py-1.5 border border-white/20 text-white"
              >
                BACK
              </button>
              
              <button
                onClick={() => {
                  // Retrieve the target elements
                  const container = document.getElementById('offer-context-store');
                  if (container) {
                    const musId = container.getAttribute('data-artist-id');
                    const roleId = container.getAttribute('data-role-id');
                    const artist = artists.find(m => m.id === musId);
                    if (roleId && artist) {
                      handleInitiateNegotiation(roleId, artist, true);
                    }
                  }
                }}
                className="px-4 py-1.5 bg-brand-accent text-black uppercase"
              >
                PROPOSE OFFER
              </button>
            </div>
            
            {/* hidden meta context store */}
            <div id="offer-context-store" className="hidden" />
          </div>
        </div>
      )}

    </div>
  );
}
