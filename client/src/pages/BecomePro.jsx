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
    Share2, Monitor, HelpCircle, ChevronDown, Edit3, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BecomePro = () => {
    const { user } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('booster'); // Default to booster for visible form
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

    const roles = [
        {
            id: 'booster',
            title: 'Booster',
            desc: 'PvP & PvE players, Coaches',
            icon: Zap,
            color: 'from-primary to-primary/50'
        },
        {
            id: 'gold_seller',
            title: 'Gold Seller',
            desc: 'In-game currency providers',
            icon: DollarSign,
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: 'account_seller',
            title: 'Account Seller',
            desc: 'High-end account providers',
            icon: Layout,
            color: 'from-purple-500 to-pink-400'
        },
        {
            id: 'content_creator',
            title: 'Content Creator',
            desc: 'Streamers & Guide Makers',
            icon: Video,
            color: 'from-orange-500 to-red-400'
        },
        {
            id: 'influencer_partner',
            title: 'Influencer',
            desc: 'Promoters & Social Stars',
            icon: Share2,
            color: 'from-green-500 to-teal-400'
        },
        {
            id: 'blogger',
            title: 'Blogger',
            desc: 'Guides & Industry News',
            icon: Edit3,
            color: 'from-yellow-500 to-amber-400'
        }
    ];

    const benefits = [
        {
            title: 'Real money for real skills',
            desc: 'You set your own schedule and take orders you want. No boss, just your talent and our platform.',
            icon: DollarSign
        },
        {
            title: 'Bro-level support',
            desc: 'Our management team works 24/7. We help with disputes, specialized tools, and technical issues.',
            icon: Headphones
        },
        {
            title: 'Non-stop orders',
            desc: 'With thousands of customers daily, you will never run out of work. Stability is our promise.',
            icon: Zap
        },
        {
            title: 'Fast & Clean Payouts',
            desc: 'Weekly payouts via Wise, Binance Pay, Crypto, and more. No hidden fees, just your earnings.',
            icon: ShieldCheck
        },
        {
            title: 'Direct Client Chat',
            desc: 'Communicate directly with your customers. Build trust, get tips, and manage your reputation.',
            icon: MessageSquare
        }
    ];

    const testimonials = [
        {
            name: '@GladiatorX',
            role: 'PvP Booster',
            text: 'Joined BoostGG 6 months ago. The interface is lightyears ahead of other platforms. Payouts are lightning fast.',
            rating: 5
        },
        {
            name: '@AltDealer',
            role: 'Account Seller',
            text: 'I\'ve sold over 500 accounts here. The security checks protect both me and the buyer. Best in the business.',
            rating: 5
        },
        {
            name: '@RankGrindr',
            role: 'Raider & Coach',
            text: 'The order volume is insane. I make a full-time living just playing WoW. Support team is always there.',
            rating: 5
        }
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
                    <h2 className="text-3xl font-black italic uppercase mb-4 tracking-tighter">You're already a PRO!</h2>
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
                    <h2 className="text-3xl font-black italic uppercase mb-4 tracking-tighter">Application Received!</h2>
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
        <div className="min-h-screen bg-black text-white pt-44 pb-20 font-['Outfit'] relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[200px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 blur-[200px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-32 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        <Globe className="w-4 h-4" />
                        Join the Global Elite
                    </div>
                    <h1 className="text-8xl font-black italic leading-[0.8] uppercase tracking-tighter">
                        Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">PRO</span> <br />
                        <span className="text-white/90">Earn with your skills</span>
                    </h1>
                    <p className="text-white/40 text-xl font-bold uppercase tracking-wide max-w-2xl mx-auto leading-relaxed">
                        The ultimate workspace for players, sellers, and creators. Turn your expertise into a full-time career.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-32">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => {
                                setSelectedRole(role.id);
                                const target = document.getElementById('application-form');
                                if (target) {
                                    const yOffset = -120;
                                    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }}
                            className={`group relative bg-[#0A0A0A] border rounded-[38px] p-8 text-left transition-all duration-500 hover:translate-y-[-8px] shadow-2xl ${selectedRole === role.id ? 'border-primary' : 'border-white/10'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg shadow-black group-hover:scale-110 transition-transform`}>
                                <role.icon className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase mb-1 tracking-tighter">{role.title}</h3>
                            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-tight">{role.desc}</p>
                            <div className="mt-8 flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Apply Now <ArrowRight className="w-3 h-3" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-[38px] pointer-events-none"></div>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
                    {/* Left side: Marketing & Benefits */}
                    <div className="space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Why join BoostGG?</h2>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">We don't just provide work; we build careers.</p>
                        </div>

                        <div className="space-y-10">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-all shadow-xl">
                                        <benefit.icon className="w-7 h-7 text-white/40 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="space-y-2 pt-1">
                                        <h4 className="text-xl font-black uppercase italic tracking-tighter text-white/90">{benefit.title}</h4>
                                        <p className="text-white/30 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Requirements List */}
                        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[48px] space-y-8">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" /> Minimum Requirements
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    'Proven skill in selected games',
                                    'Stable internet connection',
                                    'Professional & polite communication',
                                    'Discord for team coordination',
                                    'Streaming capability (for boosters)',
                                    'Integrity & honesty'
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right side: Stats & Testimonials */}
                    <div className="space-y-12">
                        {/* Highlights Card */}
                        <div className="p-10 bg-gradient-to-br from-[#5A30FF] to-[#8248FF] rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10 space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The #1 Platform</h3>
                                    <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-md">Join a community of 5,000+ verified professionals worldwide.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-10 gap-y-12 pt-4">
                                    <div>
                                        <div className="text-5xl font-black italic tracking-tighter">20K+</div>
                                        <div className="text-white/50 text-[9px] font-black uppercase tracking-widest mt-1">Monthly Orders</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-black italic tracking-tighter">~$5K</div>
                                        <div className="text-white/50 text-[9px] font-black uppercase tracking-widest mt-1">Avg. Monthly Income</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-black italic tracking-tighter">$1K+</div>
                                        <div className="text-white/50 text-[9px] font-black uppercase tracking-widest mt-1">Tips Shared Daily</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-black italic tracking-tighter">#1</div>
                                        <div className="text-white/50 text-[9px] font-black uppercase tracking-widest mt-1">Booster Ecosystem</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="grid grid-cols-1 gap-6">
                            {testimonials.map((t, i) => (
                                <div key={i} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[38px] space-y-4 hover:border-primary/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black italic text-primary text-xs">{(t.name[1] || 'U').toUpperCase()}</div>
                                            <div>
                                                <div className="font-black italic uppercase text-sm tracking-tight">{t.name}</div>
                                                <div className="text-[9px] text-primary font-black uppercase tracking-widest">{t.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                                        </div>
                                    </div>
                                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed italic">"{t.text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Application Form Section */}
                <div id="application-form" className="max-w-3xl mx-auto scroll-mt-32">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full translate-y-20"></div>

                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[60px] p-16 backdrop-blur-3xl shadow-2xl">
                            <div className="mb-16 text-center">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Submit Application</h3>
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                                    Role Selected: <span className="text-primary">{selectedRole?.replace('_', ' ')}</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-8">
                                    {!user && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
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
                                                <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Gamer#1234"
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                    value={formData.discord}
                                                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Telegram (Optional)</label>
                                            <div className="relative group">
                                                <Send className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="@username"
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                    value={formData.telegram}
                                                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Main Games Selection</label>

                                        {/* Tag Area */}
                                        <div className="flex flex-wrap gap-2 mb-4 px-2">
                                            {formData.games.map((gameTitle, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group/tag"
                                                >
                                                    {gameTitle}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            games: formData.games.filter(g => g !== gameTitle)
                                                        })}
                                                        className="hover:text-white transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.games.length === 0 && (
                                                <div className="text-[10px] font-bold text-white/10 uppercase tracking-widest py-2 px-2 italic">
                                                    No games selected yet...
                                                </div>
                                            )}
                                        </div>

                                        {/* Search & Dropdown */}
                                        <div className="relative">
                                            <div className="relative group">
                                                <Gamepad2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Search and select games..."
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
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
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setIsGameDropdownOpen(false)}
                                                    ></div>
                                                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-4 shadow-2xl z-20 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="space-y-1">
                                                            {allGames
                                                                .filter(game =>
                                                                    (game.title || game.name || '').toLowerCase().includes(gameSearch.toLowerCase()) &&
                                                                    !formData.games.includes(game.title || game.name)
                                                                )
                                                                .map((game, idx) => (
                                                                    <button
                                                                        key={game._id || idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({
                                                                                ...formData,
                                                                                games: [...formData.games, game.title || game.name]
                                                                            });
                                                                            setGameSearch('');
                                                                            setIsGameDropdownOpen(false);
                                                                        }}
                                                                        className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group/item text-left"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                                                                            <Gamepad2 className="w-4 h-4 text-white/20 group-hover/item:text-primary transition-colors" />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-white/60 group-hover/item:text-white transition-colors">
                                                                            {game.title || game.name}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            {allGames.filter(game =>
                                                                (game.title || game.name || '').toLowerCase().includes(gameSearch.toLowerCase()) &&
                                                                !formData.games.includes(game.title || game.name)
                                                            ).length === 0 && (
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
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-[40px] py-8 px-10 text-sm font-bold focus:border-primary/50 transition-all outline-none resize-none leading-relaxed"
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
                                                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.hoursPerDay === hours ? 'bg-primary text-black border-primary' : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'}`}
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
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-6 px-8 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                value={formData.referralSource}
                                                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-[#8cc63e] disabled:opacity-50 text-black py-7 rounded-[40px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Application...
                                            </>
                                        ) : (
                                            <>
                                                Send My Application <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-40 max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter">Frequently Asked Questions</h2>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Everything you need to know about becoming a pro.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { q: 'How long does the review take?', a: 'Our managers review applications within 24-48 hours. If you pass the initial check, we will contact you on Discord for a trial.' },
                            { q: 'What games are most in demand?', a: 'World of Warcraft, Destiny 2, Escape from Tarkov, and League of Legends are our busiest games currently.' },
                            { q: 'How do I get paid?', a: 'Earnings are added to your wallet immediately after order completion. You can request a payout every Monday.' },
                            { q: 'Do I need to stream my gameplay?', a: 'For boosting services, yes. Most customers require a private stream to verify progress and safety.' },
                            { q: 'Is there a minimum age?', a: 'Yes, all professionals on BoostGG must be at least 18 years old.' }
                        ].map((faq, i) => (
                            <div key={i} className="group p-8 bg-[#0A0A0A] border border-white/5 rounded-[32px] hover:border-white/10 transition-all">
                                <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4 flex items-center justify-between group-hover:text-primary transition-colors">
                                    {faq.q} <HelpCircle className="w-5 h-5 opacity-20" />
                                </h4>
                                <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomePro;
