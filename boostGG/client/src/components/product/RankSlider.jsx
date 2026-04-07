import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

const RankSlider = ({
    ranks = [],
    fromRank,
    setFromRank,
    toRank,
    setToRank,
    onChange
}) => {
    // ranks: [{ label: 'Silver I', value: 1, icon: '...' }, ...]

    const [fromIndex, setFromIndex] = useState(0);
    const [toIndex, setToIndex] = useState(Math.min(1, ranks.length - 1));

    useEffect(() => {
        if (ranks.length > 0) {
            const fIdx = ranks.findIndex(r => r.label === fromRank || r.value === fromRank);
            const tIdx = ranks.findIndex(r => r.label === toRank || r.value === toRank);
            if (fIdx !== -1) setFromIndex(fIdx);
            if (tIdx !== -1) setToIndex(tIdx);
        }
    }, [ranks, fromRank, toRank]);

    const handleFromChange = (idx) => {
        const newIdx = parseInt(idx);
        setFromIndex(newIdx);
        setFromRank(ranks[newIdx].label);
        // Ensure 'to' is always higher than 'from'
        if (toIndex <= newIdx) {
            const nextIdx = Math.min(newIdx + 1, ranks.length - 1);
            setToIndex(nextIdx);
            setToRank(ranks[nextIdx].label);
        }
    };

    const handleToChange = (idx) => {
        const newIdx = parseInt(idx);
        if (newIdx <= fromIndex) return; // Cannot go lower than 'from'
        setToIndex(newIdx);
        setToRank(ranks[newIdx].label);
    };

    if (ranks.length === 0) return null;

    return (
        <div className="space-y-8 p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rank Selection</p>
                    <h3 className="text-xl font-black text-white uppercase italic">Define Your Goal</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-black text-white">{toIndex - fromIndex}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Ranks</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* From Rank */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block pl-2">Current Rank</label>
                    <div className="relative">
                        <select
                            value={fromIndex}
                            onChange={(e) => handleFromChange(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary/30 appearance-none cursor-pointer"
                        >
                            {ranks.map((r, i) => (
                                <option key={i} value={i}>{r.label}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none rotate-90" />
                    </div>
                    <div className="flex justify-center py-4">
                        <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 p-4 flex items-center justify-center group hover:border-primary/30 transition-all">
                            {ranks[fromIndex]?.icon ? (
                                <img src={ranks[fromIndex].icon} alt="" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                            ) : (
                                <div className="text-2xl font-black text-white/10 uppercase tracking-tighter italic">{ranks[fromIndex]?.label?.[0]}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* To Rank */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block pl-2">Desired Rank</label>
                    <div className="relative">
                        <select
                            value={toIndex}
                            onChange={(e) => handleToChange(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary/30 appearance-none cursor-pointer"
                        >
                            {ranks.map((r, i) => (
                                <option key={i} value={i} disabled={i <= fromIndex}>{r.label}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none rotate-90" />
                    </div>
                    <div className="flex justify-center py-4">
                        <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-center group hover:border-primary transition-all relative">
                            {ranks[toIndex]?.icon ? (
                                <img src={ranks[toIndex].icon} alt="" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(162,230,62,0.3)]" />
                            ) : (
                                <div className="text-2xl font-black text-primary uppercase tracking-tighter italic">{ranks[toIndex]?.label?.[0]}</div>
                            )}
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center">
                                <Zap className="w-3 h-3 fill-current" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider */}
            <div className="space-y-6 pt-6">
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-primary shadow-[0_0_15px_rgba(162,230,62,0.5)] transition-all"
                        style={{
                            left: `${(fromIndex / (ranks.length - 1)) * 100}%`,
                            right: `${100 - (toIndex / (ranks.length - 1)) * 100}%`
                        }}
                    ></div>
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 px-1">
                    <span>{ranks[0].label}</span>
                    <span>{ranks[ranks.length - 1].label}</span>
                </div>
            </div>
        </div>
    );
};

export default RankSlider;
