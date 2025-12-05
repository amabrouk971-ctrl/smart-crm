
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { User, AppSettings, AttendanceRecord, AppLanguage, Payslip } from '../types';
import { TRANSLATIONS } from '../data';

interface AttendanceProps {
    currentUser: User;
    settings: AppSettings;
    records: AttendanceRecord[];
    setRecords: (r: AttendanceRecord[]) => void;
    onCheckIn: (record: AttendanceRecord) => void;
    onCheckOut: (recordId: string, checkoutTime: string) => void;
    users: User[];
    lang: AppLanguage;
    // Payroll Props
    payslips?: Payslip[];
    onGeneratePayslip?: (p: Payslip) => void;
}

// Haversine formula to calculate distance between two points in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// --- HELPER COMPONENTS (Moved Outside) ---

const PayslipEditorModal = ({ user, month, data, onClose, onSave }: { user: User, month: string, data: any, onClose: () => void, onSave: (p: Payslip) => void }) => {
    const [days, setDays] = useState(data.totalDays);
    const [rate, setRate] = useState(data.dailyRate);
    const [bonus, setBonus] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [note, setNote] = useState('');

    const basicSalary = days * rate;
    const netSalary = basicSalary + bonus - deductions;

    const handleSave = () => {
        const newPayslip: Payslip = {
            id: `PS-${Date.now()}-${user.id}`,
            organizationId: user.organizationId,
            userId: user.id,
            month: month,
            generatedAt: new Date().toISOString(),
            totalDays: days,
            totalHours: data.totalHours,
            dailyRate: rate,
            totalSalary: basicSalary,
            bonus,
            deductions,
            netSalary,
            status: 'Pending',
            adminNote: note
        };
        onSave(newPayslip);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">إصدار قسيمة راتب</h3>
                        <p className="text-sm text-slate-500">{user.name} - شهر {month}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold mb-1 text-slate-600">أيام العمل</label>
                        <input type="number" className="w-full border rounded-lg p-2 bg-slate-50 font-bold" value={days} onChange={e => setDays(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 text-slate-600">معدل اليوم (EGP)</label>
                        <input type="number" className="w-full border rounded-lg p-2 bg-slate-50 font-bold" value={rate} onChange={e => setRate(Number(e.target.value))} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold mb-1 text-green-600">مكافآت (Bonus)</label>
                        <input type="number" className="w-full border rounded-lg p-2 border-green-200 bg-green-50 font-bold text-green-700" value={bonus} onChange={e => setBonus(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 text-red-600">خصومات (Deductions)</label>
                        <input type="number" className="w-full border rounded-lg p-2 border-red-200 bg-red-50 font-bold text-red-700" value={deductions} onChange={e => setDeductions(Number(e.target.value))} />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1 text-slate-600">ملاحظات إدارية</label>
                    <textarea className="w-full border rounded-lg p-2 h-20 resize-none" placeholder="اكتب ملاحظة للموظف..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                </div>

                <div className="bg-slate-800 text-white p-4 rounded-xl flex justify-between items-center mb-6">
                    <div className="text-sm opacity-80">صافي الراتب المستحق</div>
                    <div className="text-2xl font-bold font-mono">{netSalary.toLocaleString()} EGP</div>
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">تأكيد وإصدار</button>
                </div>
            </div>
        </div>
    );
};

const PayrollDashboard = ({ users, records, payslips, onGenerate }: { users: User[], records: AttendanceRecord[], payslips: Payslip[], onGenerate: (p: Payslip) => void }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [editorData, setEditorData] = useState<{user: User, month: string, initialData: any} | null>(null);

    const staff = users.filter(u => u.type === 'staff');

    const handlePreparePayslip = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Calculate Stats
        const monthRecords = records.filter(r => r.userId === userId && r.date.startsWith(selectedMonth));
        const totalDays = monthRecords.length;
        
        let totalHours = 0;
        monthRecords.forEach(r => {
            if (r.checkIn && r.checkOut) {
                const diff = (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60);
                totalHours += diff;
            }
        });

        setEditorData({
            user,
            month: selectedMonth,
            initialData: {
                totalDays,
                totalHours: Math.round(totalHours),
                dailyRate: user.dailyRate || 0
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">إدارة الرواتب الشهرية</h3>
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border rounded-lg p-2 bg-slate-50 font-bold text-slate-700"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4">الموظف</th>
                            <th className="p-4">معدل اليوم</th>
                            <th className="p-4">أيام العمل</th>
                            <th className="p-4">ساعات العمل</th>
                            <th className="p-4">الراتب المستحق</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {staff.map(user => {
                            const monthRecords = records.filter(r => r.userId === user.id && r.date.startsWith(selectedMonth));
                            const daysWorked = monthRecords.length;
                            
                            // Rough calc for display
                            let hoursWorked = 0;
                            monthRecords.forEach(r => {
                                if (r.checkIn && r.checkOut) {
                                    hoursWorked += (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 36e5;
                                }
                            });

                            const estimatedSalary = (user.dailyRate || 0) * daysWorked;
                            const existingPayslip = payslips.find(p => p.userId === user.id && p.month === selectedMonth);

                            return (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-lg">{user.avatar}</div>
                                        <div>
                                            <div className="font-bold">{user.name}</div>
                                            <div className="text-xs text-slate-400">{user.jobTitle || user.role}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">{user.dailyRate ? user.dailyRate : '-'} EGP</td>
                                    <td className="p-4 font-bold">{daysWorked} يوم</td>
                                    <td className="p-4 text-slate-500">{Math.round(hoursWorked)} ساعة</td>
                                    <td className="p-4 font-mono font-bold text-green-600">{estimatedSalary.toLocaleString()} EGP</td>
                                    <td className="p-4">
                                        {existingPayslip ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">تم الإصدار</span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs">قيد الانتظار</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handlePreparePayslip(user.id)}
                                            disabled={!!existingPayslip}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            {existingPayslip ? 'تم' : 'إصدار قسيمة'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editorData && (
                <PayslipEditorModal 
                    user={editorData.user}
                    month={editorData.month}
                    data={editorData.initialData}
                    onClose={() => setEditorData(null)}
                    onSave={onGenerate}
                />
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AttendanceView = ({ currentUser, settings, records, setRecords, onCheckIn, onCheckOut, users, lang, payslips = [], onGeneratePayslip }: AttendanceProps) => {
    const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWithinRange, setIsWithinRange] = useState(false);
    
    // Admin View Mode
    const [adminView, setAdminView] = useState<'monitor' | 'payroll'>('monitor');

    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';
    const t = TRANSLATIONS[lang];

    // Today's record for current user - FIXED TIMEZONE ISSUE
    // Using en-CA returns YYYY-MM-DD in local time
    const today = new Date().toLocaleDateString('en-CA');
    const todayRecord = records.find(r => r.userId === currentUser.id && r.date === today);

    // Initial Location Check (for UI display only)
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPos({ lat: latitude, lng: longitude });
                if (settings.orgLat != null && settings.orgLng != null) {
                    const dist = calculateDistance(latitude, longitude, settings.orgLat, settings.orgLng);
                    setDistance(Math.round(dist));
                    setIsWithinRange(dist <= (settings.allowedRadius || 100));
                }
            },
            (err) => {
                console.warn("Location access denied or error:", err.message);
                // We don't set errorMsg here to avoid cluttering UI on load if permission is just prompt
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, [settings.orgLat, settings.orgLng]);

    const refreshLocation = () => {
        setIsLoading(true);
        setErrorMsg(null);

        if (!navigator.geolocation) {
            setErrorMsg("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                setCurrentPos({ lat: userLat, lng: userLng });

                if (settings.orgLat != null && settings.orgLng != null) {
                    const dist = calculateDistance(userLat, userLng, settings.orgLat, settings.orgLng);
                    setDistance(Math.round(dist));
                    setIsWithinRange(dist <= (settings.allowedRadius || 100));
                } else {
                    setErrorMsg("لم يقم الأدمن بتحديد موقع المؤسسة في الإعدادات.");
                }
                setIsLoading(false);
            },
            (err) => {
                console.error("Geolocation Error:", err.message);
                let msg = "تعذر الحصول على الموقع.";
                if (err.code === 1) msg = "تم رفض إذن الوصول للموقع. يرجى تفعيله من إعدادات المتصفح.";
                else if (err.code === 2) msg = "الموقع غير متاح حالياً (GPS signal lost).";
                else if (err.code === 3) msg = "انتهت مهلة الحصول على الموقع (Timeout).";
                setErrorMsg(msg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleAction = () => {
        setIsLoading(true);
        setErrorMsg(null);

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        // Get FRESH location specifically for the action
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Update UI state
                setCurrentPos({ lat: userLat, lng: userLng });

                // Check Geofence
                if (settings.orgLat != null && settings.orgLng != null) {
                    const dist = calculateDistance(userLat, userLng, settings.orgLat, settings.orgLng);
                    setDistance(Math.round(dist));
                    
                    const allowed = settings.allowedRadius || 100;
                    const inRange = dist <= allowed;
                    setIsWithinRange(inRange);

                    if (!inRange) {
                        alert(`عذراً، لا يمكنك تسجيل الحضور. أنت تبعد ${Math.round(dist)} متر عن الموقع المحدد.\n(النطاق المسموح: ${allowed} متر)`);
                        setIsLoading(false);
                        return;
                    }

                    // Perform Check In / Check Out logic
                    const now = new Date();
                    
                    if (todayRecord && !todayRecord.checkOut) {
                        // Check Out
                        onCheckOut(todayRecord.id, now.toISOString());
                        alert(`تم تسجيل الانصراف بنجاح الساعة ${now.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}`);
                    } else if (!todayRecord) {
                        // Check In
                        let status: 'Present' | 'Late' = 'Present';
                        // Late logic: e.g. after 9:15 AM
                        if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
                            status = 'Late';
                        }

                        const newRecord: AttendanceRecord = {
                            id: `att-${Date.now()}`,
                            organizationId: currentUser.organizationId,
                            userId: currentUser.id,
                            date: today, // Use local date
                            checkIn: now.toISOString(),
                            locationCheckIn: `${userLat.toFixed(6)},${userLng.toFixed(6)}`,
                            status
                        };
                        onCheckIn(newRecord);
                        alert(`تم تسجيل الحضور بنجاح الساعة ${now.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}`);
                    } else {
                        alert("لقد قمت بتسجيل الحضور والانصراف لهذا اليوم مسبقاً.");
                    }
                } else {
                    alert("لم يتم إعداد موقع المؤسسة بعد. يرجى مراجعة المسؤول لضبط الإحداثيات.");
                }
                setIsLoading(false);
            },
            (err) => {
                console.error("Action Geolocation Error:", err.message);
                let msg = "خطأ: تعذر الوصول إلى الموقع الجغرافي.";
                if (err.code === 1) msg = "تم رفض الإذن. يرجى السماح للموقع من إعدادات المتصفح.";
                else if (err.code === 2) msg = "إشارة GPS غير متوفرة.";
                else if (err.code === 3) msg = "انتهت المهلة. حاول مرة أخرى.";
                alert(msg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleExportExcel = () => {
        const X = (XLSX as any).default || XLSX;
        const data = records.map(r => {
            const user = users.find(u => u.id === r.userId);
            return {
                'الموظف': user?.name || 'Unknown',
                'التاريخ': r.date,
                'وقت الحضور': new Date(r.checkIn).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}),
                'وقت الانصراف': r.checkOut ? new Date(r.checkOut).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : '-',
                'الحالة': r.status === 'Present' ? 'حاضر' : 'متأخر',
                'الموقع': r.locationCheckIn
            };
        });
        const ws = X.utils.json_to_sheet(data);
        const wb = X.utils.book_new();
        X.utils.book_append_sheet(wb, ws, "Attendance");
        X.writeFile(wb, `Attendance_Report_${today}.xlsx`);
    };

    // Calculate My Summary
    const myHistory = records.filter(r => r.userId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const daysPresent = myHistory.length;
    const daysLate = myHistory.filter(r => r.status === 'Late').length;

    // Calculate General Summary (Admin)
    const todayAttendees = records.filter(r => r.date === today);
    const presentCount = todayAttendees.length;
    const lateCount = todayAttendees.filter(r => r.status === 'Late').length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t.sidebar.attendance}</h2>
                    <p className="text-slate-500 text-sm">نظام تسجيل الحضور الذكي عبر الموقع الجغرافي</p>
                </div>
                
                {isAdmin && (
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                        <button 
                            onClick={() => setAdminView('monitor')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminView === 'monitor' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                        >
                            سجل الحضور
                        </button>
                        <button 
                            onClick={() => setAdminView('payroll')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminView === 'payroll' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                        >
                            الرواتب (Payroll)
                        </button>
                    </div>
                )}
            </div>

            {isAdmin && adminView === 'payroll' && onGeneratePayslip ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                    <PayrollDashboard users={users} records={records} payslips={payslips} onGenerate={onGeneratePayslip} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Attendance Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-100">
                            <div className="absolute inset-0 bg-blue-50 opacity-50 rounded-3xl"></div>
                            
                            <div className="relative z-10 text-center w-full">
                                <div className="mb-6">
                                    <div className="text-6xl font-black text-slate-800 mb-2 font-mono tracking-wider">
                                        {new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-slate-500 font-bold">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>

                                <div className="mb-6 flex justify-center">
                                    <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm
                                        ${isLoading ? 'bg-slate-100 text-slate-500' : isWithinRange ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}
                                    `}>
                                        {isLoading ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin"></i> جاري تحديد الموقع...</>
                                        ) : isWithinRange ? (
                                            <><i className="fa-solid fa-location-dot"></i> أنت في الموقع ({distance}m)</>
                                        ) : (
                                            <><i className="fa-solid fa-location-crosshairs"></i> خارج النطاق ({distance !== null ? distance : '?'}m)</>
                                        )}
                                        <button onClick={refreshLocation} className="hover:bg-black/10 rounded-full w-5 h-5 flex items-center justify-center ml-1"><i className="fa-solid fa-rotate-right"></i></button>
                                    </div>
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-4 max-w-xs mx-auto border border-red-100">
                                        <i className="fa-solid fa-triangle-exclamation mr-1"></i> {errorMsg}
                                    </div>
                                )}

                                <button 
                                    onClick={handleAction}
                                    disabled={isLoading || (todayRecord && !!todayRecord.checkOut)}
                                    className={`w-full max-w-xs py-4 rounded-2xl font-bold text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
                                        ${todayRecord && todayRecord.checkOut 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : todayRecord 
                                                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-100'
                                        }
                                    `}
                                >
                                    {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 
                                    todayRecord && todayRecord.checkOut ? <><i className="fa-solid fa-check-circle"></i> انتهى اليوم</> :
                                    todayRecord ? <><i className="fa-solid fa-right-from-bracket"></i> تسجيل انصراف</> : 
                                    <><i className="fa-solid fa-fingerprint"></i> تسجيل حضور</>}
                                </button>

                                {todayRecord && !todayRecord.checkOut && (
                                    <p className="mt-4 text-sm text-slate-500">
                                        تم تسجيل الحضور: <span className="font-bold font-mono text-slate-800">{new Date(todayRecord.checkIn).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* My Stats Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                                <div className="text-4xl font-black text-blue-600 mb-2">{daysPresent}</div>
                                <div className="text-slate-500 text-sm font-bold">أيام الحضور (الشهر)</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                                <div className="text-4xl font-black text-amber-500 mb-2">{daysLate}</div>
                                <div className="text-slate-500 text-sm font-bold">أيام التأخير</div>
                            </div>
                            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">سجلي الأخير</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {myHistory.slice(0, 5).map(r => (
                                        <div key={r.id} className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded">
                                            <span className="font-mono text-slate-600">{r.date}</span>
                                            <span className={`font-bold ${r.status === 'Present' ? 'text-green-600' : 'text-amber-600'}`}>{r.status}</span>
                                        </div>
                                    ))}
                                    {myHistory.length === 0 && <p className="text-center text-slate-400 text-sm">لا توجد سجلات</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Daily Report */}
                    {isAdmin && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">تقرير اليوم ({today})</h3>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                        <span className="text-green-600 font-bold"><i className="fa-solid fa-user-check"></i> {presentCount} حضور</span>
                                        <span className="text-amber-600 font-bold"><i className="fa-solid fa-clock"></i> {lateCount} تأخير</span>
                                        <span className="text-slate-400"><i className="fa-solid fa-user-xmark"></i> {users.filter(u => u.type === 'staff').length - presentCount} غياب</span>
                                    </div>
                                </div>
                                <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm flex items-center gap-2">
                                    <i className="fa-solid fa-file-excel"></i> تصدير التقرير
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-white text-slate-500 border-b">
                                        <tr>
                                            <th className="p-4">الموظف</th>
                                            <th className="p-4">وقت الحضور</th>
                                            <th className="p-4">وقت الانصراف</th>
                                            <th className="p-4">الحالة</th>
                                            <th className="p-4">الموقع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {todayAttendees.length > 0 ? todayAttendees.map(r => {
                                            const user = users.find(u => u.id === r.userId);
                                            return (
                                                <tr key={r.id} className="hover:bg-slate-50">
                                                    <td className="p-4 flex items-center gap-2">
                                                        {user?.avatar} <span className="font-bold">{user?.name}</span>
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-600 dir-ltr text-right">
                                                        {new Date(r.checkIn).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                    <td className="p-4 font-mono text-slate-600 dir-ltr text-right">
                                                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : '-'}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {r.status === 'Present' ? 'حاضر' : 'متأخر'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-slate-400 font-mono" title={r.locationCheckIn}>
                                                        {r.locationCheckIn.split(',').map(c => parseFloat(c).toFixed(4)).join(', ')}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد حضور مسجل اليوم</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
