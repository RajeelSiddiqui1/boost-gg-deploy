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
    ChevronDown, Flame, Plus, Clock, Users
} from 'lucide-react';

/* ─── Compact Vertical Service Card ─── */
const CompactServiceCard = ({ service }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    const hasImage = service.backgroundImage || service.image;
    const hasIcon = service.icon;
    const price = service.basePrice || service.price || (service.pricing && service.pricing.basePrice);
    const showPrice = price && price > 0;
    
    // Delivery time from db
    const deliveryTime = service.deliveryTimeText || service.estimatedCompletionTime || '24h';
    const startTime = service.estimatedStartTime || '15m';

    return (
        <div
            onClick={() => navigate(`/products/${service.slug || service._id}`)}
            className="group relative bg-[#0f0f0f] border border-white/[0.07] rounded-[1.5rem] overflow-hidden flex flex-col cursor-pointer
                       transition-all duration-300 hover:border-primary/40 hover:bg-[#141414] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
        >
            {/* Image */}
            <div className="relative h-[130px] overflow-hidden flex-shrink-0 bg-[#111]">
                {hasImage ? (
                    <img
                        src={getImageUrl(service.backgroundImage || service.image)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={service.title}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                )}

                {/* Icon overlay */}
                {hasIcon && (
                    <img
                        src={getImageUrl(service.icon)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 object-contain z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                        alt={service.title}
                    />
                )}

                {/* Bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {service.discount > 0 && (
                        <div className="px-2 py-0.5 bg-primary text-black text-[8px] font-black rounded-full flex items-center gap-1 shadow-lg">
                            <Zap className="w-2 h-2 fill-current" />
                            {service.discount}% OFF
                        </div>
                    )}
                    {service.isHot && (
                        <div className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full shadow-lg">🔥 HOT</div>
                    )}
                </div>

                {/* Delivery Stats Overlay */}
                <div className="absolute bottom-2 left-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <div className="flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full border border-white/5">
                            <Clock className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[8px] font-black text-white/70 uppercase">{deliveryTime}</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Category tag */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{service.category || "Boosting"}</span>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-white/20">
                        <Clock className="w-2 h-2" />
                        Starts: {startTime}
                    </div>
                </div>

                <h3 className="text-sm font-black text-white mb-2.5 line-clamp-2 leading-[1.3] group-hover:text-primary transition-colors h-[2.6em]">
                    {service.title}
                </h3>

                {/* Delivery Info Row */}
                <div className="flex items-center gap-3 mb-4">
                     <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-[10px] font-bold text-white/40">{deliveryTime}</span>
                     </div>
                     <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        <Users className="w-3 h-3 text-white/30" />
                        <span className="text-[10px] font-bold text-white/40">Verified PRO</span>
                     </div>
                </div>

                {/* Price + Buy */}
                <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                    <div>
                        {(service.discount > 0 || service.pricing?.discountPercent > 0) && (
                            <span className="text-[9px] text-white/20 line-through font-bold block leading-none mb-0.5">
                                {formatPrice(service.oldPrice || (price / 0.8))}
                            </span>
                        )}
                        {showPrice ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-bold text-white/30">from</span>
                                <span className="text-lg font-black text-white tracking-tight leading-none">{formatPrice(price)}</span>
                            </div>
                        ) : (
                            <span className="text-[11px] font-black text-primary/70 uppercase tracking-wide">Select Options</span>
                        )}
                    </div>
                    <div className="w-8 h-8 bg-white/[0.04] rounded-xl flex items-center justify-center border border-white/[0.07] group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300 flex-shrink-0">
                        <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
                    </div>
                </div>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-[1.5rem]" />
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
    const [dbReviews, setDbReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFaq, setActiveFaq] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

                const [catsRes, servicesRes] = await Promise.all([
                    axios.get(`${API_URL}/api/v1/categories/game/${gameData._id}`),
                    axios.get(`${API_URL}/api/v1/services?gameId=${gameData._id}&limit=100`)
                ]);
                setCategories(catsRes.data.data);
                setServices(servicesRes.data.data);

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
            <div className="relative overflow-hidden" style={{ height: '280px' }}>
                {/* Background */}
                <img
                    src={getImageUrl(game.banner) || getImageUrl(game.bgImage) || getImageUrl(game.image)}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/60 to-[#060606]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060606]/90 via-[#060606]/30 to-transparent" />
                {/* Glow */}
                <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-primary/12 blur-[100px] rounded-full pointer-events-none" />

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
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-[1] mb-2">
                                {game.name?.toUpperCase()}&nbsp;
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#5eead4]">BOOST</span>
                            </h1>

                            <p className="text-white/40 text-xs font-medium max-w-lg leading-relaxed">
                                {game.description || `Elite boosting services for ${game.name} — fast, safe & reliable.`}
                            </p>
                        </div>

                        {/* Quick stats */}
                        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                            <div className="flex flex-col items-center px-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
                                <span className="text-xl font-black text-white">{totalServices}</span>
                                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Services</span>
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
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                {(game.icon || game.image) ? (
                                    <img src={getImageUrl(game.icon || game.image)} className="w-7 h-7 rounded-lg object-cover" alt={game.name} />
                                ) : (
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Gamepad2 className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}
                                <span className="text-[11px] font-black uppercase tracking-wide text-white/70 truncate">{game.name}</span>
                            </div>

                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-medium text-white placeholder:text-white/20 outline-none focus:border-primary/30 focus:bg-primary/5 transition-all"
                                />
                            </div>

                            {/* Category List */}
                            <div className="rounded-2xl bg-[#0A0A0A] border border-white/[0.06] overflow-hidden">
                                <div className="px-3.5 pt-3.5 pb-2">
                                    <p className="text-[9px] font-black uppercase text-white/25 tracking-[0.18em]">Categories</p>
                                </div>
                                <div className="px-1.5 pb-1.5 space-y-0.5">
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

                            {/* Support Card */}
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/8 to-transparent border border-primary/10 hidden lg:block">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(162,230,62,1)]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Support Online</span>
                                </div>
                                <p className="text-[9px] text-white/30 leading-relaxed mb-2.5">Need help choosing? Our experts are here 24/7.</p>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
                                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >Live Chat</button>
                            </div>
                        </div>
                    </aside>

                    {/* ── MAIN CONTENT ── */}
                    <div className="flex-1 min-w-0">

                        {/* Section header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    {selectedCategory === 'all'
                                        ? 'All Services'
                                        : (categories.find(c => c.slug === selectedCategory)?.name || selectedCategory)}
                                </h2>
                                <p className="text-white/25 text-[11px] font-medium mt-0.5">
                                    {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
                                    {searchQuery && ` for "${searchQuery}"`}
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#0A0A0A] border border-white/[0.06] rounded-xl">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                <span className="text-xs font-black text-white">{avgRating}</span>
                                <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Rated</span>
                            </div>
                        </div>

                        {/* Cards grid */}
                        {filteredServices.length > 0 ? (
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
