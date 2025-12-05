
import React, { useEffect, useRef } from 'react';
import { Notification, NotificationCategory, AppLanguage, Organization } from '../types';
import { translateCategory } from '../data';

interface LogoProps {
    className?: string;
    organization?: Organization | null;
}

export const SmartLogo = ({ className = "h-12", organization }: LogoProps) => {
  if (organization?.logo) {
      return (
          <div className={`flex items-center gap-3 select-none ${className}`}>
              <img src={organization.logo} alt={organization.name} className="h-full object-contain max-h-12 rounded-lg" />
              <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{organization.name}</span>
                  <div className="h-[1px] w-full bg-gradient-to-r from-slate-300 to-transparent my-0.5 dark:from-slate-600"></div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">CRM System</span>
              </div>
          </div>
      );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="relative w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-800 opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center -space-x-1 transform scale-110 group-hover:scale-125 transition-transform duration-500">
            <span className="text-4xl font-black text-red-700 font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>T</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white font-serif -ml-1" style={{ fontFamily: 'Times New Roman, serif' }}>S</span>
        </div>
        </div>

        <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
            <span className="text-2xl font-bold text-red-700 tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>Tech</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>Smart</span>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-slate-300 to-transparent my-0.5 dark:from-slate-600"></div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>Training Center</span>
        </div>
    </div>
  );
};

export const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 5 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 2 * Math.PI,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.y += p.speed;
        p.angle += p.spin;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const timeout = setTimeout(() => cancelAnimationFrame(animationId), 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

export const ToastContainer = ({ 
    notifications, 
    removeNotification, 
    clearAllNotifications, 
    filter, 
    setFilter,
    lang
  }: { 
    notifications: Notification[], 
    removeNotification: (id: string) => void,
    clearAllNotifications: () => void,
    filter: NotificationCategory | 'all',
    setFilter: (f: NotificationCategory | 'all') => void,
    lang: AppLanguage
  }) => {
    
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filter);

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-96 max-h-[80vh] pointer-events-none">
      {notifications.length > 0 && (
         <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-xl rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex justify-between items-center animate-fade-in-up pointer-events-auto mb-2">
           <div className="flex gap-2">
             <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>الكل</button>
             <button onClick={() => setFilter('task')} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${filter === 'task' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><i className="fa-solid fa-tasks ml-1"></i>مهام</button>
             <button onClick={() => setFilter('gamification')} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${filter === 'gamification' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><i className="fa-solid fa-trophy ml-1"></i>ألعاب</button>
           </div>
           <button onClick={clearAllNotifications} className="text-xs text-red-500 hover:text-red-700 px-2 font-bold hover:bg-red-50 dark:hover:bg-red-900/30 rounded py-1 transition-colors">مسح الكل</button>
         </div>
      )}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] p-1 pointer-events-auto scrollbar-hide">
        {filteredNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`relative p-4 rounded-xl shadow-lg border-r-4 flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] cursor-pointer
              ${notification.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-500 text-slate-800 dark:text-slate-200' : 
                notification.type === 'warning' ? 'bg-white dark:bg-slate-800 border-amber-500 text-slate-800 dark:text-slate-200' : 
                'bg-white dark:bg-slate-800 border-blue-500 text-slate-800 dark:text-slate-200'}
              ${notification.isExiting ? 'animate-fade-out-right opacity-0' : 'animate-fade-in-right opacity-100'}
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <div className={`absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            <div className="flex flex-col relative z-10">
              <span className={`text-[10px] font-bold mb-1 flex items-center gap-1 uppercase tracking-wider
                ${notification.type === 'success' ? 'text-green-600 dark:text-green-400' : notification.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}
              `}>
                {notification.category === 'gamification' && <i className="fa-solid fa-star"></i>}
                {notification.category === 'task' && <i className="fa-solid fa-clipboard-check"></i>}
                {notification.category === 'system' && <i className="fa-solid fa-server"></i>}
                {translateCategory(notification.category, lang)}
              </span>
              <span className="font-medium text-sm leading-tight">{notification.message}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};