import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const WowCustomOffer = ({ gameId }) => {
    const { user } = useAuth();
    const { currency, symbols } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to submit a request');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_URL}/api/v1/custom-orders`, {
                gameId,
                message,
                budget: budget ? Number(budget) : 0
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setSuccess(true);
            setMessage('');
            setBudget('');
            setTimeout(() => {
                setSuccess(false);
                setIsOpen(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Call to Action Section */}
            <div className="container mx-auto px-6">
                <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Sparkles className="w-3 h-3 text-primary fill-current" />
                            Tailored For You
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-6">
                            Don't see what <br />
                            <span className="text-primary">you need?</span>
                        </h2>
                        <p className="text-white/40 text-lg mb-8">
                            Desire a specific achievement, mount, or custom powerleveling route? Our ELITE boosters can handle ANY request. Describe it, and we'll send you a quote.
                        </p>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-primary hover:bg-[#a2e63e] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[14px] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            Create Custom Request
                        </button>
                    </div>

                    <div className="relative z-10 flex-shrink-0">
                        <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        <MessageSquare className="w-48 h-48 md:w-64 md:h-64 text-primary relative z-10 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsOpen(false)} />

                    <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                                <Send className="w-6 h-6 text-primary" />
                                Custom Request
                            </h3>
                            <p className="text-white/40 text-sm mt-2 font-medium">Briefly describe your requirements to receive a price quote from our managers.</p>
                        </div>

                        {success ? (
                            <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-primary animate-bounce" />
                                </div>
                                <h4 className="text-xl font-black uppercase text-white mb-2">Request Sent!</h4>
                                <p className="text-white/40 text-sm">Our team will review your request and contact you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">What do you want us to do?</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="E.g. I need KSM in 2 days, currently at 1200 score..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary/50 transition-colors placeholder:text-white/10 resize-none text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Approximate Budget ({symbols[currency]}) - Optional</label>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="Enter your budget..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary/50 transition-colors placeholder:text-white/10 text-sm font-bold"
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}

                                <button
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-[#a2e63e] disabled:opacity-50 disabled:cursor-not-allowed text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[14px] transition-all transform active:scale-95 shadow-lg shadow-primary/10"
                                >
                                    {loading ? 'Submitting...' : 'Send Request'}
                                </button>

                                <p className="text-[10px] text-center text-white/20 font-medium px-8 italic">
                                    Responses are typically sent within 15-30 minutes through your account notification center or email.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default WowCustomOffer;
