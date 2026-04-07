import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Image as ImageIcon, Zap, Star, Save, Layout, Code } from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';
import BlogBuilder from './BlogBuilder';

const BlogForm = ({ blog, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        shortDescription: '',
        content: '',
        isFeatured: 'false',
        status: 'published',
        author: 'BoostGG Team'
    });
    const [layoutBlocks, setLayoutBlocks] = useState([]);
    const [useBuilder, setUseBuilder] = useState(true); // Default to using the builder
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        fetchCategories();
        if (blog) {
            setFormData({
                title: blog.title || '',
                category: blog.category || '',
                shortDescription: blog.shortDescription || '',
                content: blog.content || '',
                isFeatured: blog.isFeatured ? 'true' : 'false',
                status: blog.status || 'published',
                author: blog.author || 'BoostGG Team'
            });
            setImagePreview(getImageUrl(blog.image || ''));
            
            // Load layout blocks if available
            if (blog.layout && Array.isArray(blog.layout) && blog.layout.length > 0) {
                setLayoutBlocks(blog.layout);
                setUseBuilder(true);
            } else if (blog.content) {
                // Convert existing content to blocks for editing
                setUseBuilder(false);
            }
        }
    }, [blog]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/games`);
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image must be less than 10MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Add layout data if using builder
            if (useBuilder && layoutBlocks.length > 0) {
                data.append('layout', JSON.stringify(layoutBlocks));
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (blog) {
                await axios.put(`${API_URL}/api/v1/blogs/admin/${blog._id}`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                if (!imageFile) {
                    setError('Cover image is required for new articles');
                    setLoading(false);
                    return;
                }
                await axios.post(`${API_URL}/api/v1/blogs/admin`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save article');
            setLoading(false);
        }
    };

    // Convert plain HTML content to builder blocks
    const convertContentToBlocks = () => {
        if (!formData.content) return;
        
        // Simple conversion: split by paragraphs and headings
        const html = formData.content;
        const blocks = [];
        
        // Split content by HTML tags
        const parts = html.split(/(<[^>]+>)/);
        let currentParagraph = '';
        
        parts.forEach(part => {
            if (part.includes('<h1')) {
                if (currentParagraph.trim()) {
                    blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
                    currentParagraph = '';
                }
                const text = part.replace(/<[^>]*>/g, '');
                blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'heading1', content: text });
            } else if (part.includes('<h2')) {
                if (currentParagraph.trim()) {
                    blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
                    currentParagraph = '';
                }
                const text = part.replace(/<[^>]*>/g, '');
                blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'heading2', content: text });
            } else if (part.includes('<h3')) {
                if (currentParagraph.trim()) {
                    blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
                    currentParagraph = '';
                }
                const text = part.replace(/<[^>]*>/g, '');
                blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'heading3', content: text });
            } else if (part.includes('<img')) {
                if (currentParagraph.trim()) {
                    blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
                    currentParagraph = '';
                }
                const src = part.match(/src="([^"]+)"/)?.[1] || '';
                const alt = part.match(/alt="([^"]+)"/)?.[1] || '';
                blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'image', src, alt, caption: '' });
            } else if (part.includes('<blockquote')) {
                if (currentParagraph.trim()) {
                    blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
                    currentParagraph = '';
                }
                const text = part.replace(/<[^>]*>/g, '');
                blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'quote', content: text });
            } else if (!part.includes('<') && !part.includes('/>') && part.trim()) {
                currentParagraph += part;
            }
        });
        
        if (currentParagraph.trim()) {
            blocks.push({ id: `block_${Date.now()}_${Math.random()}`, type: 'paragraph', content: currentParagraph.trim() });
        }
        
        if (blocks.length > 0) {
            setLayoutBlocks(blocks);
            setUseBuilder(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[250] p-4 md:p-8 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-12 max-w-6xl w-full my-auto shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase italic tracking-tighter text-white">
                            {blog ? 'Edit Article' : 'New Article'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/40 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold italic">
                        {error}
                    </div>
                )}

                {/* Editor Mode Toggle */}
                <div className="mb-8 flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <span className="text-white/40 text-xs font-black uppercase tracking-widest">Editor Mode:</span>
                    <button
                        onClick={() => setUseBuilder(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${useBuilder ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Layout className="w-4 h-4" />
                        Visual Builder
                    </button>
                    <button
                        onClick={() => {
                            if (!useBuilder && formData.content) {
                                // Convert to blocks first
                                convertContentToBlocks();
                            }
                            setUseBuilder(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${!useBuilder ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        <Code className="w-4 h-4" />
                        HTML Editor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Article Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold placeholder:text-white/10"
                                placeholder="Enter a catchy title..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Category (Game) *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                                >
                                    <option value="" disabled className="bg-black">Select Game</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.title} className="bg-black">{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Is Featured?</label>
                                <select
                                    name="isFeatured"
                                    value={formData.isFeatured}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold appearance-none"
                                >
                                    <option value="false" className="bg-black">No</option>
                                    <option value="true" className="bg-black">Yes (Show at top)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Short Excerpt *</label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold italic placeholder:text-white/10"
                                placeholder="Brief summary of the article..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Author</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    {/* Right Column: Media & Content */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Cover Image *</label>
                            <div className="relative group cursor-pointer">
                                <label className="block">
                                    <div className={`aspect-video rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 bg-white/[0.02] ${imagePreview ? 'border-primary/50' : 'border-white/10 hover:border-primary/40'}`}>
                                        {imagePreview ? (
                                            <div className="relative w-full h-full">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                    <Upload className="w-10 h-10 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 text-white/10 mb-4" />
                                                <p className="text-white/30 text-xs font-black uppercase tracking-widest text-center">Click to upload cover image<br /><span className="text-[10px] opacity-50">(1920x1080 recommended)</span></p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">
                                {useBuilder ? 'Content (Drag & Drop)' : 'Main Content (HTML Support) *'}
                            </label>
                            
                            {useBuilder ? (
                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <BlogBuilder 
                                        value={layoutBlocks} 
                                        onChange={setLayoutBlocks}
                                        blogTitle={formData.title}
                                        blogImage={imagePreview}
                                    />
                                </div>
                            ) : (
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows="8"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold leading-relaxed placeholder:text-white/10 custom-scrollbar"
                                    placeholder="Write your masterpiece here... You can use <p>, <h3>, <strong>, etc."
                                />
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black uppercase italic tracking-widest text-xs transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] px-8 py-5 bg-primary hover:bg-primary/90 text-white rounded-[24px] font-black uppercase italic tracking-widest text-xs transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {blog ? 'Update Article' : 'Publish Article'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;
