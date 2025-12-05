
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    User, Task, Organization, Notification, Page, AppLanguage, 
    PermissionsState, InventoryItem, MaintenanceTicket, Customer, 
    WhatsAppMessage, ChatMessage, FeedPost, AttendanceRecord, LeaveRequest, 
    FinanceRecord, Glitch, Course, Quiz, CourseProgress, ApiKey, Webhook,
    LabComputer, NotificationCategory, Payslip, PurchaseOrder, CourseBooking, Campaign, POSSession,
    POSCategory, POSTax, POSOrder
} from './types';
import { 
    MOCK_COURSES, MOCK_QUIZZES, INITIAL_PERMISSIONS, MOCK_MESSAGES, 
    MOCK_FINANCE, MOCK_GLITCHES, MOCK_LEAVES, MOCK_PURCHASE_ORDERS, 
    MOCK_FEEDBACK, MOCK_CAMPAIGNS
} from './data';

// Components
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Common';
import { AIAssistant } from './components/AIAssistant';

// Pages
import { Dashboard } from './pages/Dashboard';
import { TasksKanban } from './pages/Tasks';
import { InventoryView, MaintenanceView } from './pages/Inventory';
import { TeamView } from './pages/Team';
import { ComputerLab3D } from './pages/Lab';
import { GamificationPage } from './pages/Gamification';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { CustomersDatabase } from './pages/Customers';
import { WhatsAppHub } from './pages/WhatsAppHub';
import { SettingsView } from './pages/Settings';
import { ProfilePage } from './pages/Profile';
import { ChatView } from './pages/Chat';
import { RelationalTables } from './pages/RelationalTables';
import { FinanceView } from './pages/Finance';
import { FeedView } from './pages/Feed';
import { AttendanceView } from './pages/Attendance';
import { LeaveView } from './pages/Leaves';
import { GlitchView } from './pages/Glitches';
import { ERPModuleView } from './pages/ERP';
import { SmartDashboard } from './pages/SmartDashboard';
import { LearningHub } from './pages/Learning';
import { MarketingView } from './pages/Marketing';
import { POSView } from './pages/POS';

// --- INITIAL MOCK DATA ---
const INITIAL_USERS: User[] = [
    {
        id: 'U1', organizationId: 'ORG-SMARTTECH', name: 'Ahmed Admin', username: 'ahmed', password: '123', role: 'Admin', type: 'staff',
        avatar: '👨‍💼', points: 12500, level: 5, badges: ['Leader'], performanceMetric: 98, smartCoins: 5000, karma: 100, email: 'ahmed@smart.tech', phone: '01000000001', joiningDate: '2023-01-01',
        salary: 15000, dailyRate: 500, department: 'Management'
    },
    {
        id: 'U2', organizationId: 'ORG-SMARTTECH', name: 'Sara Manager', username: 'sara', password: '123', role: 'Manager', type: 'staff',
        avatar: '👩‍💼', points: 8500, level: 4, badges: ['Organizer'], performanceMetric: 92, smartCoins: 3200, karma: 80, email: 'sara@smart.tech', phone: '01000000002', joiningDate: '2023-02-15',
        salary: 12000, dailyRate: 400, department: 'Operations'
    },
    {
        id: 'U3', organizationId: 'ORG-SMARTTECH', name: 'Kareem Tech', username: 'kareem', password: '123', role: 'Technician', type: 'staff',
        avatar: '👨‍🔧', points: 4200, level: 3, badges: ['Fixer'], performanceMetric: 88, smartCoins: 1500, karma: 50, email: 'kareem@smart.tech', phone: '01000000003', joiningDate: '2023-03-10',
        salary: 8000, dailyRate: 266, department: 'IT Support'
    },
    {
        id: 'U4', organizationId: 'ORG-SMARTTECH', name: 'Mona Reception', username: 'mona', password: '123', role: 'Reception', type: 'staff',
        avatar: '👩‍💻', points: 3100, level: 2, badges: ['Welcomer'], performanceMetric: 95, smartCoins: 1200, karma: 60, email: 'mona@smart.tech', phone: '01000000004', joiningDate: '2023-04-01',
        salary: 6000, dailyRate: 200, department: 'Front Desk'
    },
    {
        id: 'S1', organizationId: 'ORG-SMARTTECH', name: 'Ali Student', username: 'ali', password: '123', role: 'Student', type: 'student',
        avatar: '👨‍🎓', points: 500, level: 1, badges: [], performanceMetric: 0, smartCoins: 0, karma: 0, email: 'ali@student.com', phone: '01200000001', joiningDate: '2023-09-01'
    }
];

