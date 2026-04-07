import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';

const GAME_CATEGORIES = [
    'RPG', 'FPS', 'MOBA', 'MMORPG', 'Action', 'Adventure', 'Strategy',
    'Sports', 'Racing', 'Fighting', 'Puzzle', 'Simulation', 'Survival',
    'Horror', 'Sandbox', 'Battle Royale', 'Card Game', 'Other'
];

const GameForm = ({ game, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        category: 'Other',
        offersCount: '',
        displayOrder: 0,
        status: 'active',
        isPopular: false,
        isHot: false
    });
    const [bgImageFile, setBgImageFile] = useState(null);
    const [bgImagePreview, setBgImagePreview] = useState('');
    const [characterImageFile, setCharacterImageFile] = useState(null);
    const [characterImagePreview, setCharacterImagePreview] = useState('');
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState('');
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Populate form if editing
    useEffect(() => {
        if (game) {
            setFormData({
                title: game.title || '',
                subtitle: game.subtitle || '',
                description: game.description || '',
                category: game.category || 'Other',
                offersCount: game.offersCount || '',
                displayOrder: game.displayOrder || 0,
                status: game.status || 'active',
                isPopular: game.isPopular || false,
                isHot: game.isHot || false
            });
            setBgImagePreview(getImageUrl(game.bgImage || game.image || ''));
            setCharacterImagePreview(getImageUrl(game.characterImage || ''));
            setIconPreview(getImageUrl(game.icon || ''));
            setBannerPreview(getImageUrl(game.banner || ''));
        }
    }, [game]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle background image upload
    const handleBgImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Background image must be less than 5MB');
                return;
            }
            setBgImageFile(file);
            setBgImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle character image upload
    const handleCharacterImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Character image must be less than 5MB');
                return;
            }
            setCharacterImageFile(file);
            setCharacterImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle icon upload
    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Icon must be less than 5MB');
                return;
            }
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle banner upload
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Banner must be less than 5MB');
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('subtitle', formData.subtitle);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('offersCount', formData.offersCount);
            formDataToSend.append('displayOrder', formData.displayOrder);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('isPopular', formData.isPopular);
            formDataToSend.append('isHot', formData.isHot);

            // Append images if selected
            if (bgImageFile) {
                formDataToSend.append('bgImage', bgImageFile);
            }
            if (characterImageFile) {
                formDataToSend.append('characterImage', characterImageFile);
            }
            if (iconFile) {
                formDataToSend.append('icon', iconFile);
            }
            if (bannerFile) {
                formDataToSend.append('banner', bannerFile);
            }

            if (game) {
                // Update existing game
                await axios.put(
                    `${API_URL}/api/v1/games/admin/${game._id}`,
                    formDataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                // Create new game
                if (!bgImageFile) {
                    setError('Background image is required');
                    setLoading(false);
                    return;
                }
                await axios.post(
                    `${API_URL}/api/v1/games/admin`,
                    formDataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Something went wrong';
            setError(errorMsg);
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[999] p-4 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 md:p-10 max-w-2xl w-full my-4 md:my-10 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
                            {game ? 'Edit Game' : 'Add New Game'}
                        </h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Configure your boosting titles</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all text-white/40 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Game Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., World of Warcraft"
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Subtitle/Tag</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., Midnight Pre-Orders"
                            />
                        </div>

                        {/* Category */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                {GAME_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none resize-none"
                                placeholder="Game description..."
                            />
                        </div>

                        {/* Offers Count */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Offers Count *</label>
                            <input
                                type="number"
                                name="offersCount"
                                value={formData.offersCount}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="e.g., 940"
                            />
                        </div>

                        {/* Display Order */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Order</label>
                            <input
                                type="number"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all outline-none"
                                placeholder="0"
                            />
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Visibility Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none focus:border-primary/50 transition-all outline-none appearance-none"
                            >
                                <option value="active">ACTIVE: SHOW TO USERS</option>
                                <option value="inactive">INACTIVE: HIDDEN</option>
                            </select>
                        </div>

                        {/* Popular Toggle */}
                        <div>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isPopular"
                                        checked={formData.isPopular}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/50 peer-checked:after:bg-primary"></div>
                                </div>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Mark as Popular Game</span>
                            </label>
                        </div>

                        {/* Hot Toggle */}
                        <div>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isHot"
                                        checked={formData.isHot}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500/50 peer-checked:after:bg-orange-500"></div>
                                </div>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Hot right now</span>
                            </label>
                        </div>

                        {/* Background Image */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">
                                Background Card *
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[24px] p-6 text-center transition-all group border-dashed hover:border-primary/30 min-h-[160px] flex flex-col items-center justify-center">
                                    {bgImagePreview ? (
                                        <img
                                            src={bgImagePreview}
                                            alt="Preview"
                                            className="w-full h-24 object-cover rounded-xl mb-3 shadow-2xl"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                    )}
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest leading-tight">
                                        {bgImagePreview ? 'REPLACE BG' : 'UPLOAD BACKGROUND IMAGE'}
                                    </p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleBgImageChange} className="hidden" />
                            </label>
                        </div>

                        {/* Character Image */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">
                                Character Asset (PNG)
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[24px] p-6 text-center transition-all group border-dashed hover:border-primary/30 min-h-[160px] flex flex-col items-center justify-center">
                                    {characterImagePreview ? (
                                        <img
                                            src={characterImagePreview}
                                            alt="Preview"
                                            className="h-24 object-contain mb-3 drop-shadow-[0_0_15px_rgba(114,42,238,0.3)]"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                    )}
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest leading-tight">
                                        {characterImagePreview ? 'REPLACE CHARACTER' : 'UPLOAD PNG CHARACTER'}
                                    </p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleCharacterImageChange} className="hidden" />
                            </label>
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">
                                Game Icon
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[24px] p-6 text-center transition-all group border-dashed hover:border-primary/30 min-h-[160px] flex flex-col items-center justify-center">
                                    {iconPreview ? (
                                        <img
                                            src={iconPreview}
                                            alt="Preview"
                                            className="w-16 h-16 object-contain mb-3 rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                    )}
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest leading-tight">
                                        {iconPreview ? 'REPLACE ICON' : 'UPLOAD ICON'}
                                    </p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                            </label>
                        </div>

                        {/* Banner */}
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">
                                Game Banner
                            </label>
                            <label className="cursor-pointer block">
                                <div className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[24px] p-6 text-center transition-all group border-dashed hover:border-primary/30 min-h-[120px] flex flex-col items-center justify-center">
                                    {bannerPreview ? (
                                        <img
                                            src={bannerPreview}
                                            alt="Preview"
                                            className="w-full h-20 object-cover mb-3 rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                                        </div>
                                    )}
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest leading-tight">
                                        {bannerPreview ? 'REPLACE BANNER' : 'UPLOAD BANNER'}
                                    </p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full md:flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all border border-white/5"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:flex-1 px-8 py-5 bg-primary hover:bg-[#722AEE] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {game ? 'Sync Changes' : 'Publish Title'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default GameForm;

