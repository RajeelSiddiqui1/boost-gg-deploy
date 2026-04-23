import React from 'react';
import { SlidersHorizontal, Flame, Sword, Shield, Coins, Zap } from 'lucide-react';

const CATEGORIES = [
 { id: 'all', label: 'All Services', icon: Zap },
 { id: 'hot', label: 'Hot Deals', icon: Flame },
 { id: 'raid', label: 'Raids', icon: Sword },
 { id: 'dungeon', label: 'Dungeons', icon: Shield },
 { id: 'powerleveling', label: 'Leveling', icon: Zap },
 { id: 'gold', label: 'Gold', icon: Coins },
];

const WowFilterBar = ({ activeCategory, onCategoryChange, priceRange, onPriceChange, sortBy, onSortChange }) => {
 return (
 <div className="bg-black/40 backdrop-blur-xl border-y border-white/5 sticky top-[72px] z-40">
 <div className="container mx-auto px-6">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4">
 {/* Category Tabs */}
 <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
 {CATEGORIES.map((cat) => (
 <button
 key={cat.id}
 onClick={() => onCategoryChange(cat.id)}
 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${activeCategory === cat.id
 ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-[1.02]'
 : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
 }`}
 >
 <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'fill-current' : ''}`} />
 {cat.label}
 </button>
 ))}
 </div>

 {/* Filters & Sorting */}
 <div className="flex flex-wrap items-center gap-4">
 <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl">
 <SlidersHorizontal className="w-4 h-4 text-primary" />
 <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Sort:</span>
 <select
 value={sortBy}
 onChange={(e) => onSortChange(e.target.value)}
 className="bg-transparent border-none outline-none focus:ring-0 text-white font-bold text-sm cursor-pointer"
 >
 <option value="popularityScore" className="bg-[#0A0A0A]">Popularity</option>
 <option value="price_asc" className="bg-[#0A0A0A]">Lowest Price</option>
 <option value="price_desc" className="bg-[#0A0A0A]">Highest Price</option>
 <option value="createdAt" className="bg-[#0A0A0A]">Newest</option>
 </select>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default WowFilterBar;
