import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Zap, Shield, Clock, 
    CheckCircle2, Info, ShieldCheck, 
    DollarSign, Globe, Monitor, 
    MessageSquare, AlertCircle, ChevronRight,
    User, Star, Activity, Target
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';

const CustomerOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/v1/orders/${id}`);
            setOrder(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("Order not found or failed to load");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    if (loading) return (
        <DashboardLayout title="Decrypting Vault...">
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    if (error || !order) return (
        <DashboardLayout title="Transmission Interrupted">
            <div className="min-h-[400px] flex flex-col items-center justify-center text-white/40 space-y-6">
                <AlertCircle className="w-20 h-20 text-red-500/20" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">{error}</h2>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                    Return to Vault
                </button>
            </div>
        </DashboardLayout>
    );

    const service = order.serviceId || order.offer;
    const selectedOptions = order.selectedOptions || {};
    const pro = order.pro;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Awaiting Deployment', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
            case 'processing': return { label: 'Operation Active', color: 'text-primary', bg: 'bg-primary/10', icon: Zap };
            case 'completed': return { label: 'Mission Successful', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
            default: return { label: status.toUpperCase(), color: 'text-white/40', bg: 'bg-white/5', icon: Info };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    // Helper to get formatted value for a section
    const renderOptionValue = (section, value) => {
        if (!value) return null;

        if (section.fieldType === 'checkbox') {
            const values = Array.isArray(value) ? value : [value];
            return values.map(v => {
                const opt = section.options?.find(o => o.id === v || o._id === v);
                return opt ? opt.label : v;
            }).join(', ');
        }

        if (section.fieldType === 'radio' || section.fieldType === 'dropdown') {
            const opt = section.options?.find(o => o.id === value || o._id === value);
            return opt ? opt.label : value;
        }

        if (section.fieldType === 'range') {
            return `${value} ${section.stepperConfig?.unitLabel || 'Units'}`;
        }

        return String(value);
    };

    return (
        <DashboardLayout title={`Mission Briefing: #${order._id.slice(-6).toUpperCase()}`}>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 text-white/20 hover:text-white transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Buyer Vault</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-16">
                        <div className="relative h-[400px] rounded-[60px] overflow-hidden border border-white/5 bg-[#0A0A0A] group shadow-2xl">
                            {service?.backgroundImage ? (
                                <img src={getImageUrl(service.backgroundImage)} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-110" alt="" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-black" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative group-hover:scale-110 transition-transform duration-700">
                                    <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full"></div>
                                    <img src={getImageUrl(service?.icon || service?.image)} className="relative h-48 object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]" alt="" />
                                </div>
                            </div>
                            <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 ${statusInfo.bg} border border-white/5 rounded-full text-[9px] font-black ${statusInfo.color} uppercase tracking-widest flex items-center gap-2`}>
                                        <statusInfo.icon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em]">{service?.game}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase text-white leading-[1.1] tracking-tighter">{service?.title}</h1>
                            </div>
                        </div>

                        {/* Order Specifications - Sidebar Logic Style */}
                        <div className="space-y-12">
                            <h3 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-5">
                                <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                Mission Specifications
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {service?.sidebarSections?.length > 0 ? (
                                    service.sidebarSections.map((section) => {
                                        const value = selectedOptions[section.id];
                                        if (!value) return null;
                                        const displayValue = renderOptionValue(section, value);
                                        
                                        return (
                                            <div key={section.id} className="bg-[#0D0D0D] border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/20 transition-all">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Activity className="w-4 h-4 text-primary opacity-30" />
                                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">{section.heading}</p>
                                                    </div>
                                                    <p className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {displayValue}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                        CONFIRMED
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    /* Fallback to simple grid if no sidebar sections defined */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {Object.entries(selectedOptions).map(([key, val]) => (
                                            val && (
                                                <div key={key} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-3 group hover:border-primary/20 transition-all">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-lg font-black text-white uppercase tracking-tight">
                                                        {Array.isArray(val) ? val.join(', ') : String(val)}
                                                    </p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {service?.requirements?.length > 0 && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-4">
                                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                                    Deployment Requirements
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {service.requirements.map((req, i) => (
                                        <div key={i} className="flex items-center gap-4 p-6 bg-white/[0.01] border border-white/5 rounded-3xl">
                                            <ShieldCheck className="w-5 h-5 text-primary/40" />
                                            <span className="text-sm font-medium text-white/60 leading-relaxed">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 space-y-10 sticky top-12">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[56px] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-[11px] font-black uppercase text-white/20 tracking-[0.3em]">INVESTMENT VALUE</p>
                                <h2 className="text-6xl font-black text-white tracking-tighter">{formatPrice(order.amount || order.price)}</h2>
                            </div>
                            <div className="space-y-6 pt-6 border-t border-white/5 relative z-10">
                                {pro ? (
                                    <div className="p-8 bg-white/[0.02] border border-primary/20 rounded-[40px] space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
                                                <User className="w-8 h-8" />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0A0A0A]"></div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Assigned Specialist</p>
                                                <p className="text-xl font-black text-white uppercase tracking-tight">{pro.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Operator Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-white/[0.02] border border-white/5 border-dashed rounded-[40px] text-center space-y-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                            <Clock className="w-8 h-8 text-white/20" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white uppercase tracking-tight">Securing Specialist</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Awaiting deployment...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => navigate(`/pro/chat/${order._id}`)}
                                className="w-full bg-primary hover:bg-white text-black py-7 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 relative z-10"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Open Comms Hub
                            </button>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[56px] p-12 space-y-8 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase text-white tracking-tight">Deployment Intel</h3>
                                <Target className="w-6 h-6 text-primary/40" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-3.5 h-3.5 text-primary/40" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Platform</p>
                                    </div>
                                    <p className="text-sm font-black text-white uppercase tracking-wider">{order.platform || 'Cross-Play'}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Globe className="w-3.5 h-3.5 text-primary/40" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Region</p>
                                    </div>
                                    <p className="text-sm font-black text-white uppercase tracking-wider">{order.region || 'Global'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerOrderDetails;
