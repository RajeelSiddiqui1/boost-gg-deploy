import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const MostWantedOffers = () => {
 const { formatPrice } = useCurrency();

 // Base prices in USD
 const items = [
 { basePrice: 4.96, title: "Gold" },
 { basePrice: 4.96, title: "Mythic +2-20" },
 { basePrice: 9.60, title: "Manaforge" },
 { basePrice: 7.84, title: "Flawless" },
 { basePrice: 12.23, title: "Equilibrium" },
 { basePrice: 7.84, title: "The Desert" },
 { basePrice: 0.86, title: "Valorant" },
 { basePrice: 5.75, title: "Black Ops 7" },
 { basePrice: 1.94, title: "Diablo 4" },
 { basePrice: 1.90, title: "R6 Siege" },
 { basePrice: 2.08, title: "Arena" },
 { basePrice: 2.70, title: "PoE 2" },
 { basePrice: 0.43, title: "PoE 2" },
 { basePrice: 0.86, title: "Fortnite" },
 { basePrice: 2.96, title: "ARC Raiders" },
 { basePrice: 0.86, title: "Clash" },
 { basePrice: 2.15, title: "Marvel" },
 { basePrice: 6.07, title: "WoW TBC" },
 { basePrice: 5.14, title: "FC 26" }
 ];

 return (
 <section className="py-12 px-6 bg-[#050505] border-y border-white/5 font-['Outfit']">
 <div className="max-w-[1400px] mx-auto">
 <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/30 text-center mb-16 underline decoration-primary underline-offset-[12px]">
 Most wanted offers
 </h2>
 <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-3">
 {items.map((item, i) => (
 <div key={i} className="group cursor-pointer">
 <div className="aspect-square rounded-2xl overflow-hidden relative border border-white/5 bg-[#0A0A0A] mb-2">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
 <div className="absolute inset-0 flex items-center justify-center p-4">
 <div className="w-full h-full bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20 uppercase tracking-tighter text-center">
 {item.title}
 </div>
 </div>
 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
 <div className="absolute bottom-2 left-0 right-0 text-center">
 <span className="text-[10px] font-black text-white">From {formatPrice(item.basePrice)}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
};

export default MostWantedOffers;
