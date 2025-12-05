
import React, { useState } from 'react';
import { User, Task, InventoryItem, MaintenanceTicket, Customer, LabComputer, FinanceRecord, PurchaseOrder, AppLanguage, Glitch, AttendanceRecord, LeaveRequest, POSOrder } from '../types';
import { TRANSLATIONS } from '../data';
import { RelationalTables } from './RelationalTables';

interface ERPProps {
    users: User[];
    tasks: Task[];
    inventory: InventoryItem[];
    tickets: MaintenanceTicket[];
    customers: Customer[];
    labComputers: LabComputer[];
    finance: FinanceRecord[];
    purchaseOrders: PurchaseOrder[];
    lang: AppLanguage;
    glitches: Glitch[];
    attendance: AttendanceRecord[];
    leaves: LeaveRequest[];
    posOrders: POSOrder[];
}

export const ERPModuleView = ({ users, tasks, inventory, tickets, customers, labComputers, finance, purchaseOrders, lang, glitches, attendance, leaves, posOrders }: ERPProps) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'resources' | 'procurement' | 'databrowser'>('dashboard');
    const t = TRANSLATIONS[lang];

    // --- KPI Calculations ---
    const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.quantity * 100), 0); // Mock value calculation
    const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
    const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
    const totalRevenue = finance.filter(f => f.type === 'Income').reduce((acc, f) => acc + f.amount, 0);
    const activeTickets = tickets.filter(t => t.status !== 'Done').length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Navigation */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-900 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                        <i className="fa-solid fa-network-wired"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">نظام تخطيط الموارد (ERP)</h2>
                        <p className="text-slate-500 text-xs">Operations Command Center</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <i className="fa-solid fa-chart-line mr-2"></i> نظرة عامة
                    </button>
                    <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'resources' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <i className="fa-solid fa-timeline mr-2"></i> الموارد
                    </button>
                    <button onClick={() => setActiveTab('procurement')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'procurement' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <i className="fa-solid fa-truck-fast mr-2"></i> المشتريات
                    </button>
                    <button onClick={() => setActiveTab('databrowser')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'databrowser' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                        <i className="fa-solid fa-database mr-2"></i> البيانات
                    </button>
                </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">قيمة المخزون (تقديري)</div>
                        <div className="text-3xl font-black text-slate-800">{totalInventoryValue.toLocaleString()} <span className="text-sm font-normal text-slate-400">EGP</span></div>
                        <div className="mt-2 text-xs text-red-500 font-bold bg-red-50 inline-block px-2 py-1 rounded">
                            {lowStockItems.length} أصناف منخفضة
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">ضغط العمل</div>
                        <div className="text-3xl font-black text-slate-800">{pendingTasks} <span className="text-sm font-normal text-slate-400">مهام</span></div>
                        <div className="mt-2 text-xs text-orange-500 font-bold bg-orange-50 inline-block px-2 py-1 rounded">
                            {activeTickets} تذاكر صيانة
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">الإيرادات</div>
                        <div className="text-3xl font-black text-slate-800">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">EGP</span></div>
                        <div className="mt-2 text-xs text-green-500 font-bold bg-green-50 inline-block px-2 py-1 rounded">
                            +12% هذا الشهر
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">الموظفين النشطين</div>
                        <div className="text-3xl font-black text-slate-800">{users.filter(u => u.type === 'staff').length}</div>
                        <div className="mt-2 text-xs text-blue-500 font-bold bg-blue-50 inline-block px-2 py-1 rounded">
                            {users.length} مستخدم كلي
                        </div>
                    </div>

                    {/* Low Stock Alert Table */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> تنبيهات المخزون
                            </h3>
                            <button onClick={() => setActiveTab('procurement')} className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-100">
                                إنشاء طلب شراء
                            </button>
                        </div>
                        <div className="p-4">
                            {lowStockItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {lowStockItems.map(item => (
                                        <li key={item.id} className="flex justify-between items-center bg-white border p-2 rounded-lg text-sm">
                                            <span className="font-bold text-slate-700">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500">{item.location}</span>
                                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{item.quantity} متبقي</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-400 text-sm">المخزون في حالة جيدة</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Planning Tab */}
            {activeTab === 'resources' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-x-auto">
                    <h3 className="font-bold text-lg mb-4">توزيع الموارد البشرية (Resource Allocation)</h3>
                    <div className="min-w-[800px]">
                        <div className="flex border-b pb-2 mb-2">
                            <div className="w-48 font-bold text-slate-500">الموظف</div>
                            <div className="flex-1 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
                                <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                            </div>
                        </div>
                        {users.filter(u => u.type === 'staff').map(user => {
                            const userTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done');
                            const load = userTasks.length;
                            return (
                                <div key={user.id} className="flex items-center py-3 border-b hover:bg-slate-50">
                                    <div className="w-48 flex items-center gap-2">
                                        <div className="text-xl">{user.avatar}</div>
                                        <div>
                                            <div className="font-bold text-sm">{user.name}</div>
                                            <div className="text-xs text-slate-400">{load} Active Tasks</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-7 gap-1">
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <div key={i} className={`h-8 rounded ${load > 2 && i < 5 ? 'bg-red-200' : load > 0 && i < 5 ? 'bg-blue-200' : 'bg-slate-100'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Procurement Tab */}
            {activeTab === 'procurement' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">أوامر الشراء (Purchase Orders)</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ طلب جديد</button>
                    </div>
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="p-3">رقم الطلب</th>
                                <th className="p-3">المورد</th>
                                <th className="p-3">الأصناف</th>
                                <th className="p-3">التكلفة</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {purchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono font-bold">{po.id}</td>
                                    <td className="p-3">{po.supplier}</td>
                                    <td className="p-3 text-slate-600">{po.items}</td>
                                    <td className="p-3 font-bold">{po.totalCost.toLocaleString()} EGP</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            po.status === 'Received' ? 'bg-green-100 text-green-700' :
                                            po.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-xs">{po.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Data Browser Tab (Reusing RelationalTables) */}
            {activeTab === 'databrowser' && (
                <div className="h-[600px]">
                    <RelationalTables 
                        users={users} 
                        tasks={tasks} 
                        inventory={inventory} 
                        tickets={tickets} 
                        customers={customers} 
                        labComputers={labComputers} 
                        lang={lang}
                        finance={finance}
                        posOrders={posOrders}
                        attendance={attendance}
                        leaves={leaves}
                        glitches={glitches}
                    />
                </div>
            )}
        </div>
    );
};
