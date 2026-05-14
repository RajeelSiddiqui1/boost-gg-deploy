import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Tag, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DealsPage = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [formData, setFormData] = useState({ title: '', slug: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/v1/deals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeals(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast.error('Failed to load deals');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase()
                    .replace(/[^a-z0-9.]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .replace(/-+/g, '-')
            }));
        }
    };

    const openModal = (deal = null) => {
        if (deal) {
            setEditingDeal(deal);
            setFormData({ title: deal.title, slug: deal.slug });
        } else {
            setEditingDeal(null);
            setFormData({ title: '', slug: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDeal(null);
        setFormData({ title: '', slug: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.slug) {
            return toast.error('Title and Slug are required');
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            
            if (editingDeal) {
                await axios.put(`${API_URL}/api/v1/deals/${editingDeal._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Deal updated successfully');
            } else {
                await axios.post(`${API_URL}/api/v1/deals`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Deal created successfully');
            }
            
            fetchDeals();
            closeModal();
        } catch (error) {
            console.error('Error saving deal:', error);
            toast.error(error.response?.data?.message || 'Failed to save deal');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/v1/deals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Deal deleted successfully');
            fetchDeals();
        } catch (error) {
            console.error('Error deleting deal:', error);
            toast.error('Failed to delete deal');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                            <Tag className="w-8 h-8 text-primary" />
                            Deals Management
                        </h2>
                        <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                            Create and manage promotional deals for services
                        </p>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary text-black px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-white transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Deal
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.01]">
                                    <tr className="border-b border-white/5">
                                        <th className="px-8 py-6 text-[10px] font-black tracking-widest text-white/20 uppercase">Title</th>
                                        <th className="px-8 py-6 text-[10px] font-black tracking-widest text-white/20 uppercase">Slug</th>
                                        <th className="px-8 py-6 text-[10px] font-black tracking-widest text-white/20 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {deals.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest">
                                                No deals found
                                            </td>
                                        </tr>
                                    ) : (
                                        deals.map((deal) => (
                                            <tr key={deal._id} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-white">{deal.title}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-mono text-primary/80 bg-primary/10 px-3 py-1 rounded-lg inline-block">
                                                        {deal.slug}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => openModal(deal)}
                                                            className="p-3 bg-white/5 text-white hover:bg-primary hover:text-black rounded-xl transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(deal._id)}
                                                            className="p-3 bg-white/5 text-white hover:bg-red-500 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                {editingDeal ? 'Edit Deal' : 'Create Deal'}
                            </h3>
                            <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-2">
                                    Deal Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Summer Sale, Top Deals"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="e.g. summer-sale"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-4 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Deal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default DealsPage;
