import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus } from 'lucide-react';
import { getImageUrl } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const ServiceCard = ({ service, style }) => {
 const navigate = useNavigate();
 const { formatPrice } = useCurrency();

 const handleBuy = (e) => {
 e.stopPropagation();
 navigate(`/products/${service.slug || service._id}`);
 };

 return (
 <div
 onClick={() => navigate(`/products/${service.slug || service._id}`)}
 className="group relative bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-primary/40 hover:bg-[#1A1A1A]/60 flex flex-col h-full cursor-pointer hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
 style={style}
 >
 {/* Top Image Section */}
 <div className="relative h-48 overflow-hidden">
 {/* Background Image */}
 {(service.backgroundImage || service.image) ? (
 <img
 src={getImageUrl(service.backgroundImage || service.image)}
 className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
 alt={service.title}
 />
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
 )}
 
 {/* Service Icon overlay on top of background - centered */}
 {service.icon && (
 <img
 src={getImageUrl(service.icon)}
 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 object-contain z-10 transition-transform duration-500 group-hover:scale-110"
 alt={service.title}
 />
 )}
 
 {/* Dark overlay gradient */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent"></div>

 {/* Dynamic Badges */}
 <div className="absolute top-4 left-4 flex flex-col gap-2">
 {service.discount > 0 && (
 <div className="px-3 py-1 bg-primary text-black text-[9px] font-black rounded-full flex items-center gap-1.5 shadow-xl">
 <Zap className="w-3 h-3 fill-current" />
 <span>{service.discount}% OFF</span>
 </div>
 )}
 {service.isHot && (
 <div className="px-3 py-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center gap-1.5 shadow-xl">
 <Plus className="w-3 h-3 fill-current rotate-45" />
 <span>HOT DEAL</span>
 </div>
 )}
 </div>

 {/* Hover Overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 </div>

 <div className="p-8 flex flex-col flex-grow relative">
 {/* Title */}
 <h3 className="text-lg font-black text-white mb-4 line-clamp-2 leading-[1.2] group-hover:text-primary transition-colors">
 {service.title}
 </h3>

 {/* Features List with custom design */}
 <div className="space-y-3 mb-8 flex-grow">
 {service.features?.slice(0, 3).map((feature, index) => (
 <div key={index} className="flex items-start gap-3 text-[11px] font-bold text-white/30 group-hover:text-white/50 transition-colors">
 <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(162,230,62,0.4)]"></div>
 <span className="line-clamp-1 uppercase tracking-tight">{feature}</span>
 </div>
 ))}
 </div>

 {/* Footer: Price & Action */}
 <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
 <div className="flex flex-col">
 {service.discount > 0 && service.oldPrice && (
 <span className="text-[10px] text-white/20 line-through font-bold mb-1">
 {formatPrice(service.oldPrice)}
 </span>
 )}
 <div className="flex items-baseline">
 <span className="text-sm font-bold text-white/40 mr-1">from</span>
 <span className="text-3xl font-black text-white tracking-tighter">{formatPrice(service.basePrice)}</span>
 </div>
 </div>

 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300">
 <Plus className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
 </div>
 </div>
 </div>

 {/* Glow Effect on Hover */}
 <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-[2.5rem]"></div>
 </div>
 );
};

export default ServiceCard;
