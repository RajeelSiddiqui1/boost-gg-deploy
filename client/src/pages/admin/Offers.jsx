import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, Gamepad2, Search, Filter, ShoppingCart } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import OfferForm from '../../components/admin/OfferForm';
import { getImageUrl, API_URL } from '../../utils/api';

const AdminOffers = () => {
    const { formatPrice } = useCurrency();
    const [offers, setOffers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGame, setFilterGame] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    // Fetch all offers and games
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [offersRes, gamesRes] = await Promise.all([
                axios.get(`${API_URL}/api/v1/offers/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/v1/games/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setOffers(offersRes.data.data);
            setGames(gamesRes.data.data);
            setLoading(false);
            setSelectedIds([]); // Clear selection after fetch
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle selection
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOffers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOffers.map(o => o._id));
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
            await axios.delete(`${API_URL}/api/v1/offers/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/v1/offers/admin/bulk`, {
                data: { ids: selectedIds },
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setBulkDeleteConfirm(false);
        } catch (error) {
            console.error('Error bulk deleting offers:', error);
        }
    };

    // Handle status toggle
    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/v1/offers/admin/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Filtered offers
    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGame = filterGame === 'all' || offer.game === filterGame;
        return matchesSearch && matchesGame;
    });

    const handleFormClose = () => {
        setShowForm(false);
        setEditingOffer(null);
        fetchData();
    };

    if (loading && offers.length === 0) {
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
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Services Inventory</h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Manage your boosting offers and calculations</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setBulkDeleteConfirm(true)}
                                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create New service
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search services by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-primary/50 transition-all outline-none"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <select
                            value={filterGame}
                            onChange={(e) => setFilterGame(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white/60 focus:border-primary/50 transition-all outline-none appearance-none"
                        >
                            <option value="all">All Games</option>
                            {games.map(game => (
                                <option key={game._id} value={game.title}>{game.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                {filteredOffers.length === 0 ? (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-10 h-10 text-white/10" />
                        </div>
                        <h3 className="text-xl font-black italic text-white/20 uppercase mb-8">No services found</h3>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                        >
                            Add New Service
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6 w-10">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === filteredOffers.length && filteredOffers.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Service</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Game</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Price</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Hot</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOffers.map((offer) => (
                                        <tr key={offer._id} className={`group hover:bg-white/[0.01] transition-colors ${selectedIds.includes(offer._id) ? 'bg-primary/5' : ''}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(offer._id)}
                                                        onChange={() => toggleSelect(offer._id)}
                                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 transition-all cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/5 shrink-0">
                                                        <img
                                                            src={getImageUrl(offer.image)}
                                                            alt={offer.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-black italic uppercase text-white group-hover:text-primary transition-colors truncate">{offer.title}</div>
                                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{offer.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                    {offer.game}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-black italic text-white">{formatPrice(offer.price)}</div>
                                                {offer.oldPrice && (
                                                    <div className="text-[9px] font-bold text-white/20 line-through">{formatPrice(offer.oldPrice)}</div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                {offer.isHot ? (
                                                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest border border-orange-500/20 rounded-md">HOT</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-white/5 text-white/20 text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-md">REGULAR</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${offer.isActive
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}
                                                >
                                                    {offer.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(offer._id)}
                                                        className={`p-2 rounded-xl transition-all ${offer.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                                                        title="Toggle Status"
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingOffer(offer);
                                                            setShowForm(true);
                                                        }}
                                                        className="p-2 hover:bg-blue-500/10 rounded-xl transition-all text-blue-400"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(offer)}
                                                        className="p-2 hover:bg-red-500/10 rounded-xl transition-all text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Offer Form Modal */}
                {showForm && (
                    <OfferForm
                        offer={editingOffer}
                        games={games}
                        onClose={handleFormClose}
                    />
                )}

                {/* Bulk Delete Confirmation Modal */}
                {bulkDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Delete Selected?</h3>
                            <p className="text-white/40 font-bold mb-10 italic"> Are you sure you want to delete <span className="text-white">{selectedIds.length}</span> services? This action cannot be undone.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setBulkDeleteConfirm(false)}
                                    className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                                >
                                    Delete All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Delete Service?</h3>
                            <p className="text-white/40 font-bold mb-10 italic"> Are you sure you want to delete <span className="text-white">"{deleteConfirm.title}"</span>?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm._id)}
                                    className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOffers;
