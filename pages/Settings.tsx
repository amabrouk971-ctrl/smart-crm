
import React, { useState } from 'react';
import { AppSettings, User, Role, AppTheme, AppLanguage, PermissionsState, ApiKey, Webhook, WebhookEvent, Organization, AppFont, AppFeatures } from '../types';
import { THEMES, TRANSLATIONS } from '../data';
import { GoogleGenAI } from "@google/genai";

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (s: AppSettings) => void;
    users: User[];
    onUpdateUser: (u: User) => void;
    onAddUser: (u: User) => void;
    currentUser: User;
    currentOrganization: Organization | null;
    onUpdateOrganization: (org: Organization) => void;
    lang: AppLanguage;
    permissions: PermissionsState;
    onUpdatePermissions: (p: PermissionsState) => void;
    // API Props
    apiKeys: ApiKey[];
    webhooks: Webhook[];
    onAddApiKey: (name: string) => void;
    onDeleteApiKey: (id: string) => void;
    onAddWebhook: (w: Partial<Webhook>) => void;
    onDeleteWebhook: (id: string) => void;
    onSyncFromCloud?: () => void;
}

const SCHEMA_SQL = `
-- ==========================================
-- TechSmart Pro CRM - Complete Database Schema
-- Compatible with PostgreSQL / Supabase
-- ==========================================

-- 1. Organizations (Tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Staff & Students)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  username TEXT,
  password TEXT, 
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  avatar TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  smart_coins INTEGER DEFAULT 0,
  karma INTEGER DEFAULT 0,
  salary NUMERIC,
  daily_rate NUMERIC,
  department TEXT,
  job_title TEXT,
  phone TEXT,
  email TEXT,
  joining_date DATE,
  bio TEXT,
  custom_image TEXT,
  id_card_image TEXT,
  certifications TEXT[],
  badges TEXT[],
  wheel_spins JSONB
);

-- 3. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id TEXT REFERENCES users(id),
  priority TEXT,
  status TEXT,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ,
  elapsed_time INTEGER DEFAULT 0,
  is_penalized BOOLEAN DEFAULT FALSE,
  comments JSONB DEFAULT '[]'::jsonb
);

-- 4. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  location TEXT,
  status TEXT,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  image TEXT,
  last_updated DATE
);

-- 5. Maintenance Tickets
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  device_id TEXT,
  device_name TEXT,
  issue TEXT,
  priority TEXT,
  status TEXT,
  assignee_id TEXT REFERENCES users(id),
  reported_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  status TEXT,
  joined_date DATE,
  history JSONB DEFAULT '[]'::jsonb
);

-- 7. Finance Records
CREATE TABLE IF NOT EXISTS finance_records (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  date DATE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  customer_id TEXT REFERENCES customers(id),
  receipt_number TEXT,
  payment_method TEXT,
  recorded_by TEXT
);

-- 8. Lab Computers
CREATE TABLE IF NOT EXISTS lab_computers (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  room_id TEXT,
  desk_number TEXT,
  status TEXT,
  specs TEXT,
  current_user_id TEXT,
  customer_id TEXT REFERENCES customers(id),
  issue TEXT
);

-- 9. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  user_id TEXT REFERENCES users(id),
  date DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  location_check_in TEXT,
  status TEXT
);

-- 10. Leaves
CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  user_id TEXT REFERENCES users(id),
  type TEXT,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  attachment TEXT,
  status TEXT,
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  video_url TEXT,
  duration TEXT,
  points INTEGER,
  price NUMERIC,
  status TEXT,
  category TEXT,
  start_date DATE,
  recurrence TEXT,
  max_capacity INTEGER,
  instructor TEXT
);

-- 12. Course Progress
CREATE TABLE IF NOT EXISTS course_progress (
  user_id TEXT REFERENCES users(id),
  course_id TEXT REFERENCES courses(id),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);

-- 13. Course Bookings
CREATE TABLE IF NOT EXISTS course_bookings (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  course_id TEXT REFERENCES courses(id),
  user_id TEXT REFERENCES users(id),
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT
);

-- 14. POS Sessions
CREATE TABLE IF NOT EXISTS pos_sessions (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  opened_by TEXT REFERENCES users(id),
  start_cash NUMERIC,
  end_cash NUMERIC,
  expected_cash NUMERIC,
  status TEXT,
  summary JSONB
);

-- 15. POS Orders
CREATE TABLE IF NOT EXISTS pos_orders (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  session_id TEXT REFERENCES pos_sessions(id),
  customer_id TEXT REFERENCES customers(id),
  items JSONB NOT NULL,
  subtotal NUMERIC,
  tax_total NUMERIC,
  discount NUMERIC,
  total NUMERIC,
  tendered NUMERIC,
  change NUMERIC,
  payment_method TEXT,
  status TEXT,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  guest_count INTEGER,
  note TEXT
);

-- 16. POS Categories
CREATE TABLE IF NOT EXISTS pos_categories (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT,
  color TEXT
);

-- 17. POS Taxes
CREATE TABLE IF NOT EXISTS pos_taxes (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT,
  rate NUMERIC,
  is_default BOOLEAN
);

-- 18. Glitches
CREATE TABLE IF NOT EXISTS glitches (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  guest_name TEXT,
  guest_phone TEXT,
  guest_type TEXT,
  guest_id TEXT,
  guest_complaint TEXT,
  employee_response TEXT,
  category TEXT,
  severity TEXT,
  needs_follow_up BOOLEAN,
  status TEXT,
  reported_by TEXT REFERENCES users(id),
  reported_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- 19. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT,
  type TEXT,
  status TEXT,
  target_audience TEXT,
  content TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB
);

-- 20. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  sender_id TEXT REFERENCES users(id),
  receiver_id TEXT REFERENCES users(id),
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- 21. Feed Posts
CREATE TABLE IF NOT EXISTS feed_posts (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  author_id TEXT REFERENCES users(id),
  type TEXT,
  title TEXT,
  content TEXT,
  image_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  likes JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb
);

-- 22. Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT,
  url TEXT,
  event TEXT,
  is_active BOOLEAN,
  last_triggered TIMESTAMPTZ,
  failure_count INTEGER
);

-- 23. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  name TEXT,
  key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- 24. Payslips
CREATE TABLE IF NOT EXISTS payslips (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  user_id TEXT REFERENCES users(id),
  month TEXT,
  generated_at TIMESTAMPTZ,
  total_days INTEGER,
  total_hours NUMERIC,
  daily_rate NUMERIC,
  total_salary NUMERIC,
  bonus NUMERIC,
  deductions NUMERIC,
  net_salary NUMERIC,
  status TEXT,
  admin_note TEXT
);
`;

