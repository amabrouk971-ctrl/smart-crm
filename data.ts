
import { Badge, Course, InventoryItem, LabComputer, MaintenanceTicket, Quiz, Reward, Task, User, Customer, WhatsAppMessage, LabRoom, Reservation, AppTheme, ChatMessage, AppLanguage, PermissionsState, BattleTeam, WheelReward, FinanceRecord, CustomerFeedback, FeedPost, AttendanceRecord, LeaveRequest, Glitch, PurchaseOrder, Campaign } from './types';

// --- CONSTANTS & MOCK DATA ---

export const LAB_ROOMS: LabRoom[] = [
    { id: 'R1', name: 'Main Lab', capacity: 20 },
    { id: 'R2', name: 'Network Lab', capacity: 15 },
    { id: 'R3', name: 'Maintenance Workshop', capacity: 10 },
];

export const LEVELS = [
    { level: 1, min: 0, max: 1000, name: 'Novice' },
    { level: 2, min: 1000, max: 2500, name: 'Apprentice' },
    { level: 3, min: 2500, max: 5000, name: 'Specialist' },
    { level: 4, min: 5000, max: 10000, name: 'Expert' },
    { level: 5, min: 10000, max: 20000, name: 'Master' },
];

export const REWARDS: Reward[] = [
    { id: 'rew-1', title: 'Gift Card', cost: 500, icon: 'fa-gift', color: 'bg-pink-500', target: 'both', currency: 'SmartCoin' },
    { id: 'rew-2', title: 'Extra Day Off', cost: 1000, icon: 'fa-calendar-plus', color: 'bg-green-500', target: 'staff', currency: 'SmartCoin' },
    { id: 'rew-3', title: 'Free Course', cost: 1500, icon: 'fa-graduation-cap', color: 'bg-blue-500', target: 'student', currency: 'SmartCoin' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'CMP-001',
        organizationId: 'ORG-SMARTTECH',
        name: 'خصومات الشتاء',
        type: 'SMS',
        status: 'Completed',
        targetAudience: 'All',
        content: 'استمتع بخصم 20% على جميع الدورات حتى نهاية الشهر! كود: WINTER20',
        sentAt: '2023-11-01',
        stats: { sent: 150, opened: 120, clicked: 45 }
    },
    {
        id: 'CMP-002',
        organizationId: 'ORG-SMARTTECH',
        name: 'دورة الشبكات الجديدة',
        type: 'Email',
        status: 'Scheduled',
        targetAudience: 'VIP',
        content: 'ندعوكم للتسجيل المبكر في دورة CCNA المتقدمة.',
        scheduledFor: '2023-12-01',
        stats: { sent: 0, opened: 0, clicked: 0 }
    }
];

export const MOCK_MESSAGES: WhatsAppMessage[] = [
    { id: 'msg-1', organizationId: 'ORG-SMARTTECH', senderNumber: '01012345678', senderName: 'Mohamed Ali', message: 'Hello, what are your working hours?', timestamp: new Date().toISOString(), isProcessed: false },
    { id: 'msg-2', organizationId: 'ORG-SMARTTECH', senderNumber: '01122334455', senderName: 'Sarah Ahmed', message: 'I have an issue with my laptop.', timestamp: new Date(Date.now() - 3600000).toISOString(), isProcessed: true },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'CRS-001',
    organizationId: 'ORG-SMARTTECH',
    title: 'أساسيات السلامة المهنية',
    description: 'تعلم بروتوكولات الأمان الأساسية للتعامل مع الأجهزة الإلكترونية.',
    thumbnail: 'https://img.freepik.com/free-vector/safe-workplace-concept-illustration_114360-6395.jpg',
    videoUrl: 'https://www.youtube.com/embed/S7U8Q4fD9tY', 
    duration: '15:00',
    points: 50,
    targetAudience: 'both',
    linkedQuizId: 'QZ-001',
    price: 0,
    status: 'Active',
    category: 'Safety',
    recurrence: 'Monthly',
    startDate: '2023-11-20',
    maxCapacity: 20,
    instructor: 'أحمد مبروك'
  },
  {
    id: 'CRS-002',
    organizationId: 'ORG-SMARTTECH',
    title: 'دورة React.js السريعة',
    description: 'مقدمة سريعة لمكونات React وإدارة الحالة.',
    thumbnail: 'https://bs-uploads.toptal.io/blackfish-uploads/components/blog_post_page/content/cover_image_file/cover_image/1279225/retina_1708x683_cover-react-context-api-4929b3703a1a7082d99b53eb1bbfc31f.png',
    videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
    duration: '45:00',
    points: 100,
    targetAudience: 'student',
    linkedQuizId: 'QZ-002',
    price: 500,
    status: 'Active',
    category: 'Development',
    recurrence: 'Weekly',
    startDate: '2023-11-25',
    maxCapacity: 15,
    instructor: 'خديجة'
  }
];

