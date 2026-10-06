import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Globe, 
  GraduationCap, 
  Users, 
  Sparkles, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Language, Parent, Student, Teacher, TunisianSchool, AuthUser, UserRole } from '../types';

export interface AuthPortalProps {
  schools?: TunisianSchool[];
  activeSchoolId?: string;
  parents?: Parent[];
  teachers?: Teacher[];
  students?: Student[];
  lang: Language;
  onToggleLang: () => void;
  onLoginSuccess: (user: AuthUser, parentData?: Parent, teacherData?: Teacher) => void;
  initialRole?: UserRole;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  schools = [],
  activeSchoolId = '',
  parents = [],
  teachers = [],
  students = [],
  lang,
  onToggleLang,
  onLoginSuccess,
  initialRole = 'admin'
}) => {
  const isRtl = lang === 'ar';

  const fallbackSchool: TunisianSchool = {
    id: 'sch-carthage',
    name: 'Groupe Scolaire International Carthage',
    nameAr: 'المجمع المدرسي الدولي قرطاج',
    type: 'complexe',
    category: 'prive',
    governorate: 'Tunis',
    governorateAr: 'تونس',
    delegation: 'Carthage',
    delegationAr: 'قرطاج',
    city: 'Carthage',
    cityAr: 'قرطاج',
    address: '22 Avenue de la République, Carthage',
    addressAr: '22 شارع الجمهورية، قرطاج',
    phone: '+216 71 732 450',
    email: 'contact@carthage-ecoles.tn',
    directorName: 'M. Hichem Ben Salem',
    directorNameAr: 'السيد هشام بن سالم',
    studentCount: 680,
    classesCount: 26,
    successRate: 98.4,
    isPartner: true,
    motto: 'Excellence Pédagogique',
    mottoAr: 'التميز البيداغوجي'
  };

  const activeSchool = (schools && schools.length > 0)
    ? (schools.find(s => s.id === activeSchoolId) || schools[0])
    : fallbackSchool;

  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);

  // Admin login form state
  const [adminIdentifier, setAdminIdentifier] = useState('admin@carthage-ecoles.tn');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Teacher login form state
  const [teacherIdentifier, setTeacherIdentifier] = useState('b.slama@carthage-ecoles.tn');
  const [teacherPassword, setTeacherPassword] = useState('prof123');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Parent login form state
  const [parentIdentifier, setParentIdentifier] = useState('k.benromdhane@gmail.com');
  const [parentPassword, setParentPassword] = useState('parent123');
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [parentError, setParentError] = useState<string | null>(null);

  // Admin Login Handler
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const cleanId = adminIdentifier.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    const isMasterAdmin = (cleanId === 'admin@carthage-ecoles.tn' || cleanId === 'admin' || cleanId === 'direction') && cleanPass === 'admin123';
    const isSchoolMatch = activeSchool && (cleanId === activeSchool.email.toLowerCase() || cleanId === activeSchool.phone.replace(/[^0-9]/g, '')) && cleanPass === 'admin123';

    if (isMasterAdmin || isSchoolMatch) {
      onLoginSuccess({
        role: 'admin',
        id: 'usr-admin-1',
        name: activeSchool ? activeSchool.directorName : 'M. Hichem Ben Salem (Direction)',
        nameAr: activeSchool ? activeSchool.directorNameAr : 'السيد هشام بن سالم',
        email: cleanId.includes('@') ? cleanId : activeSchool.email,
        schoolId: activeSchool.id,
        phone: activeSchool.phone
      });
    } else {
      setAdminError(
        isRtl 
          ? 'خطأ في المعرف أو كلمة المرور. جرب: admin@carthage-ecoles.tn / admin123' 
          : 'Identifiant ou mot de passe incorrect. Essayez : admin@carthage-ecoles.tn / admin123'
      );
    }
  };

  // Teacher Login Handler
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);
    const cleanId = teacherIdentifier.trim().toLowerCase();
    const cleanPhone = teacherIdentifier.replace(/[^0-9]/g, '');
    const cleanPass = teacherPassword.trim();

    const matchedTeacher = teachers.find(t => {
      const emailMatches = t.email.toLowerCase() === cleanId;
      const phoneDigits = t.phone.replace(/[^0-9]/g, '');
      const phoneMatches = phoneDigits.includes(cleanPhone) || (cleanPhone.length >= 8 && phoneDigits.endsWith(cleanPhone));
      return emailMatches || phoneMatches;
    });

    if (matchedTeacher) {
      const expectedPassword = matchedTeacher.password || 'prof123';
      if (cleanPass === expectedPassword || cleanPass === 'prof123') {
        onLoginSuccess({
          role: 'teacher',
          id: matchedTeacher.id,
          name: matchedTeacher.name,
          nameAr: matchedTeacher.nameAr,
          email: matchedTeacher.email,
          phone: matchedTeacher.phone,
          teacherId: matchedTeacher.id,
          schoolId: activeSchool.id
        }, undefined, matchedTeacher);
      } else {
        setTeacherError(
          isRtl 
            ? 'كلمة المرور غير صحيحة لحساب هذا المدرس. (كلمة السر للتجربة: prof123)' 
            : 'Mot de passe incorrect pour ce compte enseignant. (Mot de passe démo : prof123)'
        );
      }
    } else {
      setTeacherError(
        isRtl 
          ? 'لا يوجد حساب مدرس بهذا البريد أو الهاتف. اختر مدرساً أدناه.' 
          : 'Aucun compte enseignant associé à cet email ou téléphone. Choisissez un enseignant ci-dessous.'
      );
    }
  };

  // Quick Fill for Teacher Demo
  const quickLoginAsTeacher = (t: Teacher) => {
    setTeacherIdentifier(t.email);
    setTeacherPassword(t.password || 'prof123');
    setTeacherError(null);
    onLoginSuccess({
      role: 'teacher',
      id: t.id,
      name: t.name,
      nameAr: t.nameAr,
      email: t.email,
      phone: t.phone,
      teacherId: t.id,
      schoolId: activeSchool.id
    }, undefined, t);
  };

  // Parent Login Handler
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParentError(null);
    const cleanId = parentIdentifier.trim().toLowerCase();
    const cleanPhone = parentIdentifier.replace(/[^0-9]/g, '');
    const cleanPass = parentPassword.trim();

    const matchedParent = parents.find(p => {
      const emailMatches = p.email.toLowerCase() === cleanId;
      const phoneDigits = p.phone.replace(/[^0-9]/g, '');
      const phoneMatches = phoneDigits.includes(cleanPhone) || (cleanPhone.length >= 8 && phoneDigits.endsWith(cleanPhone));
      return emailMatches || phoneMatches;
    });

    if (matchedParent) {
      const expectedPassword = matchedParent.password || 'parent123';
      if (cleanPass === expectedPassword || cleanPass === 'parent123') {
        onLoginSuccess({
          role: 'parent',
          id: matchedParent.id,
          name: matchedParent.name,
          nameAr: matchedParent.nameAr,
          email: matchedParent.email,
          phone: matchedParent.phone,
          parentId: matchedParent.id,
          schoolId: activeSchool.id
        }, matchedParent);
      } else {
        setParentError(
          isRtl 
            ? 'كلمة المرور غير صحيحة لحساب هذا الولي. (كلمة السر للتجربة: parent123)' 
            : 'Mot de passe incorrect pour ce compte parent. (Mot de passe démo : parent123)'
        );
      }
    } else {
      setParentError(
        isRtl 
          ? 'لا يوجد حساب ولي مرتبط بهذا البريد أو الهاتف. اختر ولياً أدناه.' 
          : 'Aucun compte parent associé à cet email ou téléphone. Choisissez un parent dans la liste ci-dessous.'
      );
    }
  };

  // Quick Fill for Parent Demo
  const quickLoginAsParent = (p: Parent) => {
    setParentIdentifier(p.email);
    setParentPassword(p.password || 'parent123');
    setParentError(null);
    onLoginSuccess({
      role: 'parent',
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      email: p.email,
      phone: p.phone,
      parentId: p.id,
      schoolId: activeSchool.id
    }, p);
  };

  // Quick Fill for Admin Demo
  const quickLoginAsAdmin = () => {
    setAdminIdentifier('admin@carthage-ecoles.tn');
    setAdminPassword('admin123');
    setAdminError(null);
    onLoginSuccess({
      role: 'admin',
      id: 'usr-admin-1',
      name: activeSchool ? activeSchool.directorName : 'M. Hichem Ben Salem (Direction)',
      nameAr: activeSchool ? activeSchool.directorNameAr : 'السيد هشام بن سالم',
      email: 'admin@carthage-ecoles.tn',
      schoolId: activeSchool.id,
      phone: activeSchool.phone
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Brand & Language Toggle */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                MySchoolTN
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🇹🇳 {isRtl ? 'تونس' : 'Tunisie'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isRtl ? 'بوابة الدخول الموحدة للمؤسسات التربوية والأولياء' : 'Portail d\'accès sécurisé Établissements & Espace Parents'}
            </p>
          </div>
        </div>

        <button
          id="auth-toggle-lang-btn"
          type="button"
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'fr' ? 'عربي' : 'Français'}</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Active School Badge */}
            <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800 truncate">
                  {isRtl ? activeSchool.nameAr : activeSchool.name}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {isRtl ? activeSchool.governorateAr : activeSchool.governorate}
              </span>
            </div>

            {/* Space Switcher Tabs */}
            <div className="grid grid-cols-3 p-2 bg-slate-100/80 border-b border-slate-200/80 gap-1">
              <button
                id="auth-tab-admin-btn"
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setAdminError(null);
                  setTeacherError(null);
                  setParentError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">{isRtl ? 'الإدارة' : 'Établissement'}</span>
              </button>

              <button
                id="auth-tab-teacher-btn"
                type="button"
                onClick={() => {
                  setActiveTab('teacher');
                  setAdminError(null);
                  setTeacherError(null);
                  setParentError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeTab === 'teacher' ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{isRtl ? 'المدرسون' : 'Enseignants'}</span>
              </button>

              <button
                id="auth-tab-parent-btn"
                type="button"
                onClick={() => {
                  setActiveTab('parent');
                  setAdminError(null);
                  setTeacherError(null);
                  setParentError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'parent'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'parent' ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{isRtl ? 'الأولياء' : 'Parents'}</span>
              </button>
            </div>

            {/* TAB 1: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'دخول فضاء إدارة المؤسسة' : 'Connexion Espace Établissement'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRtl 
                      ? 'الوصول إلى لوحة التحكم، بطاقات الأعداد، الغيابات، جداول الأوقات ومركز واتساب.' 
                      : 'Accédez à la gestion scolaire, aux bulletins, absences, emplois du temps et centre WhatsApp.'}
                  </p>
                </div>

                {adminError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isRtl ? 'المعرف أو البريد الإلكتروني' : 'Identifiant ou email établissement'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-login-input"
                        type="text"
                        value={adminIdentifier}
                        onChange={(e) => setAdminIdentifier(e.target.value)}
                        placeholder="admin@carthage-ecoles.tn"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isRtl ? 'كلمة المرور' : 'Mot de passe'}
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Démo : admin123)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-password-input"
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="admin-submit-login-btn"
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول كإدارة' : 'Se connecter établissement'}</span>
                  </button>
                </form>

                {/* Quick Demo Fill Card */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isRtl ? 'حساب تجريبي للإدارة' : 'Accès de test administrateur'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        admin@carthage-ecoles.tn / admin123
                      </p>
                    </div>
                    <button
                      id="quick-admin-login-btn"
                      type="button"
                      onClick={quickLoginAsAdmin}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {isRtl ? 'دخول فوري' : 'Connexion directe'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEACHER LOGIN */}
            {activeTab === 'teacher' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'دخول فضاء المدرس' : 'Connexion Espace Enseignant'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRtl 
                      ? 'تسجيل مناداة الحضور، إسناد التمارين المنزلية ورصد الأعداد المتزامنة فورياً.' 
                      : 'Faire l\'appel de classe, assigner des devoirs à la maison et saisir les notes synchronisées.'}
                  </p>
                </div>

                {teacherError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{teacherError}</span>
                  </div>
                )}

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isRtl ? 'البريد الإلكتروني أو الهاتف للمدرس' : 'Email ou téléphone de l\'enseignant'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="teacher-login-input"
                        type="text"
                        value={teacherIdentifier}
                        onChange={(e) => setTeacherIdentifier(e.target.value)}
                        placeholder="b.slama@carthage-ecoles.tn"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isRtl ? 'كلمة المرور' : 'Mot de passe'}
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Démo : prof123)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="teacher-password-input"
                        type={showTeacherPassword ? 'text' : 'password'}
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="teacher-submit-login-btn"
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول كمدرس' : 'Se connecter espace enseignant'}</span>
                  </button>
                </form>

                {/* Quick Teacher Selectors */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {isRtl ? 'حسابات المدرسين للتجربة :' : 'Comptes enseignants démo (cliquez pour tester) :'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">mdp: prof123</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teachers.map(t => (
                      <button
                        key={t.id}
                        id={`quick-teacher-${t.id}-btn`}
                        type="button"
                        onClick={() => quickLoginAsTeacher(t)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all cursor-pointer group flex items-start justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={t.photo} 
                            alt={t.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                              {isRtl ? t.nameAr : t.name}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">
                              {isRtl ? t.subjectAr : t.subject}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-md shadow-2xs shrink-0">
                          {isRtl ? 'تجربة' : 'Tester'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARENT LOGIN */}
            {activeTab === 'parent' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    {isRtl ? 'دخول فضاء أولياء التلاميذ' : 'Connexion Espace Parents d\'élèves'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRtl 
                      ? 'متابعة أعداد الفروض، الحضور والغيابات، الواجبات المنزلية، المعاليم والنقل لأبنائكم.' 
                      : 'Suivez les notes, devoirs de contrôle, présences, frais scolaires et bus de vos enfants.'}
                  </p>
                </div>

                {parentError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{parentError}</span>
                  </div>
                )}

                <form onSubmit={handleParentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isRtl ? 'البريد أو رقم الهاتف للولي (+216)' : 'Email ou n° de téléphone du parent (+216)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="parent-login-input"
                        type="text"
                        value={parentIdentifier}
                        onChange={(e) => setParentIdentifier(e.target.value)}
                        placeholder="k.benromdhane@gmail.com ou +216 98 123 456"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isRtl ? 'كلمة المرور' : 'Mot de passe'}
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Démo : parent123)
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="parent-password-input"
                        type={showParentPassword ? 'text' : 'password'}
                        value={parentPassword}
                        onChange={(e) => setParentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParentPassword(!showParentPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="parent-submit-login-btn"
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول كولي أمر' : 'Se connecter espace parent'}</span>
                  </button>
                </form>

                {/* Quick Parent Selectors */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {isRtl ? 'حسابات الأولياء للتجربة :' : 'Comptes parents démo (cliquez pour tester) :'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">mdp: parent123</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parents.map(p => {
                      const pChildren = students.filter(s => p.childrenIds.includes(s.id) || s.parentId === p.id);
                      const childrenText = pChildren.map(c => isRtl ? c.firstNameAr : c.firstName).join(', ');
                      return (
                        <button
                          key={p.id}
                          id={`quick-parent-${p.id}-btn`}
                          type="button"
                          onClick={() => quickLoginAsParent(p)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all cursor-pointer group flex items-start justify-between"
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isRtl ? p.nameAr : p.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {p.relationship === 'Père' ? (isRtl ? 'أب' : 'Père') : (isRtl ? 'أم' : 'Mère')} • {childrenText || '1 élève'}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-md shadow-2xs">
                            {isRtl ? 'تجربة' : 'Tester'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>
          {isRtl 
            ? 'الجمهورية التونسية • المنظومة التربوية MySchoolTN • تواصل رقمي وشفافية كاملة مع الأولياء' 
            : 'République Tunisienne • Système Éducatif MySchoolTN & Liaison Parents'}
        </p>
      </footer>
    </div>
  );
};
