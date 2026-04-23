import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import {
 Check, X, Eye, Search, Filter,
 MoreVertical, Zap, DollarSign, Layout,
 Mail, MessageSquare, Clock, ArrowRight,
 ExternalLink, Trash2, Loader2, Video, Share2, Users,
 Send,
 Gamepad2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminProApplications = () => {
 const [applications, setApplications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('pending');
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedApp, setSelectedApp] = useState(null);
 const [actionLoading, setActionLoading] = useState(false);

 useEffect(() => {
 fetchApplications();
 }, [filter]);

 const fetchApplications = async () => {
 setLoading(true);
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/admin/pros/applications?status=${filter}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setApplications(res.data.data);
 } catch (err) {
 console.error('Failed to fetch applications', err);
 } finally {
 setLoading(false);
 }
 };

 const handleReview = async (id, status, notes = '') => {
 setActionLoading(true);
 try {
 const token = localStorage.getItem('token');
 await axios.post(`${API_URL}/api/v1/admin/pros/applications/${id}/review`, {
 status,
 reviewNotes: notes
 }, {
 headers: { Authorization: `Bearer ${token}` }
 });
 fetchApplications();
 setSelectedApp(null);
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to review application');
 } finally {
 setActionLoading(false);
 }
 };

 const filteredApplications = applications.filter(app =>
 app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 app.discord?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 app.proType?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const getRoleIcon = (type) => {
 switch (type) {
 case 'booster': return Zap;
 case 'gold_seller': return DollarSign;
 case 'account_seller': return Layout;
 case 'content_creator': return Video;
 case 'influencer_partner': return Share2;
 default: return Users;
 }
 };

 return (
 <AdminLayout>
 <div className="p-8 space-y-8 font-['Outfit']">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black uppercase tracking-tighter">Pro Applications</h1>
 <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Review and manage professional applications</p>
 </div>

 <div className="flex items-center gap-3">
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 type="text"
 placeholder="Search applications..."
 className="bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-primary/50 transition-all w-64"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex bg-white/[0.03] border border-white/5 rounded-2xl p-1">
 {['pending', 'approved', 'rejected'].map((s) => (
 <button
 key={s}
 onClick={() => setFilter(s)}
 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
 >
 {s}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Applications Table */}
 <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-white/5 bg-white/[0.02]">
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Icon</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Candidate</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Role</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Contact</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {loading ? (
 <tr>
 <td colSpan="6" className="px-8 py-20 text-center">
 <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
 <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Loading applications...</p>
 </td>
 </tr>
 ) : filteredApplications.length === 0 ? (
 <tr>
 <td colSpan="6" className="px-8 py-20 text-center text-white/20 text-[10px] font-black uppercase tracking-widest">
 No applications found
 </td>
 </tr>
 ) : (
 filteredApplications.map((app) => (
 <tr key={app._id} className="hover:bg-white/[0.01] transition-colors group">
 <td className="px-8 py-6">
 <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto">
 {React.createElement(getRoleIcon(app.proType), { className: "w-5 h-5 text-primary" })}
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
 {app.userId?.avatar ? (
 <img src={app.userId.avatar} alt="" className="w-full h-full object-cover" />
 ) : (
 <span className="text-xs font-black text-primary">{(app.userId?.name || 'G').charAt(0)}</span>
 )}
 </div>
 <div>
 <div className="font-black uppercase text-sm tracking-tight">{app.userId?.name || 'Guest Candidate'}</div>
 <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{app.email}</div>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-primary">
 {app.proType?.replace('_', ' ')}
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
 <MessageSquare className="w-3 h-3 text-primary" /> {app.discord}
 </div>
 {app.telegram && (
 <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
 <Send className="w-3 h-3 text-blue-400" /> {app.telegram}
 </div>
 )}
 </div>
 </td>
 <td className="px-8 py-6">
 <div className={`text-[10px] font-black uppercase tracking-widest ${app.status === 'approved' ? 'text-green-400' :
 app.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
 }`}>
 {app.status}
 </div>
 </td>
 <td className="px-8 py-6 text-right">
 <button
 onClick={() => setSelectedApp(app)}
 className="p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-primary/50 transition-all group-hover:scale-105"
 >
 <Eye className="w-4 h-4 text-white/40 hover:text-primary" />
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Application Details Modal */}
 {selectedApp && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
 <button
 onClick={() => setSelectedApp(null)}
 className="absolute top-8 right-8 p-3 bg-white/[0.03] border border-white/5 rounded-full hover:bg-white/10 transition-all"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="space-y-8">
 <div className="flex items-center gap-6">
 <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/20">
 {React.createElement(getRoleIcon(selectedApp.proType), { className: "w-10 h-10 text-primary" })}
 </div>
 <div>
 <h2 className="text-3xl font-black uppercase tracking-tighter">Review Application</h2>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Submitted {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-8">
 <div className="space-y-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Contact Info</h4>
 <div className="space-y-3">
 <div className="text-sm font-bold flex items-center gap-3"><Mail className="w-4 h-4 text-white/20" /> {selectedApp.email}</div>
 <div className="text-sm font-bold flex items-center gap-3"><MessageSquare className="w-4 h-4 text-white/20" /> {selectedApp.discord}</div>
 {selectedApp.telegram && (
 <div className="text-sm font-bold flex items-center gap-3"><Send className="w-4 h-4 text-white/20" /> {selectedApp.telegram}</div>
 )}
 </div>
 </div>
 <div className="space-y-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Details</h4>
 <div className="space-y-3">
 <div className="text-sm font-bold flex items-center gap-3"><Clock className="w-4 h-4 text-white/20" /> Availability: {selectedApp.hoursPerDay}</div>
 <div className="text-sm font-bold flex items-center gap-3"><Gamepad2 className="w-4 h-4 text-white/20" /> Games: {selectedApp.games?.join(', ')}</div>
 </div>
 </div>
 </div>

 <div className="space-y-4 p-8 bg-white/[0.03] border border-white/5 rounded-[32px]">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Experience & Achievements</h4>
 <p className="text-sm text-white/60 leading-relaxed ">{selectedApp.experienceText || selectedApp.personalStatement}</p>
 </div>

 {selectedApp.status === 'pending' && (
 <div className="flex gap-4 pt-4">
 <button
 disabled={actionLoading}
 onClick={() => handleReview(selectedApp._id, 'rejected', 'Does not meet our current requirements.')}
 className="flex-1 py-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
 >
 <X className="w-4 h-4" /> Reject Application
 </button>
 <button
 disabled={actionLoading}
 onClick={() => handleReview(selectedApp._id, 'approved', 'Welcome to the team!')}
 className="flex-1 py-5 rounded-3xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
 >
 {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve Candidate
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </AdminLayout>
 );
};

export default AdminProApplications;
