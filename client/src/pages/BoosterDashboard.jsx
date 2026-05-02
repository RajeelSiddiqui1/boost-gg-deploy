import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Zap, Clock, CheckCircle2,
  MessageSquare, ChevronRight,
  Gamepad2, Info, Check, X,
  DollarSign, TrendingUp, AlertCircle,
  Monitor,Globe,
  BarChart3, Wallet, ShieldCheck,
  ArrowUpRight, Image as ImageIcon,
  Plus, Upload, Trash2, Edit3, Share2, Video, FileText,
  LayoutGrid, List, User, ExternalLink
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

const PayoutModal = ({ isOpen, onClose, balance, onRefresh }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { formatPrice } = useCurrency();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) < 1000) return toast.error(`Minimum payout is ${formatPrice(1000)}`);
    if (Number(amount) > balance) return toast.error('Insufficient balance');

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/payouts/request`, {
        amount: Number(amount),
        method,
        accountDetails: { details }
      });
      toast.success('Payout request submitted successfully');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-[500px] bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full"></div>

        <h3 className="text-2xl font-black uppercase text-white mb-2 relative z-10">Request Payout</h3>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-8 relative z-10">Select your preferred withdrawal method</p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/30 ml-2">Amount (Min {formatPrice(1000)})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/30 ml-2">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white appearance-none"
            >
              <option value="bank">Bank Transfer</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="binance">Binance (USDT)</option>
              <option value="wise">Wise</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/30 ml-2">Account Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter account number, title, bank name or wallet address..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white min-h-[100px]"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50">
              {loading ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProDashboard = () => {
  const { user, checkUserLoggedIn } = useAuth();
  const navigate = useNavigate();

  const isCommercePro = useMemo(() => ['booster', 'gold_seller', 'account_seller'].includes(user?.proType), [user]);
  const isContentPro = useMemo(() => ['content_creator', 'blogger'].includes(user?.proType), [user]);
  const isPartnerPro = useMemo(() => user?.proType === 'influencer_partner', [user]);

  const [tab, setTab] = useState('work');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (isCommercePro) setTab('work');
    else if (isContentPro) setTab('assignments');
    else if (isPartnerPro) setTab('referrals');
  }, [isCommercePro, isContentPro, isPartnerPro]);

  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  
  const [showProofUpload, setShowProofUpload] = useState(null);
  const [tempProofs, setTempProofs] = useState([]);
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [availableRes, myOrdersRes, payoutRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/orders/available`),
        axios.get(`${API_URL}/api/v1/orders/booster`),
        axios.get(`${API_URL}/api/v1/payouts/me`)
      ]);
      setAvailableOrders(availableRes.data.data);
      setActiveOrders(myOrdersRes.data.data.filter(o => o.status === 'processing' || o.status === 'pending'));
      setPayouts(payoutRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (id) => {
    setClaimingId(id);
    try {
      await axios.put(`${API_URL}/api/v1/orders/${id}/claim`);
      toast.success('Assignment accepted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim order');
    } finally {
      setClaimingId(null);
    }
  };

  const handleCompleteSubmit = async (orderId) => {
    if (tempProofs.length === 0) return toast.error('Please upload at least one proof screenshot');

    setCompletingId(orderId);
    try {
      await axios.put(`${API_URL}/api/v1/orders/${orderId}/complete`, {
        proofs: tempProofs
      });
      toast.success('Mission report submitted!');
      setShowProofUpload(null);
      setTempProofs([]);
      fetchData();
      checkUserLoggedIn();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setCompletingId(null);
    }
  };

  const stats = useMemo(() => {
    if (isCommercePro) {
      return [
        { label: 'Market Jobs', value: availableOrders.length, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Active Work', value: activeOrders.length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
        { label: 'Total Earnings', value: formatPrice(user?.earnings || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/5' },
        { label: 'Trust Rating', value: `${user?.rating || 0}/5`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/5' }
      ];
    }
    return [];
  }, [availableOrders, activeOrders, user, isCommercePro, formatPrice]);

  const renderOrderRow = (order, isStatusActive = false) => {
    const service = order.serviceId;
    return (
      <div 
        key={order._id}
        className="group bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-[32px] p-6 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-center gap-6 flex-1 min-w-0 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-3 shrink-0 group-hover:bg-primary/10 transition-colors">
            <img src={getImageUrl(service?.icon || service?.image)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase text-primary tracking-widest px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
                {service?.game || 'Any Game'}
              </span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
              {service?.title}
            </h4>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4 flex-1">
          <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[10px] font-black text-white/40 uppercase">{order.platform || 'PC'}</span>
          </div>
          <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[10px] font-black text-white/40 uppercase">{order.region || 'GLB'}</span>
          </div>
        </div>

        {isStatusActive && (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/pro/chat/${order._id}`)}
              className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all group/chat relative"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A0A0A] animate-pulse"></span>
            </button>
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Assigned To</p>
              <div className="flex items-center gap-2 justify-end mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold text-white uppercase">{order.userId?.name?.split(' ')[0] || 'Customer'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Revenue</p>
            <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.boosterEarnings || order.price)}</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/pro/order/${order._id}`)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            {!isStatusActive ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleClaim(order._id); }}
                disabled={claimingId === order._id}
                className="px-8 py-4 bg-primary hover:bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                {claimingId === order._id ? 'Securing...' : 'Claim Job'}
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowProofUpload(order._id); }}
                className="px-8 py-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black border border-green-500/20 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order, isStatusActive = false) => {
    const service = order.serviceId;
    return (
      <div 
        key={order._id} 
        className="group bg-[#111111] border border-white/5 rounded-[40px] overflow-hidden hover:border-primary/40 transition-all flex flex-col relative"
      >
        <div className="relative h-56 overflow-hidden">
          {service?.backgroundImage ? (
            <img src={getImageUrl(service.backgroundImage)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" alt="" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <img src={getImageUrl(service?.icon || service?.image)} className="h-32 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" alt="" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>
        </div>

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{service?.game}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/pro/order/${order._id}`)} className="text-white/20 hover:text-white"><ExternalLink size={14} /></button>
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-6 leading-tight truncate">{service?.title}</h3>
          
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Payout</span>
              <span className="text-2xl font-black text-white">{formatPrice(order.boosterEarnings || order.price)}</span>
            </div>
            
            {!isStatusActive ? (
              <button
                onClick={() => handleClaim(order._id)}
                disabled={claimingId === order._id}
                className="px-6 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase transition-all"
              >
                {claimingId === order._id ? '...' : 'Claim'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                    onClick={() => navigate(`/pro/chat/${order._id}`)}
                    className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"
                >
                    <MessageSquare size={18} className="text-primary" />
                </button>
                <button
                    onClick={() => setShowProofUpload(order._id)}
                    className="px-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl font-black text-[10px] uppercase"
                >
                    Finish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Control Center">
      <div className="relative isolate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-2xl rounded-full group-hover:scale-150 transition-transform`}></div>
              <div className="relative z-10 space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black ">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#0A0A0A] border border-white/5 rounded-[24px] w-full lg:w-fit">
              {[
                { id: 'work', label: 'Marketplace', icon: Zap },
                { id: 'active', label: 'Active Tasks', icon: Clock },
                { id: 'earnings', label: 'Financials', icon: Wallet }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                  {t.id === 'work' && availableOrders.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1"></span>}
                </button>
              ))}
            </div>

            {(tab === 'work' || tab === 'active') && (
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 self-end lg:self-auto">
                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}><List size={18} /></button>
              </div>
            )}
          </div>

          <div className="min-h-[400px]">
            {tab === 'work' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Available Assignments</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Real-time Sync Active</p>
                </div>

                {availableOrders.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[40px] text-center space-y-6">
                    <AlertCircle className="w-12 h-12 text-white/10" />
                    <h4 className="text-xl font-black uppercase text-white/40">Market is quiet</h4>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-4"}>
                    {availableOrders.map(o => viewMode === 'grid' ? renderOrderCard(o) : renderOrderRow(o))}
                  </div>
                )}
              </div>
            )}

            {tab === 'active' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black uppercase tracking-tight">Your Registry</h3>
                {activeOrders.length === 0 ? (
                  <div className="py-24 text-center text-white/20 font-black uppercase tracking-widest border border-white/5 rounded-[40px]">No active missions.</div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-4"}>
                    {activeOrders.map(o => viewMode === 'grid' ? renderOrderCard(o, true) : renderOrderRow(o, true))}
                  </div>
                )}
              </div>
            )}

            {tab === 'earnings' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Financial Overview</h3>
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div>
                          <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Available Balance</p>
                          <h2 className="text-5xl font-black text-white flex items-center gap-4">{formatPrice(user?.earnings || 0)} <ArrowUpRight className="text-primary" /></h2>
                        </div>
                        <div className="flex items-end"><button onClick={() => setIsPayoutModalOpen(true)} className="w-full bg-primary text-black py-6 rounded-3xl font-black text-xs uppercase hover:bg-white transition-all">Request Payout</button></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center gap-4"><ShieldCheck className="text-green-500" /> <span className="text-[11px] font-black uppercase">Reliability Score: 98%</span></div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">Based on completion speed and feedback.</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead><tr className="bg-white/[0.01]"><th className="px-10 py-5 text-[10px] font-black uppercase text-white/20">Date</th><th className="px-10 py-5 text-[10px] font-black uppercase text-white/20">Amount</th><th className="px-10 py-5 text-[10px] font-black uppercase text-white/20 text-right">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {payouts.map(p => (
                        <tr key={p._id} className="hover:bg-white/[0.01]">
                          <td className="px-10 py-6 text-xs font-bold text-white/60">{new Date(p.requestedAt).toLocaleDateString()}</td>
                          <td className="px-10 py-6 text-sm font-black text-white">{formatPrice(p.amount)}</td>
                          <td className="px-10 py-6 text-right"><span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {showProofUpload && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowProofUpload(null)}></div>
            <div className="relative w-full max-w-[600px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 overflow-hidden shadow-2xl">
              <h3 className="text-3xl font-black uppercase text-white mb-10">Proof of Completion</h3>
              <div className="space-y-6">
                <input type="text" id="pLink" placeholder="Screenshot Link..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white outline-none" />
                <button onClick={() => { const val = document.getElementById('pLink').value; if(val){ setTempProofs([...tempProofs, val]); document.getElementById('pLink').value = ''; } }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase">Add Proof</button>
                <div className="grid grid-cols-2 gap-4">
                  {tempProofs.map((p, i) => <img key={i} src={p} className="aspect-video rounded-xl object-cover border border-white/10" alt="" />)}
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowProofUpload(null)} className="flex-1 py-5 bg-white/5 rounded-3xl text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={() => handleCompleteSubmit(showProofUpload)} className="flex-1 py-5 bg-primary text-black rounded-3xl text-[10px] font-black uppercase">Submit Report</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PayoutModal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} balance={user?.earnings || 0} onRefresh={() => { fetchData(); checkUserLoggedIn(); }} />
    </DashboardLayout>
  );
};

export default ProDashboard;
