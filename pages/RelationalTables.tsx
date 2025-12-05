
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { User, Task, InventoryItem, MaintenanceTicket, Customer, LabComputer, AppLanguage, FinanceRecord, POSOrder, AttendanceRecord, LeaveRequest, Glitch } from '../types';
import { translateRole, translateStatus } from '../data';

interface RelationalTablesProps {
    users: User[];
    tasks: Task[];
    inventory: InventoryItem[];
    tickets: MaintenanceTicket[];
    customers: Customer[];
    labComputers: LabComputer[];
    finance: FinanceRecord[];
    posOrders: POSOrder[];
    attendance: AttendanceRecord[];
    leaves: LeaveRequest[];
    glitches: Glitch[];
    lang: AppLanguage;
}

const PAGE_SIZE = 10;

export const RelationalTables = ({ 
    users, tasks, inventory, tickets, customers, labComputers, 
    finance, posOrders, attendance, leaves, glitches, lang 
}: RelationalTablesProps) => {
    const [activeTab, setActiveTab] = useState<'users' | 'inventory' | 'customers' | 'tasks' | 'finance' | 'pos' | 'attendance' | 'leaves' | 'glitches'>('users');
    
    // Table State
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Reset table state when tab changes
    useEffect(() => {
        setCurrentPage(1);
        setSortConfig(null);
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
                // Handle nested keys e.g. "settings.theme" (simple implementation)
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

        return { currentData, totalPages, allSortedData: sortedData }; // Return all for export
    };

    const handleExport = (data: any[], fileName: string) => {
        const X = (XLSX as any).default || XLSX;
        // Flatten complex objects for better Excel output
        const flattenedData = data.map(item => {
            const newItem: any = { ...item };
            // Example formatting
            if (newItem.items && Array.isArray(newItem.items)) {
                newItem.items = newItem.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ');
            }
            if (newItem.history) delete newItem.history; // Too large
            if (newItem.comments) delete newItem.comments;
            return newItem;
        });

        const ws = X.utils.json_to_sheet(flattenedData);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "Data");
        X.writeFile(wb, `${fileName}_${new Date().toLocaleDateString('en-CA')}.xlsx`);
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

    const TabButton = ({ id, icon, label }: { id: typeof activeTab, icon: string, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}
            `}
        >
            <i className={`fa-solid ${icon}`}></i> {label}
        </button>
    );

    // --- Renders ---

    const renderTableContent = () => {
        let data: any[] = [];
        let headers: React.ReactNode = null;
        let rows: (item: any) => React.ReactNode = () => null;
        let exportName = "";

        switch (activeTab) {
            case 'users':
                data = users.filter(u => u.type === 'staff');
                exportName = "Employees";
                headers = (
                    <tr>
                        <SortableHeader label="الموظف" sortKey="name" />
                        <SortableHeader label="الدور" sortKey="role" />
                        <SortableHeader label="البريد" sortKey="email" />
                        <SortableHeader label="نقاط" sortKey="points" width="w-20" />
                    </tr>
                );
                rows = (user: User) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{user.name}</td>
                        <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{translateRole(user.role, lang)}</span></td>
                        <td className="p-3 text-sm text-slate-500">{user.email}</td>
                        <td className="p-3 font-mono text-blue-600 font-bold">{user.points}</td>
                    </tr>
                );
                break;
            case 'inventory':
                data = inventory;
                exportName = "Inventory";
                headers = (
                    <tr>
                        <SortableHeader label="الجهاز" sortKey="name" />
                        <SortableHeader label="الفئة" sortKey="category" />
                        <SortableHeader label="الكمية" sortKey="quantity" />
                        <SortableHeader label="الموقع" sortKey="location" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (item: InventoryItem) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-700">{item.name}</td>
                        <td className="p-3 text-sm">{item.category}</td>
                        <td className="p-3 font-mono">{item.quantity}</td>
                        <td className="p-3 text-xs text-slate-500">{item.location}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-1 rounded font-bold ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                    </tr>
                );
                break;
            case 'customers':
                data = customers;
                exportName = "Customers";
                headers = (
                    <tr>
                        <SortableHeader label="العميل" sortKey="name" />
                        <SortableHeader label="الهاتف" sortKey="phone" />
                        <SortableHeader label="انضم منذ" sortKey="joinedDate" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (c: Customer) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-700">{c.name}</td>
                        <td className="p-3 font-mono text-sm">{c.phone}</td>
                        <td className="p-3 text-sm">{c.joinedDate}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-1 rounded font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>{c.status}</span></td>
                    </tr>
                );
                break;
            case 'finance':
                data = finance;
                exportName = "Finance";
                headers = (
                    <tr>
                        <SortableHeader label="التاريخ" sortKey="date" />
                        <SortableHeader label="النوع" sortKey="type" />
                        <SortableHeader label="الفئة" sortKey="category" />
                        <SortableHeader label="المبلغ" sortKey="amount" />
                        <SortableHeader label="بواسطة" sortKey="recordedBy" />
                    </tr>
                );
                rows = (f: FinanceRecord) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-sm">{f.date}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-1 rounded font-bold ${f.type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.type}</span></td>
                        <td className="p-3 text-sm">{f.category}</td>
                        <td className="p-3 font-bold font-mono">{f.amount.toLocaleString()}</td>
                        <td className="p-3 text-xs text-slate-500">{f.recordedBy}</td>
                    </tr>
                );
                break;
            case 'pos':
                data = posOrders;
                exportName = "Sales_Orders";
                headers = (
                    <tr>
                        <SortableHeader label="رقم الإيصال" sortKey="receiptNumber" />
                        <SortableHeader label="التاريخ" sortKey="createdAt" />
                        <SortableHeader label="الإجمالي" sortKey="total" />
                        <SortableHeader label="الدفع" sortKey="paymentMethod" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (o: POSOrder) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-sm font-bold">#{o.receiptNumber}</td>
                        <td className="p-3 text-xs font-mono">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-bold text-green-700">{o.total.toLocaleString()}</td>
                        <td className="p-3 text-sm">{o.paymentMethod}</td>
                        <td className="p-3 text-xs">{o.status}</td>
                    </tr>
                );
                break;
            case 'tasks':
                data = tasks;
                exportName = "Tasks";
                headers = (
                    <tr>
                        <SortableHeader label="المهمة" sortKey="title" />
                        <SortableHeader label="المسؤول" sortKey="assigneeId" />
                        <SortableHeader label="الأولوية" sortKey="priority" />
                        <SortableHeader label="الحالة" sortKey="status" />
                        <SortableHeader label="الموعد" sortKey="deadline" />
                    </tr>
                );
                rows = (t: Task) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-sm">{t.title}</td>
                        <td className="p-3 text-sm">{users.find(u => u.id === t.assigneeId)?.name}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] bg-slate-100`}>{t.priority}</span></td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>{t.status}</span></td>
                        <td className="p-3 font-mono text-xs">{new Date(t.deadline).toLocaleDateString()}</td>
                    </tr>
                );
                break;
            case 'attendance':
                data = attendance;
                exportName = "Attendance";
                headers = (
                    <tr>
                        <SortableHeader label="الموظف" sortKey="userId" />
                        <SortableHeader label="التاريخ" sortKey="date" />
                        <SortableHeader label="حضور" sortKey="checkIn" />
                        <SortableHeader label="انصراف" sortKey="checkOut" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (a: AttendanceRecord) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-sm">{users.find(u => u.id === a.userId)?.name}</td>
                        <td className="p-3 font-mono text-sm">{a.date}</td>
                        <td className="p-3 font-mono text-xs dir-ltr text-right">{new Date(a.checkIn).toLocaleTimeString()}</td>
                        <td className="p-3 font-mono text-xs dir-ltr text-right">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
                    </tr>
                );
                break;
            case 'glitches':
                data = glitches;
                exportName = "Complaints";
                headers = (
                    <tr>
                        <SortableHeader label="الضيف" sortKey="guestName" />
                        <SortableHeader label="الشكوى" sortKey="guestComplaint" />
                        <SortableHeader label="التصنيف" sortKey="category" />
                        <SortableHeader label="الخطورة" sortKey="severity" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (g: Glitch) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-sm">{g.guestName}</td>
                        <td className="p-3 text-sm truncate max-w-xs">{g.guestComplaint}</td>
                        <td className="p-3 text-xs">{g.category}</td>
                        <td className="p-3 text-xs">{g.severity}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] ${g.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{g.status}</span></td>
                    </tr>
                );
                break;
            case 'leaves':
                data = leaves;
                exportName = "Leaves";
                headers = (
                    <tr>
                        <SortableHeader label="الموظف" sortKey="userId" />
                        <SortableHeader label="النوع" sortKey="type" />
                        <SortableHeader label="من" sortKey="startDate" />
                        <SortableHeader label="إلى" sortKey="endDate" />
                        <SortableHeader label="الحالة" sortKey="status" />
                    </tr>
                );
                rows = (l: LeaveRequest) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-sm">{users.find(u => u.id === l.userId)?.name}</td>
                        <td className="p-3 text-sm">{l.type}</td>
                        <td className="p-3 font-mono text-xs">{l.startDate}</td>
                        <td className="p-3 font-mono text-xs">{l.endDate}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] ${l.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>{l.status}</span></td>
                    </tr>
                );
                break;
        }

        const { currentData, totalPages, allSortedData } = processData(data);

        return {
            content: (
                <>
                    <div className="flex justify-between items-center p-4 bg-white border-b border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800">{exportName} Data</h3>
                        <button 
                            onClick={() => handleExport(allSortedData, exportName)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center gap-2"
                        >
                            <i className="fa-solid fa-file-excel"></i> Export / تنزيل
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-slate-600">
                                {headers}
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {currentData.map(rows)}
                                {currentData.length === 0 && (
                                    <tr><td colSpan={10} className="p-8 text-center text-slate-400">لا توجد بيانات</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls totalPages={totalPages} />
                </>
            )
        };
    };

    const { content } = renderTableContent();

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xl">
                       <i className="fa-solid fa-database"></i>
                    </div>
                    مستعرض البيانات الشامل (Database)
                </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 px-1">
                <TabButton id="users" icon="fa-users" label="الموظفين" />
                <TabButton id="inventory" icon="fa-boxes-stacked" label="المخزون" />
                <TabButton id="customers" icon="fa-address-book" label="العملاء" />
                <TabButton id="tasks" icon="fa-list-check" label="المهام" />
                <TabButton id="finance" icon="fa-coins" label="المالية" />
                <TabButton id="pos" icon="fa-receipt" label="المبيعات (POS)" />
                <TabButton id="attendance" icon="fa-clock" label="الحضور" />
                <TabButton id="leaves" icon="fa-plane" label="الإجازات" />
                <TabButton id="glitches" icon="fa-bug" label="الشكاوى" />
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {content}
            </div>
        </div>
    );
};
