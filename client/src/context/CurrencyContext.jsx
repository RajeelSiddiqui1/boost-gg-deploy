import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
    const [rates, setRates] = useState({ USD: 1, EUR: 0.92 });
    const [symbols, setSymbols] = useState({ USD: '$', EUR: '€' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrencySettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/v1/public/settings`);
                if (res.data.data && res.data.data.currencies) {
                    const { rates: fetchedRates, symbols: fetchedSymbols } = res.data.data.currencies;
                    setRates(fetchedRates);
                    setSymbols(fetchedSymbols);
                }
            } catch (err) {
                console.error('Failed to fetch currency settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencySettings();
    }, []);

    const changeCurrency = (newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    const convertPrice = (price, from = 'USD') => {
        if (!price) return 0;

        // Convert from source to base (USD)
        const priceInBase = price / (rates[from] || 1);

        // Convert from base to target
        return priceInBase * (rates[currency] || 1);
    };

    const formatPrice = (price, from = 'USD') => {
        const converted = convertPrice(price, from);
        const symbol = symbols[currency] || '$';

        return `${symbol}${converted.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            rates,
            symbols,
            changeCurrency,
            convertPrice,
            formatPrice,
            loading
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
