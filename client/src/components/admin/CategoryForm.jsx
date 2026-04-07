import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../utils/api';

const CategoryForm = ({ category, games, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        gameId: '',
        sortOrder: 0,
        isFeatured: false,
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Populate form if editing
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                gameId: category.gameId?._id || category.gameId || '',
                sortOrder: category.sortOrder || 0,
                isFeatured: category.isFeatured || false,
                isActive: category.isActive !== undefined ? category.isActive : true
            });
        } else if (games.length > 0) {
            setFormData(prev => ({ ...prev, gameId: games[0]._id }));
        }
    }, [category, games]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const data = {
                ...formData,
                sortOrder: parseInt(formData.sortOrder) || 0
            };

            if (category) {
                await axios.put(
                    `${API_URL}/api/v1/categories/admin/${category._id}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${API_URL}/api/v1/categories/admin`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.details
                ? err.response.data.details.join(', ')
                : err.response?.data?.message || err.message || 'Something went wrong';
            setError(errorMsg);
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[999] p-4 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 md:p-10 max-w-xl w-full my-4 md:my-10 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
                            {category ? 'Edit Category' : 'Add Category'}
                        </h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Organize services under games</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all text-white/40 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        {/* Game Selection */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Game *</label>
                            <select
                                name="gameId"
                                value={formData.gameId}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                <option value="">Select a Game</option>
                                {games.map(game => (
                                    <option key={game._id} value={game._id}>{game.name || game.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Category Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., Mythic+ Dungeons"
                            />
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Sort Order</label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="0"
                            />
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-4 cursor-pointer group p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:bg-primary/50 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-primary"></div>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Featured</span>
                            </label>

                            <label className="flex items-center gap-4 cursor-pointer group p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:bg-green-500/50 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-green-500"></div>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-5 bg-primary hover:bg-[#722AEE] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {category ? 'Update Category' : 'Create Category'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default CategoryForm;
