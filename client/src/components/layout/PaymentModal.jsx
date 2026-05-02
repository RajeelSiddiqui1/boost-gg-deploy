import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, ChevronRight, Info, Shield } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const PaymentMethodIcon = ({ id, selected }) => {
    // High-end text-based or icon logos for payment methods matching the screenshot
    switch (id) {
        case 'visa':
            return (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold italic text-white">VISA</span>
                    <div className="flex -space-x-1">
                        <div className="w-3 h-3 rounded-full bg-[#EB001B] opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-80"></div>
                    </div>
                </div>
            );
        case 'paypal':
            return <span className="text-[10px] font-bold italic tracking-tighter text-[#003087]">PayPal</span>;
        case 'ideal':
            return (
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-black border border-white/20 flex items-center justify-center rounded-sm">
                        <span className="text-[6px] font-bold text-white">iDEAL</span>
                    </div>
                </div>
            );
        case 'skrill':
            return <span className="text-[10px] font-bold uppercase tracking-tight text-[#821361]">Skrill</span>;
        case 'neteller':
            return <span className="text-[10px] font-bold uppercase tracking-widest text-[#73b640]">NETELLER</span>;
        case 'crypto':
            return (
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-[8px]">₿</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/40 uppercase">Crypto</span>
                </div>
            );
        case 'other':
            return <Lock className="w-3 h-3 text-white/40" />;
        default:
            return <CheckCircle2 className="w-4 h-4" />;
    }
};

const PaymentModal = ({ isOpen, onClose, total, onConfirm }) => {
    const { formatPrice } = useCurrency();
    const [selectedPayment, setSelectedPayment] = useState('visa');

    if (!isOpen) return null;

    const paymentMethods = [
        { id: 'visa', name: 'Visa or Mastercard', fee: '+ 3.9% + 0.99€', isSpecial: true },
        { id: 'paypal', name: 'PayPal', fee: '+ 5.9%' },
        { id: 'ideal', name: 'iDeal', fee: '+ 5.9%' },
        { id: 'skrill', name: 'Skrill Digital Wallet', fee: '+ 5.9%' },
        { id: 'neteller', name: 'Neteller', fee: '+ 5.9%' },
        { id: 'crypto', name: 'BTC, ETH, USDT, USDC and more', fee: '+ 5.9%' },
        { id: 'other', name: 'Other: Klarna, Przelewy24, Rapid, Paysafe', fee: '+ 5.9%' },
    ];

    const vatRate = 0.21;
    const commissionRate = 0.059;
    const vatAmount = total * vatRate;
    const commissionAmount = total * commissionRate;
    const finalTotal = total + vatAmount + commissionAmount;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['Outfit']">
            <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-8 z-20 text-white/20 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT: Selection Area */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[85vh] custom-scrollbar">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-4xl font-bold text-white tracking-tight">Payment method</h3>
                    </div>

                    <div className="grid gap-2">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`w-full group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                                    selectedPayment === method.id 
                                    ? 'bg-white/10 border-white/20' 
                                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                        <PaymentMethodIcon id={method.id} selected={selectedPayment === method.id} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-white/90">{method.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${method.isSpecial ? 'bg-[#6345ff] text-white' : 'bg-white/5 text-white/40'}`}>
                                        {method.fee}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Summary Area */}
                <div className="w-full md:w-[380px] bg-[#0c0c0c]/50 p-8 md:p-12 flex flex-col relative border-l border-white/5">
                    <div className="flex flex-col gap-6 mb-12">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white/40">Offer's price</span>
                            <span className="text-sm font-bold text-white">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white/40">VAT</span>
                            <span className="text-sm font-bold text-white">{formatPrice(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white/40">Payment commission</span>
                            <span className="text-sm font-bold text-white">{formatPrice(commissionAmount)}</span>
                        </div>
                        
                        <div className="mt-4 pt-6 border-t border-white/10 flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-white">Total price</span>
                            <span className="text-3xl font-bold text-white tracking-tighter">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-8">
                        <button 
                            onClick={() => onConfirm(selectedPayment)}
                            className="w-full bg-[#13C100] hover:bg-[#15d600] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-[#13C100]/20"
                        >
                            Buy now <Shield className="w-5 h-5 fill-white/10" />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-30">
                                <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1} />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter leading-none">SECURE</span>
                                    <span className="text-[8px] text-white uppercase tracking-widest leading-none">SSL ENCRYPTION</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-white/30 font-medium leading-relaxed">
                                We protect your privacy with advanced encryption
                            </p>
                        </div>
                    </div>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
                `}</style>
            </div>
        </div>
    );
};

export default PaymentModal;
