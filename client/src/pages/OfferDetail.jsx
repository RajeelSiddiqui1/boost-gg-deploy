import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL, getImageUrl } from '../utils/api';
import {
    Star, ShieldCheck, Zap, Clock, ChevronRight,
    CheckCircle2, Info, Loader2, ShoppingCart,
    ArrowLeft, Globe, PlayCircle, Plus
} from 'lucide-react';

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Calculator State
    const [calcValue, setCalcValue] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/offers/${id}`);
                setOffer(res.data.data);
                // Set initial calculator value
                if (res.data.data.calculatorSettings) {
                    setCalcValue(res.data.data.calculatorSettings.min || 1);
                }
                // Initialize options
                const initialOptions = {};
                res.data.data.options?.forEach(opt => {
                    const defaultChoice = opt.choices.find(c => c.isDefault) || opt.choices[0];
                    initialOptions[opt.name] = opt.type === 'checkbox' ? [] : defaultChoice.label;
                });
                setSelectedOptions(initialOptions);
                setLoading(false);
            } catch (err) {
                setError('Service not found or server error');
                setLoading(false);
            }
        };
        fetchOffer();
    }, [id]);

    useEffect(() => {
        if (!offer) return;

        let base = offer.price;
        let modifier = 0;

        // Calculator multiplier
        if (offer.calculatorType === 'slider' && offer.calculatorSettings) {
            base = calcValue * (offer.calculatorSettings.basePrice || 1);
        }

        // Add-ons modifiers
        offer.options?.forEach(opt => {
            if (opt.type === 'checkbox') {
                const selectedLabels = selectedOptions[opt.name] || [];
                selectedLabels.forEach(label => {
                    const choice = opt.choices.find(c => c.label === label);
                    if (choice) modifier += (choice.priceModifier || 0);
                });
            } else {
                const selectedLabel = selectedOptions[opt.name];
                const choice = opt.choices.find(c => c.label === selectedLabel);
                if (choice) modifier += (choice.priceModifier || 0);
            }
        });

        setTotalPrice(base + modifier);
    }, [offer, calcValue, selectedOptions]);

    const handleOptionChange = (optName, choiceLabel, isCheckbox) => {
        if (isCheckbox) {
            setSelectedOptions(prev => {
                const current = prev[optName] || [];
                if (current.includes(choiceLabel)) {
                    return { ...prev, [optName]: current.filter(l => l !== choiceLabel) };
                } else {
                    return { ...prev, [optName]: [...current, choiceLabel] };
                }
            });
        } else {
            setSelectedOptions(prev => ({ ...prev, [optName]: choiceLabel }));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (error || !offer) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
            <h1 className="text-4xl font-black italic mb-4">OUPPS!</h1>
            <p className="text-white/40 mb-8">{error || 'Offer not found'}</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">Back to Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 font-['Outfit']">
            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Info & Details */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Navigation Breadcrumb */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:text-white cursor-pointer">{offer.game}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">{offer.title}</span>
                    </div>

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-[10px] font-black uppercase tracking-wider">
                            <Zap className="w-3 h-3 fill-primary" />
                            {offer.category}
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tight leading-none uppercase max-w-2xl">{offer.title}</h1>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-black">{offer.rating}</span>
                                <span className="text-white/30 text-xs font-bold uppercase tracking-widest ml-1">({offer.reviews} Reviews)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/40">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-bold uppercase tracking-widest">Est. Start: 15-30 min</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Banner / Gallery Mock */}
                    <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/5 group">
                        <img
                            src={getImageUrl(offer.image)}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt={offer.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    {offer.features?.map((f, i) => (
                                        <div key={i} className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-primary" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Content */}
                    <div className="space-y-8">
                        <div className="flex gap-10 border-b border-white/5">
                            <button className="pb-4 text-xs font-black uppercase tracking-[0.2em] text-primary border-b-2 border-primary">Description</button>
                            <button className="pb-4 text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Requirements</button>
                            <button className="pb-4 text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">How it works</button>
                        </div>
                        <div className="space-y-6">
                            <p className="text-white/60 text-lg leading-relaxed font-bold italic">
                                {offer.description || "Boost your gameplay with our premium service. We ensure fast delivery, top-tier professional pilots, and absolute account security."}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {offer.requirements?.map((req, i) => (
                                    <div key={i} className="flex items-start gap-3 p-5 bg-[#0A0A0A] border border-white/5 rounded-[24px]">
                                        <Info className="w-5 h-5 text-white/20 shrink-0" />
                                        <span className="text-sm font-bold text-white/70">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Calculator & Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* THE CALCULATOR CARD */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] p-8 backdrop-blur-3xl relative overflow-hidden group/calc">
                            {/* Accent Glows */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover/calc:bg-primary/20 transition-all duration-700"></div>

                            <div className="relative z-10 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Select Options</h3>

                                {/* Slider Calculator */}
                                {offer.calculatorType === 'slider' && offer.calculatorSettings && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{offer.calculatorSettings.unitName}</span>
                                            <span className="text-3xl font-black italic text-primary">{calcValue}</span>
                                        </div>
                                        <div className="relative pt-1">
                                            <input
                                                type="range"
                                                min={offer.calculatorSettings.min}
                                                max={offer.calculatorSettings.max}
                                                step={offer.calculatorSettings.step}
                                                value={calcValue}
                                                onChange={(e) => setCalcValue(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between mt-3 text-[10px] font-bold text-white/20">
                                                <span>{offer.calculatorSettings.min}</span>
                                                <span>{offer.calculatorSettings.max}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dynamic Options (Radio/Checkbox) */}
                                {offer.options?.map((opt, i) => (
                                    <div key={i} className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{opt.name}</label>
                                        <div className="flex flex-col gap-2">
                                            {opt.choices.map((choice, ci) => (
                                                <div
                                                    key={ci}
                                                    onClick={() => handleOptionChange(opt.name, choice.label, opt.type === 'checkbox')}
                                                    className={`
                                                        p-4 rounded-2xl border text-sm font-bold flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]
                                                        ${opt.type === 'checkbox'
                                                            ? (selectedOptions[opt.name]?.includes(choice.label) ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(162,230,62,0.1)]' : 'bg-white/[0.03] border-white/5 hover:border-white/10')
                                                            : (selectedOptions[opt.name] === choice.label ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(162,230,62,0.1)]' : 'bg-white/[0.03] border-white/5 hover:border-white/10')
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center ${(opt.type === 'checkbox' ? selectedOptions[opt.name]?.includes(choice.label) : selectedOptions[opt.name] === choice.label) ? 'bg-primary border-primary' : ''
                                                            }`}>
                                                            {(opt.type === 'checkbox' ? selectedOptions[opt.name]?.includes(choice.label) : selectedOptions[opt.name] === choice.label) && <Zap className="w-2.5 h-2.5 fill-white text-white" />}
                                                        </div>
                                                        {choice.label}
                                                    </div>
                                                    {choice.priceModifier > 0 && (
                                                        <span className="text-[10px] font-black text-primary">
                                                            +{formatPrice(choice.priceModifier)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Pricing Breakdown Area */}
                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Final Price</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-bold text-white/40 line-through">{formatPrice(Math.round(totalPrice * 2))}</span>
                                                <span className="text-4xl font-black italic tracking-tighter">{formatPrice(Math.round(totalPrice))}</span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                                            <ShoppingCart className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            addToCart({
                                                id: offer._id,
                                                title: offer.title,
                                                image: offer.image,
                                                price: totalPrice,
                                                calcValue: calcValue,
                                                unitName: offer.calculatorSettings?.unitName,
                                                selectedOptions: selectedOptions
                                            });
                                        }}
                                        className="w-full bg-primary hover:bg-[#8bc332] text-black py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-primary/40 group/btn overflow-hidden relative"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Buy Product <ArrowLeft className="w-5 h-5 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                                    </button>

                                    <div className="flex items-center justify-center gap-6 pt-4">
                                        <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Safe Service</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Global Support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why choose us small card */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">Our Guarantee</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                        <PlayCircle className="w-4 h-4 text-white/40" />
                                    </div>
                                    <span className="text-xs font-bold text-white/60">Free stream on request</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-white/40" />
                                    </div>
                                    <span className="text-xs font-bold text-white/60">24/7 Personal management</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #a2e63e;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 15px rgba(162, 230, 62, 0.5);
                    transition: all 0.2s;
                }
                input[type='range']::-webkit-slider-thumb:hover {
                    scale: 1.1;
                    box-shadow: 0 0 25px rgba(162, 230, 62, 0.8);
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.1); opacity: 0.15; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default OfferDetail;
