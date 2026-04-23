import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, DollarSign, Clock, Globe, Truck, Save } from 'lucide-react';
import { API_URL } from '../../utils/api';

const REGIONS = ['US', 'EU', 'Oceanic', 'Asia', 'Global', 'Any'];
const METHODS = [
 { value: 'face-to-face', label: 'Face to Face' },
 { value: 'mail', label: 'In-Game Mail' },
 { value: 'auction-house', label: 'Auction House' },
 { value: 'cod', label: 'Cash on Delivery (CoD)' },
 { value: 'direct-trade', label: 'Direct Trade' }
];

const CurrencyForm = ({ listing, games, onClose, onSuccess }) => {
 const [formData, setFormData] = useState({
 gameId: '',
 currencyType: 'Gold',
 region: 'Global',
 server: '',
 pricePerUnit: 0.01,
 minQuantity: 1000,
 maxQuantity: 1000000,
 defaultDeliveryMethod: 'mail',
 estimatedDeliveryHours: 1,
 deliveryTimeText: '15-60 minutes',
 status: 'active'
 });

 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (listing) {
 setFormData({
 gameId: listing.gameId?._id || listing.gameId || '',
 currencyType: listing.currencyType || 'Gold',
 region: listing.region || 'Global',
 server: listing.server || '',
 pricePerUnit: listing.pricePerUnit || 0.01,
 minQuantity: listing.minQuantity || 1000,
 maxQuantity: listing.maxQuantity || 1000000,
 defaultDeliveryMethod: listing.defaultDeliveryMethod || 'mail',
 estimatedDeliveryHours: listing.estimatedDeliveryHours || 1,
 deliveryTimeText: listing.deliveryTimeText || '15-60 minutes',
 status: listing.status || 'active'
 });
 }
 }, [listing]);

 const handleChange = (e) => {
 const { name, value, type } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'number' ? parseFloat(value) || 0 : value
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const token = localStorage.getItem('token');
 const config = {
 headers: { Authorization: `Bearer ${token}` }
 };

 if (listing) {
 await axios.put(`${API_URL}/api/v1/currencies/admin/${listing._id}`, formData, config);
 } else {
 await axios.post(`${API_URL}/api/v1/currencies/admin`, formData, config);
 }

 if (onSuccess) onSuccess();
 onClose();
 } catch (err) {
 setError(err.response?.data?.error || 'Failed to save currency listing');
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[1000] p-4 overflow-y-auto">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 md:p-10 max-w-4xl w-full my-4 md:my-10 relative">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
 {listing ? 'Edit Currency' : 'Add New Currency'}
 </h2>
 <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Configure game currency listings</p>
 </div>
 <button onClick={onClose} className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all text-white/40 hover:text-white">
 <X className="w-6 h-6" />
 </button>
 </div>

 {error && (
 <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Select Game *</label>
 <select
 name="gameId"
 value={formData.gameId}
 onChange={handleChange}
 required
 className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50"
 >
 <option value="">Select a game...</option>
 {games.map(game => (
 <option key={game._id} value={game._id}>{game.title}</option>
 ))}
 </select>
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Currency Name (Type)</label>
 <input
 type="text"
 name="currencyType"
 value={formData.currencyType}
 onChange={handleChange}
 required
 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 placeholder="e.g. Gold, Coins, Gems"
 />
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Region</label>
 <select
 name="region"
 value={formData.region}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 >
 {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
 </select>
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Server Name</label>
 <input
 type="text"
 name="server"
 value={formData.server}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 placeholder="e.g. EU West, Server 1"
 />
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Price Per Unit ($)</label>
 <div className="relative">
 <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
 <input
 type="number"
 step="0.0001"
 name="pricePerUnit"
 value={formData.pricePerUnit}
 onChange={handleChange}
 required
 className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 />
 </div>
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Delivery Method</label>
 <select
 name="defaultDeliveryMethod"
 value={formData.defaultDeliveryMethod}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 >
 {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
 </select>
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Min Quantity</label>
 <input
 type="number"
 name="minQuantity"
 value={formData.minQuantity}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 />
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Max Quantity</label>
 <input
 type="number"
 name="maxQuantity"
 value={formData.maxQuantity}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 />
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">ETA (Hours)</label>
 <div className="relative">
 <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
 <input
 type="number"
 name="estimatedDeliveryHours"
 value={formData.estimatedDeliveryHours}
 onChange={handleChange}
 className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 />
 </div>
 </div>

 <div className="md:col-span-1">
 <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">ETA Text</label>
 <input
 type="text"
 name="deliveryTimeText"
 value={formData.deliveryTimeText}
 onChange={handleChange}
 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
 placeholder="e.g. 15-30 minutes"
 />
 </div>

 <div className="md:col-span-2 pt-6 border-t border-white/5 flex gap-4">
 <button
 type="submit"
 disabled={loading}
 className="flex-1 md:flex-none px-12 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
 >
 <Save className="w-4 h-4" />
 {loading ? 'SAVING...' : (listing ? 'UPDATE LISTING' : 'CREATE LISTING')}
 </button>
 <button
 type="button"
 onClick={onClose}
 className="flex-1 md:flex-none px-12 py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
 >
 CANCEL
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default CurrencyForm;
