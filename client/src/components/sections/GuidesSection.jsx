import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL, getImageUrl } from "../../utils/api";

const GuidesSection = () => {
    const [loading, setLoading] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [displayBlogs, setDisplayBlogs] = useState([]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/v1/blogs?limit=100`);
            const fetchedBlogs = res.data.data || [];
            if (fetchedBlogs.length > 0) {
                setBlogs(fetchedBlogs);
                // Shuffle and pick 4
                setDisplayBlogs([...fetchedBlogs].sort(() => Math.random() - 0.5).slice(0, 4));
            }
        } catch (err) {
            console.error("Error fetching blogs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleNext = () => {
        if (blogs.length < 2) return;
        setLoading(true);
        setTimeout(() => {
            const shuffled = [...blogs].sort(() => Math.random() - 0.5);
            setDisplayBlogs(shuffled.slice(0, 4));
            setLoading(false);
        }, 600);
    };

    return (
        <section className="py-12 px-6 bg-[#050505] border-y border-white/5">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-16 px-4">
                    <h2 className="text-[32px] font-black italic tracking-tight text-white">Popular guides</h2>
                    <button
                        onClick={handleNext}
                        disabled={loading || blogs.length <= 4}
                        className={`flex items-center gap-2 bg-primary hover:bg-[#8cc63e] text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-primary/20 ${loading ? "opacity-50" : "active:scale-95"} ${(blogs.length <= 4 && !loading) ? "hidden" : ""}`}
                    >
                        <span>More</span>
                        {loading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )}
                    </button>
                </div>

                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${loading ? "opacity-30 blur-sm grayscale" : "opacity-100"}`}>
                    {displayBlogs.map((guide, i) => (
                        <Link
                            key={guide._id || i}
                            to={`/blog/${guide.slug}`}
                            className="aspect-[3/4] rounded-[32px] overflow-hidden relative group cursor-pointer border border-white/5 bg-[#0A0A0A]"
                        >
                            <img
                                src={getImageUrl(guide.image)}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700"
                                alt={guide.title}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.background = 'linear-gradient(135deg, #0f1a0a 0%, #1a2f0f 50%, #0a1a08 100%)';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <span className="text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-4 block">
                                    {guide.category || "GUIDE"}
                                </span>
                                <h4 className="text-[24px] font-black text-white leading-[1.1] group-hover:text-primary transition-colors line-clamp-3">
                                    {guide.title}
                                </h4>
                            </div>
                        </Link>
                    ))}

                    {/* Placeholder if no blogs */}
                    {!loading && displayBlogs.length === 0 && (
                        <div className="col-span-full aspect-[3/4] md:aspect-video rounded-[32px] border border-white/5 bg-[#0A0A0A] flex items-center justify-center p-8 text-center">
                            <p className="text-white/40 font-bold">No guides available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default GuidesSection;
