import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            text: "Awesome! Just Awesome!",
            author: "Asher",
            service: "WoW Boosting"
        },
        {
            text: "As Good As It Gets",
            author: "Milan",
            service: "Destiny 2 Carry"
        },
        {
            text: "Amazing services",
            author: "Elias",
            service: "D4 Gold"
        },
        {
            text: "Awesome Gaming Service!",
            author: "Lucas",
            service: "Valorant Rank"
        }
    ];

    return (
        <section className="px-6 bg-black">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-[32px] font-black italic tracking-tight text-white">What our customers are saying</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-[#a2e63e] fill-[#a2e63e]" />)}
                        </div>
                        <span className="text-[12px] font-black text-white/40 ml-2 uppercase tracking-widest">Excellent</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col h-full group hover:border-white/10 transition-all">
                            <div className="flex gap-0.5 mb-8">
                                {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-3.5 h-3.5 text-[#a2e63e] fill-[#a2e63e]" />)}
                            </div>
                            <p className="text-[20px] font-black text-white leading-tight mb-6 group-hover:text-primary transition-colors">
                                "{t.text}"
                            </p>
                            <div className="mt-auto">
                                <span className="text-[13px] font-bold text-white/40 block mb-1">{t.author} recommends BoostGG</span>
                                <span className="text-[11px] font-black text-primary uppercase tracking-widest">{t.service}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
