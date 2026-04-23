import React from 'react';
import { Star, MessageCircle, Heart, Clock, Zap, ShieldCheck } from "lucide-react";

/**
 * ProductHero Component
 * Strictly aligned with SkyCoach premium immersive hero design.
 */
const ProductHero = ({
 title,
 rating = 4.9,
 reviewCount = 1205,
 bgImage,
 characterImage,
 estimatedStartTime = "24 hours",
 estimatedCompletionTime = "48 hours",
 gameName = "Game"
}) => {
 return (
 <div className="relative group animate-fade-in">
 {/* Strict Breadcrumbs */}
 <div className="flex items-center gap-2 mb-6 text-[10.66px] font-black uppercase tracking-[0.2em] text-white/30 font-stolzl">
 <span className="hover:text-white transition-colors cursor-pointer">Games</span>
 <span className="w-1 h-1 rounded-full bg-white/20"></span>
 <span className="text-white/40 hover:text-white transition-colors cursor-pointer">{gameName}</span>
 <span className="w-1 h-1 rounded-full bg-white/20"></span>
 <span className="text-primary">{title}</span>
 </div>

 {/* Title & Action Container */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
 <div className="space-y-4">
 <h1 className="text-[44.44px] font-black uppercase tracking-tighter text-white leading-none font-skycoach">
 {title}
 </h1>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer">
 <Star className="w-4 h-4 text-primary fill-primary" />
 <span className="text-sm font-black text-white ">{rating}</span>
 </div>
 <div className="h-4 w-px bg-white/10" />
 <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer">
 <MessageCircle className="w-4 h-4 text-white/40" />
 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{reviewCount} Reviews</span>
 </div>
 </div>
 </div>
 <button className="self-start p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:scale-110 active:scale-95 transition-all group/btn shadow-xl shadow-black/20">
 <Heart className="w-6 h-6 text-white/40 group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-colors" />
 </button>
 </div>

 {/* Immersive Card */}
 <div className="relative overflow-hidden rounded-[28.44px] border border-white/5 shadow-2xl bg-black">
 {/* Immersive Background */}
 <div className="h-[460px] w-full relative overflow-hidden">
 {/* Soft Aura Glow Layer (from audit) */}
 <div className="absolute inset-0 z-0 sky-aura-glow" />

 {/* Main BG Image Layer */}
 <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
 <img
 src={bgImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"}
 alt={title}
 className="h-full w-full object-cover rounded-[24px] opacity-40 transition-transform duration-1000 group-hover:scale-[1.05]"
 />
 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent rounded-[24px]" />
 </div>

 {/* Floating Character */}
 {characterImage && (
 <div className="absolute inset-0 z-20 flex items-center justify-end pr-10 pointer-events-none overflow-hidden">
 <img
 src={characterImage}
 alt={`${title} character`}
 className="h-[120%] object-contain object-right transform translate-y-10 group-hover:translate-y-6 transition-transform duration-1000 drop-shadow-[0_0_80px_rgba(90,48,255,0.3)]"
 />
 {/* Floating Labels over Character */}
 <div className="absolute right-60 top-1/4 animate-bounce-slow">
 <div className="bg-primary/95 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
 <Zap className="w-3.5 h-3.5 text-black fill-black" />
 <span className="text-[10px] font-black uppercase text-black ">PRO BOOSTERS</span>
 </div>
 </div>
 <div className="absolute right-20 bottom-1/4 animate-bounce-normal">
 <div className="bg-sky-purple/95 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
 <ShieldCheck className="w-3.5 h-3.5 text-white" />
 <span className="text-[10px] font-black uppercase text-white ">TRUSTED SERVICE</span>
 </div>
 </div>
 </div>
 )}

 {/* Highly Polished Review Card Overlay */}
 <div className="absolute left-10 bottom-10 z-30 max-w-[340px] animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[35.55px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/card hover:bg-white/10 transition-colors">
 <div className="flex items-center gap-1 mb-4">
 {[...Array(5)].map((_, i) => (
 <Star key={i} className="w-4 h-4 text-primary fill-primary" />
 ))}
 </div>
 <p className="text-white text-[15px] font-bold leading-relaxed mb-6 group-hover:text-primary transition-colors">
 "Incredible experience! The booster was professional, fast, and kept me updated. 10/10 would use again!"
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/30">JD</div>
 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 ">John D.</span>
 </div>
 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all underline decoration-primary/30 underline-offset-4">
 Read more <MessageCircle className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Highly Spaced Stats Footer */}
 <div className="grid grid-cols-2 bg-white/[0.02] border-t border-white/5 divide-x divide-white/5">
 <div className="p-10 flex items-center gap-8 group/stat cursor-default">
 <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
 <Clock className="w-7 h-7" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 font-stolzl">Est. Start Time</p>
 <p className="text-xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{estimatedStartTime}</p>
 </div>
 </div>
 <div className="p-10 flex items-center gap-8 group/stat cursor-default">
 <div className="w-16 h-16 rounded-[20px] bg-sky-purple/10 flex items-center justify-center text-sky-purple shadow-inner group-hover:scale-110 transition-transform">
 <Clock className="w-7 h-7" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 font-stolzl">Completion Time</p>
 <p className="text-xl font-black text-sky-purple uppercase tracking-tighter leading-none group-hover:text-sky-purple-light transition-colors">{estimatedCompletionTime}</p>
 </div>
 </div>
 </div>
 </div>

 <style>{`
 @font-face {
 font-family: 'skycoach';
 src: url('path-to-font'); /* Placeholder for user's font system */
 }
 @keyframes bounce-slow {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-20px); }
 }
 @keyframes bounce-normal {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-15px); }
 }
 .animate-bounce-slow {
 animation: bounce-slow 4s ease-in-out infinite;
 }
 .animate-bounce-normal {
 animation: bounce-normal 3s ease-in-out infinite;
 }
 .font-skycoach {
 font-family: 'SKSkycoach', 'Stolzl', sans-serif;
 }
 .font-stolzl {
 font-family: 'Stolzl', sans-serif;
 }
 `}</style>
 </div>
 );
};

export default ProductHero;
