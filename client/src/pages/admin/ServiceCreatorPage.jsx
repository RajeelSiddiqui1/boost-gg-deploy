import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
 DndContext,
 closestCenter,
 KeyboardSensor,
 PointerSensor,
 useSensor,
 useSensors
} from "@dnd-kit/core";
import {
 arrayMove,
 SortableContext,
 sortableKeyboardCoordinates,
 verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus, Trash2, Eye, Save, X, Copy, Check, Zap, Shield, Clock, DollarSign, ArrowLeft, Loader2, LogOut, MessageSquare, Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

// Modular Components
import { SectionCard } from "./components/SectionCard";
import { SidebarPreview } from "./components/SidebarPreview";

const isValidObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);

/* ═══════════════════════════════ COMPONENTS ═══════════════════════════════ */

export default function ServiceCreatorPage() {
 const { id } = useParams();
 const navigate = useNavigate();
 const toast = useToast();
 const [loading, setLoading] = useState(false);
 const [fetching, setFetching] = useState(false);

 const [state, setState] = useState({
 serviceId: uuidv4(),
 title: "",
 slug: "",
 gameId: "",
 category: "",
 description: "",
 heroImage: "",
 featureTags: [],
 estimatedStartTime: "15 min",
 estimatedCompletionTime: "Flexible",
 basePrice: 0,
 currency: "USD",
 showVAT: true,
 cashbackPercent: 5,
 isActive: true,
 speedOptions: {
 express: { enabled: true, label: "Express", priceModifier: 0, tooltip: "" },
 superExpress: { enabled: true, label: "Super Express", priceModifier: 0, tooltip: "" }
 },
 sidebarSections: [],
 requirements: [],
 reviews: []
 });

 const [lastSaved, setLastSaved] = useState(null);
 const [isExporting, setIsExporting] = useState(false);
 const [copied, setCopied] = useState(false);

 // Image Upload State
 const [imageFile, setImageFile] = useState(null);
 const [imagePreview, setImagePreview] = useState("");
 const [iconFile, setIconFile] = useState(null);
 const [iconPreview, setIconPreview] = useState("");

 // Games and Categories
 const [games, setGames] = useState([]);
 const [categories, setCategories] = useState([]);

 // Fetch games and categories
 useEffect(() => {
 const fetchOptions = async () => {
 try {
 const gamesRes = await axios.get(`${API_URL}/api/v1/games`);
 setGames(gamesRes.data.data || []);
 } catch (err) {
 console.error("Failed to fetch games:", err);
 }
 };
 fetchOptions();
 }, []);

 // Fetch categories when gameId changes
 useEffect(() => {
 if (state.gameId && isValidObjectId(state.gameId)) {
 const fetchCategories = async () => {
 try {
 const catsRes = await axios.get(`${API_URL}/api/v1/categories/game/${state.gameId}`);
 setCategories(catsRes.data.data || []);
 } catch (err) {
 console.error("Failed to fetch categories:", err);
 setCategories([]);
 }
 };
 fetchCategories();
 } else {
 setCategories([]);
 }
 }, [state.gameId]);

 // Fetch existing data
 useEffect(() => {
 if (id) {
 const fetchData = async () => {
 setFetching(true);
 try {
 const token = localStorage.getItem("token");
 const res = await axios.get(`${API_URL}/api/v1/services/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 const data = res.data.data;
 // Map backend data to creator state
 const fetchedGameId = data.gameId?._id || data.gameId || "";
 const fetchedCategoryId = data.categoryId?._id || data.categoryId || data.category?._id || "";
 setState({
 ...data,
 serviceId: data._id,
 gameId: fetchedGameId,
 category: fetchedCategoryId,
 sidebarSections: data.sidebarSections || [],
 featureTags: data.features || data.featureTags || [],
 requirements: data.requirements || [],
 speedOptions: data.speedOptions || {
 express: { enabled: true, label: "Express", priceModifier: 0, tooltip: "" },
 superExpress: { enabled: true, label: "Super Express", priceModifier: 0, tooltip: "" }
 },
 reviews: data.sampleReviews || data.reviews || []
 });

 // Set Previews
 if (data.image) {
 const imgUrl = data.image.startsWith('http') ? data.image : `${API_URL}/${data.image.replace(/^\//, '')}`;
 setImagePreview(imgUrl);
 }
 if (data.icon) {
 const iconUrl = data.icon.startsWith('http') ? data.icon : `${API_URL}/${data.icon.replace(/^\//, '')}`;
 setIconPreview(iconUrl);
 }
 } catch (err) {
 toast.error("Failed to fetch service data");
 } finally {
 setFetching(false);
 }
 };
 fetchData();
 }
 }, [id]);

 // Auto-generate slug
 useEffect(() => {
 if (state.title && !id) {
 setState(p => ({ ...p, slug: state.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") }));
 }
 }, [state.title, id]);

 // Section Management
 const addSection = () => {
 const newSection = {
 id: uuidv4(),
 heading: "New Section",
 fieldType: "radio",
 required: true,
 displayOrder: state.sidebarSections.length + 1,
 options: [
 { id: uuidv4(), label: "Option 1", priceModifier: 0, isDefault: true }
 ],
 stepperConfig: { min: 1, max: null, default: 1, unitLabel: "Units", pricePerUnit: 0 }
 };
 setState(p => ({ ...p, sidebarSections: [...p.sidebarSections, newSection] }));
 };

 const updateSection = (id, updates) => {
 setState(p => ({
 ...p,
 sidebarSections: p.sidebarSections.map(s => s.id === id ? { ...s, ...updates } : s)
 }));
 };

 const deleteSection = (id) => {
 setState(p => ({ ...p, sidebarSections: (p.sidebarSections || []).filter(s => s.id !== id) }));
 };

 const addOption = (sectionId) => {
 setState(p => ({
 ...p,
 sidebarSections: p.sidebarSections.map(s => {
 if (s.id === sectionId) {
 return {
 ...s,
 options: [...(s.options || []), { id: uuidv4(), label: `Option ${(s.options?.length || 0) + 1}`, priceModifier: 0 }]
 };
 }
 return s;
 })
 }));
 };

 const updateOption = (sectionId, optionId, updates) => {
 setState(p => ({
 ...p,
 sidebarSections: p.sidebarSections.map(s => {
 if (s.id === sectionId) {
 return {
 ...s,
 options: s.options?.map(o => {
 if (o.id === optionId) {
 return { ...o, ...updates };
 }
 return o;
 })
 };
 }
 return s;
 })
 }));
 };

 const deleteOption = (sectionId, optionId) => {
 setState(p => ({
 ...p,
 sidebarSections: (p.sidebarSections || []).map(s => s.id === sectionId ? { ...s, options: (s.options || []).filter(o => o.id !== optionId) } : s)
 }));
 };

 const handleReorderSections = (event) => {
 const { active, over } = event;
 if (over && active.id !== over.id) {
 setState((p) => {
 const oldIndex = p.sidebarSections.findIndex((s) => s.id === active.id);
 const newIndex = p.sidebarSections.findIndex((s) => s.id === over.id);
 const reordered = arrayMove(p.sidebarSections, oldIndex, newIndex);
 return {
 ...p,
 sidebarSections: reordered.map((s, i) => ({ ...s, displayOrder: i + 1 }))
 };
 });
 }
 };

 const handleReorderOptions = (sectionId, oldIndex, newIndex) => {
 setState(p => ({
 ...p,
 sidebarSections: p.sidebarSections.map(s => {
 if (s.id === sectionId && s.options) {
 return { ...s, options: arrayMove(s.options, oldIndex, newIndex) };
 }
 return s;
 })
 }));
 };

 const sensors = useSensors(
 useSensor(PointerSensor),
 useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
 );

 const handleIconChange = (e) => {
 const file = e.target.files?.[0];
 if (file) {
 setIconFile(file);
 const reader = new FileReader();
 reader.onloadend = () => setIconPreview(reader.result);
 reader.readAsDataURL(file);
 }
 };

 const handleImageChange = (e) => {
 const file = e.target.files?.[0];
 if (file) {
 setImageFile(file);
 const reader = new FileReader();
 reader.onloadend = () => setImagePreview(reader.result);
 reader.readAsDataURL(file);
 }
 };

 const handleSave = async () => {
 setLoading(true);
 try {
 const token = localStorage.getItem("token");
 const method = id ? "put" : "post";
 const url = id ? `${API_URL}/api/v1/admin/services/${id}` : `${API_URL}/api/v1/admin/services`;

 if (!state.gameId || !isValidObjectId(state.gameId)) {
 throw new Error("Please select a valid game");
 }
 if (!state.category || !isValidObjectId(state.category)) {
 throw new Error("Please select a valid category");
 }

 const formData = new FormData();

 const payload = {
 title: state.title,
 description: state.description,
 gameId: state.gameId,
 categoryId: state.category,
 shortDescription: state.shortDescription || "",
 estimatedStartTime: state.estimatedStartTime || "15 min",
 estimatedCompletionTime: state.estimatedCompletionTime || "Flexible",
 showVAT: state.showVAT !== false,
 cashbackPercent: Number(state.cashbackPercent) || 5,
 isActive: state.isActive !== false,
 deliveryTime: Number(state.deliveryTime) || 24,
 pricing: {
 type: 'fixed',
 basePrice: Number(state.basePrice) || 0
 }
 };

 if (state.reviews && state.reviews.length > 0) {
 payload.sampleReviews = state.reviews;
 }

 Object.keys(payload).forEach(key => {
 if (['sidebarSections', 'speedOptions', 'requirements', 'featureTags', 'reviews', 'pricing'].includes(key)) {
 const backendKey = key === 'featureTags' ? 'features' : key;
 if (payload[key]) {
 formData.append(backendKey, JSON.stringify(payload[key]));
 }
 } else {
 let backendKey = key;
 if (key === 'category') backendKey = 'categoryId';
 if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
 formData.append(backendKey, payload[key]);
 }
 }
 });

 if (imageFile) {
 formData.append('backgroundImage', imageFile);
 } else if (state.image) {
 formData.append('backgroundImage', state.image);
 }

 if (iconFile) {
 formData.append('icon', iconFile);
 } else if (state.icon) {
 formData.append('icon', state.icon);
 }

 await axios({
 method,
 url,
 data: formData,
 headers: {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'multipart/form-data'
 }
 });

 toast.success(`Service ${id ? "updated" : "created"} successfully`);
 setLastSaved(new Date().toLocaleTimeString());
 } catch (err) {
 console.error("Save error:", err.response?.data || err.message);
 const errorMsg = err.response?.data?.message || err.message || "Failed to save service";
 toast.error(String(errorMsg));
 } finally {
 setLoading(false);
 }
 };

 if (fetching) {
 return (
 <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4">
 <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading service data...</p>
 </div>
 );
 }

 return (
 <div className="min-h-screen h-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-['Outfit']">
 {/* Header */}
 <header className="flex-shrink-0 z-40 bg-[#161616] border-b border-[#2a2a2a] px-8 py-4 flex items-center justify-between shadow-2xl relative">
 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

 <div className="flex items-center gap-6">
 <button
 onClick={() => navigate('/admin/services')}
 className="p-2.5 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] rounded-xl transition-all text-gray-400 hover:text-white group"
 >
 <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
 </button>
 <div className="flex flex-col">
 <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
 {id ? "Edit Service" : "Service Creator"}
 {state.isActive && (
 <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
 <span className="text-[8px] text-green-500 font-black tracking-widest uppercase">Live</span>
 </span>
 )}
 </h1>
 <div className="flex items-center gap-3 mt-0.5">
 <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">ID: {id || state.serviceId.substring(0, 8)}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3">
 {lastSaved && (
 <div className="hidden xl:flex flex-col items-end mr-4 group">
 <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Cloud Sync Active</span>
 <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Updated {lastSaved}</span>
 </div>
 )}

 <button
 onClick={() => setIsExporting(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[#2a2a2a]"
 >
 <Copy size={14} /> Export JSON
 </button>

 <button
 onClick={handleSave}
 disabled={loading}
 className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 min-w-[120px] justify-center group"
 >
 {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
 {id ? "Sync Data" : "Publish"}
 </button>

 <button
 onClick={() => navigate('/admin/services')}
 className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
 >
 <X size={20} />
 </button>
 </div>
 </header>

 <main className="flex-1 flex overflow-hidden">
 {/* LEFT: FORM BUILDER */}
 <div className="flex-[3] overflow-y-auto px-10 py-10 custom-scrollbar bg-[#0f0f0f]">
 <div className="max-w-[1000px] mx-auto space-y-12 pb-20">
 <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
 <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 1: Service Identity
 </h2>

 <div className="grid grid-cols-2 gap-8 mb-8 border-b border-white/5 pb-8">
 <div>
 <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3 px-1">Hero Background (JPG/JPEG)</label>
 <div className="w-full h-32 rounded-2xl overflow-hidden bg-[#0d0d0d] border border-[#2a2a2a] relative group">
 {imagePreview ? (
 <img src={imagePreview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Preview" />
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-gray-700"><Plus size={32} /></div>
 )}
 <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
 <input type="file" className="hidden" accept="image/jpeg,image/jpg" onChange={handleImageChange} />
 <span className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg">Change Image</span>
 </label>
 </div>
 </div>
 <div>
 <label className="block text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3 px-1">Service Icon (PNG)</label>
 <div className="w-full h-32 rounded-2xl overflow-hidden bg-[#0d0d0d] border border-[#2a2a2a] relative group flex items-center justify-center">
 {iconPreview ? (
 <img src={iconPreview} className="h-20 w-20 object-contain group-hover:scale-110 transition-transform" alt="Preview" />
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-gray-700"><Plus size={32} /></div>
 )}
 <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
 <input type="file" className="hidden" accept="image/png" onChange={handleIconChange} />
 <span className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg">Change Icon</span>
 </label>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="col-span-2">
 <label className="block text-sm font-bold text-gray-400 mb-2">Service Title</label>
 <input
 type="text"
 value={state.title}
 onChange={(e) => setState(p => ({ ...p, title: e.target.value }))}
 className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all text-lg font-bold"
 placeholder="e.g. Equilibrium Dungeon Boost"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-400 mb-2">Game *</label>
 <select
 value={state.gameId}
 onChange={(e) => setState(p => ({ ...p, gameId: e.target.value, category: "" }))}
 className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
 >
 <option value="">Select a game</option>
 {games.map(game => (<option key={game._id} value={game._id}>{game.name}</option>))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-400 mb-2">Category *</label>
 <select
 value={state.category}
 onChange={(e) => setState(p => ({ ...p, category: e.target.value }))}
 disabled={!state.gameId}
 className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all disabled:opacity-50"
 >
 <option value="">{state.gameId ? "Select a category" : "Select a game first"}</option>
 {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
 </select>
 </div>

 <div className="col-span-2">
 <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
 <textarea
 value={state.description}
 onChange={(e) => setState(p => ({ ...p, description: e.target.value }))}
 className="w-full h-32 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
 placeholder="Enter service details..."
 />
 </div>
 </div>
 </section>

 <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
 <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 2: Sidebar Sections
 </h2>

 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderSections}>
 <SortableContext items={state.sidebarSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
 <div className="space-y-4">
 {state.sidebarSections.map((section) => (
 <SectionCard
 key={section.id}
 section={section}
 onUpdate={updateSection}
 onDelete={deleteSection}
 onAddOption={addOption}
 onUpdateOption={updateOption}
 onDeleteOption={deleteOption}
 onReorderOptions={handleReorderOptions}
 />
 ))}
 </div>
 </SortableContext>
 </DndContext>

 <button
 onClick={addSection}
 className="w-full mt-6 py-6 border-2 border-dashed border-[#2a2a2a] rounded-2xl flex items-center justify-center gap-3 text-gray-400 hover:border-purple-600 hover:text-purple-500 transition-all bg-[#1a1a1a] group"
 >
 <Plus size={24} className="text-purple-500" />
 <span className="text-md font-black uppercase tracking-[0.1em]">Add Section</span>
 </button>
 </section>

 <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
 <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 3: Pricing
 </h2>
 <div className="grid grid-cols-2 gap-8">
 <div>
 <label className="block text-sm font-bold text-gray-400 mb-2">Base Cost ($)</label>
 <input
 type="number"
 value={state.basePrice}
 onChange={(e) => setState(p => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
 className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-xl font-black focus:border-purple-500 outline-none"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
 <button
 onClick={() => setState(p => ({ ...p, isActive: !p.isActive }))}
 className={`w-full py-3 rounded-xl font-black uppercase text-xs transition-all ${state.isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}
 >
 {state.isActive ? 'Active' : 'Draft'}
 </button>
 </div>
 </div>
 </section>
 </div>
 </div>

 {/* RIGHT: PREVIEW */}
 <div className="flex-[2] bg-[#141414] border-l border-[#222] flex flex-col overflow-hidden relative shadow-2xl">
 <div className="p-5 border-b border-[#222] bg-[#181818] flex items-center justify-between">
 <span className="text-xs font-black uppercase tracking-widest text-gray-400">Live Client Preview</span>
 </div>

 <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#090909] custom-scrollbar">
 <div className="transform origin-top scale-110">
 <SidebarPreview state={state} />
 </div>
 </div>
 </div>
 </main>

 {/* EXPORT MODAL */}
 {isExporting && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
 <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsExporting(false)}></div>
 <div className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
 <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
 <h3 className="text-xl font-black uppercase tracking-tighter text-white">Export Configuration</h3>
 <button onClick={() => setIsExporting(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
 </div>
 <div className="flex-1 overflow-auto p-8 bg-[#0d0d0d]">
 <pre className="text-[11px] font-mono leading-relaxed text-gray-400 p-6 bg-[#080808] border border-white/5 rounded-2xl whitespace-pre-wrap">
 {JSON.stringify(state, null, 2)}
 </pre>
 </div>
 <div className="p-6 border-t border-white/5 bg-[#161616] flex items-center justify-end gap-3">
 <button onClick={() => setIsExporting(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px]">Close</button>
 <button
 onClick={() => {
 navigator.clipboard.writeText(JSON.stringify(state, null, 2));
 toast.success("Copied to clipboard!");
 }}
 className="px-10 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
 >
 Copy to Clipboard
 </button>
 </div>
 </div>
 </div>
 )}

 <style>{`
 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
 `}</style>
 </div>
 );
}
