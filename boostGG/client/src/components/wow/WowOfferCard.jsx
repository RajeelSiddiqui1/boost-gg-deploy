import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ShieldCheck, Flame } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const WowOfferCard = ({ service }) => {
    const {
        _id,
        name,
        slug,
        shortDescription,
        price,
        deliveryTimeText,
        icon,
        isFeatured,
        ordersCount,
        category
    } = service;
    const { formatPrice } = useCurrency();

    return (
        <Link
            to={`/products/${slug || _id}`}
            className="group bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all hover:scale-[1.02] flex flex-col h-full"
        >
            {/* Image / Header */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={icon || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isFeatured && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                            <Flame className="w-3 h-3 fill-current" />
                            Popular
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-primary fill-current" />
                        Live
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        Verified PRO
                    </div>
                    {ordersCount > 0 && (
                        <div className="text-white/40 text-[9px] font-medium italic">
                            {ordersCount}+ orders completed
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black italic uppercase text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                    {name}
                </h3>
                <p className="text-sm text-white/40 mb-6 line-clamp-2">
                    {shortDescription || 'Professional boosting services for World of Warcraft players.'}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-tight">{deliveryTimeText || '24h Delivery'}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Starting at</span>
                            <div className="text-2xl font-black text-white italic">
                                {formatPrice(price)}
                            </div>
                        </div>
                        <button className="flex-1 bg-white/[0.03] border border-white/5 hover:bg-primary hover:text-black hover:border-primary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all transform active:scale-95">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default WowOfferCard;
