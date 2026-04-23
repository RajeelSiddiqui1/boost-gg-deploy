import React from 'react';

const PromoBanner = () => {
 return (
 <section className="px-6 bg-black">
 <div className="max-w-[1400px] mx-auto bg-[#0a0a0a] rounded-[48px] border border-white/5 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent"></div>

 <div className="w-full lg:w-1/2 relative z-10">
 <h2 className="text-[40px] lg:text-[56px] font-black text-white leading-[1] tracking-tighter mb-8">
 Money, tips,<br />giveaways & more
 </h2>
 <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em] mb-10">Join our newsletter to stay updated</p>

 <div className="flex gap-4">
 <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[12px] font-black uppercase tracking-widest transition-all">
 Telegram <span className="w-2 h-2 bg-primary rounded-full"></span>
 </button>
 <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[12px] font-black uppercase tracking-widest transition-all">
 Discord <span className="w-2 h-2 bg-primary rounded-full"></span>
 </button>
 </div>
 </div>

 <div className="w-full lg:w-1/3 mt-16 lg:mt-0 relative h-[400px]">
 <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
 <div className="relative w-[280px] h-[500px] bg-black rounded-[48px] border-[12px] border-[#1a1a1a] shadow-2xl overflow-hidden transform lg:rotate-12 lg:-translate-y-20">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-black"></div>
 <div className="p-8">
 <div className="w-12 h-12 bg-white rounded-2xl mb-6"></div>
 <div className="space-y-4">
 <div className="h-4 bg-white/20 rounded-full w-3/4"></div>
 <div className="h-4 bg-white/20 rounded-full w-full"></div>
 <div className="h-4 bg-white/20 rounded-full w-1/2"></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
};

export default PromoBanner;
