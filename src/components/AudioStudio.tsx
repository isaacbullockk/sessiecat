import React, { useState, useEffect, useRef } from "react";
import {
  AudioSession,
  TranscriptItem,
  SetlistSong,
  SheetMusicItem,
  StemChannel,
  ChordSection,
} from "../types";
import {
  Music,
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  ListMusic,
  Sliders,
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Activity,
  ArrowUp,
  ArrowDown,
  Printer,
  Compass,
  Radio,
  Clock,
  Zap,
} from "lucide-react";

interface AudioStudioProps {
  currentGoogleUser?: any;
  onAttachToTour?: (setlist: SetlistSong[]) => void;
  onAttachToJam?: (setlist: SetlistSong[]) => void;
}

const PRESET_SESSIONS: { label: string; genre: string; desc: string; bpm: number; key: string }[] = [
  {
    label: "🎸 Paradiso Headline Leg - Soul Funk Rehearsal",
    genre: "Soul / Funk / Live Rhythm",
    desc: "116 BPM in E Minor with dynamic horn hits and syncopated slap bassline.",
    bpm: 116,
    key: "E Minor",
  },
  {
    label: "🎷 Westergas Jazz & Brass Leg",
    genre: "Contemporary Jazz / Neo-Soul",
    desc: "122 BPM in A Minor with lush Rhodes voicings and trumpet soli.",
    bpm: 122,
    key: "A Minor",
  },
  {
    label: "⚡ Melkweg Festival Headline Rock Run",
    genre: "Alternative Rock / Indie",
    desc: "138 BPM in D Major with energetic drum builds and fuzz guitar riffs.",
    bpm: 138,
    key: "D Major",
  },
];

