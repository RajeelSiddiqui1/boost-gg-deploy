import React from 'react';
import { ChevronDown } from 'lucide-react';

const DiscoverGames = () => {
    const games = [
        "WoW", "Destiny 2", "Diablo 4", "Path of Exile", "Elden Ring", "Valorant", "LoL", "Tarkov",
        "FF XIV", "Warframe", "Overwatch 2", "CS2", "Apex Legends", "Dota 2", "Lost Ark", "New World",
        "EVE Online", "RuneScape", "Albion Online", "BDO", "Guild Wars 2", "Elder Scrolls Online"
    ];

    return (
        <section className="px-6 bg-[#050505] border-y border-white/5">
            <div className="max-w-[1400px] mx-auto">
                <h2 className="text-[32px] font-black text-white italic tracking-tight mb-12">
                    Discover all 137 games on BoostGG
                </h2>

                <div className="flex flex-wrap gap-3">
                    {games.map((game, i) => (
                        <button key={i} className="px-6 py-3 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white/60 text-[13px] font-black uppercase tracking-widest hover:border-primary hover:text-white transition-all">
                            {game}
                        </button>
                    ))}
                    <button className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-[13px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
                        Show more <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default DiscoverGames;