const INITIAL_TASKS: Task[] = [
    { id: 'T1', organizationId: 'ORG-SMARTTECH', title: 'تحديث سيرفر المعمل', description: 'تثبيت التحديثات الأمنية الأخيرة', assigneeId: 'U3', priority: 'High', status: 'In Progress', deadline: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), comments: [] },
    { id: 'T2', organizationId: 'ORG-SMARTTECH', title: 'جرد المخزون الشهري', description: 'مراجعة أعداد الماوسات والكيبوردات', assigneeId: 'U2', priority: 'Medium', status: 'To Do', deadline: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), comments: [] },
];

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'INV1', organizationId: 'ORG-SMARTTECH', name: 'Dell Monitor 24"', category: 'Hardware', quantity: 15, location: 'Store A', status: 'Available', lastUpdated: '2023-11-20', price: 3500, sellingPrice: 3500, costPrice: 2800, taxRate: 14 },
    { id: 'INV2', organizationId: 'ORG-SMARTTECH', name: 'HDMI Cable', category: 'Cables', quantity: 3, location: 'Lab 1', status: 'Low Stock', lastUpdated: '2023-11-18', price: 150, sellingPrice: 150, costPrice: 90, taxRate: 14 },
    { id: 'INV3', organizationId: 'ORG-SMARTTECH', name: 'Raspberry Pi 4', category: 'Hardware', quantity: 10, location: 'Lab 2', status: 'Available', lastUpdated: '2023-11-25', price: 2500, sellingPrice: 2500, costPrice: 1900, taxRate: 14 },
];

const INITIAL_POS_CATEGORIES: POSCategory[] = [
    { id: 'CAT1', organizationId: 'ORG-SMARTTECH', name: 'Hardware', color: 'bg-blue-500' },
    { id: 'CAT2', organizationId: 'ORG-SMARTTECH', name: 'Cables', color: 'bg-orange-500' },
    { id: 'CAT3', organizationId: 'ORG-SMARTTECH', name: 'Services', color: 'bg-purple-500' },
    { id: 'CAT4', organizationId: 'ORG-SMARTTECH', name: 'Training', color: 'bg-green-500' },
    { id: 'CAT5', organizationId: 'ORG-SMARTTECH', name: 'Drinks', color: 'bg-amber-800' }, // Cafe style
    { id: 'CAT6', organizationId: 'ORG-SMARTTECH', name: 'Snacks', color: 'bg-yellow-500' },
];

const INITIAL_POS_TAXES: POSTax[] = [
    { id: 'TAX1', organizationId: 'ORG-SMARTTECH', name: 'VAT', rate: 14, isDefault: true },
    { id: 'TAX2', organizationId: 'ORG-SMARTTECH', name: 'Service', rate: 12, isDefault: false },
    { id: 'TAX3', organizationId: 'ORG-SMARTTECH', name: 'No Tax', rate: 0, isDefault: false },
];

const INITIAL_TICKETS: MaintenanceTicket[] = [
    { id: 'TCK1', organizationId: 'ORG-SMARTTECH', deviceId: 'PC-R1-05', deviceName: 'PC-05 (Lab 1)', issue: 'Blue Screen Error', priority: 'Urgent', status: 'In Progress', assigneeId: 'U3', reportedBy: 'U4', createdAt: '2023-11-20T10:00:00' }
];

const INITIAL_CUSTOMERS: Customer[] = [
    { id: 'C1', organizationId: 'ORG-SMARTTECH', name: 'شركة النور', phone: '01234567890', email: 'contact@alnoor.com', status: 'VIP', joinedDate: '2023-01-10', history: [], notes: 'عميل مميز' },
    { id: 'C2', organizationId: 'ORG-SMARTTECH', name: 'محمد حسن', phone: '01011223344', status: 'Active', joinedDate: '2023-05-20', history: [], notes: 'طالب جامعي' }
];

const INITIAL_LAB_COMPUTERS: LabComputer[] = [
    { id: 'PC-R1-01', organizationId: 'ORG-SMARTTECH', roomId: 'R1', deskNumber: 'PC-01', status: 'Available', specs: 'i5 | 16GB' },
    { id: 'PC-R1-02', organizationId: 'ORG-SMARTTECH', roomId: 'R1', deskNumber: 'PC-02', status: 'In Use', currentUserId: 'S1', specs: 'i5 | 16GB' },
    { id: 'PC-R1-05', organizationId: 'ORG-SMARTTECH', roomId: 'R1', deskNumber: 'PC-05', status: 'Maintenance', specs: 'i7 | 32GB', issue: 'Blue Screen' },
    { id: 'PC-R2-01', organizationId: 'ORG-SMARTTECH', roomId: 'R2', deskNumber: 'NET-01', status: 'Available', specs: 'i3 | 8GB' },
];

