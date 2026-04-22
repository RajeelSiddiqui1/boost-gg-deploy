import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, Briefcase, AlertCircle, CheckCircle2, Search, DollarSign, Globe, Shield, Image as ImageIcon, Camera, Zap } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AccountForm from '../../components/admin/AccountForm';
import { API_URL, getImageUrl } from '../../utils/api';

const AdminAccounts = () => {
    const [listings, setListings] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [formData, setFormData] = useState({}); // Not directly used for the new form

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
            const res = await axios.get(`${API_URL}/api/v1/accounts/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(res.data.data);
            setLoading(false);
        } catch (err) {
            notify('error', 'Failed to fetch account listings');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
        fetchListings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('specifications.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                specifications: { ...prev.specifications, [field]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
            }));
        }
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
            await axios.delete(`${API_URL}/api/v1/accounts/admin/${id}`, {
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

    const filteredListings = listings.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.gameId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rank?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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
                        <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter text-sky-primary">Accounts Management</h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Manage game account listings</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input 
                                type="text"
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-primary/40 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => { setEditingListing(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-[#722AEE] text-white rounded-xl font-black italic uppercase tracking-tighter text-xs transition-all shadow-lg shadow-primary/20 flex-shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    </div>
                </div>

                {showForm && (
                    <AccountForm
                        account={editingListing}
                        games={games}
                        onClose={handleFormClose}
                        onSuccess={handleFormClose}
                    />
                )}

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedListings.map(item => (
                            <div key={item._id} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden group hover:border-primary/30 transition-all">
                                <div className="aspect-video bg-white/5 relative overflow-hidden">
                                    {item.screenshots?.[0] ? (
                                        <img src={getImageUrl(item.screenshots[0])} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera className="w-10 h-10 text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                                        {item.gameId?.title || 'Game'}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-white italic uppercase tracking-tight line-clamp-1">{item.title}</h3>
                                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{item.rank} • {item.region}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xl font-black italic text-primary">${item.price}</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(item)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 bg-white/5 hover:bg-red-500/10 rounded-xl text-white/30 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        {item.instantDelivery && <span className="p-1.5 bg-green-500/10 rounded-lg text-green-500" title="Instant Delivery"><Zap className="w-3.5 h-3.5" /></span>}
                                        {item.secureTransfer && <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500" title="Secure Transfer"><Shield className="w-3.5 h-3.5" /></span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentPage === 1 ? 'bg-white/5 text-white/10' : 'bg-white/5 text-white hover:bg-primary hover:text-black'}`}
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${currentPage === totalPages ? 'bg-white/5 text-white/10' : 'bg-white/5 text-white hover:bg-primary hover:text-black'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAccounts;
