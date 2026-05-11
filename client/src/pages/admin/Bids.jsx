import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Tag, Edit2, Check, X, Loader2, User, ToggleLeft, ToggleRight, Eye, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));

const Bids = () => {
  const { formatPrice } = useCurrency();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [tab, setTab] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBids();

    // Real-time: auto-refresh on any bid event
    socket.on('bidsUpdate', (data) => {
      console.log('[Socket] bidsUpdate:', data.action);
      fetchBids();
    });

    return () => {
      socket.off('bidsUpdate');
    };
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

  const activeBids = bids.filter(b => b.status === 'active' && !b.assignedUser);
  const assignedBids = bids.filter(b => b.assignedUser && b.completionStatus !== 'approved');
  const completedBids = bids.filter(b => b.assignedUser && b.completionStatus === 'approved');
  const inactiveBids = bids.filter(b => b.status === 'inactive' && !b.assignedUser);

  const displayedBids = tab === 'active' ? activeBids : tab === 'assigned' ? assignedBids : tab === 'completed' ? completedBids : inactiveBids;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-white">
            Order Bids Control
          </h2>
          <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-[22px] border border-white/10">
            <button 
              onClick={() => setTab('active')}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${tab === 'active' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className={`w-2 h-2 rounded-full ${tab === 'active' ? 'bg-black animate-pulse' : 'bg-primary'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase">{activeBids.length} Active</span>
            </button>
            
            <button 
              onClick={() => setTab('assigned')}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${tab === 'assigned' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className={`w-2 h-2 rounded-full ${tab === 'assigned' ? 'bg-black' : 'bg-blue-500'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase">{assignedBids.length} Ongoing</span>
            </button>

            <button 
              onClick={() => setTab('completed')}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${tab === 'completed' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className={`w-2 h-2 rounded-full ${tab === 'completed' ? 'bg-black' : 'bg-green-500'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase">{completedBids.length} Approved</span>
            </button>

            <button 
              onClick={() => setTab('inactive')}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${tab === 'inactive' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className={`w-2 h-2 rounded-full ${tab === 'inactive' ? 'bg-black' : 'bg-white/30'}`}></div>
              <span className="text-[10px] font-black tracking-widest uppercase">{inactiveBids.length} Inactive</span>
            </button>
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
                  {(tab === 'assigned' || tab === 'completed') ? (
                    <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Specialist</th>
                  ) : (
                    <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Visibility</th>
                  )}
                  <th className="p-8 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedBids.length === 0 ? (
                  <tr>
                    <td colSpan={tab === 'assigned' ? "5" : "5"} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Tag className="w-12 h-12" />
                        <p className="text-[10px] font-black tracking-widest uppercase">No {tab} bids found in registry</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedBids.map((bid) => (
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
                        {(tab === 'assigned' || tab === 'completed') ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                              {bid.assignedUser?.avatar ? (
                                <img src={getImageUrl(bid.assignedUser.avatar)} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white">{bid.assignedUser?.name || 'Assigned'}</p>
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{bid.assignedUser?.email?.split('@')[0]}</p>
                            </div>
                          </div>
                        ) : (
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
                        )}
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
                          <div className="flex justify-end gap-2">
                            {tab === 'assigned' && (
                              <button
                                onClick={() => navigate(`/admin/bids/${bid._id}/chat`)}
                                className="p-4 bg-white/5 text-white/40 rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/admin/bids/${bid._id}/details`)}
                              className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">View Bids</span>
                            </button>
                            {tab !== 'assigned' && (
                              <button
                                onClick={() => handleEdit(bid)}
                                className="p-4 bg-white/5 text-white/40 rounded-2xl hover:bg-primary hover:text-black transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
