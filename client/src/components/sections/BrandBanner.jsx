import React from 'react';
import { Link } from 'react-router-dom';


const BrandBanner = () => {
 return (
 <section className="py-8 px-6 bg-black overflow-hidden relative">
 <div className="max-w-[1400px] mx-auto bg-[#0a0a0a] rounded-[48px] border border-white/5 relative overflow-hidden group">
 <div className="flex flex-col lg:flex-row items-center min-h-[500px]">
 {/* Left Content */}
 <div className="w-full lg:w-1/2 p-12 lg:p-20 relative z-10">
 <h2 className="text-[48px] lg:text-[64px] font-black leading-[0.9] text-white tracking-tighter mb-8 group-hover:translate-x-2 transition-transform duration-500">
 What boosts you,<br />makes us
 </h2>
 <div className="space-y-6 mb-12">
 <p className="text-white/60 text-[16px] leading-relaxed max-w-md">
 Whether you're a casual player or a hardcore gamer, we're here to help you achieve your goals and enjoy your gaming experience.
 </p>
 <p className="text-white/40 text-[14px] leading-relaxed max-w-sm">
 Our team of professionals is dedicated to providing you with the best services, safest methods, and fastest results in the industry.
 </p>
 </div>
 <div className="flex gap-4">
 <Link 
 to="/about"
 className="bg-white hover:bg-white/90 text-black px-10 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all inline-block"
 >
 About us
 </Link>
 <button 
 onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
 className="border border-white/10 hover:bg-white/5 text-white px-10 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all"
 >
 Support
 </button>
 </div>
 </div>

 {/* Right Image/Graphic */}
 <div className="w-full lg:w-1/2 relative h-[400px] lg:h-full lg:absolute lg:right-0 lg:top-0">
 <img
 src="/main.png"
 className="w-full h-full object-cover mix-blend-screen opacity-100 lg:scale-110 lg:-translate-y-10 group-hover:scale-115 transition-transform duration-1000"
 alt="Gamer"
 />
 {/* Lightning Overlay */}
 {/* <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-full h-full bg-gradient-to-l from-primary/20 via-primary/5 to-transparent"></div>
 <svg className="w-[300px] h-[300px] text-primary/40 absolute right-20" viewBox="0 0 24 24" fill="currentColor">
 <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
 </svg>
 </div> */}
 </div>
 </div>
 </div>
 </section>
 );
};

export default BrandBanner;
