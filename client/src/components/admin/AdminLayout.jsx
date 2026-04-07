import React, { useRef, useEffect, useState } from 'react';
import {
    Users,
    ShoppingCart,
    Wallet,
    Gamepad2,
    MessageSquare,
    Settings,
    Star,
    BookOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    FileText,
    Tag,
    Layers,
    DollarSign,
    Shield,
    Wrench,
    Plus,
    Briefcase
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { io } from 'socket.io-client';

const adminSocket = io(API_URL.replace('/api/v1', ''), { autoConnect: false });

const playPing = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => { });
};

const AdminLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const scrollContainerRef = useRef(null);

    // 🔔 Global notification state
    const [chatNotif, setChatNotif] = React.useState(null); // { senderName, text }
    const [hoveredItem, setHoveredItem] = useState(null);
    const notifTimer = useRef(null);

    // 🔔 Global admin socket listener — fires on every admin page
    useEffect(() => {
        if (user?.role !== 'admin') return;

        adminSocket.connect();
        adminSocket.emit('joinAdmins');

        const handleMsg = (msg) => {
            // Only alert if message is NOT from the admin themselves
            const isFromMe = msg.sender?._id?.toString() === user?.id?.toString() || msg.sender?.role === 'admin';

            if (isFromMe) return;

            playPing();
            const senderName = msg.sender?.name || 'Guest User';
            setChatNotif({ senderName, text: msg.text?.substring(0, 80) });
            clearTimeout(notifTimer.current);
            notifTimer.current = setTimeout(() => setChatNotif(null), 6000);
        };

        adminSocket.on('newSupportMessage', handleMsg);

        return () => {
            adminSocket.off('newSupportMessage', handleMsg);
            adminSocket.disconnect();
            clearTimeout(notifTimer.current);
        };
    }, [user]);

    // Scroll to top on route change within admin
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [location.pathname]);

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', desc: 'Site overview, analytics, and recent activity.' },
        { label: 'User Management', icon: Users, path: '/admin/users', desc: 'Manage registered users, roles, and permissions.' },
        { label: 'Pro Applications', icon: Briefcase, path: '/admin/pro-applications', desc: 'Review and approve Booster/Seller applications.' },
        { label: 'Game Management', icon: Gamepad2, path: '/admin/games', desc: 'Configure supported games and their assets.' },
        { label: 'Categories', icon: Layers, path: '/admin/categories', desc: 'Organize services into logical game categories.' },
        { label: 'Services', icon: Wrench, path: '/admin/services', desc: 'Create and price specific boosting services.' },
        { label: 'Sections', icon: FileText, path: '/admin/sections', desc: 'Build dynamic forms for service pages.' },
        { label: 'Currency', icon: DollarSign, path: '/admin/currency', desc: 'Manage exchange rates and payment currencies.' },
        { label: 'Accounts', icon: Shield, path: '/admin/accounts', desc: 'Manage game accounts listed for sale.' },
        { label: 'Offers', icon: ShoppingCart, path: '/admin/offers', desc: 'Configure "Hot Now" deals and special offers.' },
        { label: 'Orders', icon: ShoppingCart, path: '/admin/orders', desc: 'Track and manage customer order fulfillment.' },
        { label: 'Chat Support', icon: MessageSquare, path: '/admin/chat', desc: 'Direct message center for user support.' },
        { label: 'Finance', icon: Wallet, path: '/admin/finance', desc: 'Monitor transactions and site revenue.' },
        { label: 'Reviews', icon: Star, path: '/admin/reviews', desc: 'Moderate and manage customer testimonials.' },
        { label: 'Blog / Guides', icon: BookOpen, path: '/admin/blogs', desc: 'Manage articles, news, and gaming guides.' },
        { label: 'Promo Codes', icon: Tag, path: '/admin/promo', desc: 'Create and track discount coupon codes.' },
        { label: 'System Settings', icon: Settings, path: '/admin/settings', desc: 'Global site configuration and SEO.' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-black text-white font-['Outfit'] flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-[280px] bg-[#0A0A0A] border-r border-white/5 z-[101] transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:block
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <Link to="/admin" className="flex items-center gap-2 mb-10 px-2" onClick={() => setIsSidebarOpen(false)}>
                        <span className="text-2xl font-black italic tracking-tighter text-white uppercase">
                            BOOSTGG <span className="text-primary text-xs not-italic tracking-widest ml-1">ADMIN</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-4 flex-1 overflow-y-auto custom-scrollbar relative">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 px-4">Management</h2>
                        <nav className="space-y-2">
                            {menuItems.map((item, i) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={i}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm admin-nav-link
                                            ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-white/40 hover:bg-white/[0.05] hover:text-white'}
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-inherit'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Footer / User Area */}
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4 px-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div>
                                <p className="text-sm font-black italic">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#0A0A0A]/50 backdrop-blur-md z-50">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 -ml-2 hover:bg-white/5 rounded-xl lg:hidden text-white/60"
                            onClick={toggleSidebar}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-sm font-black italic uppercase tracking-tighter text-white/40">BoostGG Central Control</h2>
                            <div className="flex items-center gap-6 mt-1">
                                <p className="text-xl font-black italic text-white uppercase leading-none">
                                    {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                                </p>

                                {/* Top-level Mode Switcher */}
                                {['/admin/services', '/admin/currency', '/admin/accounts'].includes(location.pathname) && (
                                    <div className="hidden md:flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1 ml-4">
                                        <Link
                                            to="/admin/services"
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/admin/services' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Services
                                        </Link>
                                        <Link
                                            to="/admin/currency"
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/admin/currency' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Currency
                                        </Link>
                                        <Link
                                            to="/admin/accounts"
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === '/admin/accounts' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                                        >
                                            Accounts
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all text-white/60 hover:text-white">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-6 lg:p-10"
                >
                    {children}
                </div>
            </main>

            {/* ℹ️ Global Info Box - Shows on Sidebar Hover */}
            {hoveredItem && (
                <div
                    className="fixed top-24 right-10 z-[200] w-72 bg-[#0A0A0A]/90 backdrop-blur-xl border border-primary/30 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 pointer-events-none"
                    style={{ borderLeft: '6px solid #a2e63e' }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                            <hoveredItem.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{hoveredItem.label}</h4>
                    </div>
                    <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Module Description</p>
                    <p className="text-xs text-white/70 leading-relaxed italic">"{hoveredItem.desc}"</p>
                    <div className="mt-6 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">System Ready</span>
                    </div>
                </div>
            )}

            {/* 🔔 Global Chat Notification Toast */}
            {chatNotif && (
                <div
                    onClick={() => { navigate('/admin/chat'); setChatNotif(null); }}
                    className="fixed bottom-6 right-6 z-[200] flex items-start gap-4 bg-[#0f0f0f] border border-primary/40 rounded-2xl shadow-[0_0_40px_rgba(162,230,62,0.15)] p-4 cursor-pointer hover:border-primary transition-all max-w-xs animate-bounce-in"
                    style={{ animation: 'slideInRight 0.3s ease' }}
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">New Message</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setChatNotif(null); }}
                                className="text-white/30 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-xs font-black text-white truncate">{chatNotif.senderName}</p>
                        <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2">{chatNotif.text}</p>
                        <p className="text-[9px] text-primary/70 font-bold mt-1 uppercase tracking-widest">Click to open chat →</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .admin-nav-link {
                    position: relative;
                }

                .admin-nav-link {
                    position: relative;
                }

                /* Ensure the sidebar doesn't clip the tooltips */
                aside {
                    overflow: visible !important;
                }
                aside > div {
                    overflow: visible !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
