import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    const audio = new Audio(NOTIFICATION_SOUND);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    useEffect(() => {
        if (token && user) {
            const newSocket = io(API_URL.replace('/api/v1', ''), {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected for notifications');
                newSocket.emit('joinUser', user.id);
            });

            newSocket.on('notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Play sound
                audio.play().catch(e => console.log('Sound play blocked:', e));
                
                // You could also trigger a toast here
                console.log('New Notification:', notification);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [token, user]);

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
