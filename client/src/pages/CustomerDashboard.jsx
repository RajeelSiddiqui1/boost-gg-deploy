import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
 ShoppingCart, Clock, CheckCircle2,
 AlertCircle, MessageSquare, ChevronRight,
 Search, Filter, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import OrderChat from '../components/orders/OrderChat';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL, getImageUrl } from '../utils/api';

const BuyerDashboard = () => {
 const [tab, setTab] = useState('overview');
 const [orders, setOrders] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedOrderId, setSelectedOrderId] = useState(null);
 const [isChatOpen, setIsChatOpen] = useState(false);
 const { user } = useAuth();
 const { formatPrice } = useCurrency();
 const location = useLocation();

 // Parse tab from URL
 useEffect(() => {
 const params = new URLSearchParams(location.search);
 const currentTab = params.get('tab');
 if (currentTab) setTab(currentTab);
 }, [location]);

 useEffect(() => {
 const fetchData = async () => {
 try {
 const [ordersRes, walletRes] = await Promise.all([
 axios.get(`${API_URL}/api/v1/orders/me`),
 axios.get(`${API_URL}/api/v1/users/wallet`)
 ]);
 setOrders(ordersRes.data.data);
 setTransactions(walletRes.data.data.transactions);
 setLoading(false);
 } catch (err) {
 console.error(err);
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const getStatusStyle = (status) => {
 switch (status) {
 case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
 case 'processing': return 'bg-primary/10 text-primary border-primary/20';
 case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
 default: return 'bg-white/5 text-white/40 border-white/10';
 }
 };

 const renderContent = () => {
 switch (tab) {
 case 'wallet':
 return (
 <div className="space-y-8">
 {/* Wallet Summary */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-gradient-to-br from-primary/20 to-black border border-primary/30 rounded-[32px] p-8 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
 <div className="space-y-4 relative z-10">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Available Balance</p>
 <h2 className="text-4xl font-black text-white flex items-baseline gap-2">
 {formatPrice(user?.walletBalance || 0)}
 </h2>
 <button className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all">
 Add Funds
 </button>
 </div>
 </div>
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 flex items-center justify-between">
 <div className="space-y-2">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Total Transactions</p>
 <p className="text-2xl font-black text-white">{transactions.length}</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/5">
 <ShoppingCart className="w-6 h-6 text-white/20" />
 </div>
 </div>
 </div>

 {/* Recent Transactions */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
 <div className="p-8 border-b border-white/5">
 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Transaction History</h3>
 </div>
 <div className="p-4">
 {transactions.length === 0 ? (
 <p className="text-center py-10 text-white/20 font-black ">No transactions yet</p>
 ) : (
 <div className="space-y-2">
 {transactions.map(tx => (
 <div key={tx._id} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
 <div className="flex items-center gap-4">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
 {tx.type === 'credit' ? '↓' : '↑'}
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-white/80">{tx.description}</p>
 <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{new Date(tx.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 <p className={`text-xs font-black ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
 {tx.type === 'credit' ? '+' : '-'} {formatPrice(tx.amount)}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );

 case 'profile':
 return (
 <div className="max-w-2xl mx-auto space-y-8">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-10">
 <div className="flex items-center gap-8 mb-10 pb-10 border-b border-white/5">
 <div className="w-24 h-24 rounded-[32px] bg-primary/20 border-2 border-primary/50 flex items-center justify-center relative group overflow-hidden">
 {user?.avatar ? (
 <img src={user.avatar} className="w-full h-full object-cover" alt="" />
 ) : (
 <span className="text-3xl font-black text-primary uppercase">{user?.name?.charAt(0)}</span>
 )}
 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
 <Search className="w-6 h-6 text-white" />
 </div>
 </div>
 <div className="space-y-1">
 <h3 className="text-xl font-black uppercase text-white">{user?.name}</h3>
 <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest">{user?.email}</p>
 <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/50 text-primary text-[8px] font-black uppercase tracking-widest rounded-full">
 Vault Class: {user?.role === 'user' ? 'Elite Buyer' : user?.role.toUpperCase()}
 </span>
 </div>
 </div>

 <form className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Display Name</label>
 <input type="text" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-primary transition-all outline-none" />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-2">Email Address</label>
 <input type="email" value={user?.email} disabled className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white/40 cursor-not-allowed" />
 </div>
 </div>
 <div className="pt-4">
 <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center justify-center gap-2">
 Update Vault Profile <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </form>
 </div>
 </div>
 );

 default:
 return (
 <div className="space-y-8">
 {/* Stats Summary */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { label: 'Active Orders', value: orders.filter(o => o.status === 'processing').length, icon: Clock, color: 'text-primary' },
 { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500' },
 { label: 'Total Spent', value: formatPrice(orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.amount : 0), 0)), icon: ShoppingCart, color: 'text-white' }
 ].map((stat, i) => (
 <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group hover:border-white/10 transition-all">
 <div className="space-y-1">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
 <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
 </div>
 <div className={`w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
 <stat.icon className="w-6 h-6" />
 </div>
 </div>
 ))}
 </div>

 {/* Orders List */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
 <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Recent History</h3>
 <div className="flex gap-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input type="text" placeholder="Search orders..." className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-all" />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-white/[0.01]">
 <tr>
 <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Service</th>
 <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
 <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Booster</th>
 <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Price</th>
 <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {loading ? (
 <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black animate-pulse">Scanning Vault...</td></tr>
 ) : orders.length === 0 ? (
 <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black ">No orders in your vault</td></tr>
 ) : (
 orders.map((order) => (
 <tr key={order._id} className="group hover:bg-white/[0.01] transition-colors">
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
 <img src={getImageUrl(order.offer?.image)} className="w-6 h-6 object-contain opacity-60" alt="" />
 </div>
 <div>
 <p className="text-xs font-black uppercase text-white/80 group-hover:text-primary transition-colors">{order.offer?.title}</p>
 <p className="text-[9px] font-bold uppercase text-white/20">#{order._id.slice(-8).toUpperCase()}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
 {order.status}
 </span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
 <span className="text-[8px] font-black text-white/40">{order.pro?.name?.charAt(0) || '?'}</span>
 </div>
 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{order.pro?.name || 'Searching...'}</span>
 </div>
 </td>
 <td className="px-8 py-6 font-black text-xs">{formatPrice(order.amount)}</td>
 <td className="px-8 py-6 text-right">
 <button
 onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); setIsChatOpen(true); }}
 className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 text-white/40 hover:text-primary transition-all active:scale-90"
 >
 <MessageSquare className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
 }
 };

 return (
 <DashboardLayout title={tab === 'overview' ? 'Buyer Vault' : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}>
 {renderContent()}

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

export default BuyerDashboard;
