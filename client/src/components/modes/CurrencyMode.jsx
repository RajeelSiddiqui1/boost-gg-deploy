import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useCurrency } from '../../context/CurrencyContext';
import { getImageUrl, API_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import {
 Coins, MapPin, Server, Zap, ChevronRight,
 ArrowRight, Info, ShieldCheck, Clock, Search,
 Star, CheckCircle2, TrendingUp, Sparkles, MessageSquare,
 Gamepad2, Award, Users, CreditCard, Share2, Heart,
 Shield, Lock, RotateCcw, Monitor
} from 'lucide-react';

import StepProcess from '../sections/StepProcess';
import TestimonialsSection from '../sections/TestimonialsSection';

const CurrencyMode = () => {
 const [games, setGames] = useState([]);
 const [selectedGame, setSelectedGame] = useState(null);
 const [listings, setListings] = useState([]);
 const [selectedListing, setSelectedListing] = useState(null);
 const [quantity, setQuantity] = useState(1000);
 const [loading, setLoading] = useState(true);
 const [calculating, setCalculating] = useState(false);
 const [priceData, setPriceData] = useState(null);
 const [email, setEmail] = useState('');
 const [selectedSpeed, setSelectedSpeed] = useState('Normal');

 const { formatPrice } = useCurrency();
 const toast = useToast();
 const { addToCart } = useCart();

 // Display price function - moved to top before usage
 const displayPrice = (price, isUnit = false) => {
 if (!price && price !== 0) return formatPrice(0);
 // If it's a unit price or a small/precise total, show 4 decimals
 if (isUnit || (price > 0 && price < 1) || (price * 10000) % 100 !== 0) {
 return `$${Number(price).toFixed(4)}`;
 }
 return formatPrice(price);
 };

 useEffect(() => {
 const fetchGames = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/games?isActive=true`);
 const filteredGames = res.data.data.filter(game => game.currencyCount > 0);
 setGames(filteredGames);
 } catch (err) {
 console.error("Error fetching games:", err);
 if (toast.error) toast.error("Failed to load games");
 } finally {
 setLoading(false);
 }
 };
 fetchGames();
 }, [toast]);

 useEffect(() => {
 if (selectedGame) {
 const fetchListings = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/currencies/game/${selectedGame._id}`);
 setListings(res.data.data);
 if (res.data.data.length > 0) {
 const firstListing = res.data.data[0];
 setSelectedListing(firstListing);
 setQuantity(firstListing.minQuantity || 1000);
 } else {
 setSelectedListing(null);
 }
 } catch (err) {
 console.error("Error fetching listings:", err);
 if (toast.error) toast.error("Failed to load listings");
 }
 };
 fetchListings();
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 }, [selectedGame, toast]);

 useEffect(() => {
 if (selectedListing && quantity >= (selectedListing.minQuantity || 0)) {
 const calculatePrice = async () => {
 setCalculating(true);
 try {
 const res = await axios.post(`${API_URL}/api/v1/currencies/calculate`, {
 listingId: selectedListing._id,
 quantity: quantity
 });
 setPriceData(res.data.data);
 } catch (err) {
 console.error("Error calculating price:", err);
 if (toast.error) toast.error("Failed to calculate price");
 } finally {
 setCalculating(false);
 }
 };
 const timer = setTimeout(calculatePrice, 300);
 return () => clearTimeout(timer);
 }
 }, [selectedListing, quantity, toast]);

 const handleAddToCart = () => {
 if (!selectedListing || !priceData) {
 if (toast.error) toast.error("Please select a listing first");
 return;
 }
 if (!email) {
 if (toast.error) toast.error("Please enter your email to continue");
 return;
 }

 const basePrice = priceData.price;
 const surcharge = selectedSpeed === 'Express' ? basePrice * 0.2 : selectedSpeed === 'Super Express' ? basePrice * 0.4 : 0;
 const finalPrice = basePrice + surcharge;

 const cartItem = {
 id: selectedListing._id,
 title: `${selectedGame.name} ${selectedListing.currencyType} (${selectedSpeed} Speed)`,
 price: finalPrice,
 quantity: 1,
 currencyQuantity: quantity,
 image: selectedGame.icon,
 mode: 'currency',
 customerEmail: email,
 selectedOptions: {
 server: selectedListing.server,
 region: selectedListing.region,
 deliveryMethod: selectedListing.defaultDeliveryMethod,
 speed: selectedSpeed
 }
 };

 addToCart(cartItem);
 if (toast.success) toast.success(`Added ${quantity} ${selectedListing.currencyType} to cart`);
 };

 const presetQuantities = useMemo(() => {
 if (!selectedListing) return [];
 const min = selectedListing.minQuantity || 1000;
 const max = selectedListing.maxQuantity || 1000000;
 return [
 min,
 Math.round((max - min) * 0.2 + min),
 Math.round((max - min) * 0.4 + min),
 Math.round((max - min) * 0.6 + min),
 Math.round((max - min) * 0.8 + min),
 max
 ];
 }, [selectedListing]);

 if (loading) {
 return (
 <div className="py-24 flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 if (!selectedGame) {
 return (
 <div className="max-w-[1400px] mx-auto px-6 py-12 animate-fade-in font-['Outfit']">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <div className="w-2 h-8 bg-primary rounded-full"></div>
 <h1 className="text-4xl font-black uppercase tracking-tight text-white">Game Currency</h1>
 </div>
 <p className="text-white/40 font-medium">Select a game to see available gold and currency offers</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
 {games.map(game => (
 <button
 key={game._id}
 onClick={() => setSelectedGame(game)}
 className="group relative h-[320px] rounded-[40px] overflow-hidden border border-white/5 hover:border-primary transition-all duration-700 hover:-translate-y-2"
 >
 <div className="absolute inset-0">
 <img 
 src={getImageUrl(game.bgImage || game.image)} 
 alt={game.name} 
 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
 </div>

 <div className="absolute inset-0 p-10 flex flex-col justify-between">
 <div className="flex justify-between items-start">
 <div className="space-y-2 text-left">
 <h3 className="text-2xl font-black text-white leading-none uppercase tracking-tighter group-hover:text-primary transition-colors">{game.name}</h3>
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
 <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Live Deals</span>
 </div>
 </div>
 <div className="w-16 h-16 p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary transition-all">
 <img src={game.icon ? getImageUrl(game.icon) : "https://cdn-icons-png.flaticon.com/512/2489/2489756.png"} className="w-full h-full object-contain drop-shadow-2xl" alt="" />
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Available</span>
 <span className="text-lg font-black text-white">{game.currencyCount || 0} Offers</span>
 </div>
 <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
 <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-colors" />
 </div>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="relative max-w-[1600px] mx-auto px-6 py-12 animate-fade-in font-['Outfit'] z-0">
 {/* Page top light green shade */}
 {/* Increased Localized Atmospheric green glow at top left */}
 <div className="absolute -top-[12%] -left-[10%] w-[55%] h-[500px] bg-primary/25 blur-[140px] pointer-events-none -z-10 rounded-full"></div>
 <div className="absolute top-[0%] left-[0%] w-[35%] h-[350px] bg-primary/15 blur-[100px] pointer-events-none -z-10 rounded-full animate-pulse"></div>
 <div className="absolute top-0 left-0 w-[60%] h-[600px] bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none -z-10"></div>
 
 {/* Main Header Row */}
 <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
 <div className="flex items-center gap-8">
 <button 
 onClick={() => setSelectedGame(null)} 
 className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all group"
 >
 <ArrowRight className="w-6 h-6 rotate-180 text-white/40 group-hover:text-white transition-colors" />
 </button>
 <div className="space-y-1">
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-primary border border-primary rounded-lg text-[10px] font-black text-black uppercase tracking-[0.2em]">Marketplace</span>
 <div className="w-1 h-1 rounded-full bg-white/20"></div>
 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{selectedGame.name}</span>
 </div>
 <h1 className="text-[64px] md:text-[80px] font-black text-white uppercase tracking-tighter leading-[0.8] mb-2">
 {selectedGame.name} <span className="text-primary">{selectedListing?.currencyType || 'Gold'}</span>
 </h1>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all">
 <Share2 className="w-4 h-4" />
 Share
 </button>
 <button className="flex items-center gap-3 px-8 py-4 bg-primary rounded-2xl text-[12px] font-black uppercase tracking-widest text-black hover:scale-[1.05] transition-all">
 <Heart className="w-4 h-4 fill-black" />
 Favorite
 </button>
 </div>
 </div>

 {/* Main Content Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* Left: Hero Image & Info Card */}
 <div className="lg:col-span-7 space-y-8">
 <div className="relative rounded-[48px] overflow-hidden bg-black/40 border border-white/5 aspect-[16/9] md:aspect-[21/9]">
 <img 
 src={getImageUrl(selectedGame.bgImage || selectedGame.image)} 
 className="absolute inset-0 w-full h-full object-cover opacity-50"
 alt=""
 />
 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
 
 {/* Badges on Left */}
 <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
 {['Fast Completion', 'Complete Safety', 'Fair Price'].map((tag, i) => (
 <div key={i} className="px-5 py-3 bg-white/5 backdrop-blur-xl border-l-4 border-primary rounded-r-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white/80 shadow-2xl">
 {tag}
 </div>
 ))}
 </div>

 {/* Centered Floating Image */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="relative w-full h-full max-w-[50%]">
 {/* Removed background glow */}
 <img 
 src={selectedGame.icon ? getImageUrl(selectedGame.icon) : "https://cdn-icons-png.flaticon.com/512/2489/2489756.png"} 
 className="w-full h-full object-contain relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
 alt=""
 />
 </div>
 </div>

 {/* Floating Reviews Box */}
 <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[240px] p-6 rounded-[32px] bg-black/80 backdrop-blur-2xl border border-white/10 z-30 shadow-2xl hidden md:block">
 <div className="flex gap-1 mb-4">
 {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
 </div>
 <p className="text-[11px] font-bold text-white/80 leading-relaxed mb-4">
 "Ordered late at night, still got fast response and delivery. You guys are solid."
 </p>
 <div className="flex items-center justify-between pb-3 border-b border-white/5">
 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Second_son, 1 day ago</span>
 </div>
 <div className="mt-4 flex items-center justify-between">
 <span className="text-sm font-black text-white">5.0 <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest ml-1">Rating</span></span>
 <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
 <ChevronRight className="w-4 h-4 rotate-90 text-white/40" />
 </button>
 </div>
 </div>

 {/* Bottom Info */}
 <div className="absolute bottom-8 left-8 space-y-1 z-20">
 <h3 className="text-2xl font-black text-white uppercase">Flexible</h3>
 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estimated Start Time</p>
 </div>
 </div>

 {/* Horizontal Trust Badges Row */}
 <div className="flex flex-wrap items-center gap-6 px-4">
 {[
 { icon: Lock, text: 'SSL Secure' },
 { icon: Shield, text: 'VPN, Safe Boost' },
 { icon: CheckCircle2, text: 'Safe Service' },
 { icon: Users, text: '24/7 Support' },
 { icon: RotateCcw, text: 'Money refunds' },
 { icon: TrendingUp, text: 'Cashback 5%' }
 ].map((badge, i) => (
 <div key={i} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all cursor-default">
 <badge.icon className="w-3.5 h-3.5 text-primary" />
 <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">{badge.text}</span>
 </div>
 ))}
 </div>

 {/* Description Section */}
 <div className="pt-8 space-y-8">
 <div className="space-y-4">
 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Description</h2>
 <p className="text-white/50 font-medium leading-relaxed">
 If you're looking to purchase a low-priced {selectedGame.name} gold farming service, you're in the right place. 
 We offer the best {selectedGame.name} gold service in the market. Acquiring gold can be challenging and time-consuming, 
 especially for players who want to focus on building and decorating. With our service, you can skip the grind 
 and quickly accumulate the gold you need to bring your vision to life.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
 <h4 className="text-xl font-black text-white uppercase">What you'll get:</h4>
 <ul className="space-y-3">
 <li className="flex items-center gap-3 text-sm text-white/40 font-bold">
 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
 A selected amount of Gold farmed
 </li>
 <li className="flex items-center gap-3 text-sm text-white/40 font-bold">
 <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
 Complete safety and 24/7 support
 </li>
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Calculator Overhaul */}
 <div className="lg:col-span-5">
 <div className="relative rounded-[48px] bg-primary border-2 border-black/5 overflow-hidden shadow-2xl">
 {/* Removed background glow */}
 
 <div className="relative z-10 flex flex-col">
 
 {/* Inputs Pane */}
 <div className="p-10 space-y-10">
 {/* Quantity Input */}
 <div className="space-y-6">
 <div className="flex items-center justify-between px-2">
 <div className="flex items-center gap-3">
 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60">Amount to purchase</label>
 {selectedListing && (
 <div className="px-2 py-0.5 bg-black border border-black rounded text-[9px] font-black text-primary uppercase tracking-widest">
 Rate: {selectedListing.pricePerUnit} / unit
 </div>
 )}
 </div>
 <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
 
 </div>
 </div>
 <div className="relative group">
 {/* Removed glow effect */}
 <div className="relative">
 <input
 type="number"
 value={quantity}
 onChange={(e) => setQuantity(Math.min(selectedListing?.maxQuantity || 1000000, Math.max(selectedListing?.minQuantity || 0, parseInt(e.target.value) || 0)))}
 className="w-full bg-white rounded-[32px] py-8 px-10 text-4xl font-black text-black placeholder:text-black/20 outline-none transition-all hover:shadow-xl focus:shadow-xl hover:scale-[1.01] group"
 />
 <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
 <span className="text-[12px] font-black uppercase text-primary tracking-widest">{selectedListing?.currencyType || 'Gold'}</span>
 <span className="text-[10px] font-medium text-black/40 uppercase tracking-widest">Units</span>
 </div>
 </div>
 </div>
 <div className="px-4 space-y-6">
 <input 
 type="range" 
 min={selectedListing?.minQuantity || 100} 
 max={selectedListing?.maxQuantity || 1000000} 
 step={selectedListing?.minQuantity >= 10000 ? 5000 : selectedListing?.minQuantity >= 1000 ? 500 : 100} 
 value={quantity} 
 onChange={(e) => setQuantity(parseInt(e.target.value))}
 className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black hover:accent-black/80 transition-all"
 />
 <div className="flex justify-between">
 {presetQuantities.map((q, i) => (
 <button 
 key={i} 
 onClick={() => setQuantity(q)}
 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${quantity === q ? 'text-black' : 'text-black/30 hover:text-black/60'}`}
 >
 {q >= 1000 ? `${(q/1000).toFixed(0)}k` : q}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Dropdowns */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-3">
 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60 ml-2">Server</label>
 <div className="relative group">
 <select
 value={selectedListing?._id || ''}
 onChange={(e) => {
 const listing = listings.find(l => l._id === e.target.value);
 if (listing) {
 setSelectedListing(listing);
 setQuantity(prev => Math.min(listing.maxQuantity, Math.max(listing.minQuantity, prev)));
 }
 }}
 className="w-full bg-white rounded-2xl py-5 px-6 text-sm text-black font-bold appearance-none cursor-pointer outline-none transition-all pr-12 hover:shadow-lg hover:scale-[1.01]"
 >
 {listings.map(listing => (
 <option key={listing._id} value={listing._id} className="bg-white text-black">
 {listing.region} - {listing.server} ({listing.pricePerUnit}/unit)
 </option>
 ))}
 </select>
 <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 rotate-90 pointer-events-none transition-colors" />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60 ml-2">Platform</label>
 <div className="relative group">
 <div className="w-full bg-white rounded-2xl py-5 px-6 text-sm text-black font-bold flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group">
 <span className="flex items-center gap-3"><Monitor className="w-4 h-4" /> PC / All</span>
 <Lock className="w-3.5 h-3.5 text-black/20" />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Checkout Pane */}
 <div className="bg-primary border-t border-black/10 p-10 space-y-10 relative">
 {/* Removed bottom glow */}
 
 {/* Completion Speed */}
 <div className="space-y-6">
 <h4 className="text-[11px] font-black text-black/60 uppercase tracking-[0.2em] ml-2">Delivery speed</h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { id: 'Normal', label: 'Normal', surcharge: 0 },
 { id: 'Express', label: 'Express', surcharge: 0.2 },
 { id: 'Super Express', label: 'Super', surcharge: 0.4 }
 ].map((option) => {
 const surchargeAmount = (priceData?.price || 0) * option.surcharge;
 const isActive = selectedSpeed === option.id;
 return (
 <button 
 key={option.id} 
 onClick={() => setSelectedSpeed(option.id)}
 className={`flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all relative group ${isActive ? 'border-black bg-white scale-[1.02] shadow-2xl' : 'border-black/5 bg-white hover:shadow-lg hover:scale-[1.01]'}`}
 >
 <span className={`text-[11px] font-black uppercase tracking-widest text-black/40 ${isActive ? 'text-black' : ''}`}>{option.label}</span>
 <span className={`text-[10px] font-medium text-black/20 ${isActive ? 'text-black/40' : ''}`}>{option.desc}</span>
 {option.surcharge > 0 && (
 <span className={`mt-1 text-[10px] font-black ${isActive ? 'text-black' : 'text-black/40'}`}>+{displayPrice(surchargeAmount)}</span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* Order Summary & Action */}
 <div className="space-y-8 pt-4 border-t border-white/5">
 <div className="flex items-end justify-between">
 <div className="space-y-1">
 <span className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em]">Total Amount</span>
 <div className="flex items-baseline gap-2">
 <div className={`text-6xl font-black text-black tracking-tighter ${calculating ? 'opacity-20 blur-sm' : ''}`}>
 {displayPrice((priceData?.price || 0) * (selectedSpeed === 'Express' ? 1.2 : selectedSpeed === 'Super Express' ? 1.4 : 1))}
 </div>
 <span className="text-sm font-bold text-black/40 uppercase">USD</span>
 </div>
 </div>
 <div className="flex flex-col items-end">
 <div className="px-3 py-1.5 bg-black border border-black rounded-lg mb-2">
 <span className="text-[10px] font-black text-primary uppercase tracking-widest">5% Cashback</span>
 </div>
 <span className="text-[10px] font-medium text-black/40 uppercase tracking-widest">Price match guaranteed</span>
 </div>
 </div>

 <div className="space-y-4">
 <div className="relative group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors">
 <Users className="w-5 h-5" />
 </div>
 <input 
 type="email" 
 placeholder="Enter your email address"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-white border-2 border-black/5 rounded-[24px] py-6 pl-16 pr-8 text-sm text-black placeholder:text-black/30 outline-none transition-all hover:shadow-lg focus:shadow-lg hover:scale-[1.01]"
 />
 </div>
 
 <button 
 onClick={handleAddToCart}
 className="w-full py-7 bg-black rounded-[28px] text-primary font-black uppercase tracking-[0.2em] text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group shadow-2xl"
 >
 Purchase Now
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
 <ArrowRight className="w-5 h-5 text-primary" />
 </div>
 </button>
 </div>

 {/* Security Badges */}
 <div className="flex items-center justify-between px-2 pt-4">
 <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
 <div className="flex items-center gap-2 text-black">
 <ShieldCheck className="w-4 h-4" />
 <span className="text-[9px] font-black uppercase tracking-widest">Encrypted</span>
 </div>
 <div className="flex items-center gap-2 text-black">
 <Lock className="w-4 h-4" />
 <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure</span>
 </div>
 </div>
 <button className="text-[10px] font-black text-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
 How it works?
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Support Button */}
 <div className="mt-8 p-6 rounded-[32px] bg-white/[0.02] border border-primary/20 flex items-center justify-between hover:bg-white/[0.04] hover:border-primary/40 transition-all cursor-pointer group">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
 <MessageSquare className="w-6 h-6 text-black" />
 </div>
 <div className="space-y-0.5">
 <h5 className="text-sm font-black text-white uppercase tracking-widest">Live Support</h5>
 <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">Online now • 1m response</p>
 </div>
 </div>
 <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all">
 <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
 </div>
 </div>
 </div>
 </div>

 {/* Content Extensions */}
 <div className="mt-32 space-y-32">
 <StepProcess />
 <TestimonialsSection />
 
 {/* Similar Games */}
 <div className="space-y-12">
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Recommended Games</h2>
 <p className="text-white/40 font-medium">Explore more top-tier farming and boosting services</p>
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {games.filter(g => g._id !== selectedGame?._id).slice(0, 4).map(game => (
 <button 
 key={game._id} 
 onClick={() => setSelectedGame(game)} 
 className="group relative h-[280px] rounded-[32px] overflow-hidden border border-white/5 hover:border-primary transition-all duration-500 hover:-translate-y-2"
 >
 <div className="absolute inset-0">
 <img 
 src={getImageUrl(game.bgImage || game.image)} 
 className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
 alt="" 
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
 </div>
 <div className="absolute inset-0 p-8 flex flex-col justify-between text-left">
 <div className="flex justify-end">
 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
 <ArrowRight className="w-4 h-4 text-white group-hover:text-black transition-colors" />
 </div>
 </div>
 <div>
 <h4 className="text-2xl font-black text-white uppercase leading-none mb-2 group-hover:text-primary transition-colors">{game.name}</h4>
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:animate-pulse transition-colors"></div>
 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{game.currencyCount} Offers</span>
 </div>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
};

export default CurrencyMode;