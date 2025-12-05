
import React, { useState } from 'react';
import { User, AppLanguage } from '../types';
import { SmartLogo } from '../components/Common';
import { TRANSLATIONS } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
  users: User[];
  lang?: AppLanguage;
  allowSignup?: boolean;
}

export const LoginPage = ({ onLogin, onSwitchToRegister, users, lang = 'ar', allowSignup = true }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
        (u.username?.toLowerCase() === username.toLowerCase()) && 
        u.password === password
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError(t.auth.errorMsg);
    }
  };

  const handleFactoryReset = () => {
      if (confirm('⚠️ Warning: This will delete ALL data (tasks, users, settings) and return to the initial demo state.\n\nAre you sure?')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-900 rounded-b-[50%] scale-x-150"></div>

       <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="flex justify-center mb-8">
             <SmartLogo className="h-16" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">{t.auth.loginTitle}</h2>
          <p className="text-center text-slate-500 mb-8">{t.auth.systemName}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.auth.username}</label>
               <input 
                 type="text" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                 value={username}
                 onChange={e => setUsername(e.target.value)}
                 autoFocus
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.auth.password}</label>
               <input 
                 type="password" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
            </div>

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}

            <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200">
               {t.auth.loginBtn}
            </button>
          </form>

          {allowSignup && (
              <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 mb-2">ليس لديك حساب؟</p>
                  <button 
                    onClick={onSwitchToRegister} 
                    className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                  >
                      إنشاء مؤسسة جديدة
                  </button>
              </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="text-xs text-center text-slate-400 space-y-2">
                <p>{t.auth.demoData}:</p>
                <div className="flex justify-center gap-2 flex-wrap mb-4">
                   <span className="bg-slate-100 px-2 py-1 rounded">ahmed / 123</span>
                   <span className="bg-slate-100 px-2 py-1 rounded">sara / 123</span>
                </div>
                
                <button onClick={handleFactoryReset} className="text-red-300 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto">
                    <i className="fa-solid fa-triangle-exclamation"></i> Factory Reset
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
