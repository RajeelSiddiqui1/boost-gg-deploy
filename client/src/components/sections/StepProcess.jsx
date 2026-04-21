import React, { useState, useEffect } from 'react';

const StepProcess = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [progressWidth, setProgressWidth] = useState(0);

    const steps = [
        {
            number: "1",
            title: "Pick Your Service",
            desc: "Choose the service you need and customize it."
        },
        {
            number: "2",
            title: "Add to cart",
            desc: "Once you are done, add the service to your cart."
        },
        {
            number: "3",
            title: "Place the Order",
            desc: "Complete the payment to lock in your order."
        },
        {
            number: "4",
            title: "Get Boosted",
            desc: "That's it! Sit back and enjoy the process and the results."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => {
                if (prev >= steps.length - 1) {
                    setProgressWidth(0);
                    return 0;
                }
                return prev + 1;
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgressWidth((activeStep / (steps.length - 1)) * 100);
        }, 200);
        
        return () => clearTimeout(timer);
    }, [activeStep]);

    return (
        <section className="py-32 bg-[#060606] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 italic">How It <span className="text-primary">Works</span></h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[12px]">Simple. Secure. Professional.</p>
                </div>

                <div className="relative">
                    {/* Slider Progress Track */}
                    <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[3px] bg-white/[0.05]">
                         {/* Animated Slider Progress Line */}
                        <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary to-primary transition-all duration-700 ease-out shadow-[0_0_15px_rgba(162,230,62,0.8)]"
                            style={{ width: `${progressWidth}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-20 lg:gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative group flex flex-col items-center text-center">
                                {/* Number Circle with Slider Animation */}
                                <div className="relative mb-12">
                                    {/* Inactive State */}
                                    <div 
                                        className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-[0_0_40px_rgba(162,230,62,0.4)] transition-all duration-700 relative z-10 ${
                                            i <= activeStep 
                                                ? 'bg-primary text-black scale-110 shadow-[0_0_60px_rgba(162,230,62,0.7)]' 
                                                : 'bg-[#1a1a1a] text-white/30 scale-100 shadow-none'
                                        }`}
                                    >
                                        {step.number}
                                    </div>
                                    
                                    {/* Active Step Glow Animation */}
                                    {i === activeStep && (
                                        <>
                                            <div className="absolute inset-[-8px] rounded-full border-2 border-primary animate-ping opacity-30" />
                                            <div className="absolute inset-[-15px] rounded-full border border-primary/30 animate-pulse opacity-50" />
                                        </>
                                    )}


                                </div>

                                <h3 
                                    className={`text-2xl font-black uppercase tracking-tight mb-4 transition-all duration-700 italic ${
                                        i <= activeStep ? 'text-white' : 'text-white/30'
                                    } ${i === activeStep ? 'text-primary scale-105' : ''}`}
                                >
                                    {step.title}
                                </h3>
                                <p 
                                    className={`text-sm font-medium leading-relaxed max-w-[250px] uppercase tracking-tight transition-all duration-700 ${
                                        i <= activeStep ? 'text-white/50' : 'text-white/20'
                                    } ${i === activeStep ? 'text-white/70' : ''}`}
                                >
                                    {step.desc}
                                </p>

                                {/* Connection Line Animation Mobile */}
                                {i < steps.length - 1 && (
                                    <div className="lg:hidden absolute top-24 left-1/2 w-1 h-20 bg-white/[0.05] overflow-hidden">
                                        <div 
                                            className="absolute top-0 left-0 w-full bg-primary transition-all duration-700 ease-out"
                                            style={{ height: i < activeStep ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Indicator Dots */}
                    <div className="flex justify-center gap-3 mt-16">
                        {steps.map((_, i) => (
                            <div 
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                    i === activeStep 
                                        ? 'bg-primary scale-150 shadow-[0_0_10px_rgba(162,230,62,0.8)]' 
                                        : i < activeStep 
                                            ? 'bg-primary/60' 
                                            : 'bg-white/10'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StepProcess;
