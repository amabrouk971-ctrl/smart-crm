
import React, { useState } from 'react';
import { AppLanguage, Organization, User } from '../types';
import { SmartLogo } from '../components/Common';
import { TRANSLATIONS } from '../data';

interface RegisterProps {
    onRegister: (org: Organization, admin: User) => void;
    onSwitchToLogin: () => void;
    lang?: AppLanguage;
}

export const RegisterPage = ({ onRegister, onSwitchToLogin, lang = 'ar' }: RegisterProps) => {
    const [step, setStep] = useState(1);
    const [orgName, setOrgName] = useState('');
    const [logo, setLogo] = useState<string | undefined>(undefined);
    
    const [adminName, setAdminName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const t = TRANSLATIONS[lang];

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPass) {
            alert('كلمة المرور غير متطابقة');
            return;
        }

        const newOrgId = `ORG-${Date.now()}`;
        const newOrg: Organization = {
            id: newOrgId,
            name: orgName,
            logo: logo,
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'royal',
                font: 'Cairo',
                language: lang,
                currency: 'EGP',
                dateFormat: 'YYYY-MM-DD',
                biometricEnabled: false,
                notificationsEnabled: true,
                features: {
                    tasks: true, crm: true, inventory: true, lab: true, 
                    learning: true, gamification: true, finance: true, 
                    hr: true, social: true, glitches: true, marketing: true
                }
            }
        };

        const newAdmin: User = {
            id: `U-${Date.now()}`,
            organizationId: newOrgId,
            name: adminName,
            username: username,
            password: password,
            role: 'Admin',
            type: 'staff',
            avatar: '👔',
            points: 0,
            level: 1,
            badges: [],
            performanceMetric: 100,
            smartCoins: 0,
            karma: 0
        };

        onRegister(newOrg, newAdmin);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-l from-indigo-900 to-blue-900 rounded-b-[50%] scale-x-150"></div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <SmartLogo className="h-12 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">إنشاء مؤسسة جديدة</h2>
                    <p className="text-slate-500 text-sm">اصنع نظام الـ CRM الخاص بك في دقائق</p>
                </div>

                <div className="flex gap-2 mb-6">
                    <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in-right">
                            <h3 className="font-bold text-lg text-slate-700">1. بيانات المؤسسة</h3>
                            <div>
                                <label className="block text-sm font-bold mb-1">اسم المؤسسة / الشركة</label>
                                <input 
                                    required 
                                    className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    placeholder="مثال: شركة النخبة للتكنولوجيا"
                                    value={orgName}
                                    onChange={e => setOrgName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">شعار المؤسسة (اختياري)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                                    {logo ? (
                                        <img src={logo} alt="Logo Preview" className="h-20 mx-auto object-contain" />
                                    ) : (
                                        <div className="text-slate-400">
                                            <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                                            <p className="text-xs">اضغط لرفع الشعار (Logo)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                type="button" 
                                disabled={!orgName}
                                onClick={() => setStep(2)} 
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
                            >
                                التالي <i className="fa-solid fa-arrow-left mr-2"></i>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in-right">
                            <h3 className="font-bold text-lg text-slate-700">2. حساب المدير (Admin)</h3>
                            <div>
                                <label className="block text-sm font-bold mb-1">الاسم الكامل</label>
                                <input 
                                    required 
                                    className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">اسم المستخدم (للدخول)</label>
                                <input 
                                    required 
                                    className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">كلمة المرور</label>
                                    <input 
                                        required 
                                        type="password"
                                        className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">تأكيد كلمة المرور</label>
                                    <input 
                                        required 
                                        type="password"
                                        className="w-full border-2 border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    السابق
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                                >
                                    إتمام التسجيل 🚀
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        لديك حساب بالفعل؟ 
                        <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline mr-1">تسجيل الدخول</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
