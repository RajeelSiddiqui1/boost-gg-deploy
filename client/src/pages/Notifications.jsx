import React, { useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/admin/AdminLayout';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    Bell, CheckCircle, Clock, ExternalLink, 
    Trash2, MailOpen, Tag, DollarSign, Package,
    ShieldAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const Notifications = () => {
    const { user } = useAuth();
    const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'booster_bid': return <Tag className="w-5 h-5 text-primary" />;
            case 'bid_created': return <Bell className="w-5 h-5 text-primary" />;
            case 'order_update': return <Package className="w-5 h-5 text-blue-500" />;
            case 'payout': return <DollarSign className="w-5 h-5 text-green-500" />;
            case 'system': return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
            default: return <Bell className="w-5 h-5 text-white/40" />;
        }
    };

    const getCategories = () => {
        const base = [{ id: 'all', label: 'All Intelligence', icon: <Bell size={14} /> }];
        if (user?.role === 'admin') {
            return [
                ...base,
                { id: 'booster_bid', label: 'Booster Bids', icon: <Tag size={14} /> },
                { id: 'payout', label: 'Finance', icon: <DollarSign size={14} /> },
                { id: 'system', label: 'System', icon: <ShieldAlert size={14} /> }
            ];
        }
        if (user?.role === 'pro') {
            return [
                ...base,
                { id: 'bid_created', label: 'Job Alerts', icon: <Package size={14} /> },
                { id: 'payout', label: 'Earnings', icon: <DollarSign size={14} /> }
            ];
        }
        return [
            ...base,
            { id: 'order_update', label: 'Order Updates', icon: <Package size={14} /> }
        ];
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => n.type === filter);

    const Layout = user?.role === 'admin' ? AdminLayout : DashboardLayout;

    return (
        <Layout title="Intel Center">
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Alert Matrix</h2>
                        <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mt-4">Real-time operational stream for {user?.role} clearance</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllAsRead}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest shadow-2xl"
                        >
                            <MailOpen className="w-4 h-4" />
                            Purge Unread
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {getCategories().map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                ${filter === cat.id 
                                    ? 'bg-primary border-primary text-black shadow-[0_0_30px_rgba(162,230,62,0.3)]' 
                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}
                            `}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-32 text-center flex flex-col items-center gap-8">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center relative">
                                <Bell className="w-12 h-12 text-white/10" />
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-black text-white uppercase tracking-tight">Encryption Clear</p>
                                <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">No matching data in the current sector</p>
                            </div>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification._id}
                                className={`
                                    relative bg-[#0A0A0A] border rounded-[32px] p-8 transition-all group
                                    ${notification.isRead ? 'border-white/5 opacity-60' : 'border-primary/20 bg-primary/[0.02] shadow-[0_0_40px_rgba(162,230,62,0.05)]'}
                                `}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className="flex gap-6">
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center border
                                        ${notification.isRead ? 'bg-white/5 border-white/10' : 'bg-primary/20 border-primary/30'}
                                    `}>
                                        {getIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className={`text-sm font-black tracking-tight ${notification.isRead ? 'text-white/60' : 'text-white'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-white/20 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-medium leading-relaxed mb-4 ${notification.isRead ? 'text-white/40' : 'text-white/70'}`}>
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-4">
                                            {notification.link && (
                                                <a 
                                                    href={notification.link}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Action Required
                                                </a>
                                            )}
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="text-[10px] font-black text-white/20 hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    Dismiss
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <div className="absolute top-8 right-8 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#A2E63E]"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
