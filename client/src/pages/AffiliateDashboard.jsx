import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL } from '../utils/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
 Users,
 DollarSign,
 TrendingUp,
 ExternalLink,
 Copy,
 CheckCircle2,
 Zap,
 BarChart3,
 Trophy,
 Target,
 Share2,
 ChevronRight,
 ArrowUpRight
} from 'lucide-react';

const AffiliateDashboard = () => {
 const { user } = useAuth();
 const { formatPrice } = useCurrency();
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const [trackingLink, setTrackingLink] = useState('');
 const [copied, setCopied] = useState(false);

 useEffect(() => {
 fetchStats();
 }, []);

 const fetchStats = async () => {
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/affiliate/stats`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 if (res.data.success) {
 setStats(res.data.data);
 setTrackingLink(`${window.location.origin}/signup?ref=${res.data.data.affiliateCode}`);
 }
 } catch (err) {
 console.error('Error fetching stats:', err);
 } finally {
 setLoading(false);
 }
 };

 const copyToClipboard = () => {
 navigator.clipboard.writeText(trackingLink);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 if (loading) {
 return (
 <DashboardLayout title="Affiliate Nexus">
 <div className="min-h-[400px] flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 </DashboardLayout>
 );
 }

 const statCards = [
 { label: 'Total Referrals', value: stats?.totalReferrals || 0, icon: Users, color: 'text-primary', sub: 'Users joined via link' },
 { label: 'Conversions', value: stats?.conversions || 0, icon: Target, color: 'text-green-500', sub: 'Successful purchases' },
 { label: 'Total Earnings', value: formatPrice(stats?.totalEarnings || 0), icon: DollarSign, color: 'text-yellow-500', sub: 'Commission earned' },
 { label: 'Commission Rate', value: `${stats?.commissionRate || 10}%`, icon: Zap, color: 'text-blue-500', sub: 'Current reward tier' },
 ];

 return (
 <DashboardLayout title="Affiliate Nexus">
 <div className="space-y-12 font-['Outfit']">

 {/* Header Welcome */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-3xl font-black uppercase tracking-tighter">Welcome back, <span className="text-primary">{user?.name}</span></h1>
 <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Partner ID: {stats?.affiliateCode || 'PENDING'}</p>
 </div>
 <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
 <span className="text-[10px] font-black uppercase tracking-widest text-green-500/80">Affiliate System Active</span>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {statCards.map((stat, i) => (
 <div key={i} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] group hover:border-primary/20 transition-all relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>

 <div className="flex items-center justify-between mb-6 relative z-10">
 <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
 <stat.icon className="w-6 h-6" />
 </div>
 <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-colors" />
 </div>

 <div className="relative z-10">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</h3>
 <p className="text-3xl font-black tracking-tighter text-white mb-2">{stat.value}</p>
 <p className="text-[9px] font-bold uppercase text-white/10 tracking-widest">{stat.sub}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Referral Link & Earnings Breakdown */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

 {/* Link Card */}
 <div className="lg:col-span-12">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-10 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-white/20 to-primary/50 opacity-20"></div>

 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="shrink-0">
 <div className="w-20 h-20 bg-primary/20 rounded-[32px] border border-primary/30 flex items-center justify-center">
 <Share2 className="w-10 h-10 text-primary" />
 </div>
 </div>

 <div className="flex-1 space-y-6 w-full text-center md:text-left">
 <div>
 <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Grow Your Empire</h2>
 <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Share your unique link and earn {stats?.commissionRate || 10}% on every referral conversion.</p>
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <div className="flex-1 relative group">
 <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
 <input
 type="text"
 value={trackingLink}
 readOnly
 className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white/60 focus:outline-none focus:border-primary/40 transition-all outline-none"
 />
 </div>
 <button
 onClick={copyToClipboard}
 className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-primary hover:text-white'}`}
 >
 {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Earnings Breakdown */}
 <div className="lg:col-span-7">
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-10 h-full">
 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-10 flex items-center gap-3">
 <BarChart3 className="w-4 h-4" />
 Revenue Matrix
 </h3>

 <div className="space-y-8">
 <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
 <Clock className="w-5 h-5 text-yellow-500" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Pending Payout</p>
 <p className="text-xl font-black ">{formatPrice(stats?.pendingEarnings || 0)}</p>
 </div>
 </div>
 <div className="text-[8px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">Processing</div>
 </div>

 <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
 <CheckCircle2 className="w-5 h-5 text-green-500" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Paid Total</p>
 <p className="text-xl font-black ">{formatPrice(stats?.paidEarnings || 0)}</p>
 </div>
 </div>
 <div className="text-[8px] font-black uppercase bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">Verified</div>
 </div>

 <div className="pt-6 border-t border-white/5 flex items-center justify-between px-2">
 <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Grand Total Revenue</span>
 <span className="text-2xl font-black text-primary">{formatPrice(stats?.totalEarnings || 0)}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Meta Card */}
 <div className="lg:col-span-5">
 <div className="bg-primary/5 border border-primary/20 rounded-[48px] p-10 h-full flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>

 <div>
 <div className="w-14 h-14 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center mb-8">
 <Trophy className="w-7 h-7 text-primary" />
 </div>
 <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">Elite Partner <br />Program</h3>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
 {user?.affiliateType === 'creator'
 ? 'As a Content Creator, you have access to exclusive media assets and custom banner links.'
 : 'As an Elite Promoter, focus on high-traffic channels to maximize your conversion multiplier.'}
 </p>
 </div>

 <div className="mt-10">
 <button className="w-full bg-primary text-black py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 shadow-2xl shadow-primary/20">
 Request Payout <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>

 </div>

 </div>

 <style>{`
 .custom-scrollbar::-webkit-scrollbar { width: 4px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,184,0,0.2); border-radius: 10px; }
 `}</style>
 </DashboardLayout>
 );
};

export default AffiliateDashboard;
