import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import BoosterDashboard from './BoosterDashboard';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

// Renamed for better role alignment
const BuyerDashboard = CustomerDashboard;
const ProDashboard = BoosterDashboard;

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (!user) return null; // Should be handled by protected route

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'pro':
            return <ProDashboard />;
        default:
            return <BuyerDashboard />;
    }
};

export default Dashboard;
