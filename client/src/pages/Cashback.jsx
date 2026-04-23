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
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
                    {/* Floating Money Particle Placeholders */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-16 h-8 bg-primary/10 border border-primary/20 rounded backdrop-blur-md animate-float"
                                style={{
                                    top: `${Math.random() * 80}%`,
                                    left: `${Math.random() * 80}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    rotate: `${Math.random() * 45}deg`
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-center opacity-60">
                                    <span className="text-[12px] font-black text-primary">$</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Central Element */}
                    <div className="relative z-10 w-[240px] h-[480px] bg-black/60 backdrop-blur-2xl border-2 border-white/5 rounded-[48px] shadow-[0_0_80px_rgba(162,230,62,0.15)] overflow-hidden flex flex-col p-6 items-center justify-center group hover:border-primary/50 transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-12 h-1 bg-white/20 rounded-full mb-8"></div>
                        <div className="text-primary text-6xl mb-4 group-hover:scale-110 transition-transform duration-700">
                            <Trophy className="w-20 h-20" />
                        </div>
                    </div>
                </div>

                {/* Right: Headline */}
                <div className="text-center lg:text-left relative z-20">
                    <p className="text-primary text-sm font-black uppercase tracking-[0.3em] mb-6">Boost your game — and your wallet</p>
                    <h1 className="text-6xl md:text-[100px] font-black tracking-tighter leading-[0.8] mb-8 uppercase">
                        Cashback <br /> <span className="text-white/40">Program</span>
                    </h1>
                    <p className="text-white/60 text-lg font-medium max-w-xl">Earn a percentage back on every purchase. The more you buy, the higher your tier, and the more cashback you earn for future orders.</p>
                </div>
            </div>
        </section>

        {/* 2. Boosting vs Currencies Info Cards */}
        <section className="pb-24 px-6 relative z-10">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Boosting Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 md:p-12 relative overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-colors -z-0">
                        <Zap className="w-48 h-48" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 relative z-10">Boosting Services</h3>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 group-hover:bg-white/[0.04] transition-colors">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-black mb-4">
                                Earn <span className="ml-1 text-2xl tracking-tighter">5-20%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">back on all boosting orders</p>
                        </div>
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 group-hover:bg-white/[0.04] transition-colors">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-black mb-4">
                                Cover <span className="ml-1 text-2xl tracking-tighter">UP TO 30%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">on future boost purchases</p>
                        </div>
                    </div>
                </div>

                {/* Currencies & Accounts Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 md:p-12 relative overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-colors -z-0">
                        <Coins className="w-48 h-48" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 relative z-10">Currencies & Accounts</h3>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 group-hover:bg-white/[0.04] transition-colors">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-black mb-4">
                                Earn <span className="ml-1 text-2xl tracking-tighter">1-4%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed text-left">back on game assets</p>
                        </div>
                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 group-hover:bg-white/[0.04] transition-colors">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-lg font-black mb-4">
                                Cover <span className="ml-1 text-2xl tracking-tighter">UP TO 6%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-relaxed">on future asset orders</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. Dashboard/Balance Visual Block */}
        <section className="py-24 px-6 relative z-10">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-5xl md:text-[70px] font-black tracking-tighter uppercase leading-[0.9]">Cashback that <br/><span className="text-white/40">levels with you</span></h2>
                    </div>
                    <p className="text-white/40 font-bold max-w-sm">Watch your balance grow and automatically apply discounts to your next checkout.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Balance Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 hover:border-primary/20 transition-colors group">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8">User balance</p>
                        <p className="text-6xl font-black uppercase tracking-tighter mb-4">$125<span className="text-2xl text-white/20">.00</span></p>
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-black">
                            +$0.74 <span className="text-primary/60 font-medium tracking-wide">cashback after purchase</span>
                        </div>
                    </div>

                    {/* Account Tracker */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center hover:border-primary/20 transition-colors group">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/60">Track your balance in your personal dashboard</p>
                    </div>

                    {/* Toggle Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 hover:border-primary/20 transition-colors group">
                        <div className="flex justify-between items-center mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Use cashback</p>
                            <div className="w-14 h-7 bg-primary rounded-full relative p-1 cursor-pointer">
                                <div className="absolute right-1 top-1 w-5 h-5 bg-black rounded-full shadow-md"></div>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm font-bold mb-4 uppercase">Discount: <span className="text-primary">-$15.23</span></p>
                        <button className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                            Apply to Cart
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. Tier Progress Graph */}
        <section className="py-24 px-6 relative z-10">
            <div className="max-w-[1400px] mx-auto border border-white/5 bg-[#0A0A0A] rounded-[48px] p-10 md:p-16 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="max-w-md relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Progression System</p>
                        <h2 className="text-5xl md:text-[70px] font-black tracking-tighter leading-[0.9] mb-8 uppercase">
                            Boost more. <br /> <span className="text-white/40">Earn more.</span>
                        </h2>
                        <p className="text-white/40 font-medium text-lg mb-10 leading-relaxed">
                            Unlock higher cashback rates as your total spending grows. Use your cashback freely across all BoostGG services.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(162,230,62,0.6)]"></div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest text-white">Boosting services</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Up to 20% back</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-4 h-4 rounded-full bg-primary/40 shadow-[0_0_15px_rgba(162,230,62,0.2)]"></div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest text-white">Game assets</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Up to 4% back</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart Representation */}
                    <div className="flex-1 w-full h-[400px] flex items-end gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide relative z-10">
                        {tiersData.map((tier, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 min-w-[60px] group/bar">
                                <div className="relative w-full h-[300px] flex items-end justify-center gap-1">
                                    {/* Boosting Bar (Primary) */}
                                    <div
                                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-700 relative overflow-hidden flex items-start justify-center pt-2 group-hover/bar:brightness-125"
                                        style={{ height: `${(i + 1) * 12 + 10}%` }}
                                    >
                                        <span className="text-[9px] text-black font-black -rotate-90 md:rotate-0 tracking-tighter mt-2">{tier.boost}</span>
                                    </div>
                                    {/* Currency Bar (Secondary) */}
                                    <div
                                        className="w-full bg-gradient-to-t from-primary/40 to-primary/20 rounded-t-lg transition-all duration-700 relative overflow-hidden flex items-start justify-center pt-2 group-hover/bar:brightness-125"
                                        style={{ height: `${(i + 1) * 3 + 5}%` }}
                                    >
                                        <span className="text-[9px] text-white font-black -rotate-90 md:rotate-0 tracking-tighter mt-2">{tier.curr}</span>
                                    </div>
                                </div>
                                <p className="mt-6 text-[10px] font-black text-white/40 tracking-widest group-hover/bar:text-white transition-colors">{tier.spend}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* 5. Community Earnings Display */}
        <section className="py-32 px-6 relative z-10 border-y border-white/5 bg-black/50">
            <div className="max-w-[1400px] mx-auto text-center">
                <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                    Join thousands of gamers
                </p>

                <h2 className="text-[60px] md:text-[120px] font-black uppercase leading-[0.85] mb-16 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                    Community <br /> Earnings
                </h2>

                {/* Counter Grid */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-20">
                    <span className="text-4xl md:text-6xl font-black text-white/20 self-center mr-4">$</span>
                    {["1", "9", "0", "3", "5", "9", "8"].map((digit, i) => (
                        <div
                            key={i}
                            className="w-12 h-16 md:w-20 md:h-28 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center text-4xl md:text-7xl font-black text-white shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                            <span className="relative z-10">{digit}</span>
                        </div>
                    ))}
                </div>

                <button className="bg-primary text-black px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] hover:scale-[1.02] transition-transform flex items-center gap-4 mx-auto shadow-[0_0_30px_rgba(162,230,62,0.3)]">
                    Create Account Now
                    <ArrowUpRight className="w-5 h-5 stroke-[3px]" />
                </button>
            </div>
        </section>

        {/* 6. Spend Smarter */}
        <section className="py-24 px-6 relative z-10">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-5xl md:text-[70px] font-black text-white leading-[0.9] tracking-tighter uppercase">
                            Spend smarter. <br/><span className="text-white/40">Boost bigger.</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tile 1 */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-primary/20 hover:-translate-y-2 group">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Reduce prices</h4>
                        <p className="text-white/40 font-medium leading-relaxed text-sm">
                            Apply your cashback instantly at checkout to cut down the cost of any new purchase seamlessly.
                        </p>
                    </div>

                    {/* Tile 2 */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-primary/20 hover:-translate-y-2 group">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Save for later</h4>
                        <p className="text-white/40 font-medium leading-relaxed text-sm">
                            Let your cashback accumulate over time in your wallet and use it later for massive discounts.
                        </p>
                    </div>

                    {/* Tile 3 */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 transition-all hover:border-primary/20 hover:-translate-y-2 group">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">No restrictions</h4>
                        <p className="text-white/40 font-medium leading-relaxed text-sm">
                            There are no limits — spend your cashback however you like across the entire BoostGG platform.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* 7. Referral Section */}
        <section className="py-24 px-6 relative z-10">
            <div className="max-w-[1400px] mx-auto bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden relative group hover:border-primary/30 transition-colors">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -top-[50%] -right-[10%] w-[60%] h-[200%] bg-gradient-to-l from-primary/10 to-transparent blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Left Content */}
                    <div className="max-w-xl text-center lg:text-left">
                        <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-6">Affiliate Network</p>
                        <h2 className="text-5xl md:text-[80px] font-black text-white leading-[0.8] mb-8 tracking-tighter uppercase">
                            Invite & <br /> <span className="text-white/40">Earn $20</span>
                        </h2>
                        <p className="text-white/60 font-medium text-lg mb-10 leading-relaxed">
                            Share your unique link with friends. When they register and place their first order, you'll instantly receive $20 in your wallet.
                        </p>
                        <button className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(162,230,62,0.2)] flex items-center justify-center gap-3 w-full sm:w-auto">
                            Get Your Link
                            <ArrowUpRight className="w-5 h-5 stroke-[3px]" />
                        </button>
                    </div>

                    {/* Right: Abstract Network Visual */}
                    <div className="relative w-full lg:w-[400px] aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full"></div>
                        <div className="relative z-10 w-48 h-48 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-2xl">
                            <div className="absolute inset-2 rounded-full border border-primary/20 border-dashed animate-[spin_20s_linear_infinite]"></div>
                            <Share2 className="w-16 h-16 text-primary" />
                        </div>
                        
                        {/* Orbiting Elements */}
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-xl z-20"
                                style={{
                                    top: i === 0 ? '10%' : i === 1 ? '70%' : '40%',
                                    left: i === 0 ? '20%' : i === 1 ? '10%' : '80%',
                                    animation: `float ${4 + i}s infinite ease-in-out`
                                }}
                            >
                                <span className="text-primary font-black text-lg">+$20</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* 8. Payment Icons Section */}
        <section className="py-20 px-6 border-t border-white/5 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <div className="max-w-[1400px] mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16">
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">PayPal</span>
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">VISA</span>
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">MasterCard</span>
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">Apple Pay</span>
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">G-Pay</span>
                <span className="text-2xl font-black tracking-widest opacity-40 uppercase hover:opacity-100 transition-opacity">Crypto</span>
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
