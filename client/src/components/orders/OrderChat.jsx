import React, { useState, useEffect, useRef } from 'react';
import {
  Send, X, MessageSquare,
  User as UserIcon, Zap, ShieldCheck,
  Clock, RefreshCw, Paperclip, MoreVertical,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL, getImageUrl } from '../../utils/api';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', ''));

const OrderChat = ({ orderId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/orders/${orderId}`);
        setOrder(res.data.data);
        setMessages(res.data.data.chat || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    socket.emit('joinOrder', orderId);

    const handleNewMessage = (newMsg) => {
      setMessages(prev => {
        const isDuplicate = prev.some(m => m.timestamp === newMsg.timestamp && m.message === newMsg.message);
        if (isDuplicate) return prev;
        return [...prev, newMsg];
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.emit('leaveOrder', orderId);
      socket.off('newMessage', handleNewMessage);
    };
  }, [orderId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/v1/orders/${orderId}/chat`, {
        message: newMessage
      });
      // The socket event will update messages for everyone
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 font-['Outfit']">
      {/* Backdrop with aggressive blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>

      {/* Main Terminal Chat Container */}
      <div className="relative w-full max-w-[750px] h-[800px] max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        
        {/* Dynamic Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header - Glassmorphism style */}
        <div className="relative z-10 px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center p-3 overflow-hidden">
                {order?.serviceId?.icon ? (
                   <img src={getImageUrl(order.serviceId.icon)} className="w-full h-full object-contain" alt="" />
                ) : (
                   <MessageSquare className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0A0A0A]"></div>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight leading-none mb-2">
                Order Channel
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                  #{order?._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-primary/60" />
                  Secured Transaction
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 transition-all border border-white/5">
                <MoreVertical className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Messages Hub */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-10 py-10 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                <MessageSquare className="w-10 h-10 text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Encrypted Hub</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Awaiting first transmission...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
                {/* Date Divider */}
                <div className="flex items-center gap-6 opacity-20">
                    <div className="h-[1px] flex-1 bg-white"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">MISSION LOG</span>
                    <div className="h-[1px] flex-1 bg-white"></div>
                </div>

                {messages.map((msg, i) => {
                const isMe = msg.sender === user?._id;
                return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] space-y-3`}>
                            <div className={`relative group`}>
                                <div className={`px-7 py-5 rounded-[32px] text-[15px] font-bold leading-relaxed shadow-xl ${isMe
                                    ? 'bg-gradient-to-br from-primary to-[#8cc63e] text-black rounded-tr-none'
                                    : 'bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none backdrop-blur-md'
                                }`}>
                                    {msg.message}
                                </div>
                                <div className={`absolute -bottom-6 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                        {format(new Date(msg.timestamp), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] text-white/10 pt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                {isMe ? 'YOU' : 'CLIENT'} • {format(new Date(msg.timestamp), 'h:mm a')}
                            </p>
                        </div>
                    </div>
                );
                })}
            </div>
          )}
        </div>

        {/* Input Area - Tactical Style */}
        <div className="p-10 border-t border-white/5 bg-white/[0.01] relative z-20">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[40px] blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-4 bg-[#0A0A0A] border border-white/10 rounded-[35px] p-2 pl-8 focus-within:border-primary/50 transition-all">
                <input
                    type="text"
                    placeholder="Type encrypted message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent py-4 text-[15px] font-bold text-white outline-none placeholder:text-white/10"
                />
                
                <div className="flex items-center gap-2 pr-2">
                    <button type="button" className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-white/20 transition-all">
                        <Paperclip size={20} />
                    </button>
                    <button
                        type="submit"
                        className="w-14 h-14 bg-primary hover:bg-white text-black rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(162,230,62,0.3)] active:scale-90"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>P2P ENCRYPTION ACTIVE</span>
             </div>
             <div className="w-1 h-1 bg-white/20 rounded-full"></div>
             <span>SERVER TIME: {format(new Date(), 'HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scroll-smooth::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-smooth::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-smooth::-webkit-scrollbar-thumb {
          background: rgba(162, 230, 62, 0.1);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .scroll-smooth::-webkit-scrollbar-thumb:hover {
          background: rgba(162, 230, 62, 0.3);
        }
      `}</style>
    </div>
  );
};

export default OrderChat;
