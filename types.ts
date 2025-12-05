
export type Role = 'Admin' | 'Manager' | 'Technician' | 'Reception' | 'Student';
export type UserType = 'staff' | 'student';
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type ViewMode = 'crm' | 'student_app' | 'wall_display';
export type Page = 'dashboard' | 'smart_dashboard' | 'tasks' | 'leaderboard' | 'rewards' | 'courses' | 'quizzes' | 'attendance' | 'team' | 'inventory' | 'maintenance' | 'lab' | 'customers' | 'whatsapp' | 'settings' | 'profile' | 'chat' | 'relational' | 'finance' | 'feed' | 'leaves' | 'glitches' | 'erp' | 'marketing' | 'pos';
export type NotificationCategory = 'task' | 'system' | 'gamification' | 'chat' | 'glitch' | 'marketing' | 'pos';

export type AppTheme = 'royal' | 'midnight' | 'nature' | 'sunset' | 'ocean';
export type AppFont = 'Cairo' | 'Tajawal' | 'Almarai' | 'IBM Plex Sans Arabic' | 'Amiri' | 'Inter';
export type AppLanguage = 'ar' | 'en';

export type FinanceType = 'Income' | 'Expense' | 'Refund';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';
export type FeedbackType = 'Complaint' | 'Suggestion' | 'Favorite';
export type FeedbackStatus = 'New' | 'In Progress' | 'Resolved';

// API & Webhooks
export type WebhookEvent = 'task.created' | 'task.completed' | 'customer.added' | 'ticket.created';

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
    organizationId: string;
}

export interface Webhook {
    id: string;
    name: string;
    url: string;
    event: WebhookEvent;
    isActive: boolean;
    lastTriggered?: string;
    failureCount: number;
    organizationId: string;
}

export interface AppFeatures {
    tasks: boolean;
    crm: boolean;
    inventory: boolean;
    lab: boolean;
    learning: boolean;
    gamification: boolean;
    finance: boolean;
    hr: boolean;
    social: boolean;
    glitches: boolean;
    marketing?: boolean;
    pos?: boolean;
    reports?: boolean;
}

export interface AppSettings {
    theme: AppTheme;
    font: AppFont;
    language: AppLanguage;
    currency: 'EGP' | 'USD' | 'SAR' | 'EUR';
    dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY';
    biometricEnabled: boolean;
    notificationsEnabled: boolean;
    soundEnabled?: boolean;
    animationsEnabled?: boolean;
    compactMode?: boolean;
    maintenanceMode?: boolean;
    allowSignup?: boolean;
    autoBackup?: 'off' | 'daily' | 'weekly';
    features: AppFeatures;
    loyverseToken?: string;
    orgLat?: number;
    orgLng?: number;
    allowedRadius?: number;
    googleSheetsUrl?: string;
    // SQL / Supabase
    supabaseUrl?: string;
    supabaseKey?: string;
}

export interface Organization {
    id: string;
    name: string;
    logo?: string; // Base64 or URL
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    registrationNumber?: string;
    createdAt: string;
    settings: AppSettings;
}

export interface Campaign {
    id: string;
    organizationId: string;
    name: string;
    type: 'Email' | 'SMS' | 'WhatsApp';
    status: 'Draft' | 'Scheduled' | 'Sent' | 'Completed';
    targetAudience: 'All' | 'VIP' | 'New' | 'Inactive';
    content: string;
    scheduledFor?: string;
    sentAt?: string;
    stats: {
        sent: number;
        opened: number;
        clicked: number;
    };
}

export interface PermissionRule {
    [action: string]: Role[];
}

export interface PermissionsState {
    inventory: { view: Role[], manage: Role[] };
    maintenance: { view: Role[], manage: Role[], updateStatus: Role[] };
    whatsapp: { view: Role[], manage: Role[] };
    settings: { view: Role[], manageUsers: Role[] };
    [key: string]: any;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: UserType | 'both';
  color: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  color: string;
  target: UserType | 'both';
  currency: 'XP' | 'SmartCoin'; 
}

export interface BattleTeam {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    score: number;
    members: string[]; // User IDs
    organizationId: string;
}

export interface KarmaTransaction {
    id: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    reason: string;
    timestamp: string;
    organizationId: string;
}

