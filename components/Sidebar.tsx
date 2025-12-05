
import React from 'react';
import { Page, User, Notification, AppTheme, AppLanguage, PermissionsState, Organization } from '../types';
import { translateRole, THEMES, TRANSLATIONS } from '../data';
import { SmartLogo } from './Common';

interface SidebarProps {
  currentUser: User;
  currentOrganization: Organization | null;
  view: Page;
  setView: (page: Page) => void;
  notifications: Notification[];
  handleLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  theme: AppTheme;
  lang: AppLanguage;
  permissions: PermissionsState;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar = ({ 
    currentUser, 
    currentOrganization, 
    view, 
    setView, 
    notifications, 
    handleLogout, 
    isOpen, 
    onClose, 
    onResetData, 
    theme, 
    lang, 
    permissions,
    isCollapsed,
    toggleCollapse
}: SidebarProps) => {
  const currentTheme = THEMES[theme] || THEMES['royal'];
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const t = TRANSLATIONS[lang];
  const features = currentOrganization?.settings.features || {
      tasks: true, crm: true, inventory: true, lab: true, learning: true, gamification: true, finance: true, hr: true, social: true, glitches: true, marketing: false, pos: true
  };

  const NavItem = ({ page, icon, label, locked = false }: { page: Page, icon: string, label: string, locked?: boolean }) => {
     // Permission Check
     if (page === 'inventory' && permissions.inventory?.view && !permissions.inventory.view.includes(currentUser.role)) return null;
     if (page === 'maintenance' && permissions.maintenance?.view && !permissions.maintenance.view.includes(currentUser.role)) return null;
     if (page === 'whatsapp' && permissions.whatsapp?.view && !permissions.whatsapp.view.includes(currentUser.role)) return null;
     if (page === 'settings' && permissions.settings?.view && !permissions.settings.view.includes(currentUser.role)) return null;
     if (page === 'finance' && permissions.finance?.view && !permissions.finance.view.includes(currentUser.role)) return null;
     if (page === 'leaves' && permissions.leaves?.view && !permissions.leaves.view.includes(currentUser.role)) return null;
     if (page === 'glitches' && permissions.glitches?.view && !permissions.glitches.view.includes(currentUser.role)) return null;
     if (page === 'marketing' && permissions.marketing?.view && !permissions.marketing.view.includes(currentUser.role)) return null;

     const isActive = view === page;

     return (
      <button 
        onClick={() => { if(!locked) { setView(page); onClose(); } }}
        className={`flex items-center gap-4 py-3.5 mx-2 rounded-xl transition-all duration-300 relative overflow-hidden group mb-1
          ${isActive 
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-black/10 font-bold' 
            : 'text-white/80 hover:bg-white/10 hover:text-white'} 
          ${locked ? 'opacity-50 cursor-not-allowed' : ''}
          ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        style={{ width: 'calc(100% - 16px)' }}
        title={isCollapsed ? label : undefined}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 dark:bg-blue-400"></div>}
        
        <div className={`w-8 flex justify-center transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            <i className={`${icon} text-lg`}></i>
        </div>
        
        {!isCollapsed && <span className="text-sm transition-opacity duration-300 whitespace-nowrap">{label}</span>}
        
        {!isCollapsed && locked && <i className="fa-solid fa-lock text-[10px] ltr:ml-auto rtl:mr-auto opacity-50"></i>}
        {!isCollapsed && isActive && <i className="fa-solid fa-chevron-left ltr:ml-auto rtl:mr-auto text-xs text-blue-600 dark:text-blue-400 opacity-50"></i>}
      </button>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => {
      if (isCollapsed) return <div className="my-2 border-t border-white/10 mx-4"></div>;
      return (
        <div className="px-6 py-2 transition-opacity duration-300">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{title}</span>
        </div>
      );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in-up" onClick={onClose}></div>}
      
      <div 
        className={`fixed inset-y-0 right-0 flex flex-col z-50 transform transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0 shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : 'translate-x-full'} no-print ${isCollapsed ? 'w-[90px]' : 'w-[280px]'}`}
        style={{ background: currentTheme.gradient }}
      >
        {/* Toggle Button (Desktop only) */}
        <button 
            onClick={toggleCollapse}
            className="hidden md:flex absolute top-1/2 -left-3 w-6 h-12 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-l-lg shadow-md items-center justify-center transition-colors z-50 border border-r-0 border-slate-200 dark:border-slate-700"
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
        >
            <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>

        {/* Header / Logo */}
        <div className={`p-6 pb-8 flex items-center justify-center relative transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
             <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
             <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
             
             <div className={`bg-white/90 dark:bg-slate-900/90 p-2 rounded-2xl shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-500 flex justify-center items-center ${isCollapsed ? 'w-12 h-12' : 'w-full p-3'}`}>
                {isCollapsed ? (
                    <div className="font-serif font-black text-2xl text-red-700 leading-none select-none">
                        T<span className="text-slate-900 dark:text-white">S</span>
                    </div>
                ) : (
                    <SmartLogo className="h-10 md:h-12" organization={currentOrganization} />
                )}
             </div>
        </div>

        {/* User Profile Card */}
        <div className={`px-4 mb-4 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
            <div 
                className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-lg cursor-pointer hover:bg-white/20 transition-all ${isCollapsed ? 'justify-center p-2 h-14' : ''}`} 
                onClick={() => { setView('profile'); onClose(); }}
                title={isCollapsed ? currentUser.name : undefined}
            >
                <div className="relative shrink-0">
                    {currentUser.customImage ? (
                        <img src={currentUser.customImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-lg shadow-sm">
                            <i className="fa-solid fa-user-tie"></i>
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                {!isCollapsed && (
                    <div className="flex-1 min-w-0 animate-fade-in-right">
                        <div className="font-bold text-white truncate text-sm">{currentUser.name}</div>
                        <div className="text-[10px] text-blue-200 uppercase tracking-wide font-bold">{translateRole(currentUser.role, lang)}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(currentUser.points % 1000) / 10}%` }}></div>
                            </div>
                            <span className="text-[9px] text-yellow-400 font-mono">L{currentUser.level}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto space-y-1 py-2 scrollbar-hide">
          <SectionHeader title={t.sidebar.mainOps} />
          <NavItem page="dashboard" icon="fa-solid fa-chart-pie" label={t.sidebar.dashboard} />
          {features.pos && <NavItem page="pos" icon="fa-solid fa-cash-register" label="نقاط البيع (POS)" />}
          
          {isAdmin && <NavItem page="smart_dashboard" icon="fa-solid fa-chart-network" label="التحليل الذكي (SWOT)" />}
          
          {features.glitches && <NavItem page="glitches" icon="fa-solid fa-bug" label={t.sidebar.glitches} />}
          {features.social && <NavItem page="feed" icon="fa-solid fa-newspaper" label={t.sidebar.feed} />}
          {features.hr && <NavItem page="attendance" icon="fa-solid fa-user-clock" label={t.sidebar.attendance} />}
          {features.hr && <NavItem page="leaves" icon="fa-solid fa-calendar-days" label={t.sidebar.leaves} />}
          {features.social && <NavItem page="chat" icon="fa-solid fa-comments" label={t.sidebar.chat} />}
          {features.tasks && <NavItem page="tasks" icon="fa-solid fa-list-check" label={t.sidebar.tasks} />}
          {features.crm && <NavItem page="customers" icon="fa-solid fa-users-viewfinder" label={t.sidebar.customers} />}
          {features.crm && <NavItem page="whatsapp" icon="fa-brands fa-whatsapp" label={t.sidebar.whatsapp} />}
          {features.marketing && <NavItem page="marketing" icon="fa-solid fa-bullhorn" label={t.sidebar.marketing} />}
          {features.hr && <NavItem page="team" icon="fa-solid fa-people-group" label={t.sidebar.team} />}
          
          {(features.inventory || features.lab) && (
              <div className={`${isCollapsed ? 'my-2 mx-4 border-t border-white/10' : 'my-2 px-6 py-2 border-t border-white/5 mt-4'}`}>
                  {!isCollapsed && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.sidebar.assetsSupport}</span>}
              </div>
          )}
          {features.inventory && <NavItem page="inventory" icon="fa-solid fa-boxes-stacked" label={t.sidebar.inventory} />}
          {features.inventory && <NavItem page="maintenance" icon="fa-solid fa-screwdriver-wrench" label={t.sidebar.maintenance} />}
          {features.lab && <NavItem page="lab" icon="fa-solid fa-computer" label={t.sidebar.lab} />}
          
          {(features.learning || features.gamification) && (
              <div className={`${isCollapsed ? 'my-2 mx-4 border-t border-white/10' : 'my-2 px-6 py-2 border-t border-white/5 mt-4'}`}>
                   {!isCollapsed && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.sidebar.development}</span>}
              </div>
          )}
          {features.learning && <NavItem page="courses" icon="fa-solid fa-graduation-cap" label={t.sidebar.courses} />}
          {features.gamification && <NavItem page="leaderboard" icon="fa-solid fa-trophy" label={t.sidebar.leaderboard} />}
          {features.gamification && <NavItem page="rewards" icon="fa-solid fa-gift" label={t.sidebar.rewards} />}
          
          <div className={`${isCollapsed ? 'my-2 mx-4 border-t border-white/10' : 'my-2 px-6 py-2 border-t border-white/5 mt-4'}`}>
               {!isCollapsed && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.sidebar.myAccount}</span>}
          </div>
          <NavItem page="profile" icon="fa-solid fa-id-card" label={t.sidebar.profile} />

          {isAdmin && (
            <>
              <div className={`${isCollapsed ? 'my-2 mx-4 border-t border-white/10' : 'my-2 px-6 py-2 border-t border-white/5 mt-4'}`}>
                  {!isCollapsed && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.sidebar.advanced}</span>}
              </div>
              {features.finance && <NavItem page="finance" icon="fa-solid fa-sack-dollar" label={t.sidebar.finance} />}
              <NavItem page="relational" icon="fa-solid fa-diagram-project" label={t.sidebar.relational} />
              
              <a 
                href="https://r.loyverse.com/dashboard/" 
                target="_blank" 
                className={`flex items-center gap-4 py-3.5 mx-2 rounded-xl transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                style={{ width: 'calc(100% - 16px)' }}
                title={isCollapsed ? 'Loyverse POS' : undefined}
              >
                  <div className="w-8 flex justify-center text-green-400">
                      <i className="fa-solid fa-store text-lg"></i>
                  </div>
                  {!isCollapsed && (
                      <>
                        <span className="text-sm">Loyverse POS</span>
                        <i className="fa-solid fa-external-link-alt text-[10px] ltr:ml-auto rtl:mr-auto opacity-50"></i>
                      </>
                  )}
              </a>
            </>
          )}
          
          <div className="h-4"></div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5 ${isCollapsed ? 'px-2' : ''}`}>
            <NavItem page="settings" icon="fa-solid fa-gear" label={t.sidebar.settings} />
            
            <div className={`grid gap-2 mt-2 transition-all ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <button 
                    onClick={onResetData} 
                    className="flex items-center justify-center gap-2 text-red-300 bg-red-500/10 hover:bg-red-500/20 py-2 rounded-lg text-xs font-bold transition-colors"
                    title={isCollapsed ? t.common.reset : undefined}
                >
                    <i className="fa-solid fa-rotate-left"></i> {!isCollapsed && t.common.reset}
                </button>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center justify-center gap-2 text-white/70 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-colors"
                    title={isCollapsed ? t.common.logout : undefined}
                >
                    <i className="fa-solid fa-right-from-bracket"></i> {!isCollapsed && t.common.logout}
                </button>
            </div>
            
            {!isCollapsed && (
                <div className="text-center mt-4 opacity-30 hover:opacity-100 transition-opacity cursor-default">
                     <div className="text-[10px] font-serif">{currentOrganization ? currentOrganization.name : 'TechSmart Pro CRM v2.8'}</div>
                     <div className="text-[9px]">Powered by <span className="font-bold text-yellow-500">Basma Mabroka</span></div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};
