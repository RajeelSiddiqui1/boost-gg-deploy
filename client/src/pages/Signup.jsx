import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import logo from '../assets/logo.png';

const Signup = () => {
 const [formData, setFormData] = useState({
 name: '',
 surname: '',
 username: '',
 email: '',
 password: '',
 confirmPassword: '',
 newsletter: false
 });
 const [isSignedUp, setIsSignedUp] = useState(false);
 const { signup, loading } = useAuth();
 const navigate = useNavigate();



 const handleChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData({
 ...formData,
 [name]: type === 'checkbox' ? checked : value
 });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (formData.password !== formData.confirmPassword) {
 alert("Passwords don't match");
 return;
 }

 const signupData = {
 name: formData.name,
 email: formData.email,
 password: formData.password,
 role: 'customer',
 newsletter: formData.newsletter
 };

 const result = await signup(signupData);
 if (result.success) {
 setIsSignedUp(true);
 }
 };

 if (isSignedUp) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 font-['Outfit'] relative overflow-hidden">
 <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
 <div className="w-full max-w-[480px] z-10 text-center">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 backdrop-blur-xl">
 <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 mx-auto mb-8">
 <Mail className="w-10 h-10 text-primary" />
 </div>
 <h2 className="text-3xl font-black text-white uppercase mb-4">Check your Email</h2>
 <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">
 We've sent a verification link to <span className="text-white">{formData.email}</span>. Please verify your account to proceed.
 </p>
 <Link to="/login" className="text-primary hover:text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
 Back to Login <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-black flex font-['Outfit'] relative overflow-hidden">
 {/* Left Side: Cinematic Visual */}
 <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A0A]">
 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
 <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10"></div>
 <img
 src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop"
 alt="Gaming Ecosystem"
 className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow"
 />

 {/* Branding Overlay */}
 <div className="relative z-20 p-20 flex flex-col justify-between h-full w-full">
 <div className="inline-flex items-center gap-2">
 <img src={logo} alt="BOOSTGG" className="h-12 w-auto object-contain" />
 </div>

 <div className="max-w-md">
 <h2 className="text-6xl font-black uppercase leading-[0.85] tracking-tighter mb-6 text-white">
 The Future of <br /> <span className="text-primary">Gaming Rewards</span>
 </h2>
 <p className="text-white/60 font-medium text-lg leading-relaxed">
 Join the elite marketplace. Earn cashback, access premium services, and grow your gaming potential with our pro community.
 </p>
 </div>

 <div className="flex items-center gap-4 text-white/40">
 <div className="flex items-center gap-2 text-primary">
 <ShieldCheck className="w-5 h-5" />
 <span className="text-[10px] font-black uppercase tracking-widest">Verified Marketplace</span>
 </div>
 <div className="w-px h-4 bg-white/10"></div>
 <p className="text-[10px] font-black uppercase tracking-widest">100% Secure</p>
 </div>
 </div>
 </div>

 {/* Right Side: Authentication Form */}
 <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
 {/* Background Aesthetic Glows (Mobile Only / Edge) */}
 <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 blur-[180px] rounded-full lg:hidden"></div>

 <div className="w-full max-w-[460px] z-10">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
 {/* Header */}
 <div className="text-center mb-10">
 <div className="lg:hidden inline-flex items-center gap-2 mb-8">
 <img src={logo} alt="BOOSTGG" className="h-10 w-auto object-contain" />
 </div>
 <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 uppercase leading-none">Join BoostGG</h1>
 <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">Join the Elite Marketplace</p>
 </div>





 {/* Form */}
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="relative group">
 <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Full Name</label>
 <input
 name="name"
 type="text"
 value={formData.name}
 onChange={handleChange}
 placeholder="Enter your name"
 required
 className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
 />
 </div>

 <div className="relative group">
 <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Email</label>
 <input
 name="email"
 type="email"
 value={formData.email}
 onChange={handleChange}
 placeholder="Enter your email"
 required
 className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
 />
 </div>

 <div className="relative group">
 <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Password</label>
 <input
 name="password"
 type="password"
 value={formData.password}
 onChange={handleChange}
 placeholder="••••••••"
 required
 className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
 />
 </div>

 <div className="relative group">
 <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Confirm Password</label>
 <input
 name="confirmPassword"
 type="password"
 value={formData.confirmPassword}
 onChange={handleChange}
 placeholder="••••••••"
 required
 className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
 />
 </div>

 {/* Promo Checkbox */}
 <label className="flex items-center gap-3 cursor-pointer group/check select-none">
 <div className="relative flex items-center justify-center">
 <input
 type="checkbox"
 name="newsletter"
 checked={formData.newsletter}
 onChange={handleChange}
 className="peer absolute opacity-0 cursor-pointer w-0 h-0"
 />
 <div className="w-5 h-5 border-2 border-white/10 rounded-lg group-hover/check:border-primary/50 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
 <ShieldCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
 </div>
 <span className="text-[10px] font-bold text-white/30 group-hover/check:text-white/60 transition-colors uppercase tracking-tight">
 I Want to receive promo codes and special deals
 </span>
 </label>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-primary hover:bg-[#722AEE] text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 group/btn"
 >
 {loading ? (
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 <>
 Create account
 <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
 </>
 )}
 </button>
 </form>

 {/* Footer */}
 <div className="mt-10 pt-8 border-t border-white/5 text-center">
 <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.1em]">
 Already have an account? {' '}
 <Link to="/login" className="text-primary hover:text-white ml-2 transition-colors border-b border-primary/20 hover:border-white">Login now</Link>
 </p>
 </div>
 </div>

 {/* Additional Links */}
 <div className="mt-10 flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
 <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-white hover:text-primary">Terms</Link>
 <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-white hover:text-primary">Privacy</Link>
 <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-white hover:text-primary">Support</Link>
 </div>
 </div>
 </div>

 <style>{`
 @keyframes pulse-slow {
 0%, 100% { transform: scale(1); opacity: 0.2; }
 50% { transform: scale(1.1); opacity: 0.3; }
 }
 .animate-pulse-slow {
 animation: pulse-slow 10s ease-in-out infinite;
 }
 @keyframes shake {
 0%, 100% { transform: translateX(0); }
 25% { transform: translateX(-4px); }
 75% { transform: translateX(4px); }
 }
 .animate-shake {
 animation: shake 0.4s ease-in-out;
 }
 `}</style>
 </div>
 );
};

export default Signup;