export const INITIAL_PERMISSIONS: PermissionsState = {
  inventory: {
    view: ['Admin', 'Manager', 'Technician'],
    manage: ['Admin', 'Manager'],
  },
  maintenance: {
    view: ['Admin', 'Manager', 'Technician'],
    manage: ['Admin', 'Manager'],
    updateStatus: ['Admin', 'Manager', 'Technician'],
  },
  whatsapp: {
      view: ['Admin', 'Manager'],
      manage: ['Admin', 'Manager']
  },
  settings: {
      view: ['Admin', 'Manager', 'Technician', 'Reception', 'Student'], // Open to everyone
      manageUsers: ['Admin']
  },
  finance: {
      view: ['Admin', 'Manager'],
      manage: ['Admin']
  },
  leaves: {
      view: ['Admin', 'Manager', 'Technician', 'Reception'],
      manage: ['Admin', 'Manager']
  },
  glitches: {
      view: ['Admin', 'Manager', 'Technician', 'Reception'],
      manage: ['Admin', 'Manager']
  },
  erp: {
      view: ['Admin', 'Manager'],
      manage: ['Admin']
  },
  marketing: {
      view: ['Admin', 'Manager'],
      manage: ['Admin', 'Manager']
  }
};

export const PERMISSIONS = INITIAL_PERMISSIONS;

