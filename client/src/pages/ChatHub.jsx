import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    MessageSquare, Send, Search, Filter, 
    MoreVertical, ChevronLeft, Zap, 
    ShieldCheck, Clock, User, Check,
    Monitor, Globe, ExternalLink, Image as ImageIcon,
    ArrowLeft, MoreHorizontal, Paperclip, Smile,
    Trash2, Download, Play, FileText, X
} from 'lucide-react';
import { API_URL, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const socket = io(API_URL.replace('/api/v1', ''));

const ChatHub = () => {
    const { orderId: paramOrderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const toast = useToast();

    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef();
    const fileInputRef = useRef();

    const isPro = user?.role === 'pro' || user?.role === 'admin';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const endpoint = isPro ? '/api/v1/orders/booster' : '/api/v1/orders/me';
                const res = await axios.get(`${API_URL}${endpoint}`);
                const activeOnes = res.data.data.filter(o => ['pending', 'processing', 'completed'].includes(o.status));
                setOrders(activeOnes);
                setLoading(false);

                if (!paramOrderId && activeOnes.length > 0) {
                    navigate(`/pro/chat/${activeOnes[0]._id}`, { replace: true });
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [paramOrderId, navigate, isPro, user]);

    useEffect(() => {
        if (!paramOrderId) return;

        const fetchOrderDetails = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/orders/${paramOrderId}`);
                setActiveOrder(res.data.data);
                setMessages(res.data.data.chat || []);
                socket.emit('joinOrder', paramOrderId);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrderDetails();

        const handleNewMessage = (newMsg) => {
            setMessages(prev => {
                const isDuplicate = prev.some(m => m.timestamp === newMsg.timestamp && m.message === newMsg.message);
                if (isDuplicate) return prev;
                return [...prev, newMsg];
            });
        };

        const handleMessageDeleted = (messageId) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageDeleted', handleMessageDeleted);

        return () => {
            socket.emit('leaveOrder', paramOrderId);
            socket.off('newMessage', handleNewMessage);
            socket.off('messageDeleted', handleMessageDeleted);
        };
    }, [paramOrderId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !paramOrderId) return;

        try {
            await axios.post(`${API_URL}/api/v1/orders/${paramOrderId}/chat`, {
                message: newMessage,
                type: 'text'
            });
            setNewMessage('');
            setShowEmojiPicker(false);
        } catch (err) {
            console.error(err);
            toast.error("Transmission failed");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !paramOrderId) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await axios.post(`${API_URL}/api/v1/orders/${paramOrderId}/chat/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileData = res.data.data;
            await axios.post(`${API_URL}/api/v1/orders/${paramOrderId}/chat`, {
                message: `Sent a ${fileData.type}`,
                type: fileData.type,
                attachment: fileData
            });

            toast.success("File uploaded and transmitted");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => 
            (o.serviceId?.title || o.offer?.title)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (isPro ? o.userId?.name : (o.pro?.name || 'Searching'))?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o._id.includes(searchQuery)
        );
    }, [orders, searchQuery, isPro]);

    const renderMessageContent = (msg) => {
        if (msg.type === 'text') return msg.message;

        const { attachment } = msg;
        if (!attachment) return msg.message;

        if (msg.type === 'image') {
            return (
                <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src={getImageUrl(attachment.url)} className="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-500" alt={attachment.name} onClick={() => window.open(getImageUrl(attachment.url), '_blank')} />
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold text-white/40 truncate max-w-[150px]">{attachment.name}</span>
                        <a href={getImageUrl(attachment.url)} download className="text-primary hover:text-white transition-colors"><Download size={14}/></a>
                    </div>
                </div>
            );
        }

        if (msg.type === 'video') {
            return (
                <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <video controls className="max-w-full h-auto">
                            <source src={getImageUrl(attachment.url)} type={attachment.mimeType} />
                        </video>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Play size={12} className="text-primary" />
                            <span className="text-[10px] font-bold text-white/40 truncate max-w-[150px]">{attachment.name}</span>
                        </div>
                        <a href={getImageUrl(attachment.url)} download className="text-primary hover:text-white transition-colors"><Download size={14}/></a>
                    </div>
                </div>
            );
        }

        if (msg.type === 'pdf') {
            return (
                <div className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl border border-white/10 hover:border-primary/40 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                        <FileText size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-white truncate">{attachment.name}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{(attachment.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                    </div>
                    <a 
                        href={getImageUrl(attachment.url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-primary hover:text-black transition-all"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            );
        }

        return msg.message;
    };

    return (
        <div className="fixed inset-0 bg-[#070707] flex flex-col z-[100] animate-in fade-in duration-500 overflow-hidden">
            
            <header className="h-20 bg-[#0F0F0F] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(isPro ? '/pro/dashboard' : '/dashboard')}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-sm font-black uppercase text-white tracking-[0.2em] flex items-center gap-3">
                            <span className="text-primary"><ShieldCheck size={16} /></span>
                            Operational Comms
                        </h2>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Secure Encryption • End-to-End</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-[10px] font-black text-white/40 uppercase">{user?.name}</span>
                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{user?.role} ACCESS ENABLED</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary uppercase">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="w-full md:w-96 flex flex-col bg-[#0A0A0A] border-r border-white/5 shrink-0">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative bg-[#111] border border-white/5 rounded-2xl flex items-center px-5 focus-within:border-primary/50 transition-all">
                                <Search className="w-4 h-4 text-white/20" />
                                <input 
                                    type="text"
                                    placeholder="Search Registry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent py-4 px-4 text-xs font-bold text-white outline-none placeholder:text-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                        {loading ? (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Scanning Registry...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-12 text-center opacity-10">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No active channels</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-1" style={{ scrollbarGutter: 'stable' }}>
                                {filteredOrders.map(order => {
                                    const isActive = order._id === paramOrderId;
                                    const lastMsg = order.chat?.[order.chat.length - 1];
                                    const service = order.serviceId || order.offer;
                                    const contactName = isPro ? order.userId?.name : (order.pro?.name || 'Searching...');
                                    
                                    return (
                                        <div 
                                            key={order._id}
                                            onClick={() => navigate(`/pro/chat/${order._id}`)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group ${
                                                isActive 
                                                    ? 'bg-primary text-black shadow-[0_10px_30px_rgba(162,230,62,0.1)]' 
                                                    : 'hover:bg-white/5 text-white'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 shrink-0 border ${isActive ? 'bg-black/10 border-black/10' : 'bg-[#111] border-white/5'}`}>
                                                <img src={getImageUrl(service?.icon || service?.image)} className="w-full h-full object-contain" alt="" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-[11px] font-black uppercase tracking-tighter truncate">{contactName}</p>
                                                    {lastMsg && <span className={`text-[8px] font-bold opacity-30`}>{format(new Date(lastMsg.timestamp), 'HH:mm')}</span>}
                                                </div>
                                                <p className={`text-[10px] font-bold truncate opacity-50`}>
                                                    {lastMsg ? lastMsg.message : `ID: #${order._id.slice(-6).toUpperCase()}`}
                                                </p>
                                            </div>
                                            {!isActive && order.status === 'processing' && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#070707] relative overflow-hidden">
                    {!paramOrderId || !activeOrder ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
                                <div className="relative w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                    <MessageSquare size={56} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black uppercase text-white tracking-tighter mb-4">Select a Transmission</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                                Initialize a secure link to begin mission communication
                            </p>
                        </div>
                    ) : (
                        <>
                            <header className="h-20 px-10 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-20">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center p-2">
                                            <img 
                                                src={getImageUrl(activeOrder.serviceId?.icon || activeOrder.serviceId?.image || activeOrder.offer?.image)} 
                                                className="w-full h-full object-contain" 
                                                alt="" 
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#0A0A0A]"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-base font-black uppercase text-white tracking-tight">
                                                {isPro ? activeOrder.userId?.name : (activeOrder.pro?.name || 'Awaiting Specialist')}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[8px] font-black text-primary uppercase tracking-widest">
                                                {activeOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                                            <span className="flex items-center gap-1.5"><Zap size={12} className="text-primary" /> {(activeOrder.serviceId || activeOrder.offer)?.title}</span>
                                            <span className="opacity-40">•</span>
                                            <span className="flex items-center gap-1.5"><Monitor size={12} /> {activeOrder.platform}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:bg-white/10 hover:text-white transition-all">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            </header>

                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-10 py-12 space-y-10 custom-scrollbar relative bg-[radial-gradient(circle_at_50%_0%,rgba(162,230,62,0.05),transparent)]"
                            >
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-20">
                                        <Zap size={64} className="mb-6 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting First Transmission</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {messages.map((msg, i) => {
                                            const isMe = msg.sender === user?._id;
                                            return (
                                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                                    <div className={`max-w-[65%] group relative`}>
                                                        <div className={`px-7 py-5 rounded-[28px] text-[15px] font-medium leading-relaxed ${isMe
                                                            ? 'bg-primary text-black rounded-tr-none shadow-[0_15px_40px_rgba(162,230,62,0.15)]'
                                                            : 'bg-[#151515] text-white/90 border border-white/5 rounded-tl-none'
                                                        }`}>
                                                            {renderMessageContent(msg)}
                                                        </div>
                                                        <div className={`mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                                                {isMe ? 'Operator' : (isPro ? 'Client' : 'Specialist')}
                                                            </span>
                                                            <span className="text-[8px] font-bold text-white/10">•</span>
                                                            <span className="text-[9px] font-black tracking-widest text-white/20">
                                                                {format(new Date(msg.timestamp), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="px-10 py-10 bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/5 relative z-20 shrink-0">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full right-10 mb-4 z-[100] animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="relative">
                                            <button onClick={() => setShowEmojiPicker(false)} className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black z-10 shadow-lg"><X size={16}/></button>
                                            <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} searchDisabled />
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSend} className="relative max-w-5xl mx-auto flex items-end gap-6 bg-[#111] border border-white/10 rounded-[35px] p-3 pl-8 focus-within:border-primary/50 transition-all shadow-2xl">
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf" />
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white/20 hover:bg-white/5 hover:text-primary transition-all shrink-0 ${isUploading ? 'animate-pulse' : ''}`}
                                    >
                                        <Paperclip size={20} />
                                    </button>

                                    <div className="flex-1 py-4 flex flex-col min-h-[56px]">
                                        <textarea
                                            placeholder={isUploading ? "Uploading file..." : "Type mission transmission..."}
                                            value={newMessage}
                                            disabled={isUploading}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                e.target.style.height = 'inherit';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                            className="bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/10 resize-none max-h-32 custom-scrollbar"
                                            rows={1}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-1">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white/20 hover:text-white transition-all"
                                        >
                                            <Smile size={22}/>
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-14 h-14 bg-primary hover:bg-white text-black rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(162,230,62,0.3)] active:scale-90 shrink-0"
                                        >
                                            <Send size={24} className="ml-1" />
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-6 flex items-center justify-center gap-8 text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">
                                    <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary/40"/> E2E ENCRYPTED</span>
                                    <span className="flex items-center gap-2"><Check size={12}/> DELIVERED</span>
                                    <span>AUTHORIZED COMMS ONLY</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(162, 230, 62, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(162, 230, 62, 0.3);
                }
            `}</style>
        </div>
    );
};

export default ChatHub;
