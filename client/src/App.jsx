import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import CartOverlay from './components/layout/CartOverlay';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Maintenance from './pages/Maintenance';
import SupportWidget from './components/support/SupportWidget';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from './utils/api';
import { UIProvider } from './context/UIContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ModeProvider } from './context/ModeContext';

const Home = lazy(() => import('./pages/Home'));
const Offers = lazy(() => import('./pages/Offers'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminGames = lazy(() => import('./pages/admin/Games'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminBlogs = lazy(() => import('./pages/admin/Blogs'));
const AdminCurrency = lazy(() => import('./pages/admin/Currency'));
const AdminAccounts = lazy(() => import('./pages/admin/Accounts'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminChat = lazy(() => import('./pages/admin/Chat'));
const AdminFinance = lazy(() => import('./pages/admin/Finance'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminSections = lazy(() => import('./pages/admin/Sections'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BecomePro = lazy(() => import('./pages/BecomePro'));
const Cashback = lazy(() => import('./pages/Cashback'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const BoosterDashboard = lazy(() => import('./pages/BoosterDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard'));
const PromoCodes = lazy(() => import('./pages/admin/PromoCodes'));
const GameHub = lazy(() => import('./pages/GameHub'));
const WowBoost = lazy(() => import('./pages/WowBoost'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));
const AdminServiceCreator = lazy(() => import('./pages/admin/ServiceCreatorPage'));
const AdminProApplications = lazy(() => import('./pages/admin/ProApplications'));
const ProSettings = lazy(() => import('./pages/ProSettings'));

const AppContent = () => {
  const location = useLocation();
  const { user, loading: authLoading, isPro, isAdmin, isAffiliate, ROLES } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  const hideLayoutPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/admin'];
  const shouldHideLayout = hideLayoutPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/auth/status`);
        setMaintenance(res.data.maintenance);
      } catch (err) {
        if (err.response && err.response.status === 503) {
          setMaintenance(true);
        }
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/public/settings`);
        const { site_name, site_description } = res.data.data;

        if (site_name) {
          document.title = site_name;
        }

        if (site_description) {
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
          }
          metaDescription.content = site_description;
        }
      } catch (err) {
        console.error('Failed to fetch site settings', err);
      }
    };
    fetchSettings();
  }, []);

  if ((maintenance && user?.role !== 'admin') && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/login')) {
    return <Maintenance />;
  }

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === ROLES.ADMIN) return '/admin';
    if (user.role === ROLES.PRO && user.proStatus === 'approved') return '/pro/dashboard';
    if (user.role === ROLES.AFFILIATE) return '/affiliate/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/50 transition-colors duration-300">
      <ScrollToTop />
      {!shouldHideLayout && <Navbar />}

      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<ProtectedRoute isPublic><Home /></ProtectedRoute>} />

            <Route path="/offers" element={<ProtectedRoute isPublic><Offers /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute isPublic><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute isPublic><Contact /></ProtectedRoute>} />
            <Route path="/verify-email/:token" element={<ProtectedRoute isPublic><VerifyEmail /></ProtectedRoute>} />
            <Route path="/offer/:id" element={<ProtectedRoute isPublic><ProductDetail /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute isPublic><ProductDetail /></ProtectedRoute>} />
            <Route path="/cashback" element={<ProtectedRoute isPublic><Cashback /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute isPublic><Blog /></ProtectedRoute>} />
            <Route path="/blog/:slug" element={<ProtectedRoute isPublic><BlogPost /></ProtectedRoute>} />
            <Route path="/game/:slug" element={<ProtectedRoute isPublic><GameHub /></ProtectedRoute>} />
            <Route path="/accounts/:id" element={<ProtectedRoute isPublic><AccountDetail /></ProtectedRoute>} />
            <Route path="/wow-boost" element={<ProtectedRoute isPublic><WowBoost /></ProtectedRoute>} />

            <Route path="/login" element={<ProtectedRoute guestOnly><Login /></ProtectedRoute>} />
            <Route path="/signup" element={<ProtectedRoute guestOnly><Signup /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ProtectedRoute guestOnly><ForgotPassword /></ProtectedRoute>} />
            <Route path="/reset-password/:token" element={<ProtectedRoute guestOnly><ResetPassword /></ProtectedRoute>} />

            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/become-pro" element={<ProtectedRoute isPublic><BecomePro /></ProtectedRoute>} />

            <Route path="/pro/dashboard" element={<ProtectedRoute proOnly><BoosterDashboard /></ProtectedRoute>} />
            <Route path="/pro/settings" element={<ProtectedRoute proOnly><ProSettings /></ProtectedRoute>} />

            <Route path="/affiliate/dashboard" element={<ProtectedRoute affiliateOnly><AffiliateDashboard /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/games" element={<ProtectedRoute adminOnly><AdminGames /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/services/new" element={<ProtectedRoute adminOnly><AdminServiceCreator /></ProtectedRoute>} />
            <Route path="/admin/services/:id/edit" element={<ProtectedRoute adminOnly><AdminServiceCreator /></ProtectedRoute>} />
            <Route path="/admin/currency" element={<ProtectedRoute adminOnly><AdminCurrency /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute adminOnly><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/offers" element={<ProtectedRoute adminOnly><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/blogs" element={<ProtectedRoute adminOnly><AdminBlogs /></ProtectedRoute>} />
            <Route path="/admin/blogs/new" element={<ProtectedRoute adminOnly><BlogEditor /></ProtectedRoute>} />
            <Route path="/admin/blogs/:id/edit" element={<ProtectedRoute adminOnly><BlogEditor /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/chat" element={<ProtectedRoute adminOnly><AdminChat /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute adminOnly><AdminFinance /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/promo" element={<ProtectedRoute adminOnly><PromoCodes /></ProtectedRoute>} />
            <Route path="/admin/sections" element={<ProtectedRoute adminOnly><AdminSections /></ProtectedRoute>} />
            <Route path="/admin/pro-applications" element={<ProtectedRoute adminOnly><AdminProApplications /></ProtectedRoute>} />

            <Route path="*" element={<ProtectedRoute isPublic><NotFound /></ProtectedRoute>} />
          </Routes>
        </Suspense>
        <CartOverlay />
      </main>

      {!shouldHideLayout && <Footer />}
      <SupportWidget />
      <ToastContainer />
    </div>
  );
};



function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <ModeProvider>
                <UIProvider>
                  <AppContent />
                </UIProvider>
              </ModeProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
