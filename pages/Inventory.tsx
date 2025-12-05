
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { InventoryItem, MaintenanceTicket, User, Priority, Status, AppLanguage, PermissionsState } from '../types';
import { translatePriority, translateStatus, translateRole } from '../data';

interface InventoryProps {
  inventory: InventoryItem[];
  currentUser: User;
  highlightedId?: string;
  setInventory: (items: InventoryItem[]) => void;
  lang: AppLanguage;
  permissions: PermissionsState;
  onAddItem?: (item: InventoryItem) => void;
  onClearHighlight?: () => void;
}

export const InventoryView = ({ inventory, currentUser, highlightedId, setInventory, lang, permissions, onAddItem, onClearHighlight }: InventoryProps) => {
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Scroll to highlighted item
    React.useEffect(() => {
        if (highlightedId) {
            const el = document.getElementById(`inv-${highlightedId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Clear highlight after animation to avoid re-scrolling on next visit
                const timer = setTimeout(() => {
                    if (onClearHighlight) onClearHighlight();
                }, 2000);
                
                // Cleanup: Clear highlight on unmount so navigation away resets state
                return () => {
                    clearTimeout(timer);
                    if (onClearHighlight) onClearHighlight();
                };
            }
        }
    }, [highlightedId, onClearHighlight]);

    const canManage = permissions.inventory.manage.includes(currentUser.role);

    const handleExport = () => {
        // Safe access to XLSX library which might be a default export in some environments
        const X = (XLSX as any).default || XLSX;
        
        const data = inventory.map(item => ({
            'الاسم': item.name,
            'الفئة': item.category,
            'الكمية': item.quantity,
            'الموقع': item.location,
            'سعر التكلفة': item.costPrice || 0,
            'سعر البيع': item.sellingPrice || item.price || 0,
            'الحالة': translateStatus(item.status, lang),
            'آخر تحديث': item.lastUpdated
        }));
        const ws = X.utils.json_to_sheet(data);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "Inventory");
        const date = new Date().toLocaleDateString('en-CA');
        X.writeFile(wb, `SmartTech_Inventory_${date}.xlsx`);
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
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = X.utils.sheet_to_json(ws) as any[];

                const newItems: InventoryItem[] = rawData.map((row, idx) => ({
                    id: `INV-IMP-${Date.now()}-${idx}`,
                    organizationId: currentUser.organizationId,
                    name: row['الاسم'] || row['Name'] || 'Unknown',
                    category: row['الفئة'] || row['Category'] || 'General',
                    quantity: Number(row['الكمية'] || row['Quantity']) || 0,
                    location: row['الموقع'] || row['Location'] || 'Warehouse',
                    status: 'Available',
                    costPrice: Number(row['سعر التكلفة'] || row['Cost']) || 0,
                    sellingPrice: Number(row['سعر البيع'] || row['Price']) || 0,
                    price: Number(row['سعر البيع'] || row['Price']) || 0,
                    lastUpdated: new Date().toLocaleDateString('en-CA')
                }));

                if (newItems.length > 0) {
                    if (confirm(`تم قراءة ${newItems.length} عنصر. هل تريد استبدال المخزون الحالي بالكامل؟\n\nاضغط "موافق" للاستبدال (مسح القديم).\nاضغط "إلغاء" للإضافة (دمج).`)) {
                        setInventory(newItems);
                    } else {
                        setInventory([...inventory, ...newItems]);
                    }
                    alert('تمت العملية بنجاح');
                }
            } catch (err) {
                console.error(err);
                alert("خطأ في قراءة الملف");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const handleSaveItem = (item: InventoryItem) => {
        if (editingItem) {
            // Update existing
            const updatedInventory = inventory.map(i => i.id === item.id ? item : i);
            setInventory(updatedInventory);
        } else {
            // Add new
            setInventory([...inventory, item]);
            if (onAddItem) onAddItem(item);
        }
        setShowModal(false);
        setEditingItem(null);
    };

    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const getPlaceholderImage = (name: string) => {
        return `https://placehold.co/100x100/e2e8f0/1e293b?text=${encodeURIComponent(name.substring(0, 2).toUpperCase())}`;
    };

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold">سجل الأجهزة والمخزون</h2>
            
            <div className="flex gap-2">
                {canManage && (
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-file-import"></i> استيراد
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                    </label>
                )}
                <button onClick={handleExport} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-file-excel"></i> تصدير
                </button>
                {canManage && (
                    <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        + إضافة جهاز
                    </button>
                )}
            </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                    <th className="p-4">صورة</th>
                    <th className="p-4">الجهاز</th>
                    <th className="p-4">الفئة</th>
                    <th className="p-4">الكمية</th>
                    <th className="p-4">الموقع</th>
                    {canManage && <th className="p-4">التكلفة</th>}
                    <th className="p-4">سعر البيع</th>
                    <th className="p-4">الربح (Margin)</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">آخر تحديث</th>
                    {canManage && <th className="p-4">إجراءات</th>}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {inventory.map(item => {
                    const cost = item.costPrice || 0;
                    const price = item.sellingPrice || item.price || 0;
                    const profit = price - cost;
                    const profitClass = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-slate-500';

                    return (
                        <tr id={`inv-${item.id}`} key={item.id} className={`hover:bg-slate-50 transition-colors ${highlightedId === item.id ? 'bg-yellow-50 ring-2 ring-yellow-200' : ''}`}>
                        <td className="p-4">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white">
                                <img 
                                    src={item.image || getPlaceholderImage(item.name)} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(item.name); }}
                                />
                            </div>
                        </td>
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4 text-slate-500">{item.category}</td>
                        <td className="p-4">{item.quantity}</td>
                        <td className="p-4 text-slate-500">{item.location}</td>
                        
                        {canManage && <td className="p-4 font-mono text-xs">{cost.toLocaleString()}</td>}
                        <td className="p-4 font-bold font-mono text-sm">{price.toLocaleString()}</td>
                        <td className={`p-4 font-mono text-xs font-bold ${profitClass}`}>
                            {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                        </td>

                        <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Available' ? 'bg-green-100 text-green-700' :
                            item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {translateStatus(item.status, lang)}
                            </span>
                        </td>
                        <td className="p-4 text-xs dir-ltr text-right text-slate-400">{item.lastUpdated}</td>
                        {canManage && (
                            <td className="p-4">
                            <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded-lg">تعديل</button>
                            </td>
                        )}
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>
        
        {showModal && (
            <InventoryFormModal 
                onClose={() => { setShowModal(false); setEditingItem(null); }} 
                onSave={handleSaveItem} 
                organizationId={currentUser.organizationId} 
                initialItem={editingItem}
            />
        )}
      </div>
    );
};

const InventoryFormModal = ({ onClose, onSave, organizationId, initialItem }: { onClose: () => void, onSave: (item: InventoryItem) => void, organizationId: string, initialItem: InventoryItem | null }) => {
    const [name, setName] = useState(initialItem?.name || '');
    const [category, setCategory] = useState(initialItem?.category || '');
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);
    const [location, setLocation] = useState(initialItem?.location || '');
    const [status, setStatus] = useState<InventoryItem['status']>(initialItem?.status || 'Available');
    const [image, setImage] = useState<string | undefined>(initialItem?.image);
    
    // Prices
    const [costPrice, setCostPrice] = useState(initialItem?.costPrice || 0);
    const [sellingPrice, setSellingPrice] = useState(initialItem?.sellingPrice || initialItem?.price || 0);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialItem ? initialItem.id : `INV-${Date.now()}`,
            organizationId,
            name,
            category,
            quantity,
            location,
            status,
            costPrice,
            sellingPrice,
            price: sellingPrice, // Keep sync for backward compat
            lastUpdated: new Date().toLocaleDateString('en-CA'),
            image
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in-up shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{initialItem ? 'تعديل بيانات الجهاز' : 'إضافة جهاز جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">اسم الجهاز / المنتج</label>
                        <input required className="w-full border rounded-lg p-2" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">الفئة</label>
                            <input required className="w-full border rounded-lg p-2" value={category} onChange={e => setCategory(e.target.value)} list="categories" />
                            <datalist id="categories">
                                <option value="Hardware" />
                                <option value="Cables" />
                                <option value="Accessories" />
                                <option value="Network" />
                            </datalist>
                        </div>
                        <div>
                             <label className="block text-sm font-bold mb-1">الكمية</label>
                             <input type="number" min="0" required className="w-full border rounded-lg p-2 font-bold" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                             <label className="block text-xs font-bold mb-1 text-slate-500">سعر التكلفة</label>
                             <input type="number" min="0" className="w-full border rounded-lg p-2" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold mb-1 text-blue-600">سعر البيع</label>
                             <input type="number" min="0" required className="w-full border rounded-lg p-2 font-bold text-blue-700" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-bold mb-1">الموقع / الرف</label>
                             <input required className="w-full border rounded-lg p-2" value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-sm font-bold mb-1">الحالة</label>
                             <select className="w-full border rounded-lg p-2" value={status} onChange={e => setStatus(e.target.value as any)}>
                                 <option value="Available">متاح</option>
                                 <option value="Low Stock">كمية قليلة</option>
                                 <option value="Out of Stock">نفذت الكمية</option>
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">صورة الجهاز</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 transition-colors">
                                <i className="fa-solid fa-camera mr-2"></i> رفع صورة
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {image && <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors">إلغاء</button>
                        <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg transition-colors">حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface MaintenanceProps {
    tickets: MaintenanceTicket[];
    users: User[];
    currentUser: User;
    setTickets: (t: MaintenanceTicket[]) => void;
    onNavigateToItem: (id: string) => void;
    lang: AppLanguage;
    permissions: PermissionsState;
}

export const MaintenanceView = ({ tickets, users, currentUser, setTickets, onNavigateToItem, lang, permissions }: MaintenanceProps) => {
    const canManage = permissions.maintenance.manage.includes(currentUser.role);
    const canUpdateStatus = permissions.maintenance.updateStatus.includes(currentUser.role);
    
    // Techs only see assigned + unassigned, Managers see all
    const visibleTickets = currentUser.role === 'Technician' 
        ? tickets.filter(t => t.assigneeId === currentUser.id || t.assigneeId === '')
        : tickets;

    const handleStatusChange = (ticketId: string, newStatus: Status) => {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold">تذاكر الصيانة والدعم الفني</h2>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i> إبلاغ عن عطل
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4">الجهاز</th>
                                <th className="p-4">المشكلة</th>
                                <th className="p-4">الأولوية</th>
                                <th className="p-4">المسؤول</th>
                                <th className="p-4">الحالة</th>
                                {(canManage || canUpdateStatus) && <th className="p-4">إجراءات</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visibleTickets.map(ticket => {
                                const assignee = users.find(u => u.id === ticket.assigneeId);
                                return (
                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <button onClick={() => onNavigateToItem(ticket.deviceId)} className="font-bold text-blue-600 hover:underline">
                                                {ticket.deviceName}
                                            </button>
                                            <div className="text-xs text-slate-400">ID: {ticket.deviceId}</div>
                                        </td>
                                        <td className="p-4 text-slate-700">{ticket.issue}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                                            }`}>{translatePriority(ticket.priority, lang)}</span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            {assignee ? (
                                                <>
                                                    <span>{assignee.avatar}</span>
                                                    <span className="text-sm">{assignee.name}</span>
                                                </>
                                            ) : <span className="text-slate-400 text-sm italic">غير معين</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                ticket.status === 'Done' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>{translateStatus(ticket.status, lang)}</span>
                                        </td>
                                        {(canManage || canUpdateStatus) && (
                                            <td className="p-4 flex gap-2">
                                                {canUpdateStatus && (
                                                    <select 
                                                        value={ticket.status}
                                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as Status)}
                                                        className="text-xs border rounded p-1 bg-white"
                                                    >
                                                        <option value="To Do">جديد</option>
                                                        <option value="In Progress">جاري</option>
                                                        <option value="Done">تم</option>
                                                    </select>
                                                )}
                                                {canManage && (
                                                   <button className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fa-solid fa-trash"></i></button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