export interface WheelReward {
    id: string;
    label: string;
    value: string | number;
    type: 'coin' | 'xp' | 'gift' | 'perk';
    color: string;
    icon: string;
    probability: number;
}

export interface User {
  id: string;
  organizationId: string; // Tenant ID
  username?: string;
  password?: string;
  name: string;
  role: Role; 
  type: UserType;
  avatar: string;
  customImage?: string;
  bio?: string;
  
  department?: string;
  jobTitle?: string;
  salary?: number;
  dailyRate?: number;
  joiningDate?: string;

  points: number;
  level: number;
  badges: string[];
  performanceMetric: number;
  
  smartCoins: number;
  karma: number;
  teamId?: string;
  
  attendanceStreak?: number;
  wheelSpins?: { month: string, count: number }; // Track spins per month (YYYY-MM)
  
  email?: string;
  phone?: string;
  idCardImage?: string;
  certifications?: string[];
}

export interface CustomerHistory {
  id: string;
  date: string;
  type: 'Lab' | 'Course' | 'Visit' | 'Purchase' | 'Payment';
  details: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: 'Active' | 'Inactive' | 'VIP' | 'Archived';
  joinedDate: string;
  history: CustomerHistory[];
}

export interface FinanceRecord {
    id: string;
    organizationId: string;
    date: string;
    amount: number;
    type: FinanceType;
    category: string;
    description: string;
    customerId?: string;
    customerName?: string;
    receiptNumber?: string;
    paymentMethod: PaymentMethod;
    recordedBy: string;
}

export interface CustomerFeedback {
    id: string;
    organizationId: string;
    customerId: string;
    date: string;
    type: FeedbackType;
    details: string;
    status: FeedbackStatus;
    recordedBy: string;
}

export interface Glitch {
    id: string;
    organizationId: string;
    guestName: string;
    guestPhone?: string;
    guestId?: string; // Linked ID
    guestType?: 'Customer' | 'User' | 'Guest'; // Link Type
    guestComplaint: string; // What the guest said
    employeeResponse: string; // What the employee said/did
    category: 'Service' | 'Facility' | 'Staff' | 'Product' | 'Other';
    severity: 'Low' | 'Medium' | 'Critical';
    needsFollowUp: boolean;
    status: 'Open' | 'Resolved' | 'Pending';
    reportedBy: string; // Employee ID
    reportedAt: string;
    resolvedAt?: string;
    adminNotes?: string;
}

export interface WhatsAppMessage {
    id: string;
    organizationId: string;
    senderNumber: string;
    senderName?: string;
    message: string;
    timestamp: string;
    isProcessed: boolean;
}

export interface ChatMessage {
    id: string;
    organizationId: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface TaskComment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
    isMe?: boolean;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  deadline: string;
  createdAt: string;
  lastUpdated: string;
  isPenalized?: boolean;
  elapsedTime?: number;
  isTimerRunning?: boolean;
  comments: TaskComment[];
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
  highlighted?: boolean;
  image?: string;
  price?: number; // Kept for backward compat, use sellingPrice preference
  sellingPrice: number;
  costPrice: number;
  taxRate?: number; 
}

export interface MaintenanceTicket {
  id: string;
  organizationId: string;
  deviceId: string;
  deviceName: string;
  issue: string;
  priority: Priority;
  status: Status;
  assigneeId: string;
  reportedBy: string;
  createdAt: string;
}

export interface LabRoom {
    id: string;
    name: string;
    capacity: number;
}

export interface Reservation {
    id: string;
    organizationId: string;
    roomId: string;
    computerId?: string;
    userId: string;
    startTime: string;
    endTime: string;
    title: string;
}

export interface LabComputer {
  id: string;
  organizationId: string;
  roomId: string;
  deskNumber: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Offline';
  currentUserId?: string;
  customerId?: string;
  specs: string;
  issue?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  category: NotificationCategory;
  isExiting?: boolean;
}

export interface AttendanceRecord {
    id: string;
    organizationId: string;
    userId: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    locationCheckIn: string;
    locationCheckOut?: string;
    status: 'Present' | 'Late' | 'Absent';
}

