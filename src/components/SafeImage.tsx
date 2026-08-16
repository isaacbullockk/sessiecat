import React, { useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackType?: 'avatar' | 'banner' | 'icon';
  textSeed?: string;
  [key: string]: any;
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  fallbackType = 'avatar', 
  textSeed, 
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(!src);

  const handleOnError = () => {
    setError(true);
  };

  // If the source changes, reset the error state (e.g. if a user submits a valid new URL)
  React.useEffect(() => {
    setError(!src);
  }, [src]);

  if (error) {
    const seed = textSeed || alt || 'S';
    // Get clean initials (max 2 characters)
    const initials = seed
      .trim()
      .split(/\s+/)
      .map(word => word[0])
      .filter((char) => char && char.match(/[a-zA-Z]/))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'SC';

    // Aesthetic dark high-contrast gradients that fit perfectly in SessieCat's visual palette
    const bgGradients = [
      'from-neutral-900 via-[#161618] to-neutral-950 border-white/10 text-[#D1FF26]',
      'from-neutral-900 via-[#18151c] to-neutral-950 border-[#AC6CFF]/20 text-[#AC6CFF]',
      'from-neutral-900 via-[#151a16] to-neutral-950 border-[#D1FF26]/20 text-white',
      'from-neutral-900 via-[#1c1616] to-[#040404] border-red-500/20 text-red-400',
    ];

    // Determine deterministic gradient based on seed
    let colorIndex = 0;
    if (seed) {
      let sum = 0;
      for (let i = 0; i < seed.length; i++) {
        sum += seed.charCodeAt(i);
      }
      colorIndex = sum % bgGradients.length;
    }
    const gradientClass = bgGradients[colorIndex];

    if (fallbackType === 'banner') {
      return (
        <div 
          className={`w-full h-full bg-gradient-to-br ${gradientClass} border flex flex-col items-center justify-center p-4 text-center select-none ${className || ''}`}
          style={{ fontSize: '11px' }}
        >
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#D1FF26]/40 mb-1 font-extrabold">STUDIO SESSION SPACE</div>
          <div className="font-sans font-black text-white/90 text-sm uppercase max-w-[85%] truncate leading-none">{seed}</div>
        </div>
      );
    }

    return (
      <div 
        className={`aspect-square bg-gradient-to-br ${gradientClass} border flex items-center justify-center font-mono font-black uppercase select-none overflow-hidden shrink-0 ${className || ''}`}
        style={{ fontSize: 'max(11px, 32%)' }}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleOnError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
