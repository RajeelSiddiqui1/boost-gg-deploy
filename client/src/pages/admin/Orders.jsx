import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Search, Eye, Tag, X, Check, Loader2 } from 'lucide-react';

const OrdersList = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bidModal, setBidModal] = useState({ show: false, orderId: null, originalPrice: 0 });
  const [bidPriceInput, setBidPriceInput] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/admin/all`); 
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

  const handleCreateBid = async () => {
    if (!bidPriceInput) return alert('Please enter a bid price');
    setBidLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/bids`, 
        { orderId: bidModal.orderId, bidPrice: Number(bidPriceInput) }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBidModal({ show: false, orderId: null, originalPrice: 0 });
      setBidPriceInput('');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create bid');
    } finally {
      setBidLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filter === 'all' || o.status === filter;
    const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.offer?.title && o.offer.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.serviceId?.title && o.serviceId.title.toLowerCase().includes(searchTerm.toLowerCase()));
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
            <h2 className="text-2xl font-black  tracking-tight text-white">Order Nexus</h2>
            <p className="text-[10px] font-bold  text-white/40 tracking-widest uppercase">Global platform operations monitoring</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-xs text-white font-black  outline-none focus:border-primary transition-all appearance-none cursor-pointer"
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

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.01]">
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase">Client / Booster</th>
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase">Service Data</th>
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase">Booster Bid</th>
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black  tracking-widest text-white/20 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black animate-pulse uppercase">Scanning Chains...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black uppercase">No active data sequences</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-mono text-[10px] font-black text-white ">#ORD-{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-[8px] font-bold text-white/40  mt-1 uppercase">{new Date(order.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black  text-white">C: {order.user?.name || 'Anonymous'}</p>
                          <p className="text-[10px] font-black  text-white/60">B: {order.pro?.name || 'Searching...'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black  text-white truncate max-w-[200px]">{order.serviceId?.title || order.offer?.title || 'Custom Boost'}</p>
                        <p className="text-[9px] font-black text-primary  mt-1 uppercase">Paid: {formatPrice(order.amount || order.price)}</p>
                      </td>
                      <td className="px-8 py-6">
                        {order.bid ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-primary">{formatPrice(order.bid.bidPrice)}</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase mt-0.5">Active Bid</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setBidModal({ show: true, orderId: order._id, originalPrice: order.price });
                              setBidPriceInput(Math.round(order.price * 0.1)); // Default 10%
                            }}
                            className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black text-primary hover:bg-primary hover:text-black transition-all uppercase tracking-widest"
                          >
                            Create Bid
                          </button>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black  tracking-widest border border-solid uppercase ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all active:scale-95"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE BID MODAL */}
      {bidModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setBidModal({ show: false, orderId: null, originalPrice: 0 })} />
          <div className="bg-[#0D0D0D] border border-white/10 rounded-[48px] p-12 w-full max-w-md relative animate-in fade-in zoom-in duration-300 shadow-[0_0_80px_rgba(162,230,62,0.1)]">
            <h3 className="text-2xl font-black text-white tracking-tighter mb-8 flex items-center gap-4">
              Initialize Deployment Bid
              <Tag className="w-6 h-6 text-primary" />
            </h3>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <p className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-2">Original Order Price</p>
                <p className="text-2xl font-black text-white">{formatPrice(bidModal.originalPrice)}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-3 block ml-2">Set Booster Bid Price</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                  <input 
                    type="number"
                    value={bidPriceInput}
                    onChange={(e) => setBidPriceInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-12 pr-6 text-xl font-black text-white outline-none focus:border-primary transition-all shadow-inner"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                <p className="text-[9px] font-bold text-white/20 mt-3 ml-2 uppercase italic tracking-widest">Recommended: {formatPrice(bidModal.originalPrice * 0.1)} (10%)</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setBidModal({ show: false, orderId: null, originalPrice: 0 })}
                  className="flex-1 py-5 rounded-3xl bg-white/5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateBid}
                  disabled={bidLoading}
                  className="flex-1 py-5 rounded-3xl bg-primary text-black text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {bidLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Deploy Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersList;
