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

    const NOTIFICATION_SOUND = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3';
    const audio = React.useMemo(() => new Audio(NOTIFICATION_SOUND), []);

    const fetchNotifications = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log('Fetching notifications from API...');
            const res = await axios.get(`${API_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('API Response:', res.data);
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
            console.log('Attempting socket connection to:', socketUrl);
            
            const newSocket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5
            });

            newSocket.on('connect', () => {
                const uid = user._id || user.id;
                console.log('Socket connected successfully. Room joining:', uid);
                newSocket.emit('joinUser', uid);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err.message);
            });

            newSocket.on('notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Play sound (reset to start if already playing)
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Sound play blocked:', e));
                
                // Trigger a toast alert
                info(notification.title);
                
                console.log('New Notification:', notification);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [token, user, info]);

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
