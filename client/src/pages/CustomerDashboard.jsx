import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ShoppingCart, Clock, CheckCircle2,
  AlertCircle, MessageSquare, ChevronRight,
  Search, Filter, ExternalLink, Heart, Trash2,
  Zap, ShieldCheck, DollarSign, Globe, Monitor,
  User, ArrowUpRight, LayoutGrid, List
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL, getImageUrl } from '../utils/api';

const BuyerDashboard = () => {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();

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
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const renderOrderRow = (order) => {
    const service = order.serviceId || order.offer;
    const pro = order.pro;
    
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
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
              {service?.title || 'Boosting Service'}
            </h4>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-6 px-8 border-l border-white/5">
          {pro ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
                <User className="w-6 h-6" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Specialist</p>
                <p className="text-sm font-black text-white uppercase truncate">{pro.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Search className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</p>
                <p className="text-sm font-black text-white/40 uppercase">Awaiting Pro</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Investment</p>
            <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.amount || order.price)}</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/pro/chat/${order._id}`); }}
              className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order) => {
    const service = order.serviceId || order.offer;
    const pro = order.pro;
    
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
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
            </div>
        </div>

        <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1">{service?.game}</p>
                <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{service?.title}</h4>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Investment</span>
                    <span className="text-xl font-black text-white tracking-tighter">{formatPrice(order.amount || order.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/pro/chat/${order._id}`); }}
                        className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black transition-all">
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
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#0A0A0A] border border-white/5 rounded-[24px] w-full lg:w-fit">
              {[
                { id: 'orders', label: 'Recent Orders', icon: ShoppingCart },
                { id: 'wallet', label: 'Cashback Vault', icon: DollarSign },
                { id: 'favorites', label: 'Watchlist', icon: Heart },
                { id: 'profile', label: 'Security Settings', icon: User }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/dashboard?tab=${t.id}`)}
                  className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
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
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
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
                  <h3 className="text-xl font-black uppercase text-white tracking-tight">Active Operation Registry</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Live Updates Enabled</span>
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-white/20 font-black animate-pulse">Synchronizing Data...</div>
                ) : orders.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[48px] text-center space-y-6">
                    <ShoppingCart className="w-12 h-12 text-white/10" />
                    <h4 className="text-xl font-black uppercase text-white/40">Your vault is empty</h4>
                    <button onClick={() => navigate('/products')} className="px-8 py-3 bg-primary text-black rounded-full font-black text-[10px] uppercase">Browse Services</button>
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
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">CASHBACK BALANCE</p>
                    <h2 className="text-6xl font-black text-white tracking-tighter">
                      {formatPrice(user?.walletBalance || 0)}
                    </h2>
                    <p className="text-sm font-medium text-white/40 leading-relaxed max-w-sm">
                      Use your platform credit for future deployments. 5% cashback earned on every successful mission completion.
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 flex flex-col justify-between">
                   <div className="space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">TOTAL INVESTED</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter">
                        {formatPrice(orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.amount : 0), 0))}
                      </h3>
                   </div>
                   <div className="pt-8 border-t border-white/5 mt-8 flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Loyalty Status</span>
                      <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">Elite Member</span>
                   </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
                <div className="p-8 border-b border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Transaction Audit Log</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <p className="p-12 text-center text-white/20 font-black uppercase tracking-widest">No activity logged</p>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx._id} className="flex items-center justify-between p-8 hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {tx.type === 'credit' ? <ArrowUpRight className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase text-white/80">{tx.description}</p>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        </div>
                        <p className={`text-xl font-black tracking-tighter ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
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
                <h3 className="text-xl font-black uppercase text-white tracking-tight">Deployment Watchlist</h3>
                <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase text-white/20 tracking-widest">{favorites.length} Items Detected</span>
              </div>

              {favorites.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/5 rounded-[48px] text-center">
                  <Heart className="w-16 h-16 text-white/5 mb-6" />
                  <p className="text-white/20 font-black uppercase tracking-widest">Watchlist is currently empty</p>
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
                              <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                                {fav.itemType}
                              </span>
                           </div>
                        </div>
                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                           <h4 className="text-lg font-black uppercase text-white truncate">{title}</h4>
                           <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Value</span>
                                <span className="text-xl font-black text-white">{formatPrice(price || 0)}</span>
                              </div>
                              <button onClick={() => navigate(`/products/${item.slug || item._id}`)} className="px-6 py-3 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
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
                      <span className="text-4xl font-black text-primary uppercase">{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase text-white tracking-tight">{user?.name}</h3>
                    <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1">{user?.email}</p>
                    <div className="mt-4 flex items-center gap-3">
                       <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">Elite Member</span>
                       <span className="text-white/10">•</span>
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Secure Profile</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-2">Alias</label>
                      <input type="text" defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all" />
                   </div>
                   <div className="space-y-2 opacity-50">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-2">Email</label>
                      <input type="email" value={user?.email} disabled className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-white/40 cursor-not-allowed" />
                   </div>
                </div>

                <button className="w-full py-6 bg-white text-black rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3">
                  Update Profile <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
