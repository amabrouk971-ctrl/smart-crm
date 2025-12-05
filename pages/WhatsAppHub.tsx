
import React, { useState, useEffect } from 'react';
import { Customer, WhatsAppMessage, AppLanguage, User } from '../types';
import { MOCK_MESSAGES } from '../data';

interface WhatsAppHubProps {
    customers: Customer[];
    setCustomers: (c: Customer[]) => void;
    lang: AppLanguage;
    currentUser: User;
}

export const WhatsAppHub = ({ customers, setCustomers, lang, currentUser }: WhatsAppHubProps) => {
    const [messages, setMessages] = useState<WhatsAppMessage[]>(MOCK_MESSAGES);
    const [isConnected, setIsConnected] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    // Filter messages that come from unknown numbers
    const getUnknownMessages = () => {
        return messages.filter(msg => !customers.some(c => c.phone === msg.senderNumber));
    };

    const handleConnect = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsSimulating(false);
        }, 2000);
    };

    const handleSimulateIncoming = () => {
        const randomNum = `01${Math.floor(Math.random() * 900000000 + 100000000)}`;
        const newMsg: WhatsAppMessage = {
            id: `wa-new-${Date.now()}`,
            organizationId: currentUser.organizationId,
            senderNumber: randomNum,
            senderName: `Mobile User ${randomNum.slice(-4)}`,
            message: 'مرحباً، هل يوجد دورات صيانة قريباً؟',
            timestamp: new Date().toISOString(),
            isProcessed: false
        };
        setMessages([newMsg, ...messages]);
    };

    const addToCustomers = (msg: WhatsAppMessage) => {
        const newCustomer: Customer = {
            id: `C-WA-${Date.now()}`,
            organizationId: currentUser.organizationId,
            name: msg.senderName || 'New WhatsApp User',
            phone: msg.senderNumber,
            email: '',
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            notes: `Added via WhatsApp Gateway. First message: ${msg.message}`,
            history: []
        };
        setCustomers([...customers, newCustomer]);
        setMessages(messages.map(m => m.id === msg.id ? { ...m, isProcessed: true } : m));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-green-200">
                        <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">WhatsApp Gateway</h2>
                        <p className="text-slate-500 text-sm">ربط الرسائل بقاعدة بيانات العملاء</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                     {!isConnected ? (
                         <button onClick={handleConnect} disabled={isSimulating} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                             {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-qrcode"></i>}
                             ربط الجهاز
                         </button>
                     ) : (
                         <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                             </span>
                             <span className="font-bold">متصل</span>
                         </div>
                     )}
                     
                     {isConnected && (
                         <button onClick={handleSimulateIncoming} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-blue-700">
                             <i className="fa-solid fa-paper-plane ml-2"></i> محاكاة رسالة
                         </button>
                     )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                        <div className="text-slate-500 text-xs font-bold">رسائل اليوم</div>
                        <div className="text-2xl font-bold">{messages.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                        <div className="text-slate-500 text-xs font-bold">أرقام غير مسجلة</div>
                        <div className="text-2xl font-bold text-red-600">{getUnknownMessages().length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                         <div className="text-slate-500 text-xs font-bold">تمت إضافتهم</div>
                         <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.isProcessed).length}</div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg">سجل الرسائل الواردة</h3>
                        <span className="text-xs text-slate-400">تحديث لحظي</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {messages.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">لا توجد رسائل</div>
                        ) : (
                            messages.map(msg => {
                                const existingCustomer = customers.find(c => c.phone === msg.senderNumber);
                                const isUnknown = !existingCustomer;
                                
                                return (
                                    <div key={msg.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0
                                                ${isUnknown ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                                            `}>
                                                <i className={`fa-solid ${isUnknown ? 'fa-user-question' : 'fa-user-check'}`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800">
                                                        {existingCustomer ? existingCustomer.name : msg.senderName || msg.senderNumber}
                                                    </h4>
                                                    {isUnknown && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">جديد</span>}
                                                </div>
                                                <p className="text-slate-500 text-sm mt-1">{msg.message}</p>
                                                <span className="text-xs text-slate-400 block md:hidden mt-2">{new Date(msg.timestamp).toLocaleTimeString('ar-EG')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                             <div className="text-left hidden md:block">
                                                 <div className="text-xs font-bold text-slate-600">{msg.senderNumber}</div>
                                                 <div className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleTimeString('ar-EG')}</div>
                                             </div>
                                             
                                             {isUnknown ? (
                                                 <button 
                                                    onClick={() => addToCustomers(msg)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 whitespace-nowrap"
                                                 >
                                                     + إضافة للعملاء
                                                 </button>
                                             ) : (
                                                 <button className="text-slate-400 hover:text-green-600 px-4">
                                                     <i className="fa-solid fa-check-double text-lg"></i>
                                                 </button>
                                             )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};