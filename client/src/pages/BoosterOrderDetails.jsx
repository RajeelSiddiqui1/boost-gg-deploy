import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Zap, Shield, Clock, 
    CheckCircle2, Info, ShieldCheck, 
    DollarSign, BarChart3, Globe, 
    Monitor, Trophy, Package, 
    ArrowRight, MessageSquare, AlertCircle, ChevronRight, X, AlertTriangle,
    Target, Activity
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/layout/DashboardLayout';

const ClaimConfirmationModal = ({ isOpen, onClose, onConfirm, order, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-[500px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Zap className="w-10 h-10 text-primary" />
                    </div>
                    
                    <h3 className="text-3xl font-black uppercase text-white tracking-tighter">Accept Assignment?</h3>
                    <p className="text-white/40 font-medium leading-relaxed">
                        By claiming this order, you commit to completing the mission within the estimated timeframe. 
                        This action will move the order to your active registry.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <button 
                            onClick={onClose}
                            className="py-5 bg-white/5 hover:bg-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={loading}
                            onClick={onConfirm}
                            className="py-5 bg-primary text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
                        >
                            {loading ? 'Securing...' : 'Confirm Claim'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BoosterOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claimingId, setClaimingId] = useState(null);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

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

    const handleClaim = async () => {
        setClaimingId(order._id);
        try {
          await axios.put(`${API_URL}/api/v1/orders/${order._id}/claim`);
          toast.success('Order claimed successfully! Redirecting to hub...');
          setIsClaimModalOpen(false);
          setTimeout(() => {
              navigate('/pro/dashboard');
          }, 1500);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to claim order');
        } finally {
          setClaimingId(null);
        }
    };

    if (loading) return (
        <DashboardLayout title="Scanning Registry...">
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    if (error || !order) return (
        <DashboardLayout title="Access Denied">
            <div className="min-h-[400px] flex flex-col items-center justify-center text-white/40 space-y-6">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{error}</h2>
                <button 
                    onClick={() => navigate('/pro/dashboard')} 
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
                >
                    Return to Hub
                </button>
            </div>
        </DashboardLayout>
    );

    const service = order.serviceId;
    const selectedOptions = order.selectedOptions || {};

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
        <DashboardLayout title={`Mission Registry: #${order._id.slice(-6).toUpperCase()}`}>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <button 
                    onClick={() => navigate('/pro/dashboard')}
                    className="flex items-center gap-3 text-white/20 hover:text-white transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Operation Center</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-16">
                        <div className="relative h-[450px] rounded-[60px] overflow-hidden border border-white/5 bg-[#0A0A0A] group shadow-2xl">
                            {service?.backgroundImage ? (
                                <img src={getImageUrl(service.backgroundImage)} className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-110" alt="" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-black" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative group-hover:scale-110 transition-transform duration-700">
                                    <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>
                                    <img src={getImageUrl(service?.icon || service?.image)} className="relative h-56 object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] brightness-110" alt="" />
                                </div>
                            </div>
                            <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                                        {service?.categorySlug?.replace('-', ' ') || 'Boosting'}
                                    </span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em]">{service?.game}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase text-white leading-[1.1] tracking-tighter">{service?.title}</h1>
                            </div>
                        </div>

                        {/* Mission Specifications - Sidebar Style for PRO */}
                        <div className="space-y-12">
                            <h3 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-5">
                                <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                Mission Parameters
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
                                                    <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                                                        MISSION CRITICAL
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
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

                        <div className="space-y-8">
                            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-4">
                                <div className="w-1 h-6 bg-primary rounded-full"></div>
                                Service Intelligence
                            </h3>
                            <div 
                                className="text-white/40 font-medium leading-relaxed prose prose-invert max-w-none text-lg"
                                dangerouslySetInnerHTML={{ __html: service?.description }}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-10 sticky top-12">
                        <div className="bg-[#0A0A0A] border border-primary/30 rounded-[56px] p-12 space-y-8 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[120px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">MISSION REWARD</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-6xl font-black text-white tracking-tighter">{formatPrice(order.boosterEarnings || order.price)}</h2>
                                    <span className="text-lg font-bold text-white/20 uppercase tracking-widest">Payout</span>
                                </div>
                            </div>
                            <div className="pt-6 relative z-10">
                                {order.status === 'pending' && !order.pro ? (
                                    <button 
                                        disabled={claimingId === order._id}
                                        className="w-full bg-primary hover:bg-white text-black py-7 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                                        onClick={() => setIsClaimModalOpen(true)}
                                    >
                                        {claimingId === order._id ? 'Securing Link...' : 'Claim This Assignment'}
                                    </button>
                                ) : (
                                    <div className="w-full py-6 rounded-[32px] bg-white/5 border border-white/10 text-center">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            {order.status === 'processing' ? 'Assignment Active' : 'Operation Finalized'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[56px] p-12 space-y-10 shadow-xl">
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

                        <button 
                            onClick={() => navigate(`/pro/chat/${order._id}`)}
                            className="w-full p-10 rounded-[56px] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] hover:border-primary/20 transition-all shadow-xl"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Encrypted Link</p>
                                    <p className="text-lg font-black text-white uppercase tracking-tight">Open Comm-Channel</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            <ClaimConfirmationModal 
                isOpen={isClaimModalOpen} 
                onClose={() => setIsClaimModalOpen(false)} 
                onConfirm={handleClaim}
                loading={claimingId === order?._id}
                order={order}
            />
        </DashboardLayout>
    );
};

export default BoosterOrderDetails;
