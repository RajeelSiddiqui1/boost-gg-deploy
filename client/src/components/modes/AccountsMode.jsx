import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import {
    UserCircle, ShieldCheck, Zap, Search,
    Filter, LayoutGrid, ArrowRight, Star,
    CheckCircle2, Gauge, Award, Layers
} from 'lucide-react';

const AccountsMode = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGame, setSelectedGame] = useState('all');
    const [games, setGames] = useState([]);

    // Advanced Filters
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [selectedRank, setSelectedRank] = useState('all');
    const [hasSkinsOnly, setHasSkinsOnly] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('all');

    const { formatPrice } = useCurrency();
    const toast = useToast();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gamesRes, accountsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/v1/games?isActive=true`),
                    axios.get(`${API_URL}/api/v1/accounts`)
                ]);
                setGames(gamesRes.data.data);
                setAccounts(accountsRes.data.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredAccounts = accounts.filter(acc => {
        const matchesSearch = acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.rank?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGame = selectedGame === 'all' || acc.gameId?._id === selectedGame || acc.gameSlug === selectedGame;
        const matchesPrice = acc.price >= priceRange.min && acc.price <= priceRange.max;
        const matchesRank = selectedRank === 'all' || acc.rank === selectedRank;
        const matchesSkins = !hasSkinsOnly || (acc.specifications?.skinsCount > 0);
        const matchesRegion = selectedRegion === 'all' || acc.region === selectedRegion;

        return matchesSearch && matchesGame && matchesPrice && matchesRank && matchesSkins && matchesRegion;
    });

    const handleAddToCart = (account) => {
        const cartItem = {
            id: account._id,
            title: account.title,
            price: account.price,
            quantity: 1,
            image: account.thumbnail || account.gameId?.icon,
            mode: 'accounts',
            selectedOptions: {
                rank: account.rank,
                region: account.region,
                server: account.server
            }
        };
        addToCart(cartItem);
        toast.success(`Account added to cart`);
    };

    if (loading) {
        return (
            <div className="py-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 animate-fade-in">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <div className="w-8 h-px bg-primary/30"></div>
                        Premium Inventory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Verified Accounts</h1>
                    <p className="text-white/40 font-medium tracking-wide">Secure, instant-delivery accounts with guaranteed safety.</p>
                </div>

                <div className="w-full md:w-96 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by rank, skins, or items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-5 pl-12 pr-6 text-sm font-medium text-white placeholder:text-white/20 outline-none focus:border-primary/30 focus:bg-primary/5 transition-all shadow-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5" /> Filter by Game
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedGame('all')}
                                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${selectedGame === 'all' ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                All Universes
                            </button>
                            {games.map(game => (
                                <button
                                    key={game._id}
                                    onClick={() => setSelectedGame(game._id)}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${selectedGame === game._id ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    {game.name}
                                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedGame === game._id ? 'bg-black' : 'bg-white/10 group-hover:bg-primary'}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rank Filter */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Tier / Rank</h3>
                        <select
                            value={selectedRank}
                            onChange={(e) => setSelectedRank(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-white text-xs font-bold focus:border-primary/30 outline-none"
                        >
                            <option value="all">Any Rank</option>
                            <option value="Iron">Iron</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                            <option value="Master">Master</option>
                            <option value="Grandmaster">Grandmaster</option>
                            <option value="Challenger">Challenger</option>
                            <option value="Gladiator">Gladiator</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 font-bold">Price Range</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase pl-1">Min</label>
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase pl-1">Max</label>
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                                onClick={() => setHasSkinsOnly(!hasSkinsOnly)}
                                className={`w-10 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${hasSkinsOnly ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${hasSkinsOnly ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Has Skins Only</span>
                        </label>
                    </div>

                    {/* Trust Banner */}
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">Ironclad Account Safety</h4>
                        <p className="text-xs text-white/40 font-medium leading-relaxed">Every account is strictly audited for secure origin. 100% lifetime recovery protection included.</p>
                        <ul className="space-y-2">
                            {['Instant Delivery', 'Email Changeable', 'Lifetime Warranty'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60">
                                    <CheckCircle2 className="w-3 h-3 text-primary" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Grid */}
                <div className="lg:col-span-9">
                    {filteredAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAccounts.map(account => (
                                <div key={account._id} className="group bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden hover:border-primary/30 transition-all flex flex-col h-full shadow-2xl">
                                    {/* Image Section */}
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={account.thumbnail || getImageUrl(account.gameId?.icon)}
                                            alt={account.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>

                                        {/* Badges */}
                                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                                            <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Instant Delivery</div>
                                            {account.isFeatured && <div className="px-3 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Featured</div>}
                                        </div>

                                        <div className="absolute bottom-5 left-5 right-5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{account.gameId?.name}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{account.title}</h3>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-6 space-y-6 flex-1 flex flex-col">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center gap-2">
                                                <Award className="w-4 h-4 text-white/20" />
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Rank</p>
                                                    <p className="text-[10px] font-black text-white uppercase">{account.rank}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-white/20" />
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Skins</p>
                                                    <p className="text-[10px] font-black text-white uppercase">{account.specifications?.skinsCount || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {account.highlights?.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-white/40 uppercase tracking-widest transition-colors">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Owner Transfer included</p>
                                                <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(account.price)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(account)}
                                                className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(162,230,62,0.1)]"
                                            >
                                                <Zap className="w-5 h-5 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[40px]">
                            <LayoutGrid className="w-12 h-12 text-white/10 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white uppercase italic">Zero matches found</h3>
                            <p className="text-white/40 font-medium">Clear your filters or search for another term.</p>
                            <button onClick={() => { setSelectedGame('all'); setSearchQuery(''); }} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase rounded-full transition-all">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsMode;
