import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Tag, Edit2, Check, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

const Bids = () => {
  const { formatPrice } = useCurrency();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEdit = (bid) => {
    setEditingBid(bid._id);
    setNewPrice(bid.bidPrice);
  };

  const handleUpdate = async (bidId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/bids/${bidId}`, 
        { bidPrice: Number(newPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBid(null);
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (bid) => {
    setToggleLoading(bid._id);
    try {
      const token = localStorage.getItem('token');
      const newStatus = bid.status === 'active' ? 'inactive' : 'active';
      await axios.put(`${API_URL}/api/v1/bids/${bid._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBids();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const activeBids = bids.filter(b => b.status === 'active');
  const inactiveBids = bids.filter(b => b.status === 'inactive');

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-white">
            Order Bids Control
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-primary tracking-widest uppercase">{activeBids.length} Active</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">{inactiveBids.length} Inactive</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Order Details</th>
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Original Price</th>
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Bid Price</th>
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Visibility</th>
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bids.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Tag className="w-12 h-12" />
                        <p className="text-[10px] font-black tracking-widest uppercase">No active bids found in memory</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bids.map((bid) => (
                    <tr key={bid._id} className={`group hover:bg-white/[0.01] transition-colors ${bid.status === 'inactive' ? 'opacity-40' : ''}`}>
                      <td className="p-8">
                        <div>
                          <p className="text-xs font-black text-white mb-1">
                            {bid.orderId?.serviceId?.title || 'Unknown Service'}
                          </p>
                          <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                            #{bid.orderId?._id?.slice(-8).toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="text-sm font-black text-white/60">
                          {formatPrice(bid.originalPrice)}
                        </span>
                      </td>
                      <td className="p-8">
                        {editingBid === bid._id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black">$</span>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white focus:outline-none focus:border-primary w-24"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-black text-primary">
                            {formatPrice(bid.bidPrice)}
                          </span>
                        )}
                      </td>
                      <td className="p-8">
                        <button
                          onClick={() => handleToggleStatus(bid)}
                          disabled={toggleLoading === bid._id}
                          className="flex items-center gap-3 cursor-pointer group/toggle"
                        >
                          {toggleLoading === bid._id ? (
                            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                          ) : bid.status === 'active' ? (
                            <ToggleRight className="w-8 h-8 text-primary transition-all group-hover/toggle:scale-110" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-white/20 transition-all group-hover/toggle:scale-110" />
                          )}
                          <span className={`text-[9px] font-black tracking-widest uppercase ${bid.status === 'active' ? 'text-primary' : 'text-white/30'}`}>
                            {bid.status}
                          </span>
                        </button>
                      </td>
                      <td className="p-8 text-right">
                        {editingBid === bid._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(bid._id)}
                              disabled={actionLoading}
                              className="p-3 bg-primary text-black rounded-xl hover:bg-white transition-all disabled:opacity-50"
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setEditingBid(null)}
                              className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(bid)}
                            className="p-4 bg-white/5 text-white/40 rounded-2xl hover:bg-primary hover:text-black transition-all group-hover:scale-105"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
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

export default Bids;