export const SettingsView = ({ 
    settings, onUpdateSettings, users, onUpdateUser, onAddUser, currentUser, currentOrganization, onUpdateOrganization, lang, permissions, onUpdatePermissions,
    apiKeys, webhooks, onAddApiKey, onDeleteApiKey, onAddWebhook, onDeleteWebhook, onSyncFromCloud
}: SettingsProps) => {
    const [activeTab, setActiveTab] = useState<'general' | 'organization' | 'advanced' | 'security' | 'users' | 'permissions' | 'location' | 'integrations' | 'api' | 'sql'>('general');
    const [faceIdScanning, setFaceIdScanning] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [showSchema, setShowSchema] = useState(false);
    
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState<Partial<User>>({ role: 'Technician', type: 'staff', level: 1, points: 0, smartCoins: 0, karma: 0 });
    
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({ name: '', url: '', event: 'task.created' });
    
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [pointsAdj, setPointsAdj] = useState(0);

    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [isMapSearching, setIsMapSearching] = useState(false);
    const [mapResultText, setMapResultText] = useState('');
    const [mapGroundingChunks, setMapGroundingChunks] = useState<any[]>([]);
    const [foundCoords, setFoundCoords] = useState<{lat: number, lng: number} | null>(null);

    const t = TRANSLATIONS[lang];
    const isAdmin = currentUser.role === 'Admin';
    const roles: Role[] = ['Admin', 'Manager', 'Technician', 'Reception', 'Student'];

    const handleThemeChange = (theme: AppTheme) => {
        onUpdateSettings({ ...settings, theme });
    };

    const handleFontChange = (font: AppFont) => {
        onUpdateSettings({ ...settings, font });
    };

    const handleLangChange = (newLang: 'ar' | 'en') => {
        onUpdateSettings({ ...settings, language: newLang });
    };

    const handleFeatureToggle = (key: keyof AppFeatures) => {
        const currentFeatures = settings.features || {
            tasks: true, crm: true, inventory: true, lab: true, learning: true, gamification: true, finance: true, hr: true, social: true, glitches: true, marketing: true, reports: false, pos: true
        };
        onUpdateSettings({
            ...settings,
            features: {
                ...currentFeatures,
                [key]: !currentFeatures[key]
            }
        });
    };

    const handleFaceIdToggle = () => {
        if (!settings.biometricEnabled) {
            setFaceIdScanning(true);
            setTimeout(() => {
                setFaceIdScanning(false);
                onUpdateSettings({ ...settings, biometricEnabled: true });
                alert('Success');
            }, 3000);
        } else {
            onUpdateSettings({ ...settings, biometricEnabled: false });
        }
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (userToEdit && newPassword) {
            onUpdateUser({ ...userToEdit, password: newPassword });
            setUserToEdit(null);
            setNewPassword('');
            alert('تم إعادة تعيين كلمة المرور بنجاح');
        }
    };

    const handleAddUser = () => {
        if (newUser.name && newUser.username && newUser.password) {
            onAddUser({
                ...newUser,
                id: `U-${Date.now()}`,
                organizationId: currentUser.organizationId,
                avatar: '👤',
                badges: [],
                performanceMetric: 100
            } as User);
            setShowAddUserModal(false);
            setNewUser({ role: 'Technician', type: 'staff', level: 1, points: 0, smartCoins: 0, karma: 0 });
        }
    };

    const togglePermission = (module: string, action: string, role: Role) => {
        const modulePerms = permissions[module];
        const currentRoles = modulePerms[action] as Role[];
        let newRoles;

        if (currentRoles.includes(role)) {
            newRoles = currentRoles.filter(r => r !== role);
        } else {
            newRoles = [...currentRoles, role];
        }

        const newPerms = {
            ...permissions,
            [module]: {
                ...modulePerms,
                [action]: newRoles
            }
        };
        onUpdatePermissions(newPerms);
    };

    const handleUpdateOrgLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentOrganization) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateOrganization({ ...currentOrganization, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveOrgInfo = (field: keyof Organization, value: string) => {
        if (currentOrganization) {
            onUpdateOrganization({ ...currentOrganization, [field]: value });
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onUpdateSettings({
                    ...settings,
                    orgLat: position.coords.latitude,
                    orgLng: position.coords.longitude
                });
                setLocLoading(false);
                alert("Location captured successfully!");
            },
            (error) => {
                console.error("Location Error:", error.message);
                setLocLoading(false);
                if (error.code === 1) alert("Permission denied. Please allow location access in your browser settings.");
                else if (error.code === 2) alert("Location unavailable. Please try again.");
                else if (error.code === 3) alert("Location request timed out.");
                else alert("Unable to retrieve your location: " + error.message);
            }
        );
    };

    const handleMapsSearch = async () => {
        if (!mapSearchQuery) return;
        if (!process.env.API_KEY) {
            alert("API Key is missing. Please configure it in code environment.");
            return;
        }

        setIsMapSearching(true);
        setMapResultText('');
        setMapGroundingChunks([]);
        setFoundCoords(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Find the precise location of '${mapSearchQuery}'. Return a short description and the latitude/longitude strictly in this format: LAT: <lat>, LNG: <lng>.`,
                config: {
                    tools: [{ googleMaps: {} }],
                },
            });

            const text = response.text || '';
            setMapResultText(text);
            
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setMapGroundingChunks(chunks);

            const match = text.match(/LAT:\s*(-?\d+(\.\d+)?).*?LNG:\s*(-?\d+(\.\d+)?)/i);
            if (match) {
                setFoundCoords({
                    lat: parseFloat(match[1]),
                    lng: parseFloat(match[3])
                });
            }

        } catch (e) {
            console.error("Maps Search Error:", e);
            alert("Error searching location. Check API Key and console.");
        } finally {
            setIsMapSearching(false);
        }
    };

    const applyFoundCoords = () => {
        if (foundCoords) {
            onUpdateSettings({
                ...settings,
                orgLat: foundCoords.lat,
                orgLng: foundCoords.lng
            });
            alert("Updated organization location successfully!");
            setFoundCoords(null);
            setMapSearchQuery('');
            setMapResultText('');
            setMapGroundingChunks([]);
        }
    };

    const handleCopySchema = () => {
        navigator.clipboard.writeText(SCHEMA_SQL);
        alert('SQL Schema copied to clipboard!');
    };

    const fonts: { key: AppFont, label: string }[] = [
        { key: 'Cairo', label: 'Cairo (Default)' },
        { key: 'Tajawal', label: 'Tajawal' },
        { key: 'Almarai', label: 'Almarai' },
        { key: 'IBM Plex Sans Arabic', label: 'IBM Plex Sans' },
        { key: 'Amiri', label: 'Amiri (Classic)' },
        { key: 'Inter', label: 'Inter (English)' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{t.settings.title}</h2>
            
            <div className="flex gap-4 border-b border-slate-200 pb-1 overflow-x-auto">
                <button onClick={() => setActiveTab('general')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabGeneral}</button>
                {isAdmin && <button onClick={() => setActiveTab('organization')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'organization' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>بيانات المؤسسة</button>}
                <button onClick={() => setActiveTab('advanced')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'advanced' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Advanced & Features</button>
                <button onClick={() => setActiveTab('security')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabSecurity}</button>
                {isAdmin && <button onClick={() => setActiveTab('location')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'location' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabLocation}</button>}
                <button onClick={() => setActiveTab('integrations')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>التكامل (Integrations)</button>
                {isAdmin && <button onClick={() => setActiveTab('sql')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'sql' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>SQL Database</button>}
                {isAdmin && <button onClick={() => setActiveTab('api')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'api' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabApi}</button>}
                {isAdmin && <button onClick={() => setActiveTab('users')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabUsers}</button>}
                {isAdmin && <button onClick={() => setActiveTab('permissions')} className={`pb-3 px-4 font-bold transition-colors whitespace-nowrap ${activeTab === 'permissions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>{t.settings.tabPermissions}</button>}
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-paintbrush"></i> {t.settings.theme}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(Object.keys(THEMES) as AppTheme[]).map(key => (
                                <button 
                                    key={key}
                                    onClick={() => handleThemeChange(key)}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                                        ${settings.theme === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}
                                    `}
                                >
                                    <div className={`w-full h-8 rounded-lg shadow-sm`} style={{ background: THEMES[key].gradient }}></div>
                                    <span className="text-xs font-bold">{THEMES[key].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-font"></i> الخط (Font)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {fonts.map(font => (
                                <button 
                                    key={font.key}
                                    onClick={() => handleFontChange(font.key)}
                                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm
                                        ${settings.font === font.key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-200'}
                                    `}
                                    style={{ fontFamily: font.key }}
                                >
                                    {font.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-language"></i> {t.settings.language}</h3>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleLangChange('ar')}
                                className={`flex-1 py-4 rounded-xl font-bold border-2 flex items-center justify-center gap-2
                                    ${settings.language === 'ar' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}
                                `}
                            >
                                <span className="text-2xl">🇸🇦</span> العربية
                            </button>
                            <button 
                                onClick={() => handleLangChange('en')}
                                className={`flex-1 py-4 rounded-xl font-bold border-2 flex items-center justify-center gap-2
                                    ${settings.language === 'en' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}
                                `}
                            >
                                <span className="text-2xl">🇺🇸</span> English
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-sliders"></i> التفضيلات (Preferences)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="font-bold text-slate-700 text-sm">العملة الافتراضية</label>
                                <select 
                                    className="border rounded-lg px-2 py-1 text-sm bg-slate-50 outline-none focus:border-blue-500"
                                    value={settings.currency || 'EGP'}
                                    onChange={(e) => onUpdateSettings({...settings, currency: e.target.value as any})}
                                >
                                    <option value="EGP">EGP (جنية مصري)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="SAR">SAR (ريال سعودي)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'organization' && isAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4">هوية المؤسسة</h3>
                        <div className="flex gap-6 items-start">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                                    {currentOrganization?.logo ? (
                                        <img src={currentOrganization.logo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <i className="fa-solid fa-image text-slate-300 text-3xl"></i>
                                    )}
                                </div>
                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl font-bold text-xs">
                                    تغيير
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUpdateOrgLogo} />
                                </label>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">اسم المؤسسة</label>
                                    <input 
                                        className="w-full border rounded-lg p-2 font-bold text-slate-800"
                                        value={currentOrganization?.name || ''}
                                        onChange={(e) => handleSaveOrgInfo('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">الهاتف</label>
                                        <input 
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={currentOrganization?.phone || ''}
                                            onChange={(e) => handleSaveOrgInfo('phone', e.target.value)}
                                            placeholder="+20..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
                                        <input 
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={currentOrganization?.email || ''}
                                            onChange={(e) => handleSaveOrgInfo('email', e.target.value)}
                                            placeholder="contact@..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'advanced' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(settings.features).map((feature) => (
                        <div key={feature} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                                    ${settings.features[feature as keyof AppFeatures] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}
                                `}>
                                    <i className="fa-solid fa-cube"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 capitalize">{feature}</h4>
                                    <p className="text-xs text-slate-400">{settings.features[feature as keyof AppFeatures] ? 'Enabled' : 'Disabled'}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.features[feature as keyof AppFeatures]} onChange={() => handleFeatureToggle(feature as keyof AppFeatures)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2"><i className="fa-solid fa-fingerprint text-purple-600"></i> {t.settings.faceId}</h3>
                            <p className="text-slate-500 text-sm">{t.settings.faceIdDesc}</p>
                        </div>
                        <button 
                            onClick={handleFaceIdToggle}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                                ${settings.biometricEnabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-800 text-white hover:bg-black'}
                            `}
                        >
                            {faceIdScanning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : settings.biometricEnabled ? <><i className="fa-solid fa-check"></i> Enabled</> : 'Enable Now'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'location' && isAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-lg mb-1">إعدادات الموقع الجغرافي (GPS)</h3>
                                <p className="text-slate-500 text-sm">حدد موقع المؤسسة لتفعيل نظام الحضور الذكي.</p>
                            </div>
                            <button 
                                onClick={handleGetCurrentLocation}
                                disabled={locLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {locLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}
                                التقاط موقعي الحالي
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">خط العرض (Latitude)</label>
                                <input 
                                    className="w-full border rounded-lg p-2 bg-slate-50 text-slate-600 font-mono"
                                    value={settings.orgLat || ''}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">خط الطول (Longitude)</label>
                                <input 
                                    className="w-full border rounded-lg p-2 bg-slate-50 text-slate-600 font-mono"
                                    value={settings.orgLng || ''}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">نطاق السماحية (متر)</label>
                            <input 
                                type="number"
                                className="w-full border rounded-lg p-2"
                                value={settings.allowedRadius || 100}
                                onChange={(e) => onUpdateSettings({ ...settings, allowedRadius: Number(e.target.value) })}
                            />
                            <p className="text-xs text-slate-400 mt-1">المسافة المسموح بها للموظف لتسجيل الحضور من نقطة المركز.</p>
                        </div>
                    </div>

                    {/* Google Maps Grounding Search */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-map-location-dot text-green-600"></i>
                            بحث عن موقع (Google Maps)
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <input 
                                className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Find place by name..."
                                value={mapSearchQuery}
                                onChange={(e) => setMapSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMapsSearch()}
                            />
                            <button 
                                onClick={handleMapsSearch}
                                disabled={isMapSearching || !mapSearchQuery.trim()}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isMapSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
                                Search
                            </button>
                        </div>

                        {mapResultText && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in-up">
                                <div className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{mapResultText}</div>
                                
                                {mapGroundingChunks.length > 0 && (
                                    <div className="mb-4 text-xs">
                                        <span className="font-bold text-slate-500 block mb-1">Sources:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {mapGroundingChunks.map((chunk, idx) => {
                                                const webUri = chunk.web?.uri;
                                                const mapsUri = chunk.maps?.uri || chunk.maps?.googleMapsUri; 
                                                const uri = webUri || mapsUri;
                                                const title = chunk.web?.title || chunk.maps?.title || 'Maps Source';
                                                
                                                if (!uri) return null;

                                                return (
                                                    <a 
                                                        key={idx} 
                                                        href={uri} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="bg-white border px-2 py-1 rounded text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <i className={mapsUri ? "fa-solid fa-map-location-dot" : "fa-brands fa-google"}></i> {title}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {foundCoords && (
                                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                                        <div className="text-green-800 text-xs">
                                            Found: <span className="font-mono font-bold">{foundCoords.lat}, {foundCoords.lng}</span>
                                        </div>
                                        <button 
                                            onClick={applyFoundCoords}
                                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700"
                                        >
                                            Use this location
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <img src="https://loyverse.com/img/loyverse-logo.png" className="w-12 h-12 object-contain" alt="Loyverse" onError={(e) => e.currentTarget.src = 'https://placehold.co/50?text=L'} />
                            <div>
                                <h3 className="font-bold text-lg">Loyverse POS</h3>
                                <p className="text-slate-500 text-sm">مزامنة المبيعات والعملاء ونقاط الولاء.</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">API Access Token</label>
                            <div className="flex gap-2">
                                <input 
                                    type="password"
                                    className="flex-1 border rounded-lg p-2"
                                    placeholder="Enter Loyverse Token..."
                                    value={settings.loyverseToken || ''}
                                    onChange={(e) => onUpdateSettings({ ...settings, loyverseToken: e.target.value })}
                                />
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Connect</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && isAdmin && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">إدارة المستخدمين</h3>
                            <button onClick={() => setShowAddUserModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ مستخدم جديد</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-4">الاسم</th>
                                        <th className="p-4">اسم المستخدم</th>
                                        <th className="p-4">الدور</th>
                                        <th className="p-4">نقاط XP</th>
                                        <th className="p-4">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold">{u.name}</td>
                                            <td className="p-4 text-slate-500">{u.username}</td>
                                            <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{u.role}</span></td>
                                            <td className="p-4">{u.points}</td>
                                            <td className="p-4">
                                                <button onClick={() => setUserToEdit(u)} className="text-blue-600 hover:underline text-xs font-bold">تعديل / إعادة تعيين</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'permissions' && isAdmin && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    <h3 className="font-bold text-lg mb-6">مصفوفة الصلاحيات</h3>
                    <table className="w-full text-right text-sm border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 text-slate-500">الوحدة / الإجراء</th>
                                {roles.map(role => (
                                    <th key={role} className="p-3 text-center text-slate-700">{role}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Object.entries(permissions).map(([module, actions]) => 
                                Object.entries(actions).map(([action, allowedRoles]) => (
                                    <tr key={`${module}-${action}`} className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-slate-600 capitalize">{module} : {action}</td>
                                        {roles.map(role => (
                                            <td key={role} className="p-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(allowedRoles as Role[]).includes(role)} 
                                                    onChange={() => togglePermission(module, action, role)}
                                                    disabled={role === 'Admin'} // Admin always has access
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'api' && isAdmin && (
                <div className="space-y-6">
                    {/* API Keys Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">API Keys</h3>
                            <div className="flex gap-2">
                                <input className="border rounded-lg px-3 py-1 text-sm" placeholder="New Key Name" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                                <button onClick={() => { if(newKeyName) { onAddApiKey(newKeyName); setNewKeyName(''); } }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold">Generate</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {apiKeys.map(k => (
                                <div key={k.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div>
                                        <div className="font-bold text-sm">{k.name}</div>
                                        <div className="font-mono text-xs text-slate-500">{k.key}</div>
                                    </div>
                                    <button onClick={() => onDeleteApiKey(k.id)} className="text-red-500 hover:text-red-700"><i className="fa-solid fa-trash"></i></button>
                                </div>
                            ))}
                            {apiKeys.length === 0 && <p className="text-slate-400 text-sm italic">No API keys generated.</p>}
                        </div>
                    </div>

                    {/* Webhooks Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Webhooks</h3>
                        </div>
                        
                        {/* Add Hook Form */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input 
                                className="border rounded-lg px-3 py-1 text-sm" 
                                placeholder="Name (e.g. Zapier)" 
                                value={newWebhook.name} 
                                onChange={e => setNewWebhook({...newWebhook, name: e.target.value})} 
                            />
                            <input 
                                className="border rounded-lg px-3 py-1 text-sm" 
                                placeholder="Payload URL (https://...)" 
                                value={newWebhook.url} 
                                onChange={e => setNewWebhook({...newWebhook, url: e.target.value})} 
                            />
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 border rounded-lg px-2 py-1 text-sm"
                                    value={newWebhook.event}
                                    onChange={e => setNewWebhook({...newWebhook, event: e.target.value as WebhookEvent})}
                                >
                                    <option value="task.created">task.created</option>
                                    <option value="task.completed">task.completed</option>
                                    <option value="customer.added">customer.added</option>
                                </select>
                                <button 
                                    onClick={() => { if(newWebhook.name && newWebhook.url) { onAddWebhook(newWebhook); setNewWebhook({name:'', url:'', event:'task.created'}); } }} 
                                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {webhooks.map(w => (
                                <div key={w.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-800">{w.name}</span>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{w.event}</span>
                                        </div>
                                        <div className="font-mono text-xs text-slate-500 truncate max-w-md mt-1">{w.url}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right text-xs text-slate-400">
                                            <div>Failures: {w.failureCount}</div>
                                            <div>{w.isActive ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}</div>
                                        </div>
                                        <button onClick={() => onDeleteWebhook(w.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            ))}
                            {webhooks.length === 0 && <p className="text-slate-400 text-sm italic">No webhooks configured.</p>}
                        </div>
                    </div>

                    {/* Cloud Sync Button */}
                    {onSyncFromCloud && (
                        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg"><i className="fa-solid fa-cloud"></i> المزامنة السحابية</h3>
                                <p className="text-slate-400 text-sm">نسخ احتياطي واستعادة البيانات من السحابة</p>
                            </div>
                            <button 
                                onClick={onSyncFromCloud}
                                className="bg-white text-slate-900 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-cloud-arrow-down"></i> Sync Now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sql' && isAdmin && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2"><i className="fa-solid fa-database text-green-600"></i> Supabase SQL Connection</h3>
                                <p className="text-slate-500 text-sm mt-1">Connect your app to a real PostgreSQL database.</p>
                            </div>
                            <button 
                                onClick={() => setShowSchema(!showSchema)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center gap-2"
                            >
                                <i className="fa-solid fa-code"></i> {showSchema ? 'Hide Schema' : 'Generate Schema'}
                            </button>
                        </div>

                        {showSchema && (
                            <div className="mb-6 animate-fade-in-up">
                                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-auto max-h-96 relative border border-slate-700">
                                    <button 
                                        onClick={handleCopySchema}
                                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold transition-colors backdrop-blur-sm"
                                    >
                                        <i className="fa-solid fa-copy mr-1"></i> Copy SQL
                                    </button>
                                    <pre>{SCHEMA_SQL}</pre>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    <i className="fa-solid fa-info-circle mr-1"></i> 
                                    Copy this SQL and run it in the <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">Supabase SQL Editor</a> to create all tables.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Supabase URL</label>
                                <input 
                                    className="w-full border rounded-lg p-2 font-mono text-sm" 
                                    placeholder="https://xyz.supabase.co"
                                    value={settings.supabaseUrl || ''}
                                    onChange={(e) => onUpdateSettings({ ...settings, supabaseUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Supabase Anon Key</label>
                                <input 
                                    type="password"
                                    className="w-full border rounded-lg p-2 font-mono text-sm" 
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    value={settings.supabaseKey || ''}
                                    onChange={(e) => onUpdateSettings({ ...settings, supabaseKey: e.target.value })}
                                />
                            </div>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm w-full md:w-auto">
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h3>
                        <div className="space-y-3">
                            <input className="w-full border rounded p-2" placeholder="الاسم" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                            <input className="w-full border rounded p-2" placeholder="اسم المستخدم" value={newUser.username || ''} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                            <input className="w-full border rounded p-2" type="password" placeholder="كلمة المرور" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            <select className="w-full border rounded p-2" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowAddUserModal(false)} className="flex-1 py-2 bg-slate-100 rounded text-slate-600 font-bold">إلغاء</button>
                                <button onClick={handleAddUser} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">إضافة</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {userToEdit && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">تعديل المستخدم: {userToEdit.name}</h3>
                        
                        <form onSubmit={handleResetPassword} className="mb-6 border-b pb-6">
                            <h4 className="font-bold text-sm text-slate-600 mb-2">تغيير كلمة المرور</h4>
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    className="flex-1 border rounded-lg p-2" 
                                    placeholder="كلمة المرور الجديدة"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <button type="submit" disabled={!newPassword} className="bg-amber-500 text-white px-4 rounded-lg font-bold disabled:opacity-50">تحديث</button>
                            </div>
                        </form>

                        <div className="mb-4">
                            <h4 className="font-bold text-sm text-slate-600 mb-2">تعديل النقاط (الحالي: {userToEdit.points})</h4>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setPointsAdj(p => p - 50)} className="w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold">-</button>
                                <span className="font-mono font-bold w-12 text-center">{pointsAdj > 0 ? `+${pointsAdj}` : pointsAdj}</span>
                                <button onClick={() => setPointsAdj(p => p + 50)} className="w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold">+</button>
                                <button onClick={() => { if(pointsAdj !== 0) { const newPoints = Math.max(0, userToEdit.points + pointsAdj); onUpdateUser({...userToEdit, points: newPoints}); setUserToEdit(null); setPointsAdj(0); alert('Updated'); } }} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-xs font-bold ml-auto">حفظ النقاط</button>
                            </div>
                        </div>

                        <button onClick={() => { setUserToEdit(null); setPointsAdj(0); }} className="w-full py-2 bg-slate-100 rounded-lg text-slate-600 font-bold">إغلاق</button>
                    </div>
                </div>
            )}
        </div>
    );
};
