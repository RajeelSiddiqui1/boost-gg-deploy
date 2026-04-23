import React, { useState } from 'react';
import { X, Trash2, Mail, User, Shield, Calendar, DollarSign, Wallet } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const UserModal = ({ user, onClose, onUpdate }) => {
 const { user: currentUser } = useAuth();
 const [loading, setLoading] = useState(false);
 const [confirmDelete, setConfirmDelete] = useState(false);

 if (!user) return null;

 const handleDelete = async () => {
 try {
 setLoading(true);
 await axios.delete(`${API_URL}/api/v1/admin/users/${user._id}`);
 onUpdate(); // Reflect changes (remove user from list)
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to delete user');
 setLoading(false);
 }
 };

 const formatDate = (dateString) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 });
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
 <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative">
 {/* Header */}
 <div className="relative shrink-0 h-32 bg-gradient-to-r from-primary/20 to-purple-600/20">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
 >
 <X className="w-5 h-5" />
 </button>
 <div className="absolute -bottom-10 left-8 flex items-end">
 <div className="w-24 h-24 rounded-2xl bg-[#0A0A0A] border-4 border-[#0A0A0A] flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl">
 {user.name.charAt(0)}
 </div>
 </div>
 </div>

 {/* Body */}
 <div className="pt-12 px-8 pb-8 overflow-y-auto flex-1">
 <div className="flex justify-between items-start mb-6">
 <div>
 <h2 className="text-2xl font-black uppercase text-white">{user.name} {user.surname}</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-bold uppercase text-white/40 tracking-wider">@{user.username || 'unknown'}</span>
 {user.role === 'admin' && (
 <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest">
 {user.email === 'admin@boostgg.com' ? 'Super Admin' : 'Admin'}
 </span>
 )}
 </div>
 </div>
 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.isActive
 ? 'bg-green-500/10 text-green-500 border-green-500/20'
 : 'bg-red-500/10 text-red-500 border-red-500/20'
 }`}>
 {user.isActive ? 'Active' : 'Suspended'}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 mb-8">
 <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
 <div className="flex items-center gap-3 mb-2">
 <Mail className="w-4 h-4 text-white/40" />
 <span className="text-xs font-bold uppercase text-white/40">Email</span>
 </div>
 <p className="text-sm font-bold text-white break-all">{user.email}</p>
 </div>
 <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
 <div className="flex items-center gap-3 mb-2">
 <Calendar className="w-4 h-4 text-white/40" />
 <span className="text-xs font-bold uppercase text-white/40">Joined</span>
 </div>
 <p className="text-sm font-bold text-white">{formatDate(user.createdAt)}</p>
 </div>
 <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
 <div className="flex items-center gap-3 mb-2">
 <Wallet className="w-4 h-4 text-white/40" />
 <span className="text-xs font-bold uppercase text-white/40">Wallet</span>
 </div>
 <p className="text-sm font-bold text-white">${user.walletBalance || 0}</p>
 </div>
 <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
 <div className="flex items-center gap-3 mb-2">
 <DollarSign className="w-4 h-4 text-white/40" />
 <span className="text-xs font-bold uppercase text-white/40">Earnings</span>
 </div>
 <p className="text-sm font-bold text-green-500">${user.earnings || 0}</p>
 </div>
 </div>

 {/* Actions */}
 <div className="pt-6 border-t border-white/5 space-y-6">

 {/* PRO Application Review */}
 {user.proStatus === 'pending' && user.proApplication && (
 <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Shield className="w-4 h-4 text-primary" />
 <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">PRO Application Review</h4>
 </div>
 <div className="grid grid-cols-1 gap-3">
 <div className="p-3 bg-black/40 rounded-lg">
 <p className="text-[8px] font-black uppercase text-white/20 mb-1">Discord</p>
 <p className="text-xs font-bold text-white">{user.proApplication.discord}</p>
 </div>
 <div className="p-3 bg-black/40 rounded-lg">
 <p className="text-[8px] font-black uppercase text-white/20 mb-1">Games</p>
 <p className="text-xs font-bold text-white">{user.proApplication.games}</p>
 </div>
 <div className="p-3 bg-black/40 rounded-lg">
 <p className="text-[8px] font-black uppercase text-white/20 mb-1">Experience</p>
 <p className="text-xs font-bold text-white leading-relaxed">{user.proApplication.experience}</p>
 </div>
 </div>
 <div className="flex gap-2">
 <button
 onClick={async () => {
 try {
 setLoading(true);
 await axios.put(`${API_URL}/api/v1/admin/users/${user._id}`, {
 role: 'pro',
 proStatus: 'approved'
 });
 onUpdate();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || 'Approval failed');
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 className="flex-1 py-3 bg-primary text-black text-[10px] font-black uppercase rounded-xl hover:bg-white transition-all disabled:opacity-50"
 >
 Approve as PRO
 </button>
 <button
 onClick={async () => {
 try {
 setLoading(true);
 await axios.put(`${API_URL}/api/v1/admin/users/${user._id}`, {
 proStatus: 'rejected'
 });
 onUpdate();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || 'Rejection failed');
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 className="py-3 px-6 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
 >
 Reject
 </button>
 </div>
 </div>
 )}

 <div>
 <h4 className="text-xs font-black uppercase text-white/30 tracking-widest mb-4">Danger Zone</h4>

 {confirmDelete ? (
 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
 <p className="text-xs font-bold text-red-500">Permantly delete data?</p>
 <div className="flex gap-2">
 <button
 onClick={() => setConfirmDelete(false)}
 className="px-3 py-1.5 bg-transparent hover:bg-white/5 text-white/60 text-[10px] font-bold uppercase rounded-lg transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleDelete}
 disabled={loading}
 className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-lg transition-colors shadow-lg shadow-red-500/20"
 >
 {loading ? '...' : 'Confirm'}
 </button>
 </div>
 </div>
 ) : (
 <button
 onClick={() => setConfirmDelete(true)}
 disabled={user.email === 'admin@boostgg.com'}
 className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-500 border border-white/5 rounded-xl transition-all w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Trash2 className="w-4 h-4" />
 <span className="text-xs font-bold uppercase tracking-wider">Delete User</span>
 </button>
 )}

 {user.email === 'admin@boostgg.com' && (
 <p className="text-[10px] text-center text-white/20 mt-2 font-bold uppercase tracking-wider">
 Super Admin cannot be deleted
 </p>
 )}
 </div>
 </div>

 <div className="mt-6">
 <button
 onClick={onClose}
 className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-xs rounded-xl transition-all border border-white/5 hover:border-white/10"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};

export default UserModal;
