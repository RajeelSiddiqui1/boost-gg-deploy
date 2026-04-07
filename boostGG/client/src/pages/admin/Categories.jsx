import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Power, Layers, AlertCircle, CheckCircle2, GripVertical } from 'lucide-react';
import CategoryForm from '../../components/admin/CategoryForm';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_URL } from '../../utils/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [notification, setNotification] = useState(null);

    // Pagination & Search States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [limit] = useState(10);

    const fetchCategories = async (page = currentPage, search = searchQuery) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [categoriesRes, gamesRes] = await Promise.all([
                axios.get(`${API_URL}/api/v1/categories/admin/all`, {
                    params: { page, limit, search },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/v1/games/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setCategories(categoriesRes.data.data);
            setTotalPages(categoriesRes.data.pagination.pages);
            setTotalItems(categoriesRes.data.pagination.total);
            setGames(gamesRes.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCategories(1, searchQuery);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        fetchCategories(currentPage, searchQuery);
    }, [currentPage]);

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? Services linked to it might break.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/v1/categories/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            notify('success', 'Category deleted successfully');
            fetchCategories(currentPage, searchQuery);
        } catch (err) {
            notify('error', 'Failed to delete category');
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/v1/categories/admin/${category._id}`,
                { isActive: !category.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            notify('success', `Category ${!category.isActive ? 'activated' : 'deactivated'}`);
            fetchCategories(currentPage, searchQuery);
        } catch (err) {
            notify('error', 'Failed to update status');
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
        fetchCategories(currentPage, searchQuery);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0A] border border-white/5 p-6 rounded-[32px]">
                    <div>
                        <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                            <Layers className="w-8 h-8 text-primary" />
                            Category Management
                        </h1>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Hierarchical distribution of services</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-8 py-4 bg-primary hover:bg-[#722AEE] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Category
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {notification && (
                    <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-xs font-black uppercase tracking-wider">{notification.message}</span>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-nowrap">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Name & Game</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Slug</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Featured</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="relative">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center overflow-hidden">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Updating Stream...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No matching categories found</span>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category._id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                                                        <Layers className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black italic text-white uppercase">{category.name}</p>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            {category.gameId?.name || 'Unknown Game'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-white/40">{category.slug}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    {category.isFeatured ? (
                                                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[8px] font-black text-yellow-500 uppercase tracking-widest">Featured</span>
                                                    ) : (
                                                        <span className="text-white/10 text-[8px] font-black uppercase tracking-widest">Normal</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(category)}
                                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${category.isActive
                                                            ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                                            }`}
                                                    >
                                                        <Power className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{category.isActive ? 'Active' : 'Hidden'}</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-2 text-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCategory(category);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="p-3 bg-white/5 border border-white/5 hover:border-primary/30 rounded-xl transition-all text-white/40 hover:text-primary"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="p-3 bg-white/5 border border-white/5 hover:border-red-500/30 rounded-xl transition-all text-white/40 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                PAGE <span className="text-white/40">{currentPage}</span> / {totalPages} — <span className="text-white/40">{totalItems}</span> RESULTS
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Prev
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${currentPage === i + 1
                                                ? 'bg-primary border-primary/50 text-white shadow-lg shadow-primary/20'
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Form Modal */}
            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    games={games}
                    onClose={handleFormClose}
                />
            )}
        </AdminLayout>
    );
};

export default AdminCategories;
