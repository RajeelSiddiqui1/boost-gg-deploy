import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingCart, Search, Filter, Eye, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const OrdersList = () => {
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/orders/available`);
            setOrders(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filter === 'all' || o.status === filter;
        const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.offer?.title && o.offer.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'disputed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight">Order Nexus</h2>
                        <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest">Global platform operations monitoring</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-xs text-white font-black uppercase outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All States</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="disputed">Disputed</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Order ID or Service name..."
                                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-6 text-xs text-white outline-none focus:border-primary transition-all w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Order ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Client / Booster</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Service Data</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Insight</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black italic animate-pulse">Scanning Chains...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-white/20 font-black italic">No active data sequences</td></tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="font-mono text-[10px] font-black text-primary uppercase">#ORD-{order._id.slice(-6)}</p>
                                                <p className="text-[8px] font-bold text-white/20 uppercase mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-white/60">C: {order.user?.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] font-black uppercase text-primary/60">B: {order.pro?.name || 'Searching...'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black italic uppercase text-white/80">{order.offer?.title || 'Custom Boost'}</p>
                                                <p className="text-[9px] font-black text-green-500 uppercase mt-1">Value: {formatPrice(order.amount)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-solid ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all active:scale-95">
                                                    <Eye className="w-4 h-4" />
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
        </AdminLayout>
    );
};

export default OrdersList;
