import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, Upload, Image as ImageIcon, Save, Plus, Trash2, DollarSign, Wrench, HelpCircle, FileText, ChevronDown } from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';
import CategoryForm from './CategoryForm';

const SERVICE_TYPES = [
    { value: 'boosting', label: 'Boosting', description: 'Rank/Level boosting services' },
    { value: 'coaching', label: 'Coaching', description: 'Player coaching and training' },
    { value: 'accounts', label: 'Accounts', description: 'Account sales' },
    { value: 'items', label: 'Items', description: 'In-game items and currency' },
    { value: 'packs', label: 'Packs', description: 'Package deals' },
    { value: 'misc', label: 'Miscellaneous', description: 'Other services' }
];

const PRICING_TYPES = [
    { value: 'fixed', label: 'Fixed Price', description: 'Single fixed price' },
    { value: 'per_level', label: 'Per Level', description: 'Price per level/rank' },
    { value: 'per_win', label: 'Per Win', description: 'Price per win' },
    { value: 'hourly', label: 'Hourly', description: 'Price per hour' },
    { value: 'tiered', label: 'Tiered', description: 'Multiple pricing tiers' },
    { value: 'dynamic', label: 'Dynamic', description: 'Dynamic pricing' }
];

const AVAILABLE_PLATFORMS = ['PC', 'PS4', 'PS5', 'Xbox', 'Mobile', 'Switch', 'Any'];
const AVAILABLE_REGIONS = ['EU', 'US', 'Oceanic', 'Asia', 'Global', 'Any'];

