import React from 'react';
import { Shield, Wifi, ShieldCheck, Headphones, RefreshCw, Percent } from "lucide-react";

const trustItems = [
 { icon: Shield, label: "SSL Secure" },
 { icon: Wifi, label: "VPN, Safe Boost" },
 { icon: ShieldCheck, label: "Safe Service" },
 { icon: Headphones, label: "24/7 Support" },
 { icon: RefreshCw, label: "Money refunds" },
 { icon: Percent, label: "Cashback 5%" },
];

const TrustBadges = () => {
 return (
 <div className="flex flex-wrap gap-4 border-y border-white/5 py-8">
 {trustItems.map((item) => (
 <div key={item.label} className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl transition-all hover:bg-white/[0.05]">
 <item.icon size={16} className="text-primary" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
 </div>
 ))}
 </div>
 );
};

export default TrustBadges;
