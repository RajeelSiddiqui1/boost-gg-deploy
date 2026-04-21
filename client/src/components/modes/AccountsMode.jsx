import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, getImageUrl } from '../../utils/api';
import { 
    Users, ShieldCheck, Zap, Search, 
    ArrowRight, Star, CheckCircle2, 
    Gamepad2, Award, Sparkles, TrendingUp
} from 'lucide-react';
import StepProcess from '../sections/StepProcess';

const AccountsMode = () => {
    const [accounts, setAccounts] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gamesRes, accountsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/v1/games?isActive=true`),
                    axios.get(`${API_URL}/api/v1/accounts`)
                ]);
                setGames(gamesRes.data.data || []);
                setAccounts(accountsRes.data.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Identify games that actually have accounts
    const activeGames = useMemo(() => {
        return games.filter(game => {
            const hasAccounts = accounts.some(acc => 
                (acc.gameId?._id === game._id) || 
                (acc.gameId === game._id) ||
                (acc.gameSlug === game.slug)
            );
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
            return hasAccounts && matchesSearch;
        });
    }, [games, accounts, searchQuery]);

    const getAccountCount = (gameId) => {
        return accounts.filter(acc => 
            (acc.gameId?._id === gameId) || (acc.gameId === gameId)
        ).length;
    };

    if (loading) {
        return (
            <div className="py-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 animate-fade-in font-['Outfit']">
            {/* Hero Branding Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                        <div className="w-10 h-[2px] bg-primary shadow-[0_0_10px_rgba(162,230,62,0.5)]"></div>
                        Marketplace Hub
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
                        Premium <span className="text-primary">Accounts</span>
                    </h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Secure transfer & lifetime warranty included
                    </p>
                </div>

                <div className="w-full md:w-[400px] relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for a game universe..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] py-6 pl-14 pr-8 text-xs font-black uppercase tracking-widest text-white placeholder:text-white/10 outline-none focus:border-primary/30 transition-all shadow-2xl relative z-10"
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {[
                    { label: 'Total Inventory', value: accounts.length, icon: Users, color: 'text-blue-400' },
                    { label: 'Active Universes', value: new Set(accounts.map(a => a.gameId?._id || a.gameId)).size, icon: Gamepad2, color: 'text-purple-400' },
                    { label: 'Instant Delivery', value: '100%', icon: Zap, color: 'text-primary' },
                    { label: 'Trust Rating', value: '4.9/5', icon: Star, color: 'text-orange-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                        <stat.icon className={`w-5 h-5 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                        <div className="text-xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-white/20">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeGames.length > 0 ? (
                    activeGames.map((game) => (
                        <div
                            key={game._id}
                            onClick={() => navigate(`/game/${game.slug || game._id}?mode=accounts`)}
                            className="group relative h-[380px] rounded-[3rem] overflow-hidden bg-[#0d0d0d] border border-white/[0.05] cursor-pointer transition-all duration-500 hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={getImageUrl(game.bgImage || game.image)}
                                    alt={game.name}
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-[1.5s]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/40 via-transparent to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col p-8 z-10">
                                {/* Top Badge */}
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-black/60 backdrop-blur-xl border border-white/10 p-2 group-hover:border-primary/40 transition-colors shadow-2xl">
                                        <img src={getImageUrl(game.icon)} className="w-full h-full object-contain" alt={game.name} />
                                    </div>
                                    <div className="px-4 py-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full flex items-center gap-2 group-hover:bg-primary transition-all">
                                        <TrendingUp className="w-3 h-3 text-primary group-hover:text-black" />
                                        <span className="text-[10px] font-black text-primary group-hover:text-black uppercase tracking-widest">{getAccountCount(game._id)} Listings</span>
                                    </div>
                                </div>

                                {/* Center Branding */}
                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-[1px] bg-primary"></span>
                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{game.category || 'Universal'}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-6 italic group-hover:text-primary transition-colors">
                                        {game.name}
                                    </h3>

                                    {/* Action Button */}
                                    <div className="flex items-center justify-between pt-6 border-t border-white/10 group-hover:border-primary/20 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Starting from</span>
                                            <span className="text-lg font-black text-white tracking-tighter italic">$24.99</span>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 group-hover:bg-primary rounded-2xl flex items-center justify-center transition-all duration-300">
                                            <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Overlay Accent */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                <Sparkles className="w-24 h-24 text-primary" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gamepad2 className="w-10 h-10 text-white/10" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Universes Found</h3>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Try searching for a different game or check back later.</p>
                        <button onClick={() => setSearchQuery('')} className="mt-8 px-10 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">Clear Search</button>
                    </div>
                )}
            </div>

            {/* Step Process */}
            <StepProcess />

            {/* Info Footer */}
            <div className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <ShieldCheck className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">Unmatched Account <span className="text-primary">Integrity</span></h2>
                    <p className="text-white/40 font-bold leading-relaxed mb-10 uppercase tracking-tight text-sm">
                        Every account listed in our marketplace undergoes a rigorous 24-point security audit. We guarantee the origin of every asset and provide full ownership documentation with every purchase.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { title: 'Verified Origin', desc: 'No cracked or stolen accounts' },
                            { title: 'Full Access', desc: 'Email & Password changeable' },
                            { title: 'Buyer Protection', desc: 'Lifetime recovery warranty' }
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{item.title}</span>
                                </div>
                                <p className="text-[10px] text-white/30 font-bold uppercase leading-tight">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsMode;
