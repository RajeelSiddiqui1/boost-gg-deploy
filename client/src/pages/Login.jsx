import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const { login, resendVerification, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else if (result.message && result.message.toLowerCase().includes('verify')) {
            setShowVerificationModal(true);
        }
    };

    const handleVerifyAccount = async () => {
        setResendingEmail(true);
        await resendVerification(email);
        setResendingEmail(false);
        setShowVerificationModal(false);
    };

    const handleCancelModal = () => {
        setShowVerificationModal(false);
    };

    return (
        <div className="min-h-screen bg-black flex font-['Outfit'] relative overflow-hidden">
            {/* Left Side: Cinematic Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A0A]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
                    alt="Gaming Visual"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow"
                />

                {/* Branding Overlay */}
                <div className="relative z-20 p-20 flex flex-col justify-between h-full w-full">
                    <div className="inline-flex items-center gap-2">
                        <img src={logo} alt="BOOSTGG" className="h-12 w-auto object-contain" />
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-6xl font-black italic uppercase leading-[0.85] tracking-tighter mb-6 text-white">
                            Join the <br /> <span className="text-primary">Pro Ranks</span>
                        </h2>
                        <p className="text-white/60 font-medium text-lg italic leading-relaxed">
                            Access elite services, track your progress, and level up your gaming experience with BoostGG.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-white/20">
                        <div className="flex -space-x-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=pro${i}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Joined by 10k+ Pros</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
                {/* Background Aesthetic Glows (Mobile Only / Edge) */}
                <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full lg:hidden"></div>

                <div className="w-full max-w-[440px] z-10">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                        {/* Top Subtle Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>

                        {/* Header (Visible on Mobile) */}
                        <div className="text-center mb-10">
                            <div className="lg:hidden inline-flex items-center gap-2 mb-8">
                                <img src={logo} alt="BOOSTGG" className="h-10 w-auto object-contain" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-4 uppercase leading-none">Welcome back</h1>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">Secure access to your vault</p>
                        </div>



                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors">Forgot Password?</Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-[#722AEE] text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 group/btn"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Login Now
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-3">
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.1em]">
                                New here? {' '}
                                <Link to="/signup" className="text-primary hover:text-white ml-2 transition-colors border-b border-primary/20 hover:border-white">Create account</Link>
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

            {/* Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleCancelModal}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h2 className="text-2xl font-black italic text-white uppercase mb-3">Email Not Verified</h2>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed">
                                You are not a verified user. Please verify your account to access all features.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelModal}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest border border-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyAccount}
                                    disabled={resendingEmail}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {resendingEmail ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Verify Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Login;