const ServiceForm = ({ service, games, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        gameId: '',
        categoryId: '',
        serviceType: 'boosting',
        icon: '',
        dynamicFields: [],
        pricing: {
            type: 'fixed',
            basePrice: 0,
            pricePerUnit: 0,
            minPrice: 0,
            maxPrice: 0,
            discountPercent: 0,
            tiers: [],
            dynamicConfig: {
                enabled: false,
                formula: '',
                variables: {}
            }
        },
        deliveryTime: 24,
        deliveryTimeText: '',
        features: [],
        requirements: [],
        platforms: [],
        regions: [],
        serviceOptions: [],
        isActive: true,
        status: 'active',
        displayOrder: 0,
        isFeatured: false,
        tags: [],
        boostType: 'both',
        boostCategory: 'rank-boost',
        faqs: []
    });

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categories, setCategories] = useState([]);
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newTag, setNewTag] = useState('');

    const fetchCategories = async () => {
        if (!formData.gameId) {
            setCategories([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/v1/categories/game/${formData.gameId}`);
            setCategories(res.data.data);
            if (formData.categoryId && !res.data.data.find(c => c._id === formData.categoryId)) {
                setFormData(prev => ({ ...prev, categoryId: '' }));
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [formData.gameId]);

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.title || service.name || '',
                description: service.description || '',
                shortDescription: service.shortDescription || '',
                gameId: service.gameId?._id || service.gameId || '',
                categoryId: service.categoryId?._id || service.categoryId || '',
                serviceType: service.serviceType || 'boosting',
                icon: service.icon || '',
                dynamicFields: service.dynamicFields || [],
                pricing: service.pricing || {
                    type: 'fixed',
                    basePrice: 0,
                    pricePerUnit: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    discountPercent: 0,
                    tiers: [],
                    dynamicConfig: {
                        enabled: false,
                        formula: '',
                        variables: {}
                    }
                },
                deliveryTime: service.deliveryTime || 24,
                deliveryTimeText: service.deliveryTimeText || '',
                features: service.features || [],
                requirements: service.requirements || [],
                platforms: service.platforms || [],
                regions: service.regions || [],
                serviceOptions: service.serviceOptions || [],
                isActive: service.isActive !== false,
                status: service.status || 'active',
                displayOrder: service.displayOrder || 0,
                isFeatured: service.isFeatured || false,
                tags: service.tags || [],
                boostType: service.boostType || 'both',
                boostCategory: service.boostCategory || 'rank-boost',
                faqs: service.faqs || []
            });
            setIconPreview(getImageUrl(service.icon || ''));
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('pricing.')) {
            const pricingField = name.replace('pricing.', '');
            setFormData(prev => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    [pricingField]: type === 'number' ? parseFloat(value) || 0 : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Icon must be less than 5MB');
                return;
            }
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const togglePlatform = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    const toggleRegion = (region) => {
        setFormData(prev => ({
            ...prev,
            regions: prev.regions.includes(region)
                ? prev.regions.filter(r => r !== region)
                : [...prev.regions, region]
        }));
    };

    const addServiceOption = () => {
        setFormData(prev => ({
            ...prev,
            serviceOptions: [
                ...prev.serviceOptions,
                { name: 'New Option', type: 'dropdown', choices: [], min: 0, max: 0, step: 1 }
            ]
        }));
    };

    const updateServiceOption = (index, field, value) => {
        setFormData(prev => {
            const newOptions = [...prev.serviceOptions];
            newOptions[index] = { ...newOptions[index], [field]: value };
            return { ...prev, serviceOptions: newOptions };
        });
    };

    const removeServiceOption = (index) => {
        setFormData(prev => ({
            ...prev,
            serviceOptions: prev.serviceOptions.filter((_, i) => i !== index)
        }));
    };

    const addOptionChoice = (optionIndex) => {
        setFormData(prev => {
            const newOptions = [...prev.serviceOptions];
            newOptions[optionIndex].choices.push({ label: 'New Choice', addPrice: 0, multiplier: 1 });
            return { ...prev, serviceOptions: newOptions };
        });
    };

    const updateOptionChoice = (optionIndex, choiceIndex, field, value) => {
        setFormData(prev => {
            const newOptions = [...prev.serviceOptions];
            newOptions[optionIndex].choices[choiceIndex] = {
                ...newOptions[optionIndex].choices[choiceIndex],
                [field]: (field === 'addPrice' || field === 'multiplier') ? parseFloat(value) || 0 : value
            };
            return { ...prev, serviceOptions: newOptions };
        });
    };

    const removeOptionChoice = (optionIndex, choiceIndex) => {
        setFormData(prev => {
            const newOptions = [...prev.serviceOptions];
            newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter((_, i) => i !== choiceIndex);
            return { ...prev, serviceOptions: newOptions };
        });
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            setFormData(prev => ({
                ...prev,
                requirements: [...prev.requirements, newRequirement.trim()]
            }));
            setNewRequirement('');
        }
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const [newDynamicField, setNewDynamicField] = useState({
        label: '',
        fieldType: 'select',
        required: false,
        options: [],
        rangeConfig: { min: 0, max: 100, step: 1, unit: '' }
    });

    const addDynamicField = () => {
        if (!newDynamicField.label.trim()) return;
        const fieldId = `field_${Date.now()}`;
        const field = {
            fieldId,
            label: newDynamicField.label.trim(),
            fieldType: newDynamicField.fieldType,
            required: newDynamicField.required,
            options: newDynamicField.options,
            rangeConfig: newDynamicField.fieldType === 'range' ? newDynamicField.rangeConfig : undefined,
            displayOrder: formData.dynamicFields.length
        };
        setFormData(prev => ({
            ...prev,
            dynamicFields: [...prev.dynamicFields, field]
        }));
        setNewDynamicField({
            label: '',
            fieldType: 'select',
            required: false,
            options: [],
            rangeConfig: { min: 0, max: 100, step: 1, unit: '' }
        });
    };

    const removeDynamicField = (index) => {
        setFormData(prev => ({
            ...prev,
            dynamicFields: prev.dynamicFields.filter((_, i) => i !== index)
        }));
    };

    const addOptionToField = () => {
        setNewDynamicField(prev => ({
            ...prev,
            options: [...prev.options, { value: '', label: '', priceModifier: 0, default: false }]
        }));
    };

    const updateOption = (index, field, value) => {
        const options = [...newDynamicField.options];
        options[index] = { ...options[index], [field]: value };
        setNewDynamicField(prev => ({ ...prev, options }));
    };

    const removeOption = (index) => {
        setNewDynamicField(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim().toLowerCase()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                tiers: [
                    ...prev.pricing.tiers,
                    { name: '', description: '', price: 0, multiplier: 1 }
                ]
            }
        }));
    };

    const updateTier = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                tiers: prev.pricing.tiers.map((tier, i) =>
                    i === index ? { ...tier, [field]: field === 'price' || field === 'multiplier' ? parseFloat(value) || 0 : value } : tier
                )
            }
        }));
    };

    const removeTier = (index) => {
        setFormData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                tiers: prev.pricing.tiers.filter((_, i) => i !== index)
            }
        }));
    };

    const addFAQ = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...(prev.faqs || []), { question: '', answer: '' }]
        }));
    };

    const updateFAQ = (index, field, value) => {
        setFormData(prev => {
            const newFaqs = [...(prev.faqs || [])];
            newFaqs[index] = { ...newFaqs[index], [field]: value };
            return { ...prev, faqs: newFaqs };
        });
    };

    const removeFAQ = (index) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (['pricing', 'features', 'requirements', 'tags', 'platforms', 'regions', 'serviceOptions', 'faqs', 'dynamicFields', 'meta'].includes(key)) {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else if (key !== 'icon') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            if (iconFile) {
                formDataToSend.append('icon', iconFile);
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            if (service) {
                await axios.put(
                    `${API_URL}/api/v1/services/admin/${service._id}`,
                    formDataToSend,
                    config
                );
            } else {
                await axios.post(
                    `${API_URL}/api/v1/services/admin`,
                    formDataToSend,
                    config
                );
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            const details = err.response?.data?.details;
            if (details && Array.isArray(details)) {
                setError(details.join(', '));
            } else {
                const errorMsg = err.response?.data?.error || err.message || 'Something went wrong';
                setError(errorMsg);
            }
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[999] p-4 overflow-y-auto custom-scrollbar">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] p-6 md:p-12 max-w-5xl w-full my-4 md:my-10 relative shadow-2xl overflow-hidden">
                {/* Visual Backdrop Polish */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

                <div className="flex items-center justify-between mb-10 relative">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group shrink-0">
                            <Wrench className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">
                                    {service ? 'Modify Service' : 'Initialize Service'}
                                </h2>
                                {service && (
                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-black uppercase tracking-widest text-primary">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">ID:</span>
                                    <span className="text-[10px] text-white/40 font-mono font-bold tracking-tight bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {service?._id || 'NEW_ENTRY'}
                                    </span>
                                </div>
                                <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Slug:</span>
                                    <span className="text-[10px] text-primary/60 font-bold tracking-tight italic">
                                        {service?.slug || 'will-be-generated'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[20px] transition-all text-white/40 hover:text-white group"
                        title="Close Overlay"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Service Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., Rank Boosting - Diamond to Master"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Select Game *</label>
                            <select
                                name="gameId"
                                value={formData.gameId}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                <option value="">Select a game...</option>
                                {games.map(game => (
                                    <option key={game._id} value={game._id}>{game.title || game.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest">Select Category *</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryForm(true)}
                                    disabled={!formData.gameId}
                                    className="text-[10px] font-black text-primary hover:text-white uppercase disabled:opacity-30 flex items-center gap-1"
                                >
                                    <Plus className="w-2.5 h-2.5" /> Add Category
                                </button>
                            </div>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                                disabled={!formData.gameId}
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none disabled:opacity-30"
                            >
                                <option value="">{formData.gameId ? 'Select a category...' : 'Select a game first'}</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Short Description</label>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                maxLength={200}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="Brief description for cards and lists"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Full Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none resize-none"
                                placeholder="Detailed description of the service..."
                            />
                        </div>
                        <div className="md:col-span-2 border-t border-white/5 pt-10 mt-6 relative">
                            <h3 className="text-xl font-black italic text-white uppercase mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                Basic Classification
                            </h3>
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-1">Service Type</label>
                            <div className="relative group">
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[#111] border border-white/5 rounded-2xl text-sm font-bold text-white/80 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none group-hover:border-white/10"
                                >
                                    {SERVICE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                        {(formData.serviceType === 'boosting' || formData.serviceType === 'coaching') && (
                            <>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-1">Boost Type</label>
                                    <div className="relative group">
                                        <select
                                            name="boostType"
                                            value={formData.boostType}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-[#111] border border-white/5 rounded-2xl text-sm font-bold text-white/80 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none group-hover:border-white/10"
                                        >
                                            <option value="both">Both (Piloted & Self-Play)</option>
                                            <option value="piloted">Piloted Only</option>
                                            <option value="self-play">Self-Play Only</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-1">Boost Category</label>
                                    <div className="relative group">
                                        <select
                                            name="boostCategory"
                                            value={formData.boostCategory}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-[#111] border border-white/5 rounded-2xl text-sm font-bold text-white/80 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none group-hover:border-white/10"
                                        >
                                            <option value="rank-boost">Rank Boost</option>
                                            <option value="raid-boost">Raid Boost</option>
                                            <option value="dungeon-boost">Dungeon Boost</option>
                                            <option value="pvp-boost">PvP Boost</option>
                                            <option value="coaching">Coaching</option>
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                                    </div>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Display Order</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                <option value="active">ACTIVE</option>
                                <option value="inactive">INACTIVE</option>
                                <option value="draft">DRAFT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Delivery Time (hours)</label>
                            <input
                                type="number"
                                name="deliveryTime"
                                value={formData.deliveryTime}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Delivery Time Text</label>
                            <input
                                type="text"
                                name="deliveryTimeText"
                                value={formData.deliveryTimeText}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., 1-2 days"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/50 peer-checked:after:bg-primary"></div>
                                </div>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Feature this service</span>
                            </label>
                        </div>
                        <div className="md:col-span-2 border-t border-white/5 pt-10 mt-6">
                            <h3 className="text-xl font-black italic text-white uppercase mb-6 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                </div>
                                Pricing Engine
                            </h3>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-1">Pricing Type Model</label>
                            <div className="relative group">
                                <select
                                    name="pricing.type"
                                    value={formData.pricing.type}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-[#111] border border-white/5 rounded-2xl text-sm font-bold text-white/80 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none group-hover:border-white/10"
                                >
                                    {PRICING_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                        </div>
                        {['fixed', 'tiered'].includes(formData.pricing.type) && (
                            <div>
                                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    name="pricing.basePrice"
                                    value={formData.pricing.basePrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                        )}
                        {['per_level', 'per_win', 'hourly'].includes(formData.pricing.type) && (
                            <div>
                                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Price Per Unit ($)</label>
                                <input
                                    type="number"
                                    name="pricing.pricePerUnit"
                                    value={formData.pricing.pricePerUnit}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Min Price ($)</label>
                            <input
                                type="number"
                                name="pricing.minPrice"
                                value={formData.pricing.minPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Max Price ($)</label>
                            <input
                                type="number"
                                name="pricing.maxPrice"
                                value={formData.pricing.maxPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Discount (%)</label>
                            <input
                                type="number"
                                name="pricing.discountPercent"
                                value={formData.pricing.discountPercent}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        {formData.pricing.type === 'tiered' && (
                            <div className="md:col-span-2">
                                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Pricing Tiers</label>
                                {formData.pricing.tiers.map((tier, index) => (
                                    <div key={index} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-2">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <input
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => updateTier(index, 'name', e.target.value)}
                                                className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white"
                                                placeholder="Tier Name"
                                            />
                                            <input
                                                type="text"
                                                value={tier.description}
                                                onChange={(e) => updateTier(index, 'description', e.target.value)}
                                                className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white"
                                                placeholder="Description"
                                            />
                                            <input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updateTier(index, 'price', e.target.value)}
                                                className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white"
                                                placeholder="Price"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={tier.multiplier}
                                                    onChange={(e) => updateTier(index, 'multiplier', e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white"
                                                    placeholder="Multiplier"
                                                />
                                                <button type="button" onClick={() => removeTier(index)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addTier} className="text-primary text-sm font-bold mt-2">+ Add Tier</button>
                            </div>
                        )}
                        <div className="md:col-span-2 border-t border-white/5 pt-6 mt-4">
                            <h3 className="text-lg font-black italic text-white uppercase mb-4 flex items-center gap-2">
                                <Wrench className="w-5 h-5" />
                                Service Configuration
                            </h3>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Platforms</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_PLATFORMS.map(platform => (
                                    <button
                                        key={platform}
                                        type="button"
                                        onClick={() => togglePlatform(platform)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.platforms.includes(platform)
                                            ? 'bg-primary/20 text-primary border border-primary/50'
                                            : 'bg-white/[0.02] text-white/60 border border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Regions</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_REGIONS.map(region => (
                                    <button
                                        key={region}
                                        type="button"
                                        onClick={() => toggleRegion(region)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.regions.includes(region)
                                            ? 'bg-primary/20 text-primary border border-primary/50'
                                            : 'bg-white/[0.02] text-white/60 border border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Features</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/50"
                                    placeholder="Add a feature..."
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.features.map((feature, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm text-white/80 flex items-center gap-2">
                                        {feature}
                                        <button type="button" onClick={() => removeFeature(index)} className="text-white/40 hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Requirements</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/50"
                                    placeholder="Add a requirement..."
                                />
                                <button
                                    type="button"
                                    onClick={addRequirement}
                                    className="px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.requirements.map((req, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-red-500/10 rounded-lg text-sm text-red-400/80 flex items-center gap-2 border border-red-500/20">
                                        {req}
                                        <button type="button" onClick={() => removeRequirement(index)} className="text-red-400/40 hover:text-red-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/50"
                                    placeholder="Add a tag..."
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-blue-500/10 rounded-lg text-sm text-blue-400/80 flex items-center gap-2 border border-blue-500/20">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(index)} className="text-blue-400/40 hover:text-blue-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-white/5 mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full md:flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all border border-white/5 hover:border-white/20"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:flex-1 px-8 py-5 bg-primary hover:bg-[#722AEE] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(147,51,234,0.3)] hover:shadow-[0_10px_35px_rgba(147,51,234,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {service ? 'Synchronize Updates' : 'Confirm & Initialize'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {showCategoryForm && (
                <CategoryForm
                    games={games}
                    onClose={() => setShowCategoryForm(false)}
                    onSuccess={fetchCategories}
                />
            )}
        </div>,
        document.getElementById('modal-root')
    );
};

export default ServiceForm;
