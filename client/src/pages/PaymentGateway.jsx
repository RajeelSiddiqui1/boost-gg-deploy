import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const { selectedPaymentMethod, instantItem } = location.state || {};

    useEffect(() => {
        // Simulate redirect/loading delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Redirect to home if no state
    if (!location.state) {
        navigate('/');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium text-sm">Securely connecting to payment gateway...</p>
            </div>
        );
    }

    // PayPal Mock Layout (matches screenshot)
    if (selectedPaymentMethod === 'paypal') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-between font-sans">
                <div className="w-full flex-1 flex flex-col items-center pt-16 px-4">
                    {/* PayPal Logo Mock */}
                    <div className="mb-8">
                        <span className="text-[#003087] text-4xl font-black italic tracking-tighter">PayPal</span>
                    </div>

                    <div className="w-full max-w-[400px] flex flex-col items-center">
                        <h1 className="text-[22px] text-[#2c2e2f] mb-6 font-medium">
                            Enter your email address to get started.
                        </h1>

                        <div className="w-full mb-4">
                            <input 
                                type="text" 
                                placeholder="Email or mobile number" 
                                className="w-full px-4 py-3.5 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-[15px]"
                            />
                        </div>

                        <div className="w-full flex justify-start mb-6">
                            <button className="text-[#0066c0] font-medium text-sm hover:underline">
                                Forgot email?
                            </button>
                        </div>

                        <button className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3.5 rounded-full text-base transition-colors mb-6">
                            Next
                        </button>

                        <div className="w-full flex items-center justify-center gap-4 mb-6">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <span className="text-gray-500 text-sm">or</span>
                            <div className="h-px bg-gray-300 flex-1"></div>
                        </div>

                        <button className="w-full bg-white border border-[#2c2e2f] text-[#2c2e2f] hover:bg-gray-50 font-bold py-3.5 rounded-full text-base transition-colors mb-10">
                            Create an Account
                        </button>
                        
                        <button onClick={() => navigate(-1)} className="text-[#0066c0] font-medium text-sm hover:underline">
                            Cancel and return to BOOSTGG
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="w-full py-4 text-center text-gray-500 text-[11px] font-medium space-x-3">
                    <button className="hover:underline">Contact Us</button>
                    <button className="hover:underline">Privacy</button>
                    <button className="hover:underline">Legal</button>
                    <button className="hover:underline">Policy Updates</button>
                    <button className="hover:underline">Worldwide</button>
                </div>
            </div>
        );
    }

    // Generic Gateway Mock for others
    return (
        <div className="min-h-screen bg-[#f6f9fc] flex flex-col items-center justify-center font-sans p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-[400px]">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                        {selectedPaymentMethod} Checkout
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Complete your secure payment</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 text-sm">Item:</span>
                        <span className="font-bold text-gray-800 text-sm line-clamp-1 max-w-[200px] text-right">{instantItem?.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Total:</span>
                        <span className="font-bold text-gray-800 text-sm">${instantItem?.price}</span>
                    </div>
                </div>

                <button className="w-full bg-[#635bff] hover:bg-[#524be3] text-white font-bold py-3.5 rounded-lg text-sm transition-colors mb-4">
                    Pay Now
                </button>
                
                <button onClick={() => navigate(-1)} className="w-full text-gray-500 text-sm font-medium hover:text-gray-700">
                    Cancel and return
                </button>
            </div>
        </div>
    );
};

export default PaymentGateway;