export const THEMES: Record<AppTheme, { name: string, gradient: string, primary: string, secondary: string }> = {
    royal: { name: 'Royal', gradient: 'linear-gradient(135deg, #002060 0%, #1e3a8a 100%)', primary: 'bg-blue-800', secondary: 'bg-blue-600' },
    midnight: { name: 'Midnight', gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', primary: 'bg-slate-800', secondary: 'bg-slate-600' },
    nature: { name: 'Nature', gradient: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', primary: 'bg-green-800', secondary: 'bg-green-600' },
    sunset: { name: 'Sunset', gradient: 'linear-gradient(135deg, #9f1239 0%, #be123c 100%)', primary: 'bg-rose-800', secondary: 'bg-rose-600' },
    ocean: { name: 'Ocean', gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)', primary: 'bg-cyan-700', secondary: 'bg-cyan-600' },
};

export const TEAMS: BattleTeam[] = [
    { id: 'T_ADMIN', organizationId: 'ORG-SMARTTECH', name: 'Admin Force', icon: 'fa-shield-halved', color: 'from-slate-700 to-slate-900', description: 'النظام والقانون', score: 4500, members: ['U1', 'U2'] },
    { id: 'T_IT', organizationId: 'ORG-SMARTTECH', name: 'Tech Titans', icon: 'fa-microchip', color: 'from-blue-600 to-indigo-800', description: 'سادة التكنولوجيا', score: 3800, members: ['U3', 'U4', 'U5'] },
    { id: 'T_FB', organizationId: 'ORG-SMARTTECH', name: 'Café Heroes', icon: 'fa-mug-hot', color: 'from-amber-500 to-orange-700', description: 'الطاقة والحيوية', score: 2100, members: [] },
    { id: 'T_SALES', organizationId: 'ORG-SMARTTECH', name: 'Sales Sharks', icon: 'fa-briefcase', color: 'from-green-600 to-emerald-800', description: 'صناع الأرقام', score: 3200, members: [] }
];

export const WHEEL_REWARDS_DATA: WheelReward[] = [
    { id: 'W1', label: 'مشروب مجاني', value: 'Free Drink', type: 'perk', color: '#f59e0b', icon: 'fa-coffee', probability: 25 },
    { id: 'W2', label: '200 SmartCoin', value: 200, type: 'coin', color: '#3b82f6', icon: 'fa-coins', probability: 20 },
    { id: 'W3', label: 'ساعة انصراف مبكر', value: 'Early Leave', type: 'perk', color: '#8b5cf6', icon: 'fa-person-walking-arrow-right', probability: 10 },
    { id: 'W4', label: 'تيشيرت TechSmart', value: 'T-Shirt', type: 'gift', color: '#ef4444', icon: 'fa-shirt', probability: 5 },
    { id: 'W5', label: '500 XP', value: 500, type: 'xp', color: '#10b981', icon: 'fa-star', probability: 20 },
    { id: 'W6', label: 'يوم إجازة', value: 'Day Off', type: 'perk', color: '#ec4899', icon: 'fa-umbrella-beach', probability: 1 }, 
    { id: 'W7', label: 'حظ أوفر المرة القادمة', value: 0, type: 'coin', color: '#64748b', icon: 'fa-face-frown-open', probability: 19 },
];

export const MOCK_FINANCE: FinanceRecord[] = [
    { id: 'F1', organizationId: 'ORG-SMARTTECH', date: '2023-11-15', amount: 500, type: 'Income', category: 'Services', description: 'صيانة لابتوب', customerId: 'C1', customerName: 'شركة النور للتجارة', receiptNumber: 'REC-1001', paymentMethod: 'Cash', recordedBy: 'U3' },
    { id: 'F2', organizationId: 'ORG-SMARTTECH', date: '2023-11-16', amount: 1500, type: 'Income', category: 'Training', description: 'رسوم دورة شبكات', customerId: 'C2', customerName: 'أكاديمية المستقبل', receiptNumber: 'REC-1002', paymentMethod: 'Bank Transfer', recordedBy: 'U1' },
    { id: 'F3', organizationId: 'ORG-SMARTTECH', date: '2023-11-16', amount: 200, type: 'Expense', category: 'Office Supplies', description: 'شراء أحبار طباعة', receiptNumber: 'EXP-501', paymentMethod: 'Cash', recordedBy: 'U2' },
];

export const MOCK_FEEDBACK: CustomerFeedback[] = [
    { id: 'FB1', organizationId: 'ORG-SMARTTECH', customerId: 'C1', date: '2023-11-10', type: 'Suggestion', details: 'يفضل زيادة عدد أجهزة المعمل 1', status: 'In Progress', recordedBy: 'U2' },
    { id: 'FB2', organizationId: 'ORG-SMARTTECH', customerId: 'C2', date: '2023-11-12', type: 'Favorite', details: 'يفضلون التعامل مع المهندس مازن', status: 'Resolved', recordedBy: 'U1' },
    { id: 'FB3', organizationId: 'ORG-SMARTTECH', customerId: 'C3', date: '2023-10-05', type: 'Complaint', details: 'تأخر في تسليم الصيانة', status: 'Resolved', recordedBy: 'U2' },
];

export const MOCK_GLITCHES: Glitch[] = [
    { 
        id: 'GL-001', organizationId: 'ORG-SMARTTECH', guestName: 'السيد أحمد كمال', guestPhone: '01223344556', 
        guestComplaint: 'التكييف في قاعة 2 ضعيف جداً', employeeResponse: 'تم تشغيل مروحة إضافية وإبلاغ الصيانة', 
        category: 'Facility', severity: 'Medium', needsFollowUp: true, status: 'Open', reportedBy: 'U3', reportedAt: '2023-11-16T10:30:00' 
    },
    { 
        id: 'GL-002', organizationId: 'ORG-SMARTTECH', guestName: 'الطالبة ريم', 
        guestComplaint: 'المدرب تأخر 15 دقيقة', employeeResponse: 'تم الاعتذار وتقديم مشروب مجاني', 
        category: 'Staff', severity: 'Low', needsFollowUp: false, status: 'Resolved', reportedBy: 'U2', reportedAt: '2023-11-15T09:15:00', resolvedAt: '2023-11-15T09:20:00'
    }
];

export const MOCK_LEAVES: LeaveRequest[] = [
    { id: 'lr-1', organizationId: 'ORG-SMARTTECH', userId: 'U3', type: 'Sick Leave', startDate: '2023-11-20', endDate: '2023-11-21', reason: 'ظروف صحية طارئة', status: 'Approved', createdAt: '2023-11-18T10:00:00', adminComment: 'ألف سلامة عليك' },
    { id: 'lr-2', organizationId: 'ORG-SMARTTECH', userId: 'U4', type: 'Vacation', startDate: '2023-12-01', endDate: '2023-12-05', reason: 'سفر عائلي', status: 'Pending', createdAt: '2023-11-15T09:30:00' },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    { id: 'PO-001', organizationId: 'ORG-SMARTTECH', supplier: 'TechStore Egypt', items: '20x Mouse, 20x Keyboard', totalCost: 5000, status: 'Received', date: '2023-11-01' },
    { id: 'PO-002', organizationId: 'ORG-SMARTTECH', supplier: 'Delta Computer', items: '5x 24" Monitors', totalCost: 15000, status: 'Pending', date: '2023-11-15' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'INV1', organizationId: 'ORG-SMARTTECH', name: 'Dell Monitor 24"', category: 'Hardware', quantity: 15, location: 'Store A', status: 'Available', lastUpdated: '2023-11-20', price: 3500, sellingPrice: 3500, costPrice: 2800, taxRate: 14 },
    { id: 'INV2', organizationId: 'ORG-SMARTTECH', name: 'HDMI Cable', category: 'Cables', quantity: 3, location: 'Lab 1', status: 'Low Stock', lastUpdated: '2023-11-18', price: 150, sellingPrice: 150, costPrice: 90, taxRate: 14 },
    { id: 'INV3', organizationId: 'ORG-SMARTTECH', name: 'Raspberry Pi 4', category: 'Hardware', quantity: 10, location: 'Lab 2', status: 'Available', lastUpdated: '2023-11-25', price: 2500, sellingPrice: 2500, costPrice: 1900, taxRate: 14 },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'QZ-001',
    organizationId: 'ORG-SMARTTECH',
    title: 'بروتوكول السلامة في العمل',
    description: 'إرشادات السلامة الأساسية لبيئة ورشة العمل.',
    targetAudience: 'staff',
    createdBy: 'U1',
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        text: 'ما هي الخطوة الأولى قبل فحص جهاز عالي الجهد؟',
        type: 'multiple_choice',
        points: 20,
        timeLimit: 15,
        options: [
          { id: 'o1', text: 'ارتداء القفازات', isCorrect: false },
          { id: 'o2', text: 'فصل مصدر الطاقة', isCorrect: true },
          { id: 'o3', text: 'قراءة الدليل', isCorrect: false },
          { id: 'o4', text: 'الاتصال بالمشرف', isCorrect: false },
        ]
      },
      {
        id: 'q2',
        text: 'يجب فحص طفايات الحريق سنوياً.',
        type: 'true_false',
        points: 10,
        timeLimit: 10,
        options: [
          { id: 'o1', text: 'صح', isCorrect: true },
          { id: 'o2', text: 'خطأ', isCorrect: false },
        ]
      },
      {
        id: 'q3',
        text: 'رتب خطوات تجميع جهاز كمبيوتر',
        type: 'arrange',
        points: 40,
        timeLimit: 30,
        options: [
          { id: 'o1', text: 'تركيب المعالج في اللوحة الأم' },
          { id: 'o2', text: 'تثبيت اللوحة الأم في الكيس' },
          { id: 'o3', text: 'توصيل مزود الطاقة' },
          { id: 'o4', text: 'تثبيت كارت الشاشة وإغلاق الكيس' },
        ]
      },
      {
        id: 'q4',
        text: 'تعرف على رمز الخطر هذا.',
        type: 'multiple_choice',
        media: { type: 'image', url: 'https://cdn-icons-png.flaticon.com/512/564/564619.png' },
        points: 30,
        timeLimit: 20,
        options: [
          { id: 'o1', text: 'خطر بيولوجي', isCorrect: false },
          { id: 'o2', text: 'جهد عالي', isCorrect: true },
          { id: 'o3', text: 'قابل للاشتعال', isCorrect: false },
          { id: 'o4', text: 'مادة أكالة', isCorrect: false },
        ]
      }
    ]
  },
  {
    id: 'QZ-002',
    organizationId: 'ORG-SMARTTECH',
    title: 'أساسيات React.js',
    description: 'اختبر معلوماتك في المكونات، والخصائص، والحالة.',
    targetAudience: 'student',
    createdBy: 'U1',
    totalPoints: 150,
    questions: [
      {
        id: 'q1',
        text: 'أي hook يستخدم لإدارة الحالة في المكونات الدالية؟',
        type: 'multiple_choice',
        points: 30,
        timeLimit: 20,
        options: [
          { id: 'o1', text: 'useEffect', isCorrect: false },
          { id: 'o2', text: 'useState', isCorrect: true },
          { id: 'o3', text: 'useContext', isCorrect: false },
          { id: 'o4', text: 'useReducer', isCorrect: false },
        ]
      },
      {
        id: 'q2',
        text: 'الـ Virtual DOM أبطأ من الـ Real DOM.',
        type: 'true_false',
        points: 20,
        timeLimit: 10,
        options: [
          { id: 'o1', text: 'صح', isCorrect: false },
          { id: 'o2', text: 'خطأ', isCorrect: true },
        ]
      }
    ]
  }
];

