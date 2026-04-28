import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const PaymentMethodIcon = ({ id, selected }) => {
    // Simple high-end text-based or icon logos for payment methods
    switch (id) {
        case 'visa':
            return (
                <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-black italic ${selected ? 'text-black' : 'text-white'}`}>VISA</span>
                    <span className={`text-[10px] font-black italic opacity-40 ${selected ? 'text-black' : 'text-white'}`}>| mc</span>
                </div>
            );
        case 'ideal':
            return <span className={`text-[10px] font-black uppercase tracking-tighter ${selected ? 'text-black' : 'text-[#cc0066]'}`}>iDEAL</span>;
        case 'skrill':
            return <span className={`text-[10px] font-black uppercase tracking-tight ${selected ? 'text-black' : 'text-[#821361]'}`}>SKRILL</span>;
        case 'crypto':
            return <span className={`text-[10px] font-black uppercase tracking-widest ${selected ? 'text-black' : 'text-primary'}`}>CRYPTO</span>;
        case 'google':
            return (
                <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-black ${selected ? 'text-black' : 'text-white'}`}>G</span>
                    <span className={`text-[10px] font-black opacity-40 ${selected ? 'text-black' : 'text-white'}`}>Pay</span>
                </div>
            );
        default:
            return <CheckCircle2 className="w-4 h-4" />;
    }
};

const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
    const { formatPrice } = useCurrency();
    const [selectedPayment, setSelectedPayment] = useState('visa');

    if (!isOpen) return null;

    const paymentMethods = [
        { id: 'visa', name: 'Card Payment', fee: '+ 3.9%', description: 'Visa, Mastercard, Maestro' },
        { id: 'ideal', name: 'iDeal', fee: '+ 2.9%', description: 'Direct bank transfer' },
        { id: 'google', name: 'Google Pay', fee: '+ 3.9%', description: 'Fast and secure' },
        { id: 'skrill', name: 'Skrill', fee: '+ 5.9%', description: 'Digital wallet' },
        { id: 'crypto', name: 'Crypto', fee: '+ 1.0%', description: 'BTC, ETH, USDT (L2 supported)' },
    ];

    const vatRate = 0.21;
    const commissionRate = 0.059;
    const vatAmount = total * vatRate;
    const commissionAmount = total * commissionRate;
    const finalTotal = total + vatAmount + commissionAmount;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in font-['Outfit']">
            <div className="bg-[#080808] border border-white/10 rounded-[2.5rem] max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 text-white/20 hover:text-white transition-colors w-10 h-10 flex items-center justify-center bg-white/5 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* LEFT: Selection Area */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Lock className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Secure Checkout</span>
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Payment method</h3>
                        <p className="text-white/30 text-xs font-medium uppercase tracking-widest mt-2">Select your preferred way to pay</p>
                    </div>

                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`w-full group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${
                                    selectedPayment === method.id 
                                    ? 'bg-primary border-primary shadow-[0_10px_30px_rgba(19,193,0,0.2)] scale-[1.02]' 
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedPayment === method.id ? 'bg-black text-white' : 'bg-white/5 border border-white/10'}`}>
                                        <PaymentMethodIcon id={method.id} selected={selectedPayment === method.id} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-xs font-black uppercase tracking-widest ${selectedPayment === method.id ? 'text-black' : 'text-white'}`}>{method.name}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-tight mt-0.5 ${selectedPayment === method.id ? 'text-black/50' : 'text-white/20'}`}>{method.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${selectedPayment === method.id ? 'bg-black/10 text-black' : 'bg-white/5 text-white/40'}`}>
                                        {method.fee}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedPayment === method.id ? 'text-black' : 'text-white/20'}`} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Security Text */}
                    <div className="mt-12 flex items-start gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">BoostGG Protection</p>
                            <p className="text-[9px] text-white/30 font-medium leading-relaxed uppercase tracking-tight">
                                Your payment is processed through encrypted channels. We never store your full card details. Money-back guarantee active.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Summary Area */}
                <div className="w-full md:w-[380px] bg-white text-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Pattern Background Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Order Summary</p>
                                <p className="text-xs font-black uppercase tracking-tight">Review details</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Offer Price</span>
                                <span className="text-sm font-black">{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Platform VAT (21%)</span>
                                <span className="text-sm font-black text-red-600">+{formatPrice(vatAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Processing Fee</span>
                                    <Info className="w-3 h-3 text-black/20" />
                                </div>
                                <span className="text-sm font-black">+{formatPrice(commissionAmount)}</span>
                            </div>
                            
                            <div className="pt-8 mt-8 border-t-2 border-black/5 flex flex-col gap-2">
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Total Amount</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter">{formatPrice(finalTotal)}</span>
                                    <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">EUR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-4 relative z-10">
                        <button 
                            onClick={() => onConfirm(selectedPayment)}
                            className="w-full bg-black text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] group"
                        >
                            Complete Order <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center justify-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
                             <span className="text-[8px] font-black uppercase tracking-widest">VISA</span>
                             <span className="text-[8px] font-black uppercase tracking-widest">MASTERCARD</span>
                             <span className="text-[8px] font-black uppercase tracking-widest">IDEAL</span>
                             <span className="text-[8px] font-black uppercase tracking-widest">BITCOIN</span>
                        </div>
                    </div>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(19, 193, 0, 0.3); }
                `}</style>
            </div>
        </div>
    );
};

export default PaymentModal;
