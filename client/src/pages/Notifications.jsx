import React, { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCircle, Clock, ExternalLink, Trash2, MailOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'bid_created': return <Bell className="w-5 h-5 text-primary" />;
            case 'order_update': return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'payout': return <Clock className="w-5 h-5 text-green-500" />;
            default: return <Bell className="w-5 h-5 text-white/40" />;
        }
    };

    return (
        <DashboardLayout title="Notification Center">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Alert Intel</h2>
                        <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mt-2">Real-time operational updates</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                        >
                            <MailOpen className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-20 text-center flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                <Bell className="w-10 h-10 text-white/10" />
                            </div>
                            <p className="text-xs font-black text-white/20 tracking-widest uppercase">System clear. No active alerts.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
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
        </DashboardLayout>
    );
};

export default Notifications;
