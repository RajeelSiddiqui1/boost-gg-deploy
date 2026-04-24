import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useCurrency } from '../../context/CurrencyContext';
import { getImageUrl, API_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { Coins, MapPin, Server, Zap, ChevronRight,
 ArrowRight, Info, ShieldCheck, Clock, Search,
 Star, CheckCircle2, TrendingUp, Sparkles, MessageSquare,
 Gamepad2, Award, Users, CreditCard, Share2, Heart,
 Shield, Lock, RotateCcw, Monitor
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import StepProcess from '../sections/StepProcess';
import DetailBanner from '../DetailBanner';


const CurrencyMode = () => {
 const { gameSlug } = useParams();
 const navigate = useNavigate();
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
 if (games.length > 0) {
 if (gameSlug) {
 const found = games.find(g => g.slug === gameSlug);
 if (found && found._id !== selectedGame?._id) {
 setSelectedGame(found);
 }
 } else if (selectedGame) {
 setSelectedGame(null);
 }
 }
 }, [games, gameSlug]);

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
      <div className="relative max-w-[1400px] mx-auto px-6 py-12 animate-fade-in font-['Outfit'] overflow-hidden">
        {/* Atmospheric Glows */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[500px] bg-primary/20 blur-[150px] pointer-events-none -z-10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-[40%] h-[400px] bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none -z-10"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
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
 onClick={() => {
 setSelectedGame(game);
 navigate(`/currency/${game.slug || game._id}`);
 }}
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
 onClick={() => {
 setSelectedGame(null);
 navigate('/?mode=currency');
 }} 
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
 {/* <div className="flex items-center gap-4">
 <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all">
 <Share2 className="w-4 h-4" />
 Share
 </button>
 <button className="flex items-center gap-3 px-8 py-4 bg-primary rounded-2xl text-[12px] font-black uppercase tracking-widest text-black hover:scale-[1.05] transition-all">
 <Heart className="w-4 h-4 fill-black" />
 Favorite
 </button>
 </div> */}
 </div>

 {/* Main Content Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6 items-start">
 
 {/* Left: Hero Image & Info Card */}
<div className="lg:col-span-2 xl:col-span-6 space-y-8">
  <div className="relative rounded-[48px] overflow-hidden border border-white/5 aspect-[16/9] md:aspect-[21/9] bg-primary/5">
  <img 
  src={getImageUrl(selectedGame.bgImage || selectedGame.image)} 
  className="absolute inset-0 w-full h-full object-cover scale-110 transition-all duration-700"
  alt=""
  />
  {/* Atmospheric Overlays */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
  <div className="absolute left-6 top-6 flex flex-col gap-3 z-20">
      {[
        { text: 'COMPLETE SAFETY', color: 'bg-primary text-black' },
        { text: 'QUICK DELIVERY', color: 'bg-white/10 text-white backdrop-blur-md' },
        { text: 'FAIR PRICE', color: 'bg-white/10 text-white backdrop-blur-md' }
      ].map((tag, i) => (
        <div key={i} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-2xl ${tag.color} border border-white/10`}>
          {tag.text}
        </div>
      ))}
    </div>

    {/* Game Icon - Center */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full max-w-[50%]">
        <img 
          src={selectedGame.icon ? getImageUrl(selectedGame.icon) : "https://cdn-icons-png.flaticon.com/512/2489/2489756.png"} 
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
          alt=""
        />
      </div>
    </div>

    {/* Time Badge - Bottom Right */}
    <div className="absolute bottom-6 right-6 text-right z-20">
      <div className="flex flex-col items-end">
        <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-lg">5 min</span>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mt-1">ESTIMATED START TIME</span>
      </div>
    </div>
  </div>

  {/* Trust Badges Row */}
  <div className="flex flex-wrap items-center justify-center gap-3 px-4">
    {[
      { icon: Lock, text: 'SSL SECURE' },
      { icon: Shield, text: 'VPN SAFE' },
      { icon: CheckCircle2, text: 'SAFE SERVICE' },
      { icon: Users, text: '24/7 SUPPORT' },
      { icon: RotateCcw, text: 'REFUNDS' },
      { icon: TrendingUp, text: 'CASHBACK 5%' }
    ].map((badge, i) => (
      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
        <badge.icon className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-black uppercase tracking-wider text-white/70">{badge.text}</span>
      </div>
    ))}
  </div>

  {/* Description Section */}
  <div className="pt-8 space-y-8">
    <div className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">DESCRIPTION</h2>
      <p className="text-white/50 font-medium leading-relaxed text-sm md:text-base">
        If you're looking to purchase a low-priced {selectedGame?.name || 'game'} gold farming service, you're in the right place. 
        We offer the best {selectedGame?.name || 'game'} gold service in the market. Acquiring gold can be challenging and time-consuming, 
        especially for players who want to focus on building and decorating. With our service, you can skip the grind 
        and quickly accumulate the gold you need to bring your vision to life.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="p-6 md:p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
        <h4 className="text-xl font-black text-white uppercase">WHAT YOU'LL GET:</h4>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm text-white/50 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            A selected amount of Gold farmed
          </li>
          <li className="flex items-center gap-3 text-sm text-white/50 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            Complete safety and 24/7 support
          </li>
        </ul>
      </div>
    </div>

 
  </div>
</div>

 {/* Middle: Inputs Pane */}
 <div className="lg:col-span-1 xl:col-span-3">
 <div className="relative rounded-[32px] bg-[#1a1a1a] border border-white/5 overflow-hidden shadow-2xl p-8 space-y-10">
 
 {/* Quantity Input */}
 <div className="space-y-6">
 <div className="flex items-center justify-between px-2">
 <div className="flex items-center gap-3">
 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Gold (Millions)</label>
 {selectedListing && (
 <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-white/60 uppercase tracking-widest">
 Rate: {selectedListing.pricePerUnit} / unit
 </div>
 )}
 </div>
 </div>
 <div className="relative group">
 <div className="relative">
 <input
 type="number"
 value={quantity}
 onChange={(e) => setQuantity(Math.min(selectedListing?.maxQuantity || 1000000, Math.max(selectedListing?.minQuantity || 0, parseInt(e.target.value) || 0)))}
 className="w-full bg-[#2a2a2a] border border-white/5 rounded-2xl py-5 px-6 text-2xl font-black text-white placeholder:text-white/20 outline-none transition-all hover:border-white/10 focus:border-primary group"
 />
 <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
 <span className="text-[12px] font-black uppercase text-white/40 tracking-widest">{selectedListing?.currencyType || 'Gold'}</span>
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
 className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
 />
 <div className="flex justify-between">
 {presetQuantities.map((q, i) => (
 <button 
 key={i} 
 onClick={() => setQuantity(q)}
 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${quantity === q ? 'text-primary' : 'text-white/40 hover:text-white/80'}`}
 >
 {q >= 1000 ? `${(q/1000).toFixed(0)}k` : q}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Dropdowns as styled list */}
 <div className="space-y-6">
 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 ml-2">Choose Servers:</label>
 <div className="space-y-2">
 {listings.map(listing => (
 <button
 key={listing._id}
 onClick={() => {
 setSelectedListing(listing);
 setQuantity(prev => Math.min(listing.maxQuantity, Math.max(listing.minQuantity, prev)));
 }}
 className="w-full flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-left"
 >
 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedListing?._id === listing._id ? 'border-primary bg-primary/20' : 'border-white/20 bg-black/40'}`}>
 {selectedListing?._id === listing._id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
 </div>
 <span className={`text-xs font-bold ${selectedListing?._id === listing._id ? 'text-white' : 'text-white/60'}`}>
 {listing.region} - {listing.server}
 </span>
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Right: Checkout Pane */}
 <div className="lg:col-span-1 xl:col-span-3 space-y-6">
 <div className="relative rounded-[32px] bg-payment-method border border-white/10 overflow-hidden shadow-2xl p-8 space-y-8">
    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(162,230,62,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
 
 {/* Completion Speed */}
 <div className="space-y-4  p-6 rounded-[32px] shadow-lg relative z-10">
 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Select completion speed</h4>
 <div className="space-y-2">
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
 className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isActive ? 'bg-white/20 border border-white/20' : 'bg-transparent border border-white/5 hover:bg-white/5'}`}
 >
 <div className="flex items-center gap-3">
 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-white bg-white' : 'border-white/20 bg-black/20'}`}>
 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-payment-method"></div>}
 </div>
 <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/60'}`}>{option.label}</span>
 </div>
 {option.surcharge > 0 && (
 <span className="text-[10px] font-black text-white/60">+{displayPrice(surchargeAmount)}</span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* Order Summary */}
 <div className="space-y-6 pt-4 border-t border-white/10">
 <div className="flex items-center justify-between">
 <span className="text-sm font-black text-white/80">Total</span>
 <div className="flex items-end gap-1">
 <div className={`text-3xl font-black text-white tracking-tighter ${calculating ? 'opacity-20 blur-sm' : ''}`}>
 {displayPrice((priceData?.price || 0) * (selectedSpeed === 'Express' ? 1.2 : selectedSpeed === 'Super Express' ? 1.4 : 1))}
 </div>
 <span className="text-[10px] font-bold text-white/60 mb-1">excl VAT</span>
 </div>
 </div>
 
 <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg max-w-fit">
 <span className="text-[11px] font-black text-white">0,02 €</span>
 <span className="text-[10px] font-medium text-white/60 leading-tight">cashback after<br/>purchase</span>
 </div>
 </div>

 {/* Action */}
 <div className="space-y-4">
 <div className="relative group">
 <input 
 type="email" 
 placeholder="Your email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-white/10 border border-white/10 rounded-xl py-4 px-5 text-sm text-white placeholder:text-white/40 outline-none transition-all hover:bg-white/20 focus:bg-white/20"
 />
 </div>
 
 <button 
 onClick={handleAddToCart}
 className="w-full py-4 bg-primary rounded-xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl"
 >
 Buy now
 <ShieldCheck className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Payment Icons */}
 <div className="flex flex-wrap items-center justify-center gap-4 px-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
 {['pay-pal.svg', 'visa.svg', 'mastercard.svg', 'apple-pay.svg', 'google-pay.svg', 'eps.svg', 'ideal.svg', 'skrill.svg', 'bitcoin.svg'].map(icon => (
 <img key={icon} src={`/payments/${icon}`} alt={icon.replace('.svg', '')} className="h-3 md:h-4 object-contain brightness-0 invert" />
 ))}
 </div>

 {/* Chat Button */}
 <div className="pt-6 relative">
 <div className="flex items-center gap-4 mb-6 opacity-40">
 <div className="h-px bg-white flex-1"></div>
 <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Any questions?</span>
 <div className="h-px bg-white flex-1"></div>
 </div>
 <button className="w-full py-4 bg-[#2a2a2a] border border-white/5 rounded-xl text-[12px] font-bold text-white hover:bg-[#333] transition-colors flex items-center justify-between px-6 group">
 Chat before order
 <MessageSquare className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
 </button>
 </div>
 </div>

 </div>

  {/* Personalized Offer Section - Full Width Banner Style */}
  <DetailBanner/>

  {/* Content Extensions */}

<div className="mt-32 space-y-32">
  {/* <StepProcess />
  <TestimonialsSection /> */}
  
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
          onClick={() => {
            setSelectedGame(game);
            navigate(`/currency/${game.slug || game._id}`);
          }} 
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