import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
    Users,
    ShoppingCart,
    ShieldAlert,
    Wallet,
    Gamepad2,
    ArrowRight,
    TrendingUp,
    Clock,
    Star
} from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/admin/analytics`);
                setAnalytics(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const stats = [
        { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-500', trend: '+12%' },
        { label: 'Total Revenue', value: formatPrice(analytics?.totalRevenue || 0), icon: TrendingUp, color: 'text-primary', trend: '+18%' },
        { label: 'Total Orders', value: analytics?.totalOrders || 0, icon: ShoppingCart, color: 'text-green-500', trend: '+8%' },
        { label: 'Total Pro Players', value: analytics?.totalBoosters || 0, icon: Gamepad2, color: 'text-purple-500', trend: '+15%' },
    ];

    if (loading) return (
        <AdminLayout>
            <div className="p-10 text-white/20 font-black italic animate-pulse text-center">Calibrating Nexus...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[32px] group hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-500/10 text-green-500">
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</h3>
                            <p className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Placeholder */}
                <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px] h-64 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
                    <div className="text-center z-10">
                        <TrendingUp className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 text-center">Growth Matrix Engaged</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">System Health</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase text-green-500/60">All Systems Operational</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <p className="text-[10px] font-black uppercase text-white/20 mb-2">Active Sessions</p>
                                <p className="text-2xl font-black italic">42 <span className="text-xs font-bold text-white/40 not-italic">Players Online</span></p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <p className="text-[10px] font-black uppercase text-white/20 mb-2">Pending Approvals</p>
                                <p className="text-2xl font-black italic text-yellow-500">12 <span className="text-xs font-bold text-white/40 not-italic">Queue Positions</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black italic tracking-tighter uppercase">High Priority Alerts</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-4">
                                <ShieldAlert className="w-4 h-4 text-red-500 mt-1" />
                                <div>
                                    <h4 className="font-black text-xs uppercase text-red-500 mb-1">Pro ID Verification Pending</h4>
                                    <p className="text-[10px] text-red-500/60 leading-relaxed font-bold uppercase">5 new pro applications require manual credential verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
