import React, { useState, useEffect } from 'react';
import {
 Search,
 ChevronRight,
 Calendar,
 User,
 Eye,
 TrendingUp,
 Clock,
 Zap,
 Star,
 Gamepad2,
 Filter
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from '../utils/api';

const Blog = () => {
 const [blogs, setBlogs] = useState([]);
 const [featuredBlogs, setFeaturedBlogs] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');


 useEffect(() => {
 fetchBlogs();
 fetchCategories();
 window.scrollTo(0, 0);
 }, [selectedCategory]);

 const fetchBlogs = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_URL}/api/v1/blogs`, {
 params: {
 category: selectedCategory,
 search: searchQuery
 }
 });
 setBlogs(res.data.data);

 // Filter featured blogs for the top section
 const featured = res.data.data.filter(b => b.isFeatured).slice(0, 6);
 setFeaturedBlogs(featured.length > 0 ? featured : res.data.data.slice(0, 6));

 setLoading(false);
 } catch (error) {
 console.error('Error fetching blogs:', error);
 setLoading(false);
 }
 };

 const fetchCategories = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/games`);
 setCategories(res.data.data || []);
 } catch (error) {
 console.error('Error fetching categories:', error);
 }
 };

 const handleSearch = (e) => {
 e.preventDefault();
 fetchBlogs();
 };

 return (
 <div className="min-h-screen bg-black text-white font-['Outfit'] selection:bg-primary/30">
 <div className="max-w-[1500px] mx-auto px-6 pt-32 pb-24">

 {/* Header Section */}
 <div className="mb-12">
 <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em] mb-4">BoostGG Blog</p>
 <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2">Welcome to our Blog</h1>
 <div className="w-20 h-1 bg-primary mb-12"></div>
 </div>

 {/* Most Popular Articles (Horizontal Grid) */}
 <section className="mb-24">
 <div className="flex items-center gap-3 mb-8">
 <TrendingUp className="w-5 h-5 text-primary" />
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">The most popular articles</h2>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {loading ? (
 [...Array(6)].map((_, i) => (
 <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl animate-pulse"></div>
 ))
 ) : (
 featuredBlogs.map((blog) => (
 <Link
 key={blog._id}
 to={`/blog/${blog.slug}`}
 className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500"
 >
 <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
 <div className="absolute bottom-4 left-4 right-4">
 <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">{blog.category}</span>
 <h3 className="text-[11px] font-black uppercase leading-tight line-clamp-2 tracking-tighter">{blog.title}</h3>
 </div>
 </Link>
 ))
 )}
 </div>
 </section>

 {/* Main Content Area */}
 <div className="flex flex-col lg:flex-row gap-12">

 {/* Left: Blog Grid */}
 <div className="flex-1">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {loading ? (
 [...Array(9)].map((_, i) => (
 <div key={i} className="h-[400px] bg-white/5 rounded-[32px] animate-pulse"></div>
 ))
 ) : (
 blogs.map((blog) => (
 <Link
 key={blog._id}
 to={`/blog/${blog.slug}`}
 className="group flex flex-col bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
 >
 <div className="aspect-video relative overflow-hidden">
 <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
 <Zap className="w-3 h-3" />
 {blog.category}
 </div>
 </div>
 <div className="p-8 pb-10 flex-1 flex flex-col">
 <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">
 <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
 <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {blog.views}</span>
 </div>
 <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors">{blog.title}</h3>
 <p className="text-white/40 text-sm font-bold leading-relaxed line-clamp-3 mb-8">
 {blog.shortDescription || "Boost your gaming experience with our professional guides and industry insights."}
 </p>
 <div className="mt-auto flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
 Read article
 <ChevronRight className="w-4 h-4" />
 </div>
 </div>
 </Link>
 ))
 )}
 </div>

 {!loading && blogs.length === 0 && (
 <div className="text-center py-24 bg-white/2 rounded-[40px] border border-dashed border-white/10">
 <Gamepad2 className="w-16 h-16 text-white/10 mx-auto mb-6" />
 <h3 className="text-2xl font-black uppercase tracking-tighter">No articles found</h3>
 <p className="text-white/40 font-bold mt-2 ">Try adjusting your search or category filter</p>
 </div>
 )}
 </div>

 {/* Right: Sidebar */}
 <aside className="w-full lg:w-[350px] space-y-8">

 {/* Search Sidebar */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-6 flex items-center gap-2">
 <Search className="w-4 h-4" />
 Search articles
 </h3>
 <form onSubmit={handleSearch} className="relative">
 <input
 type="text"
 placeholder="Search guides..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all text-white placeholder:text-white/20"
 />
 <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors">
 <Search className="w-5 h-5" />
 </button>
 </form>
 </div>

 {/* Categories Sidebar (By Game) */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-6 flex items-center gap-2">
 <Filter className="w-4 h-4" />
 Search by games
 </h3>
 <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
 <button
 onClick={() => setSelectedCategory('')}
 className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between group ${selectedCategory === '' ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/40'}`}
 >
 <span>All Articles</span>
 {selectedCategory === '' && <ChevronRight className="w-4 h-4" />}
 </button>
 {categories.map((cat) => (
 <button
 key={cat._id}
 onClick={() => setSelectedCategory(cat.title)}
 className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between group ${selectedCategory === cat.title ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/40'}`}
 >
 <span className="flex items-center gap-3">
 <img src={getImageUrl(cat.bgImage)} alt="" className="w-6 h-6 rounded object-cover opacity-60 group-hover:opacity-100" />
 {cat.title}
 </span>
 {selectedCategory === cat.title && <ChevronRight className="w-4 h-4" />}
 </button>
 ))}
 </div>
 </div>

 {/* Promotion Banner */}
 <div className="relative rounded-[32px] overflow-hidden group aspect-[4/5] md:aspect-auto md:h-64 lg:h-80">
 <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" alt="promo" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
 <div className="absolute bottom-8 left-8 right-8 text-center md:text-left">
 <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Start your boost today</h4>
 <Link to="/" className="inline-block bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
 Browse Marketplace
 </Link>
 </div>
 </div>
 </aside>
 </div>
 </div>

 <style>{`
 .custom-scrollbar::-webkit-scrollbar {
 width: 4px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: rgba(255, 255, 255, 0.05);
 border-radius: 10px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: rgba(99, 52, 227, 0.3);
 border-radius: 10px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: rgba(99, 52, 227, 0.5);
 }
 `}</style>
 </div>
 );
};

export default Blog;
