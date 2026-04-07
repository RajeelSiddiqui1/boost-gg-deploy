import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [experienceToggle, setExperienceToggle] = useState('selection'); // 'selection', 'gold', 'accounts'

    const openMegaMenu = () => setIsMegaMenuOpen(true);
    const closeMegaMenu = () => setIsMegaMenuOpen(false);

    return (
        <UIContext.Provider value={{
            isMegaMenuOpen,
            setIsMegaMenuOpen,
            selectedGame,
            setSelectedGame,
            searchTerm,
            setSearchTerm,
            openMegaMenu,
            closeMegaMenu,
            experienceToggle,
            setExperienceToggle
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
