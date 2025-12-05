import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Task, InventoryItem, FinanceRecord, AppLanguage, Page } from '../types';
import { TRANSLATIONS } from '../data';

interface AIAssistantProps {
    currentUser: User;
    contextData: {
        users: User[];
        tasks: Task[];
        inventory: InventoryItem[];
        finance: FinanceRecord[];
    };
    onNavigate: (page: Page) => void;
    lang: AppLanguage;
}

export const AIAssistant = ({ currentUser, contextData, onNavigate, lang }: AIAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: lang === 'ar' ? `مرحباً ${currentUser.name} 👋، أنا مساعدك الذكي. اسألني عن أي بيانات في النظام أو اطلب مني المساعدة في التحليل.` : `Hi ${currentUser.name} 👋, I'm your Smart Assistant. Ask me about data or help with analysis.` }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsThinking(true);

        try {
            if (!process.env.API_KEY) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'ai', text: "API Key missing. Please configure it in settings." }]);
                    setIsThinking(false);
                }, 1000);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Prepare Context Summary
            const summary = {
                activeTasks: contextData.tasks.filter(t => t.status !== 'Done').map(t => `${t.title} (${t.priority})`),
                lowStock: contextData.inventory.filter(i => i.status !== 'Available').map(i => `${i.name} (${i.quantity})`),
                financials: {
                    income: contextData.finance.filter(f => f.type === 'Income').reduce((a, b) => a + b.amount, 0),
                    expense: contextData.finance.filter(f => f.type === 'Expense').reduce((a, b) => a + b.amount, 0)
                },
                staff: contextData.users.filter(u => u.type === 'staff').map(u => `${u.name}: ${u.points} XP`)
            };

            const systemPrompt = `
                You are the "SmartTech Brain", an AI assistant inside a CRM/ERP system.
                
                Current Context Data:
                ${JSON.stringify(summary)}
                
                Capabilities:
                1. Answer questions about the data above.
                2. If the user asks to go to a page, reply with strictly "NAVIGATE:page_name" (e.g., NAVIGATE:settings, NAVIGATE:inventory).
                3. Be concise, professional, and helpful.
                4. Language: Reply in ${lang === 'ar' ? 'Arabic' : 'English'}.
            `;

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: input,
                config: { systemInstruction: systemPrompt }
            });

            const responseText = result.text || "Sorry, I didn't catch that.";

            // Check for navigation command
            if (responseText.includes("NAVIGATE:")) {
                // Sanitize page name: remove punctuation, extra spaces, keep only letters and underscores
                const rawPage = responseText.split(":")[1];
                const page = rawPage.trim().toLowerCase().replace(/[^a-z_]/g, '') as Page;
                onNavigate(page);
                setMessages(prev => [...prev, { role: 'ai', text: lang === 'ar' ? `جاري الانتقال إلى ${page}...` : `Navigating to ${page}...` }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
            }

        } catch (e) {
            console.error("AI Error", e);
            setMessages(prev => [...prev, { role: 'ai', text: "حدث خطأ في الاتصال بالذكاء الاصطناعي." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110
                    ${isOpen ? 'bg-red-500 rotate-45' : 'bg-gradient-to-r from-violet-600 to-indigo-600 animate-bounce-slow'}
                `}
            >
                {isOpen ? <i className="fa-solid fa-plus text-white text-2xl"></i> : <i className="fa-solid fa-wand-magic-sparkles text-white text-2xl"></i>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 left-6 z-50 w-96 h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <i className="fa-solid fa-brain"></i>
                            </div>
                            <div>
                                <h3 className="font-bold">المساعد الذكي</h3>
                                <p className="text-[10px] text-violet-200">SmartTech Brain AI</p>
                            </div>
                        </div>
                        <button onClick={() => setMessages([])} className="text-white/60 hover:text-white" title="مسح المحادثة"><i className="fa-solid fa-trash-can"></i></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-500 rounded-2xl p-3 text-xs border border-slate-200 rounded-bl-none flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                            <input 
                                className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder={lang === 'ar' ? "كيف يمكنني مساعدتك؟" : "How can I help?"}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" disabled={!input.trim() || isThinking} className="bg-violet-600 text-white w-12 h-12 rounded-xl hover:bg-violet-700 flex items-center justify-center transition-colors disabled:opacity-50">
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};