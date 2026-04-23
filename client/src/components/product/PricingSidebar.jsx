import React from 'react';
import { ShoppingCart, ShieldCheck, Zap, Mail, ChevronRight, MessageSquare } from "lucide-react";

/**
 * PricingSidebar Component
 * Strictly aligned with SkyCoach gradient and padding tokens.
 */
const PricingSidebar = ({
 price,
 originalPrice,
 discount,
 cashback = 0,
 quantity = 1,
 setQuantity,
 email,
 setEmail,
 onBuyNow,
 onlineBoosters = 12
}) => {
 return (
 <div className="sticky top-8 space-y-6">
 {/* Main Pricing Card */}
 <div className="rounded-[14.22px] bg-sky-purple-gradient p-[21.33px] shadow-sky-sidebar relative overflow-hidden group/sidebar animate-in fade-in slide-in-from-right-8 duration-700">
 {/* Subtle Glow Overlay */}
 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" />

 {/* Header Info */}
 <div className="flex items-center justify-between mb-8 relative z-10">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white/60 font-stolzl">{onlineBoosters} Boosters Online</span>
 </div>
 <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
 <span className="text-[10px] font-black uppercase text-white/80 font-stolzl">ID: 6926</span>
 </div>
 </div>

 {/* Price Display */}
 <div className="mb-8 relative z-10">
 <div className="flex items-baseline gap-3 mb-1">
 <span className="text-4xl font-black text-white font-skycoach">{price} €</span>
 {originalPrice && (
 <span className="text-lg font-bold text-white/30 line-through decoration-red-500/50">{originalPrice} €</span>
 )}
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-stolzl ">excl. VAT</span>
 {discount && (
 <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded uppercase tracking-wider">-{discount}% OFF</span>
 )}
 </div>
 </div>

 {/* Quantity & Email Section */}
 <div className="space-y-4 mb-8 relative z-10">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 font-stolzl ml-1">Quantity</label>
 <div className="flex items-center bg-black/20 rounded-xl p-1.5 border border-white/5 group/qty hover:border-white/20 transition-all">
 <button
 onClick={() => setQuantity(Math.max(1, quantity - 1))}
 className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all font-black"
 > - </button>
 <span className="flex-1 text-center font-black text-white text-lg">{quantity} units</span>
 <button
 onClick={() => setQuantity(quantity + 1)}
 className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all font-black"
 > + </button>
 </div>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 font-stolzl ml-1">Contact Email</label>
 <div className="relative group/input">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-white/60 transition-colors">
 <Mail size={16} />
 </div>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="Enter your email"
 className="w-full bg-black/20 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-semibold placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-black/30 transition-all"
 />
 </div>
 </div>
 </div>

 {/* Main Action Button */}
 <button
 onClick={onBuyNow}
 className="w-full bg-sky-green-gradient group/btn relative overflow-hidden rounded-[12px] p-5 shadow-[0_10px_30px_rgba(19,193,0,0.3)] hover:shadow-[0_15px_40px_rgba(19,193,0,0.5)] transition-all active:scale-[0.98]"
 >
 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
 <div className="flex items-center justify-center gap-3 relative z-10">
 <span className="text-xl font-black uppercase tracking-tighter text-black">Buy now</span>
 <ShieldCheck className="w-6 h-6 text-black fill-black/20" />
 </div>
 </button>

 {/* Cashback Badge */}
 <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group/cashback cursor-help relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-sky-gold/20 flex items-center justify-center text-sky-gold group-hover:scale-110 transition-transform">
 <Zap size={16} fill="currentColor" />
 </div>
 <div>
 <p className="text-[8px] font-black uppercase tracking-widest text-white/30 font-stolzl">You will get</p>
 <p className="text-xs font-black text-white ">+{cashback} € Cashback</p>
 </div>
 </div>
 <ChevronRight size={14} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
 </div>
 </div>

 {/* Secondary Actions */}
 <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
 <button className="flex flex-col items-center justify-center gap-2 p-5 bg-white/[0.02] border border-white/5 rounded-[20px] hover:bg-white/5 transition-all group/sub">
 <MessageSquare size={20} className="text-white/40 group-hover/sub:text-primary transition-colors" />
 <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-stolzl">Chat now</span>
 </button>
 <button className="flex flex-col items-center justify-center gap-2 p-5 bg-white/[0.02] border border-white/5 rounded-[20px] hover:bg-white/5 transition-all group/sub">
 <ShoppingCart size={20} className="text-white/40 group-hover/sub:text-primary transition-colors" />
 <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-stolzl">Add to cart</span>
 </button>
 </div>

 {/* Payment Methods */}
 <div className="flex items-center justify-center gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 py-4">
 <img src="/payment/visa.svg" className="h-4" alt="Visa" />
 <img src="/payment/mastercard.svg" className="h-4" alt="Mastercard" />
 <img src="/payment/paypal.svg" className="h-4" alt="Paypal" />
 <img src="/payment/apple-pay.svg" className="h-4" alt="Apple Pay" />
 </div>
 </div>
 );
};

export default PricingSidebar;
