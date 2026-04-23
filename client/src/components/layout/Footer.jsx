import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Twitch, MessageCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
 return (
 <footer className="bg-[#050505] pt-16 pb-8 px-6 border-t border-white/[0.03]">
 <div className="max-w-[1400px] mx-auto">
 {/* Top Row: Logo & Socials */}
 <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
 <Link to="/">
 <img src={logo} alt="BoostGG" className="h-10 w-auto object-contain" />
 </Link>
 <div className="flex items-center gap-3">
 <a href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
 <Instagram className="w-5 h-5" />
 </a>
 <a href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
 <Facebook className="w-5 h-5" />
 </a>
 <a href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
 <Youtube className="w-5 h-5" />
 </a>
 <a href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
 <Twitch className="w-5 h-5" />
 </a>
 </div>
 </div>

 {/* Main Links Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
 <div className="lg:col-span-2">
 <h4 className="text-white font-bold text-sm mb-6">Company</h4>
 <ul className="space-y-3 text-white/40 text-[13px] font-medium">
 <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
 <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
 <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
 <li><a href="#" className="hover:text-white transition-colors">API documentation</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Become a PRO</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Cashback</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Legit</a></li>
 </ul>
 </div>

 <div className="lg:col-span-2">
 <h4 className="text-white font-bold text-sm mb-6">Work with us</h4>
 <ul className="space-y-3 text-white/40 text-[13px] font-medium">
 <li><a href="#" className="hover:text-white transition-colors">Booster</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Gold Seller</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Account Seller</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Content Creator</a></li>
 <li><a href="#" className="hover:text-white transition-colors ">Influencer</a></li>
 </ul>
 </div>

 <div className="lg:col-span-2">
 <h4 className="text-white font-bold text-sm mb-6">Customer Service</h4>
 <ul className="space-y-3 text-white/40 text-[13px] font-medium">
 <li><a href="#" className="hover:text-white transition-colors">Login as PRO</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Sitemaps</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Epic billing support</a></li>
 <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
 </ul>
 </div>

 <div className="lg:col-span-2">
 <h4 className="text-white font-bold text-sm mb-6">Legal & Policies</h4>
 <ul className="space-y-3 text-white/40 text-[13px] font-medium">
 <li><a href="#" className="hover:text-white transition-colors">General Terms and Conditions</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Terms of Services for Coaches</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Terms of Services for Customers</a></li>
 <li><a href="#" className="hover:text-white transition-colors">BoostGG Affiliate Program — Terms & Conditions</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Privacy policy</a></li>
 <li><a href="#" className="hover:text-white transition-colors">Cookie policy</a></li>
 </ul>
 </div>

 {/* Contact Info Box */}
 <div className="lg:col-span-4 bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8">
 <div className="space-y-1 mb-8">
 <h5 className="text-white/60 text-[13px] font-bold">+1 855 401 11 56</h5>
 <p className="text-white/40 text-[13px] font-medium">support@boostgg.com</p>
 <p className="text-white/40 text-[13px] font-medium">copyright@boostgg.com</p>
 </div>
 <button className="w-full py-4 px-6 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] rounded-2xl flex items-center justify-between group transition-all">
 <span className="text-white font-black uppercase text-[13px] tracking-widest">Chat with us</span>
 <div className="p-1 bg-white/[0.05] rounded-lg group-hover:bg-primary group-hover:text-black transition-all">
 <MessageCircle className="w-5 h-5" />
 </div>
 </button>
 </div>
 </div>

 {/* App Badges Bar */}
 <div className="flex flex-wrap items-center gap-4 pt-12 border-t border-white/[0.03] mb-8">
 <a href="#" className="h-12 opacity-40 hover:opacity-100 transition-opacity">
 <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-full" />
 </a>
 <a href="#" className="h-12 opacity-40 hover:opacity-100 transition-opacity">
 <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-full" />
 </a>
 </div>

 {/* Footer Disclaimer */}
 <div className="space-y-4">
 <p className="text-white/20 text-[11px] font-bold">
 © 2020 — 2026 All rights reserved. <br />
 BOOST LIMITED 25 Martiou, 27 D. Michael Tower, Flat/office 105A, Egkomi, 2408 Nicosia, Cyprus Reg.No. HE 432317
 </p>
 <p className="text-white/10 text-[10px] leading-relaxed">
 The Platform is not endorsed by, directly affiliated with, maintained, or sponsored by Blizzard Entertainment, Bungie, Electronic Arts, Grinding Gear Games, Activision Publishing, Square Enix Co., Valve, Battlestate Games, Wargaming.net Limited, Amazon Technologies, Jagex Limited, Riot Games, Smilegate RPG, Digital Extremes. The views and opinions expressed by the Platform do not reflect those of anyone officially associated with producing or managing their game franchises. Copyrighted art submitted to or through the Platform remains the intellectual property of the respective copyright holder.
 </p>
 </div>
 </div>
 </footer>
 );
};

export default Footer;

