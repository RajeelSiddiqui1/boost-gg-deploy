import React from 'react';
import { Sparkles, Coins, UserCircle2 } from 'lucide-react';
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
                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-[0.2em]">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    CUSTOMIZE YOUR EXPERIENCE
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
