
import React, { useState } from 'react';
import { Glitch, User, AppLanguage, Customer } from '../types';
import { translateStatus, translatePriority } from '../data';
import { GoogleGenAI } from "@google/genai";

interface GlitchesProps {
    glitches: Glitch[];
    setGlitches: (g: Glitch[]) => void;
    users: User[];
    customers: Customer[];
    currentUser: User;
    onAddGlitch: (g: Glitch) => void;
    lang: AppLanguage;
}

export const GlitchView = ({ glitches, setGlitches, users, customers, currentUser, onAddGlitch, lang }: GlitchesProps) => {
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState<'dashboard' | 'analysis'>('dashboard');
    const [analysisReport, setAnalysisReport] = useState<any | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Pending' | 'Resolved'>('All');
    const [severityFilter, setSeverityFilter] = useState<'All' | 'Low' | 'Medium' | 'Critical'>('All');

    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    // --- Statistics Calculations ---
    const totalGlitches = glitches.length;
    const openGlitches = glitches.filter(g => g.status === 'Open').length;
    const resolvedGlitches = glitches.filter(g => g.status === 'Resolved').length;
    const criticalGlitches = glitches.filter(g => g.severity === 'Critical' && g.status !== 'Resolved').length;
    const resolutionRate = totalGlitches > 0 ? Math.round((resolvedGlitches / totalGlitches) * 100) : 0;

    // Category Distribution
    const categories = ['Service', 'Facility', 'Staff', 'Product', 'Other'];
    const categoryStats = categories.map(cat => ({
        name: cat,
        count: glitches.filter(g => g.category === cat).length,
        percentage: totalGlitches > 0 ? (glitches.filter(g => g.category === cat).length / totalGlitches) * 100 : 0
    })).sort((a,b) => b.count - a.count);

    // Filtered Data
    const filteredGlitches = glitches.filter(g => {
        const matchesSearch = g.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              g.guestPhone?.includes(searchQuery) ||
                              g.guestComplaint.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
        const matchesSeverity = severityFilter === 'All' || g.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    }).sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

    const handleQuickResolve = (id: string) => {
        if(confirm('هل أنت متأكد من إغلاق هذه الشكوى وتم حل المشكلة؟')) {
            setGlitches(glitches.map(g => g.id === id ? { ...g, status: 'Resolved', resolvedAt: new Date().toISOString() } : g));
        }
    };

    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            if (!process.env.API_KEY) {
                // Mock Analysis if no API Key
                setTimeout(() => {
                    setAnalysisReport({
                        weaknesses: "تكرار شكاوى التكييف في القاعات مما يشير لضعف الصيانة الدورية.",
                        strengths: "سرعة استجابة الموظفين للشكاوى البسيطة وتقديم تعويضات فورية.",
                        suggestions: "1. جدول صيانة دوري للتكييفات.\n2. تدريب الموظفين على امتصاص غضب العميل."
                    });
                    setIsAnalyzing(false);
                }, 2000);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Sort by date descending then slice to get most recent 50
            const recentGlitches = [...glitches]
                .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                .slice(0, 50)
                .map(g => ({ complaint: g.guestComplaint, response: g.employeeResponse, category: g.category }));

            const prompt = `Analyze these customer complaints (Glitches) for a training center and provide a report in JSON format with keys: weaknesses, strengths, suggestions. Data: ${JSON.stringify(recentGlitches)}`;
            
            const result = await ai.models.generateContent({ 
                model: "gemini-2.5-flash", 
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            
            let text = result.text || "{}";
            // Robust cleaning
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
                text = text.substring(firstOpen, lastClose + 1);
            }
            const data = JSON.parse(text);
            setAnalysisReport(data);

        } catch (e) {
            console.error("AI Analysis Error", e);
            alert("حدث خطأ أثناء التحليل");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderSafeContent = (content: any) => {
        if (!content) return <span className="text-slate-400">N/A</span>;
        if (typeof content === 'string') return <p className="whitespace-pre-wrap">{content}</p>;
        if (Array.isArray(content)) {
            return (
                <ul className="list-disc list-inside space-y-1">
                    {content.map((item, idx) => (
                        <li key={idx}>
                            {typeof item === 'object' ? (item.description || item.text || item.point || JSON.stringify(item)) : item}
                        </li>
                    ))}
                </ul>
            );
        }
        return <p>{String(content)}</p>;
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Toolbar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xl">
                            <i className="fa-solid fa-bug"></i>
                        </span>
                        نظام إدارة الشكاوى (Glitch Dashboard)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">تتبع الجودة ورضا العملاء لحظة بلحظة</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <button 
                            onClick={() => setViewMode(viewMode === 'dashboard' ? 'analysis' : 'dashboard')} 
                            className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 border shadow-sm ${viewMode === 'analysis' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {viewMode === 'dashboard' ? <><i className="fa-solid fa-brain text-purple-500"></i> تحليل الذكاء الاصطناعي</> : <><i className="fa-solid fa-table-columns"></i> العودة للوحة التحكم</>}
                        </button>
                    )}
                    <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black flex items-center gap-2 transition-transform hover:-translate-y-1">
                        <i className="fa-solid fa-plus"></i> تسجيل شكوى
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">إجمالي الشكاوى</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-2">{totalGlitches}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><i className="fa-solid fa-folder-open"></i></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start border-r-4 border-red-500">
                            <div>
                                <p className="text-red-500 text-xs font-bold uppercase tracking-wider">قيد الفتح</p>
                                <h3 className="text-3xl font-black text-red-600 mt-2">{openGlitches}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><i className="fa-solid fa-triangle-exclamation animate-pulse"></i></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                            <div>
                                <p className="text-green-600 text-xs font-bold uppercase tracking-wider">معدل الحل</p>
                                <h3 className="text-3xl font-black text-green-700 mt-2">{resolutionRate}%</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><i className="fa-solid fa-check-circle"></i></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                            <div>
                                <p className="text-amber-500 text-xs font-bold uppercase tracking-wider">حالات حرجة</p>
                                <h3 className="text-3xl font-black text-amber-600 mt-2">{criticalGlitches}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><i className="fa-solid fa-fire"></i></div>
                        </div>
                    </div>

                    {/* Charts & Graphs Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Category Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                            <h3 className="font-bold text-lg text-slate-800 mb-6">توزيع الشكاوى حسب التصنيف</h3>
                            <div className="space-y-4">
                                {categoryStats.map(cat => (
                                    <div key={cat.name} className="flex items-center gap-4">
                                        <div className="w-24 text-sm font-bold text-slate-600">{cat.name}</div>
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${cat.name === 'Facility' ? 'bg-amber-500' : cat.name === 'Service' ? 'bg-blue-500' : cat.name === 'Staff' ? 'bg-purple-500' : 'bg-slate-400'}`} 
                                                style={{ width: `${cat.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-12 text-right text-xs font-bold text-slate-500">{cat.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Alerts Box */}
                        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-bell text-yellow-400"></i> تنبيهات المتابعة</h3>
                            <div className="space-y-3 overflow-y-auto max-h-48 scrollbar-hide">
                                {glitches.filter(g => g.needsFollowUp && g.status !== 'Resolved').length === 0 ? (
                                    <p className="text-slate-400 text-sm italic">لا توجد حالات تتطلب متابعة</p>
                                ) : (
                                    glitches.filter(g => g.needsFollowUp && g.status !== 'Resolved').map(g => (
                                        <div key={g.id} className="bg-slate-700/50 p-3 rounded-xl border border-slate-600 flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm truncate w-32">{g.guestName}</div>
                                                <div className="text-[10px] text-slate-400">{g.category}</div>
                                            </div>
                                            <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-1 rounded border border-red-500/30">Action Req</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Table Dashboard */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <i className="fa-solid fa-search absolute right-3 top-3 text-slate-400"></i>
                                <input 
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white bg-white transition-all text-sm outline-none"
                                    placeholder="بحث في الشكاوى (الاسم، الهاتف، المحتوى)..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select 
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 focus:border-blue-500 outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="All">كل الحالات</option>
                                    <option value="Open">مفتوح</option>
                                    <option value="Resolved">تم الحل</option>
                                </select>
                                <select 
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 focus:border-blue-500 outline-none"
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                                >
                                    <option value="All">كل الخطورة</option>
                                    <option value="Critical">حرج 🔴</option>
                                    <option value="Medium">متوسط 🟠</option>
                                    <option value="Low">بسيط 🟢</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">الضيف / العميل</th>
                                        <th className="p-4">تفاصيل الشكوى</th>
                                        <th className="p-4">التصنيف</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4">تاريخ التسجيل</th>
                                        <th className="p-4">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredGlitches.length > 0 ? filteredGlitches.map(g => (
                                        <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm
                                                        ${g.guestType === 'Customer' ? 'bg-blue-500' : g.guestType === 'User' ? 'bg-purple-500' : 'bg-slate-400'}
                                                    `}>
                                                        {g.guestName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{g.guestName}</div>
                                                        <div className="text-xs text-slate-400">{g.guestPhone || 'No Phone'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <div className="font-medium text-slate-700 truncate" title={g.guestComplaint}>{g.guestComplaint}</div>
                                                <div className="text-xs text-slate-500 mt-1 italic flex items-center gap-1">
                                                    <i className="fa-solid fa-turn-up fa-rotate-90 ml-1"></i> 
                                                    {g.employeeResponse || 'لا يوجد رد'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-600">{g.category}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded w-fit border ${
                                                        g.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        g.severity === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-green-50 text-green-600 border-green-100'
                                                    }`}>
                                                        {g.severity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    g.status === 'Open' ? 'bg-red-100 text-red-700 border-red-200' : 
                                                    g.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                    'bg-amber-100 text-amber-700 border-amber-200'
                                                }`}>
                                                    {translateStatus(g.status, lang)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {new Date(g.reportedAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    by {users.find(u => u.id === g.reportedBy)?.name.split(' ')[0]}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {g.status !== 'Resolved' && (
                                                    <button 
                                                        onClick={() => handleQuickResolve(g.id)}
                                                        className="text-green-600 bg-green-50 border border-green-200 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <i className="fa-solid fa-check"></i> حل
                                                    </button>
                                                )}
                                                {g.status === 'Resolved' && (
                                                    <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                                                        <i className="fa-solid fa-check-double"></i> تم
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center">
                                                <div className="text-slate-300 text-6xl mb-4"><i className="fa-solid fa-clipboard-check"></i></div>
                                                <p className="text-slate-500 font-bold">لا توجد شكاوى مطابقة</p>
                                                <p className="text-slate-400 text-sm">كل شيء يسير على ما يرام!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <i className="fa-solid fa-brain text-yellow-400"></i> تحليل الأداء (AI Report)
                        </h3>
                        <p className="text-indigo-200 mb-6 max-w-2xl">
                            يقوم الذكاء الاصطناعي بتحليل سجلات "Glitch" لتحديد نقاط الضعف المتكررة واقتراح حلول جذرية لتحسين تجربة الضيوف.
                        </p>
                        <button 
                            onClick={handleGenerateAnalysis}
                            disabled={isAnalyzing}
                            className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-70 flex items-center gap-2"
                        >
                            {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            {isAnalyzing ? 'جاري التحليل...' : 'توليد التقرير الآن'}
                        </button>
                    </div>

                    {analysisReport && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
                                <h4 className="font-bold text-red-800 text-lg mb-3"><i className="fa-solid fa-triangle-exclamation"></i> نقاط الضعف (Weaknesses)</h4>
                                <div className="text-slate-700 text-sm leading-relaxed">
                                    {renderSafeContent(analysisReport.weaknesses)}
                                </div>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl shadow-sm">
                                <h4 className="font-bold text-green-800 text-lg mb-3"><i className="fa-solid fa-shield-heart"></i> نقاط القوة (Strengths)</h4>
                                <div className="text-slate-700 text-sm leading-relaxed">
                                    {renderSafeContent(analysisReport.strengths)}
                                </div>
                            </div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
                                <h4 className="font-bold text-blue-800 text-lg mb-3"><i className="fa-solid fa-lightbulb"></i> الحلول المقترحة</h4>
                                <div className="text-slate-700 text-sm leading-relaxed">
                                    {renderSafeContent(analysisReport.suggestions)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <AddGlitchModal onClose={() => setShowForm(false)} onAdd={onAddGlitch} currentUser={currentUser} users={users} customers={customers} />
            )}
        </div>
    );
};

const AddGlitchModal = ({ onClose, onAdd, currentUser, users, customers }: { onClose: () => void, onAdd: (g: Glitch) => void, currentUser: User, users: User[], customers: Customer[] }) => {
    const [sourceType, setSourceType] = useState<'guest' | 'customer' | 'user'>('guest');
    const [selectedId, setSelectedId] = useState('');
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState<Partial<Glitch>>({
        category: 'Service',
        severity: 'Low',
        needsFollowUp: false,
        status: 'Open',
        guestName: '',
        guestPhone: ''
    });

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalName = formData.guestName;
        let finalPhone = formData.guestPhone;
        let finalId = undefined;
        let finalType = 'Guest';

        if (sourceType === 'customer' && selectedId) {
            const customer = customers.find(c => c.id === selectedId);
            if (customer) {
                finalName = customer.name;
                finalPhone = customer.phone;
                finalId = customer.id;
                finalType = 'Customer';
            }
        } else if (sourceType === 'user' && selectedId) {
            const user = users.find(u => u.id === selectedId);
            if (user) {
                finalName = user.name;
                finalPhone = user.phone;
                finalId = user.id;
                finalType = 'User';
            }
        }

        const newGlitch: Glitch = {
            id: `GL-${Date.now()}`,
            organizationId: currentUser.organizationId,
            guestName: finalName!,
            guestPhone: finalPhone,
            guestId: finalId,
            guestType: finalType as any,
            guestComplaint: formData.guestComplaint!,
            employeeResponse: formData.employeeResponse!,
            category: formData.category!,
            severity: formData.severity!,
            needsFollowUp: formData.needsFollowUp!,
            status: formData.status!,
            reportedBy: currentUser.id,
            reportedAt: new Date().toISOString()
        };
        onAdd(newGlitch);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-xl text-slate-800">تسجيل شكوى جديدة</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Source Selection */}
                    <div>
                        <label className="block text-xs font-bold mb-2">نوع المشتكي</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button type="button" onClick={() => { setSourceType('guest'); setSelectedId(''); }} className={`flex-1 py-1 text-xs font-bold rounded-md ${sourceType === 'guest' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>زائر (Guest)</button>
                            <button type="button" onClick={() => { setSourceType('customer'); setSelectedId(''); }} className={`flex-1 py-1 text-xs font-bold rounded-md ${sourceType === 'customer' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>عميل مسجل</button>
                            <button type="button" onClick={() => { setSourceType('user'); setSelectedId(''); }} className={`flex-1 py-1 text-xs font-bold rounded-md ${sourceType === 'user' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`}>موظف/طالب</button>
                        </div>
                    </div>

                    {sourceType === 'guest' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم الضيف</label>
                                <input required className="w-full border rounded p-2" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">رقم الهاتف</label>
                                <input className="w-full border rounded p-2" value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold mb-1">بحث واختيار</label>
                            <input 
                                className="w-full border rounded p-2 mb-2 text-sm" 
                                placeholder="ابحث بالاسم..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select 
                                required 
                                className="w-full border rounded p-2 text-sm bg-slate-50" 
                                value={selectedId}
                                onChange={e => setSelectedId(e.target.value)}
                            >
                                <option value="">اختر من القائمة...</option>
                                {sourceType === 'customer' && filteredCustomers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                ))}
                                {sourceType === 'user' && filteredUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} - {u.role}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold mb-1">الشكوى (ماذا قال الضيف؟)</label>
                        <textarea required className="w-full border rounded p-2 h-20" onChange={e => setFormData({...formData, guestComplaint: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">إجراء الموظف (ماذا فعلت؟)</label>
                        <textarea required className="w-full border rounded p-2 h-20" onChange={e => setFormData({...formData, employeeResponse: e.target.value})}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">التصنيف</label>
                            <select className="w-full border rounded p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                <option value="Service">الخدمة</option>
                                <option value="Facility">المرافق / المبنى</option>
                                <option value="Staff">الموظفين</option>
                                <option value="Product">المنتج / الدورة</option>
                                <option value="Other">أخرى</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">الخطورة</label>
                            <select className="w-full border rounded p-2" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})}>
                                <option value="Low">بسيطة (Low)</option>
                                <option value="Medium">متوسطة (Medium)</option>
                                <option value="Critical">حرجة (Critical)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border">
                        <input type="checkbox" className="w-5 h-5" checked={formData.needsFollowUp} onChange={e => setFormData({...formData, needsFollowUp: e.target.checked})} />
                        <label className="text-sm font-bold text-slate-700">يحتاج لمتابعة إدارية؟</label>
                    </div>

                    <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg">حفظ وإبلاغ الفريق</button>
                </form>
            </div>
        </div>
    );
};
