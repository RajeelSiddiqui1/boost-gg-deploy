import React from 'react';
import { ChevronDown } from 'lucide-react';

const GameDiscovery = () => {

 return (
 <section className="px-6 py-32 bg-[#020202] transition-colors duration-300">
 <div className="max-w-[1440px] mx-auto text-center">
 <h2 className="text-4xl md:text-5xl font-black mb-20 tracking-tight text-white transition-colors">
 Discover all 137 games on BoostGG
 </h2>
 <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
 {['WoW', 'Destiny 2', 'Diablo IV', 'PoE', 'EFT', 'LoL', 'FFXIV', 'Elden Ring', 'Warframe', 'Rust', 'Apex', 'Valorant', 'Dota 2', 'CS2', 'Deadlock', 'Overwatch 2'].map((name, i) => (
 <button
 key={i}
 className="px-8 py-4 rounded-[20px] text-[16px] font-black transition-all shadow-lg active:scale-95 border border-white/10 bg-[#0A0A0A] text-white/60 hover:text-primary hover:border-primary/50"
 >
 {name}
 </button>
 ))}
 {Array.from({ length: 15 }).map((_, i) => (
 <button
 key={i}
 className="px-8 py-4 rounded-[20px] text-[16px] font-black transition-all shadow-md active:scale-95 border border-white/5 bg-[#0A0A0A] text-white/30 hover:text-white"
 >
 Other Game
 </button>
 ))}
 </div>
 <button className="mt-20 flex items-center gap-3 mx-auto px-12 py-5 rounded-full text-sm font-black uppercase tracking-[0.25em] transition-all border shadow-2xl active:scale-95 bg-[#111111] hover:bg-[#1a1a1a] text-white border-white/10">
 <span>Show all games</span>
 <ChevronDown className="w-6 h-6" />
 </button>
 </div>
 </section>
 );
};

export default GameDiscovery;
