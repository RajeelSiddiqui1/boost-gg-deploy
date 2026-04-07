import React from 'react';
import { Shield, Zap, Star, Trophy } from 'lucide-react';

const WowHero = ({ stats }) => {
    return (
        <section className="relative min-h-[500px] flex items-center pt-20 overflow-hidden">
            {/* Background with Dark Theme & WoW Aesthetic */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070"
                    alt="World of Warcraft background"
                    className="w-full h-full object-cover opacity-50"
                />
            </div>

            <div className="container mx-auto px-6 relative z-20">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                        <Zap className="w-3 h-3 fill-current" />
                        Dragonflight & Classic Season of Discovery Ready
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight">
                        Power Up Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#a2e63e]">WoW Achievement</span>
                    </h1>

                    <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
                        Premium World of Warcraft boosting services. Raids, Dungeons, PvP, and Powerleveling delivered by top 0.1% PRO players. Safe, fast, and guaranteed.
                    </p>

                    <div className="flex flex-wrap gap-4 mb-12">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{stats?.offersCount || 150}+</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Offers</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{stats?.totalOrders || '2.5k'}+</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Boosts Completed</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Star className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">4.9/5</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Trustpilot Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Floating Elements or Decorative Bits */}
            <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-20 pointer-events-none">
                {/* Could be a WoW crest or character image */}
            </div>
        </section>
    );
};

export default WowHero;
