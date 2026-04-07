import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const { resetPassword, loading } = useAuth();
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // Toast handled by validate password if needed, but let's keep it simple
            return;
        }
        const result = await resetPassword(token, password);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 md:p-12 font-['Outfit'] relative overflow-hidden">
            {/* Background Aesthetic Glows */}
            <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-[440px] z-10">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <img src={logo} alt="BOOSTGG" className="h-10 w-auto object-contain" />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-4 uppercase leading-none">
                            {success ? 'Success' : 'New Password'}
                        </h1>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">
                            {success ? 'Password has been reset' : 'Secure your account'}
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className="w-full bg-transparent border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all"
                                    />
                                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-primary/30 transition-colors w-5 h-5" />
                                </div>
                                <div className="relative group">
                                    <label className="absolute -top-2.5 left-5 px-2 bg-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] text-white/20 z-10 group-focus-within:text-primary transition-colors">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`w-full bg-transparent border ${password === confirmPassword && confirmPassword ? 'border-primary/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/5 focus:border-primary focus:bg-white/[0.02] outline-none transition-all`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || password !== confirmPassword}
                                className="w-full bg-primary hover:bg-[#722AEE] text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 group/btn"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 scale-in-fade">
                            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce" />
                            <p className="text-white/60 text-sm leading-relaxed">
                                Your password has been successfully reset. Redirecting you to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
