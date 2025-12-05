
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    User, Task, InventoryItem, MaintenanceTicket, Customer, 
    LabComputer, FinanceRecord, POSOrder, AttendanceRecord, 
    LeaveRequest, Glitch, FeedPost, Page, AppLanguage, 
    Organization, POSSession, POSCategory, POSTax, 
    Course, Quiz, PurchaseOrder, Campaign 
} from './types';
import { 
    MOCK_CAMPAIGNS, MOCK_COURSES, 
    INITIAL_PERMISSIONS, MOCK_FINANCE, 
    MOCK_GLITCHES, MOCK_LEAVES, MOCK_PURCHASE_ORDERS, 
    INITIAL_INVENTORY, MOCK_QUIZZES, 
    LAB_ROOMS 
} from './data';

import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Common';
import { AIAssistant } from './components/AIAssistant';

import { Dashboard } from './pages/Dashboard';
import { TasksKanban } from './pages/Tasks';
import { InventoryView, MaintenanceView } from './pages/Inventory';
import { CustomersDatabase } from './pages/Customers';
import { ComputerLab3D } from './pages/Lab';
import { LearningHub } from './pages/Learning';
import { GamificationPage } from './pages/Gamification';
import { TeamView } from './pages/Team';
import { ProfilePage } from './pages/Profile';
import { SettingsView } from './pages/Settings';
import { WhatsAppHub } from './pages/WhatsAppHub';
import { FinanceView } from './pages/Finance';
import { RelationalTables } from './pages/RelationalTables';
import { FeedView } from './pages/Feed';
import { LeaveView } from './pages/Leaves';
import { GlitchView } from './pages/Glitches';
import { SmartDashboard } from './pages/SmartDashboard';
import { MarketingView } from './pages/Marketing';
import { POSView } from './pages/POS';
import { ERPModuleView } from './pages/ERP';
import { ChatView } from './pages/Chat';
import { AttendanceView } from './pages/Attendance';
import { LoginPage } from './pages/Login';

