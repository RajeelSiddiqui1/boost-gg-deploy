import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, XCircle, Loader2, ArrowRight, Zap } from 'lucide-react';
import { API_URL } from '../utils/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/auth/verify/${token}`);
                if (res.data.success) {
                    setStatus('success');
                    setMessage(res.data.message);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20 font-['Outfit'] relative overflow-hidden">
            {/* Background Aesthetic Glows */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>

            <div className="w-full max-w-[480px] z-10 text-center">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 backdrop-blur-xl">
                    <div className="inline-flex items-center gap-1 mb-10">
                        <span className="text-2xl font-black italic tracking-tighter text-white">BOOST</span>
                        <Zap className="w-6 h-6 fill-primary text-primary" />
                        <span className="text-2xl font-black italic tracking-tighter text-white">GG</span>
                    </div>

                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black italic text-white uppercase">Verifying Email...</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Please wait while we secure your account</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 animate-in fade-in duration-700">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                    <ShieldCheck className="w-10 h-10 text-green-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black italic text-white uppercase">Verified!</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed">
                                {message}
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-[#722AEE] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20 mt-4"
                            >
                                Proceed to Login <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 animate-in fade-in duration-700">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                                    <XCircle className="w-10 h-10 text-red-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black italic text-white uppercase">Verification Failed</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed">
                                {message}
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/5 transition-all mt-4"
                            >
                                Back to Signup
                            </Link>
                        </div>
                    )}
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
            `}</style>
        </div>
    );
};

export default VerifyEmail;
