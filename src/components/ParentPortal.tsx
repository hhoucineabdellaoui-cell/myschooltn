import React, { useState, useMemo, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  Clock, 
  CreditCard, 
  Utensils, 
  Bus, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  ShieldCheck,
  MapPin,
  Flame,
  UserCheck,
  UserPlus,
  Search,
  Link2,
  Printer,
  XCircle,
  AlertTriangle,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { 
  Parent, 
  Student, 
  GradeRecord, 
  AttendanceRecord, 
  PaymentRecord, 
  TimetableSlot, 
  CanteenDay, 
  TransportRoute, 
  Language,
  HomeworkItem
} from '../types';
import { useTranslation } from '../translations';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface ParentPortalProps {
  currentParent: Parent;
  allParents?: Parent[];
  students: Student[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  timetable: TimetableSlot[];
  canteenMenu: CanteenDay[];
  transportRoutes: TransportRoute[];
  homework?: HomeworkItem[];
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
  onLinkChild?: (studentId: string, parentId: string) => void;
  onUpdateAttendance?: (updated: AttendanceRecord) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  currentParent,
  allParents = [],
  students,
  grades,
  attendance,
  payments,
  timetable,
  canteenMenu,
  transportRoutes,
  homework = [],
  lang,
  onOpenWhatsApp,
  onLinkChild,
  onUpdateAttendance
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  // State for linking a new child
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkingSearch, setLinkingSearch] = useState('');
  const [selectedStudentToLink, setSelectedStudentToLink] = useState<string>('');

  // Find all children for this parent using bidirectional checks
  const myChildren = useMemo(() => {
    return students.filter(s => {
      // 1. Direct parentId match
      if (s.parentId === currentParent.id) return true;
      // 2. Parent's childrenIds includes student.id
      if (Array.isArray(currentParent.childrenIds) && currentParent.childrenIds.includes(s.id)) return true;
      // 3. Match via allParents if student has parent with same phone or email
      if (allParents && allParents.length > 0 && s.parentId) {
        const studentParent = allParents.find(p => p.id === s.parentId);
        if (studentParent) {
          const p1 = (studentParent.phone || '').replace(/[^0-9]/g, '');
          const p2 = (currentParent.phone || '').replace(/[^0-9]/g, '');
          if (p1 && p2 && (p1 === p2 || (p1.length >= 8 && p2.length >= 8 && (p1.endsWith(p2) || p2.endsWith(p1))))) {
            return true;
          }
          if (studentParent.email && currentParent.email && studentParent.email.toLowerCase() === currentParent.email.toLowerCase()) {
            return true;
          }
        }
      }
      // 4. Fallback match by last name if currentParent has no children yet
      if ((!currentParent.childrenIds || currentParent.childrenIds.length === 0) && s.lastName && currentParent.name) {
        const cleanParent = currentParent.name.toLowerCase().trim();
        const cleanStudent = s.lastName.toLowerCase().trim();
        if (cleanParent.includes(cleanStudent) || cleanStudent.includes(cleanParent)) {
          return true;
        }
      }
      return false;
    });
  }, [students, currentParent, allParents]);

  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'today' | 'homework' | 'grades' | 'attendance' | 'schedule' | 'fees'>('today');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Synchronize selectedChildId when children change or when parent changes
  useEffect(() => {
    if (!myChildren.some(c => c.id === selectedChildId) && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].id);
    }
  }, [myChildren, selectedChildId]);

  const handleConfirmLinkChild = (stuId: string) => {
    if (!stuId || !onLinkChild) return;
    onLinkChild(stuId, currentParent.id);
    setSelectedChildId(stuId);
    setIsLinkingModalOpen(false);
    setSelectedStudentToLink('');
  };

  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];

  // Candidates to link
  const availableStudentsToLink = useMemo(() => {
    return students.filter(s => {
      const isAlreadyLinked = myChildren.some(c => c.id === s.id);
      if (isAlreadyLinked) return false;
      if (!linkingSearch.trim()) return true;
      const search = linkingSearch.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.firstNameAr.includes(search) ||
        s.lastNameAr.includes(search) ||
        s.className.toLowerCase().includes(search)
      );
    });
  }, [students, myChildren, linkingSearch]);

  if (!selectedChild) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-800/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20">
                {currentParent.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  {t.parentPortalTitle}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {isRtl ? `مرحبا، ${currentParent.nameAr}` : `Bienvenue, ${currentParent.name}`}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Card with Direct Link Action */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? 'لم يتم ربط أي تلميذ بحسابك بعد' : 'Aucun élève n\'est encore associé à votre compte'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isRtl 
                ? 'حدد ابنك أو ابنتك من قائمة تلاميذ المؤسسة لربط الملف مباشرة بحسابك والاطلاع على الأعداد وجدول الأوقات والواجبات.'
                : 'Sélectionnez votre enfant parmi les élèves de l\'établissement pour l\'associer immédiatement à votre compte et consulter ses notes, son emploi du temps et son suivi.'}
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-start space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Link2 className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? 'حدد تلميذاً لربطه بالحساب :' : 'Sélectionnez votre enfant pour lier le dossier :'}</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={linkingSearch}
                onChange={e => setLinkingSearch(e.target.value)}
                placeholder={isRtl ? 'بحث بالاسم أو اللقب أو القسم...' : 'Rechercher par prénom, nom ou classe...'}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {availableStudentsToLink.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">
                  {isRtl ? 'لم يتم العثور على أي تلميذ' : 'Aucun élève trouvé'}
                </p>
              ) : (
                availableStudentsToLink.map(stu => {
                  const sName = isRtl ? `${stu.firstNameAr} ${stu.lastNameAr}` : `${stu.firstName} ${stu.lastName}`;
                  const sClass = isRtl ? stu.classNameAr : stu.className;
                  const isSelected = selectedStudentToLink === stu.id;
                  return (
                    <div
                      key={stu.id}
                      onClick={() => setSelectedStudentToLink(stu.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/80 shadow-2xs' 
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={stu.photo} alt={sName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sName}</div>
                          <div className="text-[10px] text-slate-500">{sClass}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmLinkChild(stu.id);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'ربط' : 'Rattacher'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const childName = isRtl ? `${selectedChild.firstNameAr} ${selectedChild.lastNameAr}` : `${selectedChild.firstName} ${selectedChild.lastName}`;
  const childClass = isRtl ? selectedChild.classNameAr : selectedChild.className;

  // Filter child-specific records
  const childGrades = grades.filter(g => g.studentId === selectedChild.id);
  const childAttendance = attendance.filter(a => a.studentId === selectedChild.id);
  const childPayments = payments.filter(p => p.studentId === selectedChild.id);
  const childTimetable = timetable.filter(slot => slot.classId === selectedChild.classId);
  const childRoute = transportRoutes.find(r => r.id === selectedChild.transportRouteId);
  const childHomework = (homework || []).filter(h => h.classId === selectedChild.classId || h.className === selectedChild.className);

  const todayMenu = canteenMenu.find(m => m.date === '2025-02-18') || canteenMenu[1];

  // Live Attendance Synchronization
  const todayRecord = (() => {
    if (!selectedChild) return null;
    const actualToday = new Date().toISOString().split('T')[0];
    const forActual = childAttendance.find(a => a.date === actualToday);
    if (forActual) return forActual;
    const forDemo = childAttendance.find(a => a.date === '2025-02-18');
    if (forDemo) return forDemo;
    if (childAttendance.length > 0) {
      return [...childAttendance].sort((a, b) => b.date.localeCompare(a.date))[0];
    }
    return null;
  })();

  const attendanceStats = (() => {
    const total = childAttendance.length;
    const absent = childAttendance.filter(a => a.status === 'absent').length;
    const late = childAttendance.filter(a => a.status === 'late').length;
    const excused = childAttendance.filter(a => a.status === 'excused' || a.isJustified).length;
    const rate = total > 0 ? Math.max(0, Math.round(((total - absent) / total) * 100)) : 100;
    return { total, absent, late, excused, rate };
  })();

  // Justification modal state
  const [justifyingRecord, setJustifyingRecord] = useState<AttendanceRecord | null>(null);
  const [justificationReason, setJustificationReason] = useState<string>('Certificat médical');
  const [justificationReasonAr, setJustificationReasonAr] = useState<string>('شهادة طبية');
  const [justificationDetails, setJustificationDetails] = useState<string>('');
  const [justificationNotifyWhatsApp, setJustificationNotifyWhatsApp] = useState<boolean>(true);
  const [justificationToast, setJustificationToast] = useState<string | null>(null);

  const handleContactVieScolaire = (rec?: AttendanceRecord | null) => {
    const r = rec || todayRecord;
    const statusLabel = r?.status === 'late'
      ? (isRtl ? 'التأخير المسجل' : 'le retard constaté')
      : (isRtl ? 'الغياب المسجل' : 'l\'absence signalée');

    const msg = isRtl
      ? `مرحبا، أنا ولي أمر التلميذ(ة) ${childName} (القسم: ${childClass}). أتواصل معكم بخصوص ${statusLabel} بتاريخ ${r ? r.date : 'اليوم'} (${r?.timeSlot || ''})...`
      : `Bonjour, je suis le parent de ${childName} (${childClass}). Je vous contacte au sujet de ${statusLabel} du ${r ? r.date : 'jour'} (${r?.timeSlot || ''})...`;

    onOpenWhatsApp(isRtl ? 'إدارة شؤون التلاميذ' : 'Vie Scolaire & Assiduité', '+21671234567', msg, childName);
  };

  const handleSaveJustification = () => {
    if (!justifyingRecord || !onUpdateAttendance) return;

    const updated: AttendanceRecord = {
      ...justifyingRecord,
      isJustified: true,
      status: 'excused',
      reason: justificationReason + (justificationDetails ? ` - ${justificationDetails}` : ''),
      reasonAr: justificationReasonAr + (justificationDetails ? ` - ${justificationDetails}` : ''),
      parentNote: justificationDetails || justificationReason,
      parentJustifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateAttendance(updated);

    if (justificationNotifyWhatsApp) {
      const msg = isRtl
        ? `مرحبا، أنا ولي أمر التلميذ(ة) ${childName}. لقد قمت بتقديم تبرير غياب لتاريخ ${justifyingRecord.date} (${justifyingRecord.timeSlot}): ${justificationReasonAr} - ${justificationDetails}`
        : `Bonjour, je suis le parent de ${childName}. J'ai transmis un justificatif d'absence pour la journée du ${justifyingRecord.date} (${justifyingRecord.timeSlot}) : ${justificationReason} - ${justificationDetails}`;

      onOpenWhatsApp(isRtl ? 'الإدارة والرقابة العامة' : 'Administration & Vie Scolaire', '+21671234567', msg, childName);
    }

    setJustifyingRecord(null);
    setJustificationDetails('');
    setJustificationToast(
      isRtl 
        ? `تم إرسال تبرير الغياب بنجاح ومزامنته مباشرة مع إدارة المدرسة!`
        : `✓ Justificatif transmis avec succès et synchronisé en direct avec la Vie Scolaire !`
    );
    setTimeout(() => setJustificationToast(null), 4500);
  };

  const handleContactDirector = () => {
    const msg = isRtl
      ? `مرحبا سيدي المدير، أنا ولي أمر التلميذ(ة) ${childName} (القسم: ${childClass}). أود التواصل بخصوص...`
      : `Bonjour M. le Directeur, je suis le parent de ${childName} (${childClass}). Je souhaiterais échanger concernant...`;
    onOpenWhatsApp(isRtl ? 'إدارة المؤسسة' : 'Direction de l\'établissement', '+21671234567', msg, childName);
  };

  const handleContactMainTeacher = () => {
    const msg = isRtl
      ? `مرحبا بإدارة المدرسة، بصفتي ولي أمر التلميذ(ة) ${childName} (القسم: ${childClass})، أرجو التفضل بالتنسيق مع الأستاذ الرئيسي للتلميذ بخصوص المتابعة البيداغوجية.`
      : `Bonjour à l'administration scolaire, en tant que parent de ${childName} (${childClass}), je sollicite par votre intermédiaire un échange avec le Professeur Principal concernant son suivi pédagogique.`;
    onOpenWhatsApp(isRtl ? 'إدارة المدرسة (وساطة)' : 'Administration Scolaire (Médiation)', '+21671234567', msg, childName);
  };

  const handleContactBusDriver = () => {
    if (!childRoute) return;
    const msg = isRtl
      ? `مرحبا عم ${childRoute.driverNameAr}، بخصوص التلميذ(ة) ${childName} على الخط ${childRoute.code}...`
      : `Bonjour ${childRoute.driverName}, concernant la prise en charge de ${childName} sur le bus ${childRoute.code}...`;
    onOpenWhatsApp(isRtl ? childRoute.driverNameAr : childRoute.driverName, childRoute.driverPhone, msg, childName);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Mobile-Style App Top Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-800/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                {t.parentPortalTitle}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isRtl ? `مرحبا، ${currentParent.nameAr}` : `Bienvenue, ${currentParent.name}`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isRtl ? 'حساب متصل' : 'Portail Parent Connecté'}
            </span>
          </div>
        </div>

        {/* Child Selector Carousel / Chips */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="text-xs text-emerald-200 font-bold mb-2">
            {t.selectChild} :
          </div>
          <div className="flex flex-wrap gap-2.5">
            {myChildren.map(child => {
              const isSelected = child.id === selectedChild.id;
              const name = isRtl ? `${child.firstNameAr} ${child.lastNameAr}` : `${child.firstName} ${child.lastName}`;
              const cls = isRtl ? child.classNameAr : child.className;
              return (
                <button
                  key={child.id}
                  id={`select-child-${child.id}-btn`}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-emerald-900 shadow-md scale-105'
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                  }`}
                >
                  <img src={child.photo} alt={name} className="w-7 h-7 rounded-xl object-cover" />
                  <div className="text-start">
                    <div className="leading-tight">{name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-emerald-700' : 'text-emerald-200'}`}>
                      {cls}
                    </div>
                  </div>
                </button>
              );
            })}
            {onLinkChild && (
              <button
                type="button"
                onClick={() => setIsLinkingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer shadow-xs"
                title={isRtl ? 'ربط ابن آخر بالحساب' : 'Rattacher un autre enfant'}
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isRtl ? '+ ربط ابن' : '+ Rattacher enfant'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Justification Toast */}
      {justificationToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{justificationToast}</span>
          </div>
          <button 
            onClick={() => setJustificationToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Immediate Attention Banner if Child is Absent or Late */}
      {todayRecord && (todayRecord.status === 'absent' || todayRecord.status === 'late') && (
        <div className={`rounded-2xl p-4 sm:p-5 border-2 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 ${
          todayRecord.status === 'absent' 
            ? 'bg-rose-50/95 border-rose-300 text-rose-950'
            : 'bg-amber-50/95 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              todayRecord.status === 'absent' 
                ? 'bg-rose-100 text-rose-600' 
                : 'bg-amber-100 text-amber-600'
            }`}>
              {todayRecord.status === 'absent' ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <Clock className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base">
                  {todayRecord.status === 'absent' 
                    ? (isRtl ? '⚠️ تنبيه غياب مسجل اليوم' : '⚠️ Alerte d\'absence signalée aujourd\'hui')
                    : (isRtl ? '⏰ تنبيه تأخير مسجل اليوم' : '⏰ Alerte de retard signalé aujourd\'hui')}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                  todayRecord.isJustified
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-200 text-rose-900 border-rose-300'
                }`}>
                  {todayRecord.isJustified 
                    ? (isRtl ? '✓ مبرر' : '✓ Justifié') 
                    : (isRtl ? 'غير مبرر بعد' : 'Non régularisé')}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {todayRecord.date} • {todayRecord.timeSlot}
                  {todayRecord.delayMinutes ? ` (+${todayRecord.delayMinutes} min)` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-700 max-w-xl">
                {todayRecord.status === 'absent'
                  ? (isRtl
                      ? `سجلت المؤسسة غياب التلميذ(ة) ${childName}. بإمكانكم إرسال تبرير عبر التطبيق أو التواصل مع الإدارة.`
                      : `L'établissement a enregistré l'absence de ${childName}. Vous pouvez transmettre un justificatif en ligne ou échanger avec la vie scolaire.`)
                  : (isRtl
                      ? `وصل التلميذ(ة) ${childName} متأخراً(ة) هذا الصباح${todayRecord.delayMinutes ? ` بمقدار ${todayRecord.delayMinutes} دقيقة` : ''}.`
                      : `Votre enfant ${childName} est arrivé(e) en retard en classe${todayRecord.delayMinutes ? ` (+${todayRecord.delayMinutes} minutes)` : ''}.`)}
              </p>
              {todayRecord.reason && (
                <div className="text-[11px] font-medium text-slate-600 bg-white/70 px-2.5 py-1 rounded-lg inline-block border border-slate-200">
                  <span className="font-bold">{isRtl ? 'السبب : ' : 'Motif : '}</span>
                  <span>{isRtl ? (todayRecord.reasonAr || todayRecord.reason) : todayRecord.reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
            {!todayRecord.isJustified && (
              <button
                id="parent-banner-justify-btn"
                onClick={() => setJustifyingRecord(todayRecord)}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{isRtl ? 'تقديم تبرير' : 'Justifier'}</span>
              </button>
            )}
            <button
              id="parent-banner-whatsapp-btn"
              onClick={() => handleContactVieScolaire(todayRecord)}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'واتساب الإدارة' : 'WhatsApp Vie Scolaire'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <button
          id="parent-tab-today"
          onClick={() => setActiveTab('today')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.todayAtSchool}</span>
        </button>
        <button
          id="parent-tab-homework"
          onClick={() => setActiveTab('homework')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'homework'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isRtl ? 'التمارين المنزلية' : 'Devoirs maison'}</span>
          {childHomework.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === 'homework' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {childHomework.length}
            </span>
          )}
        </button>
        <button
          id="parent-tab-grades"
          onClick={() => setActiveTab('grades')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t.grades}</span>
        </button>
        <button
          id="parent-tab-attendance"
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t.attendance}</span>
        </button>
        <button
          id="parent-tab-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.timetable}</span>
        </button>
        <button
          id="parent-tab-fees"
          onClick={() => setActiveTab('fees')}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t.payments}</span>
        </button>
      </div>

      {/* Tab 1: TODAY'S HIGHLIGHTS */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Status Presence Card */}
          {todayRecord?.status === 'absent' ? (
            <div className="bg-rose-50/90 rounded-2xl p-5 border-2 border-rose-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <XCircle className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                        {isRtl ? 'إشعار غياب فوري متزامن' : 'Alerte Absence Immédiate Synchronisée'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-rose-950 mt-0.5">
                      {isRtl ? 'غياب مسجل اليوم في القسم' : 'Absent(e) aujourd\'hui en classe'}
                    </div>
                    <div className="text-xs text-rose-700 font-medium mt-0.5 flex items-center gap-2">
                      <span>{todayRecord.date}</span>
                      <span>•</span>
                      <span className="font-bold">{todayRecord.timeSlot}</span>
                      {todayRecord.subject && (
                        <>
                          <span>•</span>
                          <span>{isRtl ? todayRecord.subjectAr : todayRecord.subject}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    todayRecord.isJustified
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-200 text-rose-900 border-rose-300'
                  }`}>
                    {todayRecord.isJustified ? (isRtl ? '✓ مبرر' : '✓ Justifié') : (isRtl ? 'غير مبرر' : 'Non justifié')}
                  </span>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-3 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{isRtl ? 'السبب المسجل : ' : 'Motif enregistré : '}</span>
                  <span>{isRtl ? (todayRecord.reasonAr || todayRecord.reason || 'في انتظار التبرير') : (todayRecord.reason || 'En attente de justificatif auprès de la vie scolaire')}</span>
                  {todayRecord.parentNote && (
                    <div className="mt-1 text-slate-600 text-[11px] italic">
                      {isRtl ? `ملاحظة الولي: "${todayRecord.parentNote}"` : `Note du parent: "${todayRecord.parentNote}"`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/70">
                {!todayRecord.isJustified && (
                  <button
                    id="parent-justify-today-btn"
                    onClick={() => setJustifyingRecord(todayRecord)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isRtl ? 'تقديم تبرير لهذا الغياب' : 'Justifier cette absence'}</span>
                  </button>
                )}
                <button
                  id="parent-contact-viescolaire-btn"
                  onClick={() => handleContactVieScolaire(todayRecord)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isRtl ? 'واتساب شؤون التلاميذ' : 'Contacter la Vie Scolaire par WhatsApp'}</span>
                </button>
              </div>
            </div>
          ) : todayRecord?.status === 'late' ? (
            <div className="bg-amber-50/90 rounded-2xl p-5 border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                        {isRtl ? 'تسجيل تأخير' : 'Retard Signalé Synchronisé'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                      {isRtl ? 'وصول متأخر هذا الصباح' : 'Arrivée en retard constatée ce matin'}
                    </div>
                    <div className="text-xs text-amber-800 font-medium mt-0.5 flex items-center gap-2">
                      <span>{todayRecord.date}</span>
                      <span>•</span>
                      <span className="font-bold">{todayRecord.timeSlot}</span>
                      {todayRecord.delayMinutes && (
                        <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                          {isRtl ? `تأخير ${todayRecord.delayMinutes} دقيقة` : `+${todayRecord.delayMinutes} min de retard`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    todayRecord.isJustified
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-200 text-amber-900 border-amber-300'
                  }`}>
                    {todayRecord.isJustified ? (isRtl ? '✓ مبرر' : '✓ Justifié') : (isRtl ? 'يرجى التبرير' : 'Motif à régulariser')}
                  </span>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{isRtl ? 'السبب : ' : 'Motif : '}</span>
                  <span>{isRtl ? (todayRecord.reasonAr || todayRecord.reason || 'غير محدد') : (todayRecord.reason || 'Arrivée après le début du cours')}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/70">
                {!todayRecord.isJustified && (
                  <button
                    id="parent-justify-late-btn"
                    onClick={() => setJustifyingRecord(todayRecord)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isRtl ? 'تحديد سبب التأخير' : 'Indiquer le motif du retard'}</span>
                  </button>
                )}
                <button
                  id="parent-contact-viescolaire-late-btn"
                  onClick={() => handleContactVieScolaire(todayRecord)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isRtl ? 'مراسلة الإدارة عبر واتساب' : 'Échanger avec la Vie Scolaire (WhatsApp)'}</span>
                </button>
              </div>
            </div>
          ) : todayRecord?.status === 'excused' ? (
            <div className="bg-blue-50/90 rounded-2xl p-5 border border-blue-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-700">{isRtl ? 'غياب مبرر' : 'Absence Justifiée'}</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {isRtl ? 'تمت تسوية الغياب والمصادقة عليه' : 'Absence prise en compte et régularisée'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {todayRecord.date} • {todayRecord.timeSlot} • {isRtl ? (todayRecord.reasonAr || todayRecord.reason) : todayRecord.reason}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {isRtl ? 'مصادق عليه' : 'Validé'}
              </span>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">{t.liveAttendance}</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5 flex items-center gap-2">
                    <span>{isRtl ? 'حاضر(ة) اليوم في القسم' : 'Présent(e) aujourd\'hui en classe'}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {t.noAbsenceRecorded}
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                100% {isRtl ? 'مواظبة' : 'Assidu'}
              </span>
            </div>
          )}

          {/* Today Lunch & Bus Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lunch Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{t.todayLunch}</h4>
                    <span className="text-[11px] text-slate-400">{todayMenu.day} ({todayMenu.date})</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {todayMenu.calories} kcal
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t.starter}</div>
                  <div className="font-medium text-slate-800">{isRtl ? todayMenu.starterAr : todayMenu.starter}</div>
                </div>
                <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200/50">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">{t.mainDish}</div>
                  <div className="font-bold text-slate-900">{isRtl ? todayMenu.mainDishAr : todayMenu.mainDish}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t.dessert}</div>
                  <div className="font-medium text-slate-800">{isRtl ? todayMenu.dessertAr : todayMenu.dessert}</div>
                </div>
              </div>
            </div>

            {/* School Bus Card */}
            {childRoute ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{t.schoolBusArrival}</h4>
                      <span className="text-[11px] text-slate-400">{childRoute.code} ({childRoute.busPlate})</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {t.busStatus[childRoute.status]}
                  </span>
                </div>
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-indigo-950">
                    <span>{isRtl ? 'المحطة الحالية :' : 'Arrêt en cours :'}</span>
                    <span className="text-emerald-700 font-black">
                      {isRtl ? childRoute.stops[childRoute.currentStopIndex]?.nameAr : childRoute.stops[childRoute.currentStopIndex]?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{isRtl ? 'السائق :' : 'Chauffeur :'} {isRtl ? childRoute.driverNameAr : childRoute.driverName}</span>
                    <span className="font-mono" dir="ltr">{childRoute.driverPhone}</span>
                  </div>
                </div>
                <button
                  id="whatsapp-bus-driver-btn"
                  onClick={handleContactBusDriver}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'مراسلة السائق على واتساب' : 'Contacter le chauffeur sur WhatsApp'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <Bus className="w-8 h-8 text-slate-300 mb-2" />
                <span>{isRtl ? 'غير مسجل في خدمة النقل المدرسي' : 'Élève non inscrit au transport scolaire'}</span>
              </div>
            )}
          </div>

          {/* Direct WhatsApp Contact Bar with School Team */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  {t.contactSchoolDirect}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t.directChatPrompt}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="contact-director-whatsapp-btn"
                onClick={handleContactDirector}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-start transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {t.contactDirector}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isRtl ? 'إدارة المدرسة والمصالح العامة' : 'Secrétariat & Direction'}
                    </div>
                  </div>
                </div>
                <Chevron className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>

              <button
                id="contact-teacher-whatsapp-btn"
                onClick={handleContactMainTeacher}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-start transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {t.contactTeacher}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isRtl ? 'متابعة بيداغوجية عبر الإدارة' : 'Suivi pédagogique'}
                    </div>
                  </div>
                </div>
                <Chevron className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: HOMEWORK & ASSIGNMENTS */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {childClass}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                  {isRtl ? 'متزامن مع الأساتذة' : 'Synchronisé avec les professeurs'}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {isRtl ? 'الواجبات والأعمال المنزلية' : 'Travaux à la maison & Devoirs'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? `اطلع على التمارين والمراجعات المبرمجة لقسم ${childClass}.`
                  : `Consultez les exercices et révisions assignés pour la classe de ${childClass}.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                {childHomework.length} {isRtl ? 'عمل منزلي' : 'devoir(s)'}
              </span>
            </div>
          </div>

          {childHomework.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isRtl ? 'لا توجد أعمال منزلية مسجلة حالياً' : 'Aucun devoir en cours'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isRtl 
                  ? 'لم ينشر الأساتذة أي واجبات جديدة لهذا القسم بعد.'
                  : 'Les enseignants n\'ont pas encore publié de nouveaux devoirs pour cette classe.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {childHomework.map(item => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 hover:border-emerald-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {isRtl ? item.subjectAr : item.subject}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {isRtl ? `أُسند يوم: ${item.assignedDate}` : `Donné le : ${item.assignedDate}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                          {isRtl ? (item.titleAr || item.title) : item.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isRtl ? `آخر أجل: ${item.dueDate}` : `À rendre le : ${item.dueDate}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      {isRtl ? 'تعليمات الأستاذ :' : 'Consignes du professeur :'}
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">
                      {isRtl ? (item.descriptionAr || item.description) : item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isRtl ? 'المدرس :' : 'Enseignant :'}</span>
                      <span className="font-bold text-slate-800">{isRtl ? item.teacherNameAr : item.teacherName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = isRtl
                          ? `مرحبا بإدارة المدرسة، بصفتي ولي أمر التلميذ(ة) ${childName} (القسم: ${childClass})، أود طرح استفسار موجه للأستاذ ${item.teacherNameAr} بخصوص عمل ${item.subjectAr} ("${item.titleAr || item.title}")...`
                          : `Bonjour à l'administration de l'établissement, en tant que parent de ${childName} (${childClass}), je souhaiterais faire suivre une question au Professeur ${item.teacherName} concernant le travail de ${item.subject} ("${item.title}")...`;
                        onOpenWhatsApp(isRtl ? 'إدارة المدرسة (وساطة)' : 'Administration Scolaire (Médiation)', '+21671234567', msg, childName);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer border border-blue-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isRtl ? 'سؤال حول الواجب (عبر الإدارة)' : 'Question sur le devoir (via l\'Administration)'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: GRADES & REPORT CARD */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-bold">{t.activeTerm}</div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {t.studentAverage} : <span className="text-emerald-600 font-mono text-xl">{selectedChild.averageGrade}/20</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'الرتبة : الثاني من 26 تلميذاً' : 'Classement : 2ème de la classe sur 26 élèves'}
              </p>
            </div>
            <button
              id="parent-share-grades-whatsapp-btn"
              onClick={() => {
                const msg = isRtl
                  ? `مرحبا، أود استلام بطاقة أعداد ${childName}: المعدل العام الحالي ${selectedChild.averageGrade}/20.`
                  : `Résultats de ${childName} : Moyenne générale ${selectedChild.averageGrade}/20.`;
                onOpenWhatsApp(currentParent.name, currentParent.phone, msg, childName);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'استلام بطاقة الأعداد عبر واتساب' : 'Recevoir le bulletin par WhatsApp'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {childGrades.map(g => (
              <div key={g.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {isRtl ? g.subjectAr : g.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {isRtl ? g.examTypeAr : g.examType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (الضارب: {g.coefficient})
                    </span>
                  </div>
                  {g.teacherRemarks && (
                    <p className="text-slate-500 italic text-[11px]">
                      "{isRtl ? (g.teacherRemarksAr || g.teacherRemarks) : g.teacherRemarks}"
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">{g.date}</span>
                  <span className={`font-mono font-black text-base px-3 py-1 rounded-xl ${
                    g.score >= 16 ? 'bg-emerald-100 text-emerald-800' :
                    g.score >= 12 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {g.score} / {g.maxScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">
                {isRtl ? 'مزامنة مباشرة وفورية مع الإدارة المدرسية' : 'Mise à jour en temps réel synchronisée avec la Vie Scolaire'}
              </span>
            </div>
            <button
              onClick={() => handleContactVieScolaire()}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تواصل' : 'Contacter'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-[11px] text-slate-500 font-bold uppercase">{t.attendanceRate}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{attendanceStats.rate}%</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRtl ? 'المواظبة العامة' : 'Taux calculé'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-[11px] text-rose-600 font-bold uppercase">{t.absent}</div>
              <div className="text-2xl font-black text-rose-600 mt-1">{attendanceStats.absent}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRtl ? 'حصص غياب' : 'séance(s)'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-[11px] text-amber-600 font-bold uppercase">{t.late}</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{attendanceStats.late}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRtl ? 'مرات تأخير' : 'retard(s)'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-[11px] text-blue-600 font-bold uppercase">{t.excused}</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{attendanceStats.excused}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRtl ? 'مبررة' : 'régularisé(s)'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 flex items-center justify-between font-bold text-xs text-slate-700">
              <span>{isRtl ? 'سجل الحضور والغيابات' : 'Historique des appels et assiduité'}</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {childAttendance.length} {isRtl ? 'تسجيلات' : 'enregistrements'}
              </span>
            </div>
            {childAttendance.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isRtl ? 'لا توجد غيابات أو تأخيرات مسجلة' : 'Aucune absence ou retard enregistré'}
              </div>
            ) : (
              childAttendance.map(a => {
                const isAbs = a.status === 'absent';
                const isLate = a.status === 'late';
                const isExc = a.status === 'excused' || a.isJustified;
                return (
                  <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          a.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'absent' ? 'bg-rose-100 text-rose-800' :
                          a.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.status === 'present' ? t.present : a.status === 'absent' ? t.absent : a.status === 'late' ? t.late : t.excused}
                        </span>
                        <span className="font-bold text-slate-800">{a.date}</span>
                        <span className="text-slate-500 font-mono">({a.timeSlot})</span>
                        {isLate && a.delayMinutes && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                            +{a.delayMinutes} min
                          </span>
                        )}
                        {(isAbs || isLate) && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isExc 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {isExc ? (isRtl ? '✓ مبرر' : '✓ Justifié') : (isRtl ? 'غير مبرر' : 'Non justifié')}
                          </span>
                        )}
                      </div>
                      {a.reason && (
                        <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
                          <span className="font-medium text-slate-400">{isRtl ? 'السبب : ' : 'Motif : '}</span>
                          <span>{isRtl ? (a.reasonAr || a.reason) : a.reason}</span>
                        </div>
                      )}
                      {a.submittedByTeacherName && (
                        <div className="text-[11px] text-blue-700 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-blue-900">{isRtl ? 'ورقة المناداة من :' : 'Feuille d\'appel de :'}</span>
                          <span>
                            {isRtl ? (a.submittedByTeacherNameAr || a.submittedByTeacherName) : a.submittedByTeacherName}
                            {a.subject && ` (${isRtl ? a.subjectAr || a.subject : a.subject})`}
                          </span>
                        </div>
                      )}
                      {a.parentNote && (
                        <div className="text-[11px] text-emerald-700 italic bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100 inline-block">
                          {isRtl ? `التبرير المقدم: "${a.parentNote}"` : `Justificatif transmis : "${a.parentNote}"`}
                          {a.parentJustifiedAt && ` (${a.parentJustifiedAt})`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {(isAbs || isLate) && !isExc && (
                        <button
                          id={`justify-record-${a.id}-btn`}
                          onClick={() => setJustifyingRecord(a)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'تقديم تبرير' : 'Justifier'}</span>
                        </button>
                      )}
                      {(isAbs || isLate) && (
                        <button
                          id={`whatsapp-record-${a.id}-btn`}
                          onClick={() => handleContactVieScolaire(a)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                          title={isRtl ? 'مراسلة الإدارة' : 'Contacter la Vie Scolaire'}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: TIMETABLE */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">{t.weeklySchedule} ({childClass})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {childTimetable.map(slot => (
              <div key={slot.id} className={`bg-white rounded-2xl border-l-4 p-4 shadow-xs ${slot.color} space-y-2`}>
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>{isRtl ? slot.subjectAr : slot.subject}</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span dir="ltr">{slot.timeSlot}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/50">
                  <span>{isRtl ? slot.teacherNameAr : slot.teacherName}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {slot.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-bold">{t.feesSummary}</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {isRtl ? 'الوضعية المالية مسواة بالكامل' : 'Situation comptable en règle'}
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                {isRtl ? 'جميع المعاليم المستوجبة مدفوعة في مواعيدها' : 'Tous les règlements échus sont à jour'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {childPayments.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{isRtl ? p.titleAr : p.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Réf: {p.receiptNumber} • {t.dueDate}: {p.dueDate}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-black text-slate-900 text-sm">
                      {p.amount} {p.currency}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status === 'paid' ? t.paid : t.pending}
                    </span>
                  </div>
                  {p.status === 'paid' ? (
                    <button
                      id={`receipt-btn-${p.id}`}
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs font-bold text-xs flex items-center gap-1.5 border border-emerald-200/80 cursor-pointer"
                      title={isRtl ? 'طباعة الوصل الرسمي' : 'Imprimer le reçu officiel'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'طباعة الوصل' : 'Imprimer Reçu'}</span>
                    </button>
                  ) : (
                    <button
                      id={`receipt-btn-${p.id}`}
                      onClick={() => {
                        const msg = isRtl
                          ? `مرحبا، بخصوص المعلوم (${p.receiptNumber}) بقيمة ${p.amount} ${p.currency} للتلميذ(ة) ${childName}.`
                          : `Demande de reçu pour le règlement ${p.receiptNumber} (${p.amount} ${p.currency}) pour ${childName}.`;
                        onOpenWhatsApp(isRtl ? 'محاسبة المدرسة' : 'Comptabilité École', '+21671890123', msg, childName);
                      }}
                      className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                      title={isRtl ? 'طلب الوصل' : 'Recevoir le reçu'}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal to link another child */}
      {isLinkingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isRtl ? 'ربط ابن آخر بهذا الحساب' : 'Rattacher un autre enfant à ce compte'}
                </h3>
              </div>
              <button 
                onClick={() => setIsLinkingModalOpen(false)} 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? 'ابحث وحدد التلميذ لربطه بحسابك وتتبع ملفه الدراسي.'
                  : 'Recherchez et sélectionnez l\'enfant à associer à votre profil pour synchroniser son dossier.'}
              </p>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={linkingSearch}
                  onChange={e => setLinkingSearch(e.target.value)}
                  placeholder={isRtl ? 'بحث بالاسم أو اللقب أو القسم...' : 'Rechercher par nom, prénom ou classe...'}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {availableStudentsToLink.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 italic">
                    {isRtl ? 'لم يتم العثور على أي تلميذ' : 'Aucun élève trouvé'}
                  </p>
                ) : (
                  availableStudentsToLink.map(stu => {
                    const sName = isRtl ? `${stu.firstNameAr} ${stu.lastNameAr}` : `${stu.firstName} ${stu.lastName}`;
                    const sClass = isRtl ? stu.classNameAr : stu.className;
                    return (
                      <div
                        key={stu.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={stu.photo} alt={sName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{sName}</div>
                            <div className="text-[10px] text-slate-500">{sClass}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConfirmLinkChild(stu.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'ربط' : 'Rattacher'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLinkingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  {isRtl ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Justification Modal */}
      {justifyingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  justifyingRecord.status === 'late' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {justifyingRecord.status === 'late'
                      ? (isRtl ? 'تبرير تأخير عن الدرس' : 'Justifier un retard en classe')
                      : (isRtl ? 'تقديم تبرير غياب مدرسي' : 'Justifier une absence scolaire')}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {childName} • {justifyingRecord.date} ({justifyingRecord.timeSlot})
                    {justifyingRecord.delayMinutes ? ` • +${justifyingRecord.delayMinutes} min` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setJustifyingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {isRtl ? 'السبب الرئيسي :' : 'Motif principal :'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { fr: 'Certificat médical', ar: 'شهادة طبية' },
                    { fr: 'Urgence familiale', ar: 'طارئ عائلي' },
                    { fr: 'Problème de transport', ar: 'صعوبة في المواصلات' },
                    { fr: 'Autre motif légitime', ar: 'سبب مشروع آخر' }
                  ].map(item => {
                    const isSelected = justificationReason === item.fr;
                    return (
                      <button
                        key={item.fr}
                        type="button"
                        onClick={() => {
                          setJustificationReason(item.fr);
                          setJustificationReasonAr(item.ar);
                        }}
                        className={`p-3 rounded-xl border text-start font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs">{isRtl ? item.ar : item.fr}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'تفاصيل إضافية وتوضيحات :' : 'Précisions & Détails complémentaires :'}
                </label>
                <textarea
                  rows={3}
                  value={justificationDetails}
                  onChange={(e) => setJustificationDetails(e.target.value)}
                  placeholder={
                    isRtl 
                      ? 'مثال: زيارة للطبيب المباشر، الشهادة الطبية جاهزة، استئناف الدروس غداً صباحاً...' 
                      : 'Exemple : Visite chez le médecin traitant, certificat disponible, reprise des cours demain matin...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">
                    {isRtl ? 'إشعار شؤون التلاميذ عبر واتساب أيضاً' : 'Informer aussi la Vie Scolaire par WhatsApp'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={justificationNotifyWhatsApp}
                  onChange={(e) => setJustificationNotifyWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setJustifyingRecord(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                id="submit-parent-justification-btn"
                onClick={handleSaveJustification}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isRtl ? 'تأكيد وإرسال التبرير' : 'Valider et transmettre'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          student={students.find(s => s.id === selectedReceiptPayment.studentId) || selectedChild}
          parent={currentParent}
          lang={lang}
          onClose={() => setSelectedReceiptPayment(null)}
          onOpenWhatsApp={onOpenWhatsApp}
        />
      )}
    </div>
  );
};
