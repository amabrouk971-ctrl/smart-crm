
import React, { useState, useEffect } from 'react';
import { User, Task, InventoryItem, MaintenanceTicket, Customer, LabComputer, AppLanguage } from '../types';
import { translateRole, translateStatus } from '../data';

interface RelationalTablesProps {
    users: User[];
    tasks: Task[];
    inventory: InventoryItem[];
    tickets: MaintenanceTicket[];
    customers: Customer[];
    labComputers: LabComputer[];
    lang: AppLanguage;
}

const PAGE_SIZE = 7;

export const RelationalTables = ({ users, tasks, inventory, tickets, customers, labComputers, lang }: RelationalTablesProps) => {
    const [activeTab, setActiveTab] = useState<'users' | 'inventory' | 'customers'>('users');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    // Table State
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Reset table state when tab changes
    useEffect(() => {
        setCurrentPage(1);
        setSortConfig(null);
        setSelectedId(null);
    }, [activeTab]);

    // --- Helpers ---

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const processData = (data: any[]) => {
        // 1. Sort
        let sortedData = [...data];
        if (sortConfig) {
            sortedData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // 2. Paginate
        const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const currentData = sortedData.slice(startIndex, startIndex + PAGE_SIZE);

        return { currentData, totalPages };
    };

    // --- Components ---

    const SortableHeader = ({ label, sortKey, width }: { label: string, sortKey: string, width?: string }) => (
        <th 
            className={`p-3 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors select-none ${width}`}
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {label}
                <div className="flex flex-col text-[8px] text-slate-400">
                    <i className={`fa-solid fa-chevron-up ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-blue-600' : ''}`}></i>
                    <i className={`fa-solid fa-chevron-down ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-blue-600' : ''}`}></i>
                </div>
            </div>
        </th>
    );

    const PaginationControls = ({ totalPages }: { totalPages: number }) => (
        <div className="p-3 border-t bg-slate-50 flex justify-between items-center">
            <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
            <span className="text-xs font-bold text-slate-500">
                صفحة {currentPage} من {totalPages || 1}
            </span>
            <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
        </div>
    );

    // --- Renders ---

    const renderUsersTable = () => {
        const staffUsers = users.filter(u => u.type === 'staff');
        const { currentData, totalPages } = processData(staffUsers);

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <SortableHeader label="الموظف" sortKey="name" />
                                <SortableHeader label="الدور" sortKey="role" />
                                <SortableHeader label="النقاط" sortKey="points" width="w-20" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentData.map(user => (
                                <tr 
                                    key={user.id} 
                                    onClick={() => setSelectedId(user.id)} 
                                    className={`cursor-pointer transition-all duration-200 border-l-4 
                                        ${selectedId === user.id 
                                            ? 'bg-blue-50 border-l-blue-600' 
                                            : 'border-l-transparent hover:bg-slate-50 hover:border-l-slate-300'}`}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                                                {user.avatar}
                                            </div>
                                            <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${user.role === 'Admin' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                            {translateRole(user.role, lang)}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-sm text-blue-600 font-bold">{user.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls totalPages={totalPages} />
            </div>
        );
    };

    const renderInventoryTable = () => {
        const { currentData, totalPages } = processData(inventory);

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <SortableHeader label="الجهاز" sortKey="name" />
                                <SortableHeader label="الموقع" sortKey="location" />
                                <SortableHeader label="الحالة" sortKey="status" width="w-24" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentData.map(item => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => setSelectedId(item.id)} 
                                    className={`cursor-pointer transition-all duration-200 border-l-4 
                                        ${selectedId === item.id 
                                            ? 'bg-blue-50 border-l-blue-600' 
                                            : 'border-l-transparent hover:bg-slate-50 hover:border-l-slate-300'}`}
                                >
                                    <td className="p-3 font-bold text-sm text-slate-700">{item.name}</td>
                                    <td className="p-3 text-xs text-slate-500">{item.location}</td>
                                    <td className="p-3">
                                        <div className={`flex items-center gap-1.5 text-[10px] font-bold
                                            ${item.status === 'Available' ? 'text-green-600' : 'text-red-500'}
                                        `}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {translateStatus(item.status, lang)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls totalPages={totalPages} />
            </div>
        );
    };

    const renderCustomersTable = () => {
        const { currentData, totalPages } = processData(customers);

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <SortableHeader label="العميل" sortKey="name" />
                                <SortableHeader label="الهاتف" sortKey="phone" />
                                <SortableHeader label="الحالة" sortKey="status" width="w-20" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentData.map(c => (
                                <tr 
                                    key={c.id} 
                                    onClick={() => setSelectedId(c.id)} 
                                    className={`cursor-pointer transition-all duration-200 border-l-4 
                                        ${selectedId === c.id 
                                            ? 'bg-blue-50 border-l-blue-600' 
                                            : 'border-l-transparent hover:bg-slate-50 hover:border-l-slate-300'}`}
                                >
                                    <td className="p-3 font-bold text-sm text-slate-700">{c.name}</td>
                                    <td className="p-3 text-xs text-slate-500 font-mono">{c.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {translateStatus(c.status, lang)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls totalPages={totalPages} />
            </div>
        );
    };

    // --- Details Panel Render ---
    const renderDetails = () => {
        if (!selectedId) return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <i className="fa-regular fa-hand-pointer text-5xl mb-4"></i>
                <p>اختر عنصراً من القائمة لعرض التفاصيل الكاملة</p>
            </div>
        );

        if (activeTab === 'users') {
            const userTasks = tasks.filter(t => t.assigneeId === selectedId);
            const userTickets = tickets.filter(t => t.assigneeId === selectedId);
            const user = users.find(u => u.id === selectedId);

            return (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Header Card */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl shadow-inner border border-white/30">
                                {user?.avatar}
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl">{user?.name}</h3>
                                <div className="flex gap-3 text-blue-100 text-sm mt-1">
                                    <span className="bg-white/20 px-2 py-0.5 rounded">{translateRole(user?.role || '', lang)}</span>
                                    <span>#{user?.username}</span>
                                </div>
                            </div>
                            <div className="mr-auto text-center bg-white/10 p-3 rounded-xl border border-white/10">
                                <div className="font-bold text-3xl">{user?.points}</div>
                                <div className="text-[10px] uppercase opacity-70">XP نقاط</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => alert('Feature: Open Task Modal')} className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-bold flex flex-col items-center gap-1">
                            <i className="fa-solid fa-plus-circle text-lg text-blue-500"></i>
                            تعيين مهمة
                        </button>
                        <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all text-xs font-bold flex flex-col items-center gap-1">
                            <i className="fa-solid fa-clock-rotate-left text-lg text-amber-500"></i>
                            سجل النشاط
                        </button>
                        <button onClick={() => alert(`Contacting ${user?.name}...`)} className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all text-xs font-bold flex flex-col items-center gap-1">
                            <i className="fa-solid fa-phone text-lg text-green-500"></i>
                            اتصال سريع
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <div className="text-blue-600 text-xs font-bold uppercase mb-1">المهام المسندة</div>
                             <div className="text-3xl font-bold text-slate-800">{userTasks.length}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                             <div className="text-orange-600 text-xs font-bold uppercase mb-1">تذاكر الصيانة</div>
                             <div className="text-3xl font-bold text-slate-800">{userTickets.length}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">آخر المهام</div>
                        <div className="divide-y">
                            {userTasks.length > 0 ? userTasks.slice(0, 5).map(t => (
                                <div key={t.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                    <div className="text-sm font-medium">{t.title}</div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                                        {translateStatus(t.status, lang)}
                                    </span>
                                </div>
                            )) : <div className="p-4 text-center text-slate-400 text-sm">لا توجد مهام</div>}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'inventory') {
            const itemTickets = tickets.filter(t => t.deviceId === selectedId);
            const item = inventory.find(i => i.id === selectedId);

            return (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1">#{item?.id}</div>
                                <h3 className="font-bold text-2xl text-slate-800">{item?.name}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-lg font-bold text-sm ${item?.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {translateStatus(item?.status || '', lang)}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t pt-4">
                            <div>
                                <span className="block text-slate-400 text-xs font-bold">الموقع</span>
                                <span className="font-bold text-slate-700">{item?.location}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold">الكمية</span>
                                <span className="font-bold text-slate-700">{item?.quantity} قطعة</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold">الفئة</span>
                                <span className="font-bold text-slate-700">{item?.category}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold">آخر تحديث</span>
                                <span className="font-mono text-slate-700">{item?.lastUpdated}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm flex justify-between items-center">
                            <span>سجل الصيانة</span>
                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">{itemTickets.length}</span>
                        </div>
                        <div className="divide-y">
                            {itemTickets.length > 0 ? itemTickets.map(t => (
                                <div key={t.id} className="p-3 hover:bg-slate-50">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-sm text-red-600">{t.issue}</span>
                                        <span className="text-xs text-slate-400 font-mono">{t.createdAt.split('T')[0]}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">الفني: {users.find(u => u.id === t.assigneeId)?.name || 'غير معين'}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{translateStatus(t.status, lang)}</span>
                                    </div>
                                </div>
                            )) : <div className="p-8 text-center text-slate-400 text-sm">سجل الصيانة نظيف تماماً ✅</div>}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'customers') {
            const customer = customers.find(c => c.id === selectedId);
            
            return (
                <div className="space-y-6 animate-fade-in-up">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-green-500 border-y border-r border-slate-100">
                        <h3 className="font-bold text-2xl text-slate-800 mb-2">{customer?.name}</h3>
                        <div className="space-y-2">
                             <div className="flex items-center gap-3 text-slate-600">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><i className="fa-solid fa-phone"></i></div>
                                 <span className="font-mono font-bold">{customer?.phone}</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-600">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><i className="fa-solid fa-envelope"></i></div>
                                 <span className="font-mono">{customer?.email || 'لا يوجد بريد'}</span>
                             </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex gap-2">
                             <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">انضم: {customer?.joinedDate}</span>
                             <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">{translateStatus(customer?.status || '', lang)}</span>
                        </div>
                    </div>

                    {/* Quick Actions for Customer */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all text-xs font-bold flex flex-col items-center gap-1">
                            <i className="fa-brands fa-whatsapp text-lg text-green-600"></i>
                            مراسلة واتساب
                        </button>
                        <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-bold flex flex-col items-center gap-1">
                            <i className="fa-solid fa-envelope text-lg text-blue-600"></i>
                            إرسال بريد
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">تاريخ التعاملات ({customer?.history.length})</div>
                        <div className="divide-y max-h-80 overflow-y-auto">
                            {customer?.history && customer.history.length > 0 ? customer.history.map((h, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm
                                        ${h.type === 'Lab' ? 'bg-blue-500' : h.type === 'Course' ? 'bg-purple-500' : 'bg-green-500'}
                                    `}>
                                        <i className={`fa-solid ${h.type === 'Lab' ? 'fa-computer' : h.type === 'Course' ? 'fa-graduation-cap' : 'fa-cart-shopping'}`}></i>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-slate-800">{h.type === 'Lab' ? 'معمل' : h.type === 'Course' ? 'دورة' : 'شراء'}</span>
                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded font-mono">{h.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{h.details}</p>
                                    </div>
                                </div>
                            )) : <div className="p-8 text-center text-slate-400 text-sm">لا يوجد سجل نشاط مسجل.</div>}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                       <i className="fa-solid fa-diagram-project"></i>
                    </div>
                    مركز البيانات المترابطة (ERP)
                </h2>
                
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${activeTab === 'users' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fa-solid fa-users"></i> الموظفين
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')} 
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${activeTab === 'inventory' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fa-solid fa-boxes-stacked"></i> الأصول
                    </button>
                    <button 
                        onClick={() => setActiveTab('customers')} 
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${activeTab === 'customers' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fa-solid fa-address-book"></i> العملاء
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Master List (Left Side - 35%) */}
                <div className="w-[35%] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b font-bold text-slate-600 text-sm flex justify-between items-center">
                        <span>القائمة الرئيسية</span>
                        <span className="text-xs bg-white border px-2 py-0.5 rounded text-slate-400 font-normal">
                             صفحة {currentPage}
                        </span>
                    </div>
                    {activeTab === 'users' && renderUsersTable()}
                    {activeTab === 'inventory' && renderInventoryTable()}
                    {activeTab === 'customers' && renderCustomersTable()}
                </div>

                {/* Detail View (Right Side - 65%) */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                     <div className="p-3 bg-slate-50 border-b font-bold text-slate-600 text-sm">
                         تفاصيل السجل والعلاقات
                     </div>
                     <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                         {renderDetails()}
                     </div>
                </div>
            </div>
        </div>
    );
};
