import React from 'react';

const PaymentMethods = () => {
 const payments = [
 'visa.svg',
 'mastercard.svg',
 'pay-pal.svg',
 'apple-pay.svg',
 'google-pay.svg',
 'bitcoin.svg',
 'skrill.svg',
 'ideal.svg',
 'sezzle.svg',
 'eps.svg',
 'epoch.svg',
 'inxy_payment.svg'
 ];

 return (
 <section className="py-12 bg-black border-t border-white/[0.03] overflow-hidden">
 <div className="max-w-[1400px] mx-auto px-6">
 <div className="relative flex items-center overflow-hidden h-16 md:h-20">
 <div className="flex items-center gap-16 md:gap-24 whitespace-nowrap animate-marquee hover:pause">
 {/* Render twice for seamless loop */}
 {[...payments, ...payments].map((img, i) => (
 <img 
 key={i}
 src={`/payments/${img}`} 
 alt={img.split('.')[0]} 
 className="h-7 md:h-10 w-auto grayscale brightness-200 contrast-125 object-contain opacity-20 hover:opacity-100 hover:grayscale-0 transition-all duration-300" 
 />
 ))}
 </div>
 </div>
 </div>

 <style jsx="true">{`
 @keyframes marquee {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 .animate-marquee {
 animation: marquee 40s linear infinite;
 display: flex;
 width: max-content;
 }
 .hover\:pause:hover {
 animation-play-state: paused;
 }
 `}</style>
 </section>
 );
};



export default PaymentMethods;
