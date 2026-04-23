import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
 const [activeMode, setActiveMode] = useState(MODES.BOOSTING);

 // Sync mode with URL search param '?mode='
 useEffect(() => {
 const modeParam = searchParams.get('mode');
 if (modeParam && Object.values(MODES).includes(modeParam)) {
 setActiveMode(modeParam);
 } else if (!modeParam) {
 // Default to boosting if no param
 setActiveMode(MODES.BOOSTING);
 }
 }, [searchParams]);

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
