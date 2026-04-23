import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - Automatically scrolls to top on route change
 * This component doesn't render anything, it just handles the scroll behavior
 */
const ScrollToTop = () => {
 const { pathname } = useLocation();

 useEffect(() => {
 // Reset window scroll immediately
 window.scrollTo(0, 0);

 // Also handle cases where the browser restores scroll position after rendering
 const timer = setTimeout(() => {
 window.scrollTo(0, 0);
 }, 100);

 return () => clearTimeout(timer);
 }, [pathname]);

 return null;
};

export default ScrollToTop;
