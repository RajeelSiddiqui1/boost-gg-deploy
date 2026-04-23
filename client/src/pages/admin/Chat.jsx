import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { io } from 'socket.io-client';
import {
 MessageSquare, Send, User as UserIcon,
 Clock, ShieldCheck, CheckCircle2,
 Search, Phone, Video, MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const socket = io(API_URL.replace('/api/v1', ''));

// Sound notification
const playPing = () => {
 // A more substantial, 3-4 second style notification sound
 const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3');
 audio.volume = 0.8; // Make it loud
 audio.play().catch(e => console.log('Audio play failed', e));
};

const AdminChat = () => {
 const { user } = useAuth();
 const [conversations, setConversations] = useState([]);
 const [selectedConversation, setSelectedConversation] = useState(null);
 const [messages, setMessages] = useState([]);
 const [newMessage, setNewMessage] = useState('');
 const [loading, setLoading] = useState(true);
 const scrollRef = useRef();

 useEffect(() => {
 fetchConversations();

 // Join global admin room to see all messages (including guests)
 socket.emit('joinAdmins');

 const handleNewSupportMessage = (msg) => {
 // Play sound if message is not from self (Admin perspective)
 const isMe = msg.sender?._id?.toString() === user?.id?.toString();

 if (!isMe) {
 playPing();
 }

 setConversations(prev => {
 const existingIndex = prev.findIndex(conv => conv._id === msg.conversationId);

 if (existingIndex !== -1) {
 // Update existing
 const updated = [...prev];
 updated[existingIndex] = {
 ...updated[existingIndex],
 lastMessage: msg.text,
 updatedAt: new Date().toISOString()
 };
 return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
 } else if (msg.conversationId.startsWith('guest_') || msg.isGuest) {
 // Create virtual guest conversation for sidebar
 const virtualConv = {
 _id: msg.conversationId,
 participants: [msg.sender],
 lastMessage: msg.text,
 updatedAt: new Date().toISOString(),
 createdAt: new Date().toISOString(),
 status: 'open',
 isGuest: true
 };
 return [virtualConv, ...prev];
 }
 return prev;
 });

 // If the message belongs to the currently selected conversation, append it
 if (selectedConversation && selectedConversation._id === msg.conversationId) {
 setMessages(currentMessages => {
 const isDuplicate = currentMessages.some(m => m._id === msg._id || (m.timestamp === msg.timestamp && m.text === msg.text));
 if (isDuplicate) return currentMessages;
 return [...currentMessages, msg];
 });
 }
 };

 socket.on('newSupportMessage', handleNewSupportMessage);

 return () => {
 socket.off('newSupportMessage', handleNewSupportMessage);
 };
 }, [selectedConversation]);

 const fetchConversations = async () => {
 try {
 const res = await axios.get(`${API_URL}/api/v1/support/conversations`, {
 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
 });
 setConversations(res.data.data);
 setLoading(false);
 } catch (err) {
 console.error(err);
 setLoading(false);
 }
 };

 const handleSelectConversation = async (conv) => {
 // Leave previous room if any
 if (selectedConversation) {
 socket.emit('leaveSupport', selectedConversation._id);
 }

 setSelectedConversation(conv);
 socket.emit('joinSupport', conv._id);

 try {
 const res = await axios.get(`${API_URL}/api/v1/support/conversations/${conv._id}/messages`, {
 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
 });
 setMessages(res.data.data);
 } catch (err) {
 console.error(err);
 }
 };

 useEffect(() => {
 if (scrollRef.current) {
 scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
 }
 }, [messages]);

 const handleSend = async (e) => {
 e.preventDefault();
 if (!newMessage.trim() || !selectedConversation) return;

 try {
 const res = await axios.post(`${API_URL}/api/v1/support/conversations/${selectedConversation._id}/messages`, {
 text: newMessage
 }, {
 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
 });

 // Note: the socket will broadcast this back to us, so we technically don't need to manually append 
 // unless we want instant optimistic UI. The socket listener will catch it.
 setNewMessage('');
 } catch (err) {
 console.error(err);
 }
 };

 // Helper to get the non-admin user in a conversation
 const getCustomer = (conv) => {
 if (conv.isGuest) return { name: conv.guestId || 'Guest User', role: 'guest' };
 return conv.participants.find(p => p.role !== 'admin') || (conv.participants[0] || { name: 'Unknown', role: 'user' });
 };

 return (
 <AdminLayout>
 <div className="flex h-[calc(100vh-140px)] bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden -mt-4">

 {/* Left Sidebar - Conversation List */}
 <div className="w-[350px] border-r border-white/5 flex flex-col bg-black/20">
 <div className="p-6 border-b border-white/5 space-y-4">
 <div className="flex justify-between items-center">
 <h2 className="text-xl font-black uppercase">Messages</h2>
 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-xs font-black text-primary">
 {conversations.length}
 </div>
 </div>
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
 <input
 type="text"
 placeholder="Search conversations..."
 className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder:text-white/20 focus:border-primary/50 outline-none transition-all"
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {loading ? (
 <div className="p-6 text-center text-white/40 text-xs uppercase font-bold tracking-widest">Loading...</div>
 ) : conversations.length === 0 ? (
 <div className="p-6 text-center text-white/40 text-[10px] uppercase font-bold tracking-widest">No conversations yet</div>
 ) : (
 conversations.map(conv => {
 const customer = getCustomer(conv);
 const isSelected = selectedConversation?._id === conv._id;

 return (
 <div
 key={conv._id}
 onClick={() => handleSelectConversation(conv)}
 className={`p-4 border-b border-white/5 cursor-pointer transition-all flex gap-4
 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-white/[0.02]'}
 `}
 >
 <div className="relative">
 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
 {customer?.profileImage ? (
 <img src={customer.profileImage} alt="" className="w-full h-full object-cover" />
 ) : (
 <UserIcon className="w-5 h-5 text-white/40" />
 )}
 </div>
 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full"></div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-start mb-1">
 <h4 className={`text-xs font-black uppercase truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
 {customer?.name || 'Unknown User'}
 </h4>
 <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest shrink-0">
 {format(new Date(conv.updatedAt), 'HH:mm')}
 </span>
 </div>
 <p className="text-[10px] font-bold text-white/40 truncate tracking-wide">
 {conv.lastMessage || 'Started a conversation'}
 </p>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* Right Panel - Chat Area */}
 <div className="flex-1 flex flex-col bg-black/40">
 {selectedConversation ? (
 <>
 {/* Chat Header */}
 <div className="h-20 border-b border-white/5 flex justify-between items-center px-8 bg-black/50 backdrop-blur-md">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
 <UserIcon className="w-6 h-6 text-white/40" />
 </div>
 <div>
 <h3 className="text-sm font-black uppercase tracking-wider">
 {getCustomer(selectedConversation)?.name || 'User'}
 </h3>
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
 <span className="flex items-center gap-1 text-green-500">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
 </span>
 •
 <span className="flex items-center gap-1">
 <ShieldCheck className="w-3 h-3 text-primary" /> {getCustomer(selectedConversation)?.role || 'Customer'}
 </span>
 </div>
 </div>
 </div>
 <div className="flex gap-4">
 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
 <Phone className="w-4 h-4" />
 </button>
 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
 <Video className="w-4 h-4" />
 </button>
 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
 <MoreVertical className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Messages Area */}
 <div
 ref={scrollRef}
 className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
 >
 <div className="text-center pb-8 border-b border-white/5 mb-8">
 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chat Started</p>
 <p className="text-xs font-bold text-white/40 mt-2">{format(new Date(selectedConversation.createdAt), 'PPP')}</p>
 </div>

 {messages.map((msg, i) => {
 const isMe = msg.sender?._id === user.id;
 const showAvatar = i === 0 || messages[i - 1].sender?._id !== msg.sender?._id;

 return (
 <div key={msg._id || i} className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
 {showAvatar ? (
 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
 <span className="text-xs font-black uppercase text-white/50">
 {msg.sender?.name?.charAt(0) || msg.senderGuestId?.charAt(0) || '?'}
 </span>
 </div>
 ) : (
 <div className="w-10 shrink-0"></div> // Spacer
 )}

 <div className={`space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
 {showAvatar && (
 <div className="flex items-center gap-2 mb-1 px-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
 {msg.sender?.name || (msg.senderGuestId ? 'Guest User' : 'Unknown')}
 </span>
 <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
 {format(new Date(msg.createdAt), 'HH:mm')}
 </span>
 </div>
 )}
 <div className={`p-4 rounded-2xl text-sm font-bold tracking-wide leading-relaxed relative group
 ${isMe
 ? 'bg-primary text-black rounded-tr-sm'
 : 'bg-white/5 text-white/80 rounded-tl-sm border border-white/5'
 }
 `}>
 {msg.text}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Input Area */}
 <div className="p-6 bg-black/50 border-t border-white/5 flex gap-4 backdrop-blur-xl">
 <div className="flex-1 relative">
 <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
 <input
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
 placeholder="Type a message to the user..."
 className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-white outline-none transition-all placeholder:text-white/20 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
 />
 </div>
 <button
 onClick={handleSend}
 disabled={!newMessage.trim()}
 className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black hover:bg-[#722AEE] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
 >
 <Send className="w-5 h-5 ml-1" />
 </button>
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
 <MessageSquare className="w-10 h-10 text-white/20" />
 </div>
 <h2 className="text-2xl font-black uppercase text-white/60 mb-2">Select a Conversation</h2>
 <p className="text-white/30 text-xs font-bold uppercase tracking-widest max-w-[300px] leading-relaxed">
 Choose a user from the left sidebar to view their message history and reply to their support requests.
 </p>
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
};

export default AdminChat;
