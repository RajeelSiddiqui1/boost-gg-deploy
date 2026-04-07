import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    User, Mail, MessageSquare, Globe,
    Twitter, Youtube, Instagram, Facebook,
    Video, Link as LinkIcon, Plus, Trash2,
    Save, Loader2, Share2, Camera,
    FileText, Award
} from 'lucide-react';
import { API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProSettings = () => {
    const { user, checkUserLoggedIn } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const [profile, setProfile] = useState({
        bio: '',
        tagline: '',
        socialLinks: {
            youtube: '',
            twitch: '',
            tiktok: '',
            twitter: '',
            instagram: '',
            facebook: ''
        },
        portfolio: [],
        specialties: [],
        languages: [],
        timezone: ''
    });

    useEffect(() => {
        if (user?.proProfile) {
            setProfile({
                ...profile,
                ...user.proProfile,
                socialLinks: {
                    ...profile.socialLinks,
                    ...user.proProfile.socialLinks
                },
                portfolio: user.proProfile.portfolio || [],
                specialties: user.proProfile.specialties || [],
                languages: user.proProfile.languages || []
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            await axios.put(`${API_URL}/api/v1/pro/profile`, { proProfile: profile });
            toast.success('Profile updated successfully');
            checkUserLoggedIn();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const addPortfolioItem = () => {
        setProfile({
            ...profile,
            portfolio: [...profile.portfolio, { title: '', url: '', type: 'link', description: '' }]
        });
    };

    const removePortfolioItem = (index) => {
        setProfile({
            ...profile,
            portfolio: profile.portfolio.filter((_, i) => i !== index)
        });
    };

    const updatePortfolioItem = (index, field, value) => {
        const newPortfolio = [...profile.portfolio];
        newPortfolio[index][field] = value;
        setProfile({ ...profile, portfolio: newPortfolio });
    };

    return (
        <DashboardLayout title="Pro Profile Settings">
            <div className="max-w-5xl mx-auto space-y-12 pb-20 font-['Outfit']">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">Public Profile</h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Customize how clients see you on the marketplace</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                        {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Basic Info & Socials */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Bio Section */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-black uppercase italic tracking-tight">Biography & Tagline</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-4">Catchy Tagline</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. #1 Rank Global Booster | Content Guru"
                                        value={profile.tagline || ''}
                                        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 px-6 font-bold text-white outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-4">Full Bio</label>
                                    <textarea
                                        rows="6"
                                        placeholder="Describe your professional career, achievements, and why clients should choose you..."
                                        value={profile.bio || ''}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[32px] py-6 px-8 font-bold text-white outline-none focus:border-primary/50 transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Share2 className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-black uppercase italic tracking-tight">Social Presence</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(profile.socialLinks).map(([platform, value]) => (
                                    <div key={platform} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/30 ml-4">{platform}</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                                                {platform === 'youtube' && <Youtube className="w-4 h-4" />}
                                                {platform === 'twitter' && <Twitter className="w-4 h-4" />}
                                                {platform === 'instagram' && <Instagram className="w-4 h-4" />}
                                                {platform === 'facebook' && <Facebook className="w-4 h-4" />}
                                                {platform === 'twitch' && <Video className="w-4 h-4" />}
                                                {platform === 'tiktok' && <Share2 className="w-4 h-4" />}
                                                {!['youtube', 'twitter', 'instagram', 'facebook', 'twitch', 'tiktok'].includes(platform) && <Globe className="w-4 h-4" />}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={`${platform} URL or Handle`}
                                                value={value || ''}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    socialLinks: { ...profile.socialLinks, [platform]: e.target.value }
                                                })}
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 font-bold text-sm text-white outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Portfolio */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <Award className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight">Portfolio & Evidence</h3>
                                </div>
                                <button onClick={addPortfolioItem} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {profile.portfolio.map((item, index) => (
                                    <div key={index} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative group">
                                        <button
                                            onClick={() => removePortfolioItem(index)}
                                            className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase text-white/20 ml-2">Title</label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase text-white/20 ml-2">URL</label>
                                                <input
                                                    type="text"
                                                    value={item.url}
                                                    onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase text-white/20 ml-2">Type</label>
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => updatePortfolioItem(index, 'type', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold outline-none appearance-none"
                                                >
                                                    <option value="video">Video</option>
                                                    <option value="link">Link</option>
                                                    <option value="article">Article</option>
                                                    <option value="image">Image</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {profile.portfolio.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No items added yet. Showcase your best work!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Status */}
                    <div className="space-y-8">
                        <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center overflow-hidden">
                                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-primary" />}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black italic uppercase italic tracking-tighter">{user?.name}</h4>
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                                        {user?.proType?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="h-px bg-primary/10 w-full"></div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <span>Profile Reliability</span>
                                    <span className="text-primary">High</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[85%]"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-white/30 font-bold leading-relaxed uppercase tracking-wider">
                                A complete profile increases your chances of getting high-value orders and assignments by <span className="text-white">40%</span>.
                            </p>
                        </div>

                        {/* Specialties */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">My Specialties</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.specialties.map((s, i) => (
                                    <span key={i} className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                        {s} <button onClick={() => setProfile({ ...profile, specialties: profile.specialties.filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3 text-red-400" /></button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => {
                                        const s = prompt('Enter specialty:');
                                        if (s) setProfile({ ...profile, specialties: [...profile.specialties, s] });
                                    }}
                                    className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase text-primary tracking-widest"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProSettings;
