import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Wallet, Check, X, Clock, MessageSquare } from 'lucide-react';

const Finance = () => {
 const { formatPrice } = useCurrency();
 const [payouts, setPayouts] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchPayouts = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/payouts`);
 setPayouts(res.data.data);
 setLoading(false);
 } catch (err) {
 console.error(err);
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchPayouts();
 }, []);

 const handleUpdatePayout = async (id, status) => {
 const notes = prompt('Enter notes for this payout action (optional):');
 try {
 await axios.put(`${API_URL}/api/v1/payouts/${id}`, { status, notes });
 fetchPayouts();
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to update payout');
 }
 };

 return (
 <AdminLayout>
 <div className="space-y-8">
 <div className="space-y-1">
 <h2 className="text-2xl font-black uppercase tracking-tight">Finance Control</h2>
 <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest">Process withdrawal requests and manage platform liquidity</p>
 </div>

 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
 <div className="p-8 border-b border-white/5">
 <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Pending Payout Requests</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-white/[0.01]">
 <tr>
 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20">Booster</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20">Amount</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20">Method / Details</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20">Status</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase text-white/20 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {loading ? (
 <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black animate-pulse">Auditing Vaults...</td></tr>
 ) : payouts.length === 0 ? (
 <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black ">No payout requests pending</td></tr>
 ) : (
 payouts.map((payout) => (
 <tr key={payout._id} className="hover:bg-white/[0.01] transition-colors group">
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black uppercase">
 {payout.booster?.name?.charAt(0)}
 </div>
 <div>
 <p className="text-xs font-black uppercase text-white/80">{payout.booster?.name}</p>
 <p className="text-[8px] font-bold text-white/20 uppercase">{new Date(payout.requestedAt).toLocaleDateString()}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <p className="text-sm font-black text-green-500">{formatPrice(payout.amount)}</p>
 </td>
 <td className="px-8 py-6">
 <p className="text-[10px] font-black uppercase text-white/60">{payout.method}</p>
 <p className="text-[9px] font-bold text-white/20 tracking-tighter truncate max-w-[200px]">{payout.accountDetails}</p>
 </td>
 <td className="px-8 py-6">
 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${payout.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
 payout.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
 }`}>
 {payout.status}
 </span>
 </td>
 <td className="px-8 py-6 text-right space-x-2">
 {payout.status === 'pending' && (
 <>
 <button
 onClick={() => handleUpdatePayout(payout._id, 'paid')}
 className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/30 transition-all active:scale-95"
 title="Approve & Mark Paid"
 >
 <Check className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleUpdatePayout(payout._id, 'rejected')}
 className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/30 transition-all active:scale-95"
 title="Reject Request"
 >
 <X className="w-4 h-4" />
 </button>
 </>
 )}
 {payout.status !== 'pending' && (
 <span className="text-[8px] font-bold text-white/20 uppercase ">Processed by {payout.processedBy?.name || 'System'}</span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
};

export default Finance;
