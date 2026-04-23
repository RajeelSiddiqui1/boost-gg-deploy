import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
 Zap, Clock, CheckCircle2,
 MessageSquare, ChevronRight,
 Gamepad2, Info, Check, X,
 DollarSign, TrendingUp, AlertCircle,
 BarChart3, Wallet, ShieldCheck,
 ArrowUpRight, Image as ImageIcon,
 Plus, Upload, Trash2, Edit3, Share2, Video, FileText
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import OrderChat from '../components/orders/OrderChat';

const PayoutModal = ({ isOpen, onClose, balance, onRefresh }) => {
 const [amount, setAmount] = useState('');
 const [method, setMethod] = useState('bank');
 const [details, setDetails] = useState('');
 const [loading, setLoading] = useState(false);
 const toast = useToast();
 const { formatPrice } = useCurrency();

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (Number(amount) < 1000) return toast.error(`Minimum payout is ${formatPrice(1000)}`);
 if (Number(amount) > balance) return toast.error('Insufficient balance');

 setLoading(true);
 try {
 await axios.post(`${API_URL}/api/v1/payouts/request`, {
 amount: Number(amount),
 method,
 accountDetails: { details } // Simplified for now
 });
 toast.success('Payout request submitted successfully');
 onRefresh();
 onClose();
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to request payout');
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
 <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
 <div className="relative w-full max-w-[500px] bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 overflow-hidden">
 <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full"></div>

 <h3 className="text-2xl font-black uppercase text-white mb-2 relative z-10">Request Payout</h3>
 <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-8 relative z-10">Select your preferred withdrawal method</p>

 <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Amount (Min {formatPrice(1000)})</label>
 <input
 type="number"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 placeholder="0.00"
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Method</label>
 <select
 value={method}
 onChange={(e) => setMethod(e.target.value)}
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white appearance-none"
 >
 <option value="bank">Bank Transfer</option>
 <option value="easypaisa">Easypaisa</option>
 <option value="jazzcash">JazzCash</option>
 <option value="binance">Binance (USDT)</option>
 <option value="wise">Wise</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase text-white/30 ml-2">Account Details</label>
 <textarea
 value={details}
 onChange={(e) => setDetails(e.target.value)}
 placeholder="Enter account number, title, bank name or wallet address..."
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white min-h-[100px]"
 ></textarea>
 </div>

 <div className="flex gap-4 pt-4">
 <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
 <button type="submit" disabled={loading} className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50">
 {loading ? 'Processing...' : 'Request Payout'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

const ProDashboard = () => {
 const { user, checkUserLoggedIn } = useAuth();

 // Role Categories
 const isCommercePro = useMemo(() => ['booster', 'gold_seller', 'account_seller'].includes(user?.proType), [user]);
 const isContentPro = useMemo(() => ['content_creator', 'blogger'].includes(user?.proType), [user]);
 const isPartnerPro = useMemo(() => user?.proType === 'influencer_partner', [user]);

 const [tab, setTab] = useState('work'); // Initial, will be overridden by useEffect or logic below

 useEffect(() => {
 if (isCommercePro) setTab('work');
 else if (isContentPro) setTab('assignments');
 else if (isPartnerPro) setTab('referrals');
 }, [isCommercePro, isContentPro, isPartnerPro]);

 const [availableOrders, setAvailableOrders] = useState([]);
 const [activeOrders, setActiveOrders] = useState([]);
 const [payouts, setPayouts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [claimingId, setClaimingId] = useState(null);
 const [completingId, setCompletingId] = useState(null);
 const [selectedOrderId, setSelectedOrderId] = useState(null);
 const [isChatOpen, setIsChatOpen] = useState(false);
 const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

 // Multi-proof state
 const [showProofUpload, setShowProofUpload] = useState(null);
 const [tempProofs, setTempProofs] = useState([]);
 const { formatPrice } = useCurrency();
 const toast = useToast();

 const fetchData = async () => {
 try {
 const [availableRes, myOrdersRes, payoutRes] = await Promise.all([
 axios.get(`${API_URL}/api/v1/orders/available`),
 axios.get(`${API_URL}/api/v1/orders/booster`),
 axios.get(`${API_URL}/api/v1/payouts/me`)
 ]);
 setAvailableOrders(availableRes.data.data);
 setActiveOrders(myOrdersRes.data.data.filter(o => o.status === 'processing' || o.status === 'pending'));
 setPayouts(payoutRes.data.data);
 setLoading(false);
 } catch (err) {
 console.error(err);
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(fetchData, 30000); // Poll every 30s
 return () => clearInterval(interval);
 }, []);

 const handleClaim = async (id) => {
 setClaimingId(id);
 try {
 await axios.put(`${API_URL}/api/v1/orders/${id}/claim`);
 toast.success('Order claimed successfully! Go to Active Work to start.');
 fetchData();
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to claim order');
 } finally {
 setClaimingId(null);
 }
 };

 const handleCompleteSubmit = async (orderId) => {
 if (tempProofs.length === 0) return toast.error('Please upload at least one proof screenshot');

 setCompletingId(orderId);
 try {
 // In a real app, you'd upload files to Cloudinary/S3 first.
 // For now, we simulate by sending the URLs.
 await axios.put(`${API_URL}/api/v1/orders/${orderId}/complete`, {
 proof: tempProofs[0], // Fallback for legacy database field
 proofs: tempProofs // Multi-file proof support
 });
 toast.success('Order submitted for completion!');
 setShowProofUpload(null);
 setTempProofs([]);
 fetchData();
 checkUserLoggedIn();
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to complete order');
 } finally {
 setCompletingId(null);
 }
 };

 const handleReject = async (id) => {
 const reason = prompt('Please enter the reason for rejecting this order:');
 if (!reason) return;

 try {
 await axios.put(`${API_URL}/api/v1/orders/${id}/reject`, { reason });
 toast.success('Order returned to pool');
 fetchData();
 } catch (err) {
 toast.error(err.response?.data?.message || 'Failed to reject order');
 }
 };

 const stats = useMemo(() => {
 if (isCommercePro) {
 return [
 { label: 'Available Jobs', value: availableOrders.length, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
 { label: 'Active Work', value: activeOrders.length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
 { label: 'Total Earnings', value: formatPrice(user?.earnings || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/5' },
 { label: 'Avg Rating', value: `${user?.rating || 0}/5`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/5' }
 ];
 }
 if (isContentPro) {
 return [
 { label: 'Assignments', value: '0', icon: FileText, color: 'text-primary', bg: 'bg-primary/5' },
 { label: 'Published Items', value: user?.proProfile?.portfolio?.length || 0, icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/5' },
 { label: 'Content Earnings', value: formatPrice(user?.earnings || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/5' },
 { label: 'Author Rating', value: `${user?.rating || 0}/5`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/5' }
 ];
 }
 if (isPartnerPro) {
 return [
 { label: 'Link Clicks', value: '1.2K', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
 { label: 'Ref. Conversions', value: '48', icon: Share2, color: 'text-blue-500', bg: 'bg-blue-500/5' },
 { label: 'Partner Earnings', value: formatPrice(user?.earnings || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/5' },
 { label: 'Reputation', value: `${user?.rating || 0}/5`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/5' }
 ];
 }
 return [];
 }, [availableOrders, activeOrders, user, isCommercePro, isContentPro, isPartnerPro, formatPrice]);

 const renderOrderCard = (order, isStatusActive = false) => {
 const service = order.serviceId;
 const options = order.selectedOptions || {};

 return (
 <div key={order._id} className="group bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/40 transition-all flex flex-col">
 <div className="p-8 space-y-6 flex-1">
 {/* Header */}
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center p-2">
 <img src={getImageUrl(service?.image)} className="w-full h-full object-contain opacity-80" alt="" />
 </div>
 <div>
 <h4 className="text-md font-black uppercase text-white group-hover:text-primary transition-colors leading-tight ">{service?.title}</h4>
 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{service?.game}</p>
 </div>
 </div>
 {isStatusActive && (
 <div className="flex flex-col items-end">
 <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Active</span>
 <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">ID: {order._id.slice(-6)}</span>
 </div>
 )}
 </div>

 {/* Options Breakdown */}
 <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
 <div className="flex items-center gap-2 mb-1">
 <BarChart3 className="w-3.5 h-3.5 text-white/20" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Specifications</span>
 </div>
 <div className="grid grid-cols-2 gap-3">
 {Object.entries(options).map(([key, val]) => (
 val && (
 <div key={key} className="flex flex-col">
 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
 <span className="text-[10px] font-bold text-white/80">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
 </div>
 )
 ))}
 {order.calcValue && (
 <div className="flex flex-col">
 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Quantity/Range</span>
 <span className="text-[10px] font-bold text-white/80">{order.calcValue} Units</span>
 </div>
 )}
 </div>
 </div>

 {/* Financials */}
 <div className="flex items-center justify-between pt-2">
 <div>
 <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Your Earnings</p>
 <div className="text-xl font-black text-white">{formatPrice(order.boosterEarnings || order.price)}</div>
 </div>
 <div className="text-right">
 <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Total Fee</p>
 <div className="text-sm font-bold text-white/40">{formatPrice(order.price)}</div>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
 {!isStatusActive ? (
 <button
 onClick={() => handleClaim(order._id)}
 disabled={claimingId === order._id}
 className="w-full bg-primary hover:bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
 >
 {claimingId === order._id ? 'Securing...' : 'Claim This Order'}
 </button>
 ) : (
 <>
 <button
 onClick={() => { setSelectedOrderId(order._id); setIsChatOpen(true); }}
 className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
 >
 <MessageSquare className="w-4 h-4" /> Chat
 </button>
 <button
 onClick={() => setShowProofUpload(order._id)}
 className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-green-500/20"
 >
 <Check className="w-4 h-4" /> Complete
 </button>
 </>
 )}
 </div>
 </div>
 );
 };

 return (
 <DashboardLayout title="Booster Control Hub">
 <div className="relative isolate">
 {/* Background Decorations */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
 <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

 {/* Stats Bar */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {stats.map((stat, i) => (
 <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
 <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
 <div className="relative z-10 space-y-4">
 <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${stat.color}`}>
 <stat.icon className="w-6 h-6" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">{stat.label}</p>
 <p className="text-3xl font-black ">{stat.value}</p>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="space-y-12">
 {/* Navigation Tabs */}
 <div className="flex flex-wrap gap-2 p-1.5 bg-[#0A0A0A] border border-white/5 rounded-[24px] w-fit">
 {isCommercePro && [
 { id: 'work', label: 'Marketplace', icon: Zap },
 { id: 'active', label: 'Active Work', icon: Clock },
 { id: 'earnings', label: 'Financials', icon: Wallet }
 ].map(t => (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <t.icon className="w-4 h-4" /> {t.label}
 {t.id === 'work' && availableOrders.length > 0 && (
 <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse ml-1"></span>
 )}
 </button>
 ))}

 {isContentPro && [
 { id: 'assignments', label: 'Assignments', icon: FileText },
 { id: 'my_content', label: 'My Content', icon: Video },
 { id: 'earnings', label: 'Financials', icon: Wallet }
 ].map(t => (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <t.icon className="w-4 h-4" /> {t.label}
 </button>
 ))}

 {isPartnerPro && [
 { id: 'referrals', label: 'Referral Center', icon: Share2 },
 { id: 'promos', label: 'My Promos', icon: Zap },
 { id: 'earnings', label: 'Financials', icon: Wallet }
 ].map(t => (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <t.icon className="w-4 h-4" /> {t.label}
 </button>
 ))}

 <button
 onClick={() => setTab('history')}
 className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
 >
 <TrendingUp className="w-4 h-4" /> History
 </button>
 </div>

 {/* Rendering Logic */}
 <div className="min-h-[400px]">
 {tab === 'work' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex items-center justify-between">
 <h3 className="text-2xl font-black uppercase tracking-tight">Available Assignments</h3>
 <div className="flex items-center gap-2 text-white/20">
 <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
 <span className="text-[9px] font-black uppercase tracking-widest">Live Feed</span>
 </div>
 </div>

 {availableOrders.length === 0 ? (
 <div className="py-32 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[40px] text-center space-y-6">
 <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
 <AlertCircle className="w-10 h-10 text-white/10" />
 </div>
 <div>
 <h4 className="text-xl font-black uppercase text-white/40">Market is quiet</h4>
 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Check back soon for new opportunities</p>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {availableOrders.map(o => renderOrderCard(o))}
 </div>
 )}
 </div>
 )}

 {tab === 'active' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h3 className="text-2xl font-black uppercase tracking-tight">Operational Tasks</h3>
 {activeOrders.length === 0 ? (
 <div className="py-24 text-center text-white/20 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">
 No active operations in progress.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {activeOrders.map(o => renderOrderCard(o, true))}
 </div>
 )}
 </div>
 )}

 {tab === 'earnings' && (
 <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 <h3 className="text-2xl font-black uppercase tracking-tight">Financial Overview</h3>
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-10 opacity-5">
 <TrendingUp size={150} />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
 <div className="space-y-1">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Withdrawable Balance</p>
 <h2 className="text-5xl font-black text-white flex items-center gap-4">
 {formatPrice(user?.earnings || 0)}
 <ArrowUpRight className="text-primary w-8 h-8" />
 </h2>
 <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] pt-4">Processing Time: 24-48 Hours</p>
 </div>
 <div className="flex items-end">
 <button onClick={() => setIsPayoutModalOpen(true)} className="w-full bg-primary text-black py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/10">
 Initialize Withdrawal
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <h3 className="text-lg font-black uppercase tracking-tight">System Reliability</h3>
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-6">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <div className="flex-1">
 <p className="text-[10px] font-black uppercase text-white/80">Premium Trust Score</p>
 <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
 <div className="bg-green-500 h-full w-[95%]"></div>
 </div>
 </div>
 </div>
 <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase tracking-wider">
 Your reliability score is calculated based on completion time, buyer feedback, and proof of work submission quality.
 </p>
 </div>
 </div>
 </div>

 {/* Transaction History table */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
 <div className="p-8 border-b border-white/5 flex items-center justify-between">
 <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Payout Registry</h3>
 <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Showing last {payouts.length} entries</div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-white/[0.01]">
 <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Entry Date</th>
 <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Disbursement</th>
 <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest">Mechanism</th>
 <th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 tracking-widest text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {payouts.length === 0 ? (
 <tr><td colSpan="4" className="px-10 py-20 text-center text-white/20 font-black ">Registry is currently empty</td></tr>
 ) : (
 payouts.map(p => (
 <tr key={p._id} className="hover:bg-white/[0.01] transition-colors">
 <td className="px-10 py-6 text-xs font-bold text-white/60">{new Date(p.requestedAt).toLocaleDateString()}</td>
 <td className="px-10 py-6 text-sm font-black text-white flex items-center gap-2">
 {formatPrice(p.amount)}
 </td>
 <td className="px-10 py-6">
 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1 rounded-md">{p.method}</span>
 </td>
 <td className="px-10 py-6 text-right">
 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
 p.status === 'paid' || p.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
 'bg-red-500/10 text-red-500 border border-red-500/20'
 }`}>
 {p.status}
 </span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {tab === 'assignments' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h3 className="text-2xl font-black uppercase tracking-tight">Content Assignments</h3>
 <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
 <FileText className="w-8 h-8 text-white/20" />
 </div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No active writing or streaming assignments found.</p>
 </div>
 </div>
 )}

 {tab === 'my_content' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h3 className="text-2xl font-black uppercase tracking-tight">My Published Content</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {user?.proProfile?.portfolio?.map((item, i) => (
 <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden group hover:border-primary/40 transition-all">
 <div className="aspect-video bg-white/5 flex items-center justify-center">
 {item.type === 'video' ? <Video className="w-10 h-10 text-primary" /> : <FileText className="w-10 h-10 text-blue-400" />}
 </div>
 <div className="p-6">
 <h4 className="font-black uppercase text-sm mb-2">{item.title}</h4>
 <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
 View Live <ArrowUpRight className="w-3 h-3" />
 </a>
 </div>
 </div>
 ))}
 <button
 onClick={() => window.location.href = '/pro/settings'}
 className="py-24 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center group hover:border-primary/40 transition-all gap-4"
 >
 <Plus className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Add New Content</span>
 </button>
 </div>
 </div>
 )}

 {tab === 'referrals' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h3 className="text-2xl font-black uppercase tracking-tight">Referral Performance</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Total Clicks</p>
 <div className="text-3xl font-black ">1.2K</div>
 </div>
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Total Referrals</p>
 <div className="text-3xl font-black ">48</div>
 </div>
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Conversion Rate</p>
 <div className="text-3xl font-black ">4.2%</div>
 </div>
 </div>
 <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
 <div>
 <h4 className="text-xl font-black uppercase tracking-tight mb-2">Your Unique Referral Link</h4>
 <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Share this link to earn commission on every order</p>
 </div>
 <div className="flex bg-black/40 border border-white/10 rounded-2xl overflow-hidden w-full md:w-auto">
 <div className="px-6 py-4 text-xs font-bold text-white/60 truncate max-w-[300px]">
 {window.location.origin}?ref={user?._id}
 </div>
 <button
 onClick={() => {
 navigator.clipboard.writeText(`${window.location.origin}?ref=${user?._id}`);
 toast.success('Link copied to clipboard!');
 }}
 className="px-8 py-4 bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
 >
 Copy
 </button>
 </div>
 </div>
 </div>
 )}

 {tab === 'promos' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h3 className="text-2xl font-black uppercase tracking-tight">Personal Promo Codes</h3>
 <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
 <Zap className="w-8 h-8 text-primary/40" />
 </div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Ask your manager to generate a custom promo code for your audience.</p>
 </div>
 </div>
 )}

 {tab === 'history' && (
 <div className="py-24 text-center text-white/20 font-black uppercase tracking-widest border border-white/5 rounded-[40px] animate-in fade-in duration-500">
 History system integration in progress.
 </div>
 )}
 </div>
 </div>

 {/* Proof Upload Overlay Modal */}
 {showProofUpload && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
 <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowProofUpload(null)}></div>
 <div className="relative w-full max-w-[600px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

 <h3 className="text-3xl font-black uppercase text-white mb-2 relative z-10">Proof of Completion</h3>
 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-10 relative z-10 flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-primary" /> Verified submission required
 </p>

 <div className="space-y-8 relative z-10">
 <div className="space-y-4">
 <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-2">Upload Screenshots/Video Links</label>

 {/* Link Input */}
 <div className="flex gap-2">
 <div className="relative flex-1">
 <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
 <input
 type="text"
 id="proofLinkInput"
 placeholder="Paste screenshot URL here..."
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-16 pr-6 focus:border-primary/50 transition-all outline-none font-bold text-white/80"
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 const val = e.target.value;
 if (val) {
 setTempProofs([...tempProofs, val]);
 e.target.value = '';
 }
 }
 }}
 />
 </div>
 <button
 onClick={() => {
 const input = document.getElementById('proofLinkInput');
 if (input.value) {
 setTempProofs([...tempProofs, input.value]);
 input.value = '';
 }
 }}
 className="px-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>

 {/* Proof List */}
 <div className="grid grid-cols-2 gap-4">
 {tempProofs.map((p, i) => (
 <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10">
 <img src={p} className="w-full h-full object-cover opacity-60" alt="" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <button onClick={() => setTempProofs(tempProofs.filter((_, idx) => idx !== i))} className="p-3 bg-red-500 rounded-full text-white shadow-xl">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 {tempProofs.length === 0 && (
 <div className="col-span-2 py-10 rounded-2xl bg-white/[0.01] border border-white/5 border-dashed flex flex-col items-center justify-center space-y-2">
 <Upload className="w-6 h-6 text-white/10" />
 <span className="text-[9px] font-black uppercase tracking-widest text-white/10">No proofs added yet</span>
 </div>
 )}
 </div>
 </div>

 <div className="flex gap-4 pt-6">
 <button onClick={() => setShowProofUpload(null)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
 <button
 disabled={tempProofs.length === 0 || completingId}
 onClick={() => handleCompleteSubmit(showProofUpload)}
 className="flex-1 py-5 bg-primary text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
 >
 {completingId ? 'Finalizing...' : 'Submit Operation'}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 <PayoutModal
 isOpen={isPayoutModalOpen}
 onClose={() => setIsPayoutModalOpen(false)}
 balance={user?.earnings || 0}
 onRefresh={() => { fetchData(); checkUserLoggedIn(); }}
 />

 {selectedOrderId && (
 <OrderChat
 orderId={selectedOrderId}
 isOpen={isChatOpen}
 onClose={() => setIsChatOpen(false)}
 />
 )}
 </DashboardLayout>
 );
};

export default ProDashboard;
