import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronRight, Zap, Shield, Clock, Heart, 
    Share2, Star, CheckCircle2, MessageSquare, 
    ArrowRight, Info, ShieldCheck, Gamepad2,
    DollarSign, Laptop, Smartphone, Monitor, Coffee, 
    Sparkles, Trophy, Users, Headphones, Award, 
    Package, ArrowUpDown, Globe, ChevronDown
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import DetailBanner from '../components/DetailBanner';
import PaymentMethods from '../components/sections/PaymentMethods';
import PaymentModal from '../components/layout/PaymentModal';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [speed, setSpeed] = useState("normal");
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Helper function to get base price
    const getBasePrice = (serviceData) => {
        if (!serviceData) return 0;
        if (serviceData.price) return serviceData.price;
        if (serviceData.pricing) {
            const pricing = serviceData.pricing;
            if (pricing.type === 'fixed') return pricing.basePrice || 0;
            if (pricing.type === 'hourly') return pricing.basePrice || 0;
            if (pricing.type === 'per_level') return pricing.basePrice || 0;
            return pricing.basePrice || 0;
        }
        return 0;
    };

    // Fetch Service Details
    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                let res;
                try {
                    res = await axios.get(`${API_URL}/api/v1/services/slug/${id}`);
                } catch (e) {
                    res = await axios.get(`${API_URL}/api/v1/services/${id}`);
                }
                
                const data = res.data.data;
                console.log("Fetched Service Data:", data);
                setService(data);
                
                // Initialize platforms and regions
                if (data.platforms && data.platforms.length > 0) {
                    setSelectedPlatform(data.platforms[0]);
                }
                if (data.regions && data.regions.length > 0) {
                    setSelectedRegion(data.regions[0]);
                }

                // Initialize selected options from sidebarSections
                const initialOpts = {};
                if (data.sidebarSections && Array.isArray(data.sidebarSections)) {
                    data.sidebarSections.forEach(sec => {
                        if (sec.fieldType === 'checkbox') {
                            // Checkbox: default selected options
                            const defaultSelected = sec.options?.filter(o => o.isDefault).map(o => o.label) || [];
                            initialOpts[sec.id] = defaultSelected;
                        } 
                        else if (sec.fieldType === 'stepper') {
                            // Stepper: default value
                            initialOpts[sec.id] = sec.stepperConfig?.default || sec.stepperConfig?.min || 1;
                        } 
                        else if (sec.fieldType === 'range' || sec.fieldType === 'slider') {
                            // Range/Slider: default or min
                            initialOpts[sec.id] = sec.stepperConfig?.default || sec.stepperConfig?.min || 0;
                        } 
                        else if (sec.fieldType === 'radio' || sec.fieldType === 'dropdown') {
                            // Radio or Dropdown: default option or first option
                            const defaultChoice = sec.options?.find(o => o.isDefault) || sec.options?.[0];
                            initialOpts[sec.id] = defaultChoice?.label || "";
                        }
                        else if (sec.fieldType === 'text_input') {
                            // Text input: empty string
                            initialOpts[sec.id] = "";
                        }
                    });
                }
                setSelectedOptions(initialOpts);

                // Fetch related services by game
                if (data.gameId && data.gameId._id) {
                    try {
                        const gameServicesRes = await axios.get(`${API_URL}/api/v1/services/game/${data.gameId._id}`);
                        if (gameServicesRes.data && gameServicesRes.data.data) {
                            const filtered = gameServicesRes.data.data.filter(s => s._id !== data._id).slice(0, 4);
                            setRelatedServices(filtered);
                        }
                    } catch (relatedErr) {
                        console.error("Error fetching related services:", relatedErr);
                        setRelatedServices([]);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching service:", err);
                setError("Service not found or failed to load");
                setLoading(false);
            }
        };
        if (id) fetchService();
        window.scrollTo(0, 0);
    }, [id]);

    // Calculate total price based on selections
    const totalPrice = useMemo(() => {
        if (!service) return 0;
        
        let base = getBasePrice(service);
        let dynamicAdd = 0;
        let discountApplied = 0;

        // Process sidebar sections for dynamic pricing
        if (service.sidebarSections && Array.isArray(service.sidebarSections)) {
            service.sidebarSections.forEach(sec => {
                const selected = selectedOptions[sec.id];
                if (selected === undefined || selected === null) return;

                // Handle Checkbox (multiple selection)
                if (sec.fieldType === 'checkbox' && Array.isArray(selected)) {
                    selected.forEach(choiceLabel => {
                        const choice = sec.options?.find(o => o.label === choiceLabel);
                        if (choice && choice.priceModifier) {
                            dynamicAdd += choice.priceModifier;
                        }
                    });
                }
                // Handle Stepper (quantity selector with price per unit)
                else if (sec.fieldType === 'stepper') {
                    const value = Number(selected) || 0;
                    const min = sec.stepperConfig?.min || 0;
                    const pricePerUnit = sec.stepperConfig?.pricePerUnit || 0;
                    const count = Math.max(0, value - min);
                    dynamicAdd += count * pricePerUnit;
                    
                    // Check for bulk discount
                    if (sec.stepperConfig?.bulkDiscount && value >= sec.stepperConfig.bulkDiscount.threshold) {
                        discountApplied = sec.stepperConfig.bulkDiscount.discountPercent;
                    }
                }
                // Handle Range/Slider
                else if (sec.fieldType === 'range' || sec.fieldType === 'slider') {
                    const value = Number(selected) || 0;
                    const pricePerUnit = sec.stepperConfig?.pricePerUnit || 0;
                    dynamicAdd += value * pricePerUnit;
                }
                // Handle Radio and Dropdown (single selection)
                else if (sec.fieldType === 'radio' || sec.fieldType === 'dropdown') {
                    const choice = sec.options?.find(o => o.label === selected);
                    if (choice && choice.priceModifier) {
                        dynamicAdd += choice.priceModifier;
                    }
                }
            });
        }

        // Speed options modifier
        if (speed === 'express' && service.speedOptions?.express?.enabled) {
            dynamicAdd += (service.speedOptions.express.priceModifier || 0);
        }
        if (speed === 'superExpress' && service.speedOptions?.superExpress?.enabled) {
            dynamicAdd += (service.speedOptions.superExpress.priceModifier || 0);
        }

        // Calculate subtotal
        let subtotal = (base + dynamicAdd) * quantity;
        
        // Apply bulk discount if any
        if (discountApplied > 0) {
            subtotal = subtotal * (1 - discountApplied / 100);
        }
        
        // Quantity bulk discount (for quantity > 1)
        if (quantity > 1 && discountApplied === 0) {
            subtotal = subtotal * 0.95;
        }

        // Apply pricing min/max constraints
        if (service.pricing?.minPrice > 0 && subtotal < service.pricing.minPrice) {
            subtotal = service.pricing.minPrice;
        }
        if (service.pricing?.maxPrice > 0 && subtotal > service.pricing.maxPrice) {
            subtotal = service.pricing.maxPrice;
        }

        return parseFloat(subtotal.toFixed(2));
    }, [service, selectedOptions, speed, quantity]);

    const handleAddToCart = () => {
        if (!service) return;
        
        const cartItem = {
            id: service._id,
            title: service.title,
            price: totalPrice / quantity,
            quantity: quantity,
            image: service.backgroundImage || service.image,
            icon: service.icon,
            selectedOptions: selectedOptions,
            game: service.gameId?.name,
            platform: selectedPlatform,
            region: selectedRegion,
            speed: speed,
            type: 'service'
        };
        addToCart(cartItem);
        toast.success(`${service.title} added to cart!`);
    };

    const handleBuyNow = () => {
        if (!service) return;
        setShowPaymentModal(true);
    };

    const confirmBuyNow = (paymentMethod) => {
        const instantItem = {
            id: service._id,
            title: service.title,
            price: totalPrice / quantity,
            quantity: quantity,
            image: service.backgroundImage || service.image,
            icon: service.icon,
            selectedOptions: selectedOptions,
            game: service.gameId?.name,
            platform: selectedPlatform,
            region: selectedRegion,
            speed: speed,
            type: 'service'
        };
        
        setShowPaymentModal(false);
        navigate('/checkout', { 
            state: { 
                selectedPaymentMethod: paymentMethod,
                instantItem: instantItem 
            } 
        });
    };

    // Render dynamic form field based on type
    const renderFormField = (section) => {
        const value = selectedOptions[section.id];

        switch (section.fieldType) {
            case 'radio':
                return (
                    <div className="space-y-2">
                        {section.options?.map(opt => {
                            const isSelected = value === opt.label;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [section.id]: opt.label }))}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        isSelected 
                                            ? 'bg-primary/10 border-primary/50' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'border-primary' : 'border-white/20'
                                        }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                        </div>
                                        <span className="text-xs font-bold uppercase">{opt.label}</span>
                                        {opt.badge && (
                                            <span className="px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black text-primary uppercase">
                                                {opt.badge}
                                            </span>
                                        )}
                                        {opt.showInfo && opt.tooltip && (
                                            <div className="relative group">
                                                <Info className="w-3 h-3 text-white/30 cursor-help" />
                                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/90 text-[8px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    {opt.tooltip}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {opt.priceModifier > 0 && (
                                        <span className="text-[10px] font-bold text-primary">+${opt.priceModifier}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {section.options?.map(opt => {
                            const selectedArray = value || [];
                            const isSelected = selectedArray.includes(opt.label);
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        const current = selectedOptions[section.id] || [];
                                        setSelectedOptions(prev => ({
                                            ...prev,
                                            [section.id]: isSelected 
                                                ? current.filter(c => c !== opt.label)
                                                : [...current, opt.label]
                                        }));
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        isSelected 
                                            ? 'bg-primary/10 border-primary/50' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-primary border-primary' : 'border-white/20'
                                        }`}>
                                            {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                                        </div>
                                        <span className="text-xs font-bold uppercase">{opt.label}</span>
                                        {opt.badge && (
                                            <span className="px-2 py-0.5 bg-primary/20 rounded-full text-[8px] font-black text-primary uppercase">
                                                {opt.badge}
                                            </span>
                                        )}
                                        {opt.showInfo && opt.tooltip && (
                                            <div className="relative group">
                                                <Info className="w-3 h-3 text-white/30 cursor-help" />
                                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/90 text-[8px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    {opt.tooltip}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {opt.priceModifier > 0 && (
                                        <span className="text-[10px] font-bold text-primary">+${opt.priceModifier}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'dropdown':
                return (
                    <div className="relative">
                        <select
                            value={value || ''}
                            onChange={(e) => setSelectedOptions(prev => ({ ...prev, [section.id]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs font-bold uppercase appearance-none cursor-pointer focus:outline-none focus:border-primary/50"
                        >
                            {section.options?.map(opt => (
                                <option key={opt.id} value={opt.label} className="bg-black">
                                    {opt.label} {opt.priceModifier > 0 ? `(+$${opt.priceModifier})` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                );

            case 'stepper':
                const min = section.stepperConfig?.min || 1;
                const max = section.stepperConfig?.max || 999;
                const unitLabel = section.stepperConfig?.unitLabel || '';
                const pricePerUnit = section.stepperConfig?.pricePerUnit || 0;
                const bulkDiscount = section.stepperConfig?.bulkDiscount;
                const currentValue = value || min;
                
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-2 border border-white/10">
                            <button
                                onClick={() => setSelectedOptions(prev => ({
                                    ...prev,
                                    [section.id]: Math.max(min, (prev[section.id] || min) - 1)
                                }))}
                                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 text-white font-black transition-all"
                            >
                                -
                            </button>
                            <div className="text-center">
                                <span className="font-black text-xl text-white">{currentValue}</span>
                                {unitLabel && (
                                    <span className="text-[10px] font-bold text-white/40 ml-1">{unitLabel}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedOptions(prev => ({
                                    ...prev,
                                    [section.id]: Math.min(max, (prev[section.id] || min) + 1)
                                }))}
                                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 text-white font-black transition-all"
                            >
                                +
                            </button>
                        </div>
                        {pricePerUnit > 0 && (
                            <p className="text-[9px] font-bold text-white/30 text-center">
                                ${pricePerUnit} per {unitLabel.toLowerCase() || 'unit'}
                            </p>
                        )}
                        {bulkDiscount && currentValue >= bulkDiscount.threshold && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center">
                                <p className="text-[9px] font-black text-green-400 uppercase">{bulkDiscount.bannerText || `${bulkDiscount.discountPercent}% BULK DISCOUNT APPLIED!`}</p>
                            </div>
                        )}
                    </div>
                );

            case 'range':
            case 'slider':
                const rangeMin = section.stepperConfig?.min || 0;
                const rangeMax = section.stepperConfig?.max || 100;
                const rangeStep = section.stepperConfig?.step || 1;
                const rangeUnit = section.stepperConfig?.unitLabel || '';
                const rangePricePerUnit = section.stepperConfig?.pricePerUnit || 0;
                const rangeValue = value || rangeMin;
                
                const percentage = ((rangeValue - rangeMin) / (rangeMax - rangeMin)) * 100;
                
                return (
                    <div className="space-y-4">
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min={rangeMin}
                                max={rangeMax}
                                step={rangeStep}
                                value={rangeValue}
                                onChange={(e) => setSelectedOptions(prev => ({ ...prev, [section.id]: Number(e.target.value) }))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                style={{ 
                                    background: `linear-gradient(to right, #13c100 0%, #13c100 ${percentage}%, #2a2a2a ${percentage}%, #2a2a2a 100%)`
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-white/30">
                            <span>{rangeMin}{rangeUnit}</span>
                            <span className="text-white/60">{rangeValue}{rangeUnit}</span>
                            <span>{rangeMax}{rangeUnit}</span>
                        </div>
                        {rangePricePerUnit > 0 && (
                            <p className="text-[10px] font-bold text-white/40 text-center">
                                Total: ${(rangeValue * rangePricePerUnit).toFixed(2)}
                            </p>
                        )}
                    </div>
                );

            case 'text_input':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => setSelectedOptions(prev => ({ ...prev, [section.id]: e.target.value }))}
                        placeholder={section.placeholder || "Enter details..."}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                    />
                );

            default:
                return null;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/40 space-y-6 px-4">
            <Gamepad2 className="w-20 h-20 opacity-20" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-center">{error || "Service Not Found"}</h2>
            <p className="text-white/20 text-center max-w-md">The service you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/')} className="bg-primary text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary/80 transition-all">Return Home</button>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-black text-white font-['Outfit'] pt-28 pb-20 overflow-x-hidden">
            {/* Background Glow Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-[30%] -left-[20%] w-[80%] h-[50%] bg-primary/20 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[60%] h-[40%] bg-purple-500/10 blur-[150px] rounded-full"></div>
            </div>
            
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
                
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-white/20 overflow-x-auto pb-2 no-scrollbar">
                    <Link to="/" className="hover:text-primary transition-colors">HOME</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/games" className="hover:text-primary transition-colors">GAMES</Link>
                    <ChevronRight className="w-3 h-3" />
                    {service.gameId && (
                        <>
                            <Link to={`/game/${service.gameId.slug}`} className="hover:text-primary transition-colors">{service.gameId.name}</Link>
                            <ChevronRight className="w-3 h-3" />
                        </>
                    )}
                    <span className="text-white/60 truncate">{service.title}</span>
                </nav>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-start gap-4">
                        <div className="w-1.5 h-12 bg-primary rounded-full"></div>
                        <div>
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                {service.isFeatured && (
                                    <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-wider">🔥 FEATURED</span>
                                )}
                                {service.is_hot_offer && (
                                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[9px] font-black text-red-400 uppercase tracking-wider">⚡ HOT OFFER</span>
                                )}
                                {service.cashbackPercent > 0 && (
                                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-[9px] font-black text-green-400 uppercase tracking-wider">💰 {service.cashbackPercent}% CASHBACK</span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.1]">{service.title}</h1>
                            {service.shortDescription && (
                                <p className="text-white/40 text-sm md:text-base font-medium mt-4 max-w-2xl">{service.shortDescription}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Heart className="w-5 h-5 text-white/60" />
                        </button>
                        <button className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Share2 className="w-5 h-5 text-white/60" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-20">
                    
                    {/* LEFT COLUMN - Media & Details */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* Hero Image Section */}
                        <div className="relative h-[400px] md:h-[480px] rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900 to-black group shadow-2xl">
                            {(service.backgroundImage || service.image) && (
                                <img 
                                    src={getImageUrl(service.backgroundImage || service.image)} 
                                    className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105" 
                                    alt=""
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            
                            {service.icon && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full"></div>
                                        <img 
                                            src={getImageUrl(service.icon)} 
                                            className="relative h-48 md:h-64 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" 
                                            alt={service.title}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex justify-between items-end">
                                <div className="flex gap-4">
                                    {service.estimatedStartTime && (
                                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase">{service.estimatedStartTime} start</span>
                                        </div>
                                    )}
                                    {service.orders_count > 0 && (
                                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                                            <Trophy className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase">{service.orders_count}+ orders</span>
                                        </div>
                                    )}
                                </div>
                                {service.reviewsCount > 0 && (
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${service.rating && i < Math.floor(service.rating) ? 'text-primary fill-primary' : 'text-white/20'}`} />
                                        ))}
                                        <span className="text-[10px] font-bold text-white/40 ml-2">({service.reviewsCount})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Platform & Region Selectors */}
                        {(service.platforms?.length > 0 || service.regions?.length > 0) && (
                            <div className="grid grid-cols-2 gap-4">
                                {service.platforms?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><Monitor className="w-3 h-3" /> Platform</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {service.platforms.map(platform => (
                                                <button
                                                    key={platform}
                                                    onClick={() => setSelectedPlatform(platform)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                                        selectedPlatform === platform 
                                                            ? 'bg-primary text-black' 
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {service.regions?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><Globe className="w-3 h-3" /> Region</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {service.regions.map(region => (
                                                <button
                                                    key={region}
                                                    onClick={() => setSelectedRegion(region)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                                        selectedRegion === region 
                                                            ? 'bg-primary text-black' 
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tabs for Overview/Requirements/Features */}
                        <div className="space-y-6">
                            <div className="flex gap-1 border-b border-white/10">
                                {['overview', 'requirements', 'features'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                                            activeTab === tab 
                                                ? 'text-primary border-b-2 border-primary' 
                                                : 'text-white/30 hover:text-white/60'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="min-h-[200px]">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div dangerouslySetInnerHTML={{ __html: service.description }} className="text-white/40 font-medium leading-relaxed" />
                                        {service.deliveryTime && (
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                                                <Clock className="w-8 h-8 text-primary/60" />
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase">Delivery Time</p>
                                                    <p className="text-lg font-bold text-white">{service.deliveryTime} hours</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'requirements' && (
                                    <div className="space-y-4">
                                        {service.requirements?.length > 0 ? (
                                            <ul className="space-y-3">
                                                {service.requirements.map((req, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-white/60 font-medium">
                                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                                        {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-white/40">No specific requirements. Just your game account ready to go!</p>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {service.features?.length > 0 ? (
                                            service.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-white/80">{feature}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-white/80">100% Secure & Safe</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-white/80">24/7 Customer Support</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-white/80">Professional Players</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-white/80">Money-Back Guarantee</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Dynamic Sidebar Options (Form Builder) */}
                    <div className="lg:col-span-3 space-y-6 sticky top-24">
                        {(() => {
                            // Unified check for different sidebar data sources
                            const sections = service.sidebarSections?.length > 0 
                                ? service.sidebarSections 
                                : (service.dynamicFields?.length > 0 ? service.dynamicFields : service.serviceOptions);
                            
                            if (sections && Array.isArray(sections) && sections.length > 0) {
                                return (
                                    <div className="bg-[#0A0A0A] rounded-[32px] border border-white/10 p-6 space-y-8 max-h-[650px] overflow-y-auto custom-scrollbar">
                                        <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                            <Package className="w-5 h-5 text-primary" />
                                            Customize Your Order
                                        </h3>
                                        
                                        {sections
                                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                            .map((section) => (
                                                <div key={section.id || section.fieldId || section._id} className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40">
                                                            {section.heading || section.label || section.name}
                                                            {section.required && <span className="text-primary ml-1">*</span>}
                                                        </h4>
                                                    </div>
                                                    {renderFormField(section)}
                                                </div>
                                            ))}
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-[#0A0A0A] rounded-[32px] border border-white/10 p-8 text-center">
                                    <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40 text-sm">No customization options available</p>
                                    <p className="text-white/20 text-xs mt-1">Standard service will be delivered</p>
                                </div>
                            );
                        })()}
                    </div>

                    {/* RIGHT COLUMN - Cart/Purchase Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-payment-method rounded-[32px] border border-white/10 overflow-hidden sticky top-24">
                            <div className="p-6 space-y-6">
                                {/* Price Display */}
                                <div className="text-center pb-4 border-b border-white/10">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Total Price</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl md:text-6xl font-black text-white">{totalPrice}</span>
                                        <span className="text-2xl font-black text-white">$</span>
                                    </div>
                                    {service.pricing?.discountPercent > 0 && (
                                        <p className="text-[10px] font-bold text-green-400 mt-1">
                                            {service.pricing.discountPercent}% OFF applied!
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                        <ArrowUpDown className="w-3 h-3" /> Quantity
                                    </label>
                                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-2 border border-white/10">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 text-white font-black transition-all"
                                        >
                                            -
                                        </button>
                                        <div className="text-center">
                                            <span className="font-black text-xl text-white">{quantity}</span>
                                            {quantity > 1 && (
                                                <span className="text-[9px] font-bold text-green-400 block">-5% bulk discount</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 text-white font-black transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Speed Options */}
                                {(service.speedOptions?.express?.enabled || service.speedOptions?.superExpress?.enabled) && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Speed Priority
                                        </label>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setSpeed("normal")}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                    speed === "normal" 
                                                        ? 'bg-primary/10 border-primary/50' 
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${speed === "normal" ? 'bg-primary' : 'bg-white/20'}`}></div>
                                                    <span className="text-xs font-bold uppercase">Normal</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-white/40">Included</span>
                                            </button>
                                            {service.speedOptions?.express?.enabled && (
                                                <button
                                                    onClick={() => setSpeed("express")}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                        speed === "express" 
                                                            ? 'bg-primary/10 border-primary/50' 
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${speed === "express" ? 'bg-primary' : 'bg-white/20'}`}></div>
                                                        <span className="text-xs font-bold uppercase">Express</span>
                                                        {service.speedOptions.express.tooltip && (
                                                            <div className="relative group">
                                                                <Info className="w-3 h-3 text-white/30 cursor-help" />
                                                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/90 text-[8px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    {service.speedOptions.express.tooltip}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary">+${service.speedOptions.express.priceModifier || 0}</span>
                                                </button>
                                            )}
                                            {service.speedOptions?.superExpress?.enabled && (
                                                <button
                                                    onClick={() => setSpeed("superExpress")}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                        speed === "superExpress" 
                                                            ? 'bg-primary/10 border-primary/50' 
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${speed === "superExpress" ? 'bg-primary' : 'bg-white/20'}`}></div>
                                                        <span className="text-xs font-bold uppercase">Super Express</span>
                                                        {service.speedOptions.superExpress.tooltip && (
                                                            <div className="relative group">
                                                                <Info className="w-3 h-3 text-white/30 cursor-help" />
                                                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/90 text-[8px] text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    {service.speedOptions.superExpress.tooltip}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary">+${service.speedOptions.superExpress.priceModifier || 0}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2">
                                    <button 
                                        onClick={handleBuyNow}
                                        className="w-full bg-primary text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_15px_40px_rgba(19,193,0,0.4)] flex items-center justify-center gap-3 active:scale-95 group border-none"
                                    >
                                        Buy Now <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                    <button className="w-full bg-transparent hover:bg-white/5 text-white/60 font-bold uppercase tracking-widest py-3 rounded-xl transition-all text-[10px] flex items-center justify-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Contact Support
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Shield className="w-4 h-4 text-primary/60" />
                                            <span className="text-[8px] font-black text-white/30 uppercase">Secure Payment</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Clock className="w-4 h-4 text-primary/60" />
                                            <span className="text-[8px] font-black text-white/30 uppercase">24/7 Support</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Users className="w-4 h-4 text-primary/60" />
                                            <span className="text-[8px] font-black text-white/30 uppercase">Pro Players</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <Award className="w-4 h-4 text-primary/60" />
                                            <span className="text-[8px] font-black text-white/30 uppercase">Money Back</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RELATED SERVICES SECTION */}
                {relatedServices.length > 0 && (
                    <div className="mt-20 pt-8 border-t border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">You May Also Like</h2>
                            <Link to={`/game/${service.gameId?.slug}`} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                            {relatedServices.map((rel) => (
                                <div
                                    key={rel._id}
                                    onClick={() => navigate(`/products/${rel.slug || rel._id}`)}
                                    className="group relative h-64 rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-primary/50 transition-all duration-500 bg-gradient-to-br from-gray-900 to-black"
                                >
                                    {(rel.backgroundImage || rel.image) && (
                                        <img
                                            src={getImageUrl(rel.backgroundImage || rel.image)}
                                            className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-110"
                                            alt=""
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                    
                                    {rel.icon && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <img
                                                src={getImageUrl(rel.icon)}
                                                alt=""
                                                className="w-24 h-24 object-contain opacity-80 group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h4 className="text-sm font-black text-white uppercase group-hover:text-primary transition-colors line-clamp-1">
                                            {rel.title}
                                        </h4>
                                        <p className="text-[10px] font-black text-white/40 uppercase mt-1">
                                            From ${rel.price || rel.pricing?.basePrice || 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Sections */}
                <div className="mt-20">
                    <DetailBanner />
                </div>
                
                <div className="mt-16">
                    <PaymentMethods />
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                input[type="range"] {
                    -webkit-appearance: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #13c100;
                    cursor: pointer;
                    box-shadow: 0 0 10px #13c100;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(19, 193, 0, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(19, 193, 0, 0.5);
                }
            `}</style>
            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
                total={totalPrice}
                onConfirm={confirmBuyNow}
            />
        </>
    );
};

export default ProductDetail;