import React from 'react';

const StatsGrid = () => {
    const stats = [
        { value: "10 000+", label: "Pros players" },
        { value: "3 000+", label: "Satisfied reviews" },
        { value: "1.2M+", label: "Completed orders" },
        { value: "200K+", label: "Community members" }
    ];

    return (
        <section className="py-12 px-6 bg-[#050505] border-y border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[120%] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50"></div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                {stats.map((stat, i) => (
                    <div key={i} className="relative group cursor-pointer transition-all duration-500 hover:scale-105">
                        {/* Hover Border - appears around the item */}
                        <div className="absolute -inset-6 border border-white/0 group-hover:border-white/10 rounded-3xl transition-all duration-500 group-hover:bg-white/[0.02] backdrop-blur-[2px]"></div>

                        <div className="relative z-10 flex flex-col items-center lg:items-start transition-all duration-500">
                            <div className="text-[64px] font-light text-white leading-none mb-4 tracking-tighter group-hover:text-primary transition-all duration-500">
                                {stat.value}
                            </div>
                            <div className="text-[12px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-all duration-500">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsGrid;
