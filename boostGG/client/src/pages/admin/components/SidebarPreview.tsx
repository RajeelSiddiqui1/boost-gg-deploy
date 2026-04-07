import React, { useState, useEffect, useMemo } from "react";
import { Info, Check, Zap, Shield, Clock } from "lucide-react";
import { ServiceData } from "../types/ServiceCreator";

export function SidebarPreview({ state }: { state: ServiceData }) {
    const [selected, setSelected] = useState<Record<string, any>>({});
    const [quantity, setQuantity] = useState(1);
    const [activeSpeed, setActiveSpeed] = useState<"express" | "super" | null>("super");

    // Initialize defaults
    useEffect(() => {
        const initial: Record<string, any> = {};
        state.sidebarSections.forEach(s => {
            if (s.fieldType === 'radio' || s.fieldType === 'dropdown') {
                initial[s.id] = s.options?.find(o => o.isDefault)?.label || s.options?.[0]?.label;
            } else if (s.fieldType === 'checkbox') {
                initial[s.id] = s.options?.filter(o => o.isDefault).map(o => o.label) || [];
            } else if (s.fieldType === 'stepper') {
                initial[s.id] = s.stepperConfig?.default || 1;
            }
        });
        setSelected(initial);
    }, [state.sidebarSections]);

    const total = useMemo(() => {
        let price = state.basePrice;

        state.sidebarSections.forEach(s => {
            const val = selected[s.id];
            if (val === undefined || val === null) return;

            if ((s.fieldType === 'radio' || s.fieldType === 'dropdown') && typeof val === 'string') {
                const opt = s.options?.find(o => o.label === val);
                if (opt) price += opt.priceModifier;
            } else if (s.fieldType === 'checkbox' && Array.isArray(val)) {
                val.forEach((label: string) => {
                    const opt = s.options?.find(o => o.label === label);
                    if (opt) price += opt.priceModifier;
                });
            } else if (s.fieldType === 'stepper' && typeof val === 'number') {
                price += (val * (s.stepperConfig?.pricePerUnit || 0));
            }
        });

        if (activeSpeed === "express") price += state.speedOptions.express.priceModifier;
        if (activeSpeed === "super") price += state.speedOptions.superExpress.priceModifier;

        let subtotal = price * quantity;
        if (quantity > 1) subtotal *= 0.95; // Multi-day/char discount simulation

        return subtotal.toFixed(2);
    }, [state, selected, quantity, activeSpeed]);

    const cashback = (parseFloat(total) * (state.cashbackPercent / 100)).toFixed(2);

    return (
        <div className="flex flex-col gap-4 w-[300px] animate-in fade-in zoom-in-95 duration-500">
            {/* Options Panel */}
            <div className="rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#141414] shadow-2xl">
                {state.sidebarSections.map((s, i) => (
                    <div key={s.id} className={`p-5 ${i < state.sidebarSections.length - 1 ? 'border-b border-[#222]' : ''}`}>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4 flex items-center justify-between">
                            {s.heading}
                            {s.required && <span className="text-[8px] text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Req</span>}
                        </h4>

                        {s.fieldType === 'radio' && (
                            <div className="space-y-2.5">
                                {s.options?.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelected(p => ({ ...p, [s.id]: opt.label }))}
                                        className={`w-full flex items-center justify-between text-left group p-2.5 rounded-xl border transition-all ${selected[s.id] === opt.label ? 'bg-purple-600/5 border-purple-500/30' : 'bg-[#1a1a1a] border-transparent hover:border-[#333]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selected[s.id] === opt.label ? 'border-purple-500 bg-purple-500' : 'border-[#333]'}`}>
                                                {selected[s.id] === opt.label && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-[13px] font-bold transition-colors ${selected[s.id] === opt.label ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{opt.label}</span>
                                        </div>
                                        <span className={`text-[11px] font-black ${selected[s.id] === opt.label ? 'text-purple-400' : 'text-gray-600'}`}>
                                            {opt.priceLabel || (opt.priceModifier !== 0 ? `+$${opt.priceModifier.toFixed(2)}` : "Free")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {s.fieldType === 'checkbox' && (
                            <div className="space-y-2.5">
                                {s.options?.map(opt => {
                                    const isActive = (selected[s.id] || []).includes(opt.label);
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                const current = selected[s.id] || [];
                                                const updated = current.includes(opt.label) ? current.filter((l: any) => l !== opt.label) : [...current, opt.label];
                                                setSelected(p => ({ ...p, [s.id]: updated }));
                                            }}
                                            className={`w-full flex items-center justify-between text-left group p-2.5 rounded-xl border transition-all ${isActive ? 'bg-purple-600/5 border-purple-500/30' : 'bg-[#1a1a1a] border-transparent hover:border-[#333]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-lg border-2 flex items-center justify-center transition-all ${isActive ? 'border-purple-500 bg-purple-500' : 'border-[#333]'}`}>
                                                    {isActive && <Check size={10} strokeWidth={4} className="text-white" />}
                                                </div>
                                                <span className={`text-[13px] font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{opt.label}</span>
                                                {opt.showInfo && <Info size={12} className="text-gray-600" />}
                                            </div>
                                            {opt.priceModifier !== 0 && <span className={`text-[11px] font-black ${isActive ? 'text-purple-400' : 'text-gray-600'}`}>+${opt.priceModifier.toFixed(2)}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {s.fieldType === 'dropdown' && (
                            <div className="relative group">
                                <select
                                    value={selected[s.id] || (s.options?.[0]?.label || "")}
                                    onChange={(e) => setSelected(p => ({ ...p, [s.id]: e.target.value }))}
                                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none appearance-none focus:border-purple-500 transition-all cursor-pointer"
                                >
                                    {s.options?.map(o => <option key={o.id} value={o.label}>{o.label}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        )}

                        {s.fieldType === 'stepper' && (
                            <div className="flex items-center justify-between bg-[#0d0d0d] p-3 rounded-2xl border border-[#222]">
                                <span className="text-xs font-black text-gray-400 ml-2 uppercase tracking-widest">{s.stepperConfig?.unitLabel || "Quantity"}</span>
                                <div className="flex items-center gap-5">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center hover:bg-purple-600 hover:border-purple-500 text-gray-400 hover:text-white transition-all shadow-lg active:scale-95"><span>−</span></button>
                                    <span className="text-xl font-black text-white italic tracking-tighter w-4 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center hover:bg-purple-600 hover:border-purple-500 text-gray-400 hover:text-white transition-all shadow-lg active:scale-95"><span>+</span></button>
                                </div>
                            </div>
                        )}

                        {s.fieldType === 'text_input' && (
                            <input
                                type="text"
                                value={selected[s.id] || ""}
                                onChange={(e) => setSelected(p => ({ ...p, [s.id]: e.target.value }))}
                                placeholder={s.placeholder}
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-all font-medium placeholder:text-gray-700"
                            />
                        )}
                    </div>
                ))}

                {/* Speed Option */}
                <div className="p-5 border-t border-[#222] bg-[#0d0d0d]/50">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4">COMPLETION SPEED</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {state.speedOptions.express.enabled && (
                            <button
                                onClick={() => setActiveSpeed("express")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${activeSpeed === "express" ? "bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.1)]" : "bg-[#1a1a1a] border-transparent hover:border-[#333]"}`}
                            >
                                <Zap size={16} className={activeSpeed === "express" ? "text-purple-400" : "text-gray-600"} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeSpeed === "express" ? "text-white" : "text-gray-500"}`}>{state.speedOptions.express.label}</span>
                            </button>
                        )}
                        {state.speedOptions.superExpress.enabled && (
                            <button
                                onClick={() => setActiveSpeed("super")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${activeSpeed === "super" ? "bg-purple-600 shadow-[0_10px_20px_rgba(147,51,234,0.3)] border-purple-400" : "bg-[#1a1a1a] border-transparent hover:border-[#333]"}`}
                            >
                                <Zap size={16} className={activeSpeed === "super" ? "text-white" : "text-gray-600"} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeSpeed === "super" ? "text-white font-black" : "text-gray-500"}`}>{state.speedOptions.superExpress.label}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Checkout Card */}
            <div className="rounded-3xl overflow-hidden bg-[#141414] border border-[#2a2a2a] shadow-2xl group/checkout">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#555] mb-1">Estimated Total</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white italic tracking-tighter leading-none">${total}</span>
                                {state.showVAT && <span className="text-[9px] text-[#444] font-black uppercase tracking-widest leading-none mb-1">incl. VAT</span>}
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-lg group-hover/checkout:scale-110 transition-all">
                            <Clock size={24} className="text-white" strokeWidth={3} />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap size={12} className="text-purple-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Starting In</span>
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase italic">{state.estimatedStartTime || "15 min"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-purple-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Est. Completion</span>
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase italic">{state.estimatedCompletionTime || "Flexible"}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Shield size={14} className="text-green-500" />
                            </div>
                            <span className="text-[11px] font-bold text-green-500">Secure Checkout</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#444] mb-0.5">Cashback</span>
                            <span className="text-xs font-black text-green-500">+${cashback}</span>
                        </div>
                    </div>

                    <button className="w-full py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_40px_rgba(147,51,234,0.4)] hover:shadow-[0_20px_50px_rgba(147,51,234,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group/btn">
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                        Buy This Service Now
                    </button>

                    <p className="text-[9px] text-[#444] font-bold uppercase tracking-[0.1em] text-center leading-relaxed">
                        Instant start • 24/7 Support • Moneyback Guarantee
                    </p>
                </div>
            </div>
        </div>
    );
}
