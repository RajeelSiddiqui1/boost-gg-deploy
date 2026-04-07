import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const { forgotPassword, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        if (result.success) {
            setSent(true);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 md:p-12 font-['Outfit'] relative overflow-hidden">
            {/* Background Aesthetic Glows */}
            <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-[440px] z-10">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    {/* Top Subtle Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>

                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <img src={logo} alt="BOOSTGG" className="h-10 w-auto object-contain" />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-4 uppercase leading-none">
                            {sent ? 'Check Email' : 'Forgot Password'}
                        </h1>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">
                            {sent ? 'Recovery instructions sent' : 'We\'ll send recovery instructions'}
                        </p>
                    </div>

                    {!sent ? (
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
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-primary/30 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
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
                                        Send Reset Link
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-8">
                            <p className="text-white/60 text-sm leading-relaxed">
                                We've sent a password reset link to <span className="text-primary font-bold">{email}</span>. Please check your inbox and spam folder.
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                            >
                                Didn't get it? Try again
                            </button>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