export interface Payslip {
    id: string;
    organizationId: string;
    userId: string;
    month: string;
    generatedAt: string;
    totalDays: number;
    totalHours: number;
    dailyRate: number;
    totalSalary: number;
    bonus: number;
    deductions: number;
    netSalary: number;
    status: 'Paid' | 'Pending';
    adminNote?: string;
}

export type LeaveType = 'Vacation' | 'Sick Leave' | 'Day Off' | 'Force Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: string;
    organizationId: string;
    userId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    attachment?: string;
    status: LeaveStatus;
    adminComment?: string;
    createdAt: string;
}

export interface FeedComment {
    id: string;
    userId: string;
    text: string;
    createdAt?: string; // fix type to match data usage
    timestamp?: string;
}

export interface FeedPost {
    id: string;
    organizationId: string;
    authorId: string;
    type: 'achievement' | 'certification' | 'task_completion' | 'announcement' | 'prize';
    title: string;
    content: string;
    imageUrl?: string;
    timestamp: string;
    likes: string[];
    comments: FeedComment[];
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'arrange';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  order?: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  media?: { type: 'image' | 'video' | 'audio', url: string };
  options: QuizOption[];
  timeLimit: number;
  points: number;
}

export interface Quiz {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  targetAudience: UserType | 'both';
  createdBy: string;
  totalPoints: number;
}

export interface QuestionResultDetail {
  questionId: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  organizationId: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  completedAt: string;
  details: QuestionResultDetail[];
  totalTime: number;
}

export interface Course {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  points: number;
  targetAudience: UserType | 'both';
  linkedQuizId?: string;
  // ERP & Scheduling
  price?: number;
  status?: 'Active' | 'Archived';
  category?: string;
  startDate?: string;
  recurrence?: 'None' | 'Weekly' | 'Monthly';
  maxCapacity?: number;
  instructor?: string;
}

export interface CourseBooking {
    id: string;
    organizationId: string;
    courseId: string;
    userId: string;
    bookingDate: string;
    status: 'Confirmed' | 'Waitlist' | 'Cancelled';
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface PurchaseOrder {
    id: string;
    organizationId: string;
    supplier: string;
    items: string;
    totalCost: number;
    status: 'Pending' | 'Approved' | 'Received';
    date: string;
}

// --- POS TYPES ---

export interface ShiftSummary {
    totalOrders: number;
    totalGuests: number; // Added
    grossSales: number;
    netSales: number;
    totalTax: number;
    totalDiscount: number;
    totalRefunds: number;
    averageCheck: number;
    averageCover: number; // Added
    cashExpected: number;
    cashActual: number;
    cashDifference: number;
    paymentBreakdown: Record<string, number>;
}

export interface POSSession {
    id: string;
    organizationId: string;
    openedAt: string;
    closedAt?: string;
    openedBy: string;
    startCash: number;
    endCash?: number;
    expectedCash?: number;
    status: 'Open' | 'Closed';
    notes?: string;
    summary?: ShiftSummary; // Snapshot of the Z-Report
}

export interface POSOrderItem {
    id: string; // Ref ID (Inv or Course)
    name: string;
    price: number;
    quantity: number;
    taxRate: number; // Percentage 0-100
    type: 'Product' | 'Course' | 'Service' | 'Custom';
    notes?: string;
    category?: string;
}

export interface POSOrder {
    id: string;
    sessionId: string;
    organizationId: string;
    items: POSOrderItem[];
    subtotal: number;
    taxTotal: number;
    discount: number;
    total: number;
    tendered?: number; // Amount given by customer
    change?: number; // Change due
    paymentMethod: PaymentMethod | 'Split' | 'None'; // None for Held
    customerId?: string;
    guestCount?: number; // Added
    status: 'Completed' | 'Voided' | 'Refunded' | 'Held';
    createdAt: string;
    receiptNumber: string;
    note?: string; // For held tickets
}

export interface ReceiptConfig {
    headerText: string;
    footerText: string;
    showLogo: boolean;
    logoUrl?: string; // Reuse org logo or custom
    scale: number; // For printing scaling
    printerIp?: string;
}

export interface POSCategory {
    id: string;
    organizationId: string;
    name: string;
    color: string;
}

export interface POSTax {
    id: string;
    organizationId: string;
    name: string;
    rate: number;
    isDefault: boolean;
}
