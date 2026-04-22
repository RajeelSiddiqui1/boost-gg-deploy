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
            {/* Search Section - Compact */}
            <div className="flex justify-end mb-8">
                <div className="w-full md:w-[400px] relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH FOR A GAME UNIVERSE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] py-5 pl-14 pr-8 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/10 outline-none focus:border-primary/30 transition-all shadow-2xl relative z-10"
                    />
                </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeGames.length > 0 ? (
                    activeGames.map((game) => (
                        <div
                            key={game._id}
                            onClick={() => navigate(`/game/${game.slug || game._id}?mode=accounts`)}
                            className="group relative h-52 rounded-[2.5rem] overflow-hidden bg-[#0d0d0d] border border-white/[0.05] cursor-pointer transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={getImageUrl(game.bgImage || game.image)}
                                    alt={game.name}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]"
                                />
                                {/* Overlay Gradient for readability */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col p-6 z-10 justify-between">
                                {/* Top Left: Game Name and Badge */}
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-3">
                                        {game.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full w-fit group-hover:bg-primary/20 transition-all">
                                        {game.name === 'Fortnite' ? <Sparkles className="w-3 h-3 text-primary" /> : <ShieldCheck className="w-3 h-3 text-primary" />}
                                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest whitespace-nowrap">
                                            {game.name === 'Fortnite' ? 'Rarest Skins' : 
                                             game.name === 'Clash of Clans' ? 'Premium Accounts' :
                                             game.name === 'Valorant' ? 'High Rank' : 'Active Offers'}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Right: Offers Count */}
                                <div className="self-end">
                                    <div className="px-4 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2 group-hover:border-primary/40 transition-all">
                                        <span className="text-xs font-black text-white tracking-tight">
                                            {getAccountCount(game._id)} <span className="text-[10px] text-white/40 uppercase tracking-widest ml-1">offers</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Subtle Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
