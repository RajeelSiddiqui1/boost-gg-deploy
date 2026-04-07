import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    Search,
    Star,
    BookOpen,
    Send
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_URL, getImageUrl } from '../../utils/api';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/v1/blogs`, {
                params: {
                    search: searchTerm,
                    status: 'all'
                }
            });
            setBlogs(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [searchTerm]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/v1/blogs/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBlogs();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };

    const handleToggleFeatured = async (blog) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/v1/blogs/admin/${blog._id}`,
                { isFeatured: !blog.isFeatured ? 'true' : 'false' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchBlogs();
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const publishBlog = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/v1/blogs/admin/${id}`,
                { status: 'published' },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            fetchBlogs();
        } catch (error) {
            console.error('Error publishing blog:', error);
        }
    };

    if (loading && blogs.length === 0) {
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Blog Management</h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">Create and manage guides, articles, and news</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/blogs/new')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Article
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all"
                    />
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <div key={blog._id} className="bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden group hover:border-primary/30 transition-all">
                            {/* Image */}
                            <div className="aspect-video relative overflow-hidden">
                                <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {blog.isFeatured && (
                                    <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                        Featured
                                    </div>
                                )}
                                {blog.status === 'draft' && (
                                    <div className="absolute top-3 left-3 bg-yellow-500/80 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                        Draft
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span>{blog.category}</span>
                                    <span>•</span>
                                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-black italic uppercase tracking-tight text-white mb-4 line-clamp-2">{blog.title}</h3>
                                <p className="text-white/40 text-sm mb-6 line-clamp-2">{blog.shortDescription}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {blog.status === 'draft' && (
                                        <button
                                            onClick={() => publishBlog(blog._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-400 transition-colors text-xs font-bold uppercase tracking-widest"
                                        >
                                            <Send className="w-4 h-4" />
                                            Publish
                                        </button>
                                    )}
                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        target="_blank"
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest ${blog.status === 'draft' ? 'flex-1' : 'flex-1'}`}
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <button
                                        onClick={() => navigate(`/admin/blogs/${blog._id}/edit`)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(blog._id)}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {blogs.length === 0 && !loading && (
                    <div className="text-center py-16 bg-[#0A0A0A] rounded-[40px] border border-dashed border-white/10">
                        <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-6" />
                        <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-4">No articles yet</h3>
                        <p className="text-white/40 font-bold mb-8">Create your first article to get started</p>
                        <button
                            onClick={() => navigate('/admin/blogs/new')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create Article
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Delete Article?</h3>
                            <p className="text-white/40 mb-8">This action cannot be undone. The article will be permanently deleted.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
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

export default AdminBlogs;
