import React from 'react';

const Description = ({ title, content, requirements, whatYouGet }) => {
 return (
 <div className="space-y-16">
 <div className="space-y-6">
 <h2 className="text-[28px] font-bold text-white tracking-tight uppercase underline decoration-sky-purple decoration-4 underline-offset-8">Description</h2>
 <p className="leading-relaxed text-sky-text-secondary font-medium text-lg border-l-2 border-sky-purple/30 pl-8 py-2">
 {content || `Take on the ultimate PvE challenge with a ${title} and dominate the most demanding raid in The War Within! Skycoach's elite raiders will lead you through all intense encounters—no wipes, no stress—just smooth execution, high-end rewards, and major progress toward your Great Vault.`}
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-16">
 {/* What you'll get */}
 <div className="space-y-8">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-sky-purple/10 flex items-center justify-center border border-sky-purple/20">
 <div className="w-2.5 h-2.5 rounded-full bg-sky-purple shadow-[0_0_10px_rgba(90,48,255,0.5)]" />
 </div>
 <h3 className="text-xl font-bold text-white uppercase tracking-tight">What you'll get</h3>
 </div>
 <ul className="space-y-5">
 {(whatYouGet || [
 "8/8 Manaforge Omega bosses defeated on Mythic",
 "Chance to get 147-157 ilvl gear",
 "Plenty of Gilded Ethereal Crest",
 "Great Vault rewards guaranteed",
 "Cutting Edge: Dimensius achievement",
 "Unbound Star-Eater Mount"
 ]).map((item, i) => (
 <li key={i} className="flex items-start gap-4 group">
 <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-black text-white/40 group-hover:bg-sky-purple/20 group-hover:text-white transition-all border border-white/5">
 {(i + 1).toString().padStart(2, '0')}
 </span>
 <span className="text-[14.22px] font-semibold text-sky-text-secondary group-hover:text-white transition-colors pt-1">
 {item}
 </span>
 </li>
 ))}
 </ul>
 </div>

 {/* Requirements */}
 <div className="space-y-8">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-sky-gold/10 flex items-center justify-center border border-sky-gold/20">
 <div className="w-2.5 h-2.5 rounded-full bg-sky-gold shadow-[0_0_10px_rgba(255,157,0,0.5)]" />
 </div>
 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Requirements</h3>
 </div>
 <ul className="space-y-4">
 {(requirements || [
 "Level 80 character",
 "Active World of Warcraft subscription",
 "Manaforge Omega Mythic cooldown available"
 ]).map((req, i) => (
 <li key={i} className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-radius-sky-card group transition-all hover:bg-white/[0.04]">
 <div className="w-1.5 h-1.5 rounded-full bg-sky-gold/20 group-hover:bg-sky-gold transition-all" />
 <span className="text-[14.22px] font-semibold text-sky-text-secondary group-hover:text-white transition-colors">{req}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* How it works section (New for exact copy) */}
 <div className="pt-16 border-t border-white/5 space-y-12">
 <h3 className="text-2xl font-bold text-white uppercase ">How it works?</h3>
 <div className="grid md:grid-cols-4 gap-8">
 {[
 { step: 1, title: 'Contact', desc: 'We contact you via Discord or Live Chat' },
 { step: 2, title: 'Agreement', desc: 'We agree on the time and details' },
 { step: 3, title: 'Execution', desc: 'Our PROs complete the service' },
 { step: 4, title: 'Profit!', desc: 'You enjoy your rewards and loot' }
 ].map((s) => (
 <div key={s.step} className="space-y-4">
 <div className="text-3xl font-black text-white/10">{s.step}</div>
 <div className="font-bold text-white uppercase text-sm">{s.title}</div>
 <div className="text-xs text-sky-text-secondary leading-relaxed">{s.desc}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default Description;
