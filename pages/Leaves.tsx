
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { User, LeaveRequest, AppLanguage, LeaveType, LeaveStatus } from '../types';
import { TRANSLATIONS } from '../data';

interface LeavesProps {
    currentUser: User;
    users: User[];
    leaves: LeaveRequest[];
    setLeaves: (l: LeaveRequest[]) => void;
    onRequestLeave: (req: Partial<LeaveRequest>) => void;
    onUpdateStatus: (id: string, status: LeaveStatus, comment?: string) => void;
    lang: AppLanguage;
}

export const LeaveView = ({ currentUser, users, leaves, setLeaves, onRequestLeave, onUpdateStatus, lang }: LeavesProps) => {
    const [activeTab, setActiveTab] = useState<'request' | 'my_history' | 'manage'>('request');
    const t = TRANSLATIONS[lang].leaves;
    const commonT = TRANSLATIONS[lang].common;
    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    const handleExport = () => {
        const X = (XLSX as any).default || XLSX;
        const data = leaves.map(l => ({
            'الموظف': users.find(u => u.id === l.userId)?.name || 'Unknown',
            'النوع': l.type,
            'البداية': l.startDate,
            'النهاية': l.endDate,
            'السبب': l.reason,
            'الحالة': l.status,
            'ملاحظات': l.adminComment
        }));
        const ws = X.utils.json_to_sheet(data);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "Leaves");
        X.writeFile(wb, `Leaves_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const X = (XLSX as any).default || XLSX;
                const bstr = evt.target?.result;
                const wb = X.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rawData = X.utils.sheet_to_json(ws) as any[];
                
                const newLeaves: LeaveRequest[] = rawData.map((row, idx) => ({
                    id: `L-IMP-${Date.now()}-${idx}`,
                    organizationId: currentUser.organizationId,
                    userId: users.find(u => u.name === row['الموظف'])?.id || 'Unknown',
                    type: row['النوع'] || 'Vacation',
                    startDate: row['البداية'],
                    endDate: row['النهاية'],
                    reason: row['السبب'] || 'Imported',
                    status: row['الحالة'] || 'Pending',
                    adminComment: row['ملاحظات'],
                    createdAt: new Date().toISOString()
                }));
                
                if (newLeaves.length > 0) {
                    if (confirm(`تم قراءة ${newLeaves.length} طلب. هل تريد استبدال سجل الإجازات بالكامل؟\n\nاضغط "موافق" للاستبدال (مسح القديم).\nاضغط "إلغاء" للإضافة (دمج).`)) {
                        setLeaves(newLeaves);
                    } else {
                        setLeaves([...leaves, ...newLeaves]);
                    }
                    alert('تمت العملية بنجاح');
                }
            } catch(err) {
                console.error(err);
                alert('خطأ في الاستيراد');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
                    <p className="text-slate-500 text-sm">قدم طلبات الإجازة، وتابع حالتها بسهولة</p>
                </div>
                
                <div className="flex gap-2 items-center flex-wrap">
                    {isAdmin && (
                        <>
                            <label className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center gap-1 cursor-pointer">
                                <i className="fa-solid fa-file-import"></i> استيراد
                                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                            </label>
                            <button onClick={handleExport} className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1">
                                <i className="fa-solid fa-file-excel"></i> تصدير
                            </button>
                        </>
                    )}
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner ml-2">
                        <button 
                            onClick={() => setActiveTab('request')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                            ${activeTab === 'request' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fa-solid fa-plus-circle"></i> {t.newRequest}
                        </button>
                        <button 
                            onClick={() => setActiveTab('my_history')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                            ${activeTab === 'my_history' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i> {t.myHistory}
                        </button>
                        {isAdmin && (
                            <button 
                                onClick={() => setActiveTab('manage')} 
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${activeTab === 'manage' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <i className="fa-solid fa-check-double"></i> {t.management}
                                {leaves.filter(l => l.status === 'Pending').length > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-1">{leaves.filter(l => l.status === 'Pending').length}</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {activeTab === 'request' && (
                    <div className="lg:col-span-12">
                        <LeaveRequestForm currentUser={currentUser} onRequestLeave={onRequestLeave} t={t} commonT={commonT} />
                    </div>
                )}

                {activeTab === 'my_history' && (
                    <div className="lg:col-span-12">
                        <LeavesList leaves={leaves.filter(l => l.userId === currentUser.id)} users={users} t={t} />
                    </div>
                )}

                {activeTab === 'manage' && isAdmin && (
                    <div className="lg:col-span-12">
                        <AdminApprovalPanel leaves={leaves} users={users} onUpdateStatus={onUpdateStatus} t={t} />
                    </div>
                )}
            </div>
        </div>
    );
};

// ... (Keep CalendarWidget, LeaveRequestForm, LeavesList, AdminApprovalPanel unchanged)
const CalendarWidget = ({ onSelectRange }: { onSelectRange: (start: string, end: string) => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedStart, setSelectedStart] = useState<Date | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month); // Adjust for RTL later if needed, assume standard Sun-Sat

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        // Reset time for comparison
        clickedDate.setHours(0,0,0,0);

        if (!selectedStart || (selectedStart && selectedEnd)) {
            // Start new selection
            setSelectedStart(clickedDate);
            setSelectedEnd(null);
            onSelectRange(clickedDate.toISOString().split('T')[0], clickedDate.toISOString().split('T')[0]);
        } else {
            // Selecting end date
            if (clickedDate < selectedStart) {
                // User clicked earlier date, swap
                setSelectedEnd(selectedStart);
                setSelectedStart(clickedDate);
                onSelectRange(clickedDate.toISOString().split('T')[0], selectedStart.toISOString().split('T')[0]);
            } else {
                setSelectedEnd(clickedDate);
                onSelectRange(selectedStart.toISOString().split('T')[0], clickedDate.toISOString().split('T')[0]);
            }
        }
    };

    const isSelected = (day: number) => {
        if (!selectedStart) return false;
        const d = new Date(year, month, day);
        d.setHours(0,0,0,0);
        
        if (selectedEnd) {
            return d >= selectedStart && d <= selectedEnd;
        }
        return d.getTime() === selectedStart.getTime();
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-slate-100 rounded-full"><i className="fa-solid fa-chevron-right"></i></button>
                <h3 className="font-bold text-slate-700">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-slate-100 rounded-full"><i className="fa-solid fa-chevron-left"></i></button>
            </div>
            
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelected(day);
                    return (
                        <button 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className={`h-10 rounded-lg text-sm font-bold transition-all
                                ${selected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-700'}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4 text-xs text-slate-500 text-center">
                اضغط مرة لتحديد البداية، ومرة أخرى لتحديد النهاية.
            </div>
        </div>
    );
};

const LeaveRequestForm = ({ currentUser, onRequestLeave, t, commonT }: { currentUser: User, onRequestLeave: (r: Partial<LeaveRequest>) => void, t: any, commonT: any }) => {
    const [formData, setFormData] = useState<Partial<LeaveRequest>>({
        type: 'Vacation',
        reason: '',
        userId: currentUser.id
    });
    const [attachment, setAttachment] = useState<string | null>(null);

    const handleRangeSelect = (start: string, end: string) => {
        setFormData({ ...formData, startDate: start, endDate: end });
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) return alert('الرجاء تحديد التاريخ من التقويم');
        
        onRequestLeave({
            ...formData,
            attachment: attachment || undefined
        });
        
        // Reset
        setFormData({ type: 'Vacation', reason: '', userId: currentUser.id });
        setAttachment(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-blue-800 border-b pb-2">{t.newRequest}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">{t.type}</label>
                        <select 
                            className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-blue-500"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as LeaveType })}
                        >
                            <option value="Vacation">{t.vacation}</option>
                            <option value="Sick Leave">{t.sick}</option>
                            <option value="Day Off">{t.dayOff}</option>
                            <option value="Force Leave">{t.force}</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{t.startDate}</label>
                            <input disabled value={formData.startDate || ''} className="w-full border rounded p-2 bg-slate-100 cursor-not-allowed text-sm" placeholder="حدد من التقويم" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{t.endDate}</label>
                            <input disabled value={formData.endDate || ''} className="w-full border rounded p-2 bg-slate-100 cursor-not-allowed text-sm" placeholder="حدد من التقويم" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">{t.reason}</label>
                        <textarea 
                            required
                            className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-blue-500 h-24 resize-none"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                            placeholder="اكتب سبب الإجازة..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">{t.attachment}</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                            <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
                            <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 mb-2"></i>
                            <p className="text-xs text-slate-500">{attachment ? 'تم إرفاق الملف' : 'اضغط لرفع وثيقة (اختياري)'}</p>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        {commonT.save} وإرسال الطلب
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <CalendarWidget onSelectRange={handleRangeSelect} />
                
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2"><i className="fa-solid fa-info-circle"></i> سياسة الإجازات</h3>
                    <ul className="text-sm space-y-2 opacity-90 list-disc list-inside">
                        <li>يجب تقديم طلب الإجازة السنوية قبل 3 أيام على الأقل.</li>
                        <li>الإجازة المرضية تتطلب إرفاق تقرير طبي إذا زادت عن يومين.</li>
                        <li>يتم الرد على الطلبات خلال 24 ساعة من قبل الإدارة.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const LeavesList = ({ leaves, users, t }: { leaves: LeaveRequest[], users: User[], t: any }) => {
    const getStatusColor = (status: LeaveStatus) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusLabel = (status: LeaveStatus) => {
        switch(status) {
            case 'Approved': return t.approved;
            case 'Rejected': return t.rejected;
            default: return t.pending;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b font-bold text-slate-600">{t.myHistory}</div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-white text-slate-500 border-b">
                        <tr>
                            <th className="p-4">{t.type}</th>
                            <th className="p-4">{t.startDate}</th>
                            <th className="p-4">{t.endDate}</th>
                            <th className="p-4">{t.reason}</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">{t.adminComment}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leaves.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد طلبات سابقة</td></tr>
                        ) : (
                            leaves.map(leave => (
                                <tr key={leave.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-700">{leave.type}</td>
                                    <td className="p-4 dir-ltr text-right font-mono text-xs">{leave.startDate}</td>
                                    <td className="p-4 dir-ltr text-right font-mono text-xs">{leave.endDate}</td>
                                    <td className="p-4 text-slate-600 max-w-xs truncate">{leave.reason}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(leave.status)}`}>
                                            {getStatusLabel(leave.status)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs italic">{leave.adminComment || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminApprovalPanel = ({ leaves, users, onUpdateStatus, t }: { leaves: LeaveRequest[], users: User[], onUpdateStatus: (id: string, s: LeaveStatus, c?: string) => void, t: any }) => {
    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    const historyLeaves = leaves.filter(l => l.status !== 'Pending');

    const [comment, setComment] = useState<string>('');
    const [actionId, setActionId] = useState<string | null>(null);

    const handleAction = (id: string, status: LeaveStatus) => {
        onUpdateStatus(id, status, comment);
        setComment('');
        setActionId(null);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-hourglass-half text-amber-500"></i> طلبات قيد الانتظار
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingLeaves.length === 0 ? (
                        <p className="text-slate-400 text-sm col-span-2 text-center py-4">لا توجد طلبات معلقة</p>
                    ) : (
                        pendingLeaves.map(leave => {
                            const user = users.find(u => u.id === leave.userId);
                            return (
                                <div key={leave.id} className="border rounded-xl p-4 hover:shadow-md transition bg-slate-50">
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                                        <div className="text-2xl">{user?.avatar}</div>
                                        <div>
                                            <div className="font-bold text-slate-800">{user?.name}</div>
                                            <div className="text-xs text-slate-500">{user?.role}</div>
                                        </div>
                                        <div className="mr-auto bg-white px-2 py-1 rounded border text-xs font-bold">{leave.type}</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div>
                                            <span className="block text-xs text-slate-400">من</span>
                                            <span className="font-mono font-bold">{leave.startDate}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-400">إلى</span>
                                            <span className="font-mono font-bold">{leave.endDate}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm bg-white p-2 rounded border mb-3 text-slate-600">{leave.reason}</p>
                                    
                                    {leave.attachment && (
                                        <div className="mb-3 text-xs">
                                            <a href={leave.attachment} download className="text-blue-600 hover:underline flex items-center gap-1">
                                                <i className="fa-solid fa-paperclip"></i> عرض المرفق
                                            </a>
                                        </div>
                                    )}

                                    {actionId === leave.id ? (
                                        <div className="animate-fade-in-up">
                                            <input 
                                                className="w-full border rounded p-2 text-sm mb-2" 
                                                placeholder="سبب الرفض / ملاحظة القبول..." 
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(leave.id, 'Approved')} className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700 text-sm font-bold">تأكيد القبول</button>
                                                <button onClick={() => handleAction(leave.id, 'Rejected')} className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700 text-sm font-bold">تأكيد الرفض</button>
                                                <button onClick={() => setActionId(null)} className="px-3 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 text-sm">إلغاء</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setActionId(leave.id)} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold hover:bg-green-200 transition">
                                                {t.approve}
                                            </button>
                                            <button onClick={() => setActionId(leave.id)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold hover:bg-red-200 transition">
                                                {t.reject}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">سجل القرارات السابقة</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-3">الموظف</th>
                                <th className="p-3">النوع</th>
                                <th className="p-3">التاريخ</th>
                                <th className="p-3">القرار</th>
                                <th className="p-3">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {historyLeaves.map(l => (
                                <tr key={l.id}>
                                    <td className="p-3 font-bold">{users.find(u => u.id === l.userId)?.name}</td>
                                    <td className="p-3">{l.type}</td>
                                    <td className="p-3 font-mono text-xs">{l.startDate}</td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${l.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {l.status === 'Approved' ? t.approved : t.rejected}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-500 text-xs">{l.adminComment || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
