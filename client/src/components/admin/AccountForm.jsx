import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, DollarSign, Shield, Zap, Image as ImageIcon, Plus, Trash2, Camera, Save, AlertCircle } from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';

const REGIONS = ['Global', 'Americas', 'Europe', 'Asia', 'Oceanic'];

const AccountForm = ({ account, games, onClose, onSuccess }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        gameId: '',
        title: '',
        rank: '',
        region: 'Global',
        server: '',
        price: 99.99,
        screenshots: [],
        specifications: { skins: 0, champions: 0, rareItems: '' },
        instantDelivery: true,
        secureTransfer: true,
        status: 'active',
        secureTransferInfo: 'Account transfer is handled through our secure system. Your credentials will be delivered instantly after payment.'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        if (account) {
            setFormData({
                gameId: account.gameId?._id || account.gameId || '',
                title: account.title || '',
                rank: account.rank || '',
                region: account.region || 'Global',
                server: account.server || '',
                price: account.price || 99.99,
                screenshots: account.screenshots || [],
                specifications: account.specifications || { skins: 0, champions: 0, rareItems: '' },
                instantDelivery: account.instantDelivery !== false,
                secureTransfer: account.secureTransfer !== false,
                status: account.status || 'active',
                secureTransferInfo: account.secureTransferInfo || 'Secure transfer guaranteed.'
            });
            setPreviewImages((account.screenshots || []).map(img => getImageUrl(img)));
        }
    }, [account]);

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

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const token = localStorage.getItem('token');
        const uploadFormData = new FormData();
        files.forEach(file => uploadFormData.append('screenshots', file));

        try {
            const res = await axios.post(`${API_URL}/api/v1/upload/multiple`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const newScreenshots = res.data.files; // Assuming backend returns array of filenames
            setFormData(prev => ({
                ...prev,
                screenshots: [...prev.screenshots, ...newScreenshots]
            }));
            setPreviewImages(prev => [...prev, ...newScreenshots.map(img => getImageUrl(img))]);
        } catch (err) {
            setError('Failed to upload screenshots. Make sure endpoint /api/v1/upload/multiple exists.');
        } finally {
            setUploading(false);
        }
    };

    const removeScreenshot = (index) => {
        setFormData(prev => ({
            ...prev,
            screenshots: prev.screenshots.filter((_, i) => i !== index)
        }));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (account) {
                await axios.put(`${API_URL}/api/v1/accounts/admin/${account._id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/api/v1/accounts/admin`, formData, config);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save account listing');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[1000] p-4 overflow-y-auto font-['Outfit']">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 md:p-10 max-w-5xl w-full my-4 md:my-10 relative">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
                            {account ? 'Edit Account' : 'Add New Account'}
                        </h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Ready-made game accounts</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 border border-white/5 rounded-2xl transition-all text-white/40 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Account Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                                placeholder="e.g. Master Rank Account with 200+ Skins"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Game *</label>
                            <select
                                name="gameId"
                                value={formData.gameId}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white/60 focus:outline-none"
                            >
                                <option value="">Select a game...</option>
                                {games.map(game => (
                                    <option key={game._id} value={game._id}>{game.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Rank / Level</label>
                            <input
                                type="text"
                                name="rank"
                                value={formData.rank}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                                placeholder="e.g. Global Elite / Level 100"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Region</label>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                            >
                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Price ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Skins Count</label>
                            <input
                                type="number"
                                name="specifications.skins"
                                value={formData.specifications.skins}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Champions / Heroes</label>
                            <input
                                type="number"
                                name="specifications.champions"
                                value={formData.specifications.champions}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Rare Items</label>
                            <input
                                type="text"
                                name="specifications.rareItems"
                                value={formData.specifications.rareItems}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none"
                                placeholder="e.g. Rare Skins, Legacy items"
                            />
                        </div>
                    </div>

                    {/* Screenshot Gallery */}
                    <div className="space-y-4">
                        <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest px-1">Screenshot Gallery</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {previewImages.map((src, index) => (
                                <div key={index} className="aspect-video bg-white/5 rounded-2xl border border-white/5 relative group overflow-hidden">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeScreenshot(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-video bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/[0.05] hover:border-primary/50 transition-all group"
                            >
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-white/20 group-hover:text-primary" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">Upload Photos</span>
                                    </>
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Secure Transfer Info */}
                    <div>
                        <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-3 px-1">Secure Transfer Information</label>
                        <textarea
                            name="secureTransferInfo"
                            value={formData.secureTransferInfo}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-bold text-white focus:outline-none resize-none"
                            placeholder="Explain the account transfer process..."
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-10">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="instantDelivery"
                                    checked={formData.instantDelivery}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/50 peer-checked:after:bg-primary"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className={`w-3.5 h-3.5 ${formData.instantDelivery ? 'text-primary' : 'text-white/20'}`} />
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Instant Delivery</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="secureTransfer"
                                    checked={formData.secureTransfer}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/50 peer-checked:after:bg-primary"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className={`w-3.5 h-3.5 ${formData.secureTransfer ? 'text-primary' : 'text-white/20'}`} />
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Secure Transfer</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 md:flex-none px-12 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'SAVING...' : (account ? 'UPDATE LISTING' : 'CREATE ACCOUNT LISTING')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 md:flex-none px-12 py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all border border-white/5"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountForm;
