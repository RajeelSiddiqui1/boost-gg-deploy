import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Search, Eye, DollarSign,X, Check, Loader2 } from 'lucide-react';

const OrdersList = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClaimPrice, setEditingClaimPrice] = useState(null);
  const [claimPriceInput, setClaimPriceInput] = useState('');
  const [claimPriceLoading, setClaimPriceLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/orders/admin/all`); // assuming this exists or available
      setOrders(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      // Fallback
      try {
          const res = await axios.get(`${API_URL}/api/v1/orders/available`);
          setOrders(res.data.data || []);
      } catch (e) {
          console.error(e);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateClaimPrice = async (orderId) => {
    setClaimPriceLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/orders/${orderId}/claim-price`, 
        { customClaimPrice: Number(claimPriceInput) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingClaimPrice(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim price');
    } finally {
      setClaimPriceLoading(false);
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
            <h2 className="text-2xl font-black  tracking-tight">Order Nexus</h2>
            <p className="text-[10px] font-bold  text-white tracking-widest">Global platform operations monitoring</p>
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

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.01]">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20">Order ID</th>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20">Client / Booster</th>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20">Service Data</th>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20">Pro Claim Price</th>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black  tracking-widest text-white/20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black animate-pulse">Scanning Chains...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="px-8 py-20 text-center text-white/20 font-black ">No active data sequences</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-mono text-[10px] font-black text-white ">#ORD-{order._id.slice(-6)}</p>
                        <p className="text-[8px] font-bold text-white  mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black  text-white">C: {order.user?.name || 'Anonymous'}</p>
                          <p className="text-[10px] font-black  text-white/60">B: {order.pro?.name || 'Searching...'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black  text-white">{order.serviceId?.title || order.offer?.title || 'Custom Boost'}</p>
                        <p className="text-[9px] font-black text-white  mt-1">Paid: {formatPrice(order.amount || order.price)}</p>
                      </td>
                      <td className="px-8 py-6">
                        {editingClaimPrice === order._id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              value={claimPriceInput}
                              onChange={(e) => setClaimPriceInput(e.target.value)}
                              className="w-20 bg-black border border-primary/50 text-primary rounded-xl px-3 py-2 text-xs font-bold outline-none"
                              placeholder={order.customClaimPrice || order.boosterEarnings || order.price}
                              autoFocus
                            />
                            <button 
                              disabled={claimPriceLoading}
                              onClick={() => handleUpdateClaimPrice(order._id)}
                              className="p-2 bg-primary text-black rounded-xl hover:bg-white transition-all"
                            >
                              {claimPriceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => setEditingClaimPrice(null)}
                              className="p-2 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer group/price"
                            onClick={() => {
                              setEditingClaimPrice(order._id);
                              setClaimPriceInput(order.customClaimPrice || order.boosterEarnings || order.price);
                            }}
                          >
                            <span className="text-[11px] font-black text-green-500  group-hover/price:text-white transition-colors">
                              {formatPrice(order.customClaimPrice || order.boosterEarnings || order.price)}
                            </span>
                            <DollarSign className="w-3 h-3 text-white/10 group-hover/price:text-primary transition-colors" />
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black  tracking-widest border border-solid ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => navigate(`/admin/orders/${order._id}/bids`)}
                          className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all active:scale-95 flex items-center gap-2 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-[10px] font-black  text-white group-hover:text-white">Bids</span>
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

