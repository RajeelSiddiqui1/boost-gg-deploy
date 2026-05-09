import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, ShieldCheck, Mail, User,
  Image as ImageIcon, FileText, Video, ExternalLink,
  Zap, Clock, MessageSquare
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_URL, getImageUrl } from '../../utils/api';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));

const AdminBidChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const bottomRef = useRef(null);

  /* ── fetch bid meta ── */
  useEffect(() => {
    const fetchBid = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/v1/bids/${id}/bidders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBid(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [id]);

  /* ── fetch chat messages ── */
  useEffect(() => {
    const fetchChat = async () => {
      setChatLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/v1/chats/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setChatLoading(false);
      }
    };
    fetchChat();
  }, [id]);

  /* ── socket: live messages ── */
  useEffect(() => {
    socket.emit('joinBid', id);
    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.emit('leaveBid', id);
      socket.off('newMessage', handleNewMessage);
    };
  }, [id]);

  /* ── auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── helpers ── */
  const isProMsg = (msg) => msg.role === 'pro' || msg.senderRole === 'pro';

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ── group messages by date ── */
  const grouped = messages.reduce((acc, msg) => {
    const day = formatDate(msg.timestamp || msg.createdAt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  /* ── render message bubble ── */
  const renderBubble = (msg, idx) => {
    const isPro = isProMsg(msg);
    const senderName = msg.senderName || (isPro ? 'Booster' : 'Customer');
    const senderRole = isPro ? 'Pro / Booster' : 'Customer';
    const roleColor = isPro ? 'text-primary' : 'text-blue-400';
    const bubbleBase = isPro
      ? 'bg-primary/10 border border-primary/20'
      : 'bg-white/[0.05] border border-white/10';
    const align = isPro ? 'items-start' : 'items-end';
    const roundedCorner = isPro ? 'rounded-tl-none' : 'rounded-tr-none';

    return (
      <div key={idx} className={`flex flex-col ${align} gap-1.5 max-w-[72%] ${isPro ? 'mr-auto' : 'ml-auto'}`}>
        {/* Name + Role badge */}
        <div className={`flex items-center gap-2 px-1 ${isPro ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-primary/20' : 'bg-blue-500/20'}`}>
            <User size={14} className={roleColor} />
          </div>
          <span className={`text-[10px] font-black tracking-wide ${roleColor}`}>{senderName}</span>
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{senderRole}</span>
        </div>

        {/* Bubble */}
        <div className={`px-5 py-4 rounded-2xl ${roundedCorner} ${bubbleBase} w-full`}>
          {/* Text */}
          {(msg.type === 'text' || !msg.type) && (
            <p className="text-sm font-medium text-white leading-relaxed break-words">{msg.message || msg.text}</p>
          )}

          {/* Image */}
          {msg.type === 'image' && msg.attachment && (
            <div className="space-y-2">
              <div
                className="rounded-xl overflow-hidden border border-white/10 cursor-zoom-in group/img relative"
                onClick={() => window.open(getImageUrl(msg.attachment.url), '_blank')}
              >
                <img
                  src={getImageUrl(msg.attachment.url)}
                  className="max-w-full h-auto max-h-64 object-contain transition-transform duration-500 group-hover/img:scale-[1.02]"
                  alt="Shared"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                  <ExternalLink size={20} className="text-white" />
                </div>
              </div>
              {msg.message && <p className="text-[11px] text-white/50 italic">{msg.message}</p>}
            </div>
          )}

          {/* Video */}
          {msg.type === 'video' && msg.attachment && (
            <div className="space-y-2">
              <video
                src={getImageUrl(msg.attachment.url)}
                controls
                className="max-w-full rounded-xl border border-white/10 max-h-56"
              />
              {msg.message && <p className="text-[11px] text-white/50 italic">{msg.message}</p>}
            </div>
          )}

          {/* File */}
          {msg.type === 'file' && msg.attachment && (
            <div
              className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => window.open(getImageUrl(msg.attachment.url), '_blank')}
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">{msg.attachment.name}</p>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  {msg.attachment.size ? `${(msg.attachment.size / 1024).toFixed(1)} KB` : 'File'} • Open to View
                </p>
              </div>
              <ExternalLink size={14} className="text-white/40 shrink-0" />
            </div>
          )}

          {/* Timestamp */}
          <div className={`mt-2 flex ${isPro ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">
              {formatTime(msg.timestamp || msg.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ── loading ── */
  if (loading) {
    return (
      <AdminLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const service = bid?.orderId?.serviceId;
  const customer = bid?.orderId?.userId;
  const booster = bid?.assignedUser;

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] gap-0">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 shrink-0">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all group shrink-0"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center p-3 shrink-0">
              <img src={getImageUrl(service?.icon || service?.image)} className="w-full h-full object-contain" alt="" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                  Communication Monitor
                </span>
                <span className="text-[10px] font-bold text-white/30">ORD-#{bid?.orderId?._id?.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{service?.title || 'Bid Chat'}</h2>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-4">
            {/* Booster */}
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-5 py-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
                {booster?.avatar
                  ? <img src={getImageUrl(booster.avatar)} className="w-full h-full object-cover" alt="" />
                  : <User size={16} className="text-primary" />}
              </div>
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Booster</p>
                <p className="text-[11px] font-black text-white">{booster?.name || 'Not Assigned'}</p>
              </div>
            </div>
            {/* Customer */}
            <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl px-5 py-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0">
                {customer?.avatar
                  ? <img src={getImageUrl(customer.avatar)} className="w-full h-full object-cover" alt="" />
                  : <User size={16} className="text-blue-400" />}
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Customer</p>
                <p className="text-[11px] font-black text-white">{customer?.name || 'Customer'}</p>
              </div>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        {/* ── Chat Window ── */}
        <div className="flex-1 bg-[#080808] border border-white/8 rounded-[40px] overflow-hidden flex flex-col shadow-2xl min-h-0">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.01] shrink-0">
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Admin Read-Only Monitor</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-wider">Booster — Left</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Customer — Right</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar bg-gradient-to-b from-black/30 to-black/10">
            {chatLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-black tracking-widest uppercase">Loading transmissions...</p>
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                <MessageSquare size={48} />
                <p className="text-[10px] font-black tracking-widest uppercase">No messages yet</p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, msgs]) => (
                <div key={date} className="space-y-6">
                  {/* Date separator */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] px-3">{date}</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="space-y-5">
                    {msgs.map((msg, idx) => renderBubble(msg, `${date}-${idx}`))}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Bottom read-only notice */}
          <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] shrink-0">
            <div className="flex items-center justify-center gap-3 opacity-30">
              <ShieldCheck size={12} className="text-primary" />
              <p className="text-[9px] font-black uppercase tracking-widest">Admin view is read-only — no messages can be sent</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBidChat;
