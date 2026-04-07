import React, { useState, useEffect, useRef } from 'react';
import {
    Send, X, MessageSquare,
    User as UserIcon, Zap, ShieldCheck,
    Clock, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const socket = io(API_URL.replace('/api/v1', '')); // Connect to root domain

const OrderChat = ({ orderId, isOpen, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/orders/${orderId}`);
                setMessages(res.data.data.chat || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();

        // Socket logic
        socket.emit('joinOrder', orderId);

        const handleNewMessage = (newMsg) => {
            setMessages(prev => {
                // Prevent duplicate if already added by handleSend
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
            setMessages(res.data.data.chat);
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 font-['Outfit']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-[600px] h-[700px] bg-[#0A0A0A] border border-white/10 rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase text-white tracking-widest">Order Chat</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 fill-primary text-primary" />
                                Secured by BoostGG
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-white/30 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages Hub */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                            <Clock className="w-12 h-12" />
                            <p className="text-xs font-black uppercase tracking-widest">Start the conversation</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender === user?._id;
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] space-y-2`}>
                                        <div className={`px-5 py-4 rounded-[24px] text-sm font-bold leading-relaxed ${isMe
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white/[0.03] text-white/80 border border-white/5 rounded-tl-none'
                                            }`}>
                                            {msg.message}
                                        </div>
                                        <p className={`text-[8px] font-black uppercase tracking-widest text-white/20 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {format(new Date(msg.timestamp), 'h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-full py-5 pl-8 pr-20 text-sm font-bold text-white focus:border-primary/50 transition-all outline-none placeholder:text-white/10"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-6 bg-primary hover:bg-[#8cc63e] text-black rounded-full flex items-center justify-center transition-all active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <p className="mt-4 text-[9px] font-black italic text-center text-white/10 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        Don't share sensitive data or boost outside the platform
                    </p>
                </div>
            </div>

            <style>{`
                .scroll-smooth::-webkit-scrollbar {
                    width: 4px;
                }
                .scroll-smooth::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scroll-smooth::-webkit-scrollbar-thumb {
                    background: rgba(162, 230, 62, 0.2);
                    border-radius: 10px;
                }
                .scroll-smooth::-webkit-scrollbar-thumb:hover {
                    background: rgba(162, 230, 62, 0.4);
                }
            `}</style>
        </div>
    );
};

export default OrderChat;
