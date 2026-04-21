import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import {
    Coins, MapPin, Server, Zap, ChevronRight,
    ArrowRight, Info, ShieldCheck, Clock
} from 'lucide-react';

import StepProcess from '../sections/StepProcess';

const CurrencyMode = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [listings, setListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [quantity, setQuantity] = useState(100);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [priceData, setPriceData] = useState(null);

    const { formatPrice } = useCurrency();
    const toast = useToast();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/games?isActive=true`);
                setGames(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedGame(res.data.data[0]);
                }
            } catch (err) {
                console.error("Error fetching games:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    useEffect(() => {
        if (selectedGame) {
            const fetchListings = async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/v1/currencies/game/${selectedGame._id}`);
                    setListings(res.data.data);
                    if (res.data.data.length > 0) {
                        setSelectedListing(res.data.data[0]);
                    } else {
                        setSelectedListing(null);
                    }
                } catch (err) {
                    console.error("Error fetching listings:", err);
                }
            };
            fetchListings();
        }
    }, [selectedGame]);

    useEffect(() => {
        if (selectedListing && quantity >= selectedListing.minQuantity) {
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
                } finally {
                    setCalculating(false);
                }
            };
            const timer = setTimeout(calculatePrice, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedListing, quantity]);

    const handleAddToCart = () => {
        if (!selectedListing || !priceData) return;

        const cartItem = {
            id: selectedListing._id,
            title: `${selectedGame.name} ${selectedListing.currencyType}`,
            price: priceData.price,
            quantity: 1, // Quantity is internal to the "item" for currency
            currencyQuantity: quantity,
            image: selectedGame.icon,
            mode: 'currency',
            selectedOptions: {
                server: selectedListing.server,
                region: selectedListing.region,
                deliveryMethod: selectedListing.defaultDeliveryMethod
            }
        };

        addToCart(cartItem);
        toast.success(`Added ${quantity} ${selectedListing.currencyType} to cart`);
    };

    if (loading) {
        return (
            <div className="py-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Left: Game & Listing Selection */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Game Selector */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Select Your Game</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {games.map(game => (
                                <button
                                    key={game._id}
                                    onClick={() => setSelectedGame(game)}
                                    className={`p-4 rounded-[24px] border transition-all flex flex-col items-center gap-3 group ${selectedGame?._id === game._id
                                            ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(162,230,62,0.1)]'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-2">
                                        <img src={getImageUrl(game.icon)} alt={game.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest text-center ${selectedGame?._id === game._id ? 'text-primary' : 'text-white/40 group-hover:text-white'
                                        }`}>
                                        {game.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listing Selection (Server/Region) */}
                    {selectedGame && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Server & Region</h2>
                            </div>

                            {listings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {listings.map(listing => (
                                        <button
                                            key={listing._id}
                                            onClick={() => setSelectedListing(listing)}
                                            className={`p-6 rounded-[32px] border text-left transition-all flex items-center justify-between group ${selectedListing?._id === listing._id
                                                    ? 'bg-white/5 border-primary shadow-[0_0_30px_rgba(162,230,62,0.05)]'
                                                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedListing?._id === listing._id ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'
                                                    }`}>
                                                    <Server className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded-md">{listing.region}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{listing.currencyType}</span>
                                                    </div>
                                                    <h3 className="text-lg font-black text-white uppercase">{listing.server}</h3>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedListing?._id === listing._id ? 'border-primary' : 'border-white/10'
                                                }`}>
                                                {selectedListing?._id === listing._id && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 rounded-[40px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Info className="w-8 h-8 text-white/10" />
                                    </div>
                                    <p className="text-white/40 font-medium italic">No currency listings available for {selectedGame.name} yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Calculator & CTA */}
                <div className="lg:col-span-4 lg:sticky lg:top-32">
                    <div className="p-8 rounded-[40px] bg-[#0A0A0A] border border-white/5 space-y-8 relative overflow-hidden">

                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Fast Delivery</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Secure Transfer</span>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Calculator</p>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Purchase Gold</h2>
                        </div>

                        {/* Quantity Input */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block pl-2">Amount to Purchase</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-6 px-8 text-3xl font-black text-white placeholder:text-white/10 outline-none focus:border-primary/30 focus:bg-primary/5 transition-all text-center"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-white/20 tracking-widest">{selectedListing?.currencyType || 'Units'}</div>
                            </div>
                            {selectedListing && (
                                <p className="text-[10px] font-bold text-center text-white/20 uppercase tracking-wider italic">
                                    Min: {selectedListing.minQuantity} | Max: {selectedListing.maxQuantity.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-white/40 text-[11px] font-black uppercase tracking-widest">
                                <span>Estimated ETA</span>
                                <span className="text-white flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> 15-30 Mins</span>
                            </div>
                            <div className="h-px bg-white/5 w-full"></div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-[11px] font-black uppercase tracking-widest">Pricing</span>
                                <div className="text-right">
                                    <div className={`text-4xl font-black text-white tracking-tighter transition-all ${calculating ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
                                        {formatPrice(priceData?.price || 0)}
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">+ 5% Cashback</p>
                                </div>
                            </div>
                        </div>

                        {/* Purchase CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedListing || quantity < (selectedListing?.minQuantity || 0)}
                            className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${!selectedListing || quantity < (selectedListing?.minQuantity || 0)
                                    ? 'bg-white/5 text-white/10 cursor-not-allowed'
                                    : 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(162,230,62,0.15)]'
                                }`}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Add to Cart
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                            <div className="flex flex-col items-center gap-1 opacity-40">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 opacity-40">
                                <Clock className="w-5 h-5 text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest">24/7 Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Process */}
            <StepProcess />
        </div>
    );
};

export default CurrencyMode;
