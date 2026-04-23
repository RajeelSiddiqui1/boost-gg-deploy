import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Save, Lock, Globe, Mail, Shield, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
 const [activeTab, setActiveTab] = useState('general');
 const [settings, setSettings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const { success, error } = useToast();

 // Form states
 const [formData, setFormData] = useState({});

 useEffect(() => {
 fetchSettings();
 }, []);

 const fetchSettings = async () => {
 try {
 setLoading(true);
 const token = localStorage.getItem('token');
 const res = await axios.get(`${API_URL}/api/v1/admin/settings`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 const data = res.data.data;
 setSettings(data);

 // Initialize form data
 const initialData = {};
 data.forEach(s => {
 initialData[s.key] = s.value;
 });
 setFormData(initialData);
 setLoading(false);
 } catch (err) {
 console.error('Error fetching settings:', err);
 error('Failed to load settings');
 setLoading(false);
 }
 };

 const handleInputChange = (key, value) => {
 setFormData(prev => ({
 ...prev,
 [key]: value
 }));
 };

 const handleSave = async () => {
 try {
 setSaving(true);
 const token = localStorage.getItem('token');

 // Convert formData back to array of updates or send object
 // Sending object is easier since backend supports it
 await axios.put(`${API_URL}/api/v1/admin/settings`, formData, {
 headers: { Authorization: `Bearer ${token}` }
 });

 success('Settings saved successfully');
 setSaving(false);
 fetchSettings(); // Refresh to ensure sync
 } catch (err) {
 console.error('Error saving settings:', err);
 error('Failed to save settings');
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <AdminLayout>
 <div className="h-[60vh] flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 </AdminLayout>
 );
 }

 const tabs = [
 { id: 'general', label: 'General', icon: Globe },
 { id: 'currency', label: 'Currency', icon: Globe },
 { id: 'security', label: 'Security', icon: Shield },
 { id: 'email', label: 'Email', icon: Mail },
 ];

 const renderField = (setting) => {
 switch (setting.type) {
 case 'boolean':
 return (
 <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
 <div>
 <label className="block text-sm font-bold text-white mb-1">{setting.label}</label>
 <p className="text-xs text-white/40">{setting.description || 'Enable or disable this feature'}</p>
 </div>
 <button
 onClick={() => handleInputChange(setting.key, !formData[setting.key])}
 className={`w-14 h-8 rounded-full transition-colors relative ${formData[setting.key] ? 'bg-primary' : 'bg-white/10'}`}
 >
 <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData[setting.key] ? 'translate-x-6' : 'translate-x-0'}`}></div>
 </button>
 </div>
 );
 case 'number':
 return (
 <div className="space-y-2">
 <label className="block text-xs font-black uppercase tracking-widest text-white/40">{setting.label}</label>
 <input
 type="number"
 value={formData[setting.key] || ''}
 onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value))}
 className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
 />
 </div>
 );
 default:
 return (
 <div className="space-y-2">
 <label className="block text-xs font-black uppercase tracking-widest text-white/40">{setting.label}</label>
 <input
 type="text"
 value={formData[setting.key] || ''}
 onChange={(e) => handleInputChange(setting.key, e.target.value)}
 className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
 />
 </div>
 );
 }
 };

 const groupedSettings = settings.filter(s => s.group === activeTab);

 return (
 <AdminLayout>
 <div className="space-y-8 max-w-5xl mx-auto">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black uppercase tracking-tighter text-white">System Settings</h1>
 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Configure global application preferences</p>
 </div>
 <button
 onClick={handleSave}
 disabled={saving}
 className="flex items-center gap-2 bg-primary hover:bg-[#8cc63e] text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 Save Changes
 </button>
 </div>

 <div className="flex flex-col lg:flex-row gap-8">
 {/* Sidebar Tabs */}
 <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
 ? 'bg-white text-black shadow-lg'
 : 'text-white/40 hover:text-white hover:bg-white/5'
 }`}
 >
 <tab.icon className="w-4 h-4" />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Content Area */}
 <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
 <div className="space-y-8">
 {activeTab === 'currency' && formData.currencies && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Base Currency */}
 <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
 <label className="block text-xs font-black uppercase tracking-widest text-white/40">Base Currency (Basline for rates)</label>
 <input
 type="text"
 value={formData.currencies.base || ''}
 onChange={(e) => handleInputChange('currencies', { ...formData.currencies, base: e.target.value.toUpperCase() })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 font-black uppercase"
 placeholder="USD"
 />
 <p className="text-[10px] text-white/20 font-bold uppercase">All product prices in database are assumed to be in this currency.</p>
 </div>

 {/* Supported Currencies */}
 <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
 <label className="block text-xs font-black uppercase tracking-widest text-white/40">Supported (Comma separated)</label>
 <input
 type="text"
 value={formData.currencies.supported?.join(', ') || ''}
 onChange={(e) => handleInputChange('currencies', { ...formData.currencies, supported: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s) })}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 font-black"
 placeholder="USD, EUR"
 />
 </div>
 </div>

 {/* Rates Management */}
 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
 <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(162,230,62,0.6)]"></span>
 Exchange Rates & Symbols
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {formData.currencies.supported?.map(curr => (
 <div key={curr} className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-xs font-black text-primary">{curr}</span>
 </div>
 <div className="space-y-3">
 <div>
 <p className="text-[9px] font-black text-white/20 uppercase mb-1">Rate (1 {formData.currencies.base} = ?)</p>
 <input
 type="number"
 step="0.0001"
 value={formData.currencies.rates?.[curr] || ''}
 onChange={(e) => {
 const newRates = { ...formData.currencies.rates, [curr]: parseFloat(e.target.value) };
 handleInputChange('currencies', { ...formData.currencies, rates: newRates });
 }}
 className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-bold"
 />
 </div>
 <div>
 <p className="text-[9px] font-black text-white/20 uppercase mb-1">Symbol</p>
 <input
 type="text"
 value={formData.currencies.symbols?.[curr] || ''}
 onChange={(e) => {
 const newSymbols = { ...formData.currencies.symbols, [curr]: e.target.value };
 handleInputChange('currencies', { ...formData.currencies, symbols: newSymbols });
 }}
 className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-bold"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {groupedSettings.length > 0 ? (
 groupedSettings.filter(s => s.key !== 'currencies').map((setting) => (
 <div key={setting._id}>
 {renderField(setting)}
 </div>
 ))
 ) : (
 activeTab !== 'currency' && (
 <div className="text-center py-12 text-white/20">
 <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
 <p className="text-xs font-black uppercase tracking-widest">No settings in this group</p>
 </div>
 )
 )}

 {activeTab === 'security' && (
 <div className="mt-8 pt-8 border-t border-white/5">
 <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6">Admin Password</h3>
 <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
 <Lock className="w-5 h-5" />
 </div>
 <div className="flex-1">
 <h4 className="font-bold text-white mb-1">Change Password</h4>
 <p className="text-xs text-white/50 mb-4 leading-relaxed">
 Ensure your account is secure. Use a strong password. You will remain logged in after changing your password.
 </p>

 <form onSubmit={async (e) => {
 e.preventDefault();
 const current = e.target.currentPassword.value;
 const newPass = e.target.newPassword.value;

 if (!current || !newPass) return error('Please fill all fields');

 try {
 const token = localStorage.getItem('token');
 await axios.put(`${API_URL}/api/v1/auth/updatepassword`,
 { currentPassword: current, newPassword: newPass },
 { headers: { Authorization: `Bearer ${token}` } }
 );
 success('Password updated successfully');
 e.target.reset();
 } catch (err) {
 error(err.response?.data?.message || 'Failed to update password');
 }
 }} className="space-y-4 max-w-sm">
 <input
 type="password"
 name="currentPassword"
 placeholder="Current Password"
 className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all font-bold placeholder:text-white/20"
 />
 <input
 type="password"
 name="newPassword"
 placeholder="New Password"
 className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all font-bold placeholder:text-white/20"
 />
 <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
 Update Password
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
};

export default Settings;
