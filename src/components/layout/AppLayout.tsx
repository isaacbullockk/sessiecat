import React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Skeleton layout component ready for adoption
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans select-none antialiased selection:bg-brand-accent selection:text-[#0A0A0A]">
      <main className="flex-1 flex flex-col w-full h-full relative z-0">
        {children}
      </main>
    </div>
  );
}
