import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
 Search,
 User,
 Menu,
 X,
 ChevronDown,
 Zap,
 ShoppingCart,
 LayoutGrid,
 ShieldAlert,
 LogOut,
 Star,
 Globe,
 ChevronRight,
 MessageSquare,
 Settings,
 ThumbsUp,
 BookOpen,
 RefreshCcw,
 ShieldCheck,
 Wallet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import MegaMenu from "./MegaMenu";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { API_URL } from "../../utils/api";
import { useCurrency } from "../../context/CurrencyContext";

const Navbar = () => {
 const { user, logout } = useAuth();
 const { cartCount, setIsCartOpen } = useCart();
 const { currency, changeCurrency, symbols } = useCurrency();
 const { isMegaMenuOpen, setIsMegaMenuOpen, searchTerm, setSearchTerm } =
 useUI();
 const location = useLocation();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
 const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
 const [searchResults, setSearchResults] = useState([]);

 // Independent Search Logic
 useEffect(() => {
 const fetchResults = async () => {
 if (searchTerm && searchTerm.length > 0) {
 try {
 const res = await fetch(
 `${API_URL}/api/v1/games?search=${encodeURIComponent(searchTerm)}`,
 );
 if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
 const data = await res.json();
 setSearchResults(data.data || []);
 } catch (err) {
 console.error("Nav search error:", err);
 setSearchResults([]);
 }
 } else {
 setSearchResults([]);
 }
 };
 const timer = setTimeout(fetchResults, 300);
 return () => clearTimeout(timer);
 }, [searchTerm]);

 // Close menus on route change
 useEffect(() => {
 setIsMobileMenuOpen(false);
 setIsMegaMenuOpen(false);
 setIsQuickLinksOpen(false);
 setIsCurrencyOpen(false);
 }, [location]);

 return (
 <header className="fixed top-0 left-0 right-0 z-[150] bg-black border-b border-white/[0.05] h-[72px] font-['Outfit']">
 <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
 {/* Left Side: Logo & Primary Actions */}
 <div className="flex items-center gap-8 flex-1">
 <Link
 to={user?.role === "admin" ? "/admin" : "/"}
 className="flex items-center"
 >
 <img
 style={{ height: 80, width: 80 }}
 src={logo}
 alt="BOOSTGG"
 className="h-10 w-auto object-contain"
 />
 <span className="text-[30px] font-black tracking-tighter text-white uppercase flex items-center gap-0.5">
 BOOSTGG
 </span>
 </Link>

 {user?.role !== "admin" && (
 <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl ml-4">
 <button
 onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
 className={`flex-shrink-0 flex items-center gap-3 ${isMegaMenuOpen ? "bg-primary border-primary" : "bg-[#8bc332] border-white/5"} hover:scale-[1.02] text-black px-6 py-2.5 rounded-xl font-bold text-[14px] transition-all active:scale-95 shadow-lg shadow-[#a2e63e]/20 border`}
 >
 Choose your game{" "}
 <ChevronDown
 className={`w-4 h-4 transition-transform duration-500 ${isMegaMenuOpen ? "rotate-180 opacity-100" : "opacity-60"}`}
 />
 </button>

 {/* Enforced Persistent Search Bar */}
 <div className="flex-1 relative group/search">
 <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 transition-all focus-within:border-white/10 focus-within:ring-0">
 <input
 type="text"
 placeholder="Search for games, services or pros..."
 className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-none text-[14px] font-medium text-white placeholder:text-white/20 w-full"
 value={searchTerm}
 style={{ outline: "none", boxShadow: "none" }}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 <button className="text-white/40 hover:text-primary transition-colors p-1">
 <Search className="w-5 h-5 stroke-[3px]" />
 </button>
 </div>

 {/* Quick Search Results Dropdown */}
 {searchTerm && (
 <div className="absolute top-14 left-0 right-0 bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl z-[160] animate-in fade-in zoom-in-95 duration-200">
 <div className="p-2 border-b border-white/5 mb-2">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">
 {searchResults.length > 0
 ? "Search Results"
 : "No Results Found"}
 </p>
 </div>
 {searchResults.length > 0 ? (
 <div className="space-y-1">
 {searchResults.slice(0, 5).map((game) => (
 <Link
 key={game._id}
 to={game.slug === 'wow' ? '/wow-boost' : `/game/${game.slug || game._id || 'undefined'}`}
 onClick={() => setSearchTerm("")}
 className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group"
 >
 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
 <Zap className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
 </div>
 <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">
 {game.title}
 </span>
 </Link>
 ))}
 </div>
 ) : (
 <div className="p-4 text-center">
 <p className="text-xs font-medium text-white/20">
 Try searching for another game...
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Right Side: Utility Icons */}
 <div className="flex items-center gap-6 md:gap-9 text-white">
 {/* Currency Switcher */}
 <div className="relative group/currency">
 <button
 onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
 className="flex items-center gap-1.5 h-10 px-3 hover:bg-white/5 rounded-xl transition-all group"
 >
 <span className="text-[14px] font-black tracking-tight text-white/60 group-hover:text-primary transition-colors uppercase">
 {currency}
 </span>
 <ChevronDown className={`w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all ${isCurrencyOpen ? 'rotate-180 text-primary' : ''}`} />
 </button>

 {isCurrencyOpen && (
 <>
 <div
 className="fixed inset-0 z-[-1]"
 onClick={() => setIsCurrencyOpen(false)}
 />
 <div className="absolute top-[calc(100%+8px)] right-0 w-[140px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[160]">
 <div className="p-2 border-b border-white/5 mb-1">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">
 Currency
 </p>
 </div>
 <div className="space-y-0.5">
 {['USD', 'EUR'].map((cur) => (
 <button
 key={cur}
 onClick={() => {
 changeCurrency(cur);
 setIsCurrencyOpen(false);
 }}
 className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group/item ${currency === cur ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/60 hover:text-white'
 }`}
 >
 <span className="text-xs font-bold">{cur}</span>
 <span className="text-[10px] opacity-40 font-black">{symbols[cur]}</span>
 </button>
 ))}
 </div>
 </div>
 </>
 )}
 </div>

 <div className="relative group/user">
 {user ? (
 <div className="flex items-center gap-4">
 <div className="relative group/user-dropdown">
 <Link
 to={user.role === "admin" ? "/admin" : "/dashboard"}
 className={`flex items-center gap-2 h-10 px-4 rounded-xl transition-all border ${user.role === "admin"
 ? "bg-red-500/10 border-red-500/20 text-red-500"
 : user.role === "pro"
 ? "bg-primary/20 border-primary/30 text-primary"
 : "bg-white/5 border-white/10 text-white"
 } hover:scale-[1.02] active:scale-95`}
 >
 <User className="w-4 h-4" />
 <span className="text-[12px] font-bold uppercase tracking-widest hidden sm:inline">
 {user.role === "admin"
 ? "Nexus"
 : user.role === "pro"
 ? "Pro"
 : "Buyer"}
 </span>
 <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/user-dropdown:rotate-180 transition-transform duration-300" />
 </Link>

 {/* Role-Aware Dropdown Menu */}
 <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/user-dropdown:opacity-100 group-hover/user-dropdown:translate-y-0 group-hover/user-dropdown:pointer-events-auto transition-all duration-300 z-[170]">
 <div className="p-3 border-b border-white/5 mb-1 text-center sm:text-left">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">
 Signed in as
 </p>
 <p className="text-[12px] font-bold text-white truncate ">
 {user.name}
 </p>
 </div>

 <div className="space-y-0.5">
 <Link
 to={
 user.role === "admin"
 ? "/admin"
 : "/dashboard?tab=overview"
 }
 className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all group/item"
 >
 <LayoutGrid className="w-4 h-4 text-white/20 group-hover/item:text-primary transition-colors" />
 <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover/item:text-white">
 Dashboard
 </span>
 </Link>

 {user.role !== "admin" && (
 <>
 <Link
 to={
 user.role === "pro"
 ? "/dashboard?tab=work"
 : "/dashboard?tab=orders"
 }
 className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all group/item"
 >
 <ShoppingCart className="w-4 h-4 text-white/20 group-hover/item:text-primary transition-colors" />
 <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover/item:text-white">
 {user.role === "pro"
 ? "Active Tasks"
 : "My Orders"}
 </span>
 </Link>
 <Link
 to={
 user.role === "pro"
 ? "/dashboard?tab=earnings"
 : "/dashboard?tab=wallet"
 }
 className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all group/item"
 >
 <Wallet className="w-4 h-4 text-white/20 group-hover/item:text-primary transition-colors" />
 <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover/item:text-white">
 {user.role === "pro" ? "Earnings" : "My Wallet"}
 </span>
 </Link>
 </>
 )}

 <button
 onClick={logout}
 className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all group/item mt-1 pt-2 border-t border-white/5"
 >
 <LogOut className="w-4 h-4" />
 <span className="text-[11px] font-black uppercase tracking-widest">
 Logout Session
 </span>
 </button>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <Link
 to="/login"
 className="p-2 hover:text-primary transition-all group"
 >
 <User className="w-[22px] h-[22px] stroke-[2.5px]" />
 </Link>
 )}
 </div>

 {user?.role !== "admin" && (
 <>
 <div className="hidden sm:block relative">
 <button
 onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
 className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isQuickLinksOpen ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white"}`}
 >
 <LayoutGrid className="w-[22px] h-[22px] stroke-[2.5px]" />
 </button>

 {isQuickLinksOpen && (
 <>
 <div
 className="fixed inset-0 z-[-1]"
 onClick={() => setIsQuickLinksOpen(false)}
 ></div>
 <div className="absolute top-14 right-0 w-[190px] bg-[#0A0A0A] backdrop-blur-xl rounded-[24px] p-3 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 z-[160]">
 <div className="space-y-0.5 mb-2">
 {[
 { label: "About us", icon: Zap, path: "/about" },
 {
 label: "Cashback",
 icon: RefreshCcw,
 path: "/cashback",
 },
 { label: "Blog", icon: BookOpen, path: "/blog" },
 {
 label: "Work with us",
 icon: ThumbsUp,
 path: "/become-pro",
 },
 ].map((link, i) => (
 <Link
 key={i}
 to={link.path}
 className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-all group text-white/60 hover:text-white"
 >
 <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
 <link.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-colors" />
 </div>
 <span className="font-bold text-[12px] tracking-tight">
 {link.label}
 </span>
 </Link>
 ))}
 </div>
 <div className="pt-2 border-t border-white/10 space-y-0.5">
 <Link
 to="#"
 className="block px-3 py-1.5 text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
 >
 Trust & safety
 </Link>
 <Link
 to="/contact"
 className="block px-3 py-1.5 text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
 >
 Contact us
 </Link>
 </div>
 </div>
 </>
 )}
 </div>

 <div
 onClick={() => setIsCartOpen(true)}
 className="relative cursor-pointer hover:text-primary transition-all group"
 >
 <ShoppingCart className="w-[22px] h-[22px] stroke-[2.5px]" />
 {cartCount > 0 && (
 <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
 {cartCount}
 </span>
 )}
 </div>
 </>
 )}

 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
 >
 {isMobileMenuOpen ? (
 <X className="w-5 h-5" />
 ) : (
 <Menu className="w-5 h-5" />
 )}
 </button>
 </div>
 </div>

 <MegaMenu
 isOpen={isMegaMenuOpen}
 onClose={() => setIsMegaMenuOpen(false)}
 />

 {isMobileMenuOpen && (
 <div className="fixed inset-0 top-[72px] z-[140] bg-black/98 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 md:hidden">
 <div className="p-8 space-y-8">
 <button
 onClick={() => setIsMegaMenuOpen(true)}
 className="w-full flex items-center justify-between bg-[#8bc332] text-black p-6 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#a2e63e]/20"
 >
 Choose your game
 <ChevronRight className="w-5 h-5" />
 </button>

 <nav className="space-y-6">
 {["Offers", "About", "Contact"].map((link) => (
 <Link
 key={link}
 to={`/${link.toLowerCase()}`}
 className="block text-3xl font-black uppercase tracking-tighter text-white/40 hover:text-white transition-all transform hover:translate-x-2"
 >
 {link}
 </Link>
 ))}
 </nav>
 </div>
 </div>
 )}
 </header>
 );
};

export default Navbar;
