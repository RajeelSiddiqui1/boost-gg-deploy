import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

const socket = io(API_URL.replace('/api/v1', ''));

// Sound notification
const playPing = () => {
    // A more substantial, 3-4 second style notification sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3');
    audio.volume = 0.8; // Make it loud
    audio.play().catch(e => console.log('Audio play failed', e));
};

const SupportWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef();

    // Guest ID for anonymous chat
    const [guestId] = useState(() => {
        const existing = localStorage.getItem('chat_guest_id');
        if (existing) return existing;
        const newId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_guest_id', newId);
        return newId;
    });

    useEffect(() => {
        // Do not render for admins
        if (user?.role === 'admin') return;

        // Initiate if chat is open and no conversation exists
        if (isOpen && !conversation) {
            initiateSupportChat();
        }
    }, [isOpen, user, conversation]);

    // 👂 Listen for external trigger (from "Live Chat" buttons across the site)
    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener('openSupportChat', handler);
        return () => window.removeEventListener('openSupportChat', handler);
    }, []);

    useEffect(() => {
        if (!conversation) return;

        const handleNewSupportMessage = (msg) => {
            if (msg.conversationId === conversation._id) {
                setMessages(prev => {
                    const isDuplicate = prev.some(m => m._id === msg._id || (m.timestamp === msg.timestamp && m.text === msg.text));
                    if (isDuplicate) return prev;

                    // Play sound if message is not from self
                    const isMe = user
                        ? (msg.sender?._id === user.id)
                        : (msg.senderGuestId === guestId);

                    if (!isMe) {
                        playPing();
                    }

                    return [...prev, msg];
                });
            }
        };

        socket.on('newSupportMessage', handleNewSupportMessage);

        return () => {
            socket.off('newSupportMessage', handleNewSupportMessage);
        };
    }, [conversation, user, guestId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const initiateSupportChat = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Create or get conversation
            const res = await axios.post(`${API_URL}/api/v1/support/conversations`, { guestId }, { headers });
            const conv = res.data.data;
            setConversation(conv);
            socket.emit('joinSupport', conv._id);

            // Fetch history
            if (token && !conv.isGuest) {
                const msgRes = await axios.get(`${API_URL}/api/v1/support/conversations/${conv._id}/messages`, { headers });
                setMessages(msgRes.data.data);
            } else if (conv.isGuest) {
                // Regular GET for guests (no token/auth header needed for guest history in current implementation)
                const msgRes = await axios.get(`${API_URL}/api/v1/support/conversations/${conv._id}/messages`);
                setMessages(msgRes.data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(`${API_URL}/api/v1/support/conversations/${conversation._id}/messages`, {
                text: newMessage,
                guestId: !user ? guestId : undefined
            }, { headers });

            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    // If user is logged in AND is an admin, hide it. Admins have the /admin/chat page.
    if (user?.role === 'admin') return null;

    return (
        <>
            {/* Widget Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-[0_0_30px_rgba(162,230,62,0.3)] flex items-center justify-center text-black hover:scale-105 transition-transform z-50 group"
                >
                    <MessageSquare className="w-7 h-7 group-hover:animate-pulse" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-[400px] h-[600px] max-h-[calc(100vh-100px)] bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 font-['Outfit']">

                    {/* Header */}
                    <div className="h-20 bg-gradient-to-r from-primary/20 to-black border-b border-primary/20 flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase text-white tracking-widest">Support</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Online 24/7</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-black/40">
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-2xl border border-white/5 mb-4">
                                <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(162,230,62,0.5)]" />
                            </div>
                            <h4 className="text-sm font-black italic uppercase text-white">BoostGG Support</h4>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2 px-4 leading-relaxed">
                                Our support team typically replies in under 5 minutes.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = user
                                    ? msg.sender?._id === user.id
                                    : (msg.senderGuestId === guestId || msg.senderGuestId?.startsWith('guest_'));
                                const isAdmin = msg.sender?.role === 'admin';

                                return (
                                    <div key={msg._id || i} className={`flex max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                        <div className={`space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                            {!isMe && (
                                                <div className="flex items-center gap-2 mb-1 px-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-primary' : 'text-white/40'}`}>
                                                        {isAdmin ? 'Support Team' : msg.sender?.name}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-white/20">
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`px-5 py-3.5 text-xs font-bold tracking-wide leading-relaxed shadow-lg
                                                ${isMe
                                                    ? 'bg-primary text-black rounded-2xl rounded-tr-sm'
                                                    : 'bg-white/10 text-white rounded-2xl rounded-tl-sm border border-white/5'
                                                }
                                            `}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input - Show for all users */}
                    <form onSubmit={handleSend} className="p-4 bg-[#0A0A0A] border-t border-white/5 flex gap-3 shrink-0">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-1 bg-white/5 border border-white/5 focus:border-primary/30 rounded-xl px-4 text-xs font-bold text-white outline-none placeholder:text-white/20 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || loading}
                            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black hover:bg-[#722AEE] hover:text-white transition-all disabled:opacity-50 active:scale-95 shrink-0"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default SupportWidget;
