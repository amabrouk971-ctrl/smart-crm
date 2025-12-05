
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Customer, AppLanguage, FinanceRecord, CustomerFeedback, User } from '../types';
import { translateStatus } from '../data';

interface CustomersProps {
    customers: Customer[];
    setCustomers: (c: Customer[]) => void;
    financeRecords?: FinanceRecord[];
    feedbackList?: CustomerFeedback[];
    onAddFinance?: (r: FinanceRecord) => void;
    onAddFeedback?: (f: CustomerFeedback) => void;
    currentUser?: User;
    lang: AppLanguage;
}

export const CustomersDatabase = ({ customers, setCustomers, financeRecords = [], feedbackList = [], onAddFinance, onAddFeedback, currentUser, lang }: CustomersProps) => {
    const [sheetUrl, setSheetUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoyverseSyncing, setIsLoyverseSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'VIP'>('All');

    // Detail Modal Tabs
    const [detailTab, setDetailTab] = useState<'history' | 'finance' | 'feedback'>('history');
    
    // Forms inside Modal
    const [showFinanceForm, setShowFinanceForm] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    // Mock Sync Logic
    const handleSync = () => {
        if (!sheetUrl) return;
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            alert('تمت المزامنة بنجاح مع Google Sheets! (محاكاة)');
        }, 2000);
    };

    // Loyverse API Sync
    const handleLoyverseSync = async () => {
        const storedOrg = localStorage.getItem('st_org');
        const token = storedOrg ? JSON.parse(storedOrg).settings?.loyverseToken : null;

        if (!token) {
            alert('الرجاء إدخال Loyverse API Token في الإعدادات أولاً.');
            return;
        }

        setIsLoyverseSyncing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const simulatedLoyverseCustomers = [
                { id: 'loy-1', name: 'Loyverse Customer A', phone_number: '01000000001', email: 'loy1@example.com', note: 'Imported from POS' },
                { id: 'loy-2', name: 'Loyverse Customer B', phone_number: '01000000002', email: 'loy2@example.com', note: 'VIP POS User' },
                { id: 'loy-3', name: 'Loyverse Customer C', phone_number: '', email: '', note: '' }
            ];

            const newCustomers: Customer[] = simulatedLoyverseCustomers.map(lc => ({
                id: `LOY-${lc.id}`,
                organizationId: currentUser?.organizationId || 'ORG-SMARTTECH',
                name: lc.name,
                phone: lc.phone_number || 'Unknown',
                email: lc.email || '',
                status: 'Active',
                joinedDate: new Date().toLocaleDateString('en-CA'),
                notes: lc.note || 'Synced from Loyverse',
                history: []
            }));

            setCustomers([...customers, ...newCustomers]);
            alert(`تم استيراد ${newCustomers.length} عميل من Loyverse بنجاح!`);

        } catch (error) {
            console.error("Loyverse Sync Error", error);
            alert("فشل الاتصال بـ Loyverse API");
        } finally {
            setIsLoyverseSyncing(false);
        }
    };

    // Excel Import Logic
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const X = (XLSX as any).default || XLSX;
                const bstr = evt.target?.result;
                const wb = X.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = X.utils.sheet_to_json(ws) as any[];
                
                const newCustomers: Customer[] = rawData.map((row, idx) => ({
                    id: `C-IMP-${Date.now()}-${idx}`,
                    organizationId: currentUser?.organizationId || 'ORG-SMARTTECH',
                    name: row['Name'] || row['الاسم'] || 'Unknown',
                    phone: row['Phone'] || row['الهاتف'] || '',
                    email: row['Email'] || row['الايميل'] || '',
                    status: 'Active',
                    joinedDate: new Date().toLocaleDateString('en-CA'),
                    notes: `Imported from Excel`,
                    history: []
                }));

                if (newCustomers.length > 0) {
                    if (confirm(`تم قراءة ${newCustomers.length} عميل. هل تريد استبدال قاعدة البيانات بالكامل؟\n\nاضغط "موافق" للاستبدال (مسح القديم).\nاضغط "إلغاء" للإضافة (دمج).`)) {
                        setCustomers(newCustomers);
                    } else {
                        setCustomers([...customers, ...newCustomers]);
                    }
                    alert('تمت العملية بنجاح');
                }

            } catch (err) {
                console.error("Error reading excel", err);
                alert("خطأ في قراءة الملف");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const handleExportAll = () => {
        const X = (XLSX as any).default || XLSX;
        // Export ALL customers, including archived ones
        const dataToExport = customers.map(c => {
            // Flatten history into a single string with safety check
            const historyStr = (c.history || []).map(h => `[${h.date}] ${h.type}: ${h.details}`).join('; ');

            return {
                'ID': c.id,
                'الاسم': c.name,
                'رقم الهاتف': c.phone,
                'البريد الإلكتروني': c.email || '-',
                'تاريخ الانضمام': c.joinedDate,
                'الحالة': translateStatus(c.status, lang),
                'ملاحظات': c.notes || '-',
                'السجل التاريخي': historyStr
            };
        });

        const ws = X.utils.json_to_sheet(dataToExport);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "قاعدة البيانات الشاملة");

        const date = new Date().toLocaleDateString('en-CA');
        X.writeFile(wb, `SmartTech_Customers_Full_${date}.xlsx`);
    };

    const handleAddCustomer = (c: Partial<Customer>) => {
        const newCustomer: Customer = {
            id: `C-${Date.now()}`,
            organizationId: currentUser?.organizationId || 'ORG-SMARTTECH',
            name: c.name!,
            phone: c.phone || '',
            email: c.email || '',
            status: 'Active',
            joinedDate: new Date().toLocaleDateString('en-CA'),
            notes: c.notes || '',
            history: []
        };
        setCustomers([...customers, newCustomer]);
        setShowAddModal(false);
    };

    const handleArchive = (id: string) => {
        if (confirm('هل تريد أرشفة هذا العميل؟ لن يظهر في القوائم النشطة.')) {
            setCustomers(customers.map(c => c.id === id ? { ...c, status: 'Archived' } : c));
        }
    };

    const handleRestore = (id: string) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, status: 'Active' } : c));
    };

    const handlePermanentDelete = (id: string) => {
        if (confirm('تحذير: هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من الحذف النهائي؟')) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    }

    const handlePrint = () => {
        window.print();
    }

    // Filter Logic
    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.phone.includes(searchQuery) ||
                              c.email?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesView = viewMode === 'archive' 
                            ? c.status === 'Archived' 
                            : c.status !== 'Archived';
        
        const matchesStatus = viewMode === 'active' 
                            ? (statusFilter === 'All' || c.status === statusFilter)
                            : true;
                            
        return matchesSearch && matchesView && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <i className="fa-solid fa-users-viewfinder text-blue-600"></i>
                        قاعدة بيانات العملاء
                    </h2>
                    <p className="text-slate-500 text-sm">إدارة السجلات، الأرشيف، والتكامل</p>
                </div>
                
                <div className="flex gap-2 items-center">
                    <button 
                        onClick={handleLoyverseSync}
                        disabled={isLoyverseSyncing}
                        className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                        {isLoyverseSyncing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-down"></i>}
                        Loyverse Sync
                    </button>
                    
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing || !sheetUrl}
                        className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 disabled:opacity-50 text-sm border border-slate-200"
                    >
                        {isSyncing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-google"></i>}
                        Google Sync
                    </button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-4 border-b border-slate-200 pb-1 no-print">
                <button 
                    onClick={() => { setViewMode('active'); setStatusFilter('All'); }} 
                    className={`pb-3 px-4 font-bold text-sm transition-colors relative ${viewMode === 'active' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    العملاء الحاليين
                    {viewMode === 'active' && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setViewMode('archive')} 
                    className={`pb-3 px-4 font-bold text-sm transition-colors relative ${viewMode === 'archive' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    سجل الأرشيف (محذوفات)
                    {viewMode === 'archive' && <span className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 rounded-t-full"></span>}
                </button>
            </div>

            {/* Actions & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-blue-500">
                    <div className="text-slate-500 text-xs font-bold">إجمالي النشطين</div>
                    <div className="text-2xl font-bold">{customers.filter(c => c.status !== 'Archived').length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-slate-500">
                    <div className="text-slate-500 text-xs font-bold">في الأرشيف</div>
                    <div className="text-2xl font-bold">{customers.filter(c => c.status === 'Archived').length}</div>
                </div>
                <div className="md:col-span-2 flex gap-2 justify-end items-center flex-wrap">
                    {viewMode === 'active' && (
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow hover:bg-blue-700 flex items-center gap-2 text-sm font-bold">
                            <i className="fa-solid fa-user-plus"></i> إضافة عميل
                        </button>
                    )}
                    <label className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl shadow cursor-pointer hover:bg-slate-200 flex items-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-file-import"></i> استيراد Excel
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button onClick={handleExportAll} className="bg-green-600 text-white px-4 py-3 rounded-xl shadow hover:bg-green-700 flex items-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-file-export"></i> تصدير قاعدة البيانات (الكل)
                    </button>
                    <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow hover:bg-black flex items-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-print"></i> طباعة
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center no-print">
                    <div className="relative flex-1 w-full">
                        <i className="fa-solid fa-search absolute right-3 top-3 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="بحث بالاسم، الهاتف، أو البريد..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 focus:outline-none focus:border-blue-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {viewMode === 'active' && (
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500 font-bold text-slate-600 text-sm"
                        >
                            <option value="All">كل الحالات</option>
                            <option value="Active">نشط</option>
                            <option value="VIP">مميز (VIP)</option>
                            <option value="Inactive">غير نشط</option>
                        </select>
                    )}
                </div>
                
                {/* Print Header */}
                <div className="hidden print:block p-4 text-center">
                    <h1 className="text-2xl font-bold">تقرير قاعدة بيانات العملاء</h1>
                    <p className="text-sm text-gray-500">SmartTech CRM - {new Date().toLocaleDateString()}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-sm font-bold print:bg-gray-100">
                            <tr>
                                <th className="p-4">العميل</th>
                                <th className="p-4">بيانات الاتصال</th>
                                <th className="p-4">تاريخ الانضمام</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 no-print">السجل</th>
                                <th className="p-4 no-print">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                <tr key={c.id} className={`transition-colors ${viewMode === 'archive' ? 'hover:bg-amber-50/50 bg-slate-50/50' : 'hover:bg-blue-50/50'}`}>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{c.name}</div>
                                        <div className="text-xs text-slate-400 no-print">ID: {c.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="flex items-center gap-1"><i className="fa-solid fa-phone text-slate-400 text-xs no-print"></i> {c.phone}</span>
                                            {c.email && <span className="flex items-center gap-1"><i className="fa-solid fa-envelope text-slate-400 text-xs no-print"></i> {c.email}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{c.joinedDate}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            c.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                                            c.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                            c.status === 'Archived' ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {translateStatus(c.status, lang)}
                                        </span>
                                    </td>
                                    <td className="p-4 no-print">
                                        <button onClick={() => setSelectedCustomer(c)} className="text-blue-600 text-xs font-bold border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
                                           <i className="fa-solid fa-clock-rotate-left ml-1"></i> الملف الكامل
                                        </button>
                                    </td>
                                    <td className="p-4 no-print">
                                        {viewMode === 'active' ? (
                                            <button onClick={() => handleArchive(c.id)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-50 transition" title="أرشفة">
                                                <i className="fa-solid fa-box-archive"></i>
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRestore(c.id)} className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition" title="استعادة">
                                                    <i className="fa-solid fa-rotate-left"></i>
                                                </button>
                                                <button onClick={() => handlePermanentDelete(c.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition" title="حذف نهائي">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        {viewMode === 'active' ? 'لا يوجد عملاء مطابقين للبحث' : 'الأرشيف فارغ'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">إضافة عميل جديد</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddCustomer({
                                name: formData.get('name') as string,
                                phone: formData.get('phone') as string,
                                email: formData.get('email') as string,
                                notes: formData.get('notes') as string,
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الاسم</label>
                                <input name="name" required className="w-full border rounded-lg p-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">الهاتف</label>
                                    <input name="phone" required className="w-full border rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">البريد</label>
                                    <input name="email" type="email" className="w-full border rounded-lg p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                                <textarea name="notes" className="w-full border rounded-lg p-2" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">إلغاء</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                     <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[85vh]">
                         <div className="p-6 border-b flex justify-between items-start bg-slate-50 rounded-t-2xl">
                             <div>
                                 <h3 className="text-2xl font-bold text-slate-800">{selectedCustomer.name}</h3>
                                 <div className="text-sm text-slate-500">ID: {selectedCustomer.id}</div>
                             </div>
                             <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                         </div>
                         <div className="p-6 overflow-y-auto">
                             {/* Mock Details */}
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div>
                                     <span className="text-xs font-bold text-slate-500 block">الهاتف</span>
                                     <span className="text-sm">{selectedCustomer.phone}</span>
                                 </div>
                                 <div>
                                     <span className="text-xs font-bold text-slate-500 block">البريد</span>
                                     <span className="text-sm">{selectedCustomer.email || '-'}</span>
                                 </div>
                                 <div className="col-span-2">
                                     <span className="text-xs font-bold text-slate-500 block">ملاحظات</span>
                                     <span className="text-sm">{selectedCustomer.notes}</span>
                                 </div>
                             </div>
                             
                             <h4 className="font-bold border-b pb-2 mb-2">سجل النشاط</h4>
                             {(selectedCustomer.history && selectedCustomer.history.length > 0) ? (
                                 <ul className="space-y-2">
                                     {selectedCustomer.history.map((h, i) => (
                                         <li key={i} className="text-sm bg-slate-50 p-2 rounded">
                                             <span className="font-bold text-xs bg-white border px-1 rounded ml-2">{h.date}</span>
                                             {h.details}
                                         </li>
                                     ))}
                                 </ul>
                             ) : <p className="text-sm text-slate-400">لا يوجد سجل نشاط.</p>}
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};