const INITIAL_FEED: FeedPost[] = [
    { id: 'FP1', organizationId: 'ORG-SMARTTECH', authorId: 'U1', type: 'announcement', title: 'اجتماع هام', content: 'يرجى العلم بوجود اجتماع للفريق غداً الساعة 10 صباحاً.', timestamp: new Date().toISOString(), likes: [], comments: [] },
    { id: 'FP2', organizationId: 'ORG-SMARTTECH', authorId: 'SYSTEM', type: 'achievement', title: 'هدف جديد!', content: 'تهانينا! تم تحقيق هدف المبيعات لهذا الشهر.', timestamp: new Date(Date.now() - 86400000).toISOString(), likes: ['U2', 'U3'], comments: [] }
];

const VALID_VIEWS: Page[] = [
    'dashboard', 'smart_dashboard', 'tasks', 'leaderboard', 'rewards', 
    'courses', 'quizzes', 'attendance', 'team', 'inventory', 'maintenance', 
    'lab', 'customers', 'whatsapp', 'settings', 'profile', 'chat', 
    'relational', 'finance', 'feed', 'leaves', 'glitches', 'erp', 'marketing', 'pos'
];

// --- HELPER FOR PERSISTENCE ---
const loadState = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        // Handle null, undefined, "undefined", "null" strings
        if (!saved || saved === "undefined" || saved === "null") return fallback;
        
        try {
            return JSON.parse(saved);
        } catch (e) {
            // Gracefully handle existing raw strings in localStorage (migration fix)
            if (typeof fallback === 'string') {
                return saved as unknown as T;
            }
            console.warn(`Error parsing ${key} JSON, reverting to fallback.`);
            return fallback;
        }
    } catch (e) {
        console.warn(`Error loading ${key} from storage.`);
        return fallback;
    }
};

