import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, GripVertical, Gamepad2, AlertCircle, CheckCircle2 } from 'lucide-react';
import GameForm from '../../components/admin/GameForm';
import AdminLayout from '../../components/admin/AdminLayout';
import { getImageUrl, API_URL } from '../../utils/api';

const AdminGames = () => {
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingGame, setEditingGame] = useState(null);
 const [deleteConfirm, setDeleteConfirm] = useState(null);
 const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
 const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);
 const [selectedIds, setSelectedIds] = useState([]);

 // Calculate pagination
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentGames = games.slice(indexOfFirstItem, indexOfLastItem);
 const totalPages = Math.ceil(games.length / itemsPerPage);

 // Show notification
 const notify = (type, message) => {
 const msg = typeof message === 'object' ? (message.message || JSON.stringify(message)) : message;
 setNotification({ type, message: msg });
 setTimeout(() => setNotification(null), 3000);
 };

 // Fetch all games
 const fetchGames = async () => {
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/games/admin/all`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setGames(res.data.data);
 setLoading(false);
 setSelectedIds([]); // Clear selection after fetch
 } catch (error) {
 console.error('Error fetching games:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to load games';
 notify('error', msg);
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchGames();
 }, []);

 // Handle selection
 const toggleSelectAll = () => {
 if (selectedIds.length === currentGames.length) {
 setSelectedIds([]);
 } else {
 setSelectedIds(currentGames.map(g => g._id));
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
 await axios.delete(`${API_URL}/api/v1/games/admin/${id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Game deleted successfully');
 fetchGames();
 setDeleteConfirm(null);
 } catch (error) {
 console.error('Error deleting game:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to delete game';
 notify('error', msg);
 }
 };

 // Handle bulk delete
 const handleBulkDelete = async () => {
 try {
 const token = localStorage.getItem('token');
 await axios.delete(`${API_URL}/api/v1/games/admin/bulk`, {
 data: { ids: selectedIds },
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', `${selectedIds.length} games deleted successfully`);
 fetchGames();
 setBulkDeleteConfirm(false);
 } catch (error) {
 console.error('Error bulk deleting games:', error);
 const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to bulk delete games';
 notify('error', msg);
 }
 };

 // Handle status toggle
 const handleToggleStatus = async (id) => {
 try {
 const token = localStorage.getItem('token');
 await axios.patch(`${API_URL}/api/v1/games/admin/${id}/status`, {}, {
 headers: { Authorization: `Bearer ${token}` }
 });
 notify('success', 'Status updated');
 fetchGames();
 } catch (error) {
 console.error('Error toggling status:', error);
 notify('error', 'Failed to update status');
 }
 };

 // Handle form close
 const handleFormClose = () => {
 setShowForm(false);
 setEditingGame(null);
 fetchGames();
 };

 if (loading && games.length === 0) {
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
 <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Games & Services</h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Manage your marketplace inventory</p>
 </div>
 <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
 {selectedIds.length > 0 && (
 <button
 onClick={() => setBulkDeleteConfirm(true)}
 className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
 >
 <Trash2 className="w-5 h-5" />
 Delete Selected ({selectedIds.length})
 </button>
 )}
 <button
 onClick={() => setShowForm(true)}
 className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20"
 >
 <Plus className="w-5 h-5" />
 Add New Game
 </button>
 </div>
 </div>

 {/* Games Table Content */}
 {games.length === 0 ? (
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-20 text-center">
 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
 <Gamepad2 className="w-10 h-10 text-white/10" />
 </div>
 <h3 className="text-xl font-black text-white/20 uppercase mb-8">No games found</h3>
 <button
 onClick={() => setShowForm(true)}
 className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
 >
 Create Your First Game
 </button>
 </div>
 ) : (
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-white/[0.02] border-b border-white/5">
 <tr>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">#</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Game & Service</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Offers</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 whitespace-nowrap">Status & Tags</th>
 <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.03]">
 {currentGames.map((game) => (
 <tr key={game._id} className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.includes(game._id) ? 'bg-primary/5' : ''}`}>
 <td className="px-4 py-4 w-10">
 <div className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={selectedIds.includes(game._id)}
 onChange={() => toggleSelect(game._id)}
 className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 transition-all cursor-pointer"
 />
 <span className="text-[10px] font-black text-white/20">{game.displayOrder}</span>
 </div>
 </td>
 <td className="px-4 py-4 min-w-[300px]">
 <div className="flex items-center gap-3">
 <div className="w-14 h-9 rounded-lg overflow-hidden bg-white/5 border border-white/5 shrink-0">
 <img
 src={getImageUrl(game.bgImage || game.characterImage)}
 alt={game.title}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 </div>
 <div className="min-w-0">
 <div className="text-[13px] font-black uppercase text-white group-hover:text-primary transition-colors truncate">{game.title}</div>
 <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">{game.slug}</div>
 </div>
 </div>
 </td>
 <td className="px-4 py-4">
 <span className="inline-flex px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-black text-white/40 border border-white/5">
 {game.servicesCount || 0}
 </span>
 </td>
 <td className="px-4 py-4">
 <div className="flex items-center gap-2">
 {/* Status Badge */}
 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${game.status === 'active'
 ? 'bg-green-500/10 border-green-500/20 text-green-400'
 : 'bg-white/5 border-white/10 text-white/30'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full ${game.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`}></div>
 <span className="text-[9px] font-black uppercase tracking-widest">{game.status}</span>
 </div>

 {/* Hot Badge */}
 {game.isHot ? (
 <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full animate-pulse-subtle">
 <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
 <span className="text-[9px] font-black uppercase tracking-widest">HOT</span>
 </div>
 ) : (
 <div className="flex items-center gap-1 px-2 py-1 bg-white/[0.03] border border-white/[0.05] text-white/20 rounded-full">
 <span className="text-[9px] font-black uppercase tracking-widest">Regular</span>
 </div>
 )}
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => handleToggleStatus(game._id)}
 className={`p-2 rounded-lg transition-all ${game.status === 'active' ? 'text-green-500/50 hover:text-green-500 hover:bg-green-500/10' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
 title={game.status === 'active' ? 'Deactivate' : 'Activate'}
 >
 <Power className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setEditingGame(game);
 setShowForm(true);
 }}
 className="p-2 hover:bg-blue-500/10 rounded-lg transition-all text-white/20 hover:text-blue-400"
 title="Edit"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => setDeleteConfirm(game)}
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
 Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, games.length)} of {games.length} games
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

 {/* Game Form Modal */}
 {showForm && (
 <GameForm
 game={editingGame}
 onClose={handleFormClose}
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
 Are you sure you want to delete <span className="text-white">{selectedIds.length}</span> games? This will permanently erase the titles and all related configuration.
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
 Erase Everything
 </button>
 </div>
 </div>
 </div>,
 document.getElementById('modal-root')
 )}

 {/* Delete Confirmation Modal (Using Portal) */}
 {deleteConfirm && ReactDOM.createPortal(
 <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-10 max-w-md w-full text-center relative">
 <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
 <Trash2 className="w-10 h-10" />
 </div>
 <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4">Final Warning</h3>
 <p className="text-white/40 font-bold mb-10 text-sm">
 Are you sure you want to delete <span className="text-white">"{deleteConfirm.title}"</span>? This will permanently erase the title and all related configuration.
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
 Erase Permanently
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

export default AdminGames;
