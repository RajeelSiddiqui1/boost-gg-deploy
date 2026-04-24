import React from 'react'

function DetailBanner() {
  return (
    <div className="mt-12 relative w-full h-full rounded-[40px] overflow-hidden border border-white/5 min-h-[300px] flex items-center group shadow-2xl">
    {/* Background Image Layer */}
    <div className="absolute inset-0">
      <img 
        src="/personalized-offer.png" 
        className="w-full h-full object-cover object-right transition-transform duration-1000 group-hover:scale-105" 
        alt="" 
      />
      {/* Dark Overlay Gradient from Left to Right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent w-full md:w-[70%]"></div>
      <div className="absolute inset-0 bg-[#0A0A0A]/60 md:hidden"></div>
    </div>
    
    {/* Content Layer */}
    <div className="relative z-10 w-full px-8 md:px-16 py-12">
      <div className="max-w-4xl space-y-8 text-center md:text-left">
        <div className="space-y-4">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">CAN'T FIND WHAT YOU NEED?</span>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
            Get <span className="text-primary italic">personalized</span> offer
          </h2>
        </div>
        <p className="text-white/50 text-base md:text-xl font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
          Contact us and we'll find the best deal or create a personalized order for you at a lower price with an immediately contact with PRO player.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new Event('openSupportChat'))}
          className="px-16 py-6 bg-primary hover:bg-[#bbf74d] text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(162,230,62,0.4)]"
        >
          Create custom order
        </button>
      </div>
    </div>
    
    {/* Atmospheric Glow */}
    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
  </div>
  )
}

export default DetailBanner