const CHORD_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_CHORD_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function AudioStudio({ currentGoogleUser, onAttachToTour, onAttachToJam }: AudioStudioProps) {
  // Active Tab View: 'mixer' | 'setlist' | 'sheet' | 'transcript'
  const [activeTab, setActiveTab] = useState<"mixer" | "setlist" | "sheet" | "transcript">("mixer");

  // State for active session
  const [session, setSession] = useState<AudioSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio Playback Engine
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false);
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopRange, setLoopRange] = useState<[number, number]>([0, 60]);

  // Transposition & Sheet Music Settings
  const [semitoneShift, setSemitoneShift] = useState<number>(0);
  const [useNashvilleNumbers, setUseNashvilleNumbers] = useState<boolean>(false);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);

  // Transcript Search & Filter
  const [transcriptFilter, setTranscriptFilter] = useState<"all" | "cue" | "lyrics" | "banter" | "direction">("all");
  const [transcriptSearch, setTranscriptSearch] = useState<string>("");

  // UI Feedback
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Audio Element Ref for real file playback
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const stemFiltersRef = useRef<{
    vocalsGain?: GainNode;
    drumsGain?: GainNode;
    bassGain?: GainNode;
    instrumentsGain?: GainNode;
  }>({});

  // Web Audio synth simulation ref for stems
  const audioContextRef = useRef<AudioContext | null>(null);
  const stemOscillatorsRef = useRef<{ [key: string]: GainNode | null }>({});
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Synthesize musical groove loop when playing with no audio file loaded
  const synthIntervalRef = useRef<any>(null);

  const startGrooveSynth = () => {
    ensureAudioContext();
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // Play initial groove chord / bass pulse on step
    let step = 0;
    const bpm = session?.detectedBpm || 116;
    const stepIntervalMs = (60 / bpm / 2) * 1000; // eighth notes

    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

    synthIntervalRef.current = setInterval(() => {
      if (!isPlaying || !audioContextRef.current) return;
      const now = ctx.currentTime;
      
      // Determine active stem volumes
      const drumsStem = session?.stems.find(s => s.id === "drums");
      const bassStem = session?.stems.find(s => s.id === "bass");
      const keysStem = session?.stems.find(s => s.id === "instruments");
      const voxStem = session?.stems.find(s => s.id === "vocals");

      const hasSolo = session?.stems.some(s => s.isSolo);
      const isAudible = (stem?: typeof drumsStem) => {
        if (!stem) return false;
        if (stem.isMuted) return false;
        if (hasSolo && !stem.isSolo) return false;
        return stem.volume > 0;
      };

      // Drums
      if (isAudible(drumsStem)) {
        const vol = (drumsStem?.volume || 0.8) * 0.3;
        // Kick on 1 and 3 (step 0, 4)
        if (step === 0 || step === 4) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        }
        // Snare on 2 and 4 (step 2, 6)
        if (step === 2 || step === 6) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(vol * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        }
        // Hihat on every eighth note
        const hatOsc = ctx.createOscillator();
        const hatGain = ctx.createGain();
        hatOsc.type = "square";
        hatOsc.frequency.setValueAtTime(4500, now);
        hatGain.gain.setValueAtTime(vol * 0.15, now);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        hatOsc.connect(hatGain);
        hatGain.connect(ctx.destination);
        hatOsc.start(now);
        hatOsc.stop(now + 0.03);
      }

      // Bass line (Em / Am funk groove root notes)
      if (isAudible(bassStem)) {
        const vol = (bassStem?.volume || 0.8) * 0.35;
        const rootFreqs = [82.41, 82.41, 98.0, 110.0, 82.41, 123.47, 110.0, 98.0]; // E2, G2, A2, B2
        const freq = rootFreqs[step % 8];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Keys / Rhodes chord swell on beats
      if (isAudible(keysStem) && (step === 0 || step === 4)) {
        const vol = (keysStem?.volume || 0.8) * 0.2;
        [164.81, 196.0, 246.94, 293.66].forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        });
      }

      // Vocals harmony pad
      if (isAudible(voxStem) && step === 2) {
        const vol = (voxStem?.volume || 0.8) * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(329.63, now); // E4
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }

      step = (step + 1) % 8;
    }, stepIntervalMs);
  };

  const stopGrooveSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Handle Initial Load with a default session if empty
  useEffect(() => {
    handleLoadPreset(PRESET_SESSIONS[0]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Timer loop for simulated playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && session) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          if (loopActive && next >= loopRange[1]) {
            return loopRange[0];
          }
          if (next >= session.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 250);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, session, playbackSpeed, loopActive, loopRange]);

  // Initialize Web Audio context on user action
  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // Trigger web audio sound click for metronome or stem tone
  const playMetronomeBeep = (high: boolean = false) => {
    try {
      ensureAudioContext();
      if (!audioContextRef.current) return;
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(high ? 1000 : 800, audioContextRef.current.currentTime);
      gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.08);
    } catch (e) {}
  };

  // State for manual Key & Song Editor modal
  const [editingSong, setEditingSong] = useState<{
    songIndex: number;
    key: string;
    bpm: number;
    songTitle: string;
    lyrics?: string;
  } | null>(null);

  // Play / Pause Toggle with real Web Audio / HTML5 audio hook
  const togglePlayPause = () => {
    ensureAudioContext();
    if (!isPlaying) {
      if (audioUrl && audioElementRef.current) {
        audioElementRef.current.play().catch(() => {});
      } else {
        startGrooveSynth();
      }
      setIsPlaying(true);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      stopGrooveSynth();
      setIsPlaying(false);
    }
  };

  // Sync seekbar changes with HTML audio
  const handleSeek = (newSecs: number) => {
    setCurrentTime(newSecs);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = newSecs;
    }
  };

  // Load Preset
  const handleLoadPreset = async (preset: (typeof PRESET_SESSIONS)[0]) => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const res = await fetch("/api/audio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: preset.label,
          genre: preset.genre,
          notes: preset.desc,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const loadedSession: AudioSession = {
          id: `sess_${Date.now()}`,
          title: data.sessionTitle || preset.label,
          bandOrTourName: data.bandOrTourName || "Sessiecat Tour Lineup",
          createdAt: new Date().toISOString(),
          durationSeconds: data.durationSeconds || 245,
          detectedBpm: data.detectedBpm || preset.bpm,
          detectedKey: data.detectedKey || preset.key,
          timeSignature: data.timeSignature || "4/4",
          genre: data.genre || preset.genre,
          overallMood: data.overallMood || preset.desc,
          transcript: data.transcript || [],
          setlist: data.setlist || [],
          sheetMusic: data.sheetMusic || [],
          stems: data.stems || [],
        };
        setSession(loadedSession);
        setLoopRange([0, loadedSession.durationSeconds]);
      }
    } catch (err) {
      console.error("Failed to analyze preset audio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setAudioFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      // Convert to base64 if under 15MB for direct Gemini Multimodal processing
      let audioBase64 = "";
      if (file.size <= 15 * 1024 * 1024) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        audioBase64 = btoa(binary);
      }

      const res = await fetch("/api/audio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ""),
          audioBase64: audioBase64 || undefined,
          mimeType: file.type || "audio/mp3",
          genre: "Live Rehearsal",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const loadedSession: AudioSession = {
          id: `sess_${Date.now()}`,
          title: data.sessionTitle || file.name,
          bandOrTourName: data.bandOrTourName || "Rehearsal Room",
          fileName: file.name,
          audioUrl: objectUrl,
          createdAt: new Date().toISOString(),
          durationSeconds: data.durationSeconds || 240,
          detectedBpm: data.detectedBpm || 120,
          detectedKey: data.detectedKey || "C Major",
          timeSignature: data.timeSignature || "4/4",
          genre: data.genre || "Rehearsal Take",
          overallMood: data.overallMood || "Raw Live Room Take",
          transcript: data.transcript || [],
          setlist: data.setlist || [],
          sheetMusic: data.sheetMusic || [],
          stems: data.stems || [],
        };
        setSession(loadedSession);
        setLoopRange([0, loadedSession.durationSeconds]);
      }
    } catch (err) {
      console.error("Audio processing failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const objectUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(objectUrl);
        setIsLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/audio/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `Live Mic Take (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
                audioBase64: base64Data,
                mimeType: "audio/webm",
                genre: "Live Studio Recording",
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const loadedSession: AudioSession = {
                id: `sess_${Date.now()}`,
                title: data.sessionTitle || "Live Mic Rehearsal Take",
                bandOrTourName: data.bandOrTourName || "Stage Room Session",
                audioUrl: objectUrl,
                createdAt: new Date().toISOString(),
                durationSeconds: Math.max(recordingSeconds, data.durationSeconds || 180),
                detectedBpm: data.detectedBpm || 116,
                detectedKey: data.detectedKey || "E Minor",
                timeSignature: data.timeSignature || "4/4",
                genre: data.genre || "Live Rehearsal",
                overallMood: data.overallMood || "Acoustic Take",
                transcript: data.transcript || [],
                setlist: data.setlist || [],
                sheetMusic: data.sheetMusic || [],
                stems: data.stems || [],
              };
              setSession(loadedSession);
              setLoopRange([0, loadedSession.durationSeconds]);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone permission required to record live audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Stem Controls
  const toggleMuteStem = (stemId: string) => {
    if (!session) return;
    setSession({
      ...session,
      stems: session.stems.map((s) => (s.id === stemId ? { ...s, isMuted: !s.isMuted } : s)),
    });
  };

  const toggleSoloStem = (stemId: string) => {
    if (!session) return;
    const target = session.stems.find((s) => s.id === stemId);
    const newSolo = !target?.isSolo;

    setSession({
      ...session,
      stems: session.stems.map((s) => {
        if (s.id === stemId) return { ...s, isSolo: newSolo };
        return s;
      }),
    });
  };

  const updateStemVolume = (stemId: string, val: number) => {
    if (!session) return;
    setSession({
      ...session,
      stems: session.stems.map((s) => (s.id === stemId ? { ...s, volume: val } : s)),
    });
  };

  // Helper to transpose chord strings
  const transposeChord = (chord: string, semitones: number): string => {
    if (semitones === 0) return chord;
    // Match root note and suffix
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    const root = match[1];
    const suffix = match[2];

    let index = CHORD_NOTES.indexOf(root);
    if (index === -1) index = FLAT_CHORD_NOTES.indexOf(root);
    if (index === -1) return chord;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return CHORD_NOTES[newIndex] + suffix;
  };

  // Helper to format seconds as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Filtered transcript items
  const filteredTranscript = (session?.transcript || []).filter((item) => {
    if (transcriptFilter !== "all" && item.type !== transcriptFilter) return false;
    if (transcriptSearch) {
      const q = transcriptSearch.toLowerCase();
      return item.text.toLowerCase().includes(q) || item.speaker.toLowerCase().includes(q);
    }
    return true;
  });

  const currentSheet = session?.sheetMusic?.[selectedSheetIndex] || session?.sheetMusic?.[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Hidden Real HTML Audio Element */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Manual Key & Chart Correction Modal */}
      {editingSong && session && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Edit Song Key, BPM & Lyrics
              </h3>
              <button
                onClick={() => setEditingSong(null)}
                className="text-stone-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1">Song Title</label>
                <input
                  type="text"
                  value={editingSong.songTitle}
                  onChange={(e) => setEditingSong({ ...editingSong, songTitle: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-400 block mb-1">Key Signature (e.g. Em, G, Bbm)</label>
                  <input
                    type="text"
                    value={editingSong.key}
                    onChange={(e) => setEditingSong({ ...editingSong, key: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-400 block mb-1">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={editingSong.bpm}
                    onChange={(e) => setEditingSong({ ...editingSong, bpm: parseInt(e.target.value) || 120 })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1">Lyrics & Stage Directions</label>
                <textarea
                  rows={4}
                  value={editingSong.lyrics || ""}
                  onChange={(e) => setEditingSong({ ...editingSong, lyrics: e.target.value })}
                  placeholder="Enter or paste correct lyrics or cues..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                onClick={() => setEditingSong(null)}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedSetlist = [...session.setlist];
                  if (updatedSetlist[editingSong.songIndex]) {
                    updatedSetlist[editingSong.songIndex] = {
                      ...updatedSetlist[editingSong.songIndex],
                      songTitle: editingSong.songTitle,
                      key: editingSong.key,
                      bpm: editingSong.bpm,
                      stageNotes: editingSong.lyrics || updatedSetlist[editingSong.songIndex].stageNotes,
                    };
                  }
                  const updatedSheets = [...session.sheetMusic];
                  if (updatedSheets[editingSong.songIndex]) {
                    updatedSheets[editingSong.songIndex] = {
                      ...updatedSheets[editingSong.songIndex],
                      songTitle: editingSong.songTitle,
                      key: editingSong.key,
                      tempo: editingSong.bpm,
                    };
                  }
                  setSession({
                    ...session,
                    detectedKey: editingSong.key,
                    detectedBpm: editingSong.bpm,
                    setlist: updatedSetlist,
                    sheetMusic: updatedSheets,
                  });
                  setEditingSong(null);
                  copyToClipboard("", "Key & song details saved!");
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-950 border border-stone-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Multimodal AI Rehearsal Engine
              </span>
              {session && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  {session.detectedBpm} BPM • {session.detectedKey} • {session.timeSignature}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Radio className="w-7 h-7 text-amber-400" />
              Rehearsal Audio Studio & Sheet Music Engine
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl">
              Upload live band recordings or mic takes to instantaneously generate <strong>verbatim transcripts</strong>, <strong>isolated practice stems</strong>, <strong>full setlists</strong>, and <strong>sheet music chords & guitar/bass tabs</strong>.
            </p>
          </div>

          {/* Quick Preset Pickers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="dropdown relative">
              <div className="text-xs text-stone-400 font-medium mb-1">Quick Demo Sessions:</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SESSIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    id={`btn_preset_${idx}`}
                    onClick={() => handleLoadPreset(preset)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-700 text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    {preset.label.split(" - ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls: Live Mic Record & File Upload */}
        <div className="mt-6 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Mic Recorder */}
            {!isRecording ? (
              <button
                id="btn_start_recording"
                onClick={startRecording}
                disabled={isLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                Record Live Mic Take
              </button>
            ) : (
              <button
                id="btn_stop_recording"
                onClick={stopRecording}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 animate-pulse shadow-lg shadow-red-950 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4" />
                Stop Recording ({formatTime(recordingSeconds)})
              </button>
            )}

            {/* Audio File Upload */}
            <label
              id="lbl_upload_audio"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium rounded-xl border border-stone-700 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{audioFile ? audioFile.name : "Upload Audio (.mp3, .wav, .m4a)"}</span>
              <input
                id="input_audio_file"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading || isRecording}
              />
            </label>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Gemini Multimodal AI analyzing audio spectrum, stems & chord progressions...
              </div>
            )}
          </div>

          {session && (
            <div className="flex items-center gap-2">
              <button
                id="btn_share_session"
                onClick={() => copyToClipboard(window.location.href, "Studio session link copied!")}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-medium rounded-lg border border-stone-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
                Share Link
              </button>
              {copiedNotification && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                  <Check className="w-3 h-3" />
                  {copiedNotification}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {session && (
        <>
          {/* Master Transport & Player Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                id="btn_master_play_pause"
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-950 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              <button
                id="btn_master_rewind"
                onClick={() => setCurrentTime(0)}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                  <span>{session.title}</span>
                  <span className="text-xs text-stone-400 font-normal">({session.genre})</span>
                </div>
                <div className="text-xs text-amber-400/90 font-mono">
                  {formatTime(currentTime)} / {formatTime(session.durationSeconds)}
                </div>
              </div>
            </div>

            {/* Seekbar */}
            <div className="w-full md:flex-1 max-w-xl flex items-center gap-3">
              <span className="text-xs text-stone-400 font-mono">{formatTime(currentTime)}</span>
              <input
                id="range_master_seek"
                type="range"
                min={0}
                max={session.durationSeconds}
                step={1}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-xs text-stone-400 font-mono">{formatTime(session.durationSeconds)}</span>
            </div>

            {/* Playback Settings: Speed & Metronome */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700">
                {[0.75, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      playbackSpeed === speed ? "bg-amber-500 text-stone-950 shadow-sm" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                id="btn_metronome"
                onClick={() => {
                  setMetronomeEnabled(!metronomeEnabled);
                  playMetronomeBeep(true);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  metronomeEnabled
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
                title="Toggle Practice Metronome"
              >
                <Clock className="w-3.5 h-3.5" />
                {session.detectedBpm} Click
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <button
                id="tab_mixer"
                onClick={() => setActiveTab("mixer")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "mixer"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Sliders className="w-4 h-4" />
                4-Stem Practice Mixer
              </button>

              <button
                id="tab_setlist"
                onClick={() => setActiveTab("setlist")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "setlist"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <ListMusic className="w-4 h-4" />
                Full Smart Setlist ({session.setlist.length} tracks)
              </button>

              <button
                id="tab_sheet"
                onClick={() => setActiveTab("sheet")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "sheet"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Music className="w-4 h-4" />
                Sheet Music, Chords & Tabs
              </button>

              <button
                id="tab_transcript"
                onClick={() => setActiveTab("transcript")}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "transcript"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                Verbatim Transcript & Cue Calls
              </button>
            </div>
          </div>

          {/* TAB 1: 4-STEM PRACTICE MIXER */}
          {activeTab === "mixer" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {session.stems.map((stem) => {
                  const isEffectiveMuted = stem.isMuted || (session.stems.some((s) => s.isSolo) && !stem.isSolo);
                  return (
                    <div
                      key={stem.id}
                      className={`bg-stone-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all ${
                        stem.isSolo
                          ? "border-amber-500/80 ring-2 ring-amber-500/20"
                          : isEffectiveMuted
                          ? "border-stone-800 opacity-60"
                          : "border-stone-800"
                      }`}
                    >
                      {/* Channel Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stem.color }}
                          />
                          <span className="text-sm font-bold text-stone-100">{stem.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn_solo_${stem.id}`}
                            onClick={() => toggleSoloStem(stem.id)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              stem.isSolo
                                ? "bg-amber-500 text-stone-950 shadow-sm"
                                : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                            }`}
                            title="Solo Track"
                          >
                            S
                          </button>
                          <button
                            id={`btn_mute_${stem.id}`}
                            onClick={() => toggleMuteStem(stem.id)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              stem.isMuted
                                ? "bg-rose-600 text-white shadow-sm"
                                : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                            }`}
                            title="Mute Track"
                          >
                            M
                          </button>
                        </div>
                      </div>

                      {/* Waveform / Level Meter Animation */}
                      <div className="h-20 bg-stone-950 rounded-xl p-2.5 flex items-end justify-between gap-1 overflow-hidden border border-stone-800/80">
                        {(stem.waveformPeaks || [40, 60, 80, 50, 70, 90, 65, 85, 45, 75]).map((peak, pIdx) => {
                          const heightPct = isPlaying && !isEffectiveMuted ? Math.min(100, Math.max(15, peak * (stem.volume || 1))) : 8;
                          return (
                            <div
                              key={pIdx}
                              className="flex-1 rounded-sm transition-all duration-150"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: isEffectiveMuted ? "#44403c" : stem.color,
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Volume Fader Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            {stem.volume === 0 || isEffectiveMuted ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                            )}
                            Gain
                          </span>
                          <span className="font-mono">{Math.round(stem.volume * 100)}%</span>
                        </div>
                        <input
                          id={`range_vol_${stem.id}`}
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={stem.volume}
                          onChange={(e) => updateStemVolume(stem.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      {/* Suggested Rehearsal EQ Notes */}
                      {stem.suggestedEqNotes && (
                        <div className="text-[11px] text-stone-400 bg-stone-950/60 border border-stone-800/60 p-2 rounded-lg">
                          <span className="text-amber-400 font-semibold">Sound Check Cue:</span> {stem.suggestedEqNotes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Minus-One Practice Tip Banner */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Minus-One Play-Along Mode Active
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400">
                      Mute the <strong>Bass</strong> or <strong>Drums</strong> stem above to let the hired session player practice their charts live over the rest of the backing band!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL SMART SETLIST */}
          {activeTab === "setlist" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Tour & Showcase Setlist
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Arranged sequence with stage transition timings, tempos, and lead chair responsibilities.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="btn_copy_setlist"
                    onClick={() => {
                      const text = session.setlist
                        .map(
                          (s) =>
                            `${s.order}. ${s.songTitle} [Key: ${s.key} | ${s.bpm} BPM | ${s.estimatedDuration}] - Notes: ${s.stageNotes}`
                        )
                        .join("\n");
                      copyToClipboard(text, "Setlist copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    Copy Text Summary
                  </button>

                  <button
                    id="btn_print_setlist"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-500" />
                    Print Stage Call Sheet
                  </button>

                  {onAttachToTour && (
                    <button
                      id="btn_attach_tour"
                      onClick={() => onAttachToTour(session.setlist)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-xs font-bold rounded-lg text-stone-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Attach to Tour Workspace
                    </button>
                  )}
                </div>
              </div>

              {/* Setlist Song Table */}
              <div className="space-y-3">
                {session.setlist.map((song, sIdx) => (
                  <div
                    key={song.id || sIdx}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-sm flex items-center justify-center border border-stone-200 dark:border-stone-700">
                        {song.order || sIdx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                            {song.songTitle}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">
                            {song.key}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400">
                            {song.bpm} BPM
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          <strong className="text-amber-600 dark:text-amber-400">Stage Cues:</strong> {song.stageNotes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <div className="text-right">
                        <div className="font-semibold text-stone-800 dark:text-stone-200">{song.leadRole}</div>
                        <div className="font-mono text-[11px]">{song.estimatedDuration} ({song.sectionTimeline})</div>
                      </div>

                      {/* Chords Badge List */}
                      {song.chordsSummary && song.chordsSummary.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1 max-w-xs">
                          {song.chordsSummary.map((chord, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[11px] font-bold text-amber-800 dark:text-amber-300 rounded"
                            >
                              {chord}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        id={`btn_edit_song_${sIdx}`}
                        onClick={() =>
                          setEditingSong({
                            songIndex: sIdx,
                            key: song.key,
                            bpm: song.bpm,
                            songTitle: song.songTitle,
                            lyrics: song.stageNotes,
                          })
                        }
                        className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                        title="Edit Key, BPM or Cues"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHEET MUSIC, CHORDS & TABS */}
          {activeTab === "sheet" && (
            <div className="space-y-6">
              {/* Sheet Music Controls Header */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Lead Sheet Transpose:
                  </span>
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                    <button
                      id="btn_transpose_down"
                      onClick={() => setSemitoneShift((prev) => prev - 1)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer"
                      title="Transpose 1 Semitone Down"
                    >
                      -1
                    </button>
                    <button
                      id="btn_transpose_reset"
                      onClick={() => setSemitoneShift(0)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        semitoneShift === 0
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : "hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200"
                      }`}
                    >
                      Original ({currentSheet ? currentSheet.originalKey : "Em"})
                    </button>
                    <button
                      id="btn_transpose_up"
                      onClick={() => setSemitoneShift((prev) => prev + 1)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer"
                      title="Transpose 1 Semitone Up"
                    >
                      +1
                    </button>
                  </div>

                  {semitoneShift !== 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
                      Transposed: {semitoneShift > 0 ? `+${semitoneShift}` : semitoneShift} Semitone(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn_toggle_nashville"
                    onClick={() => setUseNashvilleNumbers(!useNashvilleNumbers)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      useNashvilleNumbers
                        ? "bg-amber-500 text-stone-950 border-amber-500 font-bold"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Nashville Number System
                  </button>

                  <button
                    id="btn_print_sheet"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold rounded-xl text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-500" />
                    Print Lead Sheet
                  </button>
                </div>
              </div>

              {/* Sheet Music Chords & Song Sections */}
              {currentSheet && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                          {currentSheet.songTitle}
                        </h3>
                        <button
                          onClick={() =>
                            setEditingSong({
                              songIndex: selectedSheetIndex,
                              key: currentSheet.key,
                              bpm: currentSheet.tempo,
                              songTitle: currentSheet.songTitle,
                              lyrics: currentSheet.chartNotes,
                            })
                          }
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Edit Key / BPM
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Tempo: {currentSheet.tempo} BPM • Key: {transposeChord(currentSheet.key, semitoneShift)} • {currentSheet.chartNotes}
                      </p>
                    </div>

                    {useNashvilleNumbers && currentSheet.nashvilleNumbers && (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span>Nashville Progression:</span> {currentSheet.nashvilleNumbers.join(" - ")}
                      </div>
                    )}
                  </div>

                  {/* Chord Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSheet.chords.map((section, secIdx) => (
                      <div
                        key={section.id || secIdx}
                        className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                            {section.section}
                          </span>
                        </div>

                        {/* Bars / Chords Line */}
                        <div className="flex flex-wrap gap-2">
                          {section.bars.map((barChord, bIdx) => (
                            <div
                              key={bIdx}
                              className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-2xs font-mono font-black text-sm text-stone-900 dark:text-amber-400 text-center min-w-[54px]"
                            >
                              {transposeChord(barChord, semitoneShift)}
                            </div>
                          ))}
                        </div>

                        {/* Lyrics Underlay */}
                        {section.lyricsUnderlay && (
                          <div className="text-xs text-stone-600 dark:text-stone-400 italic pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
                            "{section.lyricsUnderlay}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tablature Viewer */}
                  {currentSheet.tablature && (
                    <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <Music className="w-4 h-4 text-amber-500" />
                          <span>{currentSheet.tablature.instrument} Tablature</span>
                          <span className="text-xs text-stone-500 font-normal">
                            (Tuning: {currentSheet.tablature.tuning})
                          </span>
                        </div>
                        <span className="text-xs text-stone-500">{currentSheet.tablature.notes}</span>
                      </div>

                      <div className="bg-stone-950 text-emerald-400 font-mono text-xs sm:text-sm p-4 rounded-xl overflow-x-auto border border-stone-800 shadow-inner">
                        {currentSheet.tablature.tabLines.map((line, lIdx) => (
                          <div key={lIdx} className="whitespace-pre tracking-wider leading-relaxed">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VERBATIM TRANSCRIPT & CUE CALLS */}
          {activeTab === "transcript" && (
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    id="input_search_transcript"
                    type="text"
                    placeholder="Search spoken instructions or lyrics..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "cue", "lyrics", "direction", "banter"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTranscriptFilter(type)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                        transcriptFilter === type
                          ? "bg-amber-500 text-stone-950 font-bold"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}

                  <button
                    id="btn_copy_transcript"
                    onClick={() => {
                      const text = session.transcript
                        .map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
                        .join("\n");
                      copyToClipboard(text, "Transcript copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 cursor-pointer ml-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Transcript Rows */}
              <div className="space-y-2.5">
                {filteredTranscript.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-sm">
                    No transcript entries matched your filter.
                  </div>
                ) : (
                  filteredTranscript.map((item) => {
                    const isCue = item.type === "cue" || item.type === "direction";
                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-stone-900 border rounded-xl p-3.5 shadow-2xs flex items-start justify-between gap-4 transition-all hover:border-amber-500/50 ${
                          isCue
                            ? "border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10"
                            : "border-stone-200 dark:border-stone-800"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {item.speaker}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.type === "cue"
                                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                  : item.type === "direction"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                  : item.type === "lyrics"
                                  ? "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                            {item.text}
                          </p>
                        </div>

                        {/* Timestamp Button to jump audio player */}
                        <button
                          id={`btn_timestamp_${item.id}`}
                          onClick={() => {
                            setCurrentTime(item.seconds || 0);
                            setIsPlaying(true);
                          }}
                          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-600 dark:text-stone-300 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                          title="Jump audio to this cue"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {item.timestamp}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
