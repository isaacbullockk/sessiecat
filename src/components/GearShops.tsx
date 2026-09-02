import React, { useState } from 'react';
import { MapPin, Navigation, Phone, ExternalLink, Clock, Store, CreditCard } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface Shop {
  id: string;
  name: string;
  category: string;
  distance: string;
  address: string;
  hours: string;
  phone: string;
  image: string;
  tags: string[];
  description: string;
}

const mockShops: Shop[] = [
  {
    id: 's1',
    name: 'Dijkman Muziek',
    category: 'Guitars, Bass & Pedals',
    distance: '0.8 km',
    address: 'Rozengracht 115, Amsterdam',
    hours: '10:00 - 18:00 (Mon-Sat)',
    phone: '+31 20 626 5611',
    image: 'https://images.unsplash.com/photo-1559814402-45eacb2c7e8e?auto=format&fit=crop&q=80',
    tags: ['Instrument Repair', 'Guitar Strings', 'Pedal Effects', 'Cables'],
    description: 'A classic staple for guitarists and bassists in the heart of Amsterdam. Quick string replacements and a massive wall of pedals.'
  },
  {
    id: 's2',
    name: 'Bax Music Amsterdam',
    category: 'DJ, Studio & Synth',
    distance: '2.1 km',
    address: 'James Wattstraat 71, Amsterdam',
    hours: '10:00 - 20:00 (Mon-Sat), 12:00 - 17:00 (Sun)',
    phone: '+31 113 212 703',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80',
    tags: ['Keyboards', 'Monitors', 'PA Systems', 'DJ Gear', 'Adapters'],
    description: 'Huge showroom for electronic, DJ, and studio gear. The absolute go-to if you lost an adapter, a TRS cable, or need a spare midi controller.'
  },
  {
    id: 's3',
    name: 'Terpstra Muziek Drumland',
    category: 'Drums & Percussion',
    distance: '15.5 km (Lijnden)',
    address: 'Halfweg',
    hours: '10:00 - 18:00 (Tue-Sat)',
    phone: '+31 20 659 6858',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80',
    tags: ['Drum Heads', 'Sticks', 'Cymbals', 'Hardware'],
    description: 'The largest specialized drum store in the Benelux. If you broke a snare head or lost a clutch, this is where you run to.'
  },
  {
    id: 's4',
    name: 'Keymusic Amsterdam',
    category: 'General Instruments & Synths',
    distance: '1.5 km',
    address: 'Ceintuurbaan 416, Amsterdam',
    hours: '10:00 - 18:00 (Tue-Sat)',
    phone: '+31 20 679 4608',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80',
    tags: ['Microphones', 'Cables', 'Guitars', 'Keyboards'],
    description: 'Great central location for immediate replacements. They have a solid selection of condenser mics and stage essentials.'
  },
  {
    id: 's5',
    name: 'Matthews Muziek',
    category: 'Brass & Wind',
    distance: '12 km (Edam)',
    address: 'Brouwerijstraat 1, Edam',
    hours: '09:00 - 17:30 (Mon-Sat)',
    phone: '+31 299 371 999',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80',
    tags: ['Valve Oil', 'Reeds', 'Mouthpieces', 'Horn Repair'],
    description: 'Highly specialized brass and wind instrument shop just outside Amsterdam, great for emergency brass repairs and specialized accessories.'
  }
];

export function GearShops() {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'Guitars, Bass & Pedals', 'DJ, Studio & Synth', 'Drums & Percussion', 'Brass & Wind', 'General Instruments & Synths'];
  
  const filteredShops = filter === 'All' ? mockShops : mockShops.filter(s => s.category.includes(filter));

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-accent" />
              Local Gear & Emergency Shops
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Find the nearest specialized stores for replacement strings, cables, sticks, and rapid gear repairs.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black border border-white/10 text-white font-mono uppercase text-[10px] tracking-wider px-3 py-1.5 outline-none rounded-none focus:border-brand-accent cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-black border border-white/10 hover:border-brand-accent/40 transition-colors flex flex-col group">
            <div className="h-40 w-full relative overflow-hidden bg-neutral-900 border-b border-white/10">
              <SafeImage
                src={shop.image}
                alt={shop.name}
                textSeed={shop.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 text-[10px] font-mono font-bold text-[#D1FF26] border border-[#D1FF26]/20 flex items-center gap-1.5 uppercase">
                <Navigation className="w-3.5 h-3.5" />
                {shop.distance}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[9px] font-mono uppercase text-brand-accent font-bold tracking-widest block mb-1">
                {shop.category}
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{shop.name}</h3>
              <p className="text-xs text-white/60 font-light leading-relaxed mb-4 flex-1">
                {shop.description}
              </p>
              
              <div className="space-y-2 text-xs font-mono mb-5 border-t border-white/5 pt-4">
                <div className="flex items-start gap-2 text-white/70">
                  <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                  <span className="leading-tight">{shop.address}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>{shop.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>{shop.phone}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-5">
                {shop.tags.map(tag => (
                  <span key={tag} className="bg-white/5 text-white/50 text-[9px] uppercase tracking-wider px-2 py-0.5 border border-white/5 font-bold">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Opening maps for directions to ${shop.name}...`)}
                  className="bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent hover:text-black hover:border-brand-accent text-brand-accent font-mono text-[10px] uppercase font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  Navigate
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Calling ${shop.name} at ${shop.phone}...`)}
                  className="bg-black border border-white/10 hover:border-white/30 text-white/70 hover:text-white font-mono text-[10px] uppercase font-bold py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  Call Shop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
