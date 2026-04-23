import { useState, useEffect } from "react";
import { RefreshCw, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, getImageUrl } from "../../utils/api";
import { useUI } from "../../context/UIContext";
import { useCurrency } from "../../context/CurrencyContext";

const HotOffers = () => {
 const [loading, setLoading] = useState(false);
 const [offers, setOffers] = useState([]);
 const { openMegaMenu, setSelectedGame } = useUI();
 const { convertPrice, currency, symbols } = useCurrency();
 const navigate = useNavigate();

 useEffect(() => {
 const fetchHotItems = async () => {
 try {
 setLoading(true);
 // Fetch Hot Offers, Hot Games, Hot Services, and All Games for enrichment
 const [offersRes, gamesRes, servicesRes, allGamesRes] =
 await Promise.all([
 axios.get(`${API_URL}/api/v1/offers?isHot=true&limit=100`),
 axios.get(`${API_URL}/api/v1/games?isHot=true&limit=100`),
 axios.get(`${API_URL}/api/v1/services?is_hot_offer=true&limit=100`),
 axios.get(`${API_URL}/api/v1/games`),
 ]);

 // Create a map of games for quick background lookup
 const gamesMap = {};
 (allGamesRes.data.data || []).forEach((g) => {
 gamesMap[g.title || g.name] = g;
 });

 const hotOffers = (offersRes.data.data || []).map((o) => ({
 _id: o._id,
 type: "offer",
 title: o.title,
 gameLogo: o.gameIcon || null,
 image: o.image,
 bgImage: gamesMap[o.game]?.bgImage || o.image,
 points:
 o.features?.length > 0
 ? o.features.slice(0, 3)
 : ["Expert Boosting", "Safe & Secure", "Fast Start"],
 price: o.price || 0,
 logoName: o.game ? o.game.split(" ")[0].toUpperCase() : "SERVICE",
 }));

 const hotServices = (servicesRes.data.data || []).map((s) => {
 // gameId is populated by the API as a nested object
 const populatedGame =
 s.gameId && typeof s.gameId === "object" ? s.gameId : null;
 const game =
 populatedGame ||
 (allGamesRes.data.data || []).find(
 (g) => g._id?.toString() === s.gameId?.toString(),
 );
 return {
 _id: s._id,
 type: "service",
 title: s.title,
 gameLogo: game?.icon || null,
 image: game?.characterImage || game?.bgImage || s.icon,
 bgImage: game?.bgImage || game?.banner || game?.image || s.icon,
 points:
 s.features?.length > 0
 ? s.features.slice(0, 3)
 : ["Pro Player", "Express Delivery", "Guaranteed"],
 price: s.price || 0,
 logoName:
 game?.name || game?.title
 ? (game.name || game.title).split(" ")[0].toUpperCase()
 : "SERVICE",
 slug: s.slug,
 };
 });

 const hotGames = (gamesRes.data.data || []).map((g) => ({
 _id: g._id,
 type: "game",
 title: g.name || g.title,
 gameLogo: null,
 image: g.characterImage || g.image || g.bgImage,
 bgImage: g.bgImage || g.banner || g.image,
 points: [
 g.subtitle || "Popular Title",
 `${g.servicesCount || 0}+ Services`,
 "Top Rated",
 ],
 price: "VIEW",
 cents: "ALL",
 currency: "",
 logoName:
 g.name || g.title
 ? (g.name || g.title).split(" ")[0].toUpperCase()
 : "GAME",
 gameTitle: g.name || g.title,
 slug: g.slug,
 }));

 // Prioritize service/offer cards over game cards so BUY NOW cards show first
 let allHotItems = [...hotOffers, ...hotServices, ...hotGames];



 // Fallback: if nothing is marked hot, use featured services + popular games
 if (allHotItems.length === 0) {
 const [featuredServicesRes, popularGamesRes] = await Promise.all([
 axios.get(`${API_URL}/api/v1/services?isFeatured=true&limit=8`),
 axios.get(`${API_URL}/api/v1/games?isPopular=true&limit=4`),
 ]);

 const featuredServices = (featuredServicesRes.data.data || []).map(
 (s) => {
 const populatedGame =
 s.gameId && typeof s.gameId === "object" ? s.gameId : null;
 const game =
 populatedGame ||
 (allGamesRes.data.data || []).find(
 (g) => g._id?.toString() === s.gameId?.toString(),
 );
 return {
 _id: s._id,
 type: "service",
 title: s.title,
 gameLogo: game?.icon || null,
 image: game?.characterImage || game?.bgImage || s.icon,
 bgImage: game?.bgImage || game?.banner || game?.image || s.icon,
 points:
 s.features?.length > 0
 ? s.features.slice(0, 3)
 : ["Pro Player", "Express Delivery", "Guaranteed"],
 price: s.price || 0,
 logoName:
 game?.name || game?.title
 ? (game.name || game.title).split(" ")[0].toUpperCase()
 : "SERVICE",
 slug: s.slug,
 };
 },
 );

 const popularGames = (popularGamesRes.data.data || []).map((g) => ({
 _id: g._id,
 type: "game",
 title: g.name || g.title,
 gameLogo: null,
 image: g.characterImage || g.image || g.bgImage,
 bgImage: g.bgImage || g.banner || g.image,
 points: [
 g.subtitle || "Popular Title",
 `${g.servicesCount || 0}+ Services`,
 "Top Rated",
 ],
 price: "VIEW",
 cents: "ALL",
 currency: "",
 logoName:
 g.name || g.title
 ? (g.name || g.title).split(" ")[0].toUpperCase()
 : "GAME",
 gameTitle: g.name || g.title,
 slug: g.slug,
 }));

 allHotItems = [...featuredServices, ...popularGames];
 }

 if (allHotItems.length > 0) {
 setOffers(allHotItems.sort(() => Math.random() - 0.5));
 } else {
 setOffers([]);
 }
 } catch (err) {
 console.error("Error fetching hot items:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchHotItems();
 }, []);

 const handleShuffle = () => {
 if (offers.length < 2) return;
 setLoading(true);
 setTimeout(() => {
 const shuffled = [...offers].sort(() => Math.random() - 0.5);
 setOffers(shuffled);
 setLoading(false);
 }, 600);
 };

 const handleItemClick = (item) => {
 if (item.type === "game") {
 navigate(`/game/${item.slug}`);
 } else {
 navigate(`/products/${item.slug || item._id}`);
 }
 };

 // Loading state or empty state handled within the main render
 // if (offers.length === 0 && !loading) return null; // Removed to keep header visible

 return (
 <section className="py-2 px-6 bg-black font-['Outfit']">
 {/* Main Outer Container with Perfect Rounding and Mesh Gradient */}
 <div className="max-w-[1400px] mx-auto bg-[#0F0F0F] rounded-[48px] p-8 border border-white/[0.04] relative overflow-hidden group/container">
 {/* Intense Lime Gradient Glow Layers */}
 <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[110%] bg-[#a2e63e]/40 blur-[150px] rounded-full opacity-70 pointer-events-none animate-pulse-slow"></div>
 <div className="absolute top-[20%] -left-[5%] w-[40%] h-[80%] bg-[#8bc332]/20 blur-[120px] rounded-full opacity-30 pointer-events-none"></div>

 {/* Header Section */}
 <div className="flex items-center justify-between mb-8 relative z-10 px-4">
 <h2 className="text-[28px] font-black text-white tracking-tighter">
 Hot right now
 </h2>
 <button
 onClick={handleShuffle}
 disabled={loading}
 className={`flex items-center gap-2 bg-primary hover:bg-[#8cc63e] text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-primary/20 ${loading ? "opacity-50" : "active:scale-95"}`}
 >
 <span>Next</span>
 {loading ? (
 <RefreshCw className="w-3 h-3 animate-spin" />
 ) : (
 <ChevronRight className="w-3 h-3" />
 )}
 </button>
 </div>

 {/* Cards Grid */}
 {!loading && offers.length === 0 ? (
 <div className="relative z-10 py-16 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[32px] animate-pulse">
 <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
 <RefreshCw className="w-8 h-8 text-orange-500 animate-spin-slow" />
 </div>
 <h3 className="text-white/60 font-bold text-lg mb-2">
 No Hot Offers Yet
 </h3>
 <p className="text-white/30 text-sm max-w-xs text-center">
 Mark items as "Hot right now" in the Admin Panel to see them
 appear here!
 </p>
 </div>
 ) : (
 <div
 className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 transition-all duration-500 ${loading ? "opacity-30 blur-md grayscale scale-[0.98]" : "opacity-100"}`}
 >
 {offers.slice(0, 4).map((offer, i) => (
 <div
 key={i}
 onClick={() => handleItemClick(offer)}
 className="bg-[#050505] rounded-[32px] p-6 border border-white/[0.05] flex flex-col group transition-all duration-500 relative overflow-hidden h-[340px] hover:border-white/[0.12] shadow-2xl hover:translate-y-[-5px] cursor-pointer"
 >
 {/* Background Image Layer */}
 <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700">
 <img
 src={getImageUrl(offer.bgImage)}
 className="w-full h-full object-cover object-center"
 alt=""
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
 </div>

 {/* Mascot Image positioned at bottom right - in its own layer */}
 {offer.image && getImageUrl(offer.image) && (
 <img
 src={getImageUrl(offer.image)}
 onError={(e) => {
 e.target.style.display = "none";
 }}
 className="absolute bottom-0 right-0 h-[65%] w-auto object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-10 pointer-events-none group-hover:scale-110 transition-transform duration-700 origin-bottom-right opacity-90"
 alt=""
 />
 )}

 {/* Card Content Top - Higher z-index to stay above mascot */}
 <div className="relative z-20 flex flex-col h-full">
 <div className="mb-3 flex items-start gap-1.5 opacity-80">
 {offer.gameLogo && (
 <div className="w-7 h-7 flex items-center justify-center bg-white/[0.03] rounded-lg border border-white/[0.05]">
 <img
 src={offer.gameLogo}
 alt="Logo"
 onError={(e) => {
 e.target.parentElement.style.display = "none";
 }}
 className="w-4 h-4 object-contain brightness-0 invert"
 />
 </div>
 )}
 <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1.5 truncate pr-2">
 {offer.logoName}
 </span>
 </div>

 <div className="mt-4 mb-2">
 <h4 className="text-[18px] font-black text-white leading-[1.2] tracking-tight line-clamp-2 drop-shadow-lg max-w-[85%]">
 {offer.title}
 </h4>
 </div>

 <ul className="space-y-1 mb-3">
 {(offer.points || []).map((point, j) => (
 <li
 key={j}
 className="flex items-center gap-2 text-[10px] font-bold text-white/40"
 >
 <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(162,230,62,0.4)]"></div>
 <span className="truncate">{point}</span>
 </li>
 ))}
 </ul>

 <div className="mt-auto flex items-end justify-between pt-2">
 <div className="flex items-start">
 {offer.type === "game" ? (
 <div className="flex items-start">
 <span className="text-[24px] font-black text-white leading-none tracking-tighter uppercase">
 View
 </span>
 <div className="flex flex-col ml-1 origin-top-left">
 <span className="text-[11px] font-black text-primary leading-tight uppercase">
 All
 </span>
 </div>
 </div>
 ) : (
 <div className="flex items-start">
 <span className="text-[24px] font-black text-white leading-none tracking-tighter">
 {Math.floor(convertPrice(offer.price))}
 </span>
 <div className="flex flex-col ml-0.5 -mt-0.5 scale-[0.75] origin-top-left">
 <span className="text-[11px] font-black text-white leading-tight opacity-90">
 {(convertPrice(offer.price) % 1).toFixed(2).split(".")[1] || "00"}
 </span>
 <span className="text-[11px] font-black text-white leading-tight opacity-90 uppercase">
 {symbols[currency]}
 </span>
 </div>
 </div>
 )}
 </div>
 <button className="bg-primary hover:bg-[#8cc63e] text-black px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wide transition-all active:scale-95 shadow-xl shadow-primary/20">
 {offer.type === "game" ? "Explore" : "Buy now"}
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 {/* Tailwind Custom Animations */}
 <style>{`
 @keyframes pulse-slow {
 0%, 100% { opacity: 0.15; transform: scale(1); }
 50% { opacity: 0.25; transform: scale(1.05); }
 }
 @keyframes spin-slow {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
 }
 .animate-pulse-slow {
 animation: pulse-slow 8s ease-in-out infinite;
 }
 .animate-spin-slow {
 animation: spin-slow 3s linear infinite;
 }
 `}</style>
 </div>
 </section>
 );
};

export default HotOffers;
