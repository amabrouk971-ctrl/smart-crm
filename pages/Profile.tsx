
import React, { useState } from 'react';
import { User, Task, CourseProgress, AppLanguage, AttendanceRecord, LeaveRequest, Page, Payslip } from '../types';
import { LEVELS, translateRole, translateStatus, translatePriority } from '../data';

interface ProfileProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  courseProgress: CourseProgress[];
  attendanceRecords: AttendanceRecord[];
  onUpdateUser: (u: User) => void;
  onCheckIn?: (record: AttendanceRecord) => void;
  onCheckOut?: (recordId: string, checkoutTime: string) => void;
  onRequestLeave?: (req: Partial<LeaveRequest>) => void;
  setView?: (p: Page) => void; // To redirect to Attendance View for GPS
  lang: AppLanguage;
  payslips?: Payslip[];
}

export const ProfilePage = ({ currentUser, users, tasks, courseProgress, attendanceRecords, onUpdateUser, setView, lang, payslips = [] }: ProfileProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(currentUser.bio || '');
    const [activeTab, setActiveTab] = useState<'stats' | 'docs' | 'tasks' | 'attendance' | 'payroll'>('stats');
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    
    const isAdmin = currentUser.role === 'Admin';

    // Stats Calculation
    const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
    const completedTasks = myTasks.filter(t => t.status === 'Done');
    const onTimeTasks = completedTasks.filter(t => !t.isPenalized).length;
    const completionRate = myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;
    const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeTasks / completedTasks.length) * 100) : 0;
    const myCompletedCourses = courseProgress.filter(cp => cp.userId === currentUser.id && cp.isCompleted).length;
    const currentLevel = LEVELS.find(l => l.level === currentUser.level) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === currentUser.level + 1);
    const progressPercent = nextLevel ? ((currentUser.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

    // Attendance Data for current user
    const myAttendance = attendanceRecords.filter(r => r.userId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // My Payslips
    const myPayslips = payslips.filter(p => p.userId === currentUser.id).sort((a,b) => b.month.localeCompare(a.month));

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateUser({ ...currentUser, customImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'cert') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'id') {
                    onUpdateUser({ ...currentUser, idCardImage: result });
                } else {
                    onUpdateUser({ 
                        ...currentUser, 
                        certifications: [...(currentUser.certifications || []), result] 
                    });
                    alert('تم رفع الشهادة بنجاح!');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveBio = () => {
        onUpdateUser({ ...currentUser, bio });
        setIsEditing(false);
    };

    // Live Estimate Calculation
    const calculateLivePayroll = () => {
        const dailyRate = currentUser.dailyRate || 0;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const daysWorked = myAttendance.filter(r => r.date.startsWith(currentMonth)).length;
        const estimatedPay = daysWorked * dailyRate;
        return { dailyRate, daysWorked, estimatedPay };
    };

    const { dailyRate, daysWorked, estimatedPay } = calculateLivePayroll();

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Professional Header */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
                {/* Cover Photo */}
                <div className="h-48 bg-gradient-to-r from-blue-900 to-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute bottom-4 left-6 text-white/60 text-xs font-mono">
                        User ID: {currentUser.id} | Joined: {currentUser.joiningDate || 'N/A'}
                    </div>
                    {/* Quick Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                            onClick={() => setView && setView('attendance')}
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition flex items-center gap-2"
                        >
                            <i className="fa-solid fa-fingerprint"></i> تسجيل حضور/انصراف
                        </button>
                        <button 
                            onClick={() => setView && setView('leaves')}
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition flex items-center gap-2"
                        >
                            <i className="fa-solid fa-plane-departure"></i> طلب إجازة
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
                     <div className="relative">
                         <div className="w-36 h-36 rounded-full border-[6px] border-white bg-slate-200 shadow-2xl overflow-hidden flex items-center justify-center">
                             {currentUser.customImage ? (
                                 <img src={currentUser.customImage} alt={currentUser.name} className="w-full h-full object-cover" />
                             ) : (
                                 <span className="text-7xl">{currentUser.avatar}</span>
                             )}
                         </div>
                         <label className="absolute bottom-2 right-2 bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg border-2 border-white transition-transform hover:scale-110">
                             <i className="fa-solid fa-camera text-sm"></i>
                             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                         </label>
                     </div>
                     
                     <div className="flex-1 mb-1">
                         <h1 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser.name}</h1>
                         <div className="text-lg text-blue-600 font-bold mb-2">{currentUser.jobTitle || translateRole(currentUser.role, lang)}</div>
                         
                         <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                             {currentUser.department && <span className="bg-slate-100 px-3 py-1 rounded-full"><i className="fa-solid fa-building mr-1"></i> {currentUser.department}</span>}
                             <span className="bg-slate-100 px-3 py-1 rounded-full"><i className="fa-solid fa-envelope mr-1"></i> {currentUser.email || 'No Email'}</span>
                             <span className="bg-slate-100 px-3 py-1 rounded-full"><i className="fa-solid fa-phone mr-1"></i> {currentUser.phone || 'No Phone'}</span>
                         </div>
                     </div>

                     <div className="flex gap-3 mb-2">
                         {isAdmin && (
                             <button onClick={() => setShowEditAdminModal(true)} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all flex items-center gap-2">
                                 <i className="fa-solid fa-user-pen"></i> Edit Profile
                             </button>
                         )}
                         <button onClick={() => setIsEditing(!isEditing)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                             {isEditing ? 'Cancel' : 'Edit Bio'}
                         </button>
                     </div>
                </div>

                <div className="px-8 pb-8 pt-2">
                    {isEditing ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <textarea 
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none h-24"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="Write a short bio..."
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button onClick={handleSaveBio} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Save Bio</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-600 leading-relaxed max-w-3xl italic">
                            "{currentUser.bio || "No bio added yet."}"
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="fa-chart-pie" label="KPIs & Stats" />
                <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon="fa-clock" label="Attendance Log" />
                <TabButton active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} icon="fa-file-invoice-dollar" label="Payroll & Payslip" />
                <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon="fa-list-check" label="Task History" />
                <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon="fa-folder-open" label="Documents" />
            </div>

            {/* CONTENT AREAS */}
            
            {/* 1. Stats Tab */}
            {activeTab === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KPICard title="Task Completion" value={`${completionRate}%`} sub="Success Rate" color="blue" icon="fa-check-circle" />
                        <KPICard title="On-Time Delivery" value={`${onTimeRate}%`} sub="Punctuality" color="green" icon="fa-clock" />
                        <KPICard title="Current Level" value={currentLevel.name} sub={`${currentUser.points} XP`} color="indigo" icon="fa-layer-group" />
                        <KPICard title="Courses" value={myCompletedCourses} sub="Completed" color="amber" icon="fa-graduation-cap" />
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4">Level Progress</h3>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        Level {currentUser.level}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {Math.round(progressPercent)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Attendance Tab */}
            {activeTab === 'attendance' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg">سجل الحضور والانصراف</h3>
                        <div className="text-sm text-slate-500">Total Days: {myAttendance.length}</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Check In</th>
                                    <th className="p-4">Check Out</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {myAttendance.length > 0 ? myAttendance.map(rec => (
                                    <tr key={rec.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono">{rec.date}</td>
                                        <td className="p-4 dir-ltr text-right">{new Date(rec.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                        <td className="p-4 dir-ltr text-right">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${rec.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {rec.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-mono text-slate-400">{rec.locationCheckIn}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No attendance records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. Payroll Tab */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    {/* Official Payslips */}
                    {myPayslips.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b font-bold text-slate-800">قسائم الراتب المصدرة</div>
                            <div className="divide-y">
                                {myPayslips.map(ps => (
                                    <div key={ps.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                                                <i className="fa-solid fa-file-invoice-dollar"></i>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">Payslip: {ps.month}</div>
                                                <div className="text-xs text-slate-500">Issued: {new Date(ps.generatedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold font-mono text-lg text-green-700">{ps.netSalary.toLocaleString()} EGP</div>
                                            <div className="text-xs text-slate-400">{ps.totalDays} days worked</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-xl mb-6 text-slate-800">تقدير الشهر الحالي (Live Estimate)</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">معدل اليوم</span>
                                    <span className="font-bold font-mono">{dailyRate.toLocaleString()} EGP</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">أيام العمل (هذا الشهر)</span>
                                    <span className="font-bold font-mono">{daysWorked} days</span>
                                </div>
                                <div className="flex justify-between pt-2 text-lg">
                                    <span className="font-bold text-slate-800">إجمالي مقدر</span>
                                    <span className="font-bold text-blue-600 font-mono">{estimatedPay.toLocaleString()} EGP</span>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-400 text-center">
                                * هذا مجرد تقدير بناءً على الحضور الفعلي. الراتب النهائي يصدر من الإدارة.
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mb-4">
                                <i className="fa-solid fa-hand-holding-dollar"></i>
                            </div>
                            <h3 className="font-bold text-lg mb-2">استفسار مالي</h3>
                            <p className="text-sm text-slate-500 mb-6">هل لديك استفسار بخصوص الراتب أو الخصومات؟ تواصل مع الموارد البشرية.</p>
                            <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black shadow-md">
                                <i className="fa-solid fa-comments mr-2"></i> تواصل مع HR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Task History Tab */}
            {activeTab === 'tasks' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b">
                                <tr>
                                    <th className="p-4">Task Title</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Finished Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {completedTasks.length > 0 ? completedTasks.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold">{t.title}</td>
                                        <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{t.priority}</span></td>
                                        <td className="p-4 font-mono text-xs">{new Date(t.lastUpdated).toLocaleDateString()}</td>
                                        <td className="p-4"><span className="text-green-600 font-bold text-xs"><i className="fa-solid fa-check"></i> Done</span></td>
                                    </tr>
                                )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400">No completed tasks yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 5. Documents Tab */}
            {activeTab === 'docs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <i className="fa-solid fa-id-card text-blue-600"></i> ID / Passport
                            </h3>
                            <label className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100">
                                <i className="fa-solid fa-upload"></i> Upload
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDocUpload(e, 'id')} />
                            </label>
                        </div>
                        {currentUser.idCardImage ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                                <img src={currentUser.idCardImage} alt="ID Card" className="w-full h-48 object-contain rounded-lg" />
                                <div className="text-center mt-2 text-xs text-green-600 font-bold"><i className="fa-solid fa-check-circle"></i> Verified</div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 h-48 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                <i className="fa-solid fa-image text-3xl mb-2"></i>
                                <p className="text-sm">No ID uploaded</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <i className="fa-solid fa-certificate text-amber-500"></i> Certifications
                            </h3>
                            <label className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-amber-100">
                                <i className="fa-solid fa-plus"></i> Add Cert
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDocUpload(e, 'cert')} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {currentUser.certifications && currentUser.certifications.length > 0 ? currentUser.certifications.map((cert, i) => (
                                <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                                    <img src={cert} className="w-full h-24 object-cover rounded-lg" />
                                </div>
                            )) : <p className="col-span-2 text-center text-slate-400 py-8">No certifications yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Edit Modal */}
            {showEditAdminModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
                        <h3 className="font-bold text-xl mb-4">Edit Employee Details (Admin)</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.currentTarget);
                            onUpdateUser({
                                ...currentUser,
                                jobTitle: form.get('jobTitle') as string,
                                department: form.get('department') as string,
                                salary: Number(form.get('salary')),
                                dailyRate: Number(form.get('dailyRate')),
                                phone: form.get('phone') as string
                            });
                            setShowEditAdminModal(false);
                        }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1">Job Title</label>
                                    <input name="jobTitle" defaultValue={currentUser.jobTitle} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">Department</label>
                                    <input name="department" defaultValue={currentUser.department} className="w-full border rounded p-2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1">Salary (EGP)</label>
                                    <input name="salary" type="number" defaultValue={currentUser.salary} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-blue-600">Daily Rate</label>
                                    <input name="dailyRate" type="number" defaultValue={currentUser.dailyRate} className="w-full border rounded p-2 bg-blue-50 border-blue-200" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Phone</label>
                                <input name="phone" defaultValue={currentUser.phone} className="w-full border rounded p-2" />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowEditAdminModal(false)} className="flex-1 bg-slate-100 py-2 rounded-lg text-slate-600 font-bold">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-lg text-white font-bold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
            ${active ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
        `}
    >
        <i className={`fa-solid ${icon}`}></i> {label}
    </button>
);

const KPICard = ({ title, value, sub, color, icon }: { title: string, value: string | number, sub: string, color: string, icon: string }) => {
    // Map color names to classes
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        amber: 'text-amber-600 bg-amber-50'
    };
    const theme = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">{title}</div>
                    <div className={`text-3xl font-black ${theme.split(' ')[0]}`}>{value}</div>
                    <div className="text-slate-400 text-xs mt-1">{sub}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${theme}`}>
                    <i className={`fa-solid ${icon}`}></i>
                </div>
            </div>
        </div>
    );
};