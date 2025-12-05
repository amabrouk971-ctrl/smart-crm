
import React, { useState } from 'react';
import { User, Task, InventoryItem, MaintenanceTicket, Customer, FinanceRecord, Glitch, AppLanguage } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SmartDashboardProps {
    users: User[];
    tasks: Task[];
    inventory: InventoryItem[];
    tickets: MaintenanceTicket[];
    customers: Customer[];
    finance: FinanceRecord[];
    glitches: Glitch[];
    lang: AppLanguage;
}

export const SmartDashboard = ({ users, tasks, inventory, tickets, customers, finance, glitches, lang }: SmartDashboardProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [swotData, setSwotData] = useState<{ s: string[], w: string[], o: string[], t: string[] } | null>(null);

    // --- Calculated Metrics ---
    const totalIncome = finance.filter(f => f.type === 'Income').reduce((acc, f) => acc + f.amount, 0);
    const totalExpense = finance.filter(f => f.type === 'Expense').reduce((acc, f) => acc + f.amount, 0);
    const netProfit = totalIncome - totalExpense;
    
    const taskCompletionRate = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) 
        : 0;
    
    const operationalHealth = Math.max(0, 100 - (glitches.filter(g => g.status === 'Open').length * 5) - (tickets.filter(t => t.status !== 'Done').length * 2));

    const handleGenerateSWOT = async () => {
        setIsAnalyzing(true);
        try {
            if (!process.env.API_KEY) {
                // Mock for demo
                setTimeout(() => {
                    setSwotData({
                        s: ["فريق عمل ذو كفاءة عالية (High Performance)", "رضا عملاء مرتفع في قطاع التدريب", "تدفق مالي إيجابي"],
                        w: ["تكرار أعطال التكييف في القاعات", "بعض المهام تتأخر عن الموعد المحدد", "نقص في مخزون قطع الغيار"],
                        o: ["توسيع الدورات لتشمل البرمجة المتقدمة", "استخدام قاعدة البيانات للتسويق المباشر", "زيادة سعة المعمل 3"],
                        t: ["ارتفاع تكاليف الصيانة", "المنافسة من المراكز المجاورة"]
                    });
                    setIsAnalyzing(false);
                }, 2000);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const summary = {
                financial: { income: totalIncome, expense: totalExpense, profit: netProfit },
                operations: { 
                    totalTasks: tasks.length, 
                    lateTasks: tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Done').length,
                    openTickets: tickets.filter(t => t.status !== 'Done').length,
                    glitches: glitches.length
                },
                customers: { total: customers.length, newThisMonth: customers.filter(c => new Date(c.joinedDate) > new Date(Date.now() - 30*24*60*60*1000)).length },
                inventory: { lowStock: inventory.filter(i => i.status !== 'Available').length }
            };

            const prompt = `
                Act as a Strategic Business Analyst for a Training Center. 
                Analyze this data JSON: ${JSON.stringify(summary)}.
                Generate a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats).
                Return ONLY a JSON object with keys "s", "w", "o", "t" where each is an array of strings (Arabic).
                Keep points concise and professional.
            `;

            const result = await ai.models.generateContent({ 
                model: "gemini-2.5-flash", 
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            
            let text = result.text || "{}";
            // Robust cleaning for Markdown JSON blocks
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
                text = text.substring(firstOpen, lastClose + 1);
            }
            const data = JSON.parse(text);
            
            setSwotData(data);

        } catch (e) {
            console.error(e);
            alert("حدث خطأ أثناء التحليل");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                        <i className="fa-solid fa-chart-network text-blue-400"></i> لوحة التحليل الذكي
                    </h1>
                    <p className="text-slate-400 text-sm">Real-time Data Analysis & AI Insights</p>
                </div>
                <button 
                    onClick={handleGenerateSWOT}
                    disabled={isAnalyzing}
                    className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2"
                >
                    {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    {isAnalyzing ? 'جاري التحليل...' : 'توليد تحليل SWOT'}
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
                    <div className="text-slate-500 text-xs font-bold uppercase">صافي الربح</div>
                    <div className="text-3xl font-black text-slate-800 mt-2">{netProfit.toLocaleString()}</div>
                    <div className="text-xs text-green-600 mt-1 font-bold">+15% vs Last Month</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
                    <div className="text-slate-500 text-xs font-bold uppercase">كفاءة المهام</div>
                    <div className="text-3xl font-black text-slate-800 mt-2">{taskCompletionRate}%</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2"><div className="bg-blue-500 h-full rounded-full" style={{width: `${taskCompletionRate}%`}}></div></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
                    <div className="text-slate-500 text-xs font-bold uppercase">قاعدة العملاء</div>
                    <div className="text-3xl font-black text-slate-800 mt-2">{customers.length}</div>
                    <div className="text-xs text-indigo-600 mt-1 font-bold">Active & VIP</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500">
                    <div className="text-slate-500 text-xs font-bold uppercase">صحة النظام</div>
                    <div className="text-3xl font-black text-slate-800 mt-2">{operationalHealth}%</div>
                    <div className="text-xs text-slate-400 mt-1">Based on Glitches/Tickets</div>
                </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">الأداء المالي</h3>
                    <div className="flex items-end justify-center gap-8 h-40">
                        <div className="w-16 bg-green-100 rounded-t-xl relative group h-full">
                            <div className="absolute bottom-0 w-full bg-green-500 rounded-t-xl transition-all duration-1000 group-hover:bg-green-600" style={{height: '80%'}}></div>
                            <span className="absolute -bottom-6 w-full text-center text-xs font-bold text-slate-500">Income</span>
                        </div>
                        <div className="w-16 bg-red-100 rounded-t-xl relative group h-full">
                            <div className="absolute bottom-0 w-full bg-red-500 rounded-t-xl transition-all duration-1000 group-hover:bg-red-600" style={{height: `${(totalExpense/totalIncome)*80}%`}}></div>
                            <span className="absolute -bottom-6 w-full text-center text-xs font-bold text-slate-500">Expense</span>
                        </div>
                    </div>
                </div>

                {/* Operations Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">التشغيل والصيانة</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1"><span>Active Tasks</span><span>{tasks.filter(t=>t.status!=='Done').length}</span></div>
                            <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: '70%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1"><span>Open Tickets</span><span>{tickets.filter(t=>t.status!=='Done').length}</span></div>
                            <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{width: '30%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1"><span>Inventory Health</span><span>{inventory.filter(i=>i.status==='Available').length}/{inventory.length}</span></div>
                            <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{width: '85%'}}></div></div>
                        </div>
                    </div>
                </div>

                {/* Sentiment Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-4 self-start">رضا العملاء</h3>
                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 border-t-green-500 border-r-green-500 transform -rotate-45 flex items-center justify-center shadow-inner">
                        <div className="text-center transform rotate-45">
                            <div className="text-2xl font-black text-slate-800">4.8</div>
                            <div className="text-xs text-slate-400">/ 5.0</div>
                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-4 px-4">
                        بناءً على الشكاوى (Glitches) وتقييمات الـ Feedback.
                    </p>
                </div>
            </div>

            {/* SWOT Analysis Section */}
            {swotData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-dumbbell"></i> نقاط القوة (Strengths)
                        </h3>
                        <ul className="space-y-2">
                            {swotData.s.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                                    <i className="fa-solid fa-check mt-1 opacity-60"></i> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-link-slash"></i> نقاط الضعف (Weaknesses)
                        </h3>
                        <ul className="space-y-2">
                            {swotData.w.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                                    <i className="fa-solid fa-xmark mt-1 opacity-60"></i> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-lightbulb"></i> الفرص (Opportunities)
                        </h3>
                        <ul className="space-y-2">
                            {swotData.o.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
                                    <i className="fa-solid fa-arrow-trend-up mt-1 opacity-60"></i> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-shield-virus"></i> التهديدات (Threats)
                        </h3>
                        <ul className="space-y-2">
                            {swotData.t.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                                    <i className="fa-solid fa-triangle-exclamation mt-1 opacity-60"></i> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