const App = () => {
    // --- STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<Page>('dashboard');
    const [lang, setLang] = useState<AppLanguage>('ar');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Data State
    const [users, setUsers] = useState<User[]>([
        { id: 'U1', organizationId: 'ORG-SMARTTECH', name: 'Admin User', role: 'Admin', type: 'staff', avatar: '👨‍💼', points: 1200, level: 2, badges: [], performanceMetric: 95, smartCoins: 500, karma: 10, username: 'admin', password: '123' },
        { id: 'U2', organizationId: 'ORG-SMARTTECH', name: 'Manager User', role: 'Manager', type: 'staff', avatar: '👩‍💼', points: 900, level: 1, badges: [], performanceMetric: 88, smartCoins: 200, karma: 5, username: 'manager', password: '123' },
        { id: 'U3', organizationId: 'ORG-SMARTTECH', name: 'Tech User', role: 'Technician', type: 'staff', avatar: '👨‍🔧', points: 1500, level: 3, badges: [], performanceMetric: 92, smartCoins: 300, karma: 20, username: 'tech', password: '123' },
    ]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [labComputers, setLabComputers] = useState<LabComputer[]>(
        LAB_ROOMS.flatMap(room => Array.from({length: room.capacity}).map((_, i) => ({
            id: `PC-${room.id}-${i+1}`,
            organizationId: 'ORG-SMARTTECH',
            roomId: room.id,
            deskNumber: `PC-${room.id}-${i+1}`,
            status: 'Available',
            specs: 'i5, 16GB RAM'
        })))
    );
    const [finance, setFinance] = useState<FinanceRecord[]>(MOCK_FINANCE);
    const [posOrders, setPosOrders] = useState<POSOrder[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
    const [glitches, setGlitches] = useState<Glitch[]>(MOCK_GLITCHES);
    const [feed, setFeed] = useState<FeedPost[]>([]);
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    
    // Organization & Settings
    const [organization, setOrganization] = useState<Organization | null>({
        id: 'ORG-SMARTTECH',
        name: 'SmartTech Training Center',
        createdAt: new Date().toISOString(),
        settings: {
            theme: 'royal',
            font: 'Cairo',
            language: 'ar',
            currency: 'EGP',
            dateFormat: 'YYYY-MM-DD',
            biometricEnabled: false,
            notificationsEnabled: true,
            features: { tasks: true, crm: true, inventory: true, lab: true, learning: true, gamification: true, finance: true, hr: true, social: true, glitches: true, marketing: true, pos: true }
        }
    });
    
    const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
    const [notifications, setNotifications] = useState<any[]>([]);

    // POS State
    const [posSessions, setPosSessions] = useState<POSSession[]>([]);
    const [posCategories, setPosCategories] = useState<POSCategory[]>([{id: 'C1', organizationId: 'ORG-SMARTTECH', name: 'Drinks', color: 'bg-blue-500'}]);
    const [posTaxes, setPosTaxes] = useState<POSTax[]>([]);

    if (!currentUser) {
        return <LoginPage onLogin={setCurrentUser} onSwitchToRegister={() => {}} users={users} lang={lang} />;
    }

    const commonProps = {
        currentUser,
        lang,
        users,
    };

    const features = organization?.settings.features || {};

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: organization?.settings.font }}>
            <Sidebar 
                currentUser={currentUser}
                currentOrganization={organization}
                view={view}
                setView={setView}
                notifications={notifications}
                handleLogout={() => setCurrentUser(null)}
                isOpen={true}
                onClose={() => {}}
                onResetData={() => {}}
                theme={organization?.settings.theme || 'royal'}
                lang={lang}
                permissions={permissions}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                    {view === 'dashboard' && <Dashboard tasks={tasks} users={users} currentUser={currentUser} onAddTask={() => setView('tasks')} lang={lang} />}
                    {features.tasks && view === 'tasks' && <TasksKanban tasks={tasks} setTasks={setTasks} users={users} currentUser={currentUser} addNotification={() => {}} lang={lang} />}
                    {features.inventory && view === 'inventory' && <InventoryView inventory={inventory} setInventory={setInventory} currentUser={currentUser} lang={lang} permissions={permissions} />}
                    {features.inventory && view === 'maintenance' && <MaintenanceView tickets={tickets} setTickets={setTickets} users={users} currentUser={currentUser} onNavigateToItem={() => {}} lang={lang} permissions={permissions} />}
                    {features.lab && view === 'lab' && <ComputerLab3D computers={labComputers} currentUser={currentUser} customers={customers} onUpdateComputer={(c) => setLabComputers(labComputers.map(pc => pc.id === c.id ? c : pc))} lang={lang} />}
                    {features.crm && view === 'customers' && <CustomersDatabase customers={customers} setCustomers={setCustomers} currentUser={currentUser} lang={lang} />}
                    {features.crm && view === 'whatsapp' && <WhatsAppHub customers={customers} setCustomers={setCustomers} lang={lang} currentUser={currentUser} />}
                    {features.learning && view === 'courses' && <LearningHub courses={courses} setCourses={setCourses} quizzes={quizzes} currentUser={currentUser} courseProgress={[]} onCourseComplete={() => {}} onQuizComplete={() => {}} lang={lang} />}
                    {features.gamification && view === 'leaderboard' && <GamificationPage users={users} currentUser={currentUser} onRedeem={() => {}} onSpin={() => {}} onSendKarma={() => {}} lang={lang} />}
                    {features.hr && view === 'team' && <TeamView users={users} lang={lang} />}
                    {features.hr && view === 'attendance' && <AttendanceView currentUser={currentUser} settings={organization!.settings} records={attendance} setRecords={setAttendance} onCheckIn={(r) => setAttendance([...attendance, r])} onCheckOut={(id, time) => setAttendance(attendance.map(r => r.id === id ? {...r, checkOut: time} : r))} users={users} lang={lang} />}
                    {features.hr && view === 'leaves' && <LeaveView currentUser={currentUser} users={users} leaves={leaves} setLeaves={setLeaves} onRequestLeave={(l) => setLeaves([...leaves, l as LeaveRequest])} onUpdateStatus={(id, s, c) => setLeaves(leaves.map(l => l.id === id ? {...l, status: s, adminComment: c} : l))} lang={lang} />}
                    {features.finance && view === 'finance' && <FinanceView records={finance} setRecords={setFinance} customers={customers} currentUser={currentUser} onAddRecord={(r) => setFinance([...finance, r])} lang={lang} />}
                    {view === 'relational' && (
                        <RelationalTables 
                            lang={lang} 
                            users={users} 
                            tasks={tasks} 
                            inventory={inventory} 
                            tickets={tickets} 
                            customers={customers} 
                            labComputers={labComputers}
                            finance={finance}
                            posOrders={posOrders}
                            attendance={attendance}
                            leaves={leaves}
                            glitches={glitches}
                        />
                    )}
                    {features.social && view === 'feed' && <FeedView feed={feed} users={users} currentUser={currentUser} onLike={(id) => { setFeed(feed.map(p => { if(p.id !== id) return p; const likes = p.likes.includes(currentUser.id) ? p.likes.filter(uid => uid !== currentUser.id) : [...p.likes, currentUser.id]; return { ...p, likes }; })); }} onComment={(id, text) => { setFeed(feed.map(p => { if(p.id !== id) return p; return { ...p, comments: [...p.comments, { id: Date.now().toString(), userId: currentUser.id, text, timestamp: new Date().toISOString() }] }; })); }} onAddPost={(p) => setFeed([{ ...p, id: Date.now().toString(), timestamp: new Date().toISOString(), likes: [], comments: [] } as FeedPost, ...feed])} lang={lang} />}
                    {features.glitches && view === 'glitches' && <GlitchView glitches={glitches} setGlitches={setGlitches} users={users} customers={customers} currentUser={currentUser} onAddGlitch={(g) => setGlitches([...glitches, g])} lang={lang} />}
                    {features.marketing && view === 'marketing' && <MarketingView campaigns={campaigns} setCampaigns={setCampaigns} customers={customers} onAddCampaign={(c) => setCampaigns([...campaigns, c])} lang={lang} currentUser={currentUser} />}
                    {view === 'smart_dashboard' && <SmartDashboard users={users} tasks={tasks} inventory={inventory} tickets={tickets} customers={customers} finance={finance} glitches={glitches} lang={lang} />}
                    {features.pos && view === 'pos' && <POSView currentUser={currentUser} inventory={inventory} setInventory={setInventory} courses={courses} customers={customers} sessions={posSessions} setSessions={setPosSessions} onAddFinanceRecord={() => {}} onAddCustomer={() => {}} organizationId={organization!.id} lang={lang} categories={posCategories} setCategories={setPosCategories} taxes={posTaxes} setTaxes={setPosTaxes} savedTickets={[]} setSavedTickets={() => {}} orders={posOrders} setOrders={setPosOrders} />}
                    {view === 'erp' && <ERPModuleView users={users} tasks={tasks} inventory={inventory} tickets={tickets} customers={customers} labComputers={labComputers} finance={finance} purchaseOrders={purchaseOrders} lang={lang} glitches={glitches} attendance={attendance} leaves={leaves} posOrders={posOrders} />}
                    {view === 'settings' && <SettingsView settings={organization!.settings} onUpdateSettings={(s) => setOrganization({...organization!, settings: s})} users={users} onUpdateUser={() => {}} onAddUser={() => {}} currentUser={currentUser} currentOrganization={organization} onUpdateOrganization={() => {}} lang={lang} permissions={permissions} onUpdatePermissions={setPermissions} apiKeys={[]} webhooks={[]} onAddApiKey={() => {}} onDeleteApiKey={() => {}} onAddWebhook={() => {}} onDeleteWebhook={() => {}} />}
                    {view === 'profile' && <ProfilePage currentUser={currentUser} users={users} tasks={tasks} courseProgress={[]} attendanceRecords={attendance} onUpdateUser={() => {}} lang={lang} />}
                    {features.social && view === 'chat' && <ChatView users={users} currentUser={currentUser} messages={[]} onSendMessage={() => {}} onMarkRead={() => {}} lang={lang} />}
                </main>
                <AIAssistant currentUser={currentUser} contextData={{users, tasks, inventory, finance}} onNavigate={setView} lang={lang} />
                <ToastContainer notifications={notifications} removeNotification={() => {}} clearAllNotifications={() => {}} filter="all" setFilter={() => {}} lang={lang} />
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
