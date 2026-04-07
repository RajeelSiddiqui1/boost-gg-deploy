import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getImageUrl } from '../utils/api';
import ServiceCard from '../components/ui/ServiceCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    ChevronRight, Zap, Shield, Clock, Heart,
    Search, LayoutGrid, Star, MessageSquare,
    ChevronLeft, ShieldCheck, Gamepad2,
    ChevronDown, Flame
} from 'lucide-react';

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
    const navRef = useRef(null);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setSelectedCategory(cat.toLowerCase());
        } else {
            setSelectedCategory('all');
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && game) {
            setIsSaved(user.savedGames?.includes(game._id));
        }
    }, [user, game]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const gameRes = await axios.get(`${API_URL}/api/v1/games/slug/${slug}`);
                const gameData = gameRes.data.data;
                setGame(gameData);

                const catsRes = await axios.get(`${API_URL}/api/v1/categories/game/${gameData._id}`);
                setCategories(catsRes.data.data);

                const servicesRes = await axios.get(`${API_URL}/api/v1/services?gameId=${gameData._id}&limit=100`);
                setServices(servicesRes.data.data);

                try {
                    const reviewsRes = await axios.get(`${API_URL}/api/v1/reviews/game/${gameData._id}`);
                    setDbReviews(reviewsRes.data.data || []);
                } catch (reviewErr) {
                    console.error("Error fetching reviews:", reviewErr);
                }
            } catch (err) {
                console.error("Error fetching game data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
        window.scrollTo(0, 0);
    }, [slug]);

    const handleToggleSave = async () => {
        if (!user) {
            toast.info('Please login to save games to your favorites');
            return;
        }
        if (!game?._id) return;

        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/v1/users/saved-games/${game._id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                setIsSaved(res.data.isSaved);
                toast.success(res.data.message);
                await checkUserLoggedIn();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update favorites');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCategoryChange = (categorySlug) => {
        setSelectedCategory(categorySlug);
        setSearchQuery(''); // Reset search on category change
        if (categorySlug === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', categorySlug);
        }
        setSearchParams(searchParams);
    };

    const scrollNav = (direction) => {
        if (navRef.current) {
            const scrollAmount = 300;
            if (direction === 'left') {
                navRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
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
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-6 text-white text-center">
                <Gamepad2 className="w-24 h-24 text-white/10 mb-6" />
                <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Realm Not Found</h1>
                <Link to="/" className="px-8 py-4 bg-primary text-black font-black uppercase text-xs rounded-full hover:bg-white transition-all">Back to Home</Link>
            </div>
        );
    }

    const faqs = [
        { q: `What is ${game.name} Boosting?`, a: `Boosting is a premium service where our verified professionals play with you or on your behalf to achieve specific in-game milestones efficiently and safely.` },
        { q: "Is my account safe during the process?", a: "Absolutely. We enforce bank-level security, utilize premium localized VPNs, and employ rigorous PRO vetting to guarantee zero risk to your account." },
        { q: "When will my order begin?", a: "We boast an industry-leading start time. The vast majority of our services commence within 15 to 30 minutes of payment confirmation." },
        { q: "Can I monitor the progress?", a: "Yes. You will have direct communication with your assigned PRO and our 24/7 support team for real-time updates and streaming options." }
    ];

    const fallbackReviews = [
        { name: "Alex K.", rating: 5, date: "2 hours ago", text: "Flawless execution. The team carried me through the hardest content without a single wipe." },
        { name: "Marcus R.", rating: 5, date: "5 hours ago", text: "Fastest delivery I've ever experienced. Highly recommend their currency services." },
        { name: "Elena V.", rating: 5, date: "Yesterday", text: "Super professional. Kept me updated the entire time and finished hours ahead of schedule." },
        { name: "David S.", rating: 5, date: "1 day ago", text: "Discreet and incredibly skilled. Will definitely be utilizing their premium services again." }
    ];

    const reviews = dbReviews.length > 0 ? dbReviews.map(r => ({
        name: r.reviewerName,
        rating: r.rating || 5,
        date: new Date(r.createdAt).toLocaleDateString(),
        text: r.text
    })) : fallbackReviews;

    return (
        <div className="min-h-screen bg-[#060606] text-white font-['Outfit'] selection:bg-primary/30 scroll-smooth">

            {/* --- PREMIUM HERO SECTION --- */}
            <div className="relative min-h-[75vh] 2xl:min-h-[60vh] flex items-end pb-32 pt-40 overflow-hidden">
                {/* Background Composition */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={getImageUrl(game.banner) || getImageUrl(game.bgImage) || getImageUrl(game.image)}
                        alt={game.name}
                        className="w-full h-full object-cover object-[center_20%] opacity-60 scale-105"
                    />
                    {/* Dark gradient mapping from bottom up to blend with the page */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/40 to-transparent"></div>

                    {/* Vibrant brand glow behind text */}
                    <div className="absolute bottom-0 left-[-10%] w-[50vw] h-[50vw] bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 w-full relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-8">
                        <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</span>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                        <span className="text-white">{game.name}</span>
                    </div>

                    <div className="max-w-4xl flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-20">
                        <div className="flex-1 animate-fade-in-up">
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full mb-6 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-default">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(162,230,62,0.8)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80"><span className="text-white">50+</span> PROs Online</span>
                            </div>

                            {/* Massive Title */}
                            <h1 className="text-6xl md:text-[5rem] lg:text-[6rem] font-black text-white tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">
                                {game.name?.toUpperCase()} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#5eead4]">SERVICES</span>
                            </h1>

                            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-10">
                                {game.description || `Dominate ${game.name} with our elite roster of verified professionals. Fast, secure, and tailored to your exact needs.`}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <button onClick={() => window.scrollTo({ top: navRef.current?.offsetTop - 80, behavior: 'smooth' })} className="px-10 py-5 bg-primary text-black font-black uppercase tracking-[0.1em] text-[13px] rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(162,230,62,0.3)] hover:shadow-[0_0_40px_rgba(162,230,62,0.5)] active:scale-95">
                                    Browse Solutions
                                </button>

                                <button
                                    onClick={handleToggleSave}
                                    className={`group flex items-center justify-center w-16 h-16 rounded-full border transition-all ${isSaved ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    <Heart className={`w-5 h-5 transition-transform group-active:scale-90 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Game Stats Cards (Desktop) */}
                        <div className="hidden md:flex flex-col gap-4 min-w-[280px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="p-6 rounded-[24px] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Services</p>
                                    <p className="text-3xl font-black text-white tracking-tighter">{services.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <LayoutGrid className="w-5 h-5 text-white/60" />
                                </div>
                            </div>
                            <div className="p-6 rounded-[24px] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Average Rating</p>
                                    <p className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">4.9 <Star className="w-5 h-5 fill-primary text-primary" /></p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <MessageSquare className="w-5 h-5 text-white/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TWO-COLUMN LAYOUT (SIDEBAR + GRID) --- */}
            <div className="max-w-[1400px] mx-auto px-6 py-20 flex flex-col lg:flex-row gap-12 min-h-[50vh]">

                {/* --- SIDEBAR --- */}
                <aside className="lg:w-[300px] flex-shrink-0 animate-fade-in-up">
                    <div className="lg:sticky lg:top-32 space-y-10">
                        {/* Search Bar in Sidebar */}
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white placeholder:text-white/20 outline-none focus:border-primary/30 focus:bg-primary/5 transition-all"
                            />
                        </div>

                        {/* Category List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] pl-2">Filter Categories</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 border
                                        ${selectedCategory === 'all'
                                            ? 'text-black bg-primary border-primary shadow-[0_0_20px_rgba(162,230,62,0.2)]'
                                            : 'text-white/40 bg-white/[0.02] border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    All Services
                                </button>

                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 border
                                            ${selectedCategory === cat.slug
                                                ? 'text-black bg-white border-white'
                                                : 'text-white/40 bg-white/[0.02] border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {cat.isFeatured && <Flame className={`w-4 h-4 ${selectedCategory === cat.slug ? 'text-orange-500' : 'text-primary'}`} />}
                                            {cat.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Social/Status Card */}
                        <div className="p-6 rounded-[32px] bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hidden lg:block">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(162,230,62,1)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/80">Support Online</span>
                            </div>
                            <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-4">Need help choosing the right boost? Our experts are here 24/7.</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >Open Live Chat</button>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                                {selectedCategory === 'all' ? 'Elite Solutions' : categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                            </h2>
                            <p className="text-white/40 mt-3 font-medium text-sm md:text-base tracking-wide italic">Showing {filteredServices.length} verified results across {game.name}.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service, idx) => (
                                <div key={service._id} className="animate-fade-in-up" style={{ animationDelay: `${(idx % 8) * 50}ms` }}>
                                    <div className="h-full">
                                        <ServiceCard service={service} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[40px]">
                                <div className="w-24 h-24 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Matches Found</h3>
                                <p className="text-white/40 font-medium">Try verifying your category filters.</p>
                                <button onClick={() => handleCategoryChange('all')} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-colors">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PREMIUM FEATURES SECTION --- */}
            <div className="border-y border-white/5 bg-[#080808] relative overflow-hidden py-32">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none"></div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">
                            The <span className="text-primary">BoostGG</span> Standard
                        </h2>
                        <p className="text-white/50 text-xl font-medium">
                            Experience flawless execution. We don't just complete orders; we elevate your entire gaming journey with uncompromising quality.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] hover:border-primary/30 transition-colors group">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:border-primary/20">
                                <ShieldCheck className="w-8 h-8 text-white/80 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Ironclad Security</h3>
                            <p className="text-white/40 font-medium leading-relaxed">
                                Elite VPNs mapped to your locality, offline mode protocols, and strictly managed hardware IDs ensure your account stays untouched by ban-waves.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] hover:border-primary/30 transition-colors group">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:border-primary/20">
                                <Zap className="w-8 h-8 text-white/80 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Hyper-Fast Starts</h3>
                            <p className="text-white/40 font-medium leading-relaxed">
                                Our massive roster runs 24/7. Your order is claimed and operations commence within minutes of your payment clearing. No queues.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] hover:border-primary/30 transition-colors group">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:border-primary/20">
                                <Star className="w-8 h-8 text-white/80 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Top 1% Talent</h3>
                            <p className="text-white/40 font-medium leading-relaxed">
                                We only recruit proven champions. E-Sports veterans, rank 1 gladiators, and world-first raiders handle your requests personally.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- REVIEWS SLIDER --- */}
            <div className="py-32 overflow-hidden bg-[#060606]">
                <div className="max-w-[1400px] mx-auto px-6 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">Verified Echoes</h2>
                        <p className="text-white/40 font-medium">Real feedback from recent {game.name} clients.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/10 px-8 py-4 rounded-[24px]">
                        <span className="text-3xl font-black text-white">4.9</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                        </div>
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-4 border-l border-white/10">Trustpilot</span>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-12 px-6 lg:px-[10vw] no-scrollbar snap-x snap-mandatory">
                    {reviews.map((rev, i) => (
                        <div key={i} className="min-w-[350px] md:min-w-[420px] bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] snap-center hover:bg-[#0f0f0f] transition-colors">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}
                                </div>
                                <span className="text-xs font-bold text-white/30">{rev.date}</span>
                            </div>
                            <p className="text-lg text-white/80 font-medium leading-relaxed mb-10 line-clamp-4">"{rev.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/50 text-xl">
                                    {rev.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-widest">{rev.name}</p>
                                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                        Verified Buyer
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- FAQ SECTION --- */}
            <div className="py-32 bg-[#080808] border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">Knowledge Base</h2>
                        <p className="text-white/40 font-medium">Common inquiries regarding {game.name} services.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`rounded-[24px] overflow-hidden transition-all duration-300 border ${activeFaq === i ? 'bg-white/[0.05] border-primary/30' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}>
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                                    className="w-full flex items-center justify-between p-8 text-left"
                                >
                                    <span className={`text-base font-black uppercase tracking-wide transition-colors ${activeFaq === i ? 'text-white' : 'text-white/70'}`}>
                                        {faq.q}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-primary text-black' : 'bg-white/5 text-white/50'}`}>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-[500px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-white/50 font-medium leading-relaxed pt-2 border-t border-white/5">
                                        {faq.a}
                                    </p>
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
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>

        </div>
    );
};

export default GameHub;
