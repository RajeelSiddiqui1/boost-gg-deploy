import React from 'react';
import { X, Zap, Clock, ShieldCheck, BarChart3, Globe, Monitor } from 'lucide-react';
import { getImageUrl } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const ServiceDetailModal = ({ isOpen, onClose, service, order }) => {
    const { formatPrice } = useCurrency();

    if (!isOpen || !service) return null;

    const options = order?.selectedOptions || {};

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
            
            <div className="relative w-full max-w-[900px] max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Header with Background */}
                <div className="relative h-64 md:h-80 shrink-0">
                    {service.backgroundImage ? (
                        <img 
                            src={getImageUrl(service.backgroundImage)} 
                            className="w-full h-full object-cover opacity-40" 
                            alt="" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-black" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-8 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] flex items-center justify-center p-6 shadow-2xl">
                            <img 
                                src={getImageUrl(service.icon || service.image)} 
                                className="w-full h-full object-contain brightness-110" 
                                alt="" 
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
                    {/* Main Info */}
                    <div className="space-y-4 text-center max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="px-4 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                {service.categorySlug?.replace('-', ' ') || 'Service'}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">
                                {service.game}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-white leading-tight">
                            {service.title}
                        </h2>
                    </div>

                    {/* Order Configuration (What the booster needs to do) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 text-primary" /> Order Specifications
                            </h3>
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
                                {Object.keys(options).length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6">
                                        {Object.entries(options).map(([key, val]) => (
                                            val && (
                                                <div key={key} className="flex flex-col gap-1.5 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                                                        {key.replace(/([A-Z])/g, ' $1')}
                                                    </span>
                                                    <span className="text-sm font-bold text-white/90">
                                                        {Array.isArray(val) ? val.join(', ') : String(val)}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/30 font-medium italic">Standard configuration</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                                <Globe className="w-4 h-4 text-primary" /> Delivery Info
                            </h3>
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Monitor className="w-4 h-4 text-white/20" />
                                            <span className="text-xs font-bold text-white/60">Platform</span>
                                        </div>
                                        <span className="text-xs font-black text-white uppercase">{order?.platform || 'Any'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-white/20" />
                                            <span className="text-xs font-bold text-white/60">Region</span>
                                        </div>
                                        <span className="text-xs font-black text-white uppercase">{order?.region || 'Any'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-white/20" />
                                            <span className="text-xs font-bold text-white/60">Est. Time</span>
                                        </div>
                                        <span className="text-xs font-black text-white uppercase">{service.estimatedCompletionTime || '24h'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    {service.requirements?.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Requirements
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.requirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        <span className="text-xs font-medium text-white/60">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Action */}
                <div className="p-8 md:p-10 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-8 shrink-0">
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-1">Booster Payout</p>
                        <p className="text-3xl font-black text-white">{formatPrice(order?.boosterEarnings || order?.price || 0)}</p>
                    </div>
                    
                    <div className="flex gap-4 flex-1 md:flex-initial">
                        <button 
                            onClick={onClose}
                            className="flex-1 md:w-40 py-5 bg-white/5 hover:bg-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all"
                        >
                            Back
                        </button>
                        {order && order.status === 'pending' && !order.pro && (
                            <button 
                                className="flex-1 md:w-64 py-5 bg-primary text-black rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/20"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('claimOrder', { detail: order._id }));
                                    onClose();
                                }}
                            >
                                Claim Order Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;
