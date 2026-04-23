import React, { useState, useEffect, useRef } from 'react';

const CommunityEarnings = () => {
 const targetValue = 180590;
 const [count, setCount] = useState(0);
 const [hasAnimated, setHasAnimated] = useState(false);
 const sectionRef = useRef(null);

 useEffect(() => {
 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting && !hasAnimated) {
 setHasAnimated(true);
 }
 },
 { threshold: 0.2 } // Trigger when 20% of the section is visible
 );

 if (sectionRef.current) {
 observer.observe(sectionRef.current);
 }

 return () => {
 if (sectionRef.current) {
 observer.unobserve(sectionRef.current);
 }
 };
 }, [hasAnimated]);

 useEffect(() => {
 if (!hasAnimated) return;

 let start = 0;
 const end = targetValue;
 const duration = 2000; // 2 seconds
 const startTime = performance.now();

 const animate = (currentTime) => {
 const elapsed = currentTime - startTime;
 const progress = Math.min(elapsed / duration, 1);

 // Easing function: easeOutExpo
 const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

 const currentCount = Math.floor(ease * end);
 setCount(currentCount);

 if (progress < 1) {
 requestAnimationFrame(animate);
 }
 };

 requestAnimationFrame(animate);
 }, [hasAnimated]);

 // Pad with leading zeros to match 6 digits
 const digits = count.toString().padStart(6, '0').split('');

 return (
 <section ref={sectionRef} className="py-32 px-6 bg-black">
 <div className="max-w-[1400px] mx-auto text-center">
 <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mb-12">
 Join thousands of gamers leveling up with us
 </p>

 {/* Counter Grid */}
 <div className="flex items-center justify-center gap-2 md:gap-3 mb-10">
 {digits.map((digit, i) => (
 <div
 key={i}
 className="w-12 h-20 md:w-20 md:h-28 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-5xl md:text-8xl font-black text-primary shadow-xl"
 >
 {digit}
 </div>
 ))}
 </div>

 <h2 className="text-[24px] md:text-[32px] font-black uppercase tracking-[0.2em] text-white mt-12 mb-2">
 Completed Orders
 </h2>
 <p className="text-white/40 font-medium text-sm md:text-base ">
 and counting...
 </p>
 </div>
 </section>
 );
};

export default CommunityEarnings;
