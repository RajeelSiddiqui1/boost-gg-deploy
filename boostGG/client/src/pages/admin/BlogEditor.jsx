import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { X, Save, ArrowLeft, Heading1, Heading2, Heading3, Type, Image as ImageIcon, Video, Quote, Code, List, ListOrdered, Minus, Star, AlertCircle, GripVertical, Trash2, Plus, Columns, Calendar, User, ToggleLeft, ToggleRight, BookOpen, Info, CheckCircle, Table as TableIcon, Link, Square, Circle, Hash, Timer, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube, ExternalLink, ArrowDown, ChevronDown, GripHorizontal, Share2, Heart, Flag, Award, Zap, Shield, Target } from 'lucide-react';
import { API_URL, getImageUrl } from '../../utils/api';

const AlertIcon = AlertCircle;

const BLOCK_TYPES = [
    // Text Blocks
    { type: 'heading1', icon: Heading1, label: 'Heading 1', category: 'basic' },
    { type: 'heading2', icon: Heading2, label: 'Heading 2', category: 'basic' },
    { type: 'heading3', icon: Heading3, label: 'Heading 3', category: 'basic' },
    { type: 'paragraph', icon: Type, label: 'Text', category: 'basic' },
    { type: 'list', icon: List, label: 'Bullet List', category: 'basic' },
    { type: 'orderedList', icon: ListOrdered, label: 'Numbered List', category: 'basic' },

    // Media Blocks
    { type: 'image', icon: ImageIcon, label: 'Image', category: 'media' },
    { type: 'video', icon: Video, label: 'Video', category: 'media' },

    // Design Blocks
    { type: 'quote', icon: Quote, label: 'Quote', category: 'design' },
    { type: 'code', icon: Code, label: 'Code', category: 'design' },
    { type: 'divider', icon: Minus, label: 'Divider', category: 'design' },
    { type: 'spacer', icon: GripHorizontal, label: 'Spacer', category: 'design' },

    // Box Blocks
    { type: 'alert', icon: AlertCircle, label: 'Alert', category: 'box' },
    { type: 'callout', icon: Star, label: 'Callout', category: 'box' },
    { type: 'infoBox', icon: Info, label: 'Info Box', category: 'box' },
    { type: 'checklist', icon: CheckCircle, label: 'Checklist', category: 'box' },

    // Layout Blocks
    { type: 'columns2', icon: Columns, label: '2 Columns', category: 'layout' },
    { type: 'columns3', icon: Columns, label: '3 Columns', category: 'layout' },
    { type: 'toc', icon: BookOpen, label: 'Table of Contents', category: 'layout' },
    { type: 'table', icon: TableIcon, label: 'Table', category: 'layout' },

    // Interactive Blocks
    { type: 'button', icon: Square, label: 'Button', category: 'interactive' },
    { type: 'accordion', icon: ChevronDown, label: 'Accordion', category: 'interactive' },
    { type: 'icon', icon: Circle, label: 'Icon', category: 'interactive' },
    { type: 'social', icon: Share2, label: 'Social Links', category: 'interactive' },
    { type: 'videoEmbed', icon: Youtube, label: 'Video Embed', category: 'media' },
];

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const BlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [blogData, setBlogData] = useState({ title: '', category: '', shortDescription: '', author: 'BoostGG Team', isFeatured: false, status: 'draft' });
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [blocks, setBlocks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [columnMenu, setColumnMenu] = useState(null);
    const [expandedAccordions, setExpandedAccordions] = useState({});
    const [columnExpandedAccordions, setColumnExpandedAccordions] = useState({});

    const toggleAccordion = (blockId, itemId) => {
        const key = `${blockId}-${itemId}`;
        setExpandedAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleColumnAccordion = (blockId, itemId) => {
        const key = `col-${blockId}-${itemId}`;
        setColumnExpandedAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => { fetchCategories(); if (id) fetchBlog(); }, [id]);

    const fetchCategories = async () => { try { const res = await axios.get(`${API_URL}/api/v1/games`); setCategories(res.data.data || []); } catch (e) { console.error(e); } };
    const fetchBlog = async () => { try { setLoading(true); const token = localStorage.getItem('token'); const res = await axios.get(`${API_URL}/api/v1/blogs/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); const blog = res.data.data; if (!blog) { setError('Blog not found'); setLoading(false); return; } setBlogData({ title: blog.title || '', category: blog.category || '', shortDescription: blog.shortDescription || '', author: blog.author || 'BoostGG Team', isFeatured: blog.isFeatured || false, status: blog.status || 'draft' }); setCoverImagePreview(getImageUrl(blog.image || '')); setBlocks(blog.layout || []); setLoading(false); } catch (e) { console.error('Error fetching blog:', e); setError(e.response?.data?.error || 'Failed to load blog'); setLoading(false); } };

    const addBlock = (type) => {
        let newBlock = {
            id: generateId(),
            type: type.type,
            content: '',
            src: '',
            caption: '',
            author: '',
            alertType: 'info',
            calloutType: 'highlight',
            height: 40,
            leftWidth: 50,
            middleWidth: 33,
            rightWidth: 34,
            leftBlocks: [],
            middleBlocks: [],
            rightBlocks: []
        };

        // Set default content based on block type
        switch (type.type) {
            case 'heading1':
                newBlock.content = 'Main Heading';
                newBlock.fontSize = 'large';
                newBlock.color = '#ffffff';
                break;
            case 'heading2':
                newBlock.content = 'Section Heading';
                newBlock.fontSize = 'medium';
                newBlock.color = '#ffffff';
                break;
            case 'heading3':
                newBlock.content = 'Subsection';
                newBlock.fontSize = 'small';
                newBlock.color = '#ffffff';
                break;
            case 'paragraph':
                newBlock.content = 'Write your content here. This is a paragraph block where you can add your text content.';
                break;
            case 'image':
                newBlock.src = '';
                newBlock.alt = '';
                newBlock.caption = '';
                newBlock.width = 100;
                newBlock.height = 400;
                break;
            case 'video':
                newBlock.src = '';
                break;
            case 'quote':
                newBlock.content = 'Enter quote text here...';
                newBlock.author = 'Author Name';
                break;
            case 'code':
                newBlock.content = '// Your code here\nconsole.log("Hello World");';
                break;
            case 'alert':
                newBlock.content = 'Important information here...';
                newBlock.alertType = 'info';
                break;
            case 'list':
                newBlock.content = 'Item 1\nItem 2\nItem 3';
                break;
            case 'orderedList':
                newBlock.content = 'First item\nSecond item\nThird item';
                break;
            case 'callout':
                newBlock.content = 'Callout message...';
                newBlock.calloutType = 'highlight';
                break;
            case 'toc':
                newBlock.content = 'Introduction\nGetting Started\nMain Content\nConclusion';
                break;
            case 'infoBox':
                newBlock.content = 'Additional information here...';
                newBlock.title = 'Info Title';
                break;
            case 'checklist':
                newBlock.content = 'Item 1\nItem 2\nItem 3';
                break;
            case 'table':
                newBlock.content = 'Header 1|Header 2|Header 3\nRow 1 Col 1|Row 1 Col 2|Row 1 Col 3\nRow 2 Col 1|Row 2 Col 2|Row 2 Col 3';
                break;
            case 'button':
                newBlock.text = 'Click Here';
                newBlock.url = '#';
                newBlock.buttonStyle = 'primary';
                break;
            case 'accordion':
                newBlock.items = [{ id: generateId(), title: 'Click to expand', content: 'Accordion content goes here...' }];
                break;
            case 'icon':
                newBlock.iconName = 'star';
                newBlock.iconSize = 48;
                newBlock.iconColor = '#FFD700';
                newBlock.url = '';
                break;
            case 'social':
                newBlock.facebook = '';
                newBlock.twitter = '';
                newBlock.instagram = '';
                newBlock.youtube = '';
                break;
            case 'videoEmbed':
                newBlock.videoUrl = '';
                newBlock.videoType = 'youtube';
                break;
            case 'spacer':
                newBlock.height = 40;
                break;
            case 'divider':
                newBlock.style = 'solid';
                break;
        }

        setBlocks([...blocks, newBlock]);
        setSelectedBlock(newBlock.id);
    };

    const addToColumn = (parentId, column, blockType) => {
        const newBlock = { id: generateId(), type: blockType.type, content: blockType.defaultContent || '', src: '' };
        setBlocks(blocks.map(b => b.id === parentId ? { ...b, [column]: [...(b[column] || []), newBlock] } : b)); setColumnMenu(null);
    };

    const updateBlock = (blockId, updates) => setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
    const updateColumnBlock = (parentId, column, blockId, updates) => {
        setBlocks(blocks.map(b => {
            if (b.id === parentId) {
                return {
                    ...b,
                    [column]: b[column].map(cb => cb.id === blockId ? { ...cb, ...updates } : cb)
                };
            }
            return b;
        }));
    };

    const deleteColumnBlock = (blockId) => {
        // Find and remove from columns
        setBlocks(blocks.map(b => {
            const newB = { ...b };
            if (b.leftBlocks) newB.leftBlocks = b.leftBlocks.filter(cb => cb.id !== blockId);
            if (b.rightBlocks) newB.rightBlocks = b.rightBlocks.filter(cb => cb.id !== blockId);
            if (b.middleBlocks) newB.middleBlocks = b.middleBlocks.filter(cb => cb.id !== blockId);
            return newB;
        }));
    };
    const deleteBlock = (blockId) => { setBlocks(blocks.filter(b => b.id !== blockId)); if (selectedBlock === blockId) setSelectedBlock(null); };
    const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { setCoverImage(file); setCoverImagePreview(URL.createObjectURL(file)); } };

    const handleSave = async (publish = false) => {
        if (!blogData.title) { setError('Title required'); return; }
        if (!blogData.category) { setError('Category required'); return; }
        setSaving(true); setError('');
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            const statusToSave = publish ? 'published' : (blogData.status || 'draft');
            Object.keys(blogData).forEach(key => data.append(key, key === 'isFeatured' ? (blogData[key] ? 'true' : 'false') : key === 'status' ? statusToSave : blogData[key]));
            data.append('layout', JSON.stringify(blocks));
            if (coverImage) data.append('image', coverImage);
            if (id) { await axios.put(`${API_URL}/api/v1/blogs/admin/${id}`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); }
            else { if (!coverImage && publish) { setError('Cover image required'); setSaving(false); return; } await axios.post(`${API_URL}/api/v1/blogs/admin`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); }
            navigate('/admin/blogs');
        } catch (err) {
            let errorMsg = 'Save failed';
            if (err.response?.data?.error) {
                errorMsg = typeof err.response.data.error === 'string' ? err.response.data.error : JSON.stringify(err.response.data.error);
            } else if (err.message) {
                errorMsg = err.message;
            }
            setError(errorMsg);
            setSaving(false);
        }
    };

    const renderColumnBlock = (block) => {
        const getHeadingSize = (type, fontSize) => {
            const baseSizes = { heading1: 'text-5xl', heading2: 'text-3xl', heading3: 'text-xl' };
            const sizes = { small: { heading1: 'text-3xl', heading2: 'text-2xl', heading3: 'text-lg' }, default: baseSizes, large: { heading1: 'text-6xl', heading2: 'text-4xl', heading3: 'text-2xl' }, xlarge: { heading1: 'text-7xl', heading2: 'text-5xl', heading3: 'text-3xl' } };
            return sizes[fontSize || 'default'][type];
        };

        const handleImageUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    // Find parent and update
                    blocks.forEach(b => {
                        if (b.leftBlocks) {
                            const found = b.leftBlocks.find(cb => cb.id === block.id);
                            if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { src: reader.result }); return; }
                        }
                        if (b.rightBlocks) {
                            const found = b.rightBlocks.find(cb => cb.id === block.id);
                            if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { src: reader.result }); return; }
                        }
                        if (b.middleBlocks) {
                            const found = b.middleBlocks.find(cb => cb.id === block.id);
                            if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { src: reader.result }); return; }
                        }
                    });
                };
                reader.readAsDataURL(file);
            }
        };

        switch (block.type) {
            case 'heading1': return <input type="text" value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className={`${getHeadingSize('heading1', block.fontSize)} font-black italic uppercase bg-transparent border-none outline-none w-full`} style={{ color: block.color }} placeholder="Heading 1" />;
            case 'heading2': return <input type="text" value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className={`${getHeadingSize('heading2', block.fontSize)} font-black italic uppercase bg-transparent border-none outline-none w-full`} style={{ color: block.color }} placeholder="Heading 2" />;
            case 'heading3': return <input type="text" value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className={`${getHeadingSize('heading3', block.fontSize)} font-black italic uppercase bg-transparent border-none outline-none w-full`} style={{ color: block.color }} placeholder="Heading 3" />;
            case 'paragraph': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 text-lg outline-none focus:border-primary" rows={3} placeholder="Write your text here..." />;
            case 'image': return (
                <div className="relative group">
                    {block.src ? (
                        <>
                            <img src={block.src.startsWith('data:') ? block.src : getImageUrl(block.src)} alt="" className="rounded-xl" style={{ width: block.width ? `${block.width}%` : '100%', height: block.height ? `${block.height}px` : 'auto', objectFit: 'cover' }} />
                            <button onClick={() => deleteColumnBlock(block.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-white" /></button>
                            {/* Inline controls */}
                            <div className="mt-2 p-2 bg-black/80 rounded-lg flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <input type="number" value={block.width || 100} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { width: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { width: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { width: e.target.value }); return; } } }); }} className="bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white w-20" placeholder="Width %" />
                                <input type="number" value={block.height || 400} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { height: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { height: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { height: e.target.value }); return; } } }); }} className="bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white w-20" placeholder="Height" />
                            </div>
                        </>
                    ) : (
                        <label className="cursor-pointer block w-full"><div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10"><ImageIcon className="w-10 h-10 text-white/20" /></div><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                    )}
                </div>
            );
            case 'video': return (
                <div className="relative group">
                    {block.src ? (
                        <>
                            <div className="aspect-video bg-black rounded-xl"><iframe src={block.src.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} className="w-full h-full" allowFullScreen /></div>
                            <button onClick={() => deleteColumnBlock(block.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-white" /></button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label className="cursor-pointer block w-full"><div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10"><Video className="w-10 h-10 text-white/20" /><span className="ml-2 text-white/40 text-xs">Upload Video</span></div><input type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = () => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { src: reader.result }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { src: reader.result }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { src: reader.result }); return; } } }); }; reader.readAsDataURL(file); } }} /></label>
                        </div>
                    )}
                </div>
            );
            case 'quote': return (
                <div className="space-y-2">
                    <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xl italic outline-none focus:border-primary" rows={2} placeholder="Quote text..." />
                    <input type="text" value={block.author || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { author: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { author: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { author: e.target.value }); return; } } }); }} className="w-full bg-transparent border-none text-primary text-sm outline-none" placeholder="Author name" />
                </div>
            );
            case 'code': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-black p-4 rounded-xl text-green-400 font-mono text-sm outline-none" rows={4} placeholder="Code here..." />;
            case 'divider': return <hr className="border-white/10 my-8" />;
            case 'alert': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className={`w-full bg-transparent border-none outline-none rounded-xl p-4 ${block.alertType === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : block.alertType === 'success' ? 'bg-green-500/20 text-green-500' : block.alertType === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`} rows={2} placeholder="Alert message..." />;
            case 'list': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" rows={4} placeholder="Item 1&#10;Item 2&#10;Item 3" />;
            case 'orderedList': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" rows={4} placeholder="Item 1&#10;Item 2&#10;Item 3" />;
            case 'callout': return <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border-none outline-none rounded-xl p-4 bg-primary/20 border border-primary/30 text-white/70" rows={2} placeholder="Callout text..." />;
            case 'toc': return (
                <div className="space-y-2">
                    <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" rows={4} placeholder="Introduction&#10;Getting Started&#10;Advanced Tips" />
                    <p className="text-white/30 text-xs">Enter each item on a new line</p>
                </div>
            );
            case 'infoBox': return (
                <div className="space-y-2">
                    <input type="text" value={block.title || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { title: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { title: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { title: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" placeholder="Title" />
                    <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" rows={3} placeholder="Information content..." />
                </div>
            );
            case 'checklist': return (
                <div className="space-y-2">
                    <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" rows={4} placeholder="Item 1&#10;Item 2&#10;Item 3" />
                    <p className="text-white/30 text-xs">Enter each item on a new line</p>
                </div>
            );
            case 'table': return (
                <div className="space-y-2">
                    <textarea value={block.content} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { content: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { content: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { content: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary font-mono text-xs" rows={5} placeholder="Header1 | Header2 | Header3&#10;Cell1 | Cell2 | Cell3&#10;Cell4 | Cell5 | Cell6" />
                    <p className="text-white/30 text-xs">Use | to separate columns</p>
                </div>
            );
            case 'button': return (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <input type="text" value={block.text || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { text: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { text: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { text: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" placeholder="Button Text" />
                    <input type="text" value={block.url || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { url: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { url: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { url: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" placeholder="https://example.com" />
                    <select value={block.buttonStyle || 'primary'} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { buttonStyle: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { buttonStyle: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { buttonStyle: e.target.value }); return; } } }); }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary">
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                    </select>
                </div>
            );
            case 'accordion': return (
                <div className="space-y-3">
                    {(block.items && block.items.length > 0 ? block.items : [{ id: 'default', title: block.title || '', content: block.content || '' }]).map((item, idx) => {
                        const isExpanded = columnExpandedAccordions[`col-${block.id}-${item.id}`] !== false;
                        return (
                            <div key={item.id || idx} className="bg-white/5 rounded-xl p-3">
                                <div
                                    className="flex items-center justify-between mb-2 cursor-pointer"
                                    onClick={() => toggleColumnAccordion(block.id, item.id)}
                                >
                                    <span className="text-white text-sm font-semibold">Item {idx + 1}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                {isExpanded && (
                                    <>
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => {
                                                const newItems = [...(block.items || [])];
                                                newItems[idx] = { ...newItems[idx], title: e.target.value };
                                                blocks.forEach(b => {
                                                    if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { items: newItems }); return; } }
                                                    if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { items: newItems }); return; } }
                                                    if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { items: newItems }); return; } }
                                                });
                                            }}
                                            className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary mb-2"
                                            placeholder="Accordion Title"
                                        />
                                        <textarea
                                            value={item.content || ''}
                                            onChange={(e) => {
                                                const newItems = [...(block.items || [])];
                                                newItems[idx] = { ...newItems[idx], content: e.target.value };
                                                blocks.forEach(b => {
                                                    if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { items: newItems }); return; } }
                                                    if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { items: newItems }); return; } }
                                                    if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { items: newItems }); return; } }
                                                });
                                            }}
                                            className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary"
                                            rows={3}
                                            placeholder="Accordion content..."
                                        />
                                    </>
                                )}
                                {((block.items && block.items.length > 0 ? block.items : [{ id: 'default' }]).length > 1) && (
                                    <button
                                        onClick={() => {
                                            const itemsToFilter = block.items && block.items.length > 0 ? block.items : [{ id: 'default', title: block.title, content: block.content }];
                                            const newItems = itemsToFilter.filter((_, i) => i !== idx);
                                            blocks.forEach(b => {
                                                if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { items: newItems }); return; } }
                                                if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { items: newItems }); return; } }
                                                if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { items: newItems }); return; } }
                                            });
                                        }}
                                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                                    >
                                        Remove Item
                                    </button>
                                )}
                            </div>
                        )
                    })}
                    <button
                        onClick={() => {
                            const newItems = [...(block.items || []), { id: generateId(), title: '', content: '' }];
                            blocks.forEach(b => {
                                if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { items: newItems }); return; } }
                                if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { items: newItems }); return; } }
                                if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { items: newItems }); return; } }
                            });
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary text-xs"
                    >
                        <Plus className="w-3 h-3" /> Add Accordion Item
                    </button>
                </div>
            );
            case 'icon': return (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <select value={block.iconName || 'star'} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { iconName: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { iconName: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { iconName: e.target.value }); return; } } }); }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary">
                        <option value="star">Star</option>
                        <option value="heart">Heart</option>
                        <option value="check">Check</option>
                        <option value="flag">Flag</option>
                        <option value="award">Award</option>
                        <option value="zap">Zap</option>
                        <option value="shield">Shield</option>
                        <option value="target">Target</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-white/50 text-xs mb-1 block">Size</label>
                            <input type="number" value={block.iconSize || 48} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { iconSize: parseInt(e.target.value) }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { iconSize: parseInt(e.target.value) }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { iconSize: parseInt(e.target.value) }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-white/50 text-xs mb-1 block">Color</label>
                            <input type="color" value={block.iconColor || '#FFD700'} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { iconColor: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { iconColor: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { iconColor: e.target.value }); return; } } }); }} className="w-full h-10 bg-transparent border border-white/10 rounded-lg" />
                        </div>
                    </div>
                    <input type="text" value={block.url || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { url: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { url: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { url: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" placeholder="Link URL (optional)" />
                </div>
            );
            case 'social': return (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-blue-500" />
                            <input type="text" value={block.facebook || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { facebook: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { facebook: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { facebook: e.target.value }); return; } } }); }} className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm" placeholder="Facebook URL" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-blue-400" />
                            <input type="text" value={block.twitter || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { twitter: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { twitter: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { twitter: e.target.value }); return; } } }); }} className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm" placeholder="Twitter URL" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <input type="text" value={block.instagram || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { instagram: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { instagram: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { instagram: e.target.value }); return; } } }); }} className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm" placeholder="Instagram URL" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Youtube className="w-4 h-4 text-red-500" />
                            <input type="text" value={block.youtube || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { youtube: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { youtube: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { youtube: e.target.value }); return; } } }); }} className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm" placeholder="YouTube URL" />
                        </div>
                    </div>
                </div>
            );
            case 'videoEmbed': return (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <select value={block.videoType || 'youtube'} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { videoType: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { videoType: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { videoType: e.target.value }); return; } } }); }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary">
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="direct">Direct URL</option>
                    </select>
                    <input type="text" value={block.videoUrl || ''} onChange={(e) => { blocks.forEach(b => { if (b.leftBlocks) { const found = b.leftBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'leftBlocks', block.id, { videoUrl: e.target.value }); return; } } if (b.rightBlocks) { const found = b.rightBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'rightBlocks', block.id, { videoUrl: e.target.value }); return; } } if (b.middleBlocks) { const found = b.middleBlocks.find(cb => cb.id === block.id); if (found) { updateColumnBlock(b.id, 'middleBlocks', block.id, { videoUrl: e.target.value }); return; } } }); }} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 outline-none focus:border-primary" placeholder="Video URL or Embed Code" />
                </div>
            );
            default: return null;
        }
    };

    const renderBlockPreview = (block) => {
        if (block.type === 'columns2') {
            const leftW = block.leftWidth || 50;
            const rightW = 100 - leftW;
            return (
                <div className="grid gap-4 my-4" style={{ gridTemplateColumns: `${leftW}% ${rightW}%` }}>
                    {['leftBlocks', 'rightBlocks'].map((colKey, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 min-h-[100px]">
                            <div className="space-y-2">{block[colKey].map((b, i) => <div key={i}>{renderColumnBlock(b)}</div>)}</div>
                            <div className="relative mt-2">
                                <p className="text-white/30 text-xs text-center mb-2">{idx === 0 ? 'Left' : 'Right'} Column</p>
                                <div className="flex justify-center">
                                    <button onClick={() => setColumnMenu(block.id + '-' + colKey)} className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                                </div>
                                {columnMenu === block.id + '-' + colKey && (
                                    <div className="absolute top-full mt-2 left-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 z-50 max-h-64 overflow-y-auto">
                                        {BLOCK_TYPES.filter(t => !['columns2', 'columns3', 'spacer'].includes(t.type)).map(t => { const Icon = t.icon; return <button key={t.type} onClick={() => addToColumn(block.id, colKey, t)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 text-xs"><Icon className="w-4 h-4 text-primary" />{t.label}</button>; })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (block.type === 'columns3') {
            const leftW = block.leftWidth || 33;
            const midW = block.middleWidth || 33;
            const rightW = 100 - leftW - midW;
            return (
                <div className="grid gap-4 my-4" style={{ gridTemplateColumns: `${leftW}% ${midW}% ${rightW}%` }}>
                    {['leftBlocks', 'middleBlocks', 'rightBlocks'].map((colKey, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 min-h-[100px]">
                            <div className="space-y-2">{block[colKey].map((b, i) => <div key={i}>{renderColumnBlock(b)}</div>)}</div>
                            <div className="relative mt-2">
                                <p className="text-white/30 text-xs text-center mb-2">{idx === 0 ? 'Left' : idx === 1 ? 'Middle' : 'Right'}</p>
                                <div className="flex justify-center">
                                    <button onClick={() => setColumnMenu(block.id + '-' + colKey)} className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary text-xs"><Plus className="w-3 h-3" /></button>
                                </div>
                                {columnMenu === block.id + '-' + colKey && (
                                    <div className="absolute top-full mt-2 left-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 z-50 max-h-64 overflow-y-auto">
                                        {BLOCK_TYPES.filter(t => !['columns2', 'columns3', 'spacer'].includes(t.type)).map(t => { const Icon = t.icon; return <button key={t.type} onClick={() => addToColumn(block.id, colKey, t)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 text-xs"><Icon className="w-4 h-4 text-primary" />{t.label}</button>; })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (block.type === 'spacer') return <div style={{ height: block.height }} />;
        if (block.type === 'toc') {
            return (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-4">
                    <div className="text-white/60 text-xs uppercase mb-3 font-bold tracking-wider">Table of Contents</div>
                    <div className="space-y-1">
                        {block.content?.split('\n').filter(i => i.trim()).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/50 text-sm hover:text-primary cursor-pointer">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                {item}
                            </div>
                        )) || <div className="text-white/30 text-sm">Add items to generate TOC...</div>}
                    </div>
                </div>
            );
        }
        if (block.type === 'infoBox') {
            return (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 my-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Info className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-blue-400 text-sm font-bold">{block.title || 'Information'}</div>
                    </div>
                    <div className="text-white/70 text-sm">{block.content || 'Add your information here...'}</div>
                </div>
            );
        }
        if (block.type === 'checklist') {
            return (
                <div className="my-4 space-y-2">
                    <div className="text-white/60 text-xs uppercase mb-2 font-bold tracking-wider">Checklist</div>
                    <div className="space-y-2">
                        {block.content?.split('\n').filter(i => i.trim()).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                                <div className="w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center">
                                </div>
                                <span className="text-white/70 text-sm">{item}</span>
                            </div>
                        )) || <div className="text-white/30 text-sm">Add items to create checklist...</div>}
                    </div>
                </div>
            );
        }
        if (block.type === 'table') {
            const rows = block.content?.split('\n') || [];
            return (
                <div className="my-4 overflow-x-auto">
                    <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
                        <thead>
                            <tr className="bg-white/5">
                                {rows[0]?.split('|').map((header, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-white/60 font-semibold">{header.trim()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(1).map((row, i) => (
                                <tr key={i} className="border-t border-white/5">
                                    {row.split('|').map((cell, j) => (
                                        <td key={j} className="px-4 py-3 text-white/70">{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (block.type === 'button') {
            const buttonStyles = {
                primary: 'bg-primary text-white hover:bg-primary/80',
                secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
                outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10',
                ghost: 'bg-transparent text-white hover:bg-white/10'
            };
            return (
                <div className="my-4 py-2 flex justify-center">
                    <a href={block.url || '#'} className={`inline-block px-8 py-4 rounded-xl font-bold text-sm transition-all ${buttonStyles[block.buttonStyle] || buttonStyles.primary}`}>
                        {block.text || 'Click Here'}
                    </a>
                </div>
            );
        }
        if (block.type === 'accordion') {
            const accordionItems = block.items && block.items.length > 0
                ? block.items
                : [{ id: 'default', title: block.title || 'Click to expand', content: block.content || 'Accordion content...' }];
            return (
                <div className="my-4 space-y-2">
                    {accordionItems.map((item, idx) => {
                        const isExpanded = expandedAccordions[`${block.id}-${item.id}`] !== false;
                        return (
                            <div key={item.id || idx} className="border border-white/10 rounded-xl overflow-hidden">
                                <div
                                    className="bg-white/5 p-4 flex items-center justify-between cursor-pointer hover:bg-white/10"
                                    onClick={() => toggleAccordion(block.id, item.id)}
                                >
                                    <span className="text-white font-semibold">{item.title || 'Click to expand'}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                {isExpanded && (
                                    <div className="p-4 text-white/70 text-sm bg-black/20">
                                        {item.content || 'Accordion content...'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        if (block.type === 'icon') {
            const iconMap = { star: Star, heart: Heart, check: CheckCircle, flag: Flag, award: Award, zap: Zap, shield: Shield, target: Target };
            const IconComponent = iconMap[block.iconName] || Star;
            const content = (
                <IconComponent
                    size={block.iconSize || 48}
                    style={{ color: block.iconColor || '#FFD700' }}
                />
            );
            if (block.url) {
                return <div className="my-4 flex justify-center"><a href={block.url}>{content}</a></div>;
            }
            return <div className="my-4 flex justify-center">{content}</div>;
        }
        if (block.type === 'social') {
            return (
                <div className="my-4 flex justify-center gap-4">
                    {block.facebook && <a href={block.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-6 h-6 text-blue-500 hover:scale-110 transition-transform" /></a>}
                    {block.twitter && <a href={block.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="w-6 h-6 text-blue-400 hover:scale-110 transition-transform" /></a>}
                    {block.instagram && <a href={block.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-6 h-6 text-pink-500 hover:scale-110 transition-transform" /></a>}
                    {block.youtube && <a href={block.youtube} target="_blank" rel="noopener noreferrer"><Youtube className="w-6 h-6 text-red-500 hover:scale-110 transition-transform" /></a>}
                </div>
            );
        }
        if (block.type === 'videoEmbed') {
            return (
                <div className="my-4 aspect-video bg-black rounded-xl flex items-center justify-center border border-white/10">
                    {block.videoUrl ? (
                        <iframe
                            src={block.videoUrl}
                            className="w-full h-full rounded-xl"
                            title="Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="text-white/30 text-center">
                            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Add video URL</p>
                        </div>
                    )}
                </div>
            );
        }
        return renderColumnBlock(block);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="bg-[#0A0A0A] border-b border-white/10 px-6 py-4 flex items-center justify-between z-[60] relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/blogs')} className="p-2 hover:bg-white/5 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                    <h1 className="text-xl font-black italic uppercase">{id ? 'Edit Article' : 'New Article'}</h1>
                </div>
            </header>
            {error && <div className="mx-6 mt-4 p-4 bg-red-500/20 text-red-500 rounded-xl">{String(error)}</div>}
            <div className="flex flex-1">
                <aside className={`w-64 bg-[#0A0A0A] border-r border-white/10 p-4 overflow-y-auto transition-all ${selectedBlock ? 'hidden' : 'block'}`}>
                    <h3 className="text-xs font-black uppercase text-white/40 mb-4">Settings</h3>
                    <div className="space-y-4">
                        <div><label className="text-white/40 text-xs block mb-1">Title *</label><input type="text" value={blogData.title} onChange={(e) => setBlogData({ ...blogData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
                        <div><label className="text-white/40 text-xs block mb-1">Category *</label><select value={blogData.category} onChange={(e) => setBlogData({ ...blogData, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white" style={{ colorScheme: 'dark' }}><option value="" style={{ background: '#1a1a1a', color: '#fff' }}>Select a category</option>{categories.map(c => <option key={c._id} value={c.name || c.title} style={{ background: '#1a1a1a', color: '#fff' }}>{c.name || c.title}</option>)}</select></div>
                        <div><label className="text-white/40 text-xs block mb-1">Excerpt</label><textarea value={blogData.shortDescription} onChange={(e) => setBlogData({ ...blogData, shortDescription: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
                        <div><label className="text-white/40 text-xs block mb-1">Author</label><input type="text" value={blogData.author} onChange={(e) => setBlogData({ ...blogData, author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
                        <div className="flex items-center justify-between"><span className="text-white/40 text-xs">Featured</span><button onClick={() => setBlogData({ ...blogData, isFeatured: !blogData.isFeatured })}>{blogData.isFeatured ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-white/30" />}</button></div>
                        <div><label className="text-white/40 text-xs block mb-1">Status</label><select value={blogData.status || 'draft'} onChange={(e) => setBlogData({ ...blogData, status: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" style={{ colorScheme: 'dark' }}><option value="draft" style={{ background: '#1a1a1a', color: '#fff' }}>Draft</option><option value="published" style={{ background: '#1a1a1a', color: '#fff' }}>Published</option></select></div>
                        <button onClick={() => handleSave(true)} disabled={saving} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black uppercase text-xs">Publish Now</button>
                        <div><label className="text-white/40 text-xs block mb-1">Cover Image *</label><label className="cursor-pointer block"><div className={`aspect-video rounded-lg border-2 border-dashed ${coverImagePreview ? 'border-primary' : 'border-white/10'} flex items-center justify-center`}>{coverImagePreview ? <img src={coverImagePreview} alt="" className="w-full h-full object-cover rounded-lg" /> : <><ImageIcon className="w-8 h-8 text-white/20" /><span className="text-white/30 text-xs ml-2">Click</span></>}</div><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label></div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-xs font-black uppercase text-white/40 mb-4">Add Blocks</h3>
                        <div className="space-y-2">{BLOCK_TYPES.map(t => { const Icon = t.icon; return <button key={t.type} onClick={() => addBlock(t)} className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white"><Icon className="w-5 h-5 text-primary" /><span className="text-sm font-bold">{t.label}</span></button>; })}</div>
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto p-8 bg-[#050505]">
                    <div className={`mx-auto transition-all ${selectedBlock ? 'max-w-6xl' : 'max-w-3xl'}`}>
                        <div className="text-center mb-8"><span className="text-white/30 text-xs font-black uppercase">Preview</span></div>
                        <div className="flex gap-3 mb-6">
                            <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black uppercase text-xs"><span>💾</span>{saving ? 'Saving...' : 'Save Draft'}</button>
                            <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black uppercase text-xs"><span>✅</span>{saving ? 'Publishing...' : 'Publish'}</button>
                        </div>
                        <div className="bg-[#0A0A0A] rounded-[32px] border border-white/5 overflow-hidden">
                            {coverImagePreview && <div className="aspect-[2/1]"><img src={coverImagePreview} alt="" className="w-full h-full object-cover" /></div>}
                            <div className="p-8">
                                <h1 className="text-4xl font-black italic uppercase mb-4">{blogData.title || 'Your Title'}</h1>
                                <div className="flex items-center gap-4 text-white/30 text-xs font-black uppercase mb-8 pb-8 border-b border-white/10"><span><Calendar className="w-3 h-3 inline" /> {new Date().toLocaleDateString()}</span><span><User className="w-3 h-3 inline" /> {blogData.author}</span>{blogData.category && <span className="text-primary">{blogData.category}</span>}</div>
                                {blocks.length === 0 ? <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl"><Plus className="w-10 h-10 text-white/20 mx-auto mb-3" /><p className="text-white/40">Click blocks on left to add</p></div> : <div className="space-y-2">{blocks.map(b => <div key={b.id} className={`relative group rounded-xl p-2 -mx-2 ${selectedBlock === b.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-white/5'}`}>
                                    {/* Block Toolbar */}
                                    <div className="flex items-center justify-between mb-2 opacity-100">
                                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-grab"><GripVertical className="w-4 h-4 text-white/50" /></button>
                                        <button onClick={() => deleteBlock(b.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div onClick={() => setSelectedBlock(b.id)}>{renderBlockPreview(b)}</div>
                                </div>)}</div>}
                            </div>
                        </div>
                    </div>
                </main>
                {selectedBlock && (() => {
                    const block = blocks.find(b => b.id === selectedBlock); if (!block) return null; return (
                        <aside className="w-72 bg-[#0A0A0A] border-l border-white/10 p-4 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-black uppercase text-white/40">Edit {block.type}</h3><button onClick={() => setSelectedBlock(null)}><X className="w-4 h-4 text-white/30" /></button></div>
                            <div className="space-y-4">
                                {/* Layout Options */}
                                {block.type === 'columns2' && (
                                    <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Columns className="w-4 h-4 text-primary" />
                                            <span className="text-white text-xs font-bold">2 Column Layout</span>
                                        </div>
                                        <div>
                                            <label className="text-white/50 text-xs block mb-1">Left Column Width</label>
                                            <input
                                                type="range"
                                                min="20"
                                                max="80"
                                                value={block.leftWidth || 50}
                                                onChange={(e) => updateBlock(block.id, { leftWidth: parseInt(e.target.value) })}
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-white/40 mt-1">
                                                <span>Left: {block.leftWidth || 50}%</span>
                                                <span>Right: {100 - (block.leftWidth || 50)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {block.type === 'columns3' && (
                                    <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Columns className="w-4 h-4 text-primary" />
                                            <span className="text-white text-xs font-bold">3 Column Layout</span>
                                        </div>
                                        <div>
                                            <label className="text-white/50 text-xs block mb-1">Left Column Width</label>
                                            <input
                                                type="range"
                                                min="15"
                                                max="40"
                                                value={block.leftWidth || 33}
                                                onChange={(e) => updateBlock(block.id, { leftWidth: parseInt(e.target.value) })}
                                                className="w-full accent-primary"
                                            />
                                            <div className="text-xs text-white/40 text-right">{block.leftWidth || 33}%</div>
                                        </div>
                                        <div>
                                            <label className="text-white/50 text-xs block mb-1">Middle Column Width</label>
                                            <input
                                                type="range"
                                                min="15"
                                                max="40"
                                                value={block.middleWidth || 33}
                                                onChange={(e) => updateBlock(block.id, { middleWidth: parseInt(e.target.value) })}
                                                className="w-full accent-primary"
                                            />
                                            <div className="text-xs text-white/40 text-right">{block.middleWidth || 33}%</div>
                                        </div>
                                        <div className="pt-2 border-t border-white/10">
                                            <div className="flex justify-between text-xs font-bold text-white/70">
                                                <span>Left: {block.leftWidth || 33}%</span>
                                                <span>Middle: {block.middleWidth || 33}%</span>
                                                <span>Right: {100 - ((block.leftWidth || 33) + (block.middleWidth || 33))}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {block.type === 'spacer' && <div><label className="text-white/40 text-xs block mb-1">Height (px)</label><input type="number" value={block.height} onChange={(e) => updateBlock(block.id, { height: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>}

                                {/* Text Content Blocks */}
                                {['heading1', 'heading2', 'heading3', 'paragraph', 'quote', 'code', 'alert', 'list', 'orderedList', 'callout', 'toc', 'infoBox', 'checklist'].includes(block.type) && <div><label className="text-white/40 text-xs block mb-1">Content</label><textarea value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>}

                                {/* Table Block */}
                                {block.type === 'table' && <div><label className="text-white/40 text-xs block mb-1">Table Content (use | to separate columns)</label><textarea value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} rows={6} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono" placeholder="Header 1|Header 2|Header 3" /></div>}

                                {/* Button Block */}
                                {block.type === 'button' && <>
                                    <div><label className="text-white/40 text-xs block mb-1">Button Text</label><input type="text" value={block.text || ''} onChange={(e) => updateBlock(block.id, { text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Link URL</label><input type="text" value={block.url || ''} onChange={(e) => updateBlock(block.id, { url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="https://" /></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Button Style</label><select value={block.buttonStyle || 'primary'} onChange={(e) => updateBlock(block.id, { buttonStyle: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option><option value="ghost">Ghost</option></select></div>
                                </>}
                                {['heading1', 'heading2', 'heading3'].includes(block.type) && <>
                                    <div><label className="text-white/40 text-xs block mb-1">Text Color</label><div className="flex gap-2"><input type="color" value={block.color || '#ffffff'} onChange={(e) => updateBlock(block.id, { color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><input type="text" value={block.color || '#ffffff'} onChange={(e) => updateBlock(block.id, { color: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Font Size</label><select value={block.fontSize || 'default'} onChange={(e) => updateBlock(block.id, { fontSize: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"><option value="small">Small</option><option value="default">Default</option><option value="large">Large</option><option value="xlarge">Extra Large</option></select></div>
                                </>}
                                {block.type === 'quote' && <div><label className="text-white/40 text-xs block mb-1">Author</label><input type="text" value={block.author || ''} onChange={(e) => updateBlock(block.id, { author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>}
                                {block.type === 'alert' && <div><label className="text-white/40 text-xs block mb-1">Type</label><select value={block.alertType || 'info'} onChange={(e) => updateBlock(block.id, { alertType: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option></select></div>}
                                {block.type === 'callout' && <div><label className="text-white/40 text-xs block mb-1">Type</label><select value={block.calloutType || 'highlight'} onChange={(e) => updateBlock(block.id, { calloutType: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"><option value="highlight">Highlight</option><option value="tip">Tip</option><option value="note">Note</option></select></div>}
                                {block.type === 'image' && <>
                                    <div><label className="text-white/40 text-xs block mb-1">Image</label><label className="cursor-pointer block"><div className="aspect-video rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10">{block.src ? <img src={block.src.startsWith('data:') ? block.src : getImageUrl(block.src)} alt="" className="w-full h-full object-cover rounded-lg" /> : <><ImageIcon className="w-8 h-8 text-white/20" /><span className="text-white/30 text-xs ml-2">Click to upload</span></>}</div><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = () => { updateBlock(block.id, { src: reader.result }); }; reader.readAsDataURL(file); } }} /></label></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Alt Text</label><input type="text" value={block.alt || ''} onChange={(e) => updateBlock(block.id, { alt: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="Image description" /></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Caption</label><input type="text" value={block.caption || ''} onChange={(e) => updateBlock(block.id, { caption: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="Optional caption" /></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Width (%)</label><input type="number" value={block.width || 100} onChange={(e) => updateBlock(block.id, { width: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" min="10" max="100" /></div>
                                    <div><label className="text-white/40 text-xs block mb-1">Height (px)</label><input type="number" value={block.height || 400} onChange={(e) => updateBlock(block.id, { height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
                                </>}
                                {block.type === 'video' && <div><label className="text-white/40 text-xs block mb-1">YouTube URL</label><input type="text" value={block.src || ''} onChange={(e) => updateBlock(block.id, { src: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="https://youtube.com/watch?v=..." /></div>}

                                {/* InfoBox Options */}
                                {block.type === 'infoBox' && <div><label className="text-white/40 text-xs block mb-1">Title</label><input type="text" value={block.title || ''} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="Info box title" /></div>}

                                {/* Accordion in Columns - need separate expand state */}

                                {/* Accordion Options */}
                                {block.type === 'accordion' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-white/40 text-xs">Accordion Items</label>
                                            <button
                                                onClick={() => updateBlock(block.id, { items: [...(block.items || []), { id: generateId(), title: '', content: '' }] })}
                                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Item
                                            </button>
                                        </div>
                                        {(block.items || []).map((item, idx) => (
                                            <div key={item.id} className="p-3 bg-white/5 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/50 text-xs">Item {idx + 1}</span>
                                                    {(block.items || []).length > 1 && (
                                                        <button
                                                            onClick={() => updateBlock(block.id, { items: (block.items || []).filter((_, i) => i !== idx) })}
                                                            className="text-xs text-red-400 hover:text-red-300"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={item.title || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...(block.items || [])];
                                                        newItems[idx] = { ...newItems[idx], title: e.target.value };
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                                    placeholder="Title"
                                                />
                                                <textarea
                                                    value={item.content || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...(block.items || [])];
                                                        newItems[idx] = { ...newItems[idx], content: e.target.value };
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                    className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm"
                                                    rows={3}
                                                    placeholder="Content"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    );
                })()}
            </div>
        </div>
    );
};

export default BlogEditor;
