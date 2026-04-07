import React from 'react';
import { X, ShoppingCart, Trash2, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';

const CartOverlay = () => {
    const {
        cartItems, removeFromCart, cartTotal, isCartOpen, setIsCartOpen,
        cartMode, showModeMismatchModal, confirmClearAndAdd,
        cancelModeMismatch, pendingItem
    } = useCart();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] font-['Outfit']">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Sidebar */}
            <div className="absolute top-0 right-0 bottom-0 w-full max-w-[450px] bg-[#0A0A0A] border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">Your Cart</h2>
                                {cartItems.length > 0 && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary text-black rounded-full shadow-[0_0_10px_rgba(162,230,62,0.3)]">
                                        {cartMode}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{cartItems.length} Items Selected</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-white/40 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <ShoppingCart className="w-16 h-16" />
                            <p className="text-xs font-black uppercase tracking-widest">Cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 shrink-0 relative bg-[#111]">
                                    <img src={item.image} className="w-full h-full object-cover opacity-60" alt={item.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-white/90 leading-tight pr-4">{item.title}</h4>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-white/20 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                            {item.calcValue} {item.unitName || 'Units'}
                                        </span>
                                        {Object.entries(item.selectedOptions || {}).map(([key, val], i) => (
                                            <span key={i} className="text-[9px] font-bold text-white/30 border border-white/10 px-2 py-0.5 rounded-md">
                                                {key}: {Array.isArray(val) ? val.join(', ') : val}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pt-2 text-sm font-black text-white">{formatPrice(item.price)} <span className="text-[10px] text-white/30 font-bold ml-1">x {item.quantity}</span></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-8 border-t border-white/10 bg-white/[0.01] space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Total Amount</span>
                            <div className="text-right">
                                <div className="text-2xl font-black italic text-white tracking-tighter">{formatPrice(cartTotal)}</div>
                                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Secure Checkout Active</div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                navigate('/checkout');
                            }}
                            className="w-full bg-primary hover:bg-[#722AEE] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Proceed to Checkout <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                        </button>

                        <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                            <Zap className="w-3 h-3 text-primary fill-primary" />
                            24/7 Delivery & Support Guaranteed
                        </p>
                    </div>
                )}
            </div>

            {/* Mode Mismatch Modal */}
            {showModeMismatchModal && (
                <div className="absolute inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-[40px] p-8 max-w-sm w-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] space-y-8">
                        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto border border-orange-500/20">
                            <Trash2 className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Clear Cart?</h3>
                            <p className="text-xs text-white/40 font-medium leading-relaxed">
                                Your cart contains <span className="text-primary font-black">{cartMode}</span> items.
                                Adding this will clear your current cart to start a <span className="text-primary font-black">{pendingItem?.mode}</span> order.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmClearAndAdd}
                                className="w-full py-4 bg-orange-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10"
                            >
                                Clear & Add New
                            </button>
                            <button
                                onClick={cancelModeMismatch}
                                className="w-full py-4 bg-white/5 text-white/40 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:text-white"
                            >
                                Keep Current Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartOverlay;
