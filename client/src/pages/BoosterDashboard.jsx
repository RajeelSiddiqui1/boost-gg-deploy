import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Zap, Clock, CheckCircle2,
  MessageSquare, ChevronRight,
  Gamepad2, Info, Check, X,
  Loader2,
  DollarSign, TrendingUp, AlertCircle,
  Monitor,Globe,
  BarChart3, Wallet, ShieldCheck,
  ArrowUpRight, Image as ImageIcon,
  Plus, Upload, Trash2, Edit3, Share2, Video, FileText,
  LayoutGrid, List, User, ExternalLink
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));
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

        <h3 className="text-2xl font-black  text-white mb-2 relative z-10">Request Payout</h3>
        <p className="text-[10px] font-bold text-white  tracking-normal mb-8 relative z-10">Select your preferred withdrawal method</p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black  text-white ml-2">Amount (Min {formatPrice(1000)})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black  text-white ml-2">Method</label>
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
            <label className="text-[10px] font-black  text-white ml-2">Account Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter account number, title, bank name or wallet address..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:border-primary/50 transition-all outline-none font-bold text-white min-h-[100px]"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black  tracking-normal transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black  tracking-normal hover:bg-white transition-all disabled:opacity-50">
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

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'work';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (!searchParams.get('tab')) {
      if (isCommercePro) setTab('work');
      else if (isContentPro) setTab('assignments');
      else if (isPartnerPro) setTab('referrals');
    }
  }, [isCommercePro, isContentPro, isPartnerPro, searchParams]);

  const [activeOrders, setActiveOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [adminBids, setAdminBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [isCompetitorsModalOpen, setIsCompetitorsModalOpen] = useState(false);
  const [selectedBidForCompetitors, setSelectedBidForCompetitors] = useState(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidsSubTab, setBidsSubTab] = useState('won'); // 'bid', 'claim', or 'won'
  const [bidData, setBidData] = useState({ orderId: null, amount: '', message: '', type: 'bid', highestBid: 0 });
  
  const [showProofUpload, setShowProofUpload] = useState(null);
  const [tempProofs, setTempProofs] = useState([]);
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [profileName, setProfileName] = useState(user?.name || '');

  // Bid completion proof
  const [showBidProof, setShowBidProof] = useState(null); // bid object
  const [bidProofFile, setBidProofFile] = useState(null);
  const [bidProofPreview, setBidProofPreview] = useState(null);
  const [bidProofComment, setBidProofComment] = useState('');
  const [submittingBidProof, setSubmittingBidProof] = useState(false);

  const handleBidProofFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBidProofFile(file);
    setBidProofPreview(URL.createObjectURL(file));
  };

  const handleBidProofSubmit = async () => {
    if (!bidProofFile) return toast.error('Please select a proof image');
    setSubmittingBidProof(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('proofImage', bidProofFile);
      formData.append('comment', bidProofComment);
      await axios.post(`${API_URL}/api/v1/bids/${showBidProof._id}/complete`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Completion proof submitted!');
      setShowBidProof(null);
      setBidProofFile(null);
      setBidProofPreview(null);
      setBidProofComment('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmittingBidProof(false);
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
      toast.success('Profile updated successfully');
      checkUserLoggedIn();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [myOrdersRes, payoutRes, bidsRes, adminBidsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/orders/booster`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/payouts/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/bids/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/v1/bids/pro/available`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } }))
      ]);
      setActiveOrders(myOrdersRes.data.data.filter(o => o.status === 'processing' || o.status === 'pending'));
      setPayouts(payoutRes.data.data);
      setMyBids(bidsRes.data.data);
      setAdminBids(adminBidsRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Global market updates (new orders, etc)
    socket.on('marketUpdate', () => {
      fetchData();
    });

    socket.on('bidsUpdate', () => {
      fetchData();
    });

    return () => {
      socket.off('marketUpdate');
      socket.off('bidsUpdate');
    };
  }, []);

  // Listen for specific order updates when modal is open
  useEffect(() => {
    if (isCompetitorsModalOpen && selectedBidForCompetitors?.orderId?._id) {
      const orderId = selectedBidForCompetitors.orderId._id;
      socket.emit('joinOrder', orderId);

      const handleBidUpdate = (data) => {
        if (data.orderId === orderId) {
          fetchData();
        }
      };

      socket.on('bidUpdate', handleBidUpdate);

      return () => {
        socket.emit('leaveOrder', orderId);
        socket.off('bidUpdate', handleBidUpdate);
      };
    }
  }, [isCompetitorsModalOpen, selectedBidForCompetitors]);

  useEffect(() => {
    if (isBidModalOpen && bidData.isAdminBid && bidData.bidId) {
      socket.emit('joinBid', bidData.bidId);

      const handleAdminBidUpdate = (data) => {
        if (data.bidId === bidData.bidId) {
          fetchData();
        }
      };

      socket.on('bidUpdate', handleAdminBidUpdate);

      return () => {
        socket.emit('leaveBid', bidData.bidId);
        socket.off('bidUpdate', handleAdminBidUpdate);
      };
    }
  }, [isBidModalOpen, bidData.isAdminBid, bidData.bidId]);

  // Sync selected bid with fresh data from myBids
  useEffect(() => {
    if (selectedBidForCompetitors) {
      const freshBid = myBids.find(b => b._id === selectedBidForCompetitors._id);
      if (freshBid) setSelectedBidForCompetitors(freshBid);
    }
  }, [myBids]);

  const handleAction = (order, type) => {
    const baseAmount = order.customClaimPrice || order.boosterEarnings || order.price;
    if (type === 'claim') {
      // Direct claim with base price
      setBidData({ ...bidData, orderId: order._id, amount: baseAmount, type: 'claim', message: 'I want to claim this job for the base price.' });
      setIsBidModalOpen(true); // Still show modal to confirm and maybe add a message
    } else {
      // Open modal for custom bid
      const competitorsBids = order.competitors?.map(c => c.bidAmount || c.amount) || [];
      const trueHighestBid = Math.max(...competitorsBids, 0);
      setBidData({ 
        ...bidData, 
        orderId: order._id, 
        amount: trueHighestBid > 0 ? trueHighestBid : baseAmount, 
        type: 'bid', 
        message: '', 
        highestBid: trueHighestBid 
      });
      setIsBidModalOpen(true);
    }
  };

  const handleBidSubmit = async () => {
    if (bidData.isAdminBid) {
      return handleAdminBidSubmit();
    }
    if (!bidData.amount) return toast.error('Please enter a bid amount');
    
    // Highest bid validation
    if (bidData.highestBid && Number(bidData.amount) < Number(bidData.highestBid)) {
      return toast.error(`Your bid cannot be lower than the current highest bid of ${formatPrice(bidData.highestBid)}`);
    }

    setClaimingId(bidData.orderId);
    try {
      const token = localStorage.getItem('token');
      
      if (bidData._id) {
        // Update existing bid
        await axios.put(`${API_URL}/api/v1/bids/${bidData._id}`, {
          bidAmount: bidData.amount,
          message: bidData.message
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Bid updated successfully!');
      } else {
        // Create new bid
        await axios.post(`${API_URL}/api/v1/bids`, {
          orderId: bidData.orderId,
          bidAmount: bidData.amount,
          message: bidData.message,
          type: bidData.type
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(bidData.type === 'claim' ? 'Claim request sent!' : 'Bid submitted to admin!');
      }
      
      setIsBidModalOpen(false);
      setBidData({ orderId: null, amount: '', message: '', type: 'bid' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process bid');
    } finally {
      setClaimingId(null);
    }
  };

  const handleEditBid = (bid) => {
    const competitorsBids = bid.competitors?.map(c => c.amount) || [];
    const trueHighestBid = Math.max(...competitorsBids, 0);
    setBidData({
      _id: bid._id,
      orderId: bid.orderId._id,
      amount: trueHighestBid > 0 ? trueHighestBid : bid.bidAmount,
      message: bid.message || '',
      highestBid: trueHighestBid
    });
    setIsBidModalOpen(true);
  };

  const handleAdminBidAction = (bid, type) => {
    if (type === 'claim') {
      handleAdminClaim(bid);
    } else {
      setBidData({
        bidId: bid._id,
        orderId: bid.orderId?._id,
        amount: bid.bidPrice,
        maxPrice: bid.bidPrice,
        type: 'admin-bid',
        message: '',
        isAdminBid: true
      });
      setIsBidModalOpen(true);
    }
  };

  const handleAdminClaim = async (bid) => {
    setClaimingId(bid._id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/bids/${bid._id}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Job claimed successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim job');
    } finally {
      setClaimingId(null);
    }
  };

  const handleAdminBidSubmit = async () => {
    if (!bidData.amount) return toast.error('Please enter a bid amount');
    if (Number(bidData.amount) < bidData.maxPrice) {
      return toast.error(`Your bid must be at least ${formatPrice(bidData.maxPrice)}`);
    }
    
    setClaimingId(bidData.bidId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/bids/${bidData.bidId}/booster-bid`, {
        amount: Number(bidData.amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bid placed successfully!');
      setIsBidModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
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
        { label: 'Market Jobs', value: adminBids.length, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Active Work', value: activeOrders.length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
        { label: 'Total Earnings', value: formatPrice(user?.earnings || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/5' },
        { label: 'Trust Rating', value: `${user?.rating || 0}/5`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/5' }
      ];
    }
    return [];
  }, [adminBids, activeOrders, user, isCommercePro, formatPrice]);

  const renderOrderRow = (order, isStatusActive = false) => {
    const service = order.serviceId;
    const hasBid = myBids.some(b => b.orderId?._id === order._id);
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
              <span className="text-[9px] font-black  text-white tracking-normal px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
                {service?.game || 'Any Game'}
              </span>
              <span className="text-[9px] font-bold text-white  tracking-normal">#{order._id.slice(-6).toUpperCase()}</span>
              {hasBid && (
                <span className="text-[8px] font-black  bg-green-500/10 text-white px-2 py-0.5 rounded border border-green-500/20">Bid Placed</span>
              )}
            </div>
            <h4 className="text-lg font-black text-white  tracking-tight truncate group-hover:text-white transition-colors">
              {service?.title}
            </h4>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4 flex-1">
          <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-black text-white ">{order.platform || 'PC'}</span>
          </div>
          <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-black text-white ">{order.region || 'GLB'}</span>
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
              <p className="text-[9px] font-black text-white  tracking-normal">Assigned To</p>
              <div className="flex items-center gap-2 justify-end mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold text-white ">{order.userId?.name?.split(' ')[0] || 'Customer'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[9px] font-black text-white  tracking-normal">Revenue</p>
            {order.customClaimPrice ? (
              <div className="flex flex-col items-end">
                <p className="text-sm font-black text-white line-through decoration-red-500/50">{formatPrice(order.boosterEarnings || order.price)}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.customClaimPrice)}</p>
              </div>
            ) : (
              <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.boosterEarnings || order.price)}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/pro/order/${order._id}`)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            {!isStatusActive ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction(order, 'claim'); }}
                  disabled={claimingId === order._id}
                  className="px-6 py-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl font-black text-[10px]  tracking-normal transition-all disabled:opacity-50"
                >
                  Claim Job
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction(order, 'bid'); }}
                  disabled={claimingId === order._id}
                  className="px-8 py-4 bg-primary hover:bg-white text-black rounded-2xl font-black text-[11px]  tracking-normal transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {claimingId === order._id ? 'Securing...' : 'Place Bid'}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowProofUpload(order._id); }}
                className="px-8 py-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black border border-green-500/20 rounded-2xl font-black text-[11px]  tracking-normal transition-all"
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
    const hasBid = myBids.some(b => b.orderId?._id === order._id);
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
          
          {hasBid && (
            <div className="absolute top-6 right-6 z-20">
              <span className="text-[8px] font-black  bg-green-500 text-black px-3 py-1.5 rounded-full shadow-2xl">Bid Placed</span>
            </div>
          )}
        </div>

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black  tracking-normal text-white">{service?.game}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/pro/order/${order._id}`)} className="text-white hover:text-white"><ExternalLink size={14} /></button>
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-6 leading-tight truncate">{service?.title}</h3>
          
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white  tracking-normal">Payout</span>
              {order.customClaimPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white line-through decoration-red-500/50">{formatPrice(order.boosterEarnings || order.price)}</span>
                  <span className="text-2xl font-black text-white">{formatPrice(order.customClaimPrice)}</span>
                </div>
              ) : (
                <span className="text-2xl font-black text-white">{formatPrice(order.boosterEarnings || order.price)}</span>
              )}
            </div>
            
            {!isStatusActive ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(order, 'claim')}
                  disabled={claimingId === order._id}
                  className="px-4 py-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl font-black text-[9px]  transition-all"
                >
                  Claim
                </button>
                <button
                  onClick={() => handleAction(order, 'bid')}
                  disabled={claimingId === order._id}
                  className="px-4 py-4 bg-primary hover:bg-white text-black rounded-2xl font-black text-[9px]  transition-all shadow-lg shadow-primary/10"
                >
                  {claimingId === order._id ? '...' : 'Bid'}
                </button>
              </div>
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
                    className="px-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl font-black text-[10px] "
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
                  <p className="text-[10px] font-black  text-white tracking-normal mb-1">{stat.label}</p>
                  <p className="text-3xl font-black ">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-black  tracking-tighter">
                {tab === 'work' && 'Marketplace'}
                {tab === 'active' && 'My Active Task'}
                {tab === 'earnings' && 'Financial Overview'}
                {tab === 'performance' && 'Performance Analytics'}
                {tab === 'profile' && 'Account Settings'}
              </h2>
            </div>

            {(tab === 'work' || tab === 'active') && (
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 self-end lg:self-auto">
                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-white hover:text-white'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-black' : 'text-white hover:text-white'}`}><List size={18} /></button>
              </div>
            )}
          </div>

          <div className="min-h-[400px]">
            {tab === 'work' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ADMIN DEPLOYED BIDS SECTION */}
                {adminBids.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black tracking-tight">Active Bids</h3>
                        <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">{adminBids.length} Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-bold text-white tracking-normal">Admin Deployed</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {adminBids.map((bid) => (
                        <div 
                          key={bid._id}
                          className="group bg-[#0A0A0A] border border-primary/10 hover:border-primary/30 rounded-[32px] p-8 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 blur-[60px] rounded-full"></div>
                          
                          <div className="flex items-center gap-6 flex-1 min-w-0 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center p-3 shrink-0">
                              <img src={getImageUrl(bid.orderId?.serviceId?.icon || bid.orderId?.serviceId?.image)} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">Admin Bid</span>
                                <span className="text-[9px] font-bold text-white tracking-normal">#{bid.orderId?._id?.slice(-6).toUpperCase()}</span>
                              </div>
                              <h4 className="text-lg font-black text-white tracking-tight truncate">
                                {bid.orderId?.serviceId?.title || 'Service Order'}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-center">
                              <p className="text-[9px] font-black text-white/40 tracking-normal">Order Value</p>
                              <p className="text-sm font-black text-white/50 line-through">{formatPrice(bid.originalPrice)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] font-black text-primary tracking-normal">Best Payout</p>
                              <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(bid.bidPrice)}</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-3">
                              {(!bid.bidders?.some(b => (b.user?._id || b.user) === user?._id)) && (
                                <button
                                  onClick={() => handleAdminBidAction(bid, 'claim')}
                                  disabled={claimingId === bid._id}
                                  className="px-6 py-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl font-black text-[10px] tracking-normal transition-all"
                                >
                                  {claimingId === bid._id ? '...' : 'Claim Job'}
                                </button>
                              )}

                              <button
                                onClick={() => handleAdminBidAction(bid, 'bid')}
                                disabled={claimingId === bid._id}
                                className="px-8 py-4 bg-primary hover:bg-white text-black rounded-2xl font-black text-[11px] tracking-normal transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                              >
                                {bid.bidders?.length > 0 ? 'Join Auction' : 'Place Bid'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'active' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black  tracking-tight">Active Tasks</h3>
                    <p className="text-[10px] font-bold text-white  tracking-normal mt-1">Manage Your Terms</p>
                  </div>
                  
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setBidsSubTab('won')} 
                      className={`px-8 py-3 rounded-xl text-[10px] font-black  tracking-normal transition-all ${bidsSubTab === 'won' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white hover:text-white'}`}
                    >
                      Assigned
                    </button>
                    <button 
                      onClick={() => setBidsSubTab('bid')} 
                      className={`px-8 py-3 rounded-xl text-[10px] font-black  tracking-normal transition-all ${bidsSubTab === 'bid' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white hover:text-white'}`}
                    >
                      Bidders
                    </button>
                   
                  </div>
                </div>

                {myBids.filter(b => {
                  if (bidsSubTab === 'won') return (b.assignedUser?._id || b.assignedUser) === user?._id;
                  // Only show in Bidders/Claims if not yet assigned to anyone (still active/pending)
                  if (b.assignedUser) return false; 
                  if (bidsSubTab === 'bid') return b.bidders.some(bidder => (bidder.user?._id || bidder.user) === user?._id);
                  return b.claims?.some(claim => (claim.user?._id || claim.user) === user?._id);
                }).length === 0 ? (
                  <div className="py-24 text-center text-white font-black  tracking-normal border border-white/5 border-dashed rounded-[40px]">
                    No {bidsSubTab === 'bid' ? 'active bids' : bidsSubTab === 'claim' ? 'pending claims' : 'assigned missions'} found in your registry.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBids
                      .filter(b => {
                        if (bidsSubTab === 'won') return (b.assignedUser?._id || b.assignedUser) === user?._id;
                        if (b.assignedUser) return false;
                        if (bidsSubTab === 'bid') return b.bidders.some(bidder => (bidder.user?._id || bidder.user) === user?._id);
                        return b.claims?.some(claim => (claim.user?._id || claim.user) === user?._id);
                      })
                      .map((bid) => (
                      <div 
                        key={bid._id} 
                        onClick={() => {
                          setSelectedBidForCompetitors(bid);
                          setIsCompetitorsModalOpen(true);
                        }}
                        className="bg-[#0A0A0A] border border-white/5 hover:border-primary/20 rounded-[32px] p-8 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center p-3">
                            <img src={getImageUrl(bid.orderId?.serviceId?.icon)} className="w-full h-full object-contain" alt="" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-black  px-2 py-0.5 rounded border ${bid.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : bid.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-white border-yellow-500/20'}`}>
                                {bid.status}
                              </span>
                              <span className="text-[9px] font-bold text-white  tracking-normal">#ORD-{bid.orderId?._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <h4 className="text-lg font-black text-white  tracking-tight">{bid.orderId?.serviceId?.title || 'Custom Service'}</h4>
                            <p className="text-[10px] font-bold text-white  tracking-normal mt-1">
                              {bidsSubTab === 'won' ? (
                                <span className="text-primary">You won this mission! Final Earnings: {formatPrice(bid.orderId?.boosterEarnings || 0)}</span>
                              ) : (
                                <>
                                  Your Bid: <span className="text-white">{formatPrice(bid.bidders.find(u => (u.user?._id || u.user) === user?._id)?.amount || bid.bidPrice)}</span> 
                                  {bid.highestBid && (
                                    <span className="ml-3">Best Price: <span className={bid.isLowest ? 'text-green-500' : 'text-white'}>{formatPrice(bid.highestBid)}</span></span>
                                  )}
                                </>
                              )}
                            </p>
                            
                            {bidsSubTab === 'won' && (
                              <div className="mt-6 flex items-center gap-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/pro/chat/${bid.orderId?._id}`);
                                  }}
                                  className="px-6 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"
                                >
                                  <MessageSquare size={14} />
                                  Open Chat
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/pro/order/${bid.orderId?._id}`);
                                  }}
                                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  Mission Details
                                </button>
                                {/* Complete Mission button — only if not yet submitted or if rejected */}
                                {(!bid.completionStatus || bid.completionStatus === 'none' || bid.completionStatus === 'rejected') && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowBidProof(bid); }}
                                    className={`px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                      bid.completionStatus === 'rejected' ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border-red-500/20' : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black border-green-500/20'
                                    }`}
                                  >
                                    <CheckCircle2 size={14} />
                                    {bid.completionStatus === 'rejected' ? 'Resubmit Proof' : 'Complete Mission'}
                                  </button>
                                )}
                                {bid.completionStatus && bid.completionStatus !== 'none' && (
                                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                    bid.completionStatus === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    bid.completionStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                  }`}>
                                    {bid.completionStatus === 'pro_submitted' ? '⏳ Pending Review' :
                                     bid.completionStatus === 'customer_submitted' ? 
                                      (bid.customerProof?.status === 'rejected' ? '👤 Customer: Rejected' : '👤 Customer: Approved') :
                                      bid.completionStatus === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Competition Visualizer */}
                            {bid.highestBid && (
                              <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                <div 
                                  className={`absolute h-full transition-all duration-1000 ${bid.isLowest ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-primary'}`}
                                  style={{ width: `${Math.min(100, (bid.highestBid / bid.bidAmount) * 100)}%` }}
                                ></div>
                              </div>
                            )}

                            {/* Competitors List */}
                            {bid.competitors?.length > 0 && (
                              <div className="mt-4 flex items-center gap-3">
                                <div className="flex -space-x-3">
                                  {bid.competitors.slice(0, 3).map((comp, idx) => (
                                    <div 
                                      key={idx} 
                                      className="w-7 h-7 rounded-full bg-[#1A1A1A] border-2 border-[#0A0A0A] flex items-center justify-center relative group/comp"
                                      title={comp.name}
                                    >
                                      <User size={12} className="text-white" />
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-white text-black text-[9px] font-black  rounded-lg opacity-0 group-hover/comp:opacity-100 transition-opacity whitespace-nowrap z-30">
                                        {comp.name} ({formatPrice(comp.amount)})
                                      </div>
                                    </div>
                                  ))}
                                  {bid.competitors.length > 3 && (
                                    <div className="w-7 h-7 rounded-full bg-white/5 border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-black text-white">
                                      +{bid.competitors.length - 3}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-white  tracking-normal">
                                  {bid.competitors.length} Competitor{bid.competitors.length > 1 ? 's' : ''} Active
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {bid.status === 'pending' && (
                            <button
                              onClick={() => handleEditBid(bid)}
                              className="px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-black  tracking-normal transition-all"
                            >
                              Revise Terms
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/pro/order/${bid.orderId?._id}`)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white hover:text-white transition-all"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'earnings' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div>
                          <p className="text-[10px] font-black  text-white tracking-normal">Available Balance</p>
                          <h2 className="text-5xl font-black text-white flex items-center gap-4">{formatPrice(user?.earnings || 0)} <ArrowUpRight className="text-primary" /></h2>
                        </div>
                        <div className="flex items-end"><button onClick={() => setIsPayoutModalOpen(true)} className="w-full bg-primary text-black py-6 rounded-3xl font-black text-xs  hover:bg-white transition-all">Request Payout</button></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center gap-4"><ShieldCheck className="text-green-500" /> <span className="text-[11px] font-black ">Reliability Score: 98%</span></div>
                    <p className="text-[10px] text-white  tracking-normal leading-relaxed">Based on completion speed and feedback.</p>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead><tr className="bg-white/[0.01]"><th className="px-10 py-5 text-[10px] font-black  text-white">Date</th><th className="px-10 py-5 text-[10px] font-black  text-white">Amount</th><th className="px-10 py-5 text-[10px] font-black  text-white text-right">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {payouts.map(p => (
                        <tr key={p._id} className="hover:bg-white/[0.01]">
                          <td className="px-10 py-6 text-xs font-bold text-white">{new Date(p.requestedAt).toLocaleDateString()}</td>
                          <td className="px-10 py-6 text-sm font-black text-white">{formatPrice(p.amount)}</td>
                          <td className="px-10 py-6 text-right"><span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black ">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'performance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-white mb-6">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black  text-white tracking-normal mb-1">Win Rate</p>
                    <p className="text-3xl font-black">94%</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-white mb-6">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black  text-white tracking-normal mb-1">Avg. Completion</p>
                    <p className="text-3xl font-black">4.2 Hours</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-white mb-6">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black  text-white tracking-normal mb-1">Orders Completed</p>
                    <p className="text-3xl font-black">{user?.ordersCompleted || 0}</p>
                  </div>
                </div>
                <div className="py-24 flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[40px] text-center">
                   <TrendingUp className="w-12 h-12 text-white mb-6" />
                   <h4 className="text-xl font-black  text-white">Performance history coming soon</h4>
                </div>
              </div>
            )}

            {tab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Main Profile Info */}
                  <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/5 rounded-[40px] p-12 space-y-10">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white/5 flex items-center justify-center relative group overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-4xl font-black text-white">{user?.name?.charAt(0)}</span>
                        )}
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black  text-white tracking-tight">{user?.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-3 py-1 bg-primary/10 text-white border border-primary/20 rounded-full text-[8px] font-black  tracking-normal">{user?.role}</span>
                          <span className="text-white font-bold  text-[10px] tracking-normal">{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black  text-white ml-2 tracking-normal">Operator Name</label>
                        <div className="relative group">
                          <Edit3 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white group-focus-within:text-primary transition-colors" />
                          <input 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black  text-white ml-2 tracking-normal">Account ID</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                          <input type="text" defaultValue={user?._id} disabled className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white cursor-not-allowed" />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleUpdateProfile}
                      className="w-full py-6 bg-primary text-black rounded-3xl text-[10px] font-black  tracking-normal hover:bg-white transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3"
                    >
                      <Zap size={14} />
                      Sync Profile Data
                    </button>
                  </div>

                  {/* Sidebar Stats/Intel */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 space-y-8">
                       <div>
                          <p className="text-[10px] font-black  text-white tracking-normal mb-6">Service Intelligence</p>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-white ">Specialization</span>
                                <span className="text-[10px] font-black text-white ">{user?.proType?.replace('_', ' ') || 'Freelancer'}</span>
                             </div>
                             <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-white ">Clearance Level</span>
                                <span className="text-[10px] font-black text-white ">{user?.proStatus === 'approved' ? 'Active Duty' : 'Pending Review'}</span>
                             </div>
                             <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-white ">Missions Done</span>
                                <span className="text-[10px] font-black text-white ">{user?.missionDone || 0} Successful</span>
                             </div>
                          </div>
                       </div>

                       <div>
                          <p className="text-[10px] font-black  text-white tracking-normal mb-4">Tactical Sectors</p>
                          <div className="flex flex-wrap gap-2">
                             {user?.specializedGames?.length > 0 ? (
                                user.specializedGames.map((game, idx) => (
                                   <span key={idx} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-white ">
                                      {game.title || 'Game Master'}
                                   </span>
                                ))
                             ) : (
                                <p className="text-[10px] font-bold text-white  italic">No sectors assigned yet</p>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black  text-white mb-1">Career Earnings</p>
                          <p className="text-2xl font-black text-white">{formatPrice(user?.earnings || 0)}</p>
                       </div>
                       <TrendingUp size={32} className="text-primary/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showProofUpload && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowProofUpload(null)}></div>
            <div className="relative w-full max-w-[600px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 overflow-hidden shadow-2xl">
              <h3 className="text-3xl font-black  text-white mb-10">Proof of Completion</h3>
              <div className="space-y-6">
                <input type="text" id="pLink" placeholder="Screenshot Link..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white outline-none" />
                <button onClick={() => { const val = document.getElementById('pLink').value; if(val){ setTempProofs([...tempProofs, val]); document.getElementById('pLink').value = ''; } }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black ">Add Proof</button>
                <div className="grid grid-cols-2 gap-4">
                  {tempProofs.map((p, i) => <img key={i} src={p} className="aspect-video rounded-xl object-cover border border-white/10" alt="" />)}
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowProofUpload(null)} className="flex-1 py-5 bg-white/5 rounded-3xl text-[10px] font-black ">Cancel</button>
                  <button onClick={() => handleCompleteSubmit(showProofUpload)} className="flex-1 py-5 bg-primary text-black rounded-3xl text-[10px] font-black ">Submit Report</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isBidModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsBidModalOpen(false)}></div>
          <div className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 shadow-2xl space-y-10 custom-scrollbar">
            <div>
              <h3 className="text-3xl font-black  text-white tracking-tight mb-2">Place Your Bid</h3>
              <p className="text-[10px] font-bold  text-white tracking-normal">Secure this mission by offering your terms</p>
            </div>

            <div className="space-y-6">
            <div className="space-y-8 mt-12">
              <div className="space-y-3">
                <label className="text-[10px] font-black  text-white ml-4">
                  {bidData.type === 'claim' ? 'Platform Base Price ($)' : 'Your Proposal Price ($)'}
                </label>
                <div className="relative group">
                  <DollarSign className={`absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${bidData.type === 'claim' ? 'text-primary' : 'text-white group-focus-within:text-primary'}`} />
                  <input 
                    type="number" 
                    value={bidData.amount}
                    onChange={(e) => setBidData({ ...bidData, amount: e.target.value })}
                    readOnly={bidData.type === 'claim'}
                    min={bidData.maxPrice || 0}
                    className={`w-full bg-black border rounded-3xl py-6 pl-16 pr-8 text-sm font-bold transition-all outline-none ${bidData.type === 'claim' ? 'border-primary/50 text-primary cursor-not-allowed' : (bidData.isAdminBid ? (Number(bidData.amount) < bidData.maxPrice ? 'border-red-500/50 text-red-500' : 'border-white/5 text-white focus:border-primary/50') : (bidData.highestBid && Number(bidData.amount) < Number(bidData.highestBid)) ? 'border-red-500/50 text-red-500 focus:border-red-500' : 'border-white/5 text-white focus:border-primary/50')}`} 
                    placeholder="Enter bid amount..."
                  />
                  {bidData.type === 'claim' && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" />
                      <span className="text-[8px] font-black  text-white">Locked</span>
                    </div>
                  )}
                  {bidData.isAdminBid && Number(bidData.amount) < bidData.maxPrice && (
                    <div className="absolute -bottom-6 left-4 flex items-center gap-1.5">
                      <AlertCircle size={10} className="text-red-500" />
                      <span className="text-[9px] font-bold text-white  tracking-tight">Must be at least {formatPrice(bidData.maxPrice)}</span>
                    </div>
                  )}
                  {bidData.highestBid > 0 && Number(bidData.amount) < Number(bidData.highestBid) && bidData.type !== 'claim' && !bidData.isAdminBid && (
                    <div className="absolute -bottom-6 left-4 flex items-center gap-1.5">
                      <AlertCircle size={10} className="text-red-500" />
                      <span className="text-[9px] font-bold text-white  tracking-tight">Must be at least {formatPrice(bidData.highestBid)}</span>
                    </div>
                  )}
                </div>
              </div>

          
            </div>
            
            {bidData.isAdminBid && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between ml-4">
                  <p className="text-[10px] font-black text-white/40 tracking-normal">Current Bidders</p>
                  <button 
                    onClick={() => navigate(`/pro/bid/${bidData.bidId}/bidders`)}
                    className="text-[9px] font-black text-primary hover:text-white transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {adminBids.find(b => b._id === bidData.bidId)?.bidders?.length > 0 ? (
                    adminBids.find(b => b._id === bidData.bidId).bidders.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-white/40" />
                          <span className="text-[10px] font-bold text-white ">{b.user?.name || 'Booster'}</span>
                        </div>
                        <span className="text-[10px] font-black text-primary">{formatPrice(b.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] font-bold text-white/30 italic ml-4">No bids yet. Be the first!</p>
                  )}
                </div>
              </div>
            )}

            {bidData.highestBid > 0 && !bidData.isAdminBid && (
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-[32px] flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp size={14} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-black  text-white tracking-normal">Current Highest Bid</span>
                </div>
                <span className="text-lg font-black text-white">{formatPrice(bidData.highestBid)}</span>
              </div>
            )}

            <div className="flex gap-4 pt-8">
              <button 
                onClick={() => setIsBidModalOpen(false)}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-[30px] text-[10px] font-black  tracking-normal text-white transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleBidSubmit}
                disabled={claimingId}
                className="flex-1 py-5 bg-primary hover:bg-white text-black rounded-[30px] text-[10px] font-black  tracking-normal transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {claimingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {bidData.type === 'claim' ? 'Confirm Claim' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {isCompetitorsModalOpen && selectedBidForCompetitors && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsCompetitorsModalOpen(false)}></div>
          <div className="relative w-full max-w-[550px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl font-black  text-white tracking-tight">Market Intelligence</h3>
                <p className="text-[10px] font-bold text-white  tracking-normal mt-1">Live competitive data for #{selectedBidForCompetitors.orderId?._id.slice(-6).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setIsCompetitorsModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black  text-white mb-1">Your Proposal</p>
                  <p className="text-xl font-black text-white  tracking-tight">{user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black  text-white mb-1">Price</p>
                  <p className="text-xl font-black text-white">{formatPrice(selectedBidForCompetitors.bidAmount)}</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {/* --- CUSTOMER REVIEW SECTION --- */}
                {(selectedBidForCompetitors.completionStatus === 'customer_submitted' || selectedBidForCompetitors.customerProof) && (
                  <div className="mb-6 space-y-4">
                    <p className="text-[10px] font-black text-primary tracking-widest uppercase ml-4">Customer Review Intel</p>
                    <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40">Review Status</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          selectedBidForCompetitors.customerProof?.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedBidForCompetitors.customerProof?.status || 'Pending'}
                        </span>
                      </div>

                      {selectedBidForCompetitors.customerProof?.imageUrl && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-white/40">Confirmation Proof</span>
                          <div className="relative rounded-2xl overflow-hidden border border-white/10 group/img">
                            <img 
                              src={getImageUrl(selectedBidForCompetitors.customerProof.imageUrl)} 
                              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
                              alt="Customer Proof" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => window.open(getImageUrl(selectedBidForCompetitors.customerProof.imageUrl), '_blank')} className="p-3 bg-white text-black rounded-full shadow-xl">
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBidForCompetitors.customerProof?.comment && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-white/40">Customer Feedback</span>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-xs font-medium text-white/80">
                            "{selectedBidForCompetitors.customerProof.comment}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-black  text-white tracking-normal ml-4">Active Competitors</p>
                
                {(!selectedBidForCompetitors.competitors || selectedBidForCompetitors.competitors.length === 0) ? (
                  <div className="py-12 text-center bg-white/[0.02] border border-white/5 border-dashed rounded-[32px]">
                    <p className="text-xs font-bold text-white ">No other proposals yet</p>
                  </div>
                ) : (
                  selectedBidForCompetitors.competitors.map((comp, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-[24px] p-5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          <User size={16} className="text-white group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-black text-white  tracking-tight">{comp.name}</p>
                      </div>
                      <p className="text-sm font-black text-white">{formatPrice(comp.amount)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setIsCompetitorsModalOpen(false)}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-[30px] text-[10px] font-black  tracking-normal text-white transition-all"
              >
                Dismiss
              </button>
              {selectedBidForCompetitors.status === 'pending' && (
                <button 
                  onClick={() => {
                    setIsCompetitorsModalOpen(false);
                    handleEditBid(selectedBidForCompetitors);
                  }}
                  className="flex-1 py-5 bg-primary hover:bg-white text-black rounded-[30px] text-[10px] font-black  tracking-normal transition-all shadow-xl shadow-primary/20"
                >
                  Add your bid
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <PayoutModal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} balance={user?.earnings || 0} onRefresh={() => { fetchData(); checkUserLoggedIn(); }} />

      {/* ── Bid Completion Proof Modal ── */}
      {showBidProof && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => { setShowBidProof(null); setBidProofFile(null); setBidProofPreview(null); setBidProofComment(''); }} />
          <div className="relative w-full max-w-[560px] bg-[#0A0A0A] border border-white/10 rounded-[48px] p-12 shadow-2xl space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Complete Mission</h3>
              </div>
              <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase ml-1">
                {showBidProof.orderId?.serviceId?.title || 'Submit your completion proof'}
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white ml-2 tracking-normal">Proof Screenshot / Image *</label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-primary/40 transition-all bg-white/[0.02] hover:bg-primary/5 group">
                {bidProofPreview ? (
                  <img src={bidProofPreview} className="h-full w-full object-contain rounded-3xl p-2" alt="proof preview" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/60 transition-colors">
                    <Upload size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Click to upload proof</p>
                    <p className="text-[9px] font-bold">PNG, JPG, MP4 up to 50MB</p>
                  </div>
                )}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleBidProofFileChange} />
              </label>
              {bidProofFile && (
                <p className="text-[9px] font-bold text-green-400 ml-2">✓ {bidProofFile.name}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white ml-2 tracking-normal">Comment (optional)</label>
              <textarea
                value={bidProofComment}
                onChange={(e) => setBidProofComment(e.target.value)}
                placeholder="Describe what was completed..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none focus:border-primary/40 transition-all min-h-[100px] resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => { setShowBidProof(null); setBidProofFile(null); setBidProofPreview(null); setBidProofComment(''); }}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-[30px] text-[10px] font-black tracking-normal text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBidProofSubmit}
                disabled={submittingBidProof || !bidProofFile}
                className="flex-1 py-5 bg-green-500 hover:bg-white text-black rounded-[30px] text-[10px] font-black tracking-normal transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingBidProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submittingBidProof ? 'Submitting...' : 'Submit Proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>

  );
};

export default ProDashboard;

