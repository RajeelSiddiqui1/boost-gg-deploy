import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, Briefcase, AlertCircle, CheckCircle2, Search, DollarSign, Globe, Truck, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import CurrencyForm from '../../components/admin/CurrencyForm';
import { API_URL } from '../../utils/api';

const AdminCurrency = () => {
 const [listings, setListings] = useState([]);
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingListing, setEditingListing] = useState(null);
 const [notification, setNotification] = useState(null);

 const [formData, setFormData] = useState({}); // Not directly used for the new form, but kept for state if needed

 const notify = (type, message) => {
 setNotification({ type, message });
 setTimeout(() => setNotification(null), 3000);
 };

 const fetchGames = async () => {
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/games/admin/all`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setGames(res.data.data);
 } catch (err) {
 console.error(err);
 }
 };

 const fetchListings = async () => {
 try {
 setLoading(true);
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/currencies/admin/all`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setListings(res.data.data);
 setLoading(false);
 } catch (err) {
 notify('error', 'Failed to fetch currency listings');
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchGames();
 fetchListings();
 }, []);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
 }));
 };

 const handleFormClose = () => {
 setShowForm(false);
 setEditingListing(null);
 fetchListings();
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this listing?')) return;
 const token = localStorage.getItem('token');
 try {
 await axios.delete(`${API_URL}/api/v1/currencies/admin/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Listing deleted');
 fetchListings();
 } catch (err) {
 notify('error', 'Failed to delete listing');
 }
 };

 const handleEdit = (listing) => {
 setEditingListing(listing);
 setShowForm(true);
 };

 return (
 <AdminLayout>
 <div className="space-y-8 relative">
 {notification && (
 <div className={`fixed top-10 right-10 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-fade-in ${notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
 }`}>
 {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
 <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
 </div>
 )}

 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-white uppercase tracking-tighter text-sky-primary">Currency Management</h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Manage game currency prices and delivery</p>
 </div>
 <button
 onClick={() => { setEditingListing(null); setShowForm(true); }}
 className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-[#722AEE] text-white rounded-xl font-black uppercase tracking-tighter text-xs transition-all shadow-lg shadow-primary/20"
 >
 <Plus className="w-4 h-4" />
 Add New Listing
 </button>
 </div>

 {showForm && (
 <CurrencyForm
 listing={editingListing}
 games={games}
 onClose={handleFormClose}
 onSuccess={handleFormClose}
 />
 )}

 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
 <table className="w-full text-left">
 <thead className="bg-white/[0.02] border-b border-white/5">
 <tr>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Game</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Type / Server</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Region</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Price/Unit</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">Delivery</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.02]">
 {listings.map(item => (
 <tr key={item._id} className="hover:bg-white/[0.01] group transition-colors">
 <td className="px-8 py-6 font-black text-white">{item.gameId?.title || 'Game'}</td>
 <td className="px-8 py-6">
 <div className="text-[13px] font-bold text-white">{item.currencyType}</div>
 <div className="text-[10px] text-white/30 uppercase font-black">{item.server || 'All Servers'}</div>
 </td>
 <td className="px-8 py-6">
 <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-black text-white/60">{item.region}</span>
 </td>
 <td className="px-8 py-6 font-black text-primary">${item.pricePerUnit}</td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase">
 <Truck className="w-3 h-3" /> {item.defaultDeliveryMethod?.replace('-', ' ') || 'Mail'}
 </div>
 </td>
 <td className="px-8 py-6 text-right">
 <div className="flex items-center justify-end gap-2">
 <button onClick={() => handleEdit(item)} className="p-2 text-white/20 hover:text-white" title="Edit"><Edit2 className="w-4 h-4" /></button>
 <button onClick={() => handleDelete(item._id)} className="p-2 text-white/20 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </AdminLayout>
 );
};

export default AdminCurrency;
