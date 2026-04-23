import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

/* ═══════════════════════════════ ICONS ═══════════════════════════════════ */
const Ico = {
 Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
 Heart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
 User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
 Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
 ChevDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>,
 ChevLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>,
 ChevRight: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>,
 Star: ({ size = 18, color = "#4ade80" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
 Info: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
 Shield: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
 Lock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
 Refresh: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
 Support: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>,
 Dollar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
 Bolt: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
 Msg: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
 Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
};

/* ═══════════════════════════════ COMPONENTS ═══════════════════════════════ */

const StarRow = ({ count = 5, size = 18 }) => (
 <div style={{ display: "flex", gap: 3 }}>
 {[...Array(count)].map((_, i) => <Ico.Star key={i} size={size} />)}
 </div>
);

function GreenRadio({ checked }) {
 return (
 <div
 style={{
 width: 20, height: 20, borderRadius: "50%",
 border: checked ? "none" : "2px solid #444",
 background: checked ? "#4ade80" : "transparent",
 display: "flex", alignItems: "center", justifyContent: "center",
 flexShrink: 0, transition: "all .15s"
 }}>
 {checked && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
 </div>
 );
}

function GreenCheck({ checked }) {
 return (
 <div
 style={{
 width: 20, height: 20, borderRadius: 6,
 border: checked ? "none" : "2px solid #444",
 background: checked ? "#4ade80" : "transparent",
 display: "flex", alignItems: "center", justifyContent: "center",
 flexShrink: 0, transition: "all .15s"
 }}>
 {checked && <Ico.Check />}
 </div>
 );
}

function HeroBanner({ service }) {
 return (
 <div style={{
 borderRadius: 20, overflow: "hidden",
 background: "linear-gradient(135deg,#0d1b3e 0%,#1a1050 50%,#0d1b3e 100%)",
 minHeight: "clamp(200px, 40vw, 340px)", position: "relative", display: "flex"
 }}>
 {/* Feature tags */}
 <div style={{ position: "absolute", left: 18, top: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 2 }}>
 {(service.features || ["Tier 5 Weapons", "Unique Dungeon Gear", "Fast & Safe Carries"]).slice(0, 3).map(tag => (
 <span key={tag} style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>{tag}</span>
 ))}
 </div>

 {/* Guardian placeholder */}
 <div style={{ position: "absolute", left: 0, bottom: 0, top: 0, width: "55%", background: "radial-gradient(ellipse at 40% 80%, rgba(80,120,255,0.2) 0%, transparent 70%)" }} />

 {/* SVG Guardian Illustration (from previous design) */}
 <div style={{ position: "absolute", left: "25%", bottom: 0, transform: "translateX(-50%)", width: 220, height: 290, opacity: 0.6 }}>
 <svg viewBox="0 0 220 300" className="w-full h-full">
 <defs>
 <radialGradient id="fg" cx="50%" cy="90%" r="50%"><stop offset="0%" stopColor="#00d9c0" stopOpacity="0.3" /><stop offset="100%" stopColor="transparent" /></radialGradient>
 <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2a1060" /><stop offset="100%" stopColor="#1a0840" /></linearGradient>
 </defs>
 <ellipse cx="110" cy="295" rx="80" ry="12" fill="url(#fg)" />
 <rect x="88" y="55" width="44" height="48" rx="10" fill="#150830" />
 <rect x="92" y="70" width="36" height="18" rx="4" fill="#00d9c0" opacity="0.7" />
 <rect x="95" y="72" width="30" height="14" rx="3" fill="#006b60" opacity="0.8" />
 <rect x="102" y="100" width="16" height="10" rx="2" fill="#1a0840" />
 <rect x="78" y="108" width="64" height="75" rx="8" fill="url(#body)" />
 <rect x="85" y="115" width="50" height="60" rx="4" fill="#2d1270" opacity="0.8" />
 <line x1="110" y1="118" x2="110" y2="168" stroke="#7c3aed" strokeWidth="1.5" opacity="0.6" />
 <rect x="48" y="112" width="26" height="58" rx="10" fill="#1e0950" />
 <rect x="146" y="112" width="26" height="58" rx="10" fill="#1e0950" />
 <rect x="166" y="100" width="8" height="85" rx="4" fill="#00d9c0" opacity="0.5" />
 <rect x="82" y="180" width="24" height="90" rx="8" fill="#150830" />
 <rect x="114" y="180" width="24" height="90" rx="8" fill="#150830" />
 </svg>
 </div>

 {/* Bottom stats */}
 <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 36 }}>
 <div>
 <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{service.estimatedStartTime || "15 min"}</div>
 <div style={{ color: "#888", fontSize: 11, lineHeight: 1.4 }}>Estimated Start<br />Time</div>
 </div>
 <div>
 <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{service.estimatedCompletionTime || service.deliveryTimeText || "24 hours"}</div>
 <div style={{ color: "#888", fontSize: 11, lineHeight: 1.4 }}>Estimated<br />Completion Time</div>
 </div>
 </div>
 </div>
 );
}





function RedesignedSidebar({ service, total, quantity, setQuantity, selectedOptions, setSelectedOptions, speed, setSpeed, onBuy, onChat }) {
 const [promoOpen, setPromoOpen] = useState(false);
 const cashback = (parseFloat(total) * 0.05).toFixed(2);

 const darkBg = "#1c1c1c";
 const divider = { borderBottom: "1px solid #2a2a2a" };
 const sec = { padding: "16px 18px", background: darkBg };

 const toggleOptionArr = (secId, label) => {
 setSelectedOptions((prev) => {
 const current = prev[secId] || [];
 const updated = current.includes(label)
 ? current.filter((c) => c !== label)
 : [...current, label];
 return { ...prev, [secId]: updated };
 });
 };

 const setOptionValue = (secId, val) => {
 setSelectedOptions((prev) => ({ ...prev, [secId]: val }));
 };

 return (
 <div className="flex flex-col sm:flex-row gap-3 items-start w-full">
 {/* ── LEFT DARK PANEL: Options ── */}
 <div className="w-full sm:w-52 shrink-0" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #2a2a2a", background: darkBg }}>
 {service.sidebarSections?.sort((a, b) => a.displayOrder - b.displayOrder).map((s, i) => (
 <div key={s.id} style={{ ...sec, ...(i < service.sidebarSections.length - 1 ? divider : {}) }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
 {s.heading}:
 {s.stepperConfig?.unitLabel && <span style={{ fontSize: 10, color: "#777", fontWeight: 500 }}>{s.stepperConfig.unitLabel}</span>}
 </div>

 {s.fieldType === 'stepper' ? (
 <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 4 }}>
 <button onClick={() => setOptionValue(s.id, Math.max(s.stepperConfig?.min || 1, (selectedOptions[s.id] || 1) - 1))}
 style={{ width: 30, height: 30, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>−</button>
 <div style={{ flex: 1, textAlign: "center", color: "#fff", fontSize: 13 }}>{selectedOptions[s.id] || 1}</div>
 <button onClick={() => setOptionValue(s.id, Math.min(s.stepperConfig?.max || 9999, (selectedOptions[s.id] || 1) + 1))}
 style={{ width: 30, height: 30, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>+</button>
 </div>
 ) : s.fieldType === 'dropdown' ? (
 <select
 value={selectedOptions[s.id] || ""}
 onChange={(e) => setOptionValue(s.id, e.target.value)}
 style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px", outline: "none" }}
 >
 {s.options?.map(opt => (
 <option key={opt.id} value={opt.label} style={{ background: "#1c1c1c" }}>
 {opt.label} {opt.priceModifier ? `(+$${opt.priceModifier})` : ''}
 </option>
 ))}
 </select>
 ) : s.fieldType === 'text_input' ? (
 <input
 type="text"
 placeholder={s.placeholder || "Enter details..."}
 value={selectedOptions[s.id] || ""}
 onChange={(e) => setOptionValue(s.id, e.target.value)}
 style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px", outline: "none" }}
 />
 ) : (
 s.options?.map(opt => (
 <div key={opt.id}
 role="button"
 tabIndex={0}
 onClick={() => s.fieldType === 'checkbox' ? toggleOptionArr(s.id, opt.label) : setOptionValue(s.id, opt.label)}
 onKeyDown={(e) => e.key === 'Enter' && (s.fieldType === 'checkbox' ? toggleOptionArr(s.id, opt.label) : setOptionValue(s.id, opt.label))}
 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", cursor: "pointer", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
 {s.fieldType === 'checkbox' ? (
 <GreenCheck checked={(selectedOptions[s.id] || []).includes(opt.label)} />
 ) : (
 <GreenRadio checked={selectedOptions[s.id] === opt.label} />
 )}
 <span style={{ fontSize: 12, textAlign: "left", color: (s.fieldType === 'checkbox' ? (selectedOptions[s.id] || []).includes(opt.label) : selectedOptions[s.id] === opt.label) ? "#fff" : "#999" }}>{opt.label}</span>
 </div>
 {opt.priceModifier ? (
 <span style={{ fontSize: 12, color: "#ccc", flexShrink: 0 }}>+${opt.priceModifier.toFixed(2)}</span>
 ) : null}
 </div>
 ))
 )}
 </div>
 ))}


 </div>

 {/* ── RIGHT PURPLE CARD: Total & Checkout ── */}
 <div className="w-full sm:w-52 shrink-0" style={{ borderRadius: 14, overflow: "hidden", background: "linear-gradient(160deg, #7c3aed 0%, #6d28d9 100%)", border: "1px solid rgba(255,255,255,0.1)" }}>

 {/* Number of Characters/Days */}
 <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Quantity</div>
 <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
 <button onClick={() => setQuantity(d => Math.max(1, d - 1))}
 style={{ width: 36, height: 36, background: "none", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
 <div style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>{quantity}</div>
 <button onClick={() => setQuantity(d => d + 1)}
 style={{ width: 36, height: 36, background: "none", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
 </div>
 </div>

 {/* Speed Selection */}
 {(service.speedOptions?.express?.enabled || service.speedOptions?.superExpress?.enabled) && (
 <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
 <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Completion Speed</div>
 {service.speedOptions?.express?.enabled && (
 <div role="button" tabIndex={0} onClick={() => setSpeed(speed === 'express' ? null : 'express')}
 onKeyDown={(e) => e.key === 'Enter' && setSpeed(speed === 'express' ? null : 'express')}
 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", cursor: "pointer", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
 <GreenRadio checked={speed === 'express'} />
 <span style={{ fontSize: 11, color: speed === 'express' ? "#fff" : "#e9d5ff" }}>{service.speedOptions.express.label || 'Express'}</span>
 </div>
 <span style={{ fontSize: 11, color: speed === 'express' ? "#fff" : "#c4b5fd" }}>+${(service.speedOptions.express.priceModifier || 0).toFixed(2)}</span>
 </div>
 )}
 {service.speedOptions?.superExpress?.enabled && (
 <div role="button" tabIndex={0} onClick={() => setSpeed(speed === 'superExpress' ? null : 'superExpress')}
 onKeyDown={(e) => e.key === 'Enter' && setSpeed(speed === 'superExpress' ? null : 'superExpress')}
 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", cursor: "pointer", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
 <GreenRadio checked={speed === 'superExpress'} />
 <span style={{ fontSize: 11, color: speed === 'superExpress' ? "#fff" : "#e9d5ff" }}>{service.speedOptions.superExpress.label || 'Super Express'}</span>
 </div>
 <span style={{ fontSize: 11, color: speed === 'superExpress' ? "#fff" : "#c4b5fd" }}>+${(service.speedOptions.superExpress.priceModifier || 0).toFixed(2)}</span>
 </div>
 )}
 </div>
 )}

 {/* Promo Code */}
 <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
 <button onClick={() => setPromoOpen(p => !p)}
 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", color: "#e9d5ff", fontSize: 13, fontWeight: 600, padding: 0 }}>
 Apply promo code
 <span style={{ transform: promoOpen ? "rotate(180deg)" : "none", transition: "transform .2s", color: "#c4b5fd" }}><Ico.ChevDown /></span>
 </button>
 {promoOpen && (
 <input placeholder="Enter code" style={{ marginTop: 8, width: "100%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
 )}
 </div>

 {/* Total */}
 <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
 <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
 <span style={{ color: "#e9d5ff", fontSize: 13, fontWeight: 600 }}>Total</span>
 <div style={{ textAlign: "right" }}>
 <div style={{ color: "#fff", fontWeight: 900, fontSize: 26, lineHeight: 1 }}>${total}</div>
 <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 2 }}>incl. VAT</div>
 </div>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
 <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "2px 7px", borderRadius: 4, opacity: 0.9 }}>${cashback}</span>
 <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>cashback after purchase</span>
 </div>
 </div>

 {/* Checkout & Actions */}
 <div style={{ padding: "12px 16px" }}>
 <button onClick={onBuy} style={{ width: "100%", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: "13px", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
 Buy now 🛡️
 </button>

 <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginBottom: 12 }}>
 {["PayPal", "VISA", "MC", "Apple Pay", "G Pay", "Skrill", "CRYPTO"].map(p => (
 <span key={p} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{p}</span>
 ))}
 </div>

 <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 8 }}>Any questions?</p>
 <button onClick={onChat} style={{ width: "100%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "10px", color: "#e9d5ff", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
 Chat before order <Ico.Msg />
 </button>
 <button style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
 <Ico.Dollar /> Found cheaper? We price match.
 </button>
 </div>
 </div>
 </div>
 );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ProductDetail() {
 const { id } = useParams();
 const navigate = useNavigate();
 const toast = useToast();
 const { addToCart } = useCart();
 const { user } = useAuth();

 const [service, setService] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const [selectedOptions, setSelectedOptions] = useState({});
 const [quantity, setQuantity] = useState(1);
 const [speed, setSpeed] = useState("super");


 useEffect(() => {
 const fetchService = async () => {
 try {
 setLoading(true);
 let res;
 try {
 res = await axios.get(`${API_URL}/api/v1/services/slug/${id}`);
 } catch (e) {
 res = await axios.get(`${API_URL}/api/v1/services/${id}`);
 }
 const data = res.data.data;
 setService(data);

 const initialOpts = {};
 data.sidebarSections?.forEach(sec => {
 if (sec.fieldType === 'checkbox') {
 initialOpts[sec.id] = sec.options?.filter(o => o.isDefault).map(o => o.label) || [];
 } else if (sec.fieldType === 'stepper') {
 initialOpts[sec.id] = sec.stepperConfig?.default || 1;
 } else {
 const defaultChoice = sec.options?.find(o => o.isDefault) || sec.options?.[0];
 initialOpts[sec.id] = defaultChoice?.label || "";
 }
 });
 setSelectedOptions(initialOpts);
 setLoading(false);
 } catch (err) {
 setError("Service not found");
 setLoading(false);
 }
 };
 if (id) fetchService();
 }, [id]);

 const totalPrice = useMemo(() => {
 if (!service) return 0;
 let base = service.price || service.pricing?.basePrice || service.basePrice || 0;
 let dynamicAdd = 0;
 let dynamicMultiplier = 1;

 service.sidebarSections?.forEach(sec => {
 const selected = selectedOptions[sec.id];
 if (selected === undefined || selected === null) return;

 if (sec.fieldType === 'checkbox') {
 selected.forEach(choiceLabel => {
 const choice = sec.options?.find(o => o.label === choiceLabel);
 if (choice) {
 dynamicAdd += (choice.priceModifier || 0);
 }
 });
 } else if (sec.fieldType === 'stepper') {
 const diff = Math.max(0, Number(selected) - (sec.stepperConfig?.min || 1));
 dynamicAdd += diff * (sec.stepperConfig?.pricePerUnit || 0);
 } else {
 const choice = sec.options?.find(o => o.label === selected);
 if (choice) {
 dynamicAdd += (choice.priceModifier || 0);
 }
 }
 });

 // Speed options
 if (speed === 'express' && service.speedOptions?.express?.enabled) dynamicAdd += (service.speedOptions.express.priceModifier || 0);
 if (speed === 'superExpress' && service.speedOptions?.superExpress?.enabled) dynamicAdd += (service.speedOptions.superExpress.priceModifier || 0);

 let subtotal = (base + dynamicAdd) * dynamicMultiplier;
 subtotal *= quantity;
 if (quantity > 1) subtotal *= 0.95;

 return parseFloat(subtotal.toFixed(2));
 }, [service, selectedOptions, speed, quantity]);

 const handleBuyNow = () => {
 if (!service) return;
 const item = {
 id: service._id,
 title: service.title,
 price: totalPrice / quantity,
 quantity: quantity,
 selectedOptions: selectedOptions,
 calcValue: totalPrice
 };
 addToCart(item);
 navigate('/checkout');
 };

 if (loading) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
 if (error || !service) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-gray-500">{error || "Service Not Found"}</div>;

 return (
 <div style={{ background: "#0e0e0e", minHeight: "100vh", color: "#fff", fontFamily: "system-ui,-apple-system,sans-serif" }}>

 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

 {/* Breadcrumb */}
 <div className="flex flex-wrap items-center gap-2 mb-5">
 <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#ccc", border: "1px solid #333", borderRadius: 6, padding: "5px 10px", background: "none", cursor: "pointer" }}>
 <Ico.ChevLeft /> {service.title}
 </button>
 <span className="hidden sm:inline" style={{ fontSize: 13, color: "#555" }}>
 <span style={{ cursor: "pointer" }} className="hover:text-gray-300">Skycoach</span> / <span style={{ cursor: "pointer" }} className="hover:text-gray-300">{service.gameId?.name || "Game"}</span> / <span style={{ cursor: "pointer" }} className="hover:text-gray-300">{service.categoryId?.name || "Category"}</span> / <span style={{ color: "#777" }}>{service.title}</span>
 </span>
 </div>

 {/* Title */}
 <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
 <h1 style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, color: "#fff", margin: 0 }} className="text-3xl sm:text-4xl lg:text-5xl">{service.title}</h1>
 <button style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "10px 16px", background: "none", cursor: "pointer", flexShrink: 0 }}>
 Add to Favorites <Ico.Heart />
 </button>
 </div>

 {/* 2-Column Main Layout */}
 <div className="flex flex-col lg:flex-row gap-6 items-start">

 {/* LEFT: Content */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <HeroBanner service={service} />

 {/* Trust Badges */}
 <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 16, paddingBottom: 24, borderBottom: "1px solid #1e1e1e" }}>
 {[
 { icon: <Ico.Lock />, label: "SSL Secure" },
 { icon: <Ico.Shield />, label: "VPN, Safe Boost" },
 { icon: <Ico.Shield />, label: "Safe Service" },
 { icon: <Ico.Support />, label: "24/7 Support" },
 { icon: <Ico.Dollar />, label: "Money refunds" },
 { icon: <Ico.Refresh />, label: "Cashback 5%" },
 ].map(b => (
 <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, color: "#888", fontSize: 12 }}>
 {b.icon} {b.label}
 </div>
 ))}
 </div>

 {/* Description */}
 <div style={{ marginTop: 32, color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>
 <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 32, marginBottom: 16 }}>Description</h2>
 <div dangerouslySetInnerHTML={{ __html: service.description }} style={{ marginBottom: 20 }} />

 {service.features?.length > 0 && (
 <>
 <p style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>With our {service.title} boost, you will get:</p>
 <ol style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
 {service.features.map((item, i) => (
 <li key={i} style={{ display: "flex", gap: 12 }}>
 <span style={{ color: "#555", fontWeight: 500, minWidth: 16 }}>{i + 1}</span>
 <span>{item}</span>
 </li>
 ))}
 </ol>
 </>
 )}
 </div>

 {/* Requirements */}
 <div style={{ marginTop: 32 }}>
 <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 32, marginBottom: 12 }}>Requirements</h2>
 <ul style={{ listStyle: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: 8 }}>
 {service.requirements?.length > 0 ? service.requirements.map(r => (
 <li key={r} style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc", fontSize: 14 }}>
 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#555", flexShrink: 0 }} />
 {r}
 </li>
 )) : (
 <li style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc", fontSize: 14 }}>
 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#555", flexShrink: 0 }} />
 Active account for {service.gameId?.name || "Game"}
 </li>
 )}
 </ul>
 </div>



 {/* How it works */}
 <div style={{ marginTop: 20, borderRadius: 20, background: "linear-gradient(135deg,#1a1240 0%,#2d1b69 50%,#1a1240 100%)", padding: "32px 28px" }}>
 <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 30, marginBottom: 28 }}>How it works</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
 {[
 { n: 1, label: "Choose your service" },
 { n: 2, label: "Get matched with a top PRO" },
 { n: 3, label: "Track your order in real-time" },
 { n: 4, label: "Enjoy your rewards!" },
 ].map((s, i, arr) => (
 <div key={s.n} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
 <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 10 }}>
 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0, zIndex: 1 }}>{s.n}</div>
 {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "#4a3a6a", marginLeft: 8 }} />}
 </div>
 <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{s.label}</span>
 </div>
 ))}
 </div>

 <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
 {[
 { icon: <Ico.Bolt />, label: "Instant order processing" },
 { icon: <Ico.User />, label: "In-house PROs" },
 { icon: <Ico.Dollar />, label: "Money-back guarantee" },
 { icon: <Ico.Shield />, label: "VPN protection" },
 ].map(b => (
 <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "#ddd" }}>
 <span style={{ color: "#aaa" }}>{b.icon}</span> {b.label}
 </div>
 ))}
 </div>
 </div>

 {/* Custom order banner */}
 <div className="mt-5 mb-8 rounded-[20px] overflow-hidden relative" style={{ background: "#1a1a1a", minHeight: 160 }}>
 <div className="p-7 sm:p-10 max-w-xs sm:max-w-md relative z-10">
 <p style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>CAN'T FIND WHAT YOU NEED?</p>
 <h3 className="text-2xl sm:text-4xl" style={{ color: "#fff", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.15 }}>Get personalized offer</h3>
 <p style={{ color: "#888", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Contact us and we'll find the best deal or create a personalized order for you at a lower price.</p>
 <button style={{ background: "#7c3aed", border: "none", borderRadius: 12, padding: "14px 24px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Create custom order</button>
 </div>
 <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", background: "linear-gradient(135deg,transparent 0%,rgba(124,58,237,0.25) 100%)", clipPath: "polygon(18% 0,100% 0,100% 100%,0% 100%)", zIndex: 1 }} />
 <svg viewBox="0 0 160 200" className="hidden sm:block" style={{ position: "absolute", right: 16, bottom: 0, height: "100%", width: 160, zIndex: 1, opacity: 0.3 }}>
 <circle cx="80" cy="35" r="22" fill="#7c3aed" />
 <rect x="55" y="58" width="50" height="70" rx="8" fill="#5b21b6" />
 <rect x="25" y="65" width="32" height="50" rx="10" fill="#4c1d95" />
 <rect x="103" y="65" width="32" height="50" rx="10" fill="#4c1d95" />
 <rect x="58" y="126" width="16" height="55" rx="7" fill="#3b0764" />
 <rect x="86" y="126" width="16" height="55" rx="7" fill="#3b0764" />
 </svg>
 </div>
 <div className="h-16" />
 </div>

 {/* RIGHT SIDEBAR (sticky on desktop) */}
 <div className="w-full lg:w-auto lg:sticky lg:top-20 shrink-0">
 <RedesignedSidebar
 service={service}
 total={totalPrice}
 quantity={quantity}
 setQuantity={setQuantity}
 selectedOptions={selectedOptions}
 setSelectedOptions={setSelectedOptions}
 speed={speed}
 setSpeed={setSpeed}
 onBuy={handleBuyNow}
 onChat={() => window.dispatchEvent(new CustomEvent('openSupportChat'))}
 />
 </div>
 </div>
 </div>


 </div>
 );
}