export const TRANSLATIONS = {
    // ... (Keep TRANSLATIONS unchanged)
    ar: {
        sidebar: {
            mainOps: 'العمليات الرئيسية',
            dashboard: 'لوحة التحكم',
            glitches: 'إدارة الشكاوى',
            feed: 'أخبار الفريق',
            attendance: 'الحضور والانصراف',
            leaves: 'الإجازات',
            chat: 'المحادثات',
            tasks: 'المهام',
            customers: 'العملاء',
            whatsapp: 'واتساب',
            marketing: 'التسويق',
            team: 'فريق العمل',
            assetsSupport: 'الأصول والدعم',
            inventory: 'المخزون',
            maintenance: 'الصيانة',
            lab: 'إدارة المعمل',
            development: 'التطوير',
            courses: 'الدورات',
            leaderboard: 'المتصدرين',
            rewards: 'الجوائز',
            myAccount: 'حسابي',
            profile: 'الملف الشخصي',
            advanced: 'متقدم',
            finance: 'المالية',
            relational: 'قاعدة البيانات',
            settings: 'الإعدادات'
        },
        common: {
            reset: 'إعادة ضبط',
            logout: 'تسجيل خروج',
            import: 'استيراد',
            export: 'تصدير',
            cancel: 'إلغاء',
            add: 'إضافة',
            save: 'حفظ'
        },
        dashboard: {
            activeTasks: 'المهام النشطة',
            completedToday: 'أنجزت اليوم',
            lateTasks: 'مهام متأخرة',
            starOfWeek: 'نجم الأسبوع',
            points: 'نقطة',
            urgentTasks: 'مهام عاجلة',
            addTask: 'مهمة جديدة',
            noUrgentTasks: 'لا توجد مهام عاجلة، ممتاز!',
            topPerformers: 'أفضل الأداء',
            completedLog: 'سجل المكتمل',
            archive: 'أرشيف',
            taskHeader: 'المهمة',
            employeeHeader: 'الموظف',
            dateHeader: 'التاريخ',
            timeHeader: 'الوقت المستغرق'
        },
        tasks: {
            title: 'إدارة المهام',
            newTask: 'مهمة جديدة',
            completed: 'مكتملة',
            workTime: 'وقت العمل',
            penalty: 'متأخر',
            remaining: 'متبقي',
            comment: 'تعليق',
            commentsTitle: 'التعليقات',
            noComments: 'لا توجد تعليقات',
            writeComment: 'اكتب تعليقاً...',
            createModalTitle: 'إنشاء مهمة جديدة',
            taskTitle: 'عنوان المهمة',
            details: 'التفاصيل',
            priority: 'الأولوية',
            deadline: 'الموعد النهائي',
            assignee: 'المسؤول',
            selectEmployee: 'اختر موظف',
            suggestAI: 'اقتراح AI',
            dragDrop: 'اسحب وأفلت هنا',
            dragDropDesc: 'عند الانتهاء من المهمة'
        },
        auth: {
            loginTitle: 'تسجيل الدخول',
            systemName: 'SmartTech CRM System',
            username: 'اسم المستخدم',
            password: 'كلمة المرور',
            loginBtn: 'دخول',
            errorMsg: 'بيانات الدخول غير صحيحة',
            demoData: 'بيانات تجريبية'
        },
        settings: {
            title: 'إعدادات النظام',
            tabGeneral: 'عام',
            theme: 'المظهر',
            language: 'اللغة',
            tabSecurity: 'الأمان',
            faceId: 'الدخول بالوجه',
            faceIdDesc: 'تفعيل تسجيل الدخول ببصمة الوجه للأجهزة المدعومة',
            scanning: 'جاري المسح...',
            tabUsers: 'المستخدمين',
            userPerms: 'صلاحيات المستخدمين',
            adminArea: 'منطقة إدارية',
            employee: 'الموظف',
            username: 'اسم المستخدم',
            currentRole: 'الدور الحالي',
            changeRole: 'تغيير الدور',
            managePoints: 'تعديل النقاط',
            updatePass: 'تغيير كلمة المرور',
            tabApi: 'API & الربط',
            tabLocation: 'الموقع الجغرافي',
            tabPermissions: 'الأذونات',
            tabOrganization: 'بيانات المؤسسة'
        },
        leaves: {
            title: 'إدارة الإجازات',
            newRequest: 'طلب إجازة جديد',
            myHistory: 'سجلي',
            management: 'إدارة الطلبات',
            type: 'نوع الإجازة',
            vacation: 'إجازة سنوية',
            sick: 'إجازة مرضية',
            dayOff: 'يوم عطلة',
            force: 'ظرف طارئ',
            startDate: 'تاريخ البداية',
            endDate: 'تاريخ النهاية',
            reason: 'السبب',
            attachment: 'مرفقات',
            adminComment: 'رد الإدارة',
            approve: 'قبول',
            reject: 'رفض',
            approved: 'مقبول',
            rejected: 'مرفوض',
            pending: 'قيد الانتظار'
        },
        marketing: {
            title: 'التسويق والحملات',
            subtitle: 'إدارة الحملات الإعلانية والتواصل مع العملاء',
            newCampaign: 'حملة جديدة',
            stats: {
                total: 'إجمالي الحملات',
                sent: 'رسائل مرسلة',
                openRate: 'معدل التفاعل (Open Rate)'
            },
            table: {
                title: 'سجل الحملات',
                name: 'اسم الحملة',
                type: 'النوع',
                status: 'الحالة',
                audience: 'الجمهور',
                stats: 'الإحصائيات',
                actions: 'إجراءات',
                sendNow: 'إرسال الآن',
                report: 'تقرير',
                empty: 'لا توجد حملات بعد'
            },
            form: {
                title: 'إنشاء حملة جديدة',
                name: 'اسم الحملة',
                placeholderName: 'مثال: عروض الصيف',
                channel: 'القناة',
                audience: 'الجمهور المستهدف',
                content: 'محتوى الرسالة',
                placeholderContent: 'اكتب نص الرسالة هنا...',
                cancel: 'إلغاء',
                save: 'حفظ كمسودة'
            },
            audienceOptions: {
                all: 'الكل',
                vip: 'عملاء VIP',
                new: 'العملاء الجدد',
                inactive: 'غير نشطين'
            },
            messages: {
                sentSuccess: 'تم إرسال الحملة بنجاح!'
            }
        }
    },
    en: {
        sidebar: {
            mainOps: 'Main Operations',
            dashboard: 'Dashboard',
            glitches: 'Glitches',
            feed: 'Team Feed',
            attendance: 'Attendance',
            leaves: 'Leaves',
            chat: 'Chat',
            tasks: 'Tasks',
            customers: 'Customers',
            whatsapp: 'WhatsApp',
            marketing: 'Marketing',
            team: 'Team',
            assetsSupport: 'Assets & Support',
            inventory: 'Inventory',
            maintenance: 'Maintenance',
            lab: 'Lab Management',
            development: 'Development',
            courses: 'Courses',
            leaderboard: 'Leaderboard',
            rewards: 'Rewards',
            myAccount: 'My Account',
            profile: 'Profile',
            advanced: 'Advanced',
            finance: 'Finance',
            relational: 'Database',
            settings: 'Settings'
        },
        common: {
            reset: 'Reset',
            logout: 'Logout',
            import: 'Import',
            export: 'Export',
            cancel: 'Cancel',
            add: 'Add',
            save: 'Save'
        },
        dashboard: {
            activeTasks: 'Active Tasks',
            completedToday: 'Completed Today',
            lateTasks: 'Late Tasks',
            starOfWeek: 'Star of Week',
            points: 'Pts',
            urgentTasks: 'Urgent Tasks',
            addTask: 'New Task',
            noUrgentTasks: 'No urgent tasks, great!',
            topPerformers: 'Top Performers',
            completedLog: 'Completion Log',
            archive: 'Archive',
            taskHeader: 'Task',
            employeeHeader: 'Employee',
            dateHeader: 'Date',
            timeHeader: 'Time Spent'
        },
        tasks: {
            title: 'Task Management',
            newTask: 'New Task',
            completed: 'Completed',
            workTime: 'Work Time',
            penalty: 'Late Penalty',
            remaining: 'Remaining',
            comment: 'Comment',
            commentsTitle: 'Comments',
            noComments: 'No comments yet',
            writeComment: 'Write a comment...',
            createModalTitle: 'Create New Task',
            taskTitle: 'Task Title',
            details: 'Details',
            priority: 'Priority',
            deadline: 'Deadline',
            assignee: 'Assignee',
            selectEmployee: 'Select Employee',
            suggestAI: 'AI Suggest',
            dragDrop: 'Drag here to complete',
            dragDropDesc: 'Drop task here when done'
        },
        auth: {
            loginTitle: 'Login',
            systemName: 'SmartTech CRM System',
            username: 'Username',
            password: 'Password',
            loginBtn: 'Login',
            errorMsg: 'Invalid credentials',
            demoData: 'Demo Data'
        },
        settings: {
            title: 'System Settings',
            tabGeneral: 'General',
            theme: 'Theme',
            language: 'Language',
            tabSecurity: 'Security',
            faceId: 'Face ID',
            faceIdDesc: 'Enable biometric login',
            scanning: 'Scanning...',
            tabUsers: 'Users',
            userPerms: 'User Permissions',
            adminArea: 'Admin Area',
            employee: 'Employee',
            username: 'Username',
            currentRole: 'Current Role',
            changeRole: 'Change Role',
            managePoints: 'Manage Points',
            updatePass: 'Update Password',
            tabApi: 'API & Integrations',
            tabLocation: 'Location',
            tabPermissions: 'Permissions',
            tabOrganization: 'Organization'
        },
        leaves: {
            title: 'Leave Management',
            newRequest: 'New Request',
            myHistory: 'My History',
            management: 'Manage Requests',
            type: 'Type',
            vacation: 'Vacation',
            sick: 'Sick Leave',
            dayOff: 'Day Off',
            force: 'Force Leave',
            startDate: 'Start Date',
            endDate: 'End Date',
            reason: 'Reason',
            attachment: 'Attachment',
            adminComment: 'Admin Comment',
            approve: 'Approve',
            reject: 'Reject',
            approved: 'Approved',
            rejected: 'Rejected',
            pending: 'Pending'
        },
        marketing: {
            title: 'Marketing & Campaigns',
            subtitle: 'Manage ad campaigns and customer communication',
            newCampaign: 'New Campaign',
            stats: {
                total: 'Total Campaigns',
                sent: 'Messages Sent',
                openRate: 'Open Rate'
            },
            table: {
                title: 'Campaigns Log',
                name: 'Campaign Name',
                type: 'Type',
                status: 'Status',
                audience: 'Audience',
                stats: 'Stats',
                actions: 'Actions',
                sendNow: 'Send Now',
                report: 'Report',
                empty: 'No campaigns yet'
            },
            form: {
                title: 'Create New Campaign',
                name: 'Campaign Name',
                placeholderName: 'e.g. Summer Sale',
                channel: 'Channel',
                audience: 'Target Audience',
                content: 'Message Content',
                placeholderContent: 'Type your message here...',
                cancel: 'Cancel',
                save: 'Save Draft'
            },
            audienceOptions: {
                all: 'All',
                vip: 'VIP',
                new: 'New Customers',
                inactive: 'Inactive'
            },
            messages: {
                sentSuccess: 'Campaign sent successfully!'
            }
        }
    }
};

