import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Users,
    ArrowUpRight,
    Share2,
    Gift,
    CheckCircle2,
    TrendingUp,
    Zap,
    Star,
    ShieldCheck,
    ChevronDown,
    Lock,
    Wallet,
    UserPlus,
    ShoppingCart,
    Coins,
    ChevronRight,
    Monitor,
    MousePointer2,
    RefreshCcw
} from 'lucide-react';

const Cashback = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const tiersData = [
        { spend: "$500", boost: "5%", curr: "1%" },
        { spend: "$600", boost: "6%", curr: "1.2%" },
        { spend: "$700", boost: "7%", curr: "1.4%" },
        { spend: "$800", boost: "8%", curr: "1.5%" },
        { spend: "$900", boost: "9%", curr: "1.8%" },
        { spend: "$1,000", boost: "10%", curr: "2%" },
        { spend: "$5,000", boost: "15%", curr: "3%" },
        { spend: "$10,000", boost: "20%", curr: "4%" }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-['Outfit'] selection:bg-primary/30 overflow-x-hidden">

            {/* 1. Hero Section: Money & Phone Effect */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                    {/* Left: Floating Currency Effect */}
                    <div className="relative h-[400px] flex items-center justify-center">
                        {/* Floating Money Particle Placeholders (CSS Animation) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-16 h-8 bg-primary/10 border border-primary/20 rounded backdrop-blur-sm animate-float"
                                    style={{
                                        top: `${Math.random() * 80}%`,
                                        left: `${Math.random() * 80}%`,
                                        animationDelay: `${i * 0.5}s`,
                                        rotate: `${Math.random() * 45}deg`
                                    }}
                                >
                                    <div className="w-full h-full flex items-center justify-center opacity-40">
                                        <span className="text-[8px] font-black">$</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Central "Phone/Portal" Element */}
                        <div className="relative z-10 w-[240px] h-[480px] bg-white/[0.03] border-4 border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(162,230,62,0.3)] overflow-hidden flex flex-col p-6 items-center justify-center">
                            <div className="w-12 h-1 bg-white/20 rounded-full mb-8"></div>
                            <div className="text-primary text-6xl mb-4">
                                <Trophy className="w-20 h-20" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Headline */}
                    <div className="text-center lg:text-left relative z-20">
                        <p className="text-white/40 text-lg md:text-2xl font-bold uppercase tracking-tighter mb-4">Boost your game — and your wallet</p>
                        <h1 className="text-5xl md:text-[100px] font-black italic tracking-tighter leading-[0.8] mb-4 uppercase">
                            Cashback <br /> Program
                        </h1>
                    </div>
                </div>
            </section>

            {/* 2. Boosting vs Currencies Info Cards */}
            <section className="pb-24 px-6">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Boosting Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-primary/5 -z-0">
                            <Zap className="w-40 h-40" />
                        </div>
                        <h3 className="text-3xl font-black italic uppercase italic tracking-tighter mb-8 relative z-10">Boosting</h3>
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1 bg-white/3 border border-white/10 rounded-3xl p-6">
                                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-xl text-lg font-black italic mb-3">
                                    Get <span className="ml-1">5-20%</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40">back on boosting orders</p>
                            </div>
                            <div className="flex-1 bg-white/3 border border-white/10 rounded-3xl p-6">
                                <div className="inline-flex items-center gap-2 bg-[#00FF85]/20 text-[#00FF85] px-4 py-1.5 rounded-xl text-lg font-black italic mb-3">
                                    Cover <span className="ml-1 text-2xl tracking-tighter">UP TO</span> 30%
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40">on future boosts</p>
                            </div>
                        </div>
                    </div>

                    {/* Currencies & Accounts Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-green-500/5 -z-0">
                            <Coins className="w-40 h-40" />
                        </div>
                        <h3 className="text-3xl font-black italic uppercase italic tracking-tighter mb-8 relative z-10">Currencies & accounts</h3>
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1 bg-white/3 border border-white/10 rounded-3xl p-6">
                                <div className="inline-flex items-center gap-2 bg-[#00FF85]/20 text-[#00FF85] px-4 py-1.5 rounded-xl text-lg font-black italic mb-3">
                                    Get <span className="ml-1">1-4%</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40 text-left">back on currencies and accounts</p>
                            </div>
                            <div className="flex-1 bg-white/3 border border-white/10 rounded-3xl p-6">
                                <div className="inline-flex items-center gap-2 bg-[#00FF85]/20 text-[#00FF85] px-4 py-1.5 rounded-xl text-lg font-black italic mb-3">
                                    Cover <span className="ml-1 text-2xl tracking-tighter">UP TO</span> 6%
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/40">on future orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Dashboard/Balance Visual Block */}
            <section className="py-24 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-16 px-6">Cashback that levels with you</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Balance Card */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10">
                            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-8 tracking-[0.2em]">User balance</p>
                            <p className="text-5xl font-black italic uppercase italic tracking-tighter mb-2">$125</p>
                            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-lg text-xs font-black italic">
                                $0.74 <span className="text-white/40">cashback after purchase</span>
                            </div>
                            <p className="mt-12 text-sm font-bold text-white/30 italic">Earn cashback on every order</p>
                        </div>

                        {/* Account Tracker */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-8 bg-primary rounded-full mb-4"></div>
                            <p className="text-[14px] font-black uppercase tracking-[0.2em] text-white/30">Track your balance in personal account</p>
                        </div>

                        {/* Toggle Card */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <p className="text-xs font-black uppercase tracking-widest text-white/30 tracking-[0.2em]">Use cashback</p>
                                <div className="w-12 h-6 bg-white/10 rounded-full relative p-1 cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-white/40 text-xs font-bold mb-4 uppercase italic">$15.23</p>
                            <button className="w-full bg-[#00FF85] text-black py-4 rounded-xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3">
                                Buy now
                                <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                            </button>
                            <p className="mt-10 text-sm font-bold text-white/30 italic text-center">Use your cashback to cut prices</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Tier Progress Graph (The core "Level with you" visual) */}
            <section className="py-32 px-6">
                <div className="max-w-[1400px] mx-auto border border-white/5 bg-[#050505] rounded-[60px] p-10 md:p-20 relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="max-w-md">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">How it works</p>
                            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase">
                                The more you boost — <br /> the more you get back
                            </h2>
                            <p className="text-white/50 font-bold text-lg mb-10 italic">
                                Unlock higher cashback rates as your total spending grows. Use your cashback freely across BoostGG.
                            </p>
                            <button className="bg-[#00FF85] text-black px-10 py-4 rounded-xl font-black uppercase italic tracking-widest text-sm flex items-center gap-2 mb-12">
                                Go higher
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(162,230,62,0.8)]"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Boosting cashback</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-[#00FF85] shadow-[0_0_8px_rgba(0,255,133,0.8)]"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Currencies, accounts and others cashback</p>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart Representation */}
                        <div className="flex-1 w-full h-full flex items-end gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {tiersData.map((tier, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 min-w-[70px]">
                                    {/* Bars Container */}
                                    <div className="relative w-full h-[400px] flex items-end justify-center gap-1 group">
                                        {/* Boosting Bar (Purple) */}
                                        <div
                                            className="w-full bg-gradient-to-t from-primary to-primary/40 rounded-t-xl transition-all duration-700 relative overflow-hidden flex items-center justify-center"
                                            style={{ height: `${(i + 1) * 12 + 10}%` }}
                                        >
                                            <span className="text-[10px] font-black -rotate-90 md:rotate-0 tracking-tighter">{tier.boost}</span>
                                        </div>
                                        {/* Currency Bar (Green) */}
                                        <div
                                            className="w-full bg-gradient-to-t from-[#00FF85] to-[#00FF85]/40 rounded-t-xl transition-all duration-700 relative overflow-hidden flex items-center justify-center"
                                            style={{ height: `${(i + 1) * 3 + 5}%` }}
                                        >
                                            <span className="text-[10px] text-black font-black -rotate-90 md:rotate-0 tracking-tighter">{tier.curr}</span>
                                        </div>
                                    </div>
                                    {/* X Axis Label */}
                                    <p className="mt-4 text-[11px] font-black italic text-white/40 tracking-tight">{tier.spend}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Community Earnings Display (Exact 1:1 Match) */}
            <section className="py-32 px-6 bg-black">
                <div className="max-w-[1400px] mx-auto text-center">
                    <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mb-12">
                        Join thousands of gamers leveling up with cashback
                    </p>

                    <h2 className="text-[60px] md:text-[100px] font-black italic uppercase leading-[0.85] mb-16 tracking-tighter flex flex-col items-center">
                        <span>Community</span>
                        <span>Earnings</span>
                    </h2>

                    {/* Counter Grid */}
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-20">
                        <span className="text-3xl md:text-5xl font-bold text-white/20 self-center mr-2">$</span>
                        {["1", "9", "0", "3", "5", "9", "8"].map((digit, i) => (
                            <div
                                key={i}
                                className="w-10 h-16 md:w-16 md:h-24 bg-primary rounded-xl flex items-center justify-center text-4xl md:text-6xl font-black text-black shadow-[0_15px_30px_rgba(162,230,62,0.4)]"
                            >
                                {digit}
                            </div>
                        ))}
                    </div>

                    <button className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center gap-3 mx-auto">
                        Join Cashback Program
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* 6. Spend Smarter / Exact 1:1 Tiles */}
            <section className="py-24 px-6 bg-black">
                <div className="max-w-[1400px] mx-auto">
                    <p className="text-white/40 font-bold text-sm mb-6 tracking-normal">Use your cashback</p>
                    <h2 className="text-5xl md:text-[64px] font-black text-white leading-tight mb-20 tracking-tight">
                        Spend smarter. Boost bigger.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tile 1 */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-white/10 group">
                            <div className="text-5xl mb-10 group-hover:scale-110 transition-transform origin-left">
                                🛍️
                            </div>
                            <h4 className="text-xl font-black text-white mb-4 tracking-tight">Reduce your order prices</h4>
                            <p className="text-white/40 font-medium leading-[1.6] text-sm md:text-base">
                                Apply your cashback instantly to cut down the cost of any new purchase.
                            </p>
                        </div>

                        {/* Tile 2 */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-white/10 group">
                            <div className="text-5xl mb-10 group-hover:scale-110 transition-transform origin-left">
                                💰
                            </div>
                            <h4 className="text-xl font-black text-white mb-4 tracking-tight">Save it up for bigger wins</h4>
                            <p className="text-white/40 font-medium leading-[1.6] text-sm md:text-base">
                                Let your cashback grow and use it later for massive discounts.
                            </p>
                        </div>

                        {/* Tile 3 */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-white/10 group">
                            <div className="text-5xl mb-10 group-hover:scale-110 transition-transform origin-left">
                                🔒
                            </div>
                            <h4 className="text-xl font-black text-white mb-4 tracking-tight">Use on any service, anytime</h4>
                            <p className="text-white/40 font-medium leading-[1.6] text-sm md:text-base">
                                No limits — spend your cashback however you like on BoostGG.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Referral Green Banner (Exact 1:1 Match with Image) */}
            <section className="py-24 px-6">
                <div className="max-w-[1400px] mx-auto bg-black rounded-[60px] overflow-hidden relative group">
                    {/* Background Gradient Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0E2F0A] to-[#04C108] opacity-100"></div>

                    <div className="relative z-10 p-10 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-12">
                        {/* Left Content */}
                        <div className="max-w-xl text-center lg:text-left">
                            <p className="text-white/40 font-bold text-sm mb-6 tracking-normal">Earn more with Referral Program</p>
                            <h2 className="text-5xl md:text-[64px] font-black text-white leading-tight mb-6 tracking-tight">
                                Share your link, get $20!
                            </h2>
                            <p className="text-white/80 font-medium text-lg mb-10 leading-relaxed">
                                Share your link with friends, and when they place their first order, you'll earn $20 cashback 💰
                            </p>
                            <button className="bg-gradient-to-r from-[#17CC05] to-[#ADFF00] text-white px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_10px_30px_rgba(23,204,5,0.3)] flex items-center justify-center gap-3">
                                Get link
                                <ChevronRight className="w-5 h-5 stroke-[3px]" />
                            </button>
                        </div>

                        {/* Right: User Network Visual (1:1 with image) */}
                        <div className="relative w-full lg:w-[500px] aspect-square flex items-center justify-center">
                            {/* Connection Lines (SVG) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                                <line x1="250" y1="350" x2="150" y2="180" stroke="white" strokeWidth="1" opacity="0.1" />
                                <line x1="250" y1="350" x2="250" y2="150" stroke="white" strokeWidth="1" opacity="0.1" />
                                <line x1="250" y1="350" x2="350" y2="180" stroke="white" strokeWidth="1" opacity="0.1" />
                                <line x1="250" y1="350" x2="430" y2="380" stroke="white" strokeWidth="1" opacity="0.1" />
                                <line x1="250" y1="350" x2="90" y2="380" stroke="white" strokeWidth="1" opacity="0.1" />
                            </svg>

                            {/* Center Main Node */}
                            <div className="absolute w-32 h-32 rounded-full bg-[#39FF14] p-1 shadow-[0_0_40px_rgba(57,255,20,0.4)] z-20 top-[60%]">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A] overflow-hidden border-4 border-[#39FF14]/20 flex items-center justify-center">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=wink" alt="main" className="w-[80%] h-[80%] object-contain" />
                                </div>
                            </div>

                            {/* Orbiting Nodes */}
                            {/* Top Left: Avatar */}
                            <div className="absolute top-[25%] left-[20%] w-20 h-20 rounded-full bg-[#39FF14] p-1 shadow-lg z-10 transition-transform hover:scale-110 duration-500">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="user1" className="w-[85%] h-[85%] object-contain" />
                                </div>
                            </div>

                            {/* Top Center: Money Bag */}
                            <div className="absolute top-[10%] left-[45%] w-16 h-16 rounded-full bg-[#A8FF00] p-1 shadow-lg z-10">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                                    <div className="text-3xl">💰</div>
                                </div>
                            </div>

                            {/* Top Right: Avatar */}
                            <div className="absolute top-[25%] right-[20%] w-20 h-20 rounded-full bg-[#39FF14] p-1 shadow-lg z-10 transition-transform hover:scale-110 duration-500">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba" alt="user2" className="w-[85%] h-[85%] object-contain" />
                                </div>
                            </div>

                            {/* Bottom Left: Money Bag Big */}
                            <div className="absolute bottom-[20%] left-[5%] w-24 h-24 rounded-full bg-[#A8FF00]/80 p-0.5 shadow-xl z-10 rotate-[-15deg] transition-all hover:rotate-0">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A]/40 backdrop-blur-md flex items-center justify-center overflow-hidden">
                                    <div className="text-5xl">💰</div>
                                </div>
                            </div>

                            {/* Bottom Right: Rock On Gesture */}
                            <div className="absolute bottom-[25%] right-[5%] w-20 h-20 rounded-full bg-[#FFD700] p-1 shadow-lg z-10 transition-all hover:rotate-12">
                                <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                                    <div className="text-4xl">🤘</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Payment Icons Section */}
            <section className="py-20 px-6 border-t border-white/5 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                <div className="max-w-[1400px] mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">PayPal</span>
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">VISA</span>
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">MasterCard</span>
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">Apple Pay</span>
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">G-Pay</span>
                    <span className="text-xl font-black italic italic tracking-widest opacity-40 uppercase">Stripe</span>
                </div>
            </section>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Cashback;
