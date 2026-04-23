import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, GripVertical, Wrench, AlertCircle, CheckCircle2, Filter, Search, LayoutDashboard } from 'lucide-react';
import ServiceForm from '../../components/admin/ServiceForm';
import AdminLayout from '../../components/admin/AdminLayout';
import { getImageUrl, API_URL } from '../../utils/api';

const SERVICE_TYPES = [
 { value: 'boosting', label: 'Boosting' },
 { value: 'coaching', label: 'Coaching' },
 { value: 'accounts', label: 'Accounts' },
 { value: 'items', label: 'Items' },
 { value: 'packs', label: 'Packs' },
 { value: 'misc', label: 'Misc' }
];

const AdminServices = () => {
 const navigate = useNavigate();
 const [services, setServices] = useState([]);
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingService, setEditingService] = useState(null);
 const [deleteConfirm, setDeleteConfirm] = useState(null);
 const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
 const [notification, setNotification] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);
 const [selectedIds, setSelectedIds] = useState([]);

 // Filters
 const [filters, setFilters] = useState({
 gameId: '',
 serviceType: '',
 status: '',
 search: ''
 });

 // Calculate pagination
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);
 const totalPages = Math.ceil(services.length / itemsPerPage);

 // Show notification
 const notify = (type, message) => {
 const msg = typeof message === 'object' 
 ? (message.message || (typeof message.toString === 'function' && message.toString() !== '[object Object]' ? message.toString() : JSON.stringify(message))) 
 : message;
 setNotification({ type, message: msg });
 setTimeout(() => setNotification(null), 3000);
 };

 // Fetch games for selection
 const fetchGames = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/games`);
 setGames(res.data.data);
 } catch (error) {
 console.error('Error fetching games:', error);
 }
 };

 // Fetch services
 const fetchServices = async () => {
 try {
 const token = localStorage.getItem('token');
 const params = new URLSearchParams();

 if (filters.gameId) params.append('gameId', filters.gameId);
 if (filters.serviceType) params.append('serviceType', filters.serviceType);
 if (filters.status) params.append('status', filters.status);
 if (filters.search) params.append('search', filters.search);

 const queryString = params.toString();
 const url = queryString
 ? `${API_URL}/api/v1/admin/services?${queryString}`
 : `${API_URL}/api/v1/admin/services`;

 const res = await axios.get(url, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setServices(res.data.data);
 setLoading(false);
 setSelectedIds([]);
 } catch (error) {
 console.error('Error fetching services:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to load services';
 notify('error', msg);
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchGames();
 }, []);

 useEffect(() => {
 fetchServices();
 }, [filters]);

 // Handle filter change
 const handleFilterChange = (e) => {
 const { name, value } = e.target;
 setFilters(prev => ({ ...prev, [name]: value }));
 setCurrentPage(1);
 };

 // Handle selection
 const toggleSelectAll = () => {
 if (selectedIds.length === currentServices.length) {
 setSelectedIds([]);
 } else {
 setSelectedIds(currentServices.map(s => s._id));
 }
 };

 const toggleSelect = (id) => {
 setSelectedIds(prev =>
 prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
 );
 };

 // Handle delete
 const handleDelete = async (id) => {
 try {
 const token = localStorage.getItem('token');
 await axios.delete(`${API_URL}/api/v1/admin/services/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Service deleted successfully');
 fetchServices();
 fetchGames(); // Refresh game counts
 setDeleteConfirm(null);
 } catch (error) {
 console.error('Error deleting service:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to delete service';
 notify('error', msg);
 }
 };

 // Handle bulk delete
 const handleBulkDelete = async () => {
 try {
 const token = localStorage.getItem('token');
 await axios.patch(`${API_URL}/api/v1/services/admin/bulk`,
 { ids: selectedIds, action: 'delete' },
 { headers: { Authorization: `Bearer ${token}` } }
 );
 notify('success', `${selectedIds.length} services deleted successfully`);
 fetchServices();
 fetchGames();
 setBulkDeleteConfirm(false);
 } catch (error) {
 console.error('Error bulk deleting services:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to bulk delete services';
 notify('error', msg);
 }
 };

 // Handle status toggle
 const handleToggleStatus = async (id) => {
 try {
 const token = localStorage.getItem('token');
 await axios.patch(`${API_URL}/api/v1/admin/services/${id}/status`, {}, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Status updated');
 fetchServices();
 } catch (error) {
 console.error('Error toggling status:', error);
 notify('error', 'Failed to update status');
 }
 };

 // Handle form close
 const handleFormClose = () => {
 setShowForm(false);
 setEditingService(null);
 fetchServices();
 fetchGames(); // Refresh game counts
 };

 // Get game name by ID
 const getGameName = (gameId) => {
 const game = games.find(g => g._id === (gameId._id || gameId));
 return game?.title || 'Unknown Game';
 };

 if (loading && services.length === 0) {
 return (
 <AdminLayout>
 <div className="min-h-[400px] flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 </AdminLayout>
 );
 }

 return (
 <AdminLayout>
 <div className="space-y-8 relative">
 {/* Notification Toast */}
 {notification && (
 <div className={`fixed top-10 right-10 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-fade-in ${notification.type === 'success'
 ? 'bg-green-500/10 border-green-500/20 text-green-500'
 : 'bg-red-500/10 border-red-500/20 text-red-500'
 }`}>
 {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
 <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
 </div>
 )}

 {/* Header Actions */}
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Services</h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Manage your boosting services</p>
 </div>
 <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
 <button
 onClick={() => navigate('/admin/services/new')}
 className="flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-purple-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-purple-500/20"
 >
 <Plus className="w-5 h-5" />
 Core Service Creator
 </button>
 <button
 onClick={() => {
 setEditingService(null);
 setShowForm(true);
 }}
 className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
 >
 <Plus className="w-5 h-5" />
 Legacy Add
 </button>
 {selectedIds.length > 0 && (
 <button
 onClick={() => setBulkDeleteConfirm(true)}
 className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
 >
 <Trash2 className="w-5 h-5" />
 Delete ({selectedIds.length})
 </button>
 )}
 </div>
 </div>

 {/* Filters */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 type="text"
 name="search"
 value={filters.search}
 onChange={handleFilterChange}
 placeholder="Search services..."
 className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/50"
 />
 </div>

 {/* Game Filter */}
 <select
 name="gameId"
 value={filters.gameId}
 onChange={handleFilterChange}
 className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50"
 >
 <option value="">All Games</option>
 {games.map(game => (
 <option key={game._id} value={game._id}>{game.title}</option>
 ))}
 </select>

 {/* Service Type Filter */}
 <select
 name="serviceType"
 value={filters.serviceType}
 onChange={handleFilterChange}
 className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50"
 >
 <option value="">All Types</option>
 {SERVICE_TYPES.map(type => (
 <option key={type.value} value={type.value}>{type.label}</option>
 ))}
 </select>

 {/* Status Filter */}
 <select
 name="status"
 value={filters.status}
 onChange={handleFilterChange}
 className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50"
 >
 <option value="">All Status</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="draft">Draft</option>
 </select>
 </div>
 </div>

 {/* Services Table Content */}
 {services.length === 0 ? (
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-20 text-center">
 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
 <Wrench className="w-10 h-10 text-white/10" />
 </div>
 <h3 className="text-xl font-black text-white/20 uppercase mb-8">No services found</h3>
 </div>
 ) : (
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-white/[0.02] border-b border-white/5">
 <tr>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">#</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Service</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Game</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Type</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Price</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Status</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.03]">
 {currentServices.map((service) => (
 <tr key={service._id} className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.includes(service._id) ? 'bg-primary/5' : ''}`}>
 <td className="px-4 py-4 w-10">
 <div className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={selectedIds.includes(service._id)}
 onChange={() => toggleSelect(service._id)}
 className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 transition-all cursor-pointer"
 />
 </div>
 </td>
 <td className="px-4 py-4 min-w-[200px]">
 <div className="flex items-center gap-3">
 {(service.backgroundImage || service.image) ? (
 <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0 relative">
 <img
 src={getImageUrl(service.backgroundImage || service.image)}
 alt={service.title}
 className="w-full h-full object-cover"
 />
 {service.icon && (
 <img
 src={getImageUrl(service.icon)}
 alt=""
 className="absolute bottom-0 right-0 h-8 object-contain"
 />
 )}
 </div>
 ) : service.icon ? (
 <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
 <img
 src={getImageUrl(service.icon)}
 alt={service.title}
 className="w-full h-full object-cover"
 />
 </div>
 ) : (
 <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
 <Wrench className="w-4 h-4 text-white/20" />
 </div>
 )}
 <div className="min-w-0">
 <div className="text-[13px] font-black uppercase text-white group-hover:text-primary transition-colors truncate">{service.title}</div>
 <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">{service.slug}</div>
 </div>
 </div>
 </td>
 <td className="px-4 py-4">
 <span className="text-xs font-bold text-white/60">{getGameName(service.gameId)}</span>
 </td>
 <td className="px-4 py-4">
 <span className="inline-flex px-2 py-0.5 bg-primary/10 rounded-md text-[10px] font-black text-primary border border-primary/20 capitalize">
 {service.serviceType}
 </span>
 </td>
 <td className="px-4 py-4">
 <div className="text-xs font-black text-white">
 {service.pricing?.type === 'fixed' && `$${service.pricing?.basePrice}`}
 {service.pricing?.type === 'per_level' && `$${service.pricing?.pricePerUnit}/level`}
 {service.pricing?.type === 'per_win' && `$${service.pricing?.pricePerUnit}/win`}
 {service.pricing?.type === 'hourly' && `$${service.pricing?.pricePerUnit}/hr`}
 {service.pricing?.type === 'tiered' && `${service.pricing?.tiers?.length || 0} tiers`}
 {service.pricing?.type === 'dynamic' && 'Dynamic'}
 </div>
 {service.pricing?.discountPercent > 0 && (
 <span className="text-[9px] text-green-400 font-bold">
 {service.pricing.discountPercent}% OFF
 </span>
 )}
 </td>
 <td className="px-4 py-4">
 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${service.status === 'active'
 ? 'bg-green-500/10 border-green-500/20 text-green-400'
 : service.status === 'draft'
 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
 : 'bg-white/5 border-white/10 text-white/30'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`}></div>
 {service.status}
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => navigate(`/admin/services/${service._id}/edit`)}
 className="p-2 hover:bg-purple-500/10 rounded-lg transition-all text-white/20 hover:text-purple-400"
 title="Configure Sidebar"
 >
 <LayoutDashboard className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleToggleStatus(service._id)}
 className={`p-2 rounded-lg transition-all ${service.status === 'active' ? 'text-green-500/50 hover:text-green-500 hover:bg-green-500/10' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
 title={service.status === 'active' ? 'Deactivate' : 'Activate'}
 >
 <Power className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setEditingService(service);
 setShowForm(true);
 }}
 className="p-2 hover:bg-blue-500/10 rounded-lg transition-all text-white/20 hover:text-blue-400"
 title="Edit"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => setDeleteConfirm(service)}
 className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-white/20 hover:text-red-500"
 title="Delete"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Pagination Controls */}
 {totalPages > 1 && (
 <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
 <div className="text-white/40 text-xs font-bold uppercase tracking-widest">
 Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, services.length)} of {services.length} services
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
 disabled={currentPage === 1}
 className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-all"
 >
 Previous
 </button>
 <div className="flex items-center gap-1">
 {[...Array(totalPages)].map((_, i) => (
 <button
 key={i}
 onClick={() => setCurrentPage(i + 1)}
 className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1
 ? 'bg-primary text-white'
 : 'bg-white/5 hover:bg-white/10 text-white/60'
 }`}
 >
 {i + 1}
 </button>
 ))}
 </div>
 <button
 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
 disabled={currentPage === totalPages}
 className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-all"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Service Form Modal */}
 {showForm && (
 <ServiceForm
 service={editingService}
 games={games}
 onClose={handleFormClose}
 onSuccess={handleFormClose}
 />
 )}

 {/* Bulk Delete Confirmation Modal */}
 {bulkDeleteConfirm && ReactDOM.createPortal(
 <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-10 max-w-md w-full text-center relative">
 <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
 <Trash2 className="w-10 h-10" />
 </div>
 <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4">Final Warning</h3>
 <p className="text-white/40 font-bold mb-10 text-sm">
 Are you sure you want to delete <span className="text-white">{selectedIds.length}</span> services? This will permanently erase them.
 </p>
 <div className="flex flex-col md:flex-row gap-4">
 <button
 onClick={() => setBulkDeleteConfirm(false)}
 className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 text-white"
 >
 Cancel
 </button>
 <button
 onClick={handleBulkDelete}
 className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-500/20 text-white"
 >
 Delete All
 </button>
 </div>
 </div>
 </div>,
 document.getElementById('modal-root')
 )}

 {/* Delete Confirmation Modal */}
 {deleteConfirm && ReactDOM.createPortal(
 <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-10 max-w-md w-full text-center relative">
 <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
 <Trash2 className="w-10 h-10" />
 </div>
 <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4">Final Warning</h3>
 <p className="text-white/40 font-bold mb-10 text-sm">
 Are you sure you want to delete <span className="text-white">"{deleteConfirm.title}"</span>? This will permanently erase the service.
 </p>
 <div className="flex flex-col md:flex-row gap-4">
 <button
 onClick={() => setDeleteConfirm(null)}
 className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 text-white"
 >
 Cancel
 </button>
 <button
 onClick={() => handleDelete(deleteConfirm._id)}
 className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-500/20 text-white"
 >
 Delete Permanently
 </button>
 </div>
 </div>
 </div>,
 document.getElementById('modal-root')
 )}
 </div>
 </AdminLayout>
 );
};

export default AdminServices;
