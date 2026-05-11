import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const { info } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Sync token when user changes
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, [user]);
    const [socket, setSocket] = useState(null);

    const NOTIFICATION_SOUND = '/notification/notification.mp3';
    const [audio] = useState(() => {
        const a = new Audio(NOTIFICATION_SOUND);
        a.preload = 'auto';
        a.volume = 0.6;
        return a;
    });

    // 🔊 Robust Audio Unlock Pattern (Browser Policy Fix)
    useEffect(() => {
        const unlock = () => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(e => console.log('Audio init pending...'));
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, [audio]);

    const fetchNotifications = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    useEffect(() => {
        if (token && user) {
            const socketUrl = API_URL.replace('/api/v1', '');
            
            const newSocket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5
            });

            newSocket.on('connect', () => {
                const uid = user._id || user.id;
                newSocket.emit('joinUser', uid);
            });

            newSocket.on('notification', async (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // 🔊 Play Notification Sound
                try {
                    audio.currentTime = 0;
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                    }
                } catch (e) {
                    console.warn('Notification sound suppressed until user interaction');
                }
                
                // Trigger a toast alert
                info(notification.title);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [token, user, info, audio]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_URL}/api/v1/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_URL}/api/v1/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            loading,
            markAsRead, 
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
