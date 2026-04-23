import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL as BASE_API_URL } from '../utils/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Role constants (matching backend)
export const ROLES = {
 CUSTOMER: 'customer',
 PRO: 'pro',
 ADMIN: 'admin',
 AFFILIATE: 'affiliate'
};

export const PRO_TYPES = {
 BOOSTER: 'booster',
 GOLD_SELLER: 'gold_seller',
 ACCOUNT_SELLER: 'account_seller',
 CONTENT_CREATOR: 'content_creator',
 INFLUENCER_PARTNER: 'influencer_partner'
};

export const AFFILIATE_TYPES = {
 CREATOR: 'creator',
 PROMOTER: 'promoter'
};

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const toast = useToast();

 // Set axios defaults for cookies
 axios.defaults.withCredentials = true;

 const API_URL = `${BASE_API_URL}/api/v1/auth`;

 const checkUserLoggedIn = async () => {
 const token = localStorage.getItem('token');
 if (!token) {
 setLoading(false);
 return;
 }

 try {
 const res = await axios.get(`${API_URL}/me`, {
 headers: {
 Authorization: `Bearer ${token}`
 }
 });
 if (res.data.success) {
 setUser(res.data.data);
 }
 } catch (err) {
 // Silence 429 Too Many Requests to avoid console clutter
 if (err.response?.status !== 429) {
 setUser(null);
 localStorage.removeItem('token');
 }
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 checkUserLoggedIn();
 }, []);

 const signup = async (userData) => {
 setLoading(true);
 try {
 const res = await axios.post(`${API_URL}/signup`, userData);
 if (res.data.token) {
 localStorage.setItem('token', res.data.token);
 }
 setUser(res.data.data);
 toast.success(res.data.message || 'Account created successfully! Check your email for verification.');
 return { success: true };
 } catch (err) {
 const message = err.response?.data?.message || 'Signup failed';
 toast.error(message);
 return { success: false, message };
 } finally {
 setLoading(false);
 }
 };

 const login = async (email, password) => {
 setLoading(true);
 try {
 const res = await axios.post(`${API_URL}/login`, { email, password });
 if (res.data.token) {
 localStorage.setItem('token', res.data.token);
 }
 setUser(res.data.data);
 toast.success('Welcome back! Login successful.');
 return { success: true };
 } catch (err) {
 const message = err.response?.data?.message || 'Login failed';
 toast.error(message);
 return { success: false, message };
 } finally {
 setLoading(false);
 }
 };

 const logout = async () => {
 try {
 await axios.get(`${API_URL}/logout`);
 setUser(null);
 localStorage.removeItem('token');
 toast.info('Logged out successfully');
 } catch (err) {
 console.error('Logout failed', err);
 // Even if backend logout fails, clear local state
 setUser(null);
 localStorage.removeItem('token');
 toast.info('Logged out successfully');
 }
 };

 const resendVerification = async (email) => {
 try {
 const res = await axios.post(`${API_URL}/resend-verification`, { email });
 toast.success(res.data.message || 'Verification email sent! Check your inbox.');
 return { success: true };
 } catch (err) {
 const message = err.response?.data?.message || 'Failed to send verification email';
 toast.error(message);
 return { success: false, message };
 }
 };

 const forgotPassword = async (email) => {
 try {
 const res = await axios.post(`${API_URL}/forgot-password`, { email });
 toast.success(res.data.message || 'Reset link sent to your email!');
 return { success: true };
 } catch (err) {
 const message = err.response?.data?.message || 'Failed to send reset link';
 toast.error(message);
 return { success: false, message };
 }
 };

 const resetPassword = async (token, password) => {
 try {
 const res = await axios.post(`${API_URL}/reset-password/${token}`, { password });
 toast.success('Password reset successful! You can now login.');
 return { success: true };
 } catch (err) {
 const message = err.response?.data?.message || 'Reset failed. Token might be expired.';
 toast.error(message);
 return { success: false, message };
 }
 };

 // RBAC Helper functions
 const isAdmin = () => user?.role === ROLES.ADMIN;
 const isPro = () => user?.role === ROLES.PRO && user?.proStatus === 'approved';
 const isAffiliate = () => user?.role === ROLES.AFFILIATE;
 const isCustomer = () => user?.role === ROLES.CUSTOMER;
 const hasRole = (...roles) => user && roles.includes(user.role);
 const hasProType = (...proTypes) => user?.proType && proTypes.includes(user.proType);
 const hasAffiliateType = (...affiliateTypes) => user?.affiliateType && affiliateTypes.includes(user.affiliateType);

 return (
 <AuthContext.Provider value={{ 
 user, 
 loading, 
 login, 
 signup, 
 logout, 
 resendVerification, 
 forgotPassword, 
 resetPassword, 
 checkUserLoggedIn,
 // RBAC helpers
 isAdmin,
 isPro,
 isAffiliate,
 isCustomer,
 hasRole,
 hasProType,
 hasAffiliateType,
 // Constants
 ROLES,
 PRO_TYPES,
 AFFILIATE_TYPES
 }}>
 {children}
 </AuthContext.Provider>
 );
};
