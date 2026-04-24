import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api';
import {
    Zap, DollarSign, Clock, ShieldCheck,
    ChevronRight, ArrowRight, CheckCircle2,
    Users, Gamepad2, Trophy, Mail, MessageSquare,
    Loader2, Send, Layout, Headphones, Briefcase,
    Globe, Shield, TrendingUp, Star, Video,
    Share2, Monitor, HelpCircle, ChevronDown, Edit3, X,
    ThumbsUp, Package, FileText, Wrench
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BecomePro = () => {
    const { user } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('booster');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        discord: '',
        telegram: '',
        games: [],
        hoursPerDay: '4-8h',
        experienceText: '',
        referralSource: ''
    });

    const [allGames, setAllGames] = useState([]);
    const [gameSearch, setGameSearch] = useState('');
    const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/games`);
                setAllGames(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch games:', err);
            }
        };
        fetchGames();
    }, []);

    const scrollToForm = () => {
        const target = document.getElementById('application-form');
        if (target) {
            const yOffset = -120;
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const roles = [
        {
            id: 'booster',
            title: 'Booster',
            desc: 'You dominate in PvP or crush PvE? Turn that grind into income. Earn a decent amount in real money — never get caught lacking. You bring the skills, we bring the clients.',
            button: 'Become Booster',
            icon: Zap,
            image: '/become-pro/booster-role.jpg',
            bgGradient: 'bg-[#0A0A0A]'
        },
        {
            id: 'gold_seller',
            title: 'Gold Seller',
            desc: 'Get a choice of gold or in-game currency on your own terms for you. Earn high amounts in coins — safety first, we take all the hassle. You farm, we handle the rest.',
            button: 'Become Seller',
            icon: DollarSign,
            image: '/become-pro/gold-seller.jpg',
            bgGradient: 'bg-[#0A0A0A]'
        },
        {
            id: 'account_seller',
            title: 'Account Seller',
            desc: 'Put together accounts and collecting items? Sell them on a fast and secure market. Inventory is yours, sell it on your terms. Inventory is your store style on Time.',
            button: 'Become Seller',
            icon: Briefcase,
            image: '/become-pro/account-seller.jpg',
            bgGradient: 'bg-[#0A0A0A]'
        },
        {
            id: 'content_creator',
            title: 'Content Creator',
            desc: 'Make top guides, meta setups, tier lists, drop insights, or share news? Master the game, make your name known, earn insights, or share meta setups, we want it.',
            button: 'Become Creator',
            icon: Video,
            image: '/become-pro/content-creator.jpg',
            bgGradient: 'bg-[#0A0A0A]'
        },
        {
            id: 'influencer_partner',
            title: 'Influencer',
            desc: 'Got a ton of views or a growing channel? Partner with BoostGG and offer the best login and item drops to your subs while you earn an insane rate on what your sub follows is.',
            button: 'Become Influencer',
            icon: Share2,
            image: '/become-pro/influencer.jpg',
            bgGradient: 'bg-[#0A0A0A]'
        }
    ];

    const benefits = [
        { title: 'Real money, for real skills.', icon: DollarSign, desc: 'Keep your focus on games — we get you paid for it. We take over your game, take the orders you want, and we handle the rest.' },
        { title: 'Live, bro-level support', icon: ThumbsUp, desc: 'We\'ve got your back — our support is available around the clock and get results — tracking with frequent deals for playing with a checked support.' },
        { title: 'Nonstop orders', icon: Package, desc: 'Never get the feeling you\'re sitting out. Tons of daily orders. You\'ll never be short on work.' },
        { title: 'Fast & clean payouts', icon: FileText, desc: 'Get paid faster than any other site out there. No delays, no drama.' },
        { title: 'Talk directly to your clients', icon: MessageSquare, desc: 'Clear communication handles things easily. Deliver fast and directly.' },
        { title: 'One-click interface', icon: Wrench, desc: 'The best-in-class UI allows you to focus on playing and earning without hassle.' }
    ];

    const testimonials = [
        { text: "BoostGG is simply incredible. The platform handles disputes fast. I just play and the cash is coming consistently. Great site.", user: "GladiatorX", icon: Trophy },
        { text: "Getting steady work has never been easier. Plus the money is amazing compared to past platforms. Definitely recommend.", user: "AltDealer", icon: DollarSign },
        { text: "Support is available 24/7 and the management team is very proactive. Working here is comfortable and rewarding.", user: "RankGrindr", icon: Star },
        { text: "Awesome interface, everything is organized. No hassle finding orders or chatting with customers. Super happy.", user: "ProGamer99", icon: Layout }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/v1/pro/apply`, {
                proType: selectedRole,
                discord: formData.discord,
                telegram: formData.telegram,
                email: formData.email,
                hoursPerDay: formData.hoursPerDay,
                experienceText: formData.experienceText,
                referralSource: formData.referralSource,
                games: formData.games
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role === 'pro' && user?.proStatus === 'approved') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-['Outfit'] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full"></div>
                <div className="max-w-[500px] w-full bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 text-center relative z-10 backdrop-blur-3xl shadow-2xl">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 mx-auto mb-8">
                        <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">You're already a PRO!</h2>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
                        You have already been approved as a professional on BoostGG. Head over to your dashboard to start earning.
                    </p>
                    <Link to="/pro/dashboard" className="w-full bg-white text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 group">
                        Go to PRO Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    if (isSubmitted || user?.proStatus === 'pending') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-['Outfit'] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full"></div>
                <div className="max-w-[500px] w-full bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 text-center relative z-10 backdrop-blur-3xl shadow-2xl">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Application Received!</h2>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
                        Thank you for applying to join BoostGG. Our management team will review your application and contact you on Discord within 24-48 hours.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="w-full bg-white text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 group">
                        Back to Marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] pt-32 pb-32">
            {/* HERO */}
            <div className="text-center mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 px-6">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] mb-4">Turn your game into income</p>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                        Become a PRO <br />
                        <span className="text-white">with BoostGG</span>
                    </h1>
                    <p className="text-xl font-bold text-white/80">Select your role and start earning</p>
                </div>
            </div>

            {/* ROLES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32 max-w-[1200px] mx-auto px-6">
                {roles.map(role => (
                    <div key={role.id} className={`${role.bgGradient} rounded-[32px] overflow-hidden border border-white/5 hover:border-white/20 transition-all shadow-2xl flex flex-col group`}>
                        {/* Image Replacement */}
                        <div className="h-48 relative bg-[#111] flex items-center justify-center overflow-hidden">
                            <img src={role.image} alt={role.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent"></div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{role.title}</h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8 flex-1">
                                {role.desc}
                            </p>
                            <button 
                                onClick={() => { setSelectedRole(role.id); scrollToForm(); }}
                                className="w-fit px-6 py-3 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                {role.button}
                            </button>
                        </div>
                    </div>
                ))}
                
                {/* Highlight Card */}
                <div className="bg-primary rounded-[32px] p-10 flex flex-col justify-center relative overflow-hidden group shadow-2xl shadow-primary/20">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Zap className="absolute -right-10 -top-10 w-64 h-64 text-black/10 -rotate-12" />
                    <h3 className="text-4xl lg:text-5xl font-black text-black uppercase tracking-tighter leading-tight mb-4 relative z-10">
                        You've got the grind.<br/>We've got the platform.
                    </h3>
                    <p className="text-black/70 font-bold mb-8 relative z-10">Sign up and earn on your terms.</p>
                    <button onClick={() => { setSelectedRole('booster'); scrollToForm(); }} className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest relative z-10 w-fit hover:scale-105 transition-transform shadow-2xl">
                        Join BoostGG
                    </button>
                </div>
            </div>

            {/* TIME TO GET PAID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1200px] mx-auto mb-32 px-6">
                {/* Image Mockup */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] h-[400px] relative overflow-hidden shadow-2xl group flex items-center justify-center">
                    <img src="/become-pro/become-pro-get-paid.png" alt="BoostGG Dashboard" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                </div>
                
                <div className="space-y-6">
                    <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">You've got skills?</p>
                    <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter">Time to get paid</h2>
                    <p className="text-white/50 font-bold leading-relaxed">
                        At BoostGG, you're not just playing the game — you play to get paid doing what you love. 
                        BoostGG is the top platform dedicated strictly to connecting sellers to buyers easily and safely. 
                        Everything you do can become an income source. You've got the skills, we've got the tools and support 
                        to turn your hobby into a real career.
                    </p>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="px-6 mb-32">
                <div className="bg-primary rounded-[40px] max-w-[1200px] mx-auto py-12 px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-black shadow-2xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="text-4xl md:text-6xl font-black tracking-tighter mb-2">20000+</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Monthly Orders</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl md:text-6xl font-black tracking-tighter mb-2">~$5000</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Monthly Income</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl md:text-6xl font-black tracking-tighter mb-2">$1000+</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Tips Daily</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl md:text-5xl font-black tracking-tighter mb-2 mt-1">The Best</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Affiliate System</div>
                    </div>
                </div>
            </div>

            {/* WHAT BOOSTS YOU MAKES US */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-[1200px] mx-auto mb-32 px-6 items-center">
                <div className="space-y-8">
                    <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">What boosts you, makes us</h2>
                    <p className="text-white/50 leading-relaxed font-bold max-w-lg">
                        BoostGG is built by gamers, for gamers — we understand what top players miss out on and we want to change that. 
                        For PROs this means more clients and less smooth talk, real money in the bank. 
                        Leave no money behind on the platform.
                    </p>
                    <button onClick={scrollToForm} className="bg-primary hover:bg-primary/80 text-black px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all w-fit shadow-xl shadow-primary/20 hover:translate-x-2">
                        Become PRO <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[32px] space-y-4 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-2 text-primary">
                                <t.icon className="w-4 h-4" />
                            </div>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">"{t.text}"</p>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-white/80">@{t.user}</span>
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3 h-3 text-primary fill-primary" />)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHY JOIN BOOSTGG */}
            <div className="max-w-[1200px] mx-auto mb-32 px-6">
                <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-16 text-center">Why join BoostGG as a PRO?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {benefits.map((b, i) => (
                        <div key={i} className="space-y-6 group">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                                <b.icon className="w-8 h-8 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-2xl font-black uppercase tracking-tighter">{b.title}</h4>
                                <p className="text-white/40 text-sm font-bold leading-relaxed">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* APPLICATION FORM */}
            <div id="application-form" className="max-w-3xl mx-auto px-6 scroll-mt-32 relative">
                <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full translate-y-20 pointer-events-none"></div>

                <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[60px] p-8 md:p-16 backdrop-blur-3xl shadow-2xl">
                    <div className="mb-16 text-center space-y-3">
                        <h3 className="text-5xl font-black uppercase tracking-tighter">Submit Application</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                            Role Selected: <span className="text-primary">{selectedRole.replace('_', ' ')}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            {!user && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            required
                                            type="email"
                                            placeholder="your@email.com"
                                            className="w-full bg-black border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Discord Tag</label>
                                    <div className="relative group">
                                        <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Gamer#1234"
                                            className="w-full bg-black border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                            value={formData.discord}
                                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Telegram (Optional)</label>
                                    <div className="relative group">
                                        <Send className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="@username"
                                            className="w-full bg-black border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                            value={formData.telegram}
                                            onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Main Games Selection</label>

                                <div className="flex flex-wrap gap-2 mb-4 px-2">
                                    {formData.games.map((gameTitle, idx) => (
                                        <div key={idx} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            {gameTitle}
                                            <button type="button" onClick={() => setFormData({ ...formData, games: formData.games.filter(g => g !== gameTitle) })} className="hover:text-white transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.games.length === 0 && (
                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest py-2 px-2">No games selected yet...</div>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="relative group">
                                        <Gamepad2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search and select games..."
                                            className="w-full bg-black border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                            value={gameSearch}
                                            onFocus={() => setIsGameDropdownOpen(true)}
                                            onChange={(e) => {
                                                setGameSearch(e.target.value);
                                                setIsGameDropdownOpen(true);
                                            }}
                                        />
                                        <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 transition-transform ${isGameDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isGameDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsGameDropdownOpen(false)}></div>
                                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#111] border border-white/10 rounded-[32px] p-4 shadow-2xl z-20 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                <div className="space-y-1">
                                                    {allGames.filter(game => (game.title || game.name || '').toLowerCase().includes(gameSearch.toLowerCase()) && !formData.games.includes(game.title || game.name)).map((game, idx) => (
                                                        <button
                                                            key={game._id || idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, games: [...formData.games, game.title || game.name] });
                                                                setGameSearch('');
                                                                setIsGameDropdownOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group/item text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                                                                <Gamepad2 className="w-4 h-4 text-white/40 group-hover/item:text-primary transition-colors" />
                                                            </div>
                                                            <span className="text-xs font-bold text-white/60 group-hover/item:text-white transition-colors">{game.title || game.name}</span>
                                                        </button>
                                                    ))}
                                                    {allGames.filter(game => (game.title || game.name || '').toLowerCase().includes(gameSearch.toLowerCase()) && !formData.games.includes(game.title || game.name)).length === 0 && (
                                                        <div className="p-8 text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No matching games found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Experience & Rank info</label>
                                <textarea
                                    required
                                    rows="5"
                                    placeholder="What is your rank? What games have you boosted in before? Any competitive achievements?"
                                    className="w-full bg-black border border-white/5 rounded-[40px] py-8 px-8 text-sm font-bold focus:border-primary/50 transition-all outline-none resize-none leading-relaxed custom-scrollbar"
                                    value={formData.experienceText}
                                    onChange={(e) => setFormData({ ...formData, experienceText: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Daily Availability</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['<4h', '4-8h', '>8h'].map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, hoursPerDay: hours })}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.hoursPerDay === hours ? 'bg-primary text-black border-primary' : 'bg-black border-white/5 text-white/40 hover:border-white/20'}`}
                                            >
                                                {hours}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Referral Source</label>
                                    <input
                                        type="text"
                                        placeholder="Friend, Google, YT..."
                                        className="w-full bg-black border border-white/5 rounded-3xl py-6 px-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                        value={formData.referralSource}
                                        onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-[#8cc63e] disabled:opacity-50 text-black py-7 rounded-[40px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 group relative overflow-hidden mt-8"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing Application...</>
                                ) : (
                                    <>Send My Application <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform" /></>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomePro;
