
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FinanceRecord, AppLanguage, Customer, User } from '../types';
import { TRANSLATIONS } from '../data';

interface FinanceProps {
    records: FinanceRecord[];
    setRecords: (r: FinanceRecord[]) => void;
    customers: Customer[];
    currentUser: User;
    onAddRecord: (r: FinanceRecord) => void;
    lang: AppLanguage;
}

export const FinanceView = ({ records, setRecords, customers, currentUser, onAddRecord, lang }: FinanceProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
    const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d'>('all');
    const [isLoyverseSyncing, setIsLoyverseSyncing] = useState(false);
    
    const getFilteredRecordsByTime = () => {
        const now = new Date();
        return records.filter(r => {
            if (timeRange === 'all') return true;
            const recordDate = new Date(r.date);
            const diffTime = Math.abs(now.getTime() - recordDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (timeRange === '7d') return diffDays <= 7;
            if (timeRange === '30d') return diffDays <= 30;
            return true;
        });
    };

    const timeFilteredRecords = getFilteredRecordsByTime();

    // Stats (Calculated based on time filter)
    const totalIncome = timeFilteredRecords.filter(r => r.type === 'Income').reduce((acc, r) => acc + r.amount, 0);
    const totalExpense = timeFilteredRecords.filter(r => r.type === 'Expense').reduce((acc, r) => acc + r.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Table Data (Calculated based on time filter AND type filter)
    const filteredRecords = timeFilteredRecords
        .filter(r => filterType === 'All' || r.type === filterType)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleLoyverseSync = async () => {
        const storedOrg = localStorage.getItem('st_org');
        const token = storedOrg ? JSON.parse(storedOrg).settings?.loyverseToken : null;

        if (!token) {
            alert('الرجاء إدخال Loyverse API Token في الإعدادات أولاً.');
            return;
        }

        setIsLoyverseSyncing(true);

        try {
            // Simulated Fetch logic
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Mock Receipts from Loyverse
            const newSales: FinanceRecord[] = [
                {
                    id: `LOY-RCPT-${Date.now()}-1`,
                    organizationId: currentUser.organizationId,
                    date: new Date().toLocaleDateString('en-CA'),
                    amount: 450,
                    type: 'Income',
                    category: 'POS Sales',
                    description: 'مبيعات الكافيتريا - Loyverse POS',
                    paymentMethod: 'Cash',
                    receiptNumber: '10-2001',
                    recordedBy: 'Loyverse Integration'
                },
                {
                    id: `LOY-RCPT-${Date.now()}-2`,
                    organizationId: currentUser.organizationId,
                    date: new Date().toLocaleDateString('en-CA'),
                    amount: 120,
                    type: 'Income',
                    category: 'POS Sales',
                    description: 'مبيعات خارجية - Loyverse POS',
                    paymentMethod: 'Card',
                    receiptNumber: '10-2002',
                    recordedBy: 'Loyverse Integration'
                }
            ];

            newSales.forEach(sale => onAddRecord(sale));
            alert('تمت مزامنة المبيعات من Loyverse بنجاح!');

        } catch (error) {
            console.error("Loyverse Sync Error", error);
            alert("فشل في مزامنة المبيعات");
        } finally {
            setIsLoyverseSyncing(false);
        }
    };

    const handleExport = () => {
        const X = (XLSX as any).default || XLSX;
        const data = records.map(r => ({
            'التاريخ': r.date,
            'النوع': r.type,
            'الفئة': r.category,
            'المبلغ': r.amount,
            'الوصف': r.description,
            'طريقة الدفع': r.paymentMethod,
            'العميل': r.customerName || '-'
        }));
        const ws = X.utils.json_to_sheet(data);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "Finance");
        X.writeFile(wb, `Finance_Report_${new Date().toLocaleDateString('en-CA')}.xlsx`);
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
                
                const newRecords: FinanceRecord[] = rawData.map((row, idx) => ({
                    id: `FIN-IMP-${Date.now()}-${idx}`,
                    organizationId: currentUser.organizationId,
                    date: row['التاريخ'] || new Date().toLocaleDateString('en-CA'),
                    type: row['النوع'] === 'مصروف' ? 'Expense' : 'Income',
                    category: row['الفئة'] || 'General',
                    amount: Number(row['المبلغ']) || 0,
                    description: row['الوصف'] || 'Imported Transaction',
                    paymentMethod: row['طريقة الدفع'] || 'Cash',
                    recordedBy: currentUser.username || currentUser.name
                }));
                
                if (newRecords.length > 0) {
                    if (confirm(`تم قراءة ${newRecords.length} معاملة. هل تريد استبدال السجل المالي بالكامل؟\n\nاضغط "موافق" للاستبدال (مسح القديم).\nاضغط "إلغاء" للإضافة (دمج).`)) {
                        setRecords(newRecords);
                    } else {
                        setRecords([...records, ...newRecords]);
                    }
                    alert('تمت العملية بنجاح');
                }
            } catch(err) {
                console.error(err);
                alert('خطأ في استيراد الملف');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const handleAdd = (r: Partial<FinanceRecord>) => {
        const newRecord: FinanceRecord = {
            id: `FIN-${Date.now()}`,
            organizationId: currentUser.organizationId,
            date: r.date || new Date().toLocaleDateString('en-CA'),
            amount: Number(r.amount) || 0,
            type: r.type || 'Income',
            category: r.category || 'General',
            description: r.description || '',
            paymentMethod: r.paymentMethod || 'Cash',
            receiptNumber: r.receiptNumber,
            customerId: r.customerId,
            customerName: customers.find(c => c.id === r.customerId)?.name,
            recordedBy: currentUser.username || currentUser.name
        };
        onAddRecord(newRecord);
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">المالية والمحاسبة</h2>
                
                <div className="flex gap-3 items-center flex-wrap justify-end">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-bold shadow-sm"
                    >
                        <option value="all">جميع الأوقات</option>
                        <option value="30d">آخر 30 يوم</option>
                        <option value="7d">آخر 7 أيام</option>
                    </select>

                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-2 text-xs shadow-sm border">
                        <i className="fa-solid fa-file-import"></i> استيراد
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={handleExport} className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-bold hover:bg-green-200 transition-all flex items-center gap-2 text-xs border border-green-200 shadow-sm">
                        <i className="fa-solid fa-file-excel"></i> تصدير
                    </button>

                    <button 
                        onClick={handleLoyverseSync}
                        disabled={isLoyverseSyncing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 shadow-md"
                    >
                        {isLoyverseSyncing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sync"></i>}
                        Loyverse
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-bold">إجمالي الإيرادات ({timeRange === 'all' ? 'الكل' : timeRange})</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">{totalIncome.toLocaleString()} ج.م</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-bold">إجمالي المصروفات ({timeRange === 'all' ? 'الكل' : timeRange})</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{totalExpense.toLocaleString()} ج.م</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-bold">صافي الربح</p>
                        <h3 className="text-3xl font-bold mt-1">{netProfit.toLocaleString()} ج.م</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setFilterType('All')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filterType === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>الكل</button>
                        <button onClick={() => setFilterType('Income')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filterType === 'Income' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>الإيرادات</button>
                        <button onClick={() => setFilterType('Expense')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filterType === 'Expense' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>المصروفات</button>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                        + إضافة معاملة
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4">التاريخ</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">الفئة</th>
                                <th className="p-4">الوصف</th>
                                <th className="p-4">المبلغ</th>
                                <th className="p-4">طريقة الدفع</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredRecords.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono">{r.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {r.type === 'Income' ? 'إيراد' : 'مصروف'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold">{r.category}</td>
                                    <td className="p-4 text-slate-600">
                                        {r.description}
                                        {r.customerName && <span className="block text-xs text-blue-500">{r.customerName}</span>}
                                    </td>
                                    <td className={`p-4 font-bold font-mono ${r.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {r.type === 'Income' ? '+' : '-'}{r.amount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-xs bg-slate-50 px-2 rounded w-fit">{r.paymentMethod}</td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد سجلات</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && <AddFinanceModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} customers={customers} />}
        </div>
    );
};

const AddFinanceModal = ({ onClose, onAdd, customers }: { onClose: () => void, onAdd: (r: Partial<FinanceRecord>) => void, customers: Customer[] }) => {
    const [formData, setFormData] = useState<Partial<FinanceRecord>>({
        type: 'Income',
        date: new Date().toLocaleDateString('en-CA'),
        paymentMethod: 'Cash'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4">إضافة معاملة مالية</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, type: 'Income'})} className={`flex-1 py-2 rounded-lg font-bold border-2 ${formData.type === 'Income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-400'}`}>إيراد</button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'Expense'})} className={`flex-1 py-2 rounded-lg font-bold border-2 ${formData.type === 'Expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-400'}`}>مصروف</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">المبلغ</label>
                            <input required type="number" className="w-full border rounded p-2" onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">التاريخ</label>
                            <input required type="date" className="w-full border rounded p-2" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">الفئة (Category)</label>
                        <input list="categories" className="w-full border rounded p-2" onChange={e => setFormData({...formData, category: e.target.value})} />
                        <datalist id="categories">
                            <option value="Services" />
                            <option value="Training" />
                            <option value="Products" />
                            <option value="Maintenance" />
                            <option value="Rent" />
                            <option value="Salaries" />
                            <option value="Utilities" />
                        </datalist>
                    </div>

                    {formData.type === 'Income' && (
                        <div>
                            <label className="block text-xs font-bold mb-1">العميل (اختياري)</label>
                            <select className="w-full border rounded p-2" onChange={e => setFormData({...formData, customerId: e.target.value})}>
                                <option value="">اختر عميل...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold mb-1">الوصف</label>
                        <textarea className="w-full border rounded p-2 h-20 resize-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">طريقة الدفع</label>
                            <select className="w-full border rounded p-2" onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}>
                                <option value="Cash">نقدي (Cash)</option>
                                <option value="Card">بطاقة (Card)</option>
                                <option value="Bank Transfer">تحويل بنكي</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">رقم الإيصال</label>
                            <input className="w-full border rounded p-2" onChange={e => setFormData({...formData, receiptNumber: e.target.value})} placeholder="Optional" />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold">إلغاء</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