export const translateStatus = (status: string, lang: AppLanguage = 'ar') => {
  if (lang === 'en') return status;
  const map: Record<string, string> = {
    'To Do': 'جديد',
    'In Progress': 'جاري العمل',
    'Review': 'مراجعة',
    'Done': 'مكتمل',
    'Available': 'متاح',
    'Low Stock': 'كمية قليلة',
    'Out of Stock': 'نفذت الكمية',
    'In Use': 'مشغول',
    'Maintenance': 'صيانة',
    'Offline': 'غير متصل',
    'Active': 'نشط',
    'Inactive': 'غير نشط',
    'VIP': 'مميز',
    'Archived': 'مؤرشف',
    'Open': 'مفتوح',
    'Resolved': 'تم الحل',
    'Pending': 'قيد الانتظار',
    'Draft': 'مسودة',
    'Scheduled': 'مجدول',
    'Sent': 'تم الإرسال',
    'Completed': 'مكتمل'
  };
  return map[status] || status;
};

export const translatePriority = (priority: string, lang: AppLanguage = 'ar') => {
  if (lang === 'en') return priority;
  const map: Record<string, string> = {
    'Urgent': 'عاجل',
    'High': 'مهم',
    'Medium': 'متوسط',
    'Low': 'منخفض',
    'Critical': 'حرج'
  };
  return map[priority] || priority;
};

export const translateRole = (role: string, lang: AppLanguage = 'ar') => {
   if (lang === 'en') return role;
   const map: Record<string, string> = {
     'Admin': 'مدير النظام',
     'Manager': 'مدير',
     'Technician': 'فني',
     'Reception': 'استقبال',
     'Student': 'طالب'
   };
   return map[role] || role;
};

export const translateCategory = (cat: string, lang: AppLanguage = 'ar') => {
  if (lang === 'en') return cat.charAt(0).toUpperCase() + cat.slice(1);
  const map: Record<string, string> = {
    'task': 'مهام',
    'system': 'النظام',
    'gamification': 'الألعاب',
    'chat': 'محادثات',
    'glitch': 'شكاوى',
    'marketing': 'تسويق'
  };
  return map[cat] || cat;
};
