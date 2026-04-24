import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

const ModeContext = createContext();

export const useMode = () => {
 const context = useContext(ModeContext);
 if (!context) {
 throw new Error('useMode must be used within a ModeProvider');
 }
 return context;
};

export const MODES = {
 BOOSTING: 'boosting',
 CURRENCY: 'currency',
 ACCOUNTS: 'accounts'
};

export const ModeProvider = ({ children }) => {
 const [searchParams, setSearchParams] = useSearchParams();
 const location = useLocation();
 const [activeMode, setActiveMode] = useState(MODES.BOOSTING);

 // Sync mode with URL search param '?mode=' or pathname
 useEffect(() => {
 const modeParam = searchParams.get('mode');
 if (location.pathname.startsWith('/currency')) {
 setActiveMode(MODES.CURRENCY);
 } else if (modeParam && Object.values(MODES).includes(modeParam)) {
 setActiveMode(modeParam);
 } else if (!modeParam && location.pathname === '/') {
 // Default to boosting if no param on home
 setActiveMode(MODES.BOOSTING);
 }
 }, [searchParams, location.pathname]);

 const changeMode = (newMode) => {
 if (Object.values(MODES).includes(newMode)) {
 setActiveMode(newMode);
 // Update URL param
 const newParams = new URLSearchParams(searchParams);
 newParams.set('mode', newMode);
 setSearchParams(newParams);
 }
 };

 const value = {
 activeMode,
 changeMode,
 MODES
 };

 return (
 <ModeContext.Provider value={value}>
 {children}
 </ModeContext.Provider>
 );
};
