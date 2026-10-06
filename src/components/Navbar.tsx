import React from 'react';
import { 
  GraduationCap, 
  Globe, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  Users,
  LayoutDashboard,
  HeartHandshake,
  Clock,
  Award,
  Calendar,
  CreditCard,
  Utensils,
  Bus,
  Building2,
  LogOut,
  UserCheck,
  Layers
} from 'lucide-react';
import { Language, UserRole, Parent, Teacher, TabType, AuthUser } from '../types';
import { useTranslation } from '../translations';

export interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  selectedParent?: Parent;
  parents: Parent[];
  onSelectParent?: (parent: Parent) => void;
  selectedTeacher?: Teacher;
  teachers?: Teacher[];
  onSelectTeacher?: (teacher: Teacher) => void;
  onOpenQuickBroadcast?: () => void;
  unreadWhatsAppCount?: number;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  activeSchoolName?: string;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  role,
  onChangeRole,
  selectedParent,
  parents,
  onSelectParent,
  selectedTeacher,
  teachers = [],
  onSelectTeacher,
  onOpenQuickBroadcast,
  unreadWhatsAppCount = 0,
  activeTab = 'overview',
  onTabChange,
  activeSchoolName,
  currentUser,
  onLogout
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const adminTabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'tunisia_schools', label: t.tunisia_schools || (isRtl ? 'المدارس في تونس' : 'Écoles en Tunisie'), icon: Building2 },
    { id: 'students', label: t.students, icon: Users },
    { id: 'classes', label: t.classes || (isRtl ? 'الأقسام' : 'Classes'), icon: Layers },
    { id: 'parents', label: t.parents, icon: HeartHandshake },
    { id: 'teachers', label: t.teachers, icon: GraduationCap },
    { id: 'attendance', label: t.attendance, icon: Clock },
    { id: 'grades', label: t.grades, icon: Award },
    { id: 'timetable', label: t.timetable, icon: Calendar },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'canteen', label: t.canteen, icon: Utensils },
    { id: 'transport', label: t.transport, icon: Bus },
    { id: 'whatsapp_center', label: t.whatsapp_center, icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  {t.appName}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                  {isRtl ? 'ثنائي اللغة' : 'Bilingue FR/AR'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">{activeSchoolName || t.schoolName}</span>
                <span>•</span>
                <span>{t.activeTerm}</span>
              </p>
            </div>
          </div>

          {/* Center Mode Switcher (Admin vs Teacher vs Parent App) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
            <button
              id="switch-to-admin-role-btn"
              onClick={() => onChangeRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${role === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{t.adminRole}</span>
            </button>
            <button
              id="switch-to-teacher-role-btn"
              onClick={() => onChangeRole('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${role === 'teacher' ? 'text-white' : 'text-slate-400'}`} />
              <span>{t.teacherRole || (isRtl ? 'المدرسون' : 'Enseignants')}</span>
            </button>
            <button
              id="switch-to-parent-role-btn"
              onClick={() => onChangeRole('parent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'parent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className={`w-3.5 h-3.5 ${role === 'parent' ? 'text-white' : 'text-slate-400'}`} />
              <span>{t.parentRole}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If in parent mode, let user switch parent persona */}
            {role === 'parent' && selectedParent && (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <label className="sr-only">Parent</label>
                <select
                  id="select-parent-persona"
                  value={selectedParent.id}
                  onChange={(e) => {
                    const found = parents.find(p => p.id === e.target.value);
                    if (found && onSelectParent) onSelectParent(found);
                  }}
                  className="bg-transparent text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer pr-1"
                >
                  {parents.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-800">
                      {isRtl ? p.nameAr : p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If in teacher mode, let user switch teacher persona */}
            {role === 'teacher' && selectedTeacher && (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <label className="sr-only">Enseignant</label>
                <select
                  id="select-teacher-persona"
                  value={selectedTeacher.id}
                  onChange={(e) => {
                    const found = teachers.find(tch => tch.id === e.target.value);
                    if (found && onSelectTeacher) onSelectTeacher(found);
                  }}
                  className="bg-transparent text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer pr-1"
                >
                  {teachers.map(tch => (
                    <option key={tch.id} value={tch.id} className="text-slate-800">
                      {isRtl ? tch.nameAr : tch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick WhatsApp Broadcast Button */}
            {role === 'admin' && onOpenQuickBroadcast && (
              <button
                id="quick-whatsapp-broadcast-btn"
                onClick={onOpenQuickBroadcast}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                title={t.quickBroadcast}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
                {unreadWhatsAppCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center">
                    {unreadWhatsAppCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Toggle Button */}
            <button
              id="toggle-language-btn"
              onClick={onToggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.switchLanguage}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {lang === 'fr' ? 'AR' : 'FR'}
              </span>
            </button>

            {/* Authenticated User Badge & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : currentUser.role === 'teacher' ? (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span className="font-bold text-slate-800 max-w-[100px] sm:max-w-[150px] truncate">
                  {isRtl ? (currentUser.nameAr || currentUser.name) : currentUser.name}
                </span>
                {onLogout && (
                  <button
                    id="navbar-logout-btn"
                    onClick={onLogout}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={isRtl ? 'تسجيل الخروج' : 'Se déconnecter'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Mode Switcher Icon */}
            <div className="flex md:hidden">
              <button
                id="mobile-switch-role-btn"
                onClick={() => onChangeRole(role === 'admin' ? 'parent' : 'admin')}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  role === 'parent' 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
                title={role === 'admin' ? t.parentRole : t.adminRole}
              >
                {role === 'admin' ? <Smartphone className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        {role === 'admin' && onTabChange && (
          <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {adminTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
