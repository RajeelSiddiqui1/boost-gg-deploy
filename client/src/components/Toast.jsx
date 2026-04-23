import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Toast = ({ toast }) => {
 const { removeToast } = useToast();

 const icons = {
 success: <CheckCircle className="w-5 h-5" />,
 error: <XCircle className="w-5 h-5" />,
 warning: <AlertCircle className="w-5 h-5" />,
 info: <Info className="w-5 h-5" />
 };

 const styles = {
 success: 'bg-green-500/10 border-green-500/30 text-green-500',
 error: 'bg-red-500/10 border-red-500/30 text-red-500',
 warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
 info: 'bg-blue-500/10 border-blue-500/30 text-blue-500'
 };

 return (
 <div
 className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-[480px] animate-slide-in ${styles[toast.type]}`}
 >
 <div className="flex-shrink-0">
 {icons[toast.type]}
 </div>
 <p className="flex-1 text-sm font-bold text-white">
 {toast.message}
 </p>
 <button
 onClick={() => removeToast(toast.id)}
 className="flex-shrink-0 hover:opacity-70 transition-opacity"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 );
};

const ToastContainer = () => {
 const { toasts } = useToast();

 return (
 <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
 {toasts.map(toast => (
 <div key={toast.id} className="pointer-events-auto">
 <Toast toast={toast} />
 </div>
 ))}

 <style>{`
 @keyframes slide-in {
 from {
 transform: translateX(400px);
 opacity: 0;
 }
 to {
 transform: translateX(0);
 opacity: 1;
 }
 }
 .animate-slide-in {
 animation: slide-in 0.3s ease-out;
 }
 `}</style>
 </div>
 );
};

export default ToastContainer;
