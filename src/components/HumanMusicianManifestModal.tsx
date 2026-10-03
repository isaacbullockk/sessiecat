import React from 'react';
import { ShieldCheck, HeartHandshake, Euro, Music, Ban, CheckCircle2, X, Sparkles, Award } from 'lucide-react';

interface HumanMusicianManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinClick?: () => void;
}

export const HumanMusicianManifestModal: React.FC<HumanMusicianManifestModalProps> = ({
  isOpen,
  onClose,
  onJoinClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="bg-[#121212] border-2 border-[#D1FF26] w-full max-w-3xl rounded-2xl shadow-[0_0_60px_rgba(209,255,38,0.2)] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manifest-title"
      >
        {/* Header Bar */}
        <div className="bg-[#D1FF26] text-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-black text-[#D1FF26] rounded-md font-mono text-xs font-black">
              100% MENSELIJK
            </span>
            <h2 id="manifest-title" className="text-base sm:text-lg font-black uppercase tracking-tight">
              Het Sessiecat Muzikanten-Manifest
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/15 text-black rounded-lg transition cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-white max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Hero Statement */}
          <div className="border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#D1FF26] uppercase tracking-widest mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Onze Onvoorwaardelijke Belofte aan Nederlandse Muzikanten</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
              Echte Muziek Wordt Gemaakt Door Echte Mensen.
            </h3>
            <p className="text-white/80 text-sm sm:text-base mt-3 leading-relaxed">
              We snappen de woede en scepsis rondom AI in de Nederlandse muzieksector volkomen. 
              Muzikanten hebben jarenlang gestudeerd aan het conservatorium of geoefend in vochtige kelders, 
              om vervolgens te zien dat techbedrijven hun kunst willen reduceren tot algoritmes en prompts.
            </p>
            <p className="text-[#D1FF26] font-mono text-xs sm:text-sm font-bold mt-2">
              Sessiecat is géén AI-muziekgenerator. Sessiecat is het schild dat échte sessiemuzikanten beschermt en eerlijk betaald krijgt.
            </p>
          </div>

          {/* 5 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1 */}
            <div className="bg-black/50 border border-white/10 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-black uppercase">
                <Ban className="w-4 h-4" />
                <span>0% Synthetische Muziek</span>
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide">Geen AI-Tracks of Virtuele Zangers</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Wij weigeren alle AI-gegenereerde instrumentals (zoals Suno of Udio) en synthetische avatars. 
                Op Sessiecat staan uitsluitend levende, ademende instrumentalisten en vocalisten.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-black/50 border border-white/10 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-black uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Jouw Audio Blijft Van Jou</span>
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide">Geen AI-Model Training</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Jouw audio-samples, live-video's en speelstijl worden onder <strong className="text-white">geen enkel beding</strong> gebruikt 
                om taal- of muziekmodellen te trainen of te scrapen. Jouw intellectueel eigendom is 100% veilig.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-black/50 border border-white/10 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs font-black uppercase">
                <Award className="w-4 h-4" />
                <span>Kunstenbond CAO & Fair Practice</span>
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide">Weg Met 'Spelen voor Exposure'</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Wij hanteren de officiële Kunstenbond Pop-CAO richtlijn (minimaal <strong className="text-[#D1FF26] font-mono">€320/sessiedag</strong> en <strong className="text-[#D1FF26] font-mono">€45+/uur</strong>) 
                als standaard. Boekers die muzikanten willen uitknijpen, horen hier niet thuis.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-black/50 border border-white/10 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#AC6CFF] font-mono text-xs font-black uppercase">
                <Euro className="w-4 h-4" />
                <span>Betalingszekerheid via Escrow</span>
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide">Nooit Meer Bedelen om je Gage</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                De gage staat vóór aanvang van de show veilig vast op een derdengeldenrekening. 
                Na het concert wordt het bedrag binnen 24 uur vrijgegeven. Nooit meer 60 dagen wachten op een factuur.
              </p>
            </div>
          </div>

          {/* Pillar 5 / Invalpool */}
          <div className="bg-[#181818] border border-[#D1FF26]/30 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs font-black uppercase">
                <HeartHandshake className="w-4 h-4" />
                <span>Vervang de WhatsApp-Chaos</span>
              </div>
              <h4 className="text-sm font-black uppercase">De Betrouwbare Invalpool van Nederland</h4>
              <p className="text-xs text-white/70 max-w-xl leading-relaxed">
                Collega-muzikanten helpen wanneer iemand ziek is of dubbel geboekt staat. 
                Geen 300 ongelezen WhatsApp-meldingen, maar direct zien wie klaarstaat met gear en repertoire.
              </p>
            </div>
            <div className="shrink-0 font-mono text-xs text-[#D1FF26] border border-[#D1FF26]/40 bg-[#D1FF26]/10 px-3 py-1.5 rounded">
              Door & Voor Muzikanten 🇳🇱
            </div>
          </div>

          {/* Action Footer inside Modal */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50 font-mono">
              Vragen over het manifest? Mail gerust direct naar het team via de contactknop.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Sluiten
              </button>
              {onJoinClick && (
                <button
                  onClick={() => {
                    onClose();
                    onJoinClick();
                  }}
                  className="flex-1 sm:flex-none px-5 py-3 bg-[#D1FF26] hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Music className="w-4 h-4" />
                  Meld Je Aan als Muzikant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
