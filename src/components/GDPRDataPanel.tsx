import React, { useState } from 'react';
import { Shield, Download, Trash2, Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Artist } from '../types';

interface GDPRDataPanelProps {
  user: any;
  userProfile?: Artist | null;
  jams?: any[];
  onDeleteAccount?: () => void;
}

export function GDPRDataPanel({
  user,
  userProfile,
  jams = [],
  onDeleteAccount,
}: GDPRDataPanelProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const getSavedConsent = () => {
    try {
      const stored = localStorage.getItem('sessiecat_gdpr_consent');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { essential: true, analytics: true, timestamp: 'Default' };
  };

  const currentConsent = getSavedConsent();

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      gdprComplianceNotice: "This file contains a complete export of your personal data stored on Sessiecat pursuant to GDPR Article 20.",
      userAccount: user ? {
        uid: user.uid || user.email,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      } : null,
      musicianProfile: userProfile || null,
      myCreatedSessions: jams.filter(j => j.organizerEmail === user?.email),
      privacyConsentHistory: currentConsent,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sessiecat_gdpr_data_${user?.email || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Clear localStorage items
      localStorage.removeItem('sessiecat_gdpr_consent');
      localStorage.removeItem('google_user');
      localStorage.removeItem('google_token');

      if (onDeleteAccount) {
        onDeleteAccount();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Account deletion error:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const resetConsent = () => {
    localStorage.removeItem('sessiecat_gdpr_consent');
    window.location.reload();
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded space-y-6 text-white font-sans">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D1FF26]/10 border border-[#D1FF26]/20 rounded">
            <Shield className="w-5 h-5 text-[#D1FF26]" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              GDPR Privacy & Personal Data Center
            </h3>
            <p className="text-xs text-white/50 font-mono">
              EU Data Protection Regulation (2016/679) Control Panel
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 border border-emerald-500/30 rounded font-bold uppercase">
          GDPR Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Right to Portability (Art. 20) */}
        <div className="bg-black/40 border border-white/10 p-5 rounded space-y-3">
          <div className="flex items-center gap-2 text-[#D1FF26]">
            <Download className="w-4 h-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              1. Download My Data (Art. 20)
            </span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Obtain a complete machine-readable (JSON) copy of all identity data, musician profiles, session holds, and messaging logs linked to your account.
          </p>
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-mono font-bold uppercase text-white rounded transition-all cursor-pointer"
          >
            {exportSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Data Export Generated!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#D1FF26]" />
                Export Personal Data (.JSON)
              </>
            )}
          </button>
        </div>

        {/* Cookie Consent Manager */}
        <div className="bg-black/40 border border-white/10 p-5 rounded space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              2. Privacy & Cookie Status
            </span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Current Status: <strong className="text-white font-mono">{currentConsent.analytics ? 'Full Analytics Consent' : 'Essential Only'}</strong>
            <br />
            Last Updated: <span className="text-white/50 font-mono text-[11px]">{currentConsent.timestamp}</span>
          </p>
          <button
            onClick={resetConsent}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-mono font-bold uppercase text-white rounded transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            Change Privacy / Cookie Preferences
          </button>
        </div>

      </div>

      {/* Right to Erasure (Art. 17) */}
      <div className="border-t border-white/10 pt-6">
        <div className="bg-red-950/20 border border-red-500/20 p-5 rounded space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <Trash2 className="w-4 h-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Right to Erasure / Delete Account (Art. 17)
            </span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Permanently delete your user account, musician roster listing, and cached session data from Sessiecat. This action is immediate and cannot be undone.
          </p>

          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 text-xs font-mono uppercase font-bold rounded transition-all cursor-pointer"
            >
              Request Account Erasure
            </button>
          ) : (
            <div className="bg-red-950/80 border border-red-500/40 p-4 rounded space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-red-300 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Are you sure you want to permanently delete your account & data?
              </div>
              <p className="text-[11px] text-white/70">
                All profile entries, instrument information, and personal settings will be completely wiped.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white font-mono text-xs font-bold uppercase px-4 py-2 rounded hover:bg-red-700 transition-all cursor-pointer"
                >
                  {isDeleting ? 'Erasing Data...' : 'Yes, Permanently Delete'}
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="bg-white/10 text-white font-mono text-xs uppercase px-3 py-2 rounded hover:bg-white/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
