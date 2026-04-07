import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingCart, User as UserIcon,
    Settings, LogOut, ChevronLeft, Zap, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const DashboardLayout = ({ children, title }) => {
    const { logout, user } = useAuth();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isPro = user?.role === 'pro';
    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];

    if (isAdmin) {
        menuItems.push({ name: 'Admin Panel', icon: ShieldCheck, path: '/admin' });
        menuItems.push({ name: 'Users', icon: UserIcon, path: '/admin/users' });
        menuItems.push({ name: 'Orders', icon: ShoppingCart, path: '/admin/orders' });
        menuItems.push({ name: 'Finance', icon: Zap, path: '/admin/finance' });
    } else if (isPro) {
        menuItems.push({ name: 'Active Tasks', icon: ShoppingCart, path: '/dashboard?tab=work' });
        menuItems.push({ name: 'Earnings', icon: Zap, path: '/dashboard?tab=earnings' });
        menuItems.push({ name: 'Performance', icon: ShieldCheck, path: '/dashboard?tab=performance' });
    } else {
        // Buyer roles
        menuItems.push({ name: 'My Orders', icon: ShoppingCart, path: '/dashboard?tab=orders' });
        menuItems.push({ name: 'My Wallet', icon: Zap, path: '/dashboard?tab=wallet' });
    }

    menuItems.push({ name: 'Profile Settings', icon: UserIcon, path: '/dashboard?tab=profile' });

    return (
        <div className="min-h-screen bg-black text-white flex font-['Outfit']">
            {/* Sidebar */}
            <aside className="w-[300px] border-r border-white/5 flex flex-col bg-[#050505] sticky top-0 h-screen">
                <div className="p-8 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <Zap className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <span className="text-xl font-black italic uppercase tracking-tighter">BoostGG</span>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-4 mb-4">Main Menu</p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                                ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>

                    <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-sm font-black text-primary">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-white truncate">{user?.name}</p>
                            <p className="text-[8px] font-bold uppercase text-white/20 tracking-widest flex items-center gap-1">
                                {isAdmin ? <ShieldCheck className="w-2.5 h-2.5 text-primary" /> : null}
                                {user?.role === 'user' ? 'Buyer' : user?.role === 'pro' ? 'Pro Player' : 'Nexus Admin'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-black overflow-y-auto">
                <header className="h-[100px] border-b border-white/5 flex items-center justify-between px-10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                    <h1 className="text-2xl font-black italic uppercase tracking-tight">{title}</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                {isPro ? 'Total Earnings' : 'Available Funds'}
                            </span>
                            <span className="text-lg font-black italic text-primary">
                                {formatPrice(isPro ? (user?.earnings || 0) : (user?.walletBalance || 0))}
                            </span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/5"></div>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
                            Help Center
                        </button>
                    </div>
                </header>

                <div className="p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
