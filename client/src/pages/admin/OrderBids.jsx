import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { X, User, Star, Clock, Award, ShieldCheck, Loader2, Eye, ArrowLeft } from 'lucide-react';

const OrderBids = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBidTab, setActiveBidTab] = useState('bidders');
  const [selectedProDetail, setSelectedProDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchBids();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/bids/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept bid');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const filteredBids = bids
    .filter(b => activeBidTab === 'bidders' ? b.type === 'bid' : b.type === 'claim')
    .sort((a, b) => b.bidAmount - a.bidAmount);

  const handleTabChange = (tab) => {
    setActiveBidTab(tab);
    setSelectedProDetail(null);
  };

  const getTimeOnPlatform = (createdAt) => {
    if (!createdAt) return 'New Recruit';
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} Days`;
    if (diffDays < 365) return `${(diffDays / 30).toFixed(1)} Months`;
    return `${(diffDays / 365).toFixed(1)} Years`;
  };



  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          <button 
            onClick={() => setShowServiceModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-primary hover:bg-primary/10 transition-all tracking-widest"
          >
            <Award className="w-4 h-4" />
            Service Briefing
          </button>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-[64px] p-8 lg:p-16 w-full min-h-[80vh] shadow-2xl flex flex-col relative">
          <div className="flex flex-col h-full min-h-[500px]">
            <div className="mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
                Deployment Nexus
                <span className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
              </h2>
              
              <div className="flex p-2 bg-white/5 rounded-3xl border border-white/10 w-fit">
                <button 
                  onClick={() => handleTabChange('bidders')}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeBidTab === 'bidders' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                >
                  Negotiators ({bids.filter(b => b.type === 'bid').length})
                </button>
                <button 
                  onClick={() => handleTabChange('claimers')}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeBidTab === 'claimers' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                >
                  Direct Claims ({bids.filter(b => b.type === 'claim').length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBids.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-white/20 font-black uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-[48px] py-32 space-y-6">
                   <ShieldCheck className="w-12 h-12 opacity-10" />
                   <p>No active data sequences in this sector</p>
                </div>
              ) : (
                filteredBids.map((bid) => (
                  <div 
                    key={bid._id} 
                    onClick={() => setSelectedProDetail(bid)}
                    className="bg-[#0D0D0D] border border-white/5 rounded-[48px] p-10 flex flex-col items-center text-center group hover:border-primary/40 hover:bg-[#111] transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Price Badge */}
                    <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
                       <p className="text-xl font-black text-primary">{formatPrice(bid.bidAmount)}</p>
                    </div>

                    <div className="w-24 h-24 rounded-[36px] bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500 relative">
                      {bid.proId?.avatar ? (
                        <img src={bid.proId.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <User className="w-10 h-10 text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{bid.proId?.name}</h4>
                    <div className="flex items-center gap-2 justify-center mb-10 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{bid.proId?.rating || 5.0} Rating</span>
                    </div>

                    <div className="w-full pt-6 border-t border-white/5">
                       <button className="w-full py-4 rounded-2xl bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:bg-primary group-hover:text-black transition-all flex items-center justify-center gap-2">
                          Analyze Profile <Eye className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SERVICE BRIEFING MODAL */}
        {showServiceModal && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 md:p-12">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setShowServiceModal(false)} />
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[64px] w-full max-w-4xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
               <div className="relative h-64 overflow-hidden">
                  {order.serviceId?.gameId?.bgImage ? (
                     <img src={order.serviceId.gameId.bgImage} className="w-full h-full object-cover opacity-30" />
                  ) : (
                     <div className="w-full h-full bg-primary/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                  <div className="absolute bottom-10 left-12 flex items-end gap-8">
                     <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                        {order.serviceId?.gameId?.icon ? (
                           <img src={order.serviceId.gameId.icon} className="w-full h-full object-cover" />
                        ) : (
                           <Award className="w-10 h-10 text-primary" />
                        )}
                     </div>
                     <div className="mb-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">{order.serviceId?.gameId?.name || 'Tactical Sector'}</p>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{order.serviceId?.title}</h3>
                     </div>
                  </div>
                  <button onClick={() => setShowServiceModal(false)} className="absolute top-10 right-10 p-4 bg-black/50 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                     <X className="w-6 h-6 text-white/40" />
                  </button>
               </div>

               <div className="p-12 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-10">
                     <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Operation Parameters</p>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white/40 uppercase">Initial Funding</span>
                              <span className="text-lg font-black text-white">{formatPrice(order.price)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white/40 uppercase">Platform</span>
                              <span className="text-[10px] font-black text-primary uppercase">{order.platform}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white/40 uppercase">Region</span>
                              <span className="text-[10px] font-black text-primary uppercase">{order.region}</span>
                           </div>
                        </div>
                     </div>

                     {order.selectedOptions && Object.keys(order.selectedOptions).length > 0 && (
                        <div>
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Tactical Options</p>
                           <div className="flex flex-wrap gap-2">
                              {Object.entries(order.selectedOptions).map(([key, val]) => (
                                 <span key={key} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-white/60 uppercase">
                                    {key}: <span className="text-white">{val}</span>
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="space-y-10">
                     <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Customer Briefing</p>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[32px] p-6">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <User className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-white uppercase">{order.userId?.name}</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase">Deployment Requester</p>
                           </div>
                        </div>
                     </div>

                     <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Contact Protocol</p>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                           <p className="text-sm font-bold text-white/60 italic leading-relaxed">
                              "{order.contactInfo || 'No additional instructions provided by the requester.'}"
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* PRO DETAIL MODAL (Existing) */}
        {selectedProDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
              onClick={() => setSelectedProDetail(null)}
            />
            
            <div className="bg-[#0D0D0D] border border-white/10 rounded-[64px] w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedProDetail(null)}
                className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all z-10"
              >
                <X className="w-6 h-6 text-white/40" />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12 md:p-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                  {/* Pro Profile Side */}
                  <div className="md:col-span-5 flex flex-col items-center text-center">
                    <div className="w-48 h-48 rounded-[56px] bg-primary/20 border-4 border-primary/10 flex items-center justify-center mb-8 overflow-hidden shadow-[0_0_80px_rgba(162,230,62,0.15)]">
                      {selectedProDetail.proId?.avatar ? (
                        <img src={selectedProDetail.proId.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <User className="w-24 h-24 text-primary" />
                      )}
                    </div>
                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">{selectedProDetail.proId?.name}</h3>
                    <p className="text-[12px] font-black text-primary uppercase tracking-[0.4em] italic">Special Operations Pro</p>
                    
                    <div className="w-full h-[1px] bg-white/5 my-10" />

                    <div className="grid grid-cols-1 w-full gap-4">
                      <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 flex flex-col items-center">
                        <Clock className="w-6 h-6 text-primary mb-4" />
                        <p className="text-[10px] font-black text-white/20 uppercase mb-2">Time on Platform</p>
                        <p className="text-xl font-black text-white">{getTimeOnPlatform(selectedProDetail.proId?.createdAt)}</p>
                      </div>
                      <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 flex flex-col items-center">
                        <Award className="w-6 h-6 text-primary mb-4" />
                        <p className="text-[10px] font-black text-white/20 uppercase mb-2">Missions Done</p>
                        <p className="text-xl font-black text-white">{selectedProDetail.proId?.missionDone || 0} Completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Tactical Intel Side */}
                  <div className="md:col-span-7 space-y-12">
                    <div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" /> Operation Specializations
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {selectedProDetail.proId?.specializedGames?.length > 0 ? (
                          selectedProDetail.proId.specializedGames.map(game => (
                            <span key={game._id} className="px-6 py-3 bg-white/5 text-white text-[10px] font-black uppercase rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                              {game.title} Master
                            </span>
                          ))
                        ) : (
                          <p className="text-[10px] font-bold text-white/20 uppercase italic">No specialized sectors registered</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[11px] font-black uppercase text-white/20 tracking-widest ml-4">Candidate Tactical Statement</p>
                      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 text-lg font-bold text-white/80 leading-relaxed italic relative">
                        <span className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif">"</span>
                        {selectedProDetail.message || 'Ready for deployment. High efficiency guaranteed.'}
                        <span className="absolute -bottom-8 -right-2 text-6xl text-primary/10 font-serif">"</span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="flex items-center justify-between p-8 bg-primary/5 border border-primary/20 rounded-[40px] mb-8">
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase mb-1">Deployment Budget</p>
                          <p className="text-3xl font-black text-white">{formatPrice(selectedProDetail.bidAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white/20 uppercase mb-1">Platform Rating</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xl font-black text-white">{selectedProDetail.proId?.rating || 5.0}</span>
                             <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleAcceptBid(selectedProDetail._id)}
                        className="w-full py-8 bg-primary text-black rounded-[40px] font-black text-sm uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 group active:scale-95"
                      >
                        {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                        Deploy Operator to Operation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderBids;
