import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, User, DollarSign, Clock, 
  ArrowLeft, Search, Filter, Loader2,
  Trophy, TrendingDown, Target
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { API_URL, getImageUrl } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const BidBidders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBidders = async () => {
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
    fetchBidders();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Bid Intelligence">
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bid) {
    return (
      <DashboardLayout title="Bid Intelligence">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <Search size={40} />
          </div>
          <h2 className="text-2xl font-black text-white">Bid Session Not Found</h2>
          <button onClick={() => navigate(-1)} className="px-8 py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl transition-all font-black text-xs">Return to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const filteredBidders = bid.bidders.filter(b => 
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.amount - b.amount); // Lowest bids first

  const service = bid.orderId?.serviceId;

  return (
    <DashboardLayout title="Market Intelligence">
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
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">Active Auction</span>
                <span className="text-[10px] font-bold text-white/40">#{bid.orderId?._id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">{service?.title || 'Service Registry'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 rounded-3xl p-4 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/40 tracking-normal">Platform Price</p>
              <p className="text-xl font-black text-white">{formatPrice(bid.bidPrice)}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-4">
            <p className="text-[10px] font-black text-white/40 tracking-normal uppercase">Active Bidders</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">{bid.bidders.length}</span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1">Live <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span></span>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-4">
            <p className="text-[10px] font-black text-white/40 tracking-normal uppercase">Leading Bid</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-primary">{filteredBidders.length > 0 ? formatPrice(filteredBidders[0].amount) : formatPrice(bid.bidPrice)}</span>
              <TrendingDown size={20} className="text-primary" />
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 space-y-4">
            <p className="text-[10px] font-black text-white/40 tracking-normal uppercase">Time Remaining</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">Live</span>
              <Clock size={20} className="text-white/40" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search boosters..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/40">Sort By: Lowest Price</span>
              <Filter className="w-4 h-4 text-white/40" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-normal uppercase">Rank</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-normal uppercase">Booster Profile</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-normal uppercase">Bid Amount</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-normal uppercase">Timestamp</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/40 tracking-normal uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBidders.map((b, idx) => (
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
                          <p className="text-sm font-black text-white tracking-tight">{b.user?.name || 'Anonymous Booster'}</p>
                          <p className="text-[10px] font-bold text-white/30">{b.user?.email || 'Confidential'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-primary" />
                        <span className="text-lg font-black text-white">{formatPrice(b.amount)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-[11px] font-bold text-white/40">{new Date(b.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {idx === 0 ? (
                        <span className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-wider">Top Bidder</span>
                      ) : (
                        <span className="px-4 py-2 bg-white/5 text-white/40 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-wider">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBidders.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <Target size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-white">No Matching Bidders</h4>
                <p className="text-xs text-white/40 max-w-xs mx-auto">Try adjusting your search terms or wait for new boosters to bid.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BidBidders;
