import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    ShieldCheck, CreditCard, MessageSquare,
    ArrowRight, CheckCircle2, ShoppingCart,
    ChevronRight, Lock, Zap, Info, Tag, 
    Globe, Smartphone, CreditCard as CardIcon,
    Wallet, Bitcoin, ArrowLeft, Headphones, Package
} from 'lucide-react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../utils/api';

const PaymentMethodLogo = ({ id, active }) => {
    switch (id) {
        case 'visa': return <div className="flex items-center gap-1"><span className={`text-[10px] font-black italic ${active ? 'text-black' : 'text-white'}`}>VISA</span></div>;
        case 'ideal': return <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-black' : 'text-[#cc0066]'}`}>iDEAL</span>;
        case 'skrill': return <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-black' : 'text-[#821361]'}`}>SKRILL</span>;
        case 'crypto': return <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-black' : 'text-primary'}`}>CRYPTO</span>;
        case 'google': return <span className={`text-[10px] font-black ${active ? 'text-black' : 'text-white'}`}>GPay</span>;
        default: return <CardIcon className="w-4 h-4" />;
    }
};

const Checkout = () => {
    const { cartItems, cartTotal, clearCart, cartMode } = useCart();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const location = useLocation();
    
    const preSelectedPayment = location.state?.selectedPaymentMethod || 'visa';
    const instantItem = location.state?.instantItem || null;

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');

    // Determine items to display and total
    const displayItems = instantItem ? [instantItem] : cartItems;
    const displayTotal = instantItem ? (instantItem.price * instantItem.quantity) : cartTotal;
    const displayMode = instantItem ? instantItem.mode : cartMode;

    const [formData, setFormData] = useState({
        email: user?.email || instantItem?.selectedOptions?.buyerEmail || '',
        discord: '',
        inGameName: instantItem?.selectedOptions?.inGameName || '',
        paymentMethod: preSelectedPayment,
        deliveryMethod: 'face-to-face',
        serverConfirmation: true
    });

    useEffect(() => {
        if (location.state?.selectedPaymentMethod) {
            setFormData(prev => ({ ...prev, paymentMethod: location.state.selectedPaymentMethod }));
        }
    }, [location.state]);

    const applyPromoCode = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            const res = await axios.post(`${API_URL}/api/v1/promo/validate`, {
                code: promoCode,
                orderAmount: displayTotal
            });
            setPromoApplied(res.data.data);
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Invalid promo code');
            setPromoApplied(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const finalTotal = promoApplied ? displayTotal - promoApplied.discount : displayTotal;

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            await axios.post(`${API_URL}/api/v1/orders`, {
                items: displayItems,
                contactInfo: {
                    discord: formData.discord,
                    email: formData.email,
                    inGameName: formData.inGameName
                },
                orderMode: displayMode || 'boosting',
                paymentMethod: formData.paymentMethod,
                deliveryMethod: formData.deliveryMethod,
                promoCode: promoApplied?.code
            });
            setIsProcessing(false);
            setIsSuccess(true);
            if (!instantItem) clearCart();
        } catch (err) {
            alert(err.response?.data?.message || 'Order failed');
            setIsProcessing(false);
        }
    };

    if (displayItems.length === 0 && !isSuccess) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
                    <ShoppingCart className="w-12 h-12 text-white/20" />
                    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
                </div>
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Your cart is empty</h2>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">Looks like you haven't added anything yet.</p>
                </div>
                <Link to="/" className="px-10 py-5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">Explore Games</Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6 font-['Outfit'] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[200px] rounded-full"></div>

                <div className="max-w-[560px] w-full bg-[#0D0D0D] border border-white/10 rounded-[3rem] p-12 text-center relative z-10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 mx-auto mb-10 relative">
                        <CheckCircle2 className="w-12 h-12 text-primary animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    </div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Payment Success!</h2>
                    <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em] mb-12 leading-relaxed">
                        Order #GG-{Math.floor(Math.random() * 10000)} has been placed.<br/>Check your Discord messages.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => navigate('/admin')} className="w-full bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Track Order <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link to="/" className="block py-4 text-white/30 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-colors">Return to Marketplace</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-32 pb-20 font-['Outfit'] selection:bg-primary/30">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-[1300px] mx-auto px-6 relative z-10">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Checkout</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Finish <span className="text-white/10">Order</span></h1>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-3xl">
                        {[1, 2].map(s => (
                            <div key={s} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${step === s ? 'bg-white/5 text-white' : 'text-white/20'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${step === s ? 'border-primary text-primary shadow-[0_0_10px_rgba(19,193,0,0.5)]' : 'border-white/10'}`}>{s}</div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s === 1 ? 'Contact' : 'Payment'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* LEFT: FORM AREA */}
                    <div className="lg:col-span-7 space-y-12">
                        
                        {step === 1 && (
                            <div className="space-y-12 animate-fade-in-up">
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Who are you?</h3>
                                    <p className="text-white/30 text-[11px] font-black uppercase tracking-widest">Personalize your delivery experience</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Discord User ID</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="User#1234"
                                                value={formData.discord}
                                                onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] py-7 pl-20 pr-10 focus:border-primary/50 transition-all outline-none font-black text-white text-sm placeholder:text-white/10 uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Email Delivery</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] py-7 pl-20 pr-10 outline-none font-black text-white text-sm tracking-widest ${user ? 'opacity-40 cursor-not-allowed' : 'focus:border-primary/50 transition-all'}`}
                                                readOnly={!!user}
                                            />
                                        </div>
                                    </div>

                                    {displayMode === 'boosting' && (
                                        <div className="space-y-3 animate-fade-in">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-4">Character Name</label>
                                            <input
                                                type="text"
                                                placeholder="ENTER HERO NAME"
                                                value={formData.inGameName}
                                                onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] py-7 px-10 focus:border-primary/50 transition-all outline-none font-black text-white text-sm placeholder:text-white/10 uppercase tracking-widest"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={!formData.discord}
                                    className="w-full bg-primary text-black py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-30 shadow-[0_20px_40px_rgba(19,193,0,0.2)] group"
                                >
                                    Proceed to Selection <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-12 animate-fade-in-up">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Payment Choice</h3>
                                        <p className="text-white/30 text-[11px] font-black uppercase tracking-widest">Selected from modal</p>
                                    </div>
                                    <button onClick={handleBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Change Info
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'visa', name: 'Credit Card', desc: 'Visa, Master, Maestro' },
                                        { id: 'ideal', name: 'iDeal', desc: 'Netherland Direct' },
                                        { id: 'skrill', name: 'Digital Wallet', desc: 'Fast Skrill Pay' },
                                        { id: 'crypto', name: 'Crypto Assets', desc: 'BTC, ETH, USDT' },
                                        { id: 'google', name: 'Google Pay', desc: 'Instant Checkout' }
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                                            className={`group p-6 border rounded-[2rem] cursor-pointer transition-all duration-500 ${formData.paymentMethod === method.id ? 'border-primary bg-primary shadow-[0_15px_30px_rgba(19,193,0,0.15)]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-12 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.paymentMethod === method.id ? 'bg-black text-white' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                                                    <PaymentMethodLogo id={method.id} active={formData.paymentMethod === method.id} />
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === method.id ? 'border-black bg-black/10' : 'border-white/10'}`}>
                                                    {formData.paymentMethod === method.id && <CheckCircle2 className="w-4 h-4 text-black" />}
                                                </div>
                                            </div>
                                            <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${formData.paymentMethod === method.id ? 'text-black' : 'text-white'}`}>{method.name}</h4>
                                            <p className={`text-[9px] font-bold uppercase tracking-tight ${formData.paymentMethod === method.id ? 'text-black/50' : 'text-white/20'}`}>{method.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-start gap-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Buy risk-free with BoostGG</p>
                                        <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase tracking-tight">
                                            We work only with verified sellers. Our team is online 24/7 and you're always guaranteed your money back.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full bg-primary text-black py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_40px_rgba(19,193,0,0.2)] group"
                                >
                                    {isProcessing ? <Zap className="w-6 h-6 animate-spin" /> : <>Complete Payment <Zap className="w-6 h-6 fill-current" /></>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SUMMARY SIDEBAR (White Theme) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white text-black rounded-[3rem] p-10 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            {/* Pattern Background */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Your Order</p>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Summary</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-black/20" />
                                    </div>
                                </div>

                                <div className="space-y-8 mb-12 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar-light">
                                    {displayItems.map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center shrink-0 border border-black/5 relative overflow-hidden">
                                                <img 
                                                    src={getImageUrl(item.image)} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                                                    alt="" 
                                                />
                                                {item.icon && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <img src={getImageUrl(item.icon)} className="w-10 h-10 object-contain drop-shadow-lg" alt="" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-black/5 rounded text-[8px] font-black uppercase tracking-widest text-black/40">{item.mode || 'Service'}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-black leading-tight uppercase tracking-tight line-clamp-2">{item.title}</h4>
                                                <div className="text-lg font-black mt-3">{formatPrice(item.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Section */}
                                <div className="pt-8 border-t border-black/5 space-y-6">
                                    {!promoApplied ? (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Promo Code</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                                                    <input
                                                        type="text"
                                                        placeholder="CODE"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                        className="w-full bg-black/5 border border-transparent rounded-2xl py-4 pl-14 pr-4 text-xs font-black text-black outline-none focus:bg-white focus:border-black/10 transition-all uppercase tracking-widest"
                                                    />
                                                </div>
                                                <button
                                                    onClick={applyPromoCode}
                                                    disabled={promoLoading || !promoCode.trim()}
                                                    className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-20"
                                                >
                                                    {promoLoading ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{promoApplied.code}</span>
                                                    <p className="text-[9px] text-green-600/60 font-bold uppercase">Discount applied</p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setPromoApplied(null); setPromoCode(''); }} className="text-[9px] font-black uppercase tracking-widest text-black/20 hover:text-red-500 transition-colors">Remove</button>
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/40">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(displayTotal)}</span>
                                        </div>
                                        {promoApplied && (
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                                                <span>Promo Discount</span>
                                                <span>-{formatPrice(promoApplied.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-6 border-t-2 border-black/5">
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Total Amount</span>
                                            <div className="text-right">
                                                <span className="text-4xl font-black tracking-tighter leading-none">{formatPrice(finalTotal)}</span>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-1">incl. all fees & tax</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Area */}
                        <div className="mt-8 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Headphones className="w-8 h-8 text-white/20" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Need help?</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Our team is online 24/7</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Open Chat</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
};

export default Checkout;
