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
    Star,
    LayoutGrid,
    Target
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
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
        { label: 'Total Users', value: analytics?.stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', trend: '+12%' },
        { label: 'Total Revenue', value: formatPrice(analytics?.stats?.totalRevenue || 0), icon: TrendingUp, color: 'text-primary', trend: '+18%' },
        { label: 'Total Orders', value: analytics?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-green-500', trend: '+8%' },
        { label: 'Total Pro Players', value: analytics?.stats?.totalProPlayers || 0, icon: Gamepad2, color: 'text-purple-500', trend: '+15%' },
        { label: 'Total Games', value: analytics?.stats?.totalGames || 0, icon: LayoutGrid, color: 'text-orange-500', trend: '+5%' },
        { label: 'Total Categories', value: analytics?.stats?.totalCategories || 0, icon: Target, color: 'text-pink-500', trend: '+2%' },
    ];

    const platformChartData = [
        { name: 'Users', count: analytics?.stats?.totalUsers || 0 },
        { name: 'Orders', count: analytics?.stats?.totalOrders || 0 },
        { name: 'Completed', count: analytics?.stats?.completedOrders || 0 },
        { name: 'Games', count: analytics?.stats?.totalGames || 0 },
        { name: 'Categories', count: analytics?.stats?.totalCategories || 0 },
        { name: 'Pro Players', count: analytics?.stats?.totalProPlayers || 0 },
    ];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = analytics?.monthlyRevenue?.map(m => ({
        name: monthNames[m._id - 1] || m._id,
        Revenue: m.revenue,
        Orders: m.count
    })) || [];

    if (loading) return (
        <AdminLayout>
            <div className="p-10 text-white/20 font-black italic animate-pulse text-center">Calibrating Nexus...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Platform Overview Chart */}
                    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px] h-96 relative flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Platform Overview</h2>
                        </div>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={platformChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#ffffff40" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#ffffff40" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        allowDecimals={false}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#ffffff05'}}
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '16px' }}
                                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" fill="#ff4d00" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Growth Chart */}
                    <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[48px] h-96 relative flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Revenue Growth</h2>
                        </div>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ff4d00" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#ffffff40" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#ffffff40" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '16px' }}
                                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="Revenue" stroke="#ff4d00" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
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
