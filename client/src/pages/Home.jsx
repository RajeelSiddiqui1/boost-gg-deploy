import React, { Suspense, lazy } from 'react';
import SubNavbar from '../components/layout/SubNavbar';
import { useMode } from '../context/ModeContext';
import ReviewsSection from '../components/sections/ReviewsSection';

// Lazy load mode components for total isolation and performance
const BoostingMode = lazy(() => import('../components/modes/BoostingMode'));
const CurrencyMode = lazy(() => import('../components/modes/CurrencyMode'));
const AccountsMode = lazy(() => import('../components/modes/AccountsMode'));
import BlogSection from '../components/sections/BlogSection';

const Home = () => {
 const { activeMode, MODES } = useMode();

 return (
 <main className="bg-black pt-[72px] min-h-screen">
 <SubNavbar />

 <div className="pt-4 pb-6">
 {/* PlatformModeSwitcher removed as per user instruction to use only top switch */}
 </div>



 <Suspense fallback={
 <div className="py-24 flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 }>
 {/* STRICT REPLICATION: Non-active modes must fully unmount */}
 {activeMode === MODES.BOOSTING && <BoostingMode />}
 {activeMode === MODES.CURRENCY && <CurrencyMode />}
 {activeMode === MODES.ACCOUNTS && <AccountsMode />}
 </Suspense>

 {/* <BlogSection />
 <ReviewsSection /> */}

 {/* Global animations and styles for the modes */}
 <style jsx>{`
 @keyframes fade-in {
 from { opacity: 0; transform: translateY(10px); }
 to { opacity: 1; transform: translateY(0); }
 }
 .animate-fade-in {
 animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
 }
 @keyframes shimmer {
 100% { transform: translateX(100%); }
 }
 .animate-shimmer {
 animation: shimmer 2s infinite;
 }
 `}</style>
 </main>
 );
};

export default Home;

