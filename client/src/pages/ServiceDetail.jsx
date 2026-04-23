import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Zap, MessageCircle, FileText, HelpCircle, Layers, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

// Components
import Breadcrumbs from '../components/product/Breadcrumbs';
import ProductHero from '../components/product/ProductHero';
import OptionsPanel from '../components/product/OptionsPanel';
import PricingSidebar from '../components/product/PricingSidebar';
import TrustBadges from '../components/product/TrustBadges';
import Description from '../components/product/Description';

const ServiceDetail = () => {
 const { id } = useParams(); // Using id/slug from URL
 const { user } = useAuth();
 const navigate = useNavigate();
 const toast = useToast();
 const { formatPrice } = useCurrency();

 const [service, setService] = useState(null);
 const [sections, setSections] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Configuration States
 const [selectedOptions, setSelectedOptions] = useState({});
 const [selectedPlatform, setSelectedPlatform] = useState("");
 const [selectedRegion, setSelectedRegion] = useState("");
 const [selectedBoostType, setSelectedBoostType] = useState("piloted");
 const [runs, setRuns] = useState(1);
 const [rankRangeValue, setRankRangeValue] = useState({ from: '', to: '' });
 const [contactInfo, setContactInfo] = useState({
 email: user?.email || '',
 discord: '',
 inGameName: ''
 });

 // Dual Form Builder State
 const [leftFormData, setLeftFormData] = useState(null);
 const [rightFormData, setRightFormData] = useState(null);

 useEffect(() => {
 const fetchService = async () => {
 try {
 setLoading(true);
 // Try fetching by slug first
 let res;
 try {
 res = await axios.get(`${API_URL}/api/v1/services/slug/${id}`);
 } catch (e) {
 // If slug fails, try fetching by ID
 res = await axios.get(`${API_URL}/api/v1/services/${id}`);
 }

 setService(res.data.data);
 // Default boost type based on service capability
 if (res.data.data.boostType === 'self-play') {
 setSelectedBoostType('self-play');
 }

 // Fetch sections for this service or game
 try {
 const sectionsRes = await axios.get(`${API_URL}/api/v1/custom-sections`, {
 params: {
 status: 'active',
 serviceId: res.data.data._id
 }
 });

 // Also fetch sections by game if service specific ones are fewer
 const gameSectionsRes = await axios.get(`${API_URL}/api/v1/custom-sections`, {
 params: {
 status: 'active',
 gameId: res.data.data.gameId?._id
 }
 });

 // Merge and unique by _id
 const allSections = [...(sectionsRes.data.data || []), ...(gameSectionsRes.data.data || [])];
 const uniqueSections = Array.from(new Map(allSections.map(s => [s._id, s])).values());
 setSections(uniqueSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));

 } catch (secErr) {
 console.error('Error fetching service sections:', secErr);
 }

 setLoading(false);
 } catch (err) {
 // Fallback for demo/manual navigation to a specific ID
 if (id === 'manaforge-omega-mythic' || id === 'manaforge-omega-mythic-8198') {
 setService({
 _id: 'manaforge-omega-mock-id',
 title: 'Manaforge Omega Mythic Boost',
 price: 22.99,
 gameId: { name: 'World of Warcraft' },
 categoryId: { name: 'Raids' }
 });
 setLoading(false);
 } else {
 setError('Service not found');
 setLoading(false);
 }
 }
 };
 if (id) fetchService();
 }, [id]);

 const handleBuyNow = async () => {
 // Validation
 const email = user?.email || contactInfo.email;
 if (!email) {
 toast.error("Please enter your email address");
 return;
 }
 if (!contactInfo.discord) {
 toast.error("Please enter your Discord tag");
 return;
 }

 try {
 const orderData = {
 items: [{
 id: service._id,
 price: totalPrice,
 quantity: runs,
 selectedOptions: selectedOptions,
 platform: selectedPlatform,
 region: selectedRegion,
 selectedBoostType: selectedBoostType,
 rankRange: rankRangeValue
 }],
 contactInfo: {
 ...contactInfo,
 email: email
 },
 paymentMethod: 'balance' // Defaulting for now
 };

 const token = localStorage.getItem('token');
 const res = await axios.post(`${API_URL}/api/v1/orders`, orderData, {
 headers: token ? { Authorization: `Bearer ${token}` } : {}
 });

 if (res.data.success) {
 toast.success("Order placed successfully!");
 navigate('/dashboard'); // or a success page
 }
 } catch (err) {
 toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
 }
 };

 // Pricing Calculation Logic
 const totalPrice = useMemo(() => {
 if (!service) return 0;

 const base = service.price || 22.99;
 let dynamicAdd = 0;
 let dynamicMultiplier = 1;

 if (service.serviceOptions) {
 service.serviceOptions.forEach(opt => {
 const selected = selectedOptions[opt.name];
 if (!selected) return;

 if (opt.type === 'checkbox') {
 selected.forEach(choiceId => {
 const choice = opt.choices?.find(c => c._id === choiceId || c.label === choiceId);
 if (choice) {
 dynamicAdd += (choice.addPrice || 0);
 dynamicMultiplier *= (choice.multiplier || 1);
 }
 });
 } else {
 const choice = opt.choices?.find(c => c._id === selected || c.label === selected);
 if (choice) {
 dynamicAdd += (choice.addPrice || 0);
 dynamicMultiplier *= (choice.multiplier || 1);
 }
 }
 });
 }

 let subtotal = ((base + dynamicAdd) * dynamicMultiplier);

 // SkyCoach Logic: Apply boost type multiplier if applicable
 if (selectedBoostType === 'self-play' && service.selfPlayMultiplier) {
 subtotal *= service.selfPlayMultiplier;
 }

 subtotal = subtotal * runs;

 // Rank Range Pricing
 const rankOpt = service.serviceOptions?.find(opt => opt.type === 'rank-range');
 if (rankOpt && rankRangeValue.from && rankRangeValue.to) {
 const fIdx = rankOpt.ranks.findIndex(r => r.label === rankRangeValue.from);
 const tIdx = rankOpt.ranks.findIndex(r => r.label === rankRangeValue.to);
 if (fIdx !== -1 && tIdx !== -1 && tIdx > fIdx) {
 const diff = tIdx - fIdx;
 const pricePerRank = rankOpt.pricePerRank || 10;
 subtotal += (diff * pricePerRank);
 }
 }

 // Multi-run discount (5% off if 2+ runs)
 if (runs > 1) {
 subtotal = subtotal * 0.95;
 }

 return parseFloat(subtotal.toFixed(2));
 }, [service, selectedOptions, runs]);

 const cashbackAmount = useMemo(() => totalPrice * 0.05, [totalPrice]);

 if (loading) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center text-white/40">
 {error}
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-black pt-20 pb-20">
 <main className="mx-auto max-w-[1400px] px-6">
 <Breadcrumbs
 gameName={service.gameId?.name}
 categoryName={service.categoryId?.name}
 productName={service.title}
 />

 {/* Main Grid */}
 <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
 {/* Left/Middle Column (Product Details) */}
 <div className="lg:col-span-9 space-y-16">
 <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
 {/* Hero section inside details */}
 <div className="md:col-span-12 lg:col-span-7">
 <ProductHero
 title={service.title}
 gameName={service.gameId?.name}
 bgImage={service.gameId?.bgImage || service.gameId?.banner || service.gameId?.image}
 characterImage={service.gameId?.characterImage}
 estimatedStartTime={service.estimatedStartTime || "24 hours"}
 estimatedCompletionTime={service.estimatedCompletionTime || "48 hours"}
 />
 </div>
 {/* Options next to hero */}
 <div className="md:col-span-12 lg:col-span-5">
 <OptionsPanel
 serviceOptions={service.serviceOptions || []}
 selectedOptions={selectedOptions}
 setSelectedOptions={setSelectedOptions}
 platforms={service.platforms || []}
 selectedPlatform={selectedPlatform}
 setSelectedPlatform={setSelectedPlatform}
 regions={service.regions || []}
 selectedRegion={selectedRegion}
 setSelectedRegion={setSelectedRegion}
 boostTypeAllowed={service.boostType}
 selectedBoostType={selectedBoostType}
 setSelectedBoostType={setSelectedBoostType}
 rankRangeValue={rankRangeValue}
 setRankRangeValue={setRankRangeValue}
 leftFormData={leftFormData}
 setLeftFormData={setLeftFormData}
 rightFormData={rightFormData}
 setRightFormData={setRightFormData}
 />
 </div>
 </div>

 {/* How it Works Section */}
 <div className="space-y-10">
 <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
 <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(162,230,62,0.5)]"></div>
 How it Works
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
 {[
 { step: "01", title: "Select Options", desc: "Choose your desired boost parameters and configure quantity." },
 { step: "02", title: "Secure Checkout", desc: "Complete your order using our encrypted payment methods." },
 { step: "03", title: "Boost Starts", desc: "Our pro boosters take over and complete your request." }
 ].map((item, i) => (
 <div key={i} className="group relative p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all">
 <span className="text-4xl font-black text-primary/10 group-hover:text-primary/20 transition-colors absolute top-6 right-8">{item.step}</span>
 <h4 className="text-lg font-black text-white uppercase mb-4">{item.title}</h4>
 <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Requirements & FAQ */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
 <div className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 space-y-8">
 <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
 <Zap className="w-6 h-6 text-primary fill-primary" />
 Requirements
 </h3>
 <ul className="space-y-5">
 {(service.requirements || [
 "Level 70 Character",
 "Active Subscription",
 "Account Access (Piloted) / Online Presence (Self-Play)",
 "Basic Gear for selected difficulty"
 ]).map((req, i) => (
 <li key={i} className="flex items-center gap-4 text-[15px] text-white/60 font-medium group">
 <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
 {req}
 </li>
 ))}
 </ul>
 </div>

 <div className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 space-y-8">
 <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
 <MessageCircle className="w-6 h-6 text-sky-purple fill-sky-purple" />
 Common FAQ
 </h3>
 <div className="space-y-6">
 {(service.faq || [
 { q: "Is it safe?", a: "Yes, we use VPN and private streams for every piloted order to ensure maximum security." },
 { q: "Can I play during the boost?", a: "Yes, but not at the same time if using piloted mode. We'll coordinate." }
 ]).map((item, i) => (
 <div key={i} className="space-y-2 border-l-2 border-white/5 pl-6 hover:border-sky-purple transition-colors">
 <p className="text-[13px] font-black text-white uppercase tracking-tight ">{item.q}</p>
 <p className="text-xs text-white/40 font-medium leading-relaxed">{item.a}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 <TrustBadges />

 <div className="max-w-4xl pt-10 border-t border-white/5">
 <Description title={service.title} />
 </div>

 {/* Rendering Custom Sections */}
 {sections.map((section, idx) => (
 <div key={section._id || idx} className="space-y-10 pt-10 border-t border-white/5">
 <div className="space-y-4">
 {section.settings?.showTitle !== false && (
 <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
 <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(162,230,62,0.5)]"></div>
 {section.title}
 </h3>
 )}
 {section.settings?.showSubheading !== false && section.subheading && (
 <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{section.subheading}</p>
 )}
 </div>

 {section.sectionType === 'faq' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {section.fields?.map((field, fIdx) => (
 <div key={fIdx} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all space-y-4">
 <div className="flex items-center gap-3">
 <HelpCircle className="w-5 h-5 text-primary" />
 <h4 className="text-sm font-black text-white uppercase ">{field.label}</h4>
 </div>
 <p className="text-xs text-white/40 leading-relaxed font-medium">{field.placeholder || field.sublabel}</p>
 </div>
 ))}
 </div>
 ) : section.sectionType === 'form' ? (
 <div className="p-8 md:p-12 rounded-[40px] bg-white/[0.01] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
 {section.fields?.map((field, fIdx) => (
 <div key={fIdx} className="space-y-3">
 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">{field.label}</label>
 {field.fieldType === 'select' ? (
 <select className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-primary/50 outline-none transition-all">
 <option value="" className="bg-black">Select {field.label}...</option>
 {field.options?.map((opt, oIdx) => (
 <option key={oIdx} value={opt.value} className="bg-black">{opt.label}</option>
 ))}
 </select>
 ) : (
 <input
 type={field.fieldType || 'text'}
 placeholder={field.placeholder}
 className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-primary/50 outline-none transition-all"
 />
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5">
 <p className="text-white/60 leading-relaxed text-lg font-medium ">{section.description}</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
 {section.fields?.map((field, fIdx) => (
 <div key={fIdx} className="flex items-center gap-4 text-white/40 group">
 <CheckCircle2 className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
 <span className="text-sm font-bold uppercase tracking-tight">{field.label}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Right Column (Sticky Pricing) */}
 <div className="lg:col-span-3">
 <PricingSidebar
 runs={runs} setRuns={setRuns}
 totalPrice={totalPrice}
 cashbackAmount={cashbackAmount}
 user={user}
 contactInfo={contactInfo}
 setContactInfo={setContactInfo}
 onBuyNow={handleBuyNow}
 />
 </div>
 </div>
 </main>
 </div>
 );
};

export default ServiceDetail;
