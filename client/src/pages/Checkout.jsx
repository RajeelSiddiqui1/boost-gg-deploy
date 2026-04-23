import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, Link } from 'react-router-dom';
import {
 ShieldCheck, CreditCard, MessageSquare,
 ArrowRight, CheckCircle2, ShoppingCart,
 ChevronRight, Lock, Zap, Info, Tag
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const Checkout = () => {
 const { cartItems, cartTotal, clearCart, cartMode } = useCart();
 const { user } = useAuth();
 const { formatPrice } = useCurrency();
 const navigate = useNavigate();
 const [step, setStep] = useState(1);
 const [isProcessing, setIsProcessing] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);
 const [promoCode, setPromoCode] = useState('');
 const [promoApplied, setPromoApplied] = useState(null);
 const [promoLoading, setPromoLoading] = useState(false);
 const [promoError, setPromoError] = useState('');

 const [formData, setFormData] = useState({
 email: user?.email || '',
 discord: '',
 inGameName: '',
 paymentMethod: 'bank',
 deliveryMethod: 'face-to-face',
 serverConfirmation: true
 });

 const applyPromoCode = async () => {
 if (!promoCode.trim()) return;
 setPromoLoading(true);
 setPromoError('');
 try {
 const res = await axios.post(`${API_URL}/api/v1/promo/validate`, {
 code: promoCode,
 orderAmount: cartTotal
 });
 setPromoApplied(res.data.data);
 } catch (err) {
 setPromoError(err.response?.data?.message || 'Invalid promo code');
 setPromoApplied(null);
 } finally {
 setPromoLoading(false);
 }
 };

 const finalTotal = promoApplied ? cartTotal - promoApplied.discount : cartTotal;

 const handleNext = () => setStep(prev => prev + 1);
 const handleBack = () => setStep(prev => prev - 1);

 const handlePlaceOrder = async () => {
 setIsProcessing(true);
 try {
 await axios.post(`${API_URL}/api/v1/orders`, {
 items: cartItems,
 contactInfo: {
 discord: formData.discord,
 email: formData.email,
 inGameName: formData.inGameName
 },
 orderMode: cartMode || 'boosting',
 paymentMethod: formData.paymentMethod,
 deliveryMethod: formData.deliveryMethod,
 promoCode: promoApplied?.code
 });
 setIsProcessing(false);
 setIsSuccess(true);
 clearCart();
 } catch (err) {
 alert(err.response?.data?.message || 'Order failed');
 setIsProcessing(false);
 }
 };

 if (cartItems.length === 0 && !isSuccess) {
 return (
 <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
 <ShoppingCart className="w-20 h-20 text-white/10" />
 <h2 className="text-3xl font-black uppercase">Your cart is empty</h2>
 <Link to="/" className="px-8 py-4 bg-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#722AEE] transition-all">Start Shopping</Link>
 </div>
 );
 }

 if (isSuccess) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center p-6 font-['Outfit'] relative overflow-hidden">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full"></div>

 <div className="max-w-[500px] w-full bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 text-center relative z-10 backdrop-blur-3xl">
 <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 mx-auto mb-8 animate-bounce">
 <CheckCircle2 className="w-12 h-12 text-green-500" />
 </div>
 <h2 className="text-4xl font-black uppercase mb-2">Order Confirmed!</h2>
 <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
 Thank you for choosing BoostGG. Our team will contact you on Discord shortly to begin your service.
 </p>
 <div className="space-y-4">
 <button onClick={() => navigate('/admin')} className="w-full bg-white text-black py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2">
 View Orders <ArrowRight className="w-4 h-4" />
 </button>
 <Link to="/" className="block text-white/30 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors">Return to Home</Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-black text-white pt-24 pb-20 font-['Outfit']">
 <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

 {/* Left: Main Steps */}
 <div className="lg:col-span-8 space-y-8">
 {/* Progress Bar */}
 <div className="flex items-center gap-4 mb-10">
 <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-white/20'}`}>
 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${step >= 1 ? 'border-primary' : 'border-white/10'}`}>1</div>
 <span className="text-[10px] font-black uppercase tracking-widest">Contact</span>
 </div>
 <div className="h-px bg-white/5 flex-1"></div>
 <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-white/20'}`}>
 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${step >= 2 ? 'border-primary' : 'border-white/10'}`}>2</div>
 <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
 </div>
 </div>

 {step === 1 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div>
 <h3 className="text-2xl font-black uppercase mb-2">Contact Information</h3>
 <p className="text-white/40 text-sm font-bold uppercase tracking-widest">We'll use this to coordinate your boost</p>
 </div>

 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Discord ID (Required)</label>
 <div className="relative">
 <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
 <input
 type="text"
 placeholder="User#1234"
 value={formData.discord}
 onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-16 pr-8 focus:border-primary/50 transition-all outline-none font-bold text-white placeholder:text-white/10"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Address</label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className={`w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-8 focus:border-primary/50 transition-all outline-none font-bold text-white ${user ? 'text-white/40 cursor-not-allowed' : ''}`}
 readOnly={!!user}
 />
 </div>

 {cartMode === 'boosting' && (
 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Character Name (In-Game)</label>
 <input
 type="text"
 placeholder="YourHeroName"
 value={formData.inGameName}
 onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-8 focus:border-primary/50 transition-all outline-none font-bold text-white"
 />
 </div>
 )}

 {cartMode === 'currency' && (
 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6 animate-in fade-in">
 <div className="space-y-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-primary">Delivery Method</label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {['face-to-face', 'mail', 'auction-house'].map(m => (
 <button
 key={m}
 onClick={() => setFormData({ ...formData, deliveryMethod: m })}
 className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.deliveryMethod === m ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
 }`}
 >
 {m.replace('-', ' ')}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}

 {cartMode === 'accounts' && (
 <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] space-y-4 animate-in fade-in">
 <div className="flex items-center gap-3">
 <ShieldCheck className="w-5 h-5 text-primary" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white">Instant Account Transfer</span>
 </div>
 <p className="text-[11px] text-white/40 font-medium leading-relaxed">
 This account is verified and ready for instant secure transfer.
 Upon payment, you will receive login details and instructions via email and Discord.
 </p>
 </div>
 )}
 </div>

 <button
 onClick={handleNext}
 disabled={!formData.discord}
 className="w-full bg-primary hover:bg-[#722AEE] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
 >
 Continue to Payment <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div>
 <h3 className="text-2xl font-black uppercase mb-2">Payment Method</h3>
 <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Select your preferred payment gateway</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 { id: 'bank', name: 'Direct Bank Transfer', desc: 'Secure local transfer' },
 { id: 'easypaisa', name: 'Easypaisa / JazzCash', desc: 'Instant mobile payment' },
 { id: 'crypto', name: 'Cryptocurrency', desc: 'USDT, BTC, ETH' }
 ].map((method) => (
 <div
 key={method.id}
 onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
 className={`p-6 border rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
 >
 <div className="flex justify-between items-start mb-4">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === method.id ? 'bg-primary text-white' : 'bg-white/5 text-white/20'}`}>
 <CreditCard className="w-5 h-5" />
 </div>
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.id ? 'border-primary' : 'border-white/10'}`}>
 {formData.paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
 </div>
 </div>
 <h4 className="text-sm font-black text-white mb-1 uppercase tracking-wider">{method.name}</h4>
 <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{method.desc}</p>
 </div>
 ))}
 </div>

 <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] space-y-4">
 <div className="flex items-center gap-3">
 <ShieldCheck className="w-5 h-5 text-primary" />
 <span className="text-xs font-black uppercase tracking-widest">Secure Transaction</span>
 </div>
 <p className="text-[10px] font-bold text-white/40 uppercase leading-relaxed">
 Your payment is protected by our buyer protection policy. We only release funds to the booster once the service is confirmed.
 </p>
 </div>

 <div className="flex gap-4">
 <button onClick={handleBack} className="w-1/3 border border-white/5 hover:bg-white/5 text-white/40 hover:text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all">Back</button>
 <button
 onClick={handlePlaceOrder}
 disabled={isProcessing}
 className="w-2/3 bg-primary hover:bg-[#722AEE] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
 >
 {isProcessing ? <Zap className="w-5 h-5 animate-spin" /> : `Confirm ${formatPrice(finalTotal)}`}
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Right: Summary Sidebar */}
 <div className="lg:col-span-4 lg:border-l lg:border-white/5 lg:pl-10 space-y-8">
 <div>
 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 mb-8">Order Summary</h3>
 <div className="space-y-6">
 {cartItems.map((item, i) => (
 <div key={i} className="flex gap-4">
 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
 <img src={item.image} className="w-8 h-8 object-contain opacity-60" alt="" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-[11px] font-black text-white/80 line-clamp-1 uppercase tracking-wider">{item.title}</h4>
 <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">
 {item.calcValue} {item.unitName}
 </p>
 <div className="text-[10px] font-black text-primary mt-1">{formatPrice(item.price)}</div>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="pt-8 border-t border-white/5 space-y-4">
 {/* Promo Code Section */}
 <div className="space-y-3">
 {!promoApplied ? (
 <>
 <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Have a promo code?</label>
 <div className="flex gap-2">
 <div className="relative flex-1">
 <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 type="text"
 placeholder="Enter code"
 value={promoCode}
 onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
 className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all uppercase"
 />
 </div>
 <button
 onClick={applyPromoCode}
 disabled={promoLoading || !promoCode.trim()}
 className="px-4 py-3 bg-primary/20 border border-primary/30 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-50"
 >
 Apply
 </button>
 </div>
 {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
 </>
 ) : (
 <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-green-500" />
 <span className="text-xs font-bold text-green-500 uppercase">{promoApplied.code}</span>
 <span className="text-[10px] text-green-500/70">(-{formatPrice(promoApplied.discount)})</span>
 </div>
 <button
 onClick={() => { setPromoApplied(null); setPromoCode(''); }}
 className="text-[10px] text-white/40 hover:text-white"
 >
 Remove
 </button>
 </div>
 )}
 </div>

 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Subtotal</span>
 <span className="text-xs font-black">{formatPrice(cartTotal)}</span>
 </div>
 {promoApplied && (
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Discount</span>
 <span className="text-xs font-black text-green-500">-{formatPrice(promoApplied.discount)}</span>
 </div>
 )}
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Service Fee</span>
 <span className="text-xs font-black text-green-500">FREE</span>
 </div>
 <div className="flex justify-between items-center pt-4 border-t border-white/5">
 <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Total</span>
 <span className="text-2xl font-black ">{formatPrice(finalTotal)}</span>
 </div>
 </div>

 <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-6 space-y-4">
 <div className="flex items-center gap-3 text-white/20">
 <Lock className="w-4 h-4" />
 <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted Checkout</span>
 </div>
 <div className="flex items-center gap-3 text-white/20">
 <Info className="w-4 h-4" />
 <span className="text-[9px] font-black uppercase tracking-widest">Support: Online 24/7</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default Checkout;
