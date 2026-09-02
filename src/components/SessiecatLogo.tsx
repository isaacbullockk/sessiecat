import React from 'react';
// @ts-ignore
import sessiecatLogoImg from '../assets/images/sessiecat_logo_1779695043892.png';

interface SessiecatLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SessiecatLogo({ className = '', showText = true, size = 'md' }: SessiecatLogoProps) {
  // Dimensions based on size
  const sizeClasses = {
    sm: { container: 'h-9', logo: 'w-8 h-8 md:w-9 md:h-9', text: 'text-sm' },
    md: { container: 'h-11', logo: 'w-10 h-10 md:w-11 md:h-11', text: 'text-xl' },
    lg: { container: 'h-16', logo: 'w-14 h-14 md:w-16 md:h-16', text: 'text-2xl lg:text-3xl' },
    xl: { container: 'h-24', logo: 'w-24 h-24 md:w-28 md:h-28', text: 'text-4xl lg:text-5xl' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-3.5 select-none ${className} group`}>
      {/* Cool Afro Cat V-Guitar Logo Image */}
      <div className={`relative ${currentSize.logo} shrink-0`}>
        {/* Glow Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#D1FF26]/40 via-[#AC6CFF]/30 to-pink-500/35 rounded-xl blur-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse" />
        
        {/* Main Logo Container */}
        <div className="absolute inset-0 bg-neutral-950 rounded-xl border-2 border-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/5 group-hover:border-brand-accent/60 transition-all duration-500 shadow-xl">
          <img
            src={sessiecatLogoImg}
            alt="Sessiecat Premium Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Brand Text styling with Funky and Smooth elements */}
      {showText && (
        <div className="flex flex-col justify-center select-none font-sans">
          <div className={`font-black tracking-tighter uppercase leading-none select-none ${currentSize.text} text-white flex items-center`}>
            <span>Sessie</span>
            <span className="relative text-[#D1FF26] italic pl-0.5 group-hover:text-white transition-colors duration-300">
              cat
              {/* Under-glow silk line matching the theme */}
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#AC6CFF] via-[#FB4B87] to-[#D1FF26] scale-x-100 group-hover:scale-x-110 transition-transform duration-300" />
            </span>
          </div>
          <div className="text-[9px] font-mono text-white/40 group-hover:text-[#AC6CFF]/80 transition-colors duration-300 uppercase tracking-[0.2em] font-black mt-2">
            [ From Chaos to Confirmed ]
          </div>
        </div>
      )}
    </div>
  );
}
