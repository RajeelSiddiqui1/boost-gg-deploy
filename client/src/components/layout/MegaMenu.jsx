import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
 Search, ChevronRight, Zap, Trophy,
 Flame, Swords, Target, Ghost,
 TrendingUp, Users, Clock, MousePointer2,
 ShieldCheck, Star, X, Gamepad2
} from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const MegaMenu = ({ isOpen, onClose }) => {
 const [activeGameId, setActiveGameId] = useState(null);
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [categories, setCategories] = useState([]);
 const [categoriesLoading, setCategoriesLoading] = useState(false);
 const [categoriesCache, setCategoriesCache] = useState({});
 const { searchTerm, setSearchTerm } = useUI();

 const filteredGames = games.filter(game =>
 (game.name || game.title || '').toLowerCase().includes(searchTerm.toLowerCase())
 );

 // Auto-select first result when searching
 useEffect(() => {
 if (searchTerm && filteredGames.length > 0) {
 const isCurrentMatch = filteredGames.some(g => g._id === activeGameId);
 if (!isCurrentMatch) {
 setActiveGameId(filteredGames[0]._id);
 }
 }
 }, [searchTerm, filteredGames, activeGameId]);

 // Fetch games for the left sidebar
 useEffect(() => {
 if (isOpen) {
 setLoading(true);
 axios.get(`${API_URL}/api/v1/games`)
 .then(res => {
 const fetchedGames = res.data.data || [];
 setGames(fetchedGames);
 // Default to first game if available
 if (fetchedGames.length > 0 && !activeGameId) {
 setActiveGameId(fetchedGames[0]._id);
 }
 setLoading(false);
 })
 .catch(err => {
 console.error("Error fetching games for mega menu:", err);
 setLoading(false);
 });
 }
 }, [isOpen]);

 // Fetch real categories when activeGameId changes
 useEffect(() => {
 if (!activeGameId) return;

 // Use cache if available
 if (categoriesCache[activeGameId]) {
 setCategories(categoriesCache[activeGameId]);
 return;
 }

 setCategoriesLoading(true);
 axios.get(`${API_URL}/api/v1/categories/game/${activeGameId}`)
 .then(res => {
 const fetched = res.data.data || [];
 setCategories(fetched);
 setCategoriesCache(prev => ({ ...prev, [activeGameId]: fetched }));
 })
 .catch(err => {
 console.error("Error fetching categories for mega menu:", err);
 setCategories([]);
 })
 .finally(() => setCategoriesLoading(false));
 }, [activeGameId]);

 // Icon mapping based on category name keywords
 const getIconForCategory = (name = '') => {
 const n = name.toLowerCase();
 if (n.includes('gold') || n.includes('coin') || n.includes('currency')) return Star;
 if (n.includes('level') || n.includes('power') || n.includes('boost')) return Zap;
 if (n.includes('raid') || n.includes('war') || n.includes('battle')) return Swords;
 if (n.includes('dungeon') || n.includes('ghost')) return Ghost;
 if (n.includes('pvp') || n.includes('rank') || n.includes('arena')) return Target;
 if (n.includes('coach') || n.includes('train') || n.includes('learn')) return Users;
 if (n.includes('account') || n.includes('shield') || n.includes('safe')) return ShieldCheck;
 if (n.includes('item') || n.includes('gear') || n.includes('equip') || n.includes('legend')) return Trophy;
 if (n.includes('trend') || n.includes('stat')) return TrendingUp;
 if (n.includes('click') || n.includes('mouse')) return MousePointer2;
 if (n.includes('flame') || n.includes('hot')) return Flame;
 return Gamepad2;
 };

 if (!isOpen) return null;

 const activeGame = games.find(g => g._id === activeGameId) || games[0];

 return (
 <div className="fixed inset-x-0 bottom-0 top-[72px] z-[200] animate-in fade-in duration-300 font-['Outfit']">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

 {/* Menu Container */}
 <div className="relative h-full flex flex-col bg-[#0a0a0a]/95 text-white overflow-hidden">
 {/* Close Button */}
 <button
 onClick={onClose}
 className="absolute top-6 right-8 z-[210] p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-white/40 hover:text-white group"
 >
 <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
 </button>

 <div className="flex-1 overflow-hidden">
 <div className="max-w-[1400px] mx-auto w-full h-full p-4 md:p-8 flex flex-col">
 {/* Header Area */}
 <div className="flex items-center justify-between mb-8 flex-shrink-0">
 <div>
 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-2">
 Select <span className="text-primary">Your Game</span>
 </h2>
 <p className="text-white/40 text-sm font-medium">
 Choose a game to explore available boosting services and offers.
 </p>
 </div>
 </div>

 {/* Main Grid Content */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-24 md:pb-0">
 {/* LEFT COLUMN: Popular Games List */}
 <div className="col-span-1 md:col-span-3 md:border-r border-white/5 md:pr-4 flex flex-col min-h-[300px] md:min-h-0">
 <h3 className="text-white/40 text-[11px] font-black uppercase tracking-widest mb-4 px-3">
 {searchTerm ? 'Search Results' : 'Explore Games'}
 </h3>
 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar scrollbar-hide">
 {loading ? (
 <div className="text-white/20 text-sm px-3">Loading titles...</div>
 ) : (
 <div className="space-y-6">
 {/* Popular Games Section (Only if not searching) */}
 {!searchTerm && games.some(g => g.isPopular) && (
 <div className="space-y-1">
 <div className="px-3 mb-2 flex items-center gap-2">
 <Flame className="w-3.5 h-3.5 text-primary" />
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Popular</span>
 </div>
 {games.filter(g => g.isPopular).map(game => (
 <button
 key={game._id}
 onMouseEnter={() => setActiveGameId(game._id)}
 onClick={() => setActiveGameId(game._id)}
 className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between group transition-all duration-300 ${activeGameId === game._id
 ? 'bg-primary text-black shadow-[0_10px_20px_rgba(162,230,62,0.2)]'
 : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'
 }`}
 >
 <div className="flex items-center gap-3 truncate">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeGameId === game._id ? 'bg-black/20 border-black/10' : 'bg-white/5 border-white/5 group-hover:border-primary/20'}`}>
 <img src={getImageUrl(game.icon)} className="w-5 h-5 object-contain" alt="" />
 </div>
 <span className="truncate font-black uppercase tracking-tight text-[12px]">{game.name || game.title}</span>
 </div>
 {activeGameId === game._id && <ChevronRight className="w-4 h-4" />}
 </button>
 ))}
 </div>
 )}

 {/* Search Results or All Games */}
 <div className="space-y-1">
 {!searchTerm && games.some(g => g.isPopular) && (
 <div className="px-3 mb-2 pt-2 border-t border-white/5 flex items-center gap-2">
 <Gamepad2 className="w-3.5 h-3.5 text-white/20" />
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">All Games</span>
 </div>
 )}
 {(searchTerm ? filteredGames : games).map(game => (
 <button
 key={game._id}
 onMouseEnter={() => setActiveGameId(game._id)}
 onClick={() => setActiveGameId(game._id)}
 className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeGameId === game._id
 ? 'text-primary bg-primary/5'
 : 'text-white/40 hover:text-white hover:bg-white/5'
 }`}
 >
 <img src={getImageUrl(game.icon)} className={`w-4 h-4 object-contain transition-opacity ${activeGameId === game._id ? 'opacity-100' : 'opacity-30'}`} alt="" />
 <span className="text-[12px] font-bold tracking-tight">{game.name || game.title}</span>
 </button>
 ))}
 </div>

 {searchTerm && filteredGames.length === 0 && (
 <div className="px-3 py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
 <Search className="w-6 h-6 text-white/10 mx-auto mb-2" />
 <div className="text-white/30 text-xs font-bold ">No titles match "{searchTerm}"</div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* MIDDLE COLUMN: Categories */}
 <div className="col-span-1 md:col-span-6 px-0 md:px-4 overflow-y-auto custom-scrollbar scrollbar-hide py-8 md:py-0 border-t md:border-t-0 border-white/5">
 <h3 className="text-white/40 text-[11px] font-black uppercase tracking-widest mb-6">
 Categories {activeGame && <span className="text-primary ">— {activeGame.name || activeGame.title}</span>}
 </h3>
 {activeGame && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6">
 {categoriesLoading ? (
 <div className="col-span-2 py-8 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
 Loading categories...
 </div>
 ) : categories.length === 0 ? (
 <div className="col-span-2 py-8 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
 No categories found
 </div>
 ) : (
 categories.map((cat) => {
 const IconComponent = getIconForCategory(cat.name);
 return (
 <Link
 key={cat._id}
 to={`/game/${activeGame.slug || activeGame._id}?category=${cat.slug || cat._id}`}
 onClick={onClose}
 className="group flex items-start gap-4 p-4 rounded-2xl border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
 >
 <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
 <IconComponent className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
 </div>
 <div className="flex flex-col">
 <span className="text-white font-black uppercase tracking-wider text-[11px] md:text-[12px] group-hover:text-primary transition-colors mb-0.5">
 {cat.name}
 </span>
 <span className="text-white/30 text-[9px] md:text-[10px] font-bold uppercase tracking-tighter group-hover:text-white/60 transition-colors">
 {cat.description || 'View services'}
 </span>
 </div>
 </Link>
 );
 })
 )}
 <div className="col-span-1 sm:col-span-2 mt-4 pt-6 border-t border-white/5">
 <div className="flex items-center gap-2 text-[#FFB800] mb-4">
 <Clock className="w-4 h-4" />
 <span className="text-[13px] font-black uppercase tracking-wide">Last Chance Offers</span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group/offer">
 <div className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-1">Shadowlands</div>
 <div className="flex items-center justify-between">
 <div className="text-primary font-black text-lg tracking-tighter">$149.00</div>
 <ChevronRight className="w-4 h-4 text-white/10 group-hover/offer:translate-x-1 transition-transform" />
 </div>
 </div>
 <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group/offer">
 <div className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-1">Dragonflight</div>
 <div className="flex items-center justify-between">
 <div className="text-primary font-black text-lg tracking-tighter">$39.00</div>
 <ChevronRight className="w-4 h-4 text-white/10 group-hover/offer:translate-x-1 transition-transform" />
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* RIGHT COLUMN: Pick of the Day */}
 <div className="hidden md:block col-span-3 overflow-y-auto custom-scrollbar scrollbar-hide py-8 md:py-0 border-t md:border-t-0 border-white/5">
 {activeGame && (
 <div className="flex flex-col gap-6">
 <h3 className="text-white/40 text-[11px] font-black uppercase tracking-widest px-1">
 Pick of the day
 </h3>
 <div className="relative group cursor-pointer">
 <div className="h-[240px] sm:h-[300px] md:h-[400px] lg:h-[300px] rounded-[32px] overflow-hidden border border-white/10 relative">
 <img
 src={getImageUrl(activeGame.bgImage || activeGame.characterImage)}
 alt="Featured"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
 <div className="absolute bottom-5 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
 <div className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3">
 Hot Deal
 </div>
 <h4 className="text-white text-[17px] md:text-xl font-black uppercase leading-tight mb-1.5 md:mb-2 text-shadow-lg">
 Best {activeGame.name || activeGame.title} Services
 </h4>
 <p className="text-white/60 text-[10px] md:text-xs font-medium mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">
 Experience the game like never before with our top-tier boosting.
 </p>
 <Link
 to={activeGame.slug === 'wow' ? '/wow-boost' : `/game/${activeGame.slug || activeGame._id}`}
 onClick={onClose}
 className="block w-full text-center bg-white text-black py-3.5 md:py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
 >
 View Offers
 </Link>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Bottom Bar / Footer inside mega menu */}
 <div className="bg-[#050505] border-t border-white/5 py-6 md:py-4 flex-shrink-0">
 <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between text-white/30 text-[12px] gap-4">
 <div className="flex gap-4 md:gap-6 font-bold uppercase tracking-widest text-[10px] md:text-[12px]">
 <span>Trustpilot 4.9/5</span>
 <span className="hidden sm:inline">24/7 Support</span>
 <span className="hidden sm:inline">Secure Payments</span>
 </div>
 <div className="font-bold text-[10px] md:text-[12px]">
 BOOSTGG © 2026
 </div>
 </div>
 </div>
 </div>

 <style>{`
 .scrollbar-hide::-webkit-scrollbar {
 display: none;
 }
 .scrollbar-hide {
 -ms-overflow-style: none;
 scrollbar-width: none;
 }
 `}</style>
 </div>
 );
};

export default MegaMenu;
