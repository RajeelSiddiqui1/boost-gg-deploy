import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronRight, Zap, Shield, Clock, Heart, 
    Share2, Star, CheckCircle2, MessageSquare, 
    ArrowRight, Info, ShieldCheck, Gamepad2,
    DollarSign, Laptop, Smartphone, Monitor
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ReviewsSection from '../components/sections/ReviewsSection';
import DetailBanner from '../components/DetailBanner';
import PaymentMethods from '../components/sections/PaymentMethods';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [speed, setSpeed] = useState("normal");

    // Fetch Service Details
    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                let res;
                try {
                    res = await axios.get(`${API_URL}/api/v1/services/slug/${id}`);
                } catch (e) {
                    res = await axios.get(`${API_URL}/api/v1/services/${id}`);
                }
                
                const data = res.data.data;
                setService(data);

                const initialOpts = {};
                data.sidebarSections?.forEach(sec => {
                    if (sec.fieldType === 'checkbox') {
                        initialOpts[sec.id] = sec.options?.filter(o => o.isDefault).map(o => o.label) || [];
                    } else if (sec.fieldType === 'stepper' || sec.fieldType === 'range' || sec.fieldType === 'slider') {
                        initialOpts[sec.id] = sec.stepperConfig?.default || sec.stepperConfig?.min || 1;
                    } else {
                        const defaultChoice = sec.options?.find(o => o.isDefault) || sec.options?.[0];
                        initialOpts[sec.id] = defaultChoice?.label || "";
                    }
                });
                setSelectedOptions(initialOpts);

                if (data.gameId) {
                    const relatedRes = await axios.get(`${API_URL}/api/v1/services?gameId=${data.gameId._id}&limit=4`);
                    setRelatedServices(relatedRes.data.data.filter(s => s._id !== data._id));
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching service:", err);
                setError("Service not found");
                setLoading(false);
            }
        };
        if (id) fetchService();
        window.scrollTo(0, 0);
    }, [id]);

    const totalPrice = useMemo(() => {
        if (!service) return 0;
        
        let base = service.price || service.pricing?.basePrice || 0;
        let dynamicAdd = 0;

        service.sidebarSections?.forEach(sec => {
            const selected = selectedOptions[sec.id];
            if (selected === undefined || selected === null) return;

            if (sec.fieldType === 'checkbox') {
                selected.forEach(choiceLabel => {
                    const choice = sec.options?.find(o => o.label === choiceLabel);
                    if (choice) dynamicAdd += (choice.priceModifier || 0);
                });
            } else if (sec.fieldType === 'stepper' || sec.fieldType === 'range' || sec.fieldType === 'slider') {
                const value = Number(selected) || 0;
                const pricePerUnit = sec.stepperConfig?.pricePerUnit || 0;
                
                if (sec.fieldType === 'range' || sec.fieldType === 'slider') {
                    dynamicAdd += value * pricePerUnit;
                } else {
                    const diff = Math.max(0, value - (sec.stepperConfig?.min || 0));
                    dynamicAdd += diff * pricePerUnit;
                }
            } else {
                const choice = sec.options?.find(o => o.label === selected);
                if (choice) dynamicAdd += (choice.priceModifier || 0);
            }
        });

        if (speed === 'express' && service.speedOptions?.express?.enabled) {
            dynamicAdd += (service.speedOptions.express.priceModifier || 0.92);
        }
        if (speed === 'superExpress' && service.speedOptions?.superExpress?.enabled) {
            dynamicAdd += (service.speedOptions.superExpress.priceModifier || 1.84);
        }

        let subtotal = (base + dynamicAdd) * quantity;
        if (quantity > 1) subtotal *= 0.95;

        if (service.pricing?.minPrice > 0 && subtotal < service.pricing.minPrice) {
            subtotal = service.pricing.minPrice;
        }
        if (service.pricing?.maxPrice > 0 && subtotal > service.pricing.maxPrice) {
            subtotal = service.pricing.maxPrice;
        }

        return parseFloat(subtotal.toFixed(2));
    }, [service, selectedOptions, speed, quantity]);

    const handleBuyNow = () => {
        if (!service) return;
        const cartItem = {
            id: service._id,
            title: service.title,
            price: totalPrice / quantity,
            quantity: quantity,
            image: service.image || service.icon,
            selectedOptions: selectedOptions,
            game: service.gameId?.name,
            type: 'service'
        };
        addToCart(cartItem);
        navigate('/checkout');
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/40 space-y-4">
            <Gamepad2 className="w-16 h-16 opacity-20" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">{error || "Service Not Found"}</h2>
            <button onClick={() => navigate('/')} className="bg-primary text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">Go Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#060606] text-white font-['Outfit'] pt-24 pb-20 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-widest text-white/20 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to={`/game/${service.gameId?.slug}`} className="hover:text-primary transition-colors">{service.gameId?.name}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60">{service.title}</span>
                </div>

                {/* Page Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-10 bg-primary rounded-full"></div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{service.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-6 space-y-12">
                        <div className="relative h-[480px] rounded-[48px] overflow-hidden border border-white/5 bg-[#0A0A0A] group shadow-2xl">
                            <img src={getImageUrl(service.backgroundImage || service.image)} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            {service.icon && (
                                <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className="absolute w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
                                        <img src={getImageUrl(service.icon)} className="relative h-[80%] object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_50px_rgba(19,193,0,0.4)]" alt="" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 p-12 flex flex-col justify-between">
                                <div className="flex flex-col gap-3 items-start">
                                    <div className="px-4 py-2 bg-primary rounded-xl text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="w-3 h-3 fill-black" /> Top Seller
                                    </div>
                                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em]">Fast Delivery</div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
                                        </div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Excellent 4.9</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Start Time</p>
                                        <p className="text-xl font-black text-white uppercase">{service.estimatedStartTime || "15-30 min"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">Description</h2>
                            <div dangerouslySetInnerHTML={{ __html: service.description }} className="text-white/40 font-medium leading-relaxed" />
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Requirements</h2>
                            <div className="bg-[#0D0D0D] rounded-[32px] p-8 border border-white/5">
                                <ul className="space-y-4">
                                    {service.requirements?.map((req, i) => (
                                        <li key={i} className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-tight text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(19,193,0,0.5)]"></div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Options */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-[#0A0A0A] rounded-[40px] border border-white/5 p-8 space-y-8 shadow-2xl">
                            {service.sidebarSections?.sort((a, b) => a.displayOrder - b.displayOrder).map((section) => (
                                <div key={section.id} className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40">{section.heading}</h4>
                                    
                                    {(section.fieldType === 'range' || section.fieldType === 'slider') ? (
                                        <div className="relative pt-6 pb-10">
                                            <div className="absolute top-0 left-0 w-full flex justify-between px-1">
                                                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                                                    <span key={p} className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                                                        ${(Math.round((section.stepperConfig?.min || 0) + ((section.stepperConfig?.max || 1000) - (section.stepperConfig?.min || 0)) * p) * (section.stepperConfig?.pricePerUnit || 0)).toFixed(0)}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="relative h-12 flex items-center">
                                                <input 
                                                    type="range"
                                                    min={section.stepperConfig?.min || 0}
                                                    max={section.stepperConfig?.max || 1000}
                                                    step={section.stepperConfig?.step || 1}
                                                    value={selectedOptions[section.id] || section.stepperConfig?.min || 0}
                                                    onChange={(e) => setSelectedOptions(prev => ({ ...prev, [section.id]: Number(e.target.value) }))}
                                                    className="premium-range-slider"
                                                    style={{ '--range-progress': `${((selectedOptions[section.id] - (section.stepperConfig?.min || 0)) / ((section.stepperConfig?.max || 1000) - (section.stepperConfig?.min || 0))) * 100}%` }}
                                                />
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest px-1">
                                                <span>{selectedOptions[section.id] || section.stepperConfig?.min || 0}{section.stepperConfig?.unitLabel}</span>
                                                <span>{section.stepperConfig?.max}{section.stepperConfig?.unitLabel}</span>
                                            </div>
                                        </div>
                                    ) : section.fieldType === 'stepper' ? (
                                        <div className="flex items-center bg-white/5 rounded-2xl p-2 border border-white/5">
                                            <button onClick={() => setSelectedOptions(prev => ({ ...prev, [section.id]: Math.max(section.stepperConfig?.min || 1, (prev[section.id] || 1) - 1) }))} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 text-white font-black transition-all">−</button>
                                            <div className="flex-1 text-center font-black text-xl text-white">{selectedOptions[section.id] || 1}</div>
                                            <button onClick={() => setSelectedOptions(prev => ({ ...prev, [section.id]: Math.min(section.stepperConfig?.max || 9999, (prev[section.id] || 1) + 1) }))} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 text-white font-black transition-all">+</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {section.options?.map(opt => {
                                                const isSelected = section.fieldType === 'checkbox' ? (selectedOptions[section.id] || []).includes(opt.label) : selectedOptions[section.id] === opt.label;
                                                return (
                                                    <button key={opt.id} onClick={() => {
                                                        if (section.fieldType === 'checkbox') {
                                                            const current = selectedOptions[section.id] || [];
                                                            setSelectedOptions(prev => ({ ...prev, [section.id]: current.includes(opt.label) ? current.filter(c => c !== opt.label) : [...current, opt.label] }));
                                                        } else setSelectedOptions(prev => ({ ...prev, [section.id]: opt.label }));
                                                    }} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-white/10'}`}>
                                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                                                        </div>
                                                        {opt.priceModifier > 0 && <span className={`text-[10px] font-black ${isSelected ? 'text-primary' : 'text-white/20'}`}>+${opt.priceModifier}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Checkout */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24 bg-payment-method rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="p-10 space-y-8">
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Total</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-6xl font-black text-white tracking-tighter leading-none animate-fade-in" key={totalPrice}>{totalPrice}</h3>
                                        <span className="text-3xl font-black text-white">$</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">excl. VAT</p>
                            </div>

                            <div className="space-y-6">
                                {(service.speedOptions?.express?.enabled || service.speedOptions?.superExpress?.enabled) && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Select completion speed</h4>
                                        <div className="space-y-2">
                                            <button onClick={() => setSpeed("normal")} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${speed === "normal" ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${speed === "normal" ? 'border-primary bg-primary' : 'border-white/20'}`}>{speed === "normal" && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}</div>
                                                    <span className="text-xs font-bold uppercase">Normal</span>
                                                </div>
                                                <span className="text-[10px] font-bold opacity-40">FREE</span>
                                            </button>
                                            {service.speedOptions?.express?.enabled && (
                                                <button onClick={() => setSpeed("express")} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${speed === "express" ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${speed === "express" ? 'border-primary bg-primary' : 'border-white/20'}`}>{speed === "express" && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}</div>
                                                        <span className="text-xs font-bold uppercase">Express</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary">+${service.speedOptions.express.priceModifier || 0.92}</span>
                                                </button>
                                            )}
                                            {service.speedOptions?.superExpress?.enabled && (
                                                <button onClick={() => setSpeed("superExpress")} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${speed === "superExpress" ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${speed === "superExpress" ? 'border-primary bg-primary' : 'border-white/20'}`}>{speed === "superExpress" && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}</div>
                                                        <span className="text-xs font-bold uppercase">Super Express</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary">+${service.speedOptions.superExpress.priceModifier || 1.84}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <input type="email" placeholder="Your email" className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold placeholder:text-white/30 outline-none focus:border-white/20" />
                                    <button onClick={handleBuyNow} className="w-full bg-primary hover:bg-[#bbf74d] text-black font-black uppercase tracking-widest py-6 rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-2xl">Buy now <Shield className="w-5 h-5" /></button>
                                    <button onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))} className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-3 text-[10px]"><MessageSquare className="w-3 h-3" /> Chat With PRO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTIONS */}
                <div className="space-y-24">
                    <div className="space-y-12">
                        <h2 className="text-4xl font-black text-center uppercase tracking-tighter">How it works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { n: "01", title: "Select", desc: "Choose your options and order details" },
                                { n: "02", title: "Checkout", desc: "Pay securely via your preferred method" },
                                { n: "03", title: "Track", desc: "Monitor progress in your personal panel" },
                                { n: "04", title: "Complete", desc: "Enjoy your service and new rewards" }
                            ].map((step, i) => (
                                <div key={i} className="space-y-4 text-center md:text-left">
                                    <div className="text-5xl font-black text-primary/20">{step.n}</div>
                                    <h4 className="text-xl font-black uppercase text-white">{step.title}</h4>
                                    <p className="text-sm font-bold text-white/30 uppercase tracking-tight">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {relatedServices.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-center md:text-left">You may also like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {relatedServices.map((rel) => (
                                    <div key={rel._id} onClick={() => navigate(`/products/${rel.slug || rel._id}`)} className="group relative h-64 rounded-[32px] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/50 transition-all duration-500 shadow-2xl">
                                        <img src={rel.backgroundImage ? getImageUrl(rel.backgroundImage) : getImageUrl(rel.image)} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <h4 className="text-lg font-black text-white uppercase group-hover:text-primary transition-colors">{rel.title}</h4>
                                            <p className="text-[10px] font-black text-white/40 uppercase mt-2">Starting from ${rel.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DetailBanner />

                    <div className="max-w-[1100px] mx-auto">
                        <div className="bg-primary rounded-[48px] p-12 md:p-16 text-center relative overflow-hidden group shadow-2xl shadow-primary/30">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[100px] rounded-full -ml-48 -mb-48 transition-transform duration-1000 group-hover:scale-110"></div>
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter leading-[0.9]">Why <span className="text-white drop-shadow-lg">BoostGG</span> is <br/>the #1 Choice?</h3>
                                <p className="text-black/80 text-lg md:text-xl font-bold uppercase tracking-tight max-w-2xl mx-auto">Join 50,000+ satisfied gamers who reached their dream goals. We provide a professional experience with 24/7 live support and verified PRO players.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                                    {[{ icon: Shield, label: "SECURE & ANONYMOUS" }, { icon: Zap, label: "INSTANT START" }, { icon: Heart, label: "SATISFACTION GUARANTEED" }].map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3 p-6 bg-black/5 rounded-3xl transition-all hover:bg-black/10">
                                            <item.icon className="w-8 h-8 text-black" />
                                            <span className="text-[11px] font-black text-black uppercase tracking-widest">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-12">
                        <PaymentMethods />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
