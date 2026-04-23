import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Layout, DollarSign, Calculator, Settings, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../utils/api';

const OfferForm = ({ offer, games, onClose }) => {
 const isEdit = !!offer;
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const [formData, setFormData] = useState({
 title: '',
 game: games[0]?.title || '',
 category: 'Services',
 image: '',
 price: 0,
 oldPrice: 0,
 discount: '',
 description: '',
 requirements: [''],
 features: [''],
 calculatorType: 'none',
 calculatorSettings: {
 min: 0,
 max: 100,
 unitName: 'Units',
 basePrice: 0,
 step: 1
 },
 options: [],
 isHot: false
 });

 useEffect(() => {
 if (offer) {
 setFormData({
 ...offer,
 requirements: offer.requirements || [''],
 features: offer.features || [''],
 calculatorSettings: offer.calculatorSettings || { min: 0, max: 100, unitName: 'Units', basePrice: 0, step: 1 },
 options: offer.options || [],
 isHot: offer.isHot || false
 });
 }
 }, [offer]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 const token = localStorage.getItem('token');
 const data = {
 ...formData,
 price: Number(formData.price),
 oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
 calculatorSettings: {
 ...formData.calculatorSettings,
 min: Number(formData.calculatorSettings.min),
 max: Number(formData.calculatorSettings.max),
 basePrice: Number(formData.calculatorSettings.basePrice),
 step: Number(formData.calculatorSettings.step)
 }
 };

 if (isEdit) {
 await axios.put(`${API_URL}/api/v1/offers/admin/${offer._id}`, data, {
 headers: { Authorization: `Bearer ${token}` }
 });
 } else {
 await axios.post(`${API_URL}/api/v1/offers/admin`, data, {
 headers: { Authorization: `Bearer ${token}` }
 });
 }
 onClose();
 } catch (err) {
 setError(err.response?.data?.error || 'Failed to save offer');
 } finally {
 setLoading(false);
 }
 };

 const addListField = (field) => {
 setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
 };

 const updateListField = (field, index, value) => {
 const newList = [...formData[field]];
 newList[index] = value;
 setFormData(prev => ({ ...prev, [field]: newList }));
 };

 const removeListField = (field, index) => {
 setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
 };

 const addOption = () => {
 setFormData(prev => ({
 ...prev,
 options: [...prev.options, { name: 'New Option', type: 'radio', choices: [{ label: 'Standard', priceModifier: 0 }] }]
 }));
 };

 return (
 <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[250] p-4 lg:p-10">
 <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-[1000px] h-full lg:h-auto lg:max-h-[90vh] rounded-[48px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">

 {/* Header */}
 <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
 <Plus className="w-6 h-6 text-primary" />
 </div>
 <div>
 <h2 className="text-xl font-black uppercase tracking-tighter text-white">
 {isEdit ? 'Update Service' : 'Create New Service'}
 </h2>
 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
 {isEdit ? `Editing: ${offer.title}` : 'Fill in the service details below'}
 </p>
 </div>
 </div>
 <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-white/30 hover:text-white">
 <X className="w-6 h-6" />
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
 {error && (
 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
 {error}
 </div>
 )}

 {/* Section 1: Basic Info */}
 <div className="space-y-8">
 <div className="flex items-center gap-3">
 <Layout className="w-4 h-4 text-primary" />
 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Basic Information</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Service Title</label>
 <input
 required
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
 placeholder="e.g. Mythic+ Dungeon Boost"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Game Category</label>
 <select
 value={formData.game}
 onChange={(e) => setFormData({ ...formData, game: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none"
 >
 {games.map(g => <option key={g._id} value={g.title}>{g.title}</option>)}
 </select>
 </div>
 </div>
 <div className="flex items-center gap-4 p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
 <label className="flex items-center gap-4 cursor-pointer group">
 <div className="relative">
 <input
 type="checkbox"
 checked={formData.isHot}
 onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500/50 peer-checked:after:bg-orange-500"></div>
 </div>
 <div className="flex flex-col">
 <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Hot right now</span>
 <span className="text-[9px] font-bold text-white/20 uppercase">Featured in the Home Page "Hot" section</span>
 </div>
 </label>
 </div>
 </div>

 {/* Section 2: Pricing */}
 <div className="space-y-8">
 <div className="flex items-center gap-3">
 <DollarSign className="w-4 h-4 text-green-500" />
 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Pricing & Display</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Base Price (USD)</label>
 <input
 type="number"
 required
 value={formData.price}
 onChange={(e) => setFormData({ ...formData, price: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Old Price (Optional)</label>
 <input
 type="number"
 value={formData.oldPrice}
 onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Image URL</label>
 <div className="relative">
 <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 required
 value={formData.image}
 onChange={(e) => setFormData({ ...formData, image: e.target.value })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
 placeholder="https://..."
 />
 </div>
 </div>
 </div>
 </div>

 {/* Section 3: Calculator Logic */}
 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-8">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Calculator className="w-5 h-5 text-primary" />
 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Dynamic Calculator</h3>
 </div>
 <select
 value={formData.calculatorType}
 onChange={(e) => setFormData({ ...formData, calculatorType: e.target.value })}
 className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary outline-none"
 >
 <option value="none">Disabled</option>
 <option value="slider">Price Slider</option>
 <option value="range">Range Selection</option>
 </select>
 </div>

 {formData.calculatorType !== 'none' && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Min Value</label>
 <input
 type="number"
 value={formData.calculatorSettings.min}
 onChange={(e) => setFormData({ ...formData, calculatorSettings: { ...formData.calculatorSettings, min: e.target.value } })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Max Value</label>
 <input
 type="number"
 value={formData.calculatorSettings.max}
 onChange={(e) => setFormData({ ...formData, calculatorSettings: { ...formData.calculatorSettings, max: e.target.value } })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Price Per Unit</label>
 <input
 type="number"
 value={formData.calculatorSettings.basePrice}
 onChange={(e) => setFormData({ ...formData, calculatorSettings: { ...formData.calculatorSettings, basePrice: e.target.value } })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Unit Name</label>
 <input
 value={formData.calculatorSettings.unitName}
 onChange={(e) => setFormData({ ...formData, calculatorSettings: { ...formData.calculatorSettings, unitName: e.target.value } })}
 className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 placeholder="e.g. Level"
 />
 </div>
 </div>
 )}
 </div>

 {/* Section 4: Features & Req */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Service Features</h3>
 <button type="button" onClick={() => addListField('features')} className="text-primary hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
 </div>
 <div className="space-y-3">
 {formData.features.map((f, i) => (
 <div key={i} className="flex gap-2">
 <input
 value={f}
 onChange={(e) => updateListField('features', i, e.target.value)}
 className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 placeholder="Feature..."
 />
 <button type="button" onClick={() => removeListField('features', i)} className="p-3 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
 </div>
 ))}
 </div>
 </div>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Requirements</h3>
 <button type="button" onClick={() => addListField('requirements')} className="text-primary hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
 </div>
 <div className="space-y-3">
 {formData.requirements.map((r, i) => (
 <div key={i} className="flex gap-2">
 <input
 value={r}
 onChange={(e) => updateListField('requirements', i, e.target.value)}
 className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none"
 placeholder="Requirement..."
 />
 <button type="button" onClick={() => removeListField('requirements', i)} className="p-3 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
 </div>
 ))}
 </div>
 </div>
 </div>
 </form>

 {/* Footer Actions */}
 <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4 shrink-0">
 <button
 type="button"
 onClick={onClose}
 className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
 >
 Discard
 </button>
 <button
 onClick={handleSubmit}
 disabled={loading}
 className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
 >
 {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
 <Save className="w-4 h-4" />
 {isEdit ? 'Save Changes' : 'Launch Service'}
 </button>
 </div>
 </div>
 </div>
 );
};

export default OfferForm;
