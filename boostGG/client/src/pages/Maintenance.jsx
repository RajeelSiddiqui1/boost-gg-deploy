import React from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-['Outfit']">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
                <Wrench className="w-24 h-24 text-primary relative z-10 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-6">
                Under Maintenance
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-bold max-w-2xl leading-relaxed mb-12">
                We are currently upgrading our systems to provide you with an even better experience.
                Please check back shortly.
            </p>
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 px-4 py-2 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                System Upgrade in Progress
            </div>
        </div>
    );
};

export default Maintenance;
