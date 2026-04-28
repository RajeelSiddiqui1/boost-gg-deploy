import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getImageUrl } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, ChevronRight, Zap, ShieldCheck, 
  Clock, Heart, Share2, Info, Star, 
  CheckCircle2, Users, Award, Layers, 
  Trophy, MousePointer2, MessageSquare, 
  ArrowRight, ShoppingCart, Lock, RefreshCcw
} from 'lucide-react';
import StepProcess from '../components/sections/StepProcess';
import PaymentModal from '../components/layout/PaymentModal';

/* ─── Compact Related Account Card ─── */
const RelatedAccountCard = ({ account }) => {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cartItem = {
      id: account._id,
      title: account.title,
      price: account.price,
      quantity: 1,
      image: account.screenshots?.[0] || account.thumbnail,
      icon: account.gameId?.icon,
      mode: 'accounts',
      selectedOptions: {
        rank: account.rank,
        region: account.region,
        server: account.server
      },
      type: 'account'
    };
    addToCart(cartItem);
    toast.success('Account added to cart');
  };

  return (
    <div 
      onClick={() => { navigate(`/accounts/${account._id}`); window.scrollTo(0, 0); }}
      className="group relative bg-[#0d0d0d] border border-white/[0.05] rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)] cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden bg-[#111]">
        {account.screenshots?.[0] || account.thumbnail ? (
          <img
            src={getImageUrl(account.screenshots?.[0] || account.thumbnail)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
            alt={account.title}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
            <Users className="w-10 h-10 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-4 left-4">
          {account.instantDelivery && (
            <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl flex items-center gap-1.5">
              <Zap className="w-2.5 h-2.5 fill-current" />
              Instant
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{account.region}</span>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{account.server}</span>
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight h-8">
          {account.title}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2 flex items-center gap-2">
            <Award className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-black text-white uppercase truncate">{account.rank || 'N/A'}</span>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2 flex items-center gap-2">
            <Layers className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-black text-white uppercase truncate">{account.specifications?.skinsCount || 0} Skins</span>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-lg font-black text-white tracking-tighter ">{formatPrice(account.price)}</span>
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();
  const { addToCart } = useCart();
  const toast = useToast();

  const [account, setAccount] = useState(null);
  const [relatedAccounts, setRelatedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [email, setEmail] = useState('');
  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Constant warranty price (could be dynamic based on account price in future)
  const warrantyPrice = 8.96;

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/accounts/${id}`);
        const data = res.data.data;
        setAccount(data);
        
        // Fetch related accounts (same game)
        if (data.gameId?._id) {
          const relatedRes = await axios.get(`${API_URL}/api/v1/accounts?gameId=${data.gameId._id}&limit=4&status=active`);
          setRelatedAccounts(relatedRes.data.data.filter(a => a._id !== id));
        }
      } catch (err) {
        console.error("Error fetching account:", err);
        toast.error("Account not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchAccount();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const finalPrice = useMemo(() => {
    if (!account) return 0;
    return account.price + (warrantyEnabled ? warrantyPrice : 0);
  }, [account, warrantyEnabled]);

  const handleAddToCart = () => {
    if (!account) return;
    
    const cartItem = {
      id: account._id,
      title: account.title,
      price: finalPrice,
      quantity: 1,
      image: account.screenshots?.[0] || account.thumbnail,
      icon: account.gameId?.icon,
      mode: 'accounts',
      selectedOptions: {
        rank: account.rank,
        region: account.region,
        server: account.server,
        warranty: warrantyEnabled
      },
      type: 'account'
    };
    
    addToCart(cartItem);
    toast.success('Account added to cart!');
  };

  const handleBuyNow = () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmBuyNow = (paymentMethod) => {
    if (!account) return;
    
    const instantItem = {
      id: account._id,
      title: account.title,
      price: finalPrice,
      quantity: 1,
      image: account.screenshots?.[0] || account.thumbnail,
      icon: account.gameId?.icon,
      mode: 'accounts',
      selectedOptions: {
        rank: account.rank,
        region: account.region,
        server: account.server,
        buyerEmail: email,
        lifetimeWarranty: warrantyEnabled
      },
      type: 'account'
    };
    
    setShowPaymentModal(false);
    navigate('/checkout', { 
      state: { 
        selectedPaymentMethod: paymentMethod,
        instantItem: instantItem 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-black uppercase mb-6 tracking-tighter">Account Not Found</h1>
        <Link to="/" className="px-8 py-3 bg-primary text-black font-black uppercase rounded-full">Back to Home</Link>
      </div>
    );
  }

  const images = account.screenshots?.length > 0 ? account.screenshots : [account.thumbnail || account.gameId?.icon];

  return (
    <div className="min-h-screen bg-[#060606] text-white font-['Outfit'] pt-24 pb-20">
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={finalPrice}
        onConfirm={confirmBuyNow}
      />

      {/* ── VERIFIED MODAL ── */}
      {isVerifiedModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsVerifiedModalOpen(false)}></div>
          <div className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-fade-in">
            <button 
              onClick={() => setIsVerifiedModalOpen(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6 rotate-90" />
            </button>
            
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                <ShieldCheck className="w-10 h-10 text-[#a2e63e]" />
                <div className="text-left">
                  <div className="text-xl font-black text-white leading-none">BOOSTGG</div>
                  <div className="text-sm font-black text-[#a2e63e] leading-none uppercase tracking-widest mt-1">VERIFIED</div>
                </div>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter ">Buy risk-free with BoostGG</h2>
              <p className="text-white/40 text-sm font-medium uppercase tracking-tight leading-relaxed">
                We work only with verified sellers, our team is online 24/7 and you're always guaranteed your money back.
              </p>
            </div>
            
            <button 
              onClick={() => setIsVerifiedModalOpen(false)}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to={`/game/${account.gameSlug || account.gameId?.slug}?mode=accounts`} className="hover:text-primary transition-colors">{account.gameId?.name || 'Game'}</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-white/60 truncate">{account.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── LEFT COLUMN: IMAGES & DESCRIPTION ── */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            
            {/* Title Section (Mobile Visible) */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">{account.region}</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{account.server}</span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">{account.title}</h1>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 group shadow-2xl">
                <img 
                  src={getImageUrl(images[activeImage])} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={account.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setActiveImage((activeImage + 1) % images.length)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Label */}
                <div className="absolute bottom-8 left-8">
                  <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Screenshots {activeImage + 1} / {images.length}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary scale-95 shadow-[0_0_15px_rgba(162,230,62,0.3)]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                    >
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Award, label: 'Current Rank', value: account.rank || 'Unranked' },
                { icon: Trophy, label: 'Level', value: account.level || '0' },
                { icon: Layers, label: 'Total Skins', value: account.specifications?.skinsCount || '0' },
                { icon: Star, label: 'Win Rate', value: `${account.specifications?.winRate || '0'}%` },
              ].map((spec, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all">
                  <spec.icon className="w-5 h-5 mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">{spec.label}</span>
                  <span className="text-sm font-black text-white uppercase tracking-tight">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Description & Specs */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-12">
              <section>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary" /> Account Description
                </h2>
                <div className="text-white/40 font-medium leading-relaxed uppercase tracking-tight text-sm space-y-4">
                  {account.description ? (
                    <div dangerouslySetInnerHTML={{ __html: account.description }}></div>
                  ) : (
                    <p>No detailed description provided. This is a premium verified account with full ownership transfer.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" /> Key Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(account.highlights?.length > 0 ? account.highlights : ['Full Access', 'Email Changeable', 'LIFETIME Warranty', 'Verified Source']).map((hl, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all">
                        <CheckCircle2 className="w-5 h-5 text-primary group-hover:text-black" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/60">{hl}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Frequently Asked Questions</h2>
              {[
                { q: "How do I buy an account?", a: "Select the account, enter your email, and complete the payment. You will receive the credentials instantly." },
                { q: "Is the email changeable?", a: "Yes, all our accounts come with full access, meaning you can change the email and password immediately." },
                { q: "Is my payment secure?", a: "Absolutely. We use industry-standard encryption and verified payment gateways for all transactions." }
              ].map((faq, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-2 ">Q: {faq.q}</h4>
                  <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-tight">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: CHECKOUT STICKY ── */}
          <aside className="w-full lg:w-[400px] lg:sticky lg:top-24 space-y-8">
            
            {/* FAST CHECKOUT HEADER ICONS */}
            <div className="mb-6">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 ">Fast checkout</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Star, label: 'Delivery within 24h', color: 'text-yellow-400' },
                  { icon: ShieldCheck, label: 'Account creds can be changed', color: 'text-primary' },
                  { icon: Award, label: 'Seller approved by BoostGG', color: 'text-white/40' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-white/40 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card (Skycoach Style) */}
            <div className="bg-payment-method rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <div className="p-8 space-y-8">
                
                {/* Lifetime Warranty Toggle */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer" onClick={() => setWarrantyEnabled(!warrantyEnabled)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${warrantyEnabled ? 'bg-primary border-primary' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                      {warrantyEnabled && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">Lifetime warranty 💪</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white/60">+{formatPrice(warrantyPrice)}</span>
                    <Info className="w-3.5 h-3.5 text-white/40" />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-xl font-black text-white/60 uppercase tracking-tighter mb-1">Total</span>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="text-5xl font-black text-white tracking-tighter leading-none">{formatPrice(finalPrice)}</span>
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2 block">excl. VAT</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="ENTER YOUR EMAIL"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-white/20 outline-none focus:border-primary/40 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white">{formatPrice(finalPrice * 0.01)}</div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">cashback after purchase</span>
                  </div>

                  <button 
                    onClick={handleBuyNow}
                    className="w-full bg-primary text-black font-black uppercase tracking-[0.2em] py-6 rounded-2xl transition-all shadow-[0_15px_40px_rgba(19,193,0,0.4)] flex items-center justify-center gap-3 active:scale-95 group border-none"
                  >
                    Buy Now <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* VERIFIED BADGE & READ MORE */}
            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-[2rem]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-[11px] font-black text-white leading-none">BOOSTGG</div>
                  <div className="text-[8px] font-black text-primary leading-none uppercase tracking-widest mt-0.5">VERIFIED</div>
                </div>
              </div>
              <button 
                onClick={() => setIsVerifiedModalOpen(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Read more
              </button>
            </div>

            {/* PAYMENT METHODS (IMAGE BASED) */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
                {[
                  'pay-pal', 'visa', 'mastercard', 'apple-pay', 'google-pay', 'skrill', 'bitcoin'
                ].map(p => (
                  <img 
                    key={p} 
                    src={`/payments/${p}.svg`} 
                    className="h-4 w-auto object-contain" 
                    alt={p} 
                  />
                ))}
              </div>
              <div className="text-center">
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                  Instant start • 24/7 Support • Moneyback Guarantee
                </p>
              </div>
            </div>

            {/* SUPPORT HELP */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center space-y-4">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Any questions?</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
                className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-4 h-4" /> Ask our team
              </button>
            </div>
          </aside>
        </div>

        {/* ── RELATED ACCOUNTS ── */}
        {relatedAccounts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">You May <span className="text-primary">Also Like</span></h2>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">Recommended based on this selection</p>
              </div>
              <Link 
                to={`/game/${account.gameSlug || account.gameId?.slug}?mode=accounts`}
                className="hidden md:flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-widest hover:gap-5 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAccounts.map(rel => (
                <RelatedAccountCard key={rel._id} account={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetail;
