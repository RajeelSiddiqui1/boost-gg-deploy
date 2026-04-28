import React from 'react';
import { Sparkles, Coins, UserCircle2, Star } from 'lucide-react';
import { useMode } from '../../context/ModeContext';

const SubNavbar = () => {
 const { activeMode, changeMode, MODES } = useMode();

 const toggle = (key) => {
 if (activeMode !== key) {
 changeMode(key);
 }
 };

 const items = [
 { key: MODES.BOOSTING, label: 'BOOSTGG SELECTION', icon: Sparkles },
 { key: MODES.CURRENCY, label: 'GOLD / CURRENCY', icon: Coins },
 { key: MODES.ACCOUNTS, label: 'ACCOUNTS', icon: UserCircle2 },
 ];

 return (
 <div className="bg-transparent px-6 relative z-50 pointer-events-none mt-2">
 <div className="max-w-[1400px] mx-auto py-2 flex flex-col lg:flex-row items-center justify-between gap-4 pointer-events-auto">
                <div className="flex items-center gap-4 border border-white/30 bg-white/[0.03] rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                            ))}
                        </div>
                        <span className="text-[11px] font-black text-white ml-1">4.9</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider ml-1">11,200+ reviews</span>
                    </div>

                    <div className="w-[1px] h-3 bg-white/10"></div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 bg-[#13c100] rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 bg-[#13c100] rounded-full animate-ping opacity-20"></div>
                        </div>
                        <span className="text-[11px] font-black text-white">496</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">players online</span>
                    </div>
                </div>

 <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
 {items.map((item) => {
 const isOn = activeMode === item.key;
 return (
 <div
 key={item.key}
 className="flex items-center gap-2.5 cursor-pointer group"
 onClick={() => toggle(item.key)}
 >
 {/* Icon Container */}
 <div
 className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${isOn ? 'text-primary' : 'text-white/30'}`}
 style={{ backgroundColor: isOn ? '#1a2b10' : '#111111' }}
 >
 <item.icon className="w-3.5 h-3.5" />
 </div>

 {/* Label */}
 <span className={`text-[10px] font-black tracking-widest transition-colors ${isOn ? 'text-white' : 'text-white/30 group-hover:text-white/50'}`}>
 {item.label}
 </span>

 {/* Switch */}
 <div
 className="w-9 h-5 rounded-full relative transition-all duration-300 ml-1 flex items-center px-[3px]"
 style={{ backgroundColor: isOn ? '#a2e63e' : '#111111' }}
 >
 <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 transform ${isOn ? 'translate-x-[16px]' : 'translate-x-0 bg-white/30'}`}></div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
};

export default SubNavbar;
