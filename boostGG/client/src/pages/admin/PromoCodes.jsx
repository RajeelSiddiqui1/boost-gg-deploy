import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import {
    Tag, Plus, Search, Edit2, Trash2,
    Check, X, Clock, AlertCircle
} from 'lucide-react';

const PromoCodes = () => {
    const { formatPrice } = useCurrency();
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: '',
        minOrderAmount: 0,
        maxUses: '',
        maxUsesPerUser: 1,
        expiresAt: '',
        status: 'active',
        targetUsers: 'all'
    });

    const fetchPromoCodes = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/admin/promo`);
            setPromoCodes(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
                maxUses: formData.maxUses ? Number(formData.maxUses) : null,
                minOrderAmount: Number(formData.minOrderAmount),
                maxUsesPerUser: Number(formData.maxUsesPerUser)
            };

            if (editingPromo) {
                await axios.put(`${API_URL}/api/v1/admin/promo/${editingPromo._id}`, data);
            } else {
                await axios.post(`${API_URL}/api/v1/admin/promo`, data);
            }

            fetchPromoCodes();
            setShowForm(false);
            setEditingPromo(null);
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving promo code');
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            description: promo.description || '',
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            maxDiscountAmount: promo.maxDiscountAmount || '',
            minOrderAmount: promo.minOrderAmount,
            maxUses: promo.maxUses || '',
            maxUsesPerUser: promo.maxUsesPerUser,
            expiresAt: new Date(promo.expiresAt).toISOString().split('T')[0],
            status: promo.status,
            targetUsers: promo.targetUsers
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;

        try {
            await axios.delete(`${API_URL}/api/v1/admin/promo/${id}`);
            fetchPromoCodes();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting promo code');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 10,
            maxDiscountAmount: '',
            minOrderAmount: 0,
            maxUses: '',
            maxUsesPerUser: 1,
            expiresAt: '',
            status: 'active',
            targetUsers: 'all'
        });
    };

    const filteredPromoCodes = promoCodes.filter(p => {
        const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'disabled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            case 'exhausted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                            <Tag className="w-6 h-6 text-primary" />
                            Promo Codes
                        </h2>
                        <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest">Manage discount campaigns</p>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditingPromo(null); resetForm(); }}
                        className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Promo
                    </button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search promo codes..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-6 text-xs text-white outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-xs text-white font-black uppercase outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                        <option value="exhausted">Exhausted</option>
                    </select>
                </div>

                {showForm && (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
                        <h3 className="text-lg font-black italic uppercase mb-6">
                            {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Promo Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all uppercase"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="SAVE20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="20% off on all services"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Discount Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="free_delivery">Free Delivery</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Max Discount (Amount)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Min Order Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Max Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Expires At</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-primary transition-all"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingPromo(null); }}
                                    className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 text-white/60 hover:border-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary text-black hover:bg-primary/90 transition-all"
                                >
                                    {editingPromo ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Discount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Usage</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Expires</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black italic animate-pulse">Loading...</td></tr>
                                ) : filteredPromoCodes.length === 0 ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black italic">No promo codes found</td></tr>
                                ) : (
                                    filteredPromoCodes.map((promo) => (
                                        <tr key={promo._id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <Tag className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-black italic uppercase text-white">{promo.code}</p>
                                                        <p className="text-[9px] font-bold text-white/20 uppercase">{promo.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black italic text-green-500">
                                                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` :
                                                        promo.discountType === 'fixed' ? formatPrice(promo.discountValue) :
                                                            'Free Delivery'}
                                                </p>
                                                {promo.maxDiscountAmount && (
                                                    <p className="text-[9px] font-bold text-white/20 uppercase">Max: {formatPrice(promo.maxDiscountAmount)}</p>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-white/60">{promo.currentUses} / {promo.maxUses || '∞'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {isExpired(promo.expiresAt) ? (
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                    ) : (
                                                        <Clock className="w-4 h-4 text-white/40" />
                                                    )}
                                                    <span className={`text-xs font-bold ${isExpired(promo.expiresAt) ? 'text-red-500' : 'text-white/60'}`}>
                                                        {new Date(promo.expiresAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(promo.status)}`}>
                                                    {promo.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(promo)}
                                                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-primary hover:border-primary/50 transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promo._id)}
                                                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:border-red-500/50 transition-all"
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
            </div>
        </AdminLayout>
    );
};

export default PromoCodes;
