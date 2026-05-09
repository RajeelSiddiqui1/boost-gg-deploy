import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, User, DollarSign, Clock, 
  ArrowLeft, Search, Filter, Loader2,
  Trophy, TrendingDown, Target, ShieldCheck, Mail
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_URL, getImageUrl } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));

const AdminBidDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subTab, setSubTab] = useState('bidders'); // 'bidders', 'claims', or 'chat'
  const [isAssigning, setIsAssigning] = useState(null); // ID of pro being assigned
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchBidDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/v1/bids/${id}/bidders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBid(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchBidDetails();
  }, [id]);

  useEffect(() => {
    if (subTab === 'chat' && id) {
      const fetchChat = async () => {
        setChatLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/api/v1/chats/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(res.data.data || []);
          setChatLoading(false);
        } catch (err) {
          console.error(err);
          setChatLoading(false);
        }
      };
      fetchChat();
    }
  }, [subTab, id]);

  useEffect(() => {
    socket.emit('joinBid', id);
    
    const handleNewMessage = (newMsg) => {
      if (subTab === 'chat') {
        setMessages(prev => [...prev, newMsg]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('bidUpdate', (data) => {
      if (data.bidId === id) {
        // Refresh bid details
        const fetchBidDetails = async () => {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/api/v1/bids/${id}/bidders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBid(res.data.data);
        };
        fetchBidDetails();
      }
    });

    return () => {
      socket.emit('leaveBid', id);
      socket.off('newMessage', handleNewMessage);
      socket.off('bidUpdate');
    };
  }, [id, subTab]);

  const handleApproveAssign = async (proId, amount) => {
    if (!window.confirm(`Are you sure you want to assign this mission to this booster for ${formatPrice(amount)}?`)) return;
    
    setIsAssigning(proId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/bids/${id}/approve`, {
        proId,
        amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect back to bids list after successful assignment
      navigate('/admin/bids');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve bid');
    } finally {
      setIsAssigning(null);
    }
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewCompletion = async (decision) => {
    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/bids/${id}/review-completion`, {
        decision
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBid();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to review completion');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!bid) {
    return (
      <AdminLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <Search size={40} />
          </div>
          <h2 className="text-2xl font-black text-white">Bid Registry Not Found</h2>
          <button onClick={() => navigate(-1)} className="px-8 py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl transition-all font-black text-xs">Return to Bids</button>
        </div>
      </AdminLayout>
    );
  }

  const filteredBidders = bid.bidders.filter(b => 
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.amount - b.amount);

  const filteredClaimants = bid.claims?.filter(c => 
    c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) || [];

  const activeData = subTab === 'bidders' ? filteredBidders : filteredClaimants;

  const service = bid.orderId?.serviceId;

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center p-4 shrink-0 group-hover:bg-primary/10 transition-colors shadow-2xl">
                  <img src={getImageUrl(service?.icon || service?.image)} className="w-full h-full object-contain" alt="" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">Booster Bids Live</span>
                    <span className="text-[10px] font-bold text-white/40">ORD-#{bid.orderId?._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{service?.title || 'Service Registry'}</h2>
                </div>
              </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-white/40 tracking-normal uppercase">Original Price</p>
                <p className="text-lg font-black text-white/60 line-through">{formatPrice(bid.originalPrice)}</p>
            </div>
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-3xl p-4 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
                </div>
                <div>
                <p className="text-[9px] font-black text-primary tracking-normal uppercase">Platform Ask</p>
                <p className="text-xl font-black text-white">{formatPrice(bid.bidPrice)}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/5">
            <button 
                onClick={() => setSubTab('bidders')}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${subTab === 'bidders' ? 'text-primary' : 'text-white/30 hover:text-white'}`}
            >
                Competitive Bidders ({bid.bidders.length})
                {subTab === 'bidders' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_20px_rgba(162,230,62,0.5)]"></div>}
            </button>
            {/* <button 
                onClick={() => setSubTab('claims')}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${subTab === 'claims' ? 'text-primary' : 'text-white/30 hover:text-white'}`}
            >
                Instant Claimants ({bid.claims?.length || 0})
                {subTab === 'claims' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_20px_rgba(162,230,62,0.5)]"></div>}
            </button> */}
            {bid.assignedUser && (
              <button 
                  onClick={() => setSubTab('chat')}
                  className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${subTab === 'chat' ? 'text-primary' : 'text-white/30 hover:text-white'}`}
              >
                  Live Communication Monitor
                  {subTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_20px_rgba(162,230,62,0.5)]"></div>}
              </button>
            )}
            {bid.completionStatus && bid.completionStatus !== 'none' && (
              <button 
                  onClick={() => setSubTab('completion')}
                  className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${subTab === 'completion' ? 'text-primary' : 'text-white/30 hover:text-white'}`}
              >
                  Completion Proofs
                  {subTab === 'completion' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_20px_rgba(162,230,62,0.5)]"></div>}
              </button>
            )}
        </div>

        {subTab === 'completion' && bid.completionStatus && bid.completionStatus !== 'none' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white">Mission Completion Review</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pro Proof */}
                {bid.completionProof && (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-4">
                        <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Specialist Submission</p>
                        {bid.completionProof.imageUrl && (
                            <img src={getImageUrl(bid.completionProof.imageUrl)} className="w-full max-h-64 object-contain bg-black rounded-2xl" alt="Pro Proof" />
                        )}
                        {bid.completionProof.comment && (
                            <p className="text-sm text-white/80 bg-black/50 p-4 rounded-xl">{bid.completionProof.comment}</p>
                        )}
                        <p className="text-[10px] text-white/40">{new Date(bid.completionProof.submittedAt).toLocaleString()}</p>
                    </div>
                )}
                
                {/* Customer Proof */}
                {bid.customerProof && bid.customerProof.imageUrl ? (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Customer Confirmation</p>
                            {bid.customerProof.status && (
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                    bid.customerProof.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                    {bid.customerProof.status}
                                </span>
                            )}
                        </div>
                        <img src={getImageUrl(bid.customerProof.imageUrl)} className="w-full max-h-64 object-contain bg-black rounded-2xl" alt="Customer Proof" />
                        {bid.customerProof.comment && (
                            <p className="text-sm text-white/80 bg-black/50 p-4 rounded-xl">{bid.customerProof.comment}</p>
                        )}
                        <p className="text-[10px] text-white/40">{new Date(bid.customerProof.submittedAt).toLocaleString()}</p>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/5 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center text-white/30 min-h-[300px]">
                        <Clock size={32} className="mb-4 text-white/20" />
                        <p className="text-[10px] font-black tracking-widest uppercase">Awaiting Customer</p>
                        <p className="text-xs font-medium text-center mt-2 max-w-[200px] opacity-60">Customer has not submitted their confirmation yet.</p>
                    </div>
                )}
            </div>

            {/* Admin Actions */}
            {bid.completionStatus !== 'approved' && bid.completionStatus !== 'rejected' && (
                <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                    <button 
                        onClick={() => handleReviewCompletion('approved')}
                        disabled={isSubmittingReview}
                        className="px-8 py-4 bg-green-500 hover:bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Approve Completion
                    </button>
                    <button 
                        onClick={() => handleReviewCompletion('rejected')}
                        disabled={isSubmittingReview}
                        className="px-8 py-4 bg-red-500 hover:bg-white text-white hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Reject
                    </button>
                </div>
            )}
            
            {(bid.completionStatus === 'approved' || bid.completionStatus === 'rejected') && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border max-w-fit ${
                    bid.completionStatus === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    Status: {bid.completionStatus}
                </div>
            )}
          </div>
        )}

        {subTab === 'chat' ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl flex flex-col h-[600px]">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Active Chat Monitoring</h4>
                  <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Authorized Admin Access Only</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Secure Uplink Active</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/20">
              {chatLoading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-[10px] font-black tracking-widest uppercase">Deciphering Transmissions...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Mail size={48} className="mb-4" />
                  <p className="text-[10px] font-black tracking-widest uppercase">No communications detected</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isPro = msg.role === 'pro';
                  return (
                    <div key={idx} className={`flex flex-col ${isPro ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-2 ${isPro ? 'text-primary' : 'text-white/40'}`}>
                        {isPro ? 'Specialist (Booster)' : 'Customer (Client)'}
                      </span>
                      <div className={`max-w-[70%] px-6 py-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        isPro ? 'bg-primary/10 text-white border border-primary/20 rounded-tr-none' 
                              : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                      }`}>
                        {msg.type === 'text' && <span>{msg.message}</span>}
                        
                        {msg.type === 'image' && msg.attachment && (
                          <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                              <img 
                                src={getImageUrl(msg.attachment.url)} 
                                className="max-w-full h-auto cursor-zoom-in hover:scale-[1.02] transition-transform duration-500" 
                                alt="Shared mission asset" 
                                onClick={() => window.open(getImageUrl(msg.attachment.url), '_blank')}
                              />
                            </div>
                            <p className="text-[10px] opacity-40 italic">{msg.message || 'Image Transmission'}</p>
                          </div>
                        )}

                        {msg.type === 'file' && msg.attachment && (
                          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 group/file cursor-pointer" onClick={() => window.open(getImageUrl(msg.attachment.url), '_blank')}>
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover/file:bg-primary/20 group-hover/file:text-primary transition-colors">
                              <ShieldCheck size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-white truncate">{msg.attachment.name}</p>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{(msg.attachment.size / 1024).toFixed(1)} KB • Mission Data</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-[8px] font-black opacity-30 text-right uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.01]">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder={`Search ${subTab}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-primary/50 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">{activeData.length} {subTab} Found</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{subTab === 'bidders' ? 'Rank' : 'Queue'}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Booster Details</th>
                    <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{subTab === 'bidders' ? 'Proposed Pay' : 'Claim Price'}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Submitted</th>
                    <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeData.map((b, idx) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-8">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-primary text-black' : 'bg-white/5 text-white'}`}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {b.user?.avatar ? (
                              <img src={getImageUrl(b.user.avatar)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User className="text-white/40" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{b.user?.name || 'Booster'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail size={10} className="text-white/20" />
                              <p className="text-[10px] font-bold text-white/30">{b.user?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-primary" />
                          <span className="text-lg font-black text-white">{formatPrice(subTab === 'bidders' ? b.amount : bid.bidPrice)}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock size={12} />
                          <p className="text-[11px] font-bold">{new Date(b.createdAt).toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleApproveAssign(b.user?._id, subTab === 'bidders' ? b.amount : bid.bidPrice)}
                          disabled={isAssigning}
                          className="px-6 py-3 bg-white/5 hover:bg-primary text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                        >
                          {isAssigning === b.user?._id && <Loader2 size={12} className="animate-spin" />}
                          Approve & Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activeData.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                  <Target size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white">No {subTab} Yet</h4>
                  <p className="text-xs text-white/40 max-w-xs mx-auto">Boosters haven't submitted any {subTab === 'bidders' ? 'competitive bids' : 'instant claims'} for this order yet.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBidDetails;
