
import React, { useState } from 'react';
import { LabComputer, User, Customer, AppLanguage } from '../types';
import { LAB_ROOMS } from '../data';

export const ComputerLab3D = ({ 
    computers, 
    currentUser, 
    customers,
    onUpdateComputer,
    onAddComputer,
    onSyncComputers,
    onDeleteComputer,
    lang
}: { 
    computers: LabComputer[], 
    currentUser: User, 
    customers?: Customer[],
    onUpdateComputer: (c: LabComputer) => void,
    onAddComputer?: (c: LabComputer) => void,
    onSyncComputers?: (c: LabComputer[]) => void,
    onDeleteComputer?: (id: string) => void,
    lang: AppLanguage
}) => {
    const [selectedPC, setSelectedPC] = useState<LabComputer | null>(null);
    const [activeRoomId, setActiveRoomId] = useState(LAB_ROOMS[0].id);
    
    // Modal Tabs
    const [modalTab, setModalTab] = useState<'assign' | 'manage'>('assign');

    const [assignTab, setAssignTab] = useState<'internal' | 'customer'>('customer');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    
    // Detailed Specs State (for Editing)
    const [editSpecs, setEditSpecs] = useState({
        cpu: '', ram: '', storage: '', vga: '', mb: '', os: '', brightness: ''
    });

    // Add Computer Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Admin Check
    const canManage = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    // Filter computers by room
    const roomComputers = computers.filter(c => c.roomId === activeRoomId);

    // Helpers to parse/serialize specs string
    const parseSpecs = (specsStr: string) => {
        // Expected format: "CPU: ... | RAM: ... | ..."
        // Or legacy format: "i5, 16GB"
        const parts = specsStr.split('|').reduce((acc, part) => {
            const [key, val] = part.split(':').map(s => s.trim());
            if (key && val) acc[key.toLowerCase()] = val;
            else if (key) acc['legacy'] = key; // Fallback
            return acc;
        }, {} as any);

        return {
            cpu: parts['cpu'] || parts['legacy'] || '',
            ram: parts['ram'] || '',
            storage: parts['storage'] || parts['hdd'] || '',
            vga: parts['vga'] || parts['gpu'] || '',
            mb: parts['mb'] || parts['motherboard'] || '',
            os: parts['os'] || '',
            brightness: parts['brightness'] || '100%'
        };
    };

    const serializeSpecs = (s: typeof editSpecs) => {
        const parts = [];
        if (s.cpu) parts.push(`CPU: ${s.cpu}`);
        if (s.ram) parts.push(`RAM: ${s.ram}`);
        if (s.storage) parts.push(`Storage: ${s.storage}`);
        if (s.vga) parts.push(`VGA: ${s.vga}`);
        if (s.mb) parts.push(`MB: ${s.mb}`);
        if (s.os) parts.push(`OS: ${s.os}`);
        if (s.brightness) parts.push(`Brightness: ${s.brightness}`);
        return parts.join(' | ') || 'Standard Specs';
    };

    const openPCModal = (pc: LabComputer) => {
        setSelectedPC(pc);
        setModalTab('assign'); // Default to assign
        setEditSpecs(parseSpecs(pc.specs));
        setSelectedCustomer('');
    };

    const handleAssign = () => {
        if (!selectedPC) return;
        
        const updates: Partial<LabComputer> = { status: 'In Use' };
        
        if (assignTab === 'customer' && selectedCustomer) {
            updates.customerId = selectedCustomer;
            updates.currentUserId = undefined; 
        } else {
             updates.currentUserId = 'TS-DEMO'; 
             updates.customerId = undefined;
        }

        onUpdateComputer({ ...selectedPC, ...updates });
        setSelectedPC(null);
    };

    const handleSaveSpecs = () => {
        if (!selectedPC) return;
        const newSpecsString = serializeSpecs(editSpecs);
        onUpdateComputer({ ...selectedPC, specs: newSpecsString });
        alert('تم تحديث المواصفات بنجاح');
    };

    const handleTransfer = (newRoomId: string) => {
        if (!selectedPC) return;
        onUpdateComputer({ ...selectedPC, roomId: newRoomId });
        setSelectedPC(null); // Close modal as it moved
    };

    const handleDelete = () => {
        if (!selectedPC || !onDeleteComputer) return;
        if (confirm(`هل أنت متأكد من حذف الجهاز ${selectedPC.deskNumber}؟`)) {
            onDeleteComputer(selectedPC.id);
            setSelectedPC(null);
        }
    };
    
    const handleAddNewComputer = (deskNum: string, specs: string) => {
        if (!onAddComputer) return;
        const newPC: LabComputer = {
            id: `PC-${activeRoomId}-${Date.now()}`,
            organizationId: currentUser.organizationId,
            roomId: activeRoomId,
            deskNumber: deskNum,
            status: 'Available',
            specs: specs
        };
        onAddComputer(newPC);
        setShowAddModal(false);
    }

    const handleSheetSync = () => {
        if (!sheetUrl || !onSyncComputers) return;
        setIsSyncing(true);
        
        // Simulating Google Sheets Data Fetch
        setTimeout(() => {
            const simulatedSheetData = [
                { deskNumber: 'PC-1', specs: 'CPU: i9 13th Gen | RAM: 64GB | Storage: 2TB SSD', status: 'Available' },
                { deskNumber: 'PC-2', specs: 'CPU: i9 13th Gen | RAM: 64GB', status: 'Maintenance' },
                { deskNumber: 'PC-5', specs: 'CPU: i7 12th Gen | RAM: 32GB', status: 'Available' }
            ];
            
            const computersToUpdate: LabComputer[] = [];
            
            simulatedSheetData.forEach(row => {
                const pc = computers.find(c => c.deskNumber === row.deskNumber && c.roomId === activeRoomId);
                if (pc) {
                    computersToUpdate.push({
                        ...pc,
                        specs: row.specs,
                        status: row.status as any
                    });
                }
            });

            if (computersToUpdate.length > 0) {
                 onSyncComputers(computersToUpdate);
            }
            
            setIsSyncing(false);
        }, 2000);
    };

    // Helper to determine grid columns based on computer count for optimal 3D layout
    const getGridClass = (count: number) => {
        if (count <= 2) return 'grid-cols-2 max-w-sm'; // Server/Reception small
        if (count <= 4) return 'grid-cols-2 max-w-md'; // SmartTech 4
        if (count <= 8) return 'grid-cols-4 max-w-4xl'; // SmartTech 3
        if (count <= 12) return 'grid-cols-4 max-w-5xl';
        if (count <= 20) return 'grid-cols-5 max-w-6xl'; // SmartTech 2 (5x4)
        return 'grid-cols-6 max-w-7xl'; // SmartTech 1 (22 computers -> 6x4 approx)
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            {/* Google Sheets Sync Bar */}
            {canManage && (
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-green-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
                             <i className="fa-solid fa-file-csv"></i>
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-800 text-sm">تحديث من Google Sheets</h3>
                             <p className="text-xs text-slate-500">قم بتحديث مواصفات وحالة الأجهزة تلقائياً</p>
                         </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="رابط الشيت..." 
                            className="border rounded-lg px-3 py-2 text-xs flex-1 md:w-64 outline-none focus:border-green-500"
                            value={sheetUrl}
                            onChange={e => setSheetUrl(e.target.value)}
                        />
                        <button 
                            onClick={handleSheetSync} 
                            disabled={isSyncing || !sheetUrl}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                        >
                            {isSyncing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
                            مزامنة
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">خريطة المعمل التفاعلية</h2>
                    {canManage && (
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow hover:bg-blue-700">
                            + إضافة جهاز
                        </button>
                    )}
                 </div>
                 
                 {/* Room Tabs */}
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                     {LAB_ROOMS.map(room => (
                         <button 
                            key={room.id}
                            onClick={() => setActiveRoomId(room.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border-2
                                ${activeRoomId === room.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                            `}
                         >
                            {room.name} <span className="text-[10px] opacity-70">({computers.filter(c => c.roomId === room.id).length})</span>
                         </button>
                     ))}
                 </div>
                 
                 <div className="flex gap-4 text-xs font-bold self-end md:self-auto">
                     <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> متاح</span>
                     <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> مشغول</span>
                     <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> صيانة</span>
                 </div>
            </div>

            <div className="flex-1 bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner border-4 border-slate-700 overflow-y-auto" style={{ perspective: '1200px' }}>
                {/* 3D Floor Grid */}
                <div 
                    className="absolute inset-0 bg-opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"
                    style={{ transform: 'rotateX(60deg) scale(1.5)', transformOrigin: 'bottom' }}
                ></div>

                {roomComputers.length === 0 ? (
                    <div className="text-white opacity-50 text-center z-10">
                        <i className="fa-solid fa-ghost text-4xl mb-2"></i>
                        <p>لا توجد أجهزة في هذه الغرفة</p>
                    </div>
                ) : (
                    <div 
                        className={`grid gap-12 p-12 transition-all duration-500 mx-auto ${getGridClass(roomComputers.length)}`}
                        style={{ transform: 'rotateX(10deg)' }}
                    >
                        {roomComputers.map(pc => {
                            // Resolve occupant name
                            let occupantName = pc.deskNumber;
                            let isCustomer = false;
                            if (pc.status === 'In Use') {
                                if (pc.customerId && customers) {
                                    const c = customers.find(x => x.id === pc.customerId);
                                    if (c) { occupantName = c.name; isCustomer = true; }
                                } else if (pc.currentUserId) {
                                    occupantName = 'مستخدم داخلي';
                                }
                            }

                            return (
                            <div 
                            key={pc.id} 
                            onClick={() => openPCModal(pc)}
                            className={`relative w-24 h-20 md:w-32 md:h-24 group cursor-pointer transition-transform hover:-translate-y-4 duration-300`}
                            >
                                {/* Monitor Stand */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 rounded-b-lg"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-6 bg-slate-600"></div>
                                
                                {/* Screen Bezel */}
                                <div className={`absolute top-0 left-0 w-full h-16 md:h-20 bg-slate-800 rounded-lg p-1 shadow-xl border-b-4 border-slate-900
                                    ${pc.status === 'Available' ? 'shadow-green-500/20' : pc.status === 'In Use' ? 'shadow-red-500/20' : 'shadow-amber-500/20'}
                                `}>
                                    {/* Screen Content */}
                                    <div className={`w-full h-full rounded overflow-hidden relative flex items-center justify-center flex-col
                                        ${pc.status === 'Available' ? 'bg-slate-900 border-b-2 border-green-500/50' : 
                                        pc.status === 'In Use' ? 'bg-blue-900/50 border-b-2 border-red-500/50' : 'bg-amber-900/50 border-b-2 border-amber-500/50'}
                                    `}>
                                        <span className="text-[10px] font-mono text-white/50">{pc.deskNumber}</span>
                                        {pc.status === 'In Use' && (
                                            <div className="text-[9px] text-white font-bold text-center px-1 truncate w-full z-10">
                                                {occupantName}
                                            </div>
                                        )}
                                        {pc.status === 'In Use' && <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>}
                                        {pc.status === 'Maintenance' && <i className="fa-solid fa-wrench text-amber-500 absolute"></i>}
                                    </div>
                                </div>

                                {/* Glow reflection */}
                                <div className={`absolute -bottom-8 left-0 right-0 h-8 blur-xl opacity-40
                                    ${pc.status === 'Available' ? 'bg-green-500' : pc.status === 'In Use' ? 'bg-red-500' : 'bg-amber-500'}
                                `}></div>
                            </div>
                        );})}
                    </div>
                )}
            </div>

            {selectedPC && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in-up overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">جهاز {selectedPC.deskNumber}</h3>
                                <div className="text-xs text-slate-400">{LAB_ROOMS.find(r => r.id === selectedPC.roomId)?.name}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                selectedPC.status === 'Available' ? 'bg-green-100 text-green-700' : 
                                selectedPC.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>{selectedPC.status}</span>
                        </div>

                        {/* Tabs */}
                        {canManage && (
                             <div className="flex border-b">
                                <button onClick={() => setModalTab('assign')} className={`flex-1 py-3 text-sm font-bold ${modalTab === 'assign' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>التخصيص والتحكم</button>
                                <button onClick={() => setModalTab('manage')} className={`flex-1 py-3 text-sm font-bold ${modalTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>إدارة الجهاز</button>
                             </div>
                        )}

                        <div className="p-6">
                            {modalTab === 'assign' && (
                                <div className="space-y-4">
                                     <div className="text-sm bg-slate-50 p-3 rounded-lg border">
                                         <span className="text-slate-500 block text-xs font-bold mb-1">المواصفات الحالية:</span> 
                                         <div className="font-mono text-slate-700">{selectedPC.specs}</div>
                                     </div>
                                     {selectedPC.issue && <div className="text-sm text-red-600 bg-red-50 p-2 rounded"><i className="fa-solid fa-triangle-exclamation"></i> {selectedPC.issue}</div>}
                                     
                                     {/* Occupant Info */}
                                     {selectedPC.status === 'In Use' && selectedPC.customerId && customers && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <div className="text-xs text-blue-500 font-bold mb-1">المستخدم الحالي:</div>
                                            <div className="font-bold text-slate-800">{customers.find(c => c.id === selectedPC.customerId)?.name}</div>
                                            <div className="text-xs text-slate-500">{customers.find(c => c.id === selectedPC.customerId)?.phone}</div>
                                        </div>
                                     )}

                                     <div className="flex flex-col gap-3 pt-2">
                                         {selectedPC.status === 'Available' && (
                                            <>
                                                <div className="border rounded-xl p-1 flex bg-slate-50 mb-2">
                                                    <button onClick={() => setAssignTab('customer')} className={`flex-1 py-1 rounded-lg text-sm font-bold transition ${assignTab === 'customer' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>عميل خارجي</button>
                                                    <button onClick={() => setAssignTab('internal')} className={`flex-1 py-1 rounded-lg text-sm font-bold transition ${assignTab === 'internal' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>طالب/موظف</button>
                                                </div>
                                                
                                                {assignTab === 'customer' && (
                                                    <select 
                                                        className="w-full border rounded-lg p-2 mb-2 text-sm"
                                                        value={selectedCustomer}
                                                        onChange={e => setSelectedCustomer(e.target.value)}
                                                    >
                                                        <option value="">اختر العميل...</option>
                                                        {customers?.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <button onClick={handleAssign} disabled={assignTab === 'customer' && !selectedCustomer} className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold">تخصيص وبدء الجلسة</button>
                                            </>
                                         )}
                                         {selectedPC.status === 'In Use' && (
                                            <button onClick={() => { onUpdateComputer({...selectedPC, status: 'Available', customerId: undefined, currentUserId: undefined}); setSelectedPC(null); }} className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold">إنهاء الجلسة</button>
                                         )}
                                         <div className="flex gap-2">
                                            <button onClick={() => { onUpdateComputer({...selectedPC, status: selectedPC.status === 'Maintenance' ? 'Available' : 'Maintenance', issue: selectedPC.status === 'Maintenance' ? undefined : 'صيانة يدوية'}); setSelectedPC(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold ${selectedPC.status === 'Maintenance' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {selectedPC.status === 'Maintenance' ? 'إخراج من الصيانة' : 'تحويل للصيانة'}
                                            </button>
                                            <button onClick={() => setSelectedPC(null)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 text-sm font-bold">إغلاق</button>
                                         </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'manage' && (
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold mb-1 text-slate-500">المعالج (Processor)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.cpu} onChange={e => setEditSpecs({...editSpecs, cpu: e.target.value})} placeholder="e.g. i5-12400" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">الرام (RAM)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.ram} onChange={e => setEditSpecs({...editSpecs, ram: e.target.value})} placeholder="e.g. 16GB DDR4" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">التخزين (Storage)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.storage} onChange={e => setEditSpecs({...editSpecs, storage: e.target.value})} placeholder="e.g. 512GB SSD" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">كارت الشاشة (VGA)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.vga} onChange={e => setEditSpecs({...editSpecs, vga: e.target.value})} placeholder="e.g. GTX 1650" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">اللوحة الأم (Motherboard)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.mb} onChange={e => setEditSpecs({...editSpecs, mb: e.target.value})} placeholder="e.g. H610M" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">نظام التشغيل (OS)</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.os} onChange={e => setEditSpecs({...editSpecs, os: e.target.value})} placeholder="e.g. Windows 11 Pro" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-slate-500">سطوع الشاشة</label>
                                            <input className="w-full border rounded p-2 text-sm" value={editSpecs.brightness} onChange={e => setEditSpecs({...editSpecs, brightness: e.target.value})} placeholder="e.g. 80%" />
                                        </div>
                                    </div>
                                    
                                    <button onClick={handleSaveSpecs} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">حفظ المواصفات</button>

                                    <div className="border-t pt-4 mt-4">
                                        <label className="block text-xs font-bold mb-2 text-slate-700">نقل الجهاز إلى قاعة أخرى</label>
                                        <div className="flex gap-2">
                                            <select 
                                                className="flex-1 border rounded p-2 text-sm"
                                                onChange={(e) => {
                                                    if(e.target.value) handleTransfer(e.target.value);
                                                }}
                                                value=""
                                            >
                                                <option value="">اختر القاعة...</option>
                                                {LAB_ROOMS.filter(r => r.id !== selectedPC.roomId).map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                                        <div className="text-xs text-red-500 font-bold">منطقة الخطر</div>
                                        <button onClick={handleDelete} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                                            <i className="fa-solid fa-trash"></i> حذف الجهاز نهائياً
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">إضافة جهاز جديد</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddNewComputer(formData.get('deskNum') as string, formData.get('specs') as string);
                        }}>
                             <div className="mb-3">
                                <label className="block text-xs font-bold mb-1">الغرفة</label>
                                <div className="bg-slate-100 p-2 rounded text-sm text-slate-500">{LAB_ROOMS.find(r => r.id === activeRoomId)?.name}</div>
                             </div>
                             <div className="mb-3">
                                 <label className="block text-xs font-bold mb-1">رقم المكتب (Desk Number)</label>
                                 <input name="deskNum" required placeholder="مثال: PC-23" className="w-full border rounded p-2 text-sm" defaultValue={`PC-${roomComputers.length + 1}`} />
                             </div>
                             <div className="mb-4">
                                 <label className="block text-xs font-bold mb-1">المواصفات</label>
                                 <input name="specs" required placeholder="مثال: i5 12th Gen, 16GB" className="w-full border rounded p-2 text-sm" defaultValue="i5 12th Gen, 16GB RAM" />
                             </div>
                             <div className="flex gap-2">
                                 <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">إلغاء</button>
                                 <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">إضافة</button>
                             </div>
                        </form>
                     </div>
                </div>
            )}
        </div>
    );
};