const App = () => {
    // --- APP DATA STATE ---
    const [view, setView] = useState<Page>(() => {
        const savedView = loadState<string>('st_view', 'dashboard');
        // Validate against whitelist to prevent invalid states
        if (VALID_VIEWS.includes(savedView as Page)) {
            return savedView as Page;
        }
        return 'dashboard';
    });
    
    // Safety Net: If loaded users array is empty (e.g. cleared accidentally), force restore INITIAL_USERS
    const [users, setUsers] = useState<User[]>(() => {
        const loaded = loadState<User[]>('st_users', INITIAL_USERS);
        return loaded && loaded.length > 0 ? loaded : INITIAL_USERS;
    });
    
    // --- AUTH & ORG STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const session = loadState<User | null>('st_session', null);
        return session;
    });

    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(() => {
        const savedOrg = loadState<Organization | null>('st_org', null);
        const defaultOrg: Organization = {
            id: 'ORG-SMARTTECH',
            name: 'SmartTech Pro',
            createdAt: '2023-01-01',
            settings: { 
                theme: 'royal', 
                font: 'Cairo', 
                language: 'ar', 
                currency: 'EGP',
                dateFormat: 'YYYY-MM-DD',
                biometricEnabled: false, 
                notificationsEnabled: true,
                soundEnabled: true,
                animationsEnabled: true,
                compactMode: false,
                maintenanceMode: false,
                allowSignup: true,
                autoBackup: 'daily',
                features: {
                    tasks: true, crm: true, inventory: true, lab: true, 
                    learning: true, gamification: true, finance: true, 
                    hr: true, social: true, glitches: true,
                    marketing: true, reports: false, pos: true
                }
            }
        };
        
        if (!savedOrg) return defaultOrg;
        
        // Merge missing settings (Migration logic)
        return {
            ...savedOrg,
            settings: {
                ...defaultOrg.settings,
                ...savedOrg.settings,
                features: { ...defaultOrg.settings.features, ...(savedOrg.settings.features || {}) }
            }
        };
    });

    const [authView, setAuthView] = useState<'login' | 'register'>('login');

    const [tasks, setTasks] = useState<Task[]>(() => loadState('st_tasks', INITIAL_TASKS));
    const [inventory, setInventory] = useState<InventoryItem[]>(() => loadState('st_inventory', INITIAL_INVENTORY));
    const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => loadState('st_tickets', INITIAL_TICKETS));
    const [customers, setCustomers] = useState<Customer[]>(() => loadState('st_customers', INITIAL_CUSTOMERS));
    const [labComputers, setLabComputers] = useState<LabComputer[]>(() => loadState('st_lab_computers', INITIAL_LAB_COMPUTERS));
    const [finance, setFinance] = useState<FinanceRecord[]>(() => loadState('st_finance', MOCK_FINANCE));
    const [feed, setFeed] = useState<FeedPost[]>(() => loadState('st_feed', INITIAL_FEED));
    const [glitches, setGlitches] = useState<Glitch[]>(() => loadState('st_glitches', MOCK_GLITCHES));
    const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadState('st_leaves', MOCK_LEAVES));
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadState('st_attendance', []));
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadState('st_chat', []));
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => loadState('st_apikeys', []));
    const [webhooks, setWebhooks] = useState<Webhook[]>(() => loadState('st_webhooks', []));
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadState('st_purchase_orders', MOCK_PURCHASE_ORDERS));
    const [permissions, setPermissions] = useState<PermissionsState>(() => loadState('st_permissions', INITIAL_PERMISSIONS));
    const [payslips, setPayslips] = useState<Payslip[]>(() => loadState('st_payslips', []));
    const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadState('st_campaigns', MOCK_CAMPAIGNS));
    
    // POS New States
    const [posSessions, setPosSessions] = useState<POSSession[]>(() => loadState('st_pos_sessions', []));
    const [posOrders, setPosOrders] = useState<POSOrder[]>(() => loadState('st_pos_orders', []));
    const [posCategories, setPosCategories] = useState<POSCategory[]>(() => loadState('st_pos_categories', INITIAL_POS_CATEGORIES));
    const [posTaxes, setPosTaxes] = useState<POSTax[]>(() => loadState('st_pos_taxes', INITIAL_POS_TAXES));
    const [savedTickets, setSavedTickets] = useState<POSOrder[]>(() => loadState('st_pos_saved_tickets', []));

    // Learning
    const [courses, setCourses] = useState<Course[]>(() => loadState('st_courses', MOCK_COURSES));
    const [quizzes, setQuizzes] = useState<Quiz[]>(() => loadState('st_quizzes', MOCK_QUIZZES));
    const [courseProgress, setCourseProgress] = useState<CourseProgress[]>(() => loadState('st_course_progress', []));
    const [bookings, setBookings] = useState<CourseBooking[]>(() => loadState('st_bookings', []));

    // Navigation State
    const [highlightedInventoryId, setHighlightedInventoryId] = useState<string | undefined>();

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notifFilter, setNotifFilter] = useState<NotificationCategory | 'all'>('all');

    // --- PERSISTENCE EFFECTS ---
    useEffect(() => {
        try { localStorage.setItem('st_view', JSON.stringify(view)); } catch (e) {}
    }, [view]);
    useEffect(() => { try { localStorage.setItem('st_org', JSON.stringify(currentOrganization)); } catch(e){} }, [currentOrganization]);
    useEffect(() => { try { localStorage.setItem('st_users', JSON.stringify(users)); } catch(e){} }, [users]);
    useEffect(() => { try { localStorage.setItem('st_tasks', JSON.stringify(tasks)); } catch(e){} }, [tasks]);
    useEffect(() => { try { localStorage.setItem('st_inventory', JSON.stringify(inventory)); } catch(e){} }, [inventory]);
    useEffect(() => { try { localStorage.setItem('st_tickets', JSON.stringify(tickets)); } catch(e){} }, [tickets]);
    useEffect(() => { try { localStorage.setItem('st_customers', JSON.stringify(customers)); } catch(e){} }, [customers]);
    useEffect(() => { try { localStorage.setItem('st_lab_computers', JSON.stringify(labComputers)); } catch(e){} }, [labComputers]);
    useEffect(() => { try { localStorage.setItem('st_finance', JSON.stringify(finance)); } catch(e){} }, [finance]);
    useEffect(() => { try { localStorage.setItem('st_feed', JSON.stringify(feed)); } catch(e){} }, [feed]);
    useEffect(() => { try { localStorage.setItem('st_glitches', JSON.stringify(glitches)); } catch(e){} }, [glitches]);
    useEffect(() => { try { localStorage.setItem('st_leaves', JSON.stringify(leaves)); } catch(e){} }, [leaves]);
    useEffect(() => { try { localStorage.setItem('st_attendance', JSON.stringify(attendance)); } catch(e){} }, [attendance]);
    useEffect(() => { try { localStorage.setItem('st_chat', JSON.stringify(chatMessages)); } catch(e){} }, [chatMessages]);
    useEffect(() => { try { localStorage.setItem('st_apikeys', JSON.stringify(apiKeys)); } catch(e){} }, [apiKeys]);
    useEffect(() => { try { localStorage.setItem('st_webhooks', JSON.stringify(webhooks)); } catch(e){} }, [webhooks]);
    useEffect(() => { try { localStorage.setItem('st_purchase_orders', JSON.stringify(purchaseOrders)); } catch(e){} }, [purchaseOrders]);
    useEffect(() => { try { localStorage.setItem('st_permissions', JSON.stringify(permissions)); } catch(e){} }, [permissions]);
    useEffect(() => { try { localStorage.setItem('st_payslips', JSON.stringify(payslips)); } catch(e){} }, [payslips]);
    useEffect(() => { try { localStorage.setItem('st_courses', JSON.stringify(courses)); } catch(e){} }, [courses]);
    useEffect(() => { try { localStorage.setItem('st_quizzes', JSON.stringify(quizzes)); } catch(e){} }, [quizzes]);
    useEffect(() => { try { localStorage.setItem('st_course_progress', JSON.stringify(courseProgress)); } catch(e){} }, [courseProgress]);
    useEffect(() => { try { localStorage.setItem('st_bookings', JSON.stringify(bookings)); } catch(e){} }, [bookings]);
    useEffect(() => { try { localStorage.setItem('st_campaigns', JSON.stringify(campaigns)); } catch(e){} }, [campaigns]);
    useEffect(() => { try { localStorage.setItem('st_pos_sessions', JSON.stringify(posSessions)); } catch(e){} }, [posSessions]);
    useEffect(() => { try { localStorage.setItem('st_pos_orders', JSON.stringify(posOrders)); } catch(e){} }, [posOrders]);
    useEffect(() => { try { localStorage.setItem('st_pos_categories', JSON.stringify(posCategories)); } catch(e){} }, [posCategories]);
    useEffect(() => { try { localStorage.setItem('st_pos_taxes', JSON.stringify(posTaxes)); } catch(e){} }, [posTaxes]);
    useEffect(() => { try { localStorage.setItem('st_pos_saved_tickets', JSON.stringify(savedTickets)); } catch(e){} }, [savedTickets]);

    // --- GLOBAL TIMER EFFECT ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTasks(prevTasks => {
                if (!prevTasks.some(t => t.isTimerRunning)) return prevTasks;
                return prevTasks.map(t => {
                    if (t.isTimerRunning) {
                        return { ...t, elapsedTime: (t.elapsedTime || 0) + 1 };
                    }
                    return t;
                });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- DOCUMENT DIRECTION EFFECT ---
    useEffect(() => {
        const lang = currentOrganization?.settings.language || 'ar';
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [currentOrganization?.settings.language]);

    // --- CRITICAL: SYNC SESSION WITH USER DATA ---
    useEffect(() => {
        if (currentUser) {
            const updatedUser = users.find(u => u.id === currentUser.id);
            if (!updatedUser) {
                // User has been deleted, log out
                handleLogout();
            } else if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
                // User exists but data (points/role) changed, sync session
                setCurrentUser(updatedUser);
                try { localStorage.setItem('st_session', JSON.stringify(updatedUser)); } catch(e){}
            }
        }
    }, [users, currentUser]);

    // --- THEME & FONT EFFECTS ---
    useEffect(() => {
        if (currentOrganization?.settings.theme === 'midnight') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        if (currentOrganization?.settings.font) {
            document.documentElement.style.setProperty('--app-font', currentOrganization.settings.font);
        }

        if (currentOrganization?.settings.animationsEnabled === false) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }

        if (currentOrganization?.settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }, [currentOrganization?.settings]);

    // --- ACTIONS ---

    const addNotification = (message: string, type: 'success' | 'info' | 'warning', category: NotificationCategory) => {
        // Respect Sound Settings (Basic implementation)
        if (currentOrganization?.settings.soundEnabled && type === 'success') {
            // Optional: Play a sound
        }

        const newNotif: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            message,
            type,
            category
        };
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => {
            setNotifications(prev => prev.map(n => n.id === newNotif.id ? { ...n, isExiting: true } : n));
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
            }, 300);
        }, 5000);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('st_session', JSON.stringify(user));
        addNotification(`مرحباً بعودتك، ${user.name} 👋`, 'success', 'system');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('st_session');
        setView('dashboard');
    };

    const handleRegister = (org: Organization, admin: User) => {
        setCurrentOrganization(org);
        setUsers([admin]);
        setCurrentUser(admin);
        localStorage.setItem('st_org', JSON.stringify(org));
        localStorage.setItem('st_users', JSON.stringify([admin]));
        localStorage.setItem('st_session', JSON.stringify(admin));
    };

    // Features Flags
    const features = currentOrganization?.settings.features || {
        tasks: true, crm: true, inventory: true, lab: true, learning: true, gamification: true, finance: true, hr: true, social: true, glitches: true, marketing: true, pos: true
    };

    // Redirect if current view is disabled (Safety Net)
    useEffect(() => {
        if (!features) return;
        
        const mapping: Record<string, boolean> = {
            'tasks': features.tasks,
            'customers': features.crm,
            'whatsapp': features.crm,
            'inventory': features.inventory,
            'maintenance': features.inventory,
            'lab': features.lab,
            'courses': features.learning,
            'leaderboard': features.gamification,
            'rewards': features.gamification,
            'finance': features.finance,
            'team': features.hr,
            'attendance': features.hr,
            'leaves': features.hr,
            'feed': features.social,
            'chat': features.social,
            'glitches': features.glitches,
            'marketing': features.marketing || false,
            'pos': features.pos || false
        };

        if (mapping[view] === false) {
            setView('dashboard');
            addNotification('تم إعادة التوجيه: هذه الميزة معطلة حالياً.', 'info', 'system');
        }
    }, [view, features]);

    if (!currentUser) {
        if (authView === 'register') {
            return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
        }
        return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} users={users} allowSignup={currentOrganization?.settings.allowSignup ?? true} />;
    }

    // Maintenance Mode Check
    if (currentOrganization?.settings.maintenanceMode && !['Admin', 'Manager'].includes(currentUser.role)) {
        return (
            <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                <div className="text-6xl mb-4 text-amber-500 animate-pulse"><i className="fa-solid fa-person-digging"></i></div>
                <h1 className="text-3xl font-bold mb-2">النظام تحت الصيانة</h1>
                <p className="text-slate-400 mb-8 text-center max-w-md">نقوم حالياً بإجراء تحديثات هامة للنظام. يرجى المحاولة لاحقاً. شكراً لتفهمكم.</p>
                <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold transition-colors">
                    تسجيل الخروج
                </button>
            </div>
        );
    }

    const commonProps = {
        currentUser,
        lang: currentOrganization?.settings.language || 'ar'
    };

    return (
        <div className={`flex h-screen overflow-hidden ${currentOrganization?.settings.language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
            <Sidebar 
                {...commonProps}
                currentOrganization={currentOrganization}
                view={view}
                setView={setView}
                notifications={notifications}
                handleLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onResetData={() => {
                    if(confirm('Warning: This will wipe all data and restore defaults. Continue?')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                theme={currentOrganization?.settings.theme || 'royal'}
                permissions={permissions}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 transition-all duration-300">
                <header className="md:hidden bg-white dark:bg-slate-800 p-4 shadow-sm flex items-center justify-between z-10 no-print">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-200">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <span className="font-bold text-lg dark:text-white">{currentOrganization?.name}</span>
                    <div className="w-8"></div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide printable-content">
                    {view === 'dashboard' && <Dashboard {...commonProps} tasks={tasks} users={users} onAddTask={() => setView('tasks')} />}
                    {view === 'smart_dashboard' && <SmartDashboard {...commonProps} users={users} tasks={tasks} inventory={inventory} tickets={tickets} customers={customers} finance={finance} glitches={glitches} />}
                    
                    {features.tasks && view === 'tasks' && <TasksKanban {...commonProps} tasks={tasks} users={users} setTasks={setTasks} addNotification={addNotification} inventory={inventory} tickets={tickets} customers={customers} glitches={glitches} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />}
                    
                    {features.inventory && view === 'inventory' && <InventoryView {...commonProps} inventory={inventory} setInventory={setInventory} permissions={permissions} highlightedId={highlightedInventoryId} onClearHighlight={() => setHighlightedInventoryId(undefined)} onAddItem={(item) => setInventory([...inventory, item])} />}
                    {features.inventory && view === 'maintenance' && <MaintenanceView {...commonProps} tickets={tickets} users={users} setTickets={setTickets} onNavigateToItem={(id) => { setHighlightedInventoryId(id); setView('inventory'); }} permissions={permissions} />}
                    
                    {features.lab && view === 'lab' && <ComputerLab3D {...commonProps} computers={labComputers} customers={customers} onUpdateComputer={(pc) => setLabComputers(labComputers.map(c => c.id === pc.id ? pc : c))} onAddComputer={(pc) => setLabComputers([...labComputers, pc])} onSyncComputers={(updates) => { const newComputers = [...labComputers]; updates.forEach(u => { const idx = newComputers.findIndex(c => c.id === u.id); if(idx > -1) newComputers[idx] = u; }); setLabComputers(newComputers); }} onDeleteComputer={(id) => setLabComputers(labComputers.filter(c => c.id !== id))} />}
                    
                    {features.hr && view === 'team' && <TeamView users={users} lang={commonProps.lang} />}
                    
                    {features.gamification && view === 'leaderboard' && (
                        <GamificationPage 
                            {...commonProps}
                            users={users}
                            onRedeem={(item, cost) => {
                                setUsers(users.map(u => u.id === currentUser.id ? { ...u, smartCoins: u.smartCoins - cost } : u));
                                addNotification(`تم شراء ${item} بنجاح! 🎉`, 'success', 'gamification');
                            }}
                            onSpin={(reward) => {
                                setUsers(users.map(u => {
                                    if(u.id !== currentUser.id) return u;
                                    let updatedUser = { ...u };
                                    if (reward.type === 'coin') updatedUser.smartCoins += (reward.value as number);
                                    if (reward.type === 'xp') updatedUser.points += (reward.value as number);
                                    const month = new Date().toISOString().slice(0, 7);
                                    const spins = u.wheelSpins?.month === month ? u.wheelSpins.count + 1 : 1;
                                    updatedUser.wheelSpins = { month, count: spins };
                                    return updatedUser;
                                }));
                                if (reward.value !== 0) addNotification(`مبروك! ربحت ${reward.label}`, 'success', 'gamification');
                            }}
                            onSendKarma={(toId) => {
                                setUsers(users.map(u => u.id === toId ? { ...u, karma: u.karma + 1 } : u));
                                addNotification('تم إرسال الكارما بنجاح', 'success', 'gamification');
                            }}
                        />
                    )}
                    
                    {features.learning && view === 'courses' && <LearningHub {...commonProps} courses={courses} quizzes={quizzes} courseProgress={courseProgress} setCourses={setCourses} bookings={bookings} onBookCourse={(b) => setBookings([...bookings, b])} onCourseComplete={(id) => { if (!courseProgress.some(cp => cp.userId === currentUser.id && cp.courseId === id)) { setCourseProgress([...courseProgress, { userId: currentUser.id, courseId: id, isCompleted: true, completedAt: new Date().toISOString() }]); const course = courses.find(c => c.id === id); if(course) { setUsers(users.map(u => u.id === currentUser.id ? { ...u, points: u.points + course.points } : u)); addNotification(`أتممت الدورة! +${course.points} XP`, 'success', 'gamification'); } } }} onQuizComplete={(score, max) => { setUsers(users.map(u => u.id === currentUser.id ? { ...u, points: u.points + score } : u)); addNotification(`أنهيت الاختبار: ${score}/${max}`, 'success', 'gamification'); }} />}
                    
                    {features.crm && view === 'customers' && <CustomersDatabase {...commonProps} customers={customers} setCustomers={setCustomers} financeRecords={finance} feedbackList={MOCK_FEEDBACK} />}
                    {features.crm && view === 'whatsapp' && <WhatsAppHub {...commonProps} customers={customers} setCustomers={setCustomers} />}
                    {features.marketing && view === 'marketing' && <MarketingView {...commonProps} campaigns={campaigns} setCampaigns={setCampaigns} customers={customers} onAddCampaign={(c) => setCampaigns([c, ...campaigns])} />}
                    
                    {view === 'settings' && <SettingsView {...commonProps} settings={currentOrganization!.settings} onUpdateSettings={(s) => { const updatedOrg = { ...currentOrganization!, settings: s }; setCurrentOrganization(updatedOrg); }} users={users} onUpdateUser={(u) => setUsers(users.map(user => user.id === u.id ? u : user))} onAddUser={(u) => setUsers([...users, u])} currentOrganization={currentOrganization} onUpdateOrganization={(o) => setCurrentOrganization(o)} permissions={permissions} onUpdatePermissions={setPermissions} apiKeys={apiKeys} onAddApiKey={(name) => setApiKeys([...apiKeys, { id: Date.now().toString(), name, key: 'sk-'+Math.random().toString(36).substr(2), createdAt: new Date().toISOString(), organizationId: currentOrganization!.id }])} onDeleteApiKey={(id) => setApiKeys(apiKeys.filter(k => k.id !== id))} webhooks={webhooks} onAddWebhook={(w) => setWebhooks([...webhooks, { ...w, id: Date.now().toString(), organizationId: currentOrganization!.id, isActive: true, failureCount: 0 } as Webhook])} onDeleteWebhook={(id) => setWebhooks(webhooks.filter(w => w.id !== id))} onSyncFromCloud={() => { addNotification('جاري المزامنة...', 'info', 'system'); setTimeout(() => addNotification('تمت المزامنة بنجاح!', 'success', 'system'), 1500); }} />}
                    
                    {view === 'profile' && <ProfilePage {...commonProps} users={users} tasks={tasks} courseProgress={courseProgress} attendanceRecords={attendance} onUpdateUser={(u) => setUsers(users.map(user => user.id === u.id ? u : user))} onCheckIn={(rec) => setAttendance([...attendance, rec])} onCheckOut={(id, time) => setAttendance(attendance.map(a => a.id === id ? { ...a, checkOut: time } : a))} setView={setView} payslips={payslips} />}
                    
                    {features.social && view === 'chat' && <ChatView {...commonProps} users={users} messages={chatMessages} onSendMessage={(to, text) => { const msg: ChatMessage = { id: Date.now().toString(), organizationId: currentOrganization!.id, senderId: currentUser.id, receiverId: to, message: text, timestamp: new Date().toISOString(), read: false }; setChatMessages([...chatMessages, msg]); }} onMarkRead={(senderId) => { setChatMessages(chatMessages.map(m => m.senderId === senderId && m.receiverId === currentUser.id ? { ...m, read: true } : m)); }} />}
                    
                    {features.finance && view === 'finance' && <FinanceView {...commonProps} records={finance} setRecords={setFinance} customers={customers} onAddRecord={(r) => setFinance([...finance, r])} />}
                    {view === 'relational' && <RelationalTables lang={commonProps.lang} users={users} tasks={tasks} inventory={inventory} tickets={tickets} customers={customers} labComputers={labComputers} />}
                    
                    {features.social && view === 'feed' && <FeedView {...commonProps} feed={feed} users={users} onLike={(id) => { setFeed(feed.map(p => { if(p.id !== id) return p; const likes = p.likes.includes(currentUser.id) ? p.likes.filter(uid => uid !== currentUser.id) : [...p.likes, currentUser.id]; return { ...p, likes }; })); }} onComment={(id, text) => { setFeed(feed.map(p => { if(p.id !== id) return p; return { ...p, comments: [...p.comments, { id: Date.now().toString(), userId: currentUser.id, text, timestamp: new Date().toISOString() }] }; })); }} onAddPost={(p) => setFeed([{ ...p, id: Date.now().toString(), timestamp: new Date().toISOString(), likes: [], comments: [] } as FeedPost, ...feed])} />}
                    
                    {features.hr && view === 'attendance' && <AttendanceView {...commonProps} settings={currentOrganization!.settings} records={attendance} setRecords={setAttendance} onCheckIn={(r) => setAttendance([...attendance, r])} onCheckOut={(id, time) => setAttendance(attendance.map(a => a.id === id ? { ...a, checkOut: time } : a))} users={users} payslips={payslips} onGeneratePayslip={(p) => setPayslips([...payslips, p])} />}
                    {features.hr && view === 'leaves' && <LeaveView {...commonProps} users={users} leaves={leaves} setLeaves={setLeaves} onRequestLeave={(req) => setLeaves([...leaves, { ...req, id: Date.now().toString(), status: 'Pending', createdAt: new Date().toISOString() } as LeaveRequest])} onUpdateStatus={(id, status, comment) => setLeaves(leaves.map(l => l.id === id ? { ...l, status, adminComment: comment } : l))} />}
                    
                    {features.glitches && view === 'glitches' && <GlitchView {...commonProps} glitches={glitches} setGlitches={setGlitches} users={users} customers={customers} onAddGlitch={(g) => setGlitches([g, ...glitches])} />}
                    {view === 'erp' && <ERPModuleView lang={commonProps.lang} users={users} tasks={tasks} inventory={inventory} tickets={tickets} customers={customers} labComputers={labComputers} finance={finance} purchaseOrders={purchaseOrders} />}
                    {features.pos && view === 'pos' && (
                        <POSView 
                            {...commonProps} 
                            inventory={inventory} 
                            setInventory={setInventory}
                            courses={courses} 
                            customers={customers} 
                            sessions={posSessions} 
                            setSessions={setPosSessions} 
                            onAddFinanceRecord={(r) => setFinance([...finance, r])} 
                            onAddCustomer={(c) => setCustomers([...customers, c])} 
                            organizationId={currentOrganization!.id}
                            categories={posCategories}
                            setCategories={setPosCategories}
                            taxes={posTaxes}
                            setTaxes={setPosTaxes}
                            savedTickets={savedTickets}
                            setSavedTickets={setSavedTickets}
                            orders={posOrders}
                            setOrders={setPosOrders}
                            currency={currentOrganization?.settings.currency}
                        />
                    )}
                </div>

                <AIAssistant {...commonProps} contextData={{ users, tasks, inventory, finance }} onNavigate={setView} />
            </main>

            <ToastContainer 
                notifications={notifications}
                removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                clearAllNotifications={() => setNotifications([])}
                filter={notifFilter}
                setFilter={setNotifFilter}
                lang={commonProps.lang}
            />
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
