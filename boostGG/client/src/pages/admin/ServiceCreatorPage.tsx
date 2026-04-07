import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
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

// Modular Types & Components
import { ServiceData, SidebarSection, Option, FieldType } from "./types/ServiceCreator";
import { SectionCard } from "./components/SectionCard";
import { SidebarPreview } from "./components/SidebarPreview";

/* ═══════════════════════════════ COMPONENTS ═══════════════════════════════ */

// ─── SORTABLE OPTION ROW ──────────────────────────────────────────────────



// ─── MAIN CREATOR PAGE ────────────────────────────────────────────────────

export default function ServiceCreatorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [state, setState] = useState<ServiceData>({
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

    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [copied, setCopied] = useState(false);

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
                    setState({
                        ...data,
                        serviceId: data._id,
                        gameId: data.gameId?._id || data.gameId || "",
                        category: typeof data.category === 'object' ? data.category?.name || "" : (data.category || ""),
                        sidebarSections: data.sidebarSections || [],
                        featureTags: data.featureTags || [],
                        requirements: data.requirements || [],
                        speedOptions: data.speedOptions || {
                            express: { enabled: true, label: "Express", priceModifier: 0, tooltip: "" },
                            superExpress: { enabled: true, label: "Super Express", priceModifier: 0, tooltip: "" }
                        },
                        reviews: data.sampleReviews || []
                    });
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
        const newSection: SidebarSection = {
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

    const updateSection = (id: string, updates: Partial<SidebarSection>) => {
        setState(p => ({
            ...p,
            sidebarSections: p.sidebarSections.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    };

    const deleteSection = (id: string) => {
        setState(p => ({ ...p, sidebarSections: p.sidebarSections.filter(s => s.id !== id) }));
    };

    const addOption = (sectionId: string) => {
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

    const updateOption = (sectionId: string, optionId: string, updates: Partial<Option>) => {
        setState(p => ({
            ...p,
            sidebarSections: p.sidebarSections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        options: s.options?.map(o => {
                            if (o.id === optionId) {
                                const newOpt = { ...o, ...updates };
                                // Ensure only one default for radio/dropdown
                                if (updates.isDefault && (s.fieldType === 'radio' || s.fieldType === 'dropdown')) {
                                    // This is complex to handle perfectly here, but simplified: assume user knows what they're doing or just force it later
                                }
                                return newOpt;
                            }
                            return o;
                        })
                    };
                }
                return s;
            })
        }));
    };

    const deleteOption = (sectionId: string, optionId: string) => {
        setState(p => ({
            ...p,
            sidebarSections: p.sidebarSections.map(s => s.id === sectionId ? { ...s, options: s.options?.filter(o => o.id !== optionId) } : s)
        }));
    };

    const handleReorderSections = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setState((p) => {
                const oldIndex = p.sidebarSections.findIndex((s) => s.id === active.id);
                const newIndex = p.sidebarSections.findIndex((s) => s.id === over.id);
                const reordered = arrayMove(p.sidebarSections, oldIndex, newIndex);
                // Sync displayOrder
                return {
                    ...p,
                    sidebarSections: reordered.map((s, i) => ({ ...s, displayOrder: i + 1 }))
                };
            });
        }
    };

    const handleReorderOptions = (sectionId: string, oldIndex: number, newIndex: number) => {
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

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(state, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const method = id ? "put" : "post";
            const url = id ? `${API_URL}/api/v1/services/admin/${id}` : `${API_URL}/api/v1/services/admin`;

            const payload = {
                ...state,
                sampleReviews: state.reviews,
                pricing: {
                    type: 'fixed',
                    basePrice: Number(state.basePrice) || 0
                }
            };


            await axios({
                method,
                url,
                data: payload,
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Service ${id ? "updated" : "created"} successfully`);
            setLastSaved(new Date().toLocaleTimeString());
        } catch (err: any) {
            console.error("Save error:", err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Failed to save service");
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
        <div className="min-h-screen h-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 z-40 bg-[#161616] border-b border-[#2a2a2a] px-8 py-4 flex items-center justify-between shadow-2xl relative">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/services')}
                        className="p-2.5 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] rounded-xl transition-all text-gray-400 hover:text-white group"
                        title="Back to Services"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
                            {id ? "Edit Service" : "Service Creator"}
                            {state.isActive && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] text-green-500 font-black tracking-widest uppercase">Live</span>
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">ID:</span>
                                <span className="text-[10px] text-purple-400/80 font-mono font-bold tracking-tight bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                                    {id || state.serviceId.substring(0, 8)}
                                </span>
                            </div>
                            <div className="h-2 w-[1px] bg-gray-800"></div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">URL:</span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-tight truncate max-w-[200px]">
                                    {state.slug || "no-slug-yet"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <div className="hidden xl:flex flex-col items-end mr-4 group">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest group-hover:text-gray-400 transition-colors">Cloud Sync Active</span>
                            </div>
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Updated {lastSaved}</span>
                        </div>
                    )}

                    <button
                        onClick={() => setIsExporting(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[#2a2a2a] hover:border-purple-500/30"
                    >
                        <Copy size={14} /> Export JSON
                    </button>

                    <div className="w-[1px] h-8 bg-gray-800 mx-1"></div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(147,51,234,0.2)] hover:shadow-[0_10px_25px_rgba(147,51,234,0.3)] disabled:opacity-50 min-w-[120px] justify-center group"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                        {id ? "Sync Data" : "Publish"}
                    </button>

                    <button
                        onClick={() => navigate('/admin/services')}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all group"
                        title="Close & Discard"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* LEFT: FORM BUILDER (60%) - Scrollable */}
                <div className="flex-[3] overflow-y-auto px-10 py-10 custom-scrollbar bg-[#0f0f0f]">
                    <div className="max-w-[1000px] mx-auto space-y-12 pb-20">
                        {/* Basic Info */}
                        <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 1: Basic Info
                            </h2>

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
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Slug</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-gray-600 text-sm">/products/</span>
                                        <input
                                            type="text"
                                            value={state.slug}
                                            onChange={(e) => setState(p => ({ ...p, slug: e.target.value }))}
                                            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl pl-[84px] pr-4 py-3 text-white focus:border-purple-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Estimated Start Time</label>
                                        <div className="relative">
                                            <Zap className="absolute left-4 top-3.5 text-purple-500" size={16} />
                                            <input
                                                type="text"
                                                value={state.estimatedStartTime}
                                                onChange={(e) => setState(p => ({ ...p, estimatedStartTime: e.target.value }))}
                                                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                                placeholder="e.g. 15-30 min"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Completion Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-3.5 text-purple-500" size={16} />
                                            <input
                                                type="text"
                                                value={state.estimatedCompletionTime}
                                                onChange={(e) => setState(p => ({ ...p, estimatedCompletionTime: e.target.value }))}
                                                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                                placeholder="e.g. 24-48 hours"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Game ID</label>
                                        <input
                                            type="text"
                                            value={state.gameId}
                                            onChange={(e) => setState(p => ({ ...p, gameId: e.target.value }))}
                                            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-all"
                                            placeholder="destiny-2"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                                        <input
                                            type="text"
                                            value={state.category}
                                            onChange={(e) => setState(p => ({ ...p, category: e.target.value }))}
                                            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-all"
                                            placeholder="Dungeons"
                                        />
                                    </div>
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

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Feature Tags</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl min-h-[50px]">
                                        {state.featureTags?.map((tag, i) => (
                                            <div key={i} className="bg-purple-900/40 text-purple-400 border border-purple-800/40 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 transition-all hover:scale-105">
                                                {tag}
                                                <button onClick={() => setState(p => ({ ...p, featureTags: p.featureTags.filter((_, idx) => idx !== i) }))}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            onKeyDown={(e: any) => {
                                                if (e.key === 'Enter' && e.target.value) {
                                                    setState(p => ({ ...p, featureTags: [...p.featureTags, e.target.value] }));
                                                    e.target.value = "";
                                                }
                                            }}
                                            placeholder="Type tag and press Enter..."
                                            className="bg-transparent text-xs text-white outline-none p-1 border-none focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Part 2: Sidebar Configurator Builder */}
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
                                <div className="w-10 h-10 rounded-full bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600/20 transition-all">
                                    <Plus size={24} className="text-purple-500" />
                                </div>
                                <span className="text-md font-black uppercase tracking-[0.1em]">Add Section (Unlimited)</span>
                            </button>
                        </section>

                        {/* Pricing & VAT */}
                        <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 3: Global Pricing
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Base Entrance Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={state.basePrice}
                                                onChange={(e) => setState(p => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
                                                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl pl-8 pr-4 py-3 text-white text-xl font-black focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl">
                                        <div>
                                            <span className="block text-sm font-bold text-white">Tax Display (VAT)</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Toggle "incl. VAT" label</span>
                                        </div>
                                        <button
                                            onClick={() => setState(p => ({ ...p, showVAT: !p.showVAT }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${state.showVAT ? 'bg-purple-600' : 'bg-[#222]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.showVAT ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Cashback Multiplier (%)</label>
                                        <input
                                            type="number"
                                            value={state.cashbackPercent}
                                            onChange={(e) => setState(p => ({ ...p, cashbackPercent: parseInt(e.target.value) || 0 }))}
                                            className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white font-bold"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl">
                                        <div>
                                            <span className="block text-sm font-bold text-white">Draft / Active Status</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Visibility on public store</span>
                                        </div>
                                        <button
                                            onClick={() => setState(p => ({ ...p, isActive: !p.isActive }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${state.isActive ? 'bg-green-600' : 'bg-[#222]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.isActive ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Speed Options */}
                        <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Speed Options
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                {/* Express */}
                                <div className="space-y-4 p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-bold text-white">Express Speed</span>
                                        <button
                                            onClick={() => setState(p => ({
                                                ...p,
                                                speedOptions: {
                                                    ...p.speedOptions,
                                                    express: { ...p.speedOptions?.express, enabled: !p.speedOptions?.express?.enabled }
                                                }
                                            }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${state.speedOptions?.express?.enabled ? 'bg-purple-600' : 'bg-[#222]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.speedOptions?.express?.enabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    {state.speedOptions?.express?.enabled && (
                                        <div className="flex gap-4">
                                            <div className="flex-[2]">
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={state.speedOptions?.express?.label || ''}
                                                    onChange={(e) => setState(p => ({
                                                        ...p,
                                                        speedOptions: {
                                                            ...p.speedOptions,
                                                            express: { ...p.speedOptions?.express, label: e.target.value }
                                                        }
                                                    }))}
                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                                    placeholder="Express"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Price (+$)</label>
                                                <input
                                                    type="number"
                                                    value={state.speedOptions?.express?.priceModifier || 0}
                                                    onChange={(e) => setState(p => ({
                                                        ...p,
                                                        speedOptions: {
                                                            ...p.speedOptions,
                                                            express: { ...p.speedOptions?.express, priceModifier: parseFloat(e.target.value) || 0 }
                                                        }
                                                    }))}
                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Super Express */}
                                <div className="space-y-4 p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-bold text-white">Super Express Speed</span>
                                        <button
                                            onClick={() => setState(p => ({
                                                ...p,
                                                speedOptions: {
                                                    ...p.speedOptions,
                                                    superExpress: { ...p.speedOptions?.superExpress, enabled: !p.speedOptions?.superExpress?.enabled }
                                                }
                                            }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${state.speedOptions?.superExpress?.enabled ? 'bg-purple-600' : 'bg-[#222]'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.speedOptions?.superExpress?.enabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    {state.speedOptions?.superExpress?.enabled && (
                                        <div className="flex gap-4">
                                            <div className="flex-[2]">
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={state.speedOptions?.superExpress?.label || ''}
                                                    onChange={(e) => setState(p => ({
                                                        ...p,
                                                        speedOptions: {
                                                            ...p.speedOptions,
                                                            superExpress: { ...p.speedOptions?.superExpress, label: e.target.value }
                                                        }
                                                    }))}
                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                                    placeholder="Super Express"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-400 mb-1">Price (+$)</label>
                                                <input
                                                    type="number"
                                                    value={state.speedOptions?.superExpress?.priceModifier || 0}
                                                    onChange={(e) => setState(p => ({
                                                        ...p,
                                                        speedOptions: {
                                                            ...p.speedOptions,
                                                            superExpress: { ...p.speedOptions?.superExpress, priceModifier: parseFloat(e.target.value) || 0 }
                                                        }
                                                    }))}
                                                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xs uppercase font-black tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Part 4: Account Requirements
                            </h2>
                            <div className="space-y-4">
                                {state.requirements?.map((req, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</div>
                                        <input
                                            type="text"
                                            value={req}
                                            onChange={(e) => setState(p => ({
                                                ...p,
                                                requirements: p.requirements.map((r, idx) => idx === i ? e.target.value : r)
                                            }))}
                                            className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none"
                                            placeholder={`Requirement ${i + 1}`}
                                        />
                                        <button
                                            onClick={() => setState(p => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }))}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setState(p => ({ ...p, requirements: [...p.requirements, ""] }))}
                                    className="w-full py-4 border border-dashed border-[#2a2a2a] rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-purple-500/50 hover:text-purple-400 bg-[#0d0d0d]/30"
                                >
                                </button>
                            </div>
                        </section>

                    </div>
                </div>

                {/* RIGHT: LIVE PREVIEW (40%) - Fixed/Sticky */}
                <div className="flex-[2] bg-[#141414] border-l border-[#222] flex flex-col overflow-hidden relative shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
                    <div className="p-5 border-b border-[#222] bg-[#181818] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Live Client Preview</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/10 border border-purple-500/30 rounded-full">
                            <Eye size={12} className="text-purple-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">What users see</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#090909] custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        <div className="transform origin-top scale-110">
                            <SidebarPreview state={state} />
                        </div>
                    </div>

                    <div className="p-6 bg-[#181818] border-t border-[#222] text-center">
                        <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-black tracking-[0.1em]">
                            Preview matches the exact public-facing product sidebar design.
                        </p>
                    </div>
                </div>
            </main>

            {/* EXPORT MODAL */}
            {isExporting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsExporting(false)}></div>
                    <div className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#161616]">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                    <Copy className="text-purple-500" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Export Configuration</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Service: {state.title || "Untitled"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExporting(false)}
                                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#0d0d0d]">
                            <pre className="text-[11px] font-mono leading-relaxed text-gray-400 p-6 bg-[#080808] border border-white/5 rounded-2xl whitespace-pre-wrap">
                                {JSON.stringify(state, null, 2)}
                            </pre>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#161616] flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsExporting(false)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
                                    toast.success("Copied to clipboard!");
                                }}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                            >
                                <Copy size={14} /> Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
