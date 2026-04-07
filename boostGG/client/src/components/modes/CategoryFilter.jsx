import React from 'react';
import { LayoutGrid, Target, Swords, Shield, Trophy, GraduationCap } from 'lucide-react';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
    const categories = [
        { id: 'all', label: 'All Services', icon: LayoutGrid },
        { id: 'rank-boost', label: 'Rank Boost', icon: Trophy },
        { id: 'raid-boost', label: 'Raid Boost', icon: Swords },
        { id: 'dungeon-boost', label: 'Dungeon', icon: Shield },
        { id: 'pvp-boost', label: 'PvP Boost', icon: Target },
        { id: 'coaching', label: 'Coaching', icon: GraduationCap },
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 mb-12">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id
                            ? 'bg-primary text-black border-primary shadow-[0_10px_20px_rgba(162,230,62,0.2)]'
                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10'
                            }`}
                    >
                        <cat.icon size={16} className={activeCategory === cat.id ? 'text-black' : 'text-primary'} />
                        {cat.label}
                    </button>
                ))}
            </div>

            <style jsx="true">{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default CategoryFilter;
