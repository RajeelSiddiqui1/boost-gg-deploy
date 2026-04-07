import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, Home, Zap, Ghost } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // Redirect to a search result or home if needed
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black text-white font-['Outfit'] relative overflow-hidden flex items-center justify-center px-6 selection:bg-primary/30">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8bc332]/20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Glass Container */}
            <div className="max-w-4xl w-full bg-white/[0.02] border border-white/10 rounded-[48px] p-8 md:p-20 backdrop-blur-3xl relative z-10 shadow-2xl flex flex-col items-center">

                {/* Visual Icon */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/40 transition-all duration-700"></div>
                    <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                        <Ghost className="w-12 h-12 text-primary animate-bounce-slow" />
                    </div>
                </div>

                {/* Main Heading */}
                <div className="text-center mb-12">
                    <h1 className="text-[120px] md:text-[200px] font-black italic uppercase tracking-tighter leading-none mb-4 text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-6">
                        Mission <span className="text-primary italic">Failed</span>
                    </h2>
                    <p className="text-lg text-white/40 font-bold italic leading-relaxed max-w-md mx-auto">
                        Looks like you've ventured into uncharted territory. This page doesn't exist in our gaming universe.
                    </p>
                </div>

                {/* Search Utility */}
                <div className="w-full max-w-md mb-12">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Try searching for a game..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </form>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/40 flex items-center justify-center gap-3"
                    >
                        <Home className="w-4 h-4" />
                        Back to Base
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Retreat
                    </button>
                </div>

                {/* Secondary Links */}
                <div className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                    <Link to="/blog" className="hover:text-primary transition-colors">Latest News</Link>
                    <Link to="/contact" className="hover:text-primary transition-colors">Get Support</Link>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default NotFound;
