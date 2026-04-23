import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import {
 ChevronRight, Zap, Heart,
 Search, LayoutGrid, Star,
 ShieldCheck, Gamepad2,
 ChevronDown, Flame, Plus, Clock, Users,
 Award, Shield, Layers, Filter, CheckCircle2,
 ArrowRight, ShoppingCart
} from 'lucide-react';
import { useCart } from '../context/CartContext';

/* ─── Compact Account Card ─── */
const CompactAccountCard = ({ account }) => {
 const { formatPrice } = useCurrency();
 const { addToCart } = useCart();
 const toast = useToast();

 const handleAddToCart = (e) => {
 e.stopPropagation();
 const cartItem = {
 id: account._id,
 title: account.title,
 price: account.price,
 quantity: 1,
 image: account.thumbnail || account.gameId?.icon || account.screenshots?.[0],
 mode: 'accounts',
 selectedOptions: {
 rank: account.rank,
 region: account.region,
 server: account.server
 }
 };
 addToCart(cartItem);
 toast.success('Account added to cart');
 };

 return (
 <Link to={`/accounts/${account._id}`} className="group relative bg-[#0d0d0d] border border-white/[0.05] rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
 {/* Image Section */}
 <div className="relative h-48 overflow-hidden bg-[#111]">
 {account.screenshots?.[0] || account.thumbnail ? (
 <img
 src={getImageUrl(account.screenshots?.[0] || account.thumbnail)}
 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
 alt={account.title}
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
 <Users className="w-10 h-10 text-white/10" />
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-60"></div>
 
 {/* Badges */}
 <div className="absolute top-4 left-4 flex flex-col gap-2">
 {account.instantDelivery && (
 <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl flex items-center gap-1.5">
 <Zap className="w-2.5 h-2.5 fill-current" />
 Instant
 </div>
 )}
 </div>

 {/* Level Badge */}
 {account.level > 0 && (
 <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white/70">
 LVL {account.level}
 </div>
 )}
 </div>

 {/* Info Section */}
 <div className="p-6 flex flex-col flex-grow">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-[10px] font-black text-primary uppercase tracking-widest">{account.region}</span>
 <span className="w-1 h-1 bg-white/20 rounded-full"></span>
 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{account.server}</span>
 </div>
 
 <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
 {account.title}
 </h3>

 <div className="grid grid-cols-2 gap-2 mb-6">
 <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 flex items-center gap-2.5">
 <Award className="w-4 h-4 text-primary/60" />
 <div className="min-w-0">
 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Rank</p>
 <p className="text-[10px] font-black text-white uppercase truncate">{account.rank || 'N/A'}</p>
 </div>
 </div>
 <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 flex items-center gap-2.5">
 <Layers className="w-4 h-4 text-primary/60" />
 <div className="min-w-0">
 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Skins</p>
 <p className="text-[10px] font-black text-white uppercase truncate">{account.specifications?.skinsCount || 0}</p>
 </div>
 </div>
 </div>

 {/* Tags */}
 <div className="flex flex-wrap gap-1.5 mb-6">
 {account.highlights?.slice(0, 3).map((tag, i) => (
 <span key={i} className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-[8px] font-bold text-white/40 uppercase tracking-widest truncate max-w-full">{tag}</span>
 ))}
 </div>

 {/* Price and Action */}
 <div className="mt-auto pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
 <div className="flex flex-col">
 <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">One-time payment</span>
 <span className="text-2xl font-black text-white tracking-tighter ">{formatPrice(account.price)}</span>
 </div>
 <button 
 onClick={handleAddToCart}
 className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_10px_20px_rgba(162,230,62,0.15)] hover:scale-110 active:scale-95 transition-all"
 >
 <ShoppingCart className="w-5 h-5" />
 </button>
 </div>
 </div>
 </Link>
 );
};

/* ─── Compact Vertical Service Card ─── */
const CompactServiceCard = ({ service }) => {
 const navigate = useNavigate();
 const { formatPrice } = useCurrency();

 const hasImage = service.backgroundImage || service.image;
 const hasIcon = service.icon;
 const price = service.basePrice || service.price || (service.pricing && service.pricing.basePrice);
 const showPrice = price && price > 0;
 
 const deliveryTime = service.deliveryTimeText || service.estimatedCompletionTime || '24h';
 const startTime = service.estimatedStartTime || '15m';

 return (
 <div
 onClick={() => navigate(`/products/${service.slug || service._id}`)}
 className="group relative bg-[#0f0f0f] border border-white/[0.07] rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-full"
 >
 {/* Image */}
 <div className="relative h-40 overflow-hidden bg-[#111]">
 {hasImage ? (
 <img
 src={getImageUrl(service.backgroundImage || service.image)}
 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
 alt={service.title}
 />
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
 )}

 {hasIcon && (
 <img
 src={getImageUrl(service.icon)}
 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 object-contain z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
 alt={service.title}
 />
 )}

 <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

 {/* Badges */}
 <div className="absolute top-3 left-3 flex flex-col gap-1.5">
 {service.discount > 0 && (
 <div className="px-2 py-0.5 bg-primary text-black text-[8px] font-black rounded-full flex items-center gap-1 shadow-lg">
 <Zap className="w-2 h-2 fill-current" />
 {service.discount}% OFF
 </div>
 )}
 </div>
 </div>

 {/* Content */}
 <div className="p-5 flex flex-col flex-grow">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{service.category || "Boosting"}</span>
 <div className="flex items-center gap-1 text-[8px] font-bold text-white/20">
 <Clock className="w-2.5 h-2.5" />
 {startTime}
 </div>
 </div>

 <h3 className="text-sm font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
 {service.title}
 </h3>

 <div className="flex items-center gap-2 mb-6">
 <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
 <Shield className="w-3 h-3 text-white/30" />
 <span className="text-[9px] font-bold text-white/40 uppercase">Verified</span>
 </div>
 <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
 <Clock className="w-3 h-3 text-white/30" />
 <span className="text-[9px] font-bold text-white/40 uppercase">{deliveryTime}</span>
 </div>
 </div>

 <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
 <div>
 {showPrice ? (
 <div className="flex flex-col">
 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1 text-left">Starting at</span>
 <span className="text-xl font-black text-white tracking-tighter leading-none">{formatPrice(price)}</span>
 </div>
 ) : (
 <span className="text-[10px] font-black text-primary/70 uppercase tracking-wide">View Options</span>
 )}
 </div>
 <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/[0.07] group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300">
 <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
 </div>
 </div>
 </div>
 </div>
 );
};

/* ─── Main GameHub Page ─── */
const GameHub = () => {
 const { slug } = useParams();
 const [searchParams, setSearchParams] = useSearchParams();
 const navigate = useNavigate();

 const [game, setGame] = useState(null);
 const [categories, setCategories] = useState([]);
 const [services, setServices] = useState([]);
 const [accounts, setAccounts] = useState([]);
 const [dbReviews, setDbReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [activeFaq, setActiveFaq] = useState(0);
 const [isSaving, setIsSaving] = useState(false);
 const [isSaved, setIsSaved] = useState(false);

 // Account Filters
 const [accountFilters, setAccountFilters] = useState({
 rank: 'all',
 region: 'all',
 priceRange: 'all'
 });
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 12;

 const isAccountMode = searchParams.get('mode') === 'accounts';

 const { user, checkUserLoggedIn } = useAuth();
 const toast = useToast();

 useEffect(() => {
 const cat = searchParams.get('category');
 setSelectedCategory(cat ? cat.toLowerCase() : 'all');
 }, [searchParams]);

 useEffect(() => {
 if (user && game) setIsSaved(user.savedGames?.includes(game._id));
 }, [user, game]);

 useEffect(() => {
 const fetchData = async () => {
 try {
 setLoading(true);
 const gameRes = await axios.get(`${API_URL}/api/v1/games/slug/${slug}`);
 const gameData = gameRes.data.data;
 setGame(gameData);

 const requests = [
 axios.get(`${API_URL}/api/v1/categories/game/${gameData._id}`),
 axios.get(`${API_URL}/api/v1/services?gameId=${gameData._id}&limit=100`),
 axios.get(`${API_URL}/api/v1/accounts?gameId=${gameData._id}&status=active`)
 ];

 const [catsRes, servicesRes, accountsRes] = await Promise.all(requests);
 
 setCategories(catsRes.data.data);
 setServices(servicesRes.data.data);
 setAccounts(accountsRes.data.data);

 try {
 const reviewsRes = await axios.get(`${API_URL}/api/v1/reviews/game/${gameData._id}`);
 setDbReviews(reviewsRes.data.data || []);
 } catch { /* reviews optional */ }
 } catch (err) {
 console.error("Error fetching game data:", err);
 } finally {
 setLoading(false);
 }
 };
 if (slug) { fetchData(); window.scrollTo(0, 0); }
 }, [slug]);

 const handleToggleSave = async () => {
 if (!user) { toast.info('Please login to save games'); return; }
 if (!game?._id) return;
 try {
 setIsSaving(true);
 const token = localStorage.getItem('token');
 const res = await axios.post(`${API_URL}/api/v1/users/saved-games/${game._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
 if (res.data.success) { setIsSaved(res.data.isSaved); toast.success(res.data.message); await checkUserLoggedIn(); }
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to update favorites');
 } finally { setIsSaving(false); }
 };

 const handleCategoryChange = (categorySlug) => {
 setSelectedCategory(categorySlug);
 setSearchQuery('');
 if (categorySlug === 'all') { searchParams.delete('category'); }
 else { searchParams.set('category', categorySlug); }
 setSearchParams(searchParams);
 };

 const filteredServices = useMemo(() => {
 return services.filter(service => {
 const matchesCategory = selectedCategory === 'all' ||
 service.categorySlug === selectedCategory ||
 String(service.categoryId) === selectedCategory ||
 (service.category && service.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory);
 const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesCategory && matchesSearch;
 });
 }, [services, selectedCategory, searchQuery]);

 const filteredAccounts = useMemo(() => {
 return accounts.filter(acc => {
 const matchesSearch = acc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 acc.rank?.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesRank = accountFilters.rank === 'all' || acc.rank === accountFilters.rank;
 const matchesRegion = accountFilters.region === 'all' || acc.region === accountFilters.region;
 
 let matchesPrice = true;
 if (accountFilters.priceRange !== 'all') {
 const [min, max] = accountFilters.priceRange.split('-').map(Number);
 matchesPrice = acc.price >= min && (max ? acc.price <= max : true);
 }
 
 return matchesSearch && matchesRank && matchesRegion && matchesPrice;
 });
 }, [accounts, searchQuery, accountFilters]);

 // Reset pagination on filter change
 useEffect(() => {
 setCurrentPage(1);
 }, [searchQuery, accountFilters]);

 const paginatedAccounts = useMemo(() => {
 const startIndex = (currentPage - 1) * itemsPerPage;
 return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
 }, [filteredAccounts, currentPage]);

 const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

 // Dynamic Filter Options based on available accounts
 const filterOptions = useMemo(() => {
 const ranks = [...new Set(accounts.map(a => a.rank).filter(Boolean))];
 const regions = [...new Set(accounts.map(a => a.region).filter(Boolean))];
 return { ranks, regions };
 }, [accounts]);

 if (loading) {
 return (
 <div className="min-h-screen bg-[#070707] flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
 </div>
 );
 }

 if (!game) {
 return (
 <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-6 text-white text-center">
 <Gamepad2 className="w-20 h-20 text-white/10 mb-5" />
 <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Game Not Found</h1>
 <Link to="/" className="px-7 py-3.5 bg-primary text-black font-black uppercase text-xs rounded-full hover:bg-white transition-all">Back to Home</Link>
 </div>
 );
 }

 const faqs = [
 { q: `What is ${game.name} Boosting?`, a: `Boosting is a premium service where our verified professionals play on your behalf to achieve specific in-game milestones efficiently and safely.` },
 { q: "Is my account safe?", a: "Absolutely. We enforce bank-level security, premium localized VPNs, and rigorous PRO vetting to guarantee zero risk to your account." },
 { q: "When will my order begin?", a: "Industry-leading start time — the vast majority of our services commence within 15–30 minutes of payment confirmation." },
 { q: "Can I monitor the progress?", a: "Yes. You'll have direct communication with your assigned PRO and our 24/7 support team for real-time updates." }
 ];

 const fallbackReviews = [
 { name: "Alex K.", rating: 5, date: "2 hours ago", text: "Flawless execution. The team carried me through the hardest content without a single wipe." },
 { name: "Marcus R.", rating: 5, date: "5 hours ago", text: "Fastest delivery I've ever experienced. Highly recommend their currency services." },
 { name: "Elena V.", rating: 5, date: "Yesterday", text: "Super professional. Kept me updated the entire time and finished hours ahead of schedule." },
 { name: "David S.", rating: 5, date: "1 day ago", text: "Discreet and incredibly skilled. Will definitely be utilizing their services again." }
 ];

 const reviews = dbReviews.length > 0 ? dbReviews.map(r => ({
 name: r.reviewerName, rating: r.rating || 5,
 date: new Date(r.createdAt).toLocaleDateString(), text: r.text
 })) : fallbackReviews;

 // Stats derived from real backend data
 const totalServices = services.length;
 const avgRating = dbReviews.length > 0
 ? (dbReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / dbReviews.length).toFixed(1)
 : '4.9';

 return (
 <div className="min-h-screen bg-[#060606] text-white font-['Outfit'] selection:bg-primary/30">

 {/* ── HERO BANNER ── */}
 <div className="relative overflow-hidden" style={{ height: '320px' }}>
 {/* Background */}
 <img
 src={isAccountMode ? getImageUrl(`uploads/bg/${slug}.jpg`) : (getImageUrl(game.banner) || getImageUrl(game.bgImage) || getImageUrl(game.image))}
 alt={game.name}
 className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
 onError={(e) => { 
 if (isAccountMode) e.target.src = getImageUrl(game.banner || game.bgImage || game.image);
 else e.target.style.display = 'none'; 
 }}
 />
 {/* Gradients */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/80 to-[#060606]/20" />
 <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/40 to-transparent" />
 {/* Glow */}
 <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

 {/* Content */}
 <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-end pb-6">
 {/* Breadcrumb */}
 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/35 mb-3">
 <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</span>
 <ChevronRight className="w-3 h-3 text-white/20" />
 <span className="text-white/60">{game.name}</span>
 </div>

 <div className="flex items-end justify-between gap-4">
 <div className="flex-1">
 {/* Live badge */}
 <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full mb-2.5">
 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(162,230,62,0.9)]" />
 <span className="text-[8px] font-black uppercase tracking-widest text-white/60"><span className="text-white">50+</span> PROs Online</span>
 </div>

 {/* Title */}
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[0.9] mb-3 uppercase ">
 {game.name}&nbsp;
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary p-3 to-[#5eead4]">
 {isAccountMode ? 'ACCOUNTS' : 'BOOSTING'}
 </span>
 </h1>

 <p className="text-white/40 text-xs font-medium max-w-lg leading-relaxed">
 {game.description || `Elite boosting services for ${game.name} — fast, safe & reliable.`}
 </p>
 </div>

 {/* Quick stats */}
 <div className="hidden md:flex items-center gap-3 flex-shrink-0">
 <div className="flex flex-col items-center px-5 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl">
 <span className="text-2xl font-black text-white leading-none mb-1">{isAccountMode ? accounts.length : services.length}</span>
 <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">{isAccountMode ? 'Accounts' : 'Services'}</span>
 </div>
 <div className="flex flex-col items-center px-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
 <div className="flex items-center gap-1">
 <span className="text-xl font-black text-white">{avgRating}</span>
 <Star className="w-3.5 h-3.5 fill-primary text-primary" />
 </div>
 <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Rating</span>
 </div>
 <button
 onClick={handleToggleSave}
 className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${isSaved ? 'bg-primary/10 border-primary text-primary' : 'bg-black/40 border-white/10 text-white hover:bg-white/10'}`}
 >
 <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* ── MAIN LAYOUT: SIDEBAR + GRID ── */}
 <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-20">
 <div className="flex flex-col lg:flex-row gap-6 items-start">

 {/* ── SIDEBAR ── */}
 <aside className="w-full lg:w-[240px] flex-shrink-0">
 <div className="lg:sticky lg:top-[88px] space-y-2.5">

 {/* Game pill */}
 <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
 {(game.icon || game.image) ? (
 <img src={getImageUrl(game.icon || game.image)} className="w-7 h-7 rounded-lg object-cover" alt={game.name} />
 ) : (
 <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
 <Gamepad2 className="w-3.5 h-3.5 text-primary" />
 </div>
 )}
 <span className="text-[11px] font-black uppercase tracking-wide text-white/70">{game.name}</span>
 </div>

 {/* Search */}
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 placeholder={isAccountMode ? "Search accounts..." : "Search services..."}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 pl-10 pr-4 text-[11px] font-black uppercase text-white placeholder:text-white/20 outline-none focus:border-primary/40 transition-all shadow-inner"
 />
 </div>

 {/* Category List or Account Filters */}
 {!isAccountMode ? (
 <div className="rounded-2xl bg-[#0A0A0A] border border-white/[0.06] overflow-hidden">
 <div className="p-3">
 <p className="text-[9px] font-black uppercase text-white/25 tracking-[0.18em]">Categories</p>
 </div>
 <div className="p-3 space-y-0.5">
 {/* All */}
 <button
 onClick={() => handleCategoryChange('all')}
 className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all duration-200
 ${selectedCategory === 'all'
 ? 'text-black bg-primary shadow-[0_0_12px_rgba(162,230,62,0.2)]'
 : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <LayoutGrid className="w-3 h-3 flex-shrink-0" />
 <span className="flex-1 text-left">All Services</span>
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-black/20 text-black' : 'bg-white/5 text-white/30'}`}>
 {services.length}
 </span>
 </button>

 {categories.map((cat) => {
 const count = services.filter(s =>
 s.categorySlug === cat.slug ||
 String(s.categoryId) === String(cat._id) ||
 (s.category && s.category.toLowerCase().replace(/\s+/g, '-') === cat.slug)
 ).length;
 const isActive = selectedCategory === cat.slug;
 return (
 <button
 key={cat._id}
 onClick={() => handleCategoryChange(cat.slug)}
 className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all duration-200
 ${isActive ? 'text-white bg-white/8 border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <Flame className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-orange-400' : cat.isFeatured ? 'text-primary' : 'opacity-0'}`} />
 <span className="flex-1 text-left truncate">{cat.name}</span>
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/10 text-white/50' : 'bg-white/5 text-white/20'}`}>
 {count}
 </span>
 </button>
 );
 })}
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 {/* Rank Filter */}
 <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-4">
 <p className="text-[9px] font-black uppercase text-white/25 tracking-[0.18em] mb-3">Rank / Tier</p>
 <select 
 value={accountFilters.rank}
 onChange={(e) => setAccountFilters(p => ({ ...p, rank: e.target.value }))}
 className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black text-white uppercase outline-none focus:border-primary/40 appearance-none"
 >
 <option value="all" className="bg-[#0f0f0f]">Any Rank</option>
 {filterOptions.ranks.map(r => <option key={r} value={r} className="bg-[#0f0f0f]">{r}</option>)}
 </select>
 </div>

 {/* Region Filter */}
 <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-4">
 <p className="text-[9px] font-black uppercase text-white/25 tracking-[0.18em] mb-3">Region</p>
 <select 
 value={accountFilters.region}
 onChange={(e) => setAccountFilters(p => ({ ...p, region: e.target.value }))}
 className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black text-white uppercase outline-none focus:border-primary/40 appearance-none"
 >
 <option value="all" className="bg-[#0f0f0f]">Any Region</option>
 {filterOptions.regions.map(r => <option key={r} value={r} className="bg-[#0f0f0f]">{r}</option>)}
 </select>
 </div>

 {/* Price Range */}
 <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-4">
 <p className="text-[9px] font-black uppercase text-white/25 tracking-[0.18em] mb-3">Price Range</p>
 <select 
 value={accountFilters.priceRange}
 onChange={(e) => setAccountFilters(p => ({ ...p, priceRange: e.target.value }))}
 className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black text-white uppercase outline-none focus:border-primary/40 appearance-none"
 >
 <option value="all" className="bg-[#0f0f0f]">Any Price</option>
 <option value="0-50" className="bg-[#0f0f0f]">Under $50</option>
 <option value="50-150" className="bg-[#0f0f0f]">$50 - $150</option>
 <option value="150-300" className="bg-[#0f0f0f]">$150 - $300</option>
 <option value="300-10000" className="bg-[#0f0f0f]">$300+</option>
 </select>
 </div>
 </div>
 )}

 {/* Support Card */}
 <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/20 hidden lg:block relative overflow-hidden">
 <div className="absolute top-0 right-0 p-2 opacity-10">
 <Shield className="w-12 h-12" />
 </div>
 <div className="flex items-center gap-2 mb-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(162,230,62,1)]" />
 <span className="text-[9px] font-black uppercase tracking-widest text-primary">Secure Transfer</span>
 </div>
 <p className="text-[10px] text-white/40 leading-relaxed mb-4 font-bold uppercase tracking-tight">Need help choosing? Our experts are here 24/7.</p>
 <button
 onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
 className="w-full py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-lg shadow-primary/20"
 >Live Support</button>
 </div>
 </div>
 </aside>

 {/* ── MAIN CONTENT ── */}
 <div className="flex-1 min-w-0">

 {/* Section header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="text-2xl font-black text-white tracking-tighter uppercase ">
 {isAccountMode ? 'Verified Accounts' : (selectedCategory === 'all'
 ? 'All Boosting Services'
 : (categories.find(c => c.slug === selectedCategory)?.name || selectedCategory))}
 </h2>
 <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
 {isAccountMode ? filteredAccounts.length : filteredServices.length} {((isAccountMode ? filteredAccounts.length : filteredServices.length) === 1) ? (isAccountMode ? 'account' : 'service') : (isAccountMode ? 'accounts' : 'services')} found
 {searchQuery && ` matching "${searchQuery}"`}
 </p>
 </div>
 <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
 <div className="flex items-center gap-1.5">
 <Star className="w-3.5 h-3.5 fill-primary text-primary" />
 <span className="text-xs font-black text-white">{avgRating}</span>
 </div>
 <span className="w-px h-3 bg-white/10"></span>
 <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Client Reviews</span>
 </div>
 </div>

 {/* Cards grid */}
 {isAccountMode ? (
 filteredAccounts.length > 0 ? (
 <div className="space-y-12">
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {paginatedAccounts.map((account, idx) => (
 <div
 key={account._id}
 className="animate-fade-in-up"
 style={{ animationDelay: `${(idx % 9) * 40}ms` }}
 >
 <CompactAccountCard account={account} />
 </div>
 ))}
 </div>

 {/* Pagination UI */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-3 pt-8">
 <button
 onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
 disabled={currentPage === 1}
 className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${currentPage === 1 ? 'border-white/5 text-white/10' : 'border-white/10 text-white hover:bg-white/5 hover:border-primary/40'}`}
 >
 <ArrowRight className="w-5 h-5 rotate-180" />
 </button>
 
 <div className="flex items-center gap-2">
 {[...Array(totalPages)].map((_, i) => (
 <button
 key={i}
 onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
 className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
 >
 {i + 1}
 </button>
 ))}
 </div>

 <button
 onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
 disabled={currentPage === totalPages}
 className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${currentPage === totalPages ? 'border-white/5 text-white/10' : 'border-white/10 text-white hover:bg-white/5 hover:border-primary/40'}`}
 >
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 )}
 </div>
 ) : (
 <div className="py-24 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
 <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-5 border border-white/5">
 <Users className="w-8 h-8 text-white/10" />
 </div>
 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No Accounts Found</h3>
 <p className="text-white/30 font-medium text-xs max-w-xs text-center">We couldn't find any accounts matching your search or filters. Try adjusting them.</p>
 <button onClick={() => setAccountFilters({ rank: 'all', region: 'all', priceRange: 'all' })} className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10">
 Reset Filters
 </button>
 </div>
 )
 ) : (
 filteredServices.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
 {filteredServices.map((service, idx) => (
 <div
 key={service._id}
 className="animate-fade-in-up"
 style={{ animationDelay: `${(idx % 9) * 35}ms` }}
 >
 <CompactServiceCard service={service} />
 </div>
 ))}
 </div>
 ) : (
 <div className="py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl">
 <div className="w-14 h-14 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mb-3">
 <Search className="w-6 h-6 text-white/20" />
 </div>
 <h3 className="text-base font-black text-white uppercase tracking-tight mb-1">No Results</h3>
 <p className="text-white/30 font-medium text-xs">Try adjusting your filters or search.</p>
 <button onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }} className="mt-5 px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors">
 Clear Filters
 </button>
 </div>
 )
 )}
 </div>
 </div>
 </div>

 {/* ── FEATURES ── */}
 <div className="border-y border-white/5 bg-[#080808] py-20">
 <div className="max-w-[1400px] mx-auto px-6">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">
 The <span className="text-primary">BoostGG</span> Standard
 </h2>
 <p className="text-white/35 font-medium text-sm max-w-xl mx-auto">
 Uncompromising quality on every single order.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {[
 { Icon: ShieldCheck, title: 'Ironclad Security', desc: 'Elite VPNs matched to your locality, offline mode protocols, and hardware ID management.' },
 { Icon: Zap, title: 'Hyper-Fast Starts', desc: 'Operations commence within minutes of payment. Our global roster runs 24/7 with no queues.' },
 { Icon: Star, title: 'Top 1% Talent', desc: 'Rank 1 gladiators, world-first raiders, and e-sports veterans handle your orders personally.' },
 ].map(({ Icon, title, desc }, i) => (
 <div key={i} className="bg-[#0a0a0a] border border-white/[0.07] p-7 rounded-2xl hover:border-primary/30 transition-colors group">
 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/8 mb-5 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:border-primary/20">
 <Icon className="w-5 h-5 text-white/60 group-hover:text-primary transition-colors" />
 </div>
 <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">{title}</h3>
 <p className="text-white/35 font-medium leading-relaxed text-xs">{desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* ── REVIEWS ── */}
 <div className="py-20 overflow-hidden bg-[#060606]">
 <div className="max-w-[1400px] mx-auto px-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-1">
 {dbReviews.length > 0 ? `${dbReviews.length} Verified Reviews` : 'Verified Reviews'}
 </h2>
 <p className="text-white/25 font-medium text-xs">Real feedback from {game.name} clients.</p>
 </div>
 <div className="flex items-center gap-2.5 bg-[#0a0a0a] border border-white/[0.07] px-5 py-2.5 rounded-xl">
 <span className="text-xl font-black text-white">{avgRating}</span>
 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}</div>
 <span className="text-[9px] font-black uppercase text-white/25 tracking-widest pl-2.5 border-l border-white/10">Trustpilot</span>
 </div>
 </div>
 <div className="flex overflow-x-auto gap-4 pb-6 px-6 lg:px-[5vw] no-scrollbar snap-x snap-mandatory">
 {reviews.map((rev, i) => (
 <div key={i} className="min-w-[280px] md:min-w-[320px] bg-[#0a0a0a] border border-white/[0.07] p-6 rounded-2xl snap-center hover:bg-[#0f0f0f] transition-colors flex-shrink-0">
 <div className="flex items-center justify-between mb-4">
 <div className="flex gap-0.5">{[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
 <span className="text-[9px] font-bold text-white/20">{rev.date}</span>
 </div>
 <p className="text-sm text-white/60 font-medium leading-relaxed mb-5 line-clamp-3">"{rev.text}"</p>
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
 {rev.name.charAt(0)}
 </div>
 <div>
 <p className="text-[11px] font-black text-white uppercase tracking-wide">{rev.name}</p>
 <div className="text-[8px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 mt-0.5">
 <span className="w-1 h-1 bg-primary rounded-full" />
 Verified Buyer
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* ── FAQ ── */}
 <div className="py-20 bg-[#080808] border-t border-white/5">
 <div className="max-w-2xl mx-auto px-6">
 <div className="text-center mb-10">
 <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-2">FAQ</h2>
 <p className="text-white/25 font-medium text-xs">Common questions about {game.name} services.</p>
 </div>
 <div className="space-y-2">
 {faqs.map((faq, i) => (
 <div key={i} className={`rounded-2xl overflow-hidden transition-all duration-300 border ${activeFaq === i ? 'bg-white/[0.04] border-primary/20' : 'bg-[#0a0a0a] border-white/[0.07] hover:border-white/12'}`}>
 <button
 onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
 className="w-full flex items-center justify-between px-5 py-4 text-left"
 >
 <span className={`text-xs font-black uppercase tracking-wide transition-colors ${activeFaq === i ? 'text-white' : 'text-white/50'}`}>{faq.q}</span>
 <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-4 ${activeFaq === i ? 'bg-primary text-black' : 'bg-white/5 text-white/30'}`}>
 <ChevronDown className={`w-3 h-3 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
 </div>
 </button>
 <div className={`px-5 overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-[200px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
 <p className="text-white/40 font-medium leading-relaxed text-xs pt-2 border-t border-white/5">{faq.a}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <style>{`
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 @keyframes fade-in-up {
 from { opacity: 0; transform: translateY(12px); }
 to { opacity: 1; transform: translateY(0); }
 }
 .animate-fade-in-up {
 animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
 opacity: 0;
 }
 `}</style>
 </div>
 );
};

export default GameHub;
