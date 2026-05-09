import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ShoppingCart, Clock, CheckCircle2,
  AlertCircle, MessageSquare, ChevronRight,
  Search, Filter, ExternalLink, Heart, Trash2, X,
  Zap, ShieldCheck, DollarSign, Globe, Monitor,
  User, ArrowUpRight, LayoutGrid, List, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL, getImageUrl } from '../utils/api';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));

const BuyerDashboard = () => {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [ordersSubTab, setOrdersSubTab] = useState('active'); // 'active' (assigned) or 'pending' (waiting)

  const { user, checkUserLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState(user?.name || '');

  // Completion Proof (Customer)
  const [showCustomerProof, setShowCustomerProof] = useState(null); // bid object
  const [customerProofFile, setCustomerProofFile] = useState(null);
  const [customerProofPreview, setCustomerProofPreview] = useState(null);
  const [customerProofComment, setCustomerProofComment] = useState('');
  const [customerProofStatus, setCustomerProofStatus] = useState('approved'); // approved | rejected
  const [submittingCustomerProof, setSubmittingCustomerProof] = useState(false);

  const handleCustomerProofFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomerProofFile(file);
    setCustomerProofPreview(URL.createObjectURL(file));
  };

  const handleOpenCustomerProof = (e, bid) => {
    e.stopPropagation();
    setShowCustomerProof(bid);
    if (bid.customerProof) {
      setCustomerProofComment(bid.customerProof.comment || '');
      setCustomerProofStatus(bid.customerProof.status || 'approved');
      if (bid.customerProof.imageUrl) {
        setCustomerProofPreview(getImageUrl(bid.customerProof.imageUrl));
      } else {
        setCustomerProofPreview(null);
      }
    } else {
      setCustomerProofComment('');
      setCustomerProofStatus('approved');
      setCustomerProofPreview(null);
    }
    setCustomerProofFile(null);
  };

  const handleCustomerProofSubmit = async () => {
    if (customerProofStatus === 'rejected' && !customerProofFile && !customerProofPreview) {
      return alert('Please select a proof image for rejection reason');
    }
    setSubmittingCustomerProof(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (customerProofFile) formData.append('proofImage', customerProofFile);
      formData.append('comment', customerProofComment);
      formData.append('status', customerProofStatus);
      formData.append('keepExistingImage', customerProofPreview && !customerProofFile ? 'true' : 'false');
      await axios.post(`${API_URL}/api/v1/bids/${showCustomerProof._id}/customer-proof`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Confirmation proof submitted!');
      setShowCustomerProof(null);
      setCustomerProofFile(null);
      setCustomerProofPreview(null);
      setCustomerProofComment('');
      setCustomerProofStatus('approved');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmittingCustomerProof(false);
    }
  };

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);


  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/v1/auth/updatedetails`, {
        name: profileName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully');
      checkUserLoggedIn();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab');
    if (currentTab) setTab(currentTab);
  }, [location]);

  const fetchData = async () => {
    try {
      const [ordersRes, walletRes, favoritesRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/orders/me`),
        axios.get(`${API_URL}/api/v1/users/wallet`),
        axios.get(`${API_URL}/api/v1/favorites`)
      ]);
      setOrders(ordersRes.data.data);
      setTransactions(walletRes.data.data.transactions || []);
      setFavorites(favoritesRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('bidsUpdate', () => {
      fetchData();
    });

    socket.on('marketUpdate', () => {
      fetchData();
    });

    return () => {
      socket.off('bidsUpdate');
      socket.off('marketUpdate');
    };
  }, []);

  const handleRemoveFavorite = async (itemId) => {
    try {
      await axios.post(`${API_URL}/api/v1/favorites/toggle`, { itemId });
      setFavorites(favorites.filter(f => f.itemId?._id !== itemId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-white/5 text-white border-white/10';
    }
  };

  const renderOrderRow = (order) => {
    const service = order.serviceId || order.offer;
    const pro = order.assignedBid?.assignedUser;
    
    // Check if this order should be in this tab
    const isAssigned = !!pro;
    if (ordersSubTab === 'active' && !isAssigned) return null;
    if (ordersSubTab === 'pending' && isAssigned) return null;
    return (
      <div 
        key={order._id}
        onClick={() => navigate(`/order/${order._id}`)}
        className="group bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-[32px] p-6 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-center gap-6 flex-1 min-w-0 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-3 shrink-0 group-hover:bg-primary/10 transition-colors">
            <img src={getImageUrl(service?.icon || service?.image)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black  tracking-normal border ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
              <span className="text-[9px] font-bold text-white  tracking-normal">#{order._id.slice(-6).toUpperCase()}</span>
            </div>
            <h4 className="text-lg font-black text-white  tracking-tight truncate group-hover:text-white transition-colors">
              {service?.title || 'Boosting Service'}
            </h4>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-6 px-8 border-l border-white/5">
          {pro ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-white relative">
                {pro.avatar ? (
                  <img src={getImageUrl(pro.avatar)} className="w-full h-full object-cover rounded-full" alt="" />
                ) : (
                  <User className="w-6 h-6" />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-white  tracking-normal">Mission Specialist</p>
                <p className="text-sm font-black text-white  truncate">{pro.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Search className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white  tracking-normal">Status</p>
                <p className="text-sm font-black text-white ">Auction Live</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[9px] font-black text-white  tracking-normal">Investment</p>
            <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.amount || order.price)}</p>
          </div>

          <div className="flex items-center gap-3">
            {(order.assignedBid?.completionStatus === 'pro_submitted' || order.assignedBid?.completionStatus === 'customer_submitted') && (
              <button 
                onClick={(e) => handleOpenCustomerProof(e, order.assignedBid)}
                className="px-4 py-2 bg-green-500/10 hover:bg-green-500 border border-green-500/20 text-green-400 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {order.assignedBid?.completionStatus === 'customer_submitted' ? 'Update Review' : 'Review & Confirm'}
              </button>
            )}
            {order.assignedBid?.completionStatus && order.assignedBid.completionStatus !== 'none' && order.assignedBid.completionStatus !== 'pro_submitted' && (
              <button 
                onClick={(e) => {
                  if (order.assignedBid?.completionStatus === 'customer_submitted') {
                    handleOpenCustomerProof(e, order.assignedBid);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                  order.assignedBid.completionStatus === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  order.assignedBid.completionStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  order.assignedBid.customerProof?.status === 'rejected' ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border-red-500/20' :
                  'bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border-yellow-500/20'
              }`}>
                {order.assignedBid.completionStatus === 'customer_submitted' ? 
                  (order.assignedBid.customerProof?.status === 'rejected' ? '❌ You Rejected (Under Review)' : '⏳ You Approved (Under Review)') :
                 order.assignedBid.completionStatus === 'approved' ? '✅ Approved by Admin' : '❌ Rejected by Admin'}
              </button>
            )}
            {pro && (
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/pro/chat/${order._id}`); }}
                className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            )}
            <ChevronRight className="w-5 h-5 text-white group-hover:text-primary transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order) => {
    const service = order.serviceId || order.offer;
    const pro = order.assignedBid?.assignedUser;

    // Check if this order should be in this tab
    const isAssigned = !!pro;
    if (ordersSubTab === 'active' && !isAssigned) return null;
    if (ordersSubTab === 'pending' && isAssigned) return null;
    
    return (
      <div 
        key={order._id}
        onClick={() => navigate(`/order/${order._id}`)}
        className="group bg-[#0A0A0A] border border-white/5 hover:border-primary/30 rounded-[40px] overflow-hidden transition-all flex flex-col cursor-pointer relative"
      >
        <div className="relative h-48 overflow-hidden bg-white/5">
            <img src={getImageUrl(service?.backgroundImage || service?.image)} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-transform duration-1000 group-hover:scale-110" alt="" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
                <img src={getImageUrl(service?.icon || service?.image)} className="max-h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" alt="" />
            </div>
            <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black  tracking-normal border ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
            </div>
        </div>

        <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div>
                <p className="text-[10px] font-black  text-white tracking-normal mb-1">{service?.game}</p>
                <h4 className="text-xl font-black text-white  tracking-tight group-hover:text-white transition-colors line-clamp-1">{service?.title}</h4>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white  tracking-normal">Investment</span>
                    <span className="text-xl font-black text-white tracking-tighter">{formatPrice(order.amount || order.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {(order.assignedBid?.completionStatus === 'pro_submitted' || order.assignedBid?.completionStatus === 'customer_submitted') && (
                      <button 
                        onClick={(e) => handleOpenCustomerProof(e, order.assignedBid)}
                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500 border border-green-500/20 text-green-400 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        {order.assignedBid?.completionStatus === 'customer_submitted' ? 'Update' : 'Review'}
                      </button>
                    )}
                    {pro && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/pro/chat/${order._id}`); }}
                            className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </div>

                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Inventory Vault">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-black  tracking-tighter">
                {tab === 'orders' && 'Recent Orders'}
                {tab === 'wallet' && 'Cashback Vault'}
                {tab === 'favorites' && 'Watchlist'}
                {tab === 'profile' && 'Security Settings'}
              </h2>
            </div>
        </div>

        <div className="min-h-[400px]">
          {tab === 'orders' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Active Deployments', value: orders.filter(o => o.status === 'processing').length, icon: Clock, color: 'text-primary' },
                  { label: 'Missions Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500' },
                  { label: 'Platform Credit', value: formatPrice(user?.walletBalance || 0), icon: DollarSign, color: 'text-white' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black  tracking-normal text-white">{stat.label}</p>
                      <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setOrdersSubTab('active')} 
                      className={`px-8 py-3 rounded-xl text-[10px] font-black  tracking-normal transition-all ${ordersSubTab === 'active' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                    >
                      Active Missions
                    </button>
                    <button 
                      onClick={() => setOrdersSubTab('pending')} 
                      className={`px-8 py-3 rounded-xl text-[10px] font-black  tracking-normal transition-all ${ordersSubTab === 'pending' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                    >
                      Live Auctions
                    </button>
                  </div>
                  <div className="flex items-center gap-2 hidden md:flex">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-white  tracking-normal uppercase">Command Link Stable</span>
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-white font-black animate-pulse">Synchronizing Data...</div>
                ) : orders.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[48px] text-center space-y-6">
                    <ShoppingCart className="w-12 h-12 text-white" />
                    <h4 className="text-xl font-black  text-white">Your vault is empty</h4>
                    <button onClick={() => navigate('/products')} className="px-8 py-3 bg-primary text-black rounded-full font-black text-[10px] ">Browse Services</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => renderOrderRow(order))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'wallet' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-primary/20 to-black border border-primary/30 rounded-[48px] p-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
                  <div className="space-y-6 relative z-10">
                    <p className="text-[11px] font-black  tracking-normal text-white">CASHBACK BALANCE</p>
                    <h2 className="text-6xl font-black text-white tracking-tighter">
                      {formatPrice(user?.walletBalance || 0)}
                    </h2>
                    <p className="text-sm font-medium text-white leading-relaxed max-w-sm">
                      Use your platform credit for future deployments. 5% cashback earned on every successful mission completion.
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 flex flex-col justify-between">
                   <div className="space-y-2">
                      <p className="text-[11px] font-black  tracking-normal text-white">TOTAL INVESTED</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter">
                        {formatPrice(orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.amount : 0), 0))}
                      </h3>
                   </div>
                   <div className="pt-8 border-t border-white/5 mt-8 flex items-center justify-between">
                      <span className="text-[10px] font-black text-white  tracking-normal">Loyalty Status</span>
                      <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-white  tracking-normal">Elite Member</span>
                   </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
                <div className="p-8 border-b border-white/5">
                  <h3 className="text-sm font-black  tracking-normal text-white">Transaction Audit Log</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <p className="p-12 text-center text-white font-black  tracking-normal">No activity logged</p>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx._id} className="flex items-center justify-between p-8 hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-white border-red-500/20'}`}>
                            {tx.type === 'credit' ? <ArrowUpRight className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-black  text-white">{tx.description}</p>
                            <p className="text-[10px] font-bold text-white  tracking-normal mt-1">{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        </div>
                        <p className={`text-xl font-black tracking-tighter ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                          {tx.type === 'credit' ? '+' : '-'} {formatPrice(tx.amount)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'favorites' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black  text-white tracking-tight">Deployment Watchlist</h3>
                <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black  text-white tracking-normal">{favorites.length} Items Detected</span>
              </div>

              {favorites.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/5 rounded-[48px] text-center">
                  <Heart className="w-16 h-16 text-white mb-6" />
                  <p className="text-white font-black  tracking-normal">Watchlist is currently empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {favorites.map((fav) => {
                    const item = fav.itemId;
                    if (!item) return null;
                    const title = item.title || item.name || `${item.currencyType} Gold`;
                    const price = item.price || item.basePrice || (item.pricing && item.pricing.basePrice);
                    
                    return (
                      <div key={fav._id} className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden group hover:border-primary/40 transition-all flex flex-col relative">
                        <div className="relative h-48 overflow-hidden bg-white/5">
                           <img src={getImageUrl(item.backgroundImage || item.image)} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-transform duration-700 group-hover:scale-110" alt="" />
                           <div className="absolute top-6 right-6">
                              <button onClick={() => handleRemoveFavorite(item._id)} className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                           <div className="absolute bottom-6 left-6">
                              <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-black text-white  tracking-normal">
                                {fav.itemType}
                              </span>
                           </div>
                        </div>
                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                           <h4 className="text-lg font-black  text-white truncate">{title}</h4>
                           <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white  tracking-normal">Value</span>
                                <span className="text-xl font-black text-white">{formatPrice(price || 0)}</span>
                              </div>
                              <button onClick={() => navigate(`/products/${item.slug || item._id}`)} className="px-6 py-3 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary rounded-2xl text-[10px] font-black  tracking-normal transition-all">
                                Deploy
                              </button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-[56px] p-12 space-y-12 shadow-2xl">
                <div className="flex items-center gap-10">
                  <div className="w-28 h-28 rounded-[40px] bg-primary/10 border-2 border-primary/30 flex items-center justify-center relative group overflow-hidden">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-4xl font-black text-white ">{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black  text-white tracking-tight">{user?.name}</h3>
                    <p className="text-[11px] font-bold text-white  tracking-normal mt-1">{user?.email}</p>
                    <div className="mt-4 flex items-center gap-3">
                       <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[9px] font-black text-white  tracking-normal">Elite Member</span>
                       <span className="text-white">•</span>
                       <span className="text-[9px] font-black text-white  tracking-normal">Secure Profile</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black  text-white ml-2">Alias</label>
                      <input type="text" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all" />
                   </div>
                   <div className="space-y-2 opacity-50">
                      <label className="text-[10px] font-black  text-white ml-2">Email</label>
                      <input type="email" value={user?.email} disabled className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-white cursor-not-allowed" />
                   </div>
                </div>

                <button className="w-full py-6 bg-white text-black rounded-[28px] font-black text-xs  tracking-normal hover:bg-primary transition-all flex items-center justify-center gap-3">
                  Update Profile <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Customer Proof Modal ── */}
      {showCustomerProof && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => { setShowCustomerProof(null); setCustomerProofFile(null); setCustomerProofPreview(null); setCustomerProofComment(''); }} />
          <div className="relative w-full max-w-[560px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 shadow-2xl space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Mission Review</h3>
              </div>
              <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase ml-1">
                Upload your confirmation to finalize payment.
              </p>
            </div>

            {/* Proof View from Pro */}
            {showCustomerProof.completionProof && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                <p className="text-[10px] font-black text-white tracking-widest uppercase">Specialist's Proof</p>
                {showCustomerProof.completionProof.imageUrl && (
                  <img src={getImageUrl(showCustomerProof.completionProof.imageUrl)} className="w-full max-h-48 object-contain rounded-xl bg-black" alt="Pro Proof" />
                )}
                {showCustomerProof.completionProof.comment && (
                  <p className="text-sm text-white/80 bg-black/50 p-4 rounded-xl">{showCustomerProof.completionProof.comment}</p>
                )}
              </div>
            )}

            {/* Approval Decision */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCustomerProofStatus('approved')}
                className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                  customerProofStatus === 'approved' 
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400' 
                    : 'bg-white/5 border-2 border-transparent text-white/40 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button 
                onClick={() => setCustomerProofStatus('rejected')}
                className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                  customerProofStatus === 'rejected' 
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400' 
                    : 'bg-white/5 border-2 border-transparent text-white/40 hover:bg-white/10'
                }`}
              >
                <X size={16} /> Reject
              </button>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white ml-2 tracking-normal">
                Your Proof Screenshot {customerProofStatus === 'rejected' ? '*' : '(Optional)'}
              </label>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-primary/40 transition-all bg-white/[0.02] hover:bg-primary/5 group">
                  {customerProofPreview ? (
                    <img src={customerProofPreview} className="h-full w-full object-contain rounded-3xl p-2" alt="proof preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/60 transition-colors">
                      <CheckCircle2 size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Upload Confirmation</p>
                      <p className="text-[9px] font-bold">PNG, JPG, MP4 up to 50MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCustomerProofFileChange} />
                </label>
                {customerProofPreview && (
                  <button
                    onClick={() => { setCustomerProofFile(null); setCustomerProofPreview(null); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {customerProofFile && (
                <p className="text-[9px] font-bold text-primary ml-2">✓ {customerProofFile.name}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white ml-2 tracking-normal">Comment (optional)</label>
              <textarea
                value={customerProofComment}
                onChange={(e) => setCustomerProofComment(e.target.value)}
                placeholder="Leave a message about the delivery..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none focus:border-primary/40 transition-all min-h-[100px] resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => { setShowCustomerProof(null); setCustomerProofFile(null); setCustomerProofPreview(null); setCustomerProofComment(''); setCustomerProofStatus('approved'); }}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-[30px] text-[10px] font-black tracking-normal text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomerProofSubmit}
                disabled={submittingCustomerProof || (customerProofStatus === 'rejected' && !customerProofFile && !customerProofPreview)}
                className={`flex-1 py-5 hover:bg-white text-black rounded-[30px] text-[10px] font-black tracking-normal transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 ${
                  customerProofStatus === 'rejected' ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'
                }`}
              >
                {submittingCustomerProof ? <Loader2 className="w-4 h-4 animate-spin" /> : (customerProofStatus === 'rejected' ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />)}
                {submittingCustomerProof ? 'Submitting...' : `Submit ${customerProofStatus === 'rejected' ? 'Rejection' : 'Confirmation'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;


