import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, getImageUrl } from '../../utils/api';
import { ArrowRight } from 'lucide-react';

const BlogSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/blogs`);
                const data = await res.json();
                // Get first 5 blogs for the layout
                if (data.success && data.data) {
                    setBlogs(data.data.slice(0, 5));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading || blogs.length < 3) return null;

    return (
        <section className="py-24 px-6 bg-black font-['Outfit'] relative overflow-hidden">
            {/* Atmospheric Background Glow */}
            <div className="absolute top-0 right-0 w-[40%] h-[400px] bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[400px] bg-[#5A30FF]/5 blur-[120px] -z-10 rounded-full"></div>

            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-primary rounded-full"></div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Popular guides
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/blog')}
                        className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all group"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* First 3 Large Cards */}
                    {blogs.slice(0, 3).map((blog) => (
                        <div 
                            key={blog._id}
                            onClick={() => navigate(`/blog/${blog.slug}`)}
                            className="group relative h-[520px] rounded-[48px] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/30 transition-all duration-700 hover:-translate-y-2 shadow-2xl"
                        >
                            <img 
                                src={getImageUrl(blog.image)} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                alt={blog.title} 
                            />
                            {/* Multi-layer gradient for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
                            
                            <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                                        {blog.category || 'Guides'}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase leading-[1.1] mb-4 group-hover:text-primary transition-colors tracking-tighter">
                                    {blog.title}
                                </h3>
                                <p className="text-white/40 text-sm font-medium leading-relaxed line-clamp-2">
                                    {blog.shortDescription}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Right Column with 2 small cards and Visit Blog card */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4 h-[250px]">
                            {blogs.slice(3, 5).map((blog) => (
                                <div 
                                    key={blog._id}
                                    onClick={() => navigate(`/blog/${blog.slug}`)}
                                    className="group relative h-full rounded-[32px] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/30 transition-all duration-500 shadow-xl"
                                >
                                    <img 
                                        src={getImageUrl(blog.image)} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                        alt={blog.title} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/10">
                                            <div className="w-1 h-1 rounded-full bg-white"></div>
                                        </div>
                                        <h4 className="text-[11px] font-black text-white uppercase leading-tight line-clamp-3 group-hover:text-primary transition-colors">
                                            {blog.title}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visit our blog card */}
                        <div 
                            onClick={() => navigate('/blog')}
                            className="flex-1 bg-[#5A30FF] rounded-[40px] p-10 flex flex-col justify-end group cursor-pointer relative overflow-hidden min-h-[244px] shadow-[0_20px_50px_rgba(90,48,255,0.3)] hover:shadow-[0_20px_70px_rgba(90,48,255,0.5)] transition-all"
                        >
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25)_0%,_transparent_70%)]"></div>
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 blur-[60px] rounded-full group-hover:bg-white/20 transition-colors"></div>
                            
                            <div className="relative z-10 flex items-end justify-between">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">View more articles</span>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Visit our<br/>blog</h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-2xl">
                                    <ArrowRight className="w-7 h-7 text-white group-hover:text-[#5A30FF] transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
