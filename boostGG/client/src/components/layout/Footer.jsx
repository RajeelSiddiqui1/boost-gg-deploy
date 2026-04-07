import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Apple, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-black pt-32 pb-16 px-6 relative overflow-hidden">
            {/* Background Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 pointer-events-none w-full text-center">
                <span className="text-[20vw] font-black italic text-white/[0.02] tracking-tighter leading-none select-none">
                    BOOSTGG
                </span>
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Logo and Main Row */}
                <div className="flex flex-col lg:flex-row justify-between gap-20 mb-24">
                    <div className="max-w-xs">
                        <img src={logo} alt="BOOSTGG" className="h-10 w-auto object-contain mb-8" />
                        <p className="text-white/40 text-[14px] leading-relaxed">
                            Premium boosting and coaching services for the world's most popular games. Achieve more today.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 flex-1">
                        <div>
                            <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6 px-1 border-l-2 border-primary">Company</h4>
                            <ul className="space-y-4 text-white/40 text-[13px] font-bold">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/become-pro" className="hover:text-white transition-colors">Become a PRO</Link></li>
                                <li><Link to="/cashback" className="hover:text-white transition-colors">Cashback</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Legit</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6 px-1 border-l-2 border-primary">Work with us</h4>
                            <ul className="space-y-4 text-white/40 text-[13px] font-bold">
                                <li><a href="#" className="hover:text-white transition-colors">Booster</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Gold Seller</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Account Seller</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Content Creator</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Influencer</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6 px-1 border-l-2 border-primary">Customer Service</h4>
                            <ul className="space-y-4 text-white/40 text-[13px] font-bold">
                                <li><a href="#" className="hover:text-white transition-colors">Login as PRO</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Sitemaps</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Epoch billing support</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6 px-1 border-l-2 border-primary">Social</h4>
                            <div className="flex flex-wrap gap-4">
                                <Facebook className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                                <Twitter className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                                <Instagram className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                                <Youtube className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white/40 text-[12px] font-bold">© 2024 BoostGG. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Apple className="w-5 h-5 text-white/20" />
                        <Play className="w-5 h-5 text-white/20" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
