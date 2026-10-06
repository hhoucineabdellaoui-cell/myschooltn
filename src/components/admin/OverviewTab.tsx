import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  CreditCard, 
  Bus, 
  MessageSquare, 
  TrendingUp, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Building2
} from 'lucide-react';
import { 
  Student, 
  Parent, 
  Teacher, 
  AttendanceRecord, 
  PaymentRecord, 
  TransportRoute, 
  WhatsAppMessageLog, 
  Language,
  TabType 
} from '../../types';
import { useTranslation } from '../../translations';

interface OverviewTabProps {
  students: Student[];
  parents: Parent[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  transportRoutes: TransportRoute[];
  whatsappLogs: WhatsAppMessageLog[];
  lang: Language;
  onNavigateTab: (tab: TabType) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  students,
  parents,
  attendance,
  payments,
  transportRoutes,
  whatsappLogs,
  lang,
  onNavigateTab,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const todayAbsences = attendance.filter(a => a.status === 'absent');
  const pendingPayments = payments.filter(p => p.status !== 'paid');
  const totalPendingAmount = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleQuickAbsenceBroadcast = () => {
    const firstAbsent = todayAbsences[0];
    if (firstAbsent) {
      const student = students.find(s => s.id === firstAbsent.studentId);
      const parent = parents.find(p => p.id === student?.parentId);
      if (student && parent) {
        const msg = isRtl
          ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، نعلمكم بغياب التلميذ(ة) ${student.firstNameAr} ${student.lastNameAr} هذا اليوم. يرجى التواصل معنا.`
          : `Bonjour M./Mme ${parent.name}, nous vous informons de l'absence de votre enfant ${student.firstName} ${student.lastName} ce jour. Merci de nous contacter.`;
        onOpenWhatsApp(isRtl ? parent.nameAr : parent.name, parent.phone, msg, isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`);
        return;
      }
    }
    onNavigateTab('attendance');
  };

  const handleQuickPaymentReminder = () => {
    const firstOverdue = payments.find(p => p.status === 'overdue') || pendingPayments[0];
    if (firstOverdue) {
      const student = students.find(s => s.id === firstOverdue.studentId);
      const parent = parents.find(p => p.id === firstOverdue.parentId);
      if (student && parent) {
        const msg = isRtl
          ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، تذكير بموعد خلاص ${firstOverdue.titleAr} (${firstOverdue.amount} ${firstOverdue.currency}) للتلميذ(ة) ${student.firstNameAr}.`
          : `Bonjour M./Mme ${parent.name}, rappel d'échéance pour ${firstOverdue.title} (${firstOverdue.amount} ${firstOverdue.currency}) pour ${student.firstName}.`;
        onOpenWhatsApp(isRtl ? parent.nameAr : parent.name, parent.phone, msg, isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`);
        return;
      }
    }
    onNavigateTab('payments');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Alert for Instant WhatsApp Communication */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-700/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-emerald-50 border border-white/25">
            <Send className="w-3.5 h-3.5" />
            {isRtl ? 'قناة التواصل المباشر عبر واتساب' : 'Canal Direct WhatsApp Parents'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {isRtl ? 'مرحباً بكم في منصة MySchoolTN' : 'Bienvenue sur la plateforme MySchoolTN'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            {isRtl 
              ? 'إدارة شاملة للغيابات، الأعداد، المعاليم المدرسية، وحافلات النقل مع إشعارات واتساب فورية لأولياء الأمور (+216).'
              : 'Gestion globale des absences, évaluations, frais scolaires et bus avec notifications WhatsApp instantanées aux parents.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="overview-quick-absence-btn"
            onClick={handleQuickAbsenceBroadcast}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            {t.quickAbsenceAlert}
          </button>
          <button
            id="overview-whatsapp-hub-btn"
            onClick={() => onNavigateTab('whatsapp_center')}
            className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-400/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            {t.whatsappHub}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.totalStudents}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              100% {isRtl ? 'نشط' : 'Actifs'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isRtl ? '4 أقسام نشطة' : '4 classes actives'}</span>
            <Arrow className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* Total Parents */}
        <div 
          onClick={() => onNavigateTab('parents')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.totalParents}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{parents.length}</div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              WhatsApp OK
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isRtl ? 'ربط مباشر' : 'Liaison directe'}</span>
            <Arrow className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Today Absences */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.todayAbsences}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-rose-600">{todayAbsences.length}</div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {todayAbsences.filter(a => a.notifiedWhatsapp).length} {t.notified}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isRtl ? 'إشعار واتساب متاح' : 'Alerte WhatsApp active'}</span>
            <Arrow className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* Pending Payments */}
        <div 
          onClick={() => onNavigateTab('payments')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t.pendingPayments}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl font-black text-amber-600">
              {totalPendingAmount.toLocaleString()} {t.currency || 'DT'}
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {pendingPayments.length} {isRtl ? 'ملف' : 'dossiers'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isRtl ? 'تذكير متاح' : 'Relances disponibles'}</span>
            <Arrow className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & WhatsApp Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Action Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t.quickActions}
            </h3>
            <div className="space-y-2.5">
              <button
                id="quick-action-absence-btn"
                onClick={handleQuickAbsenceBroadcast}
                className="w-full text-start p-3 rounded-xl border border-slate-200/70 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {t.quickAbsenceAlert}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {todayAbsences.length} {isRtl ? 'غياب اليوم' : 'absence(s) aujourd\'hui'}
                    </div>
                  </div>
                </div>
                <Arrow className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                id="quick-action-payment-btn"
                onClick={handleQuickPaymentReminder}
                className="w-full text-start p-3 rounded-xl border border-slate-200/70 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {t.quickPaymentReminder}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {pendingPayments.length} {isRtl ? 'أجل في الانتظار' : 'échéance(s) en attente'}
                    </div>
                  </div>
                </div>
                <Arrow className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                id="quick-action-bus-btn"
                onClick={() => onNavigateTab('transport')}
                className="w-full text-start p-3 rounded-xl border border-slate-200/70 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {t.sendBusAlertWhatsApp}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {transportRoutes.length} {isRtl ? 'خطوط حافلات' : 'lignes de bus'}
                    </div>
                  </div>
                </div>
                <Arrow className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                id="quick-action-tunisia-schools-btn"
                onClick={() => onNavigateTab('tunisia_schools')}
                className="w-full text-start p-3 rounded-xl border border-red-200/70 hover:border-red-500 hover:bg-red-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-red-700">
                      {isRtl ? 'المدارس والمعاهد في تونس' : 'Écoles & Lycées en Tunisie'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isRtl ? 'المعاهد النموذجية والمنظومة التونسية' : 'Établissements pilotes & système tunisien'}
                    </div>
                  </div>
                </div>
                <Arrow className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Operational Transport Widget */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-emerald-400" />
                {t.activeBuses}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isRtl ? 'مباشر GPS' : 'Live GPS'}
              </span>
            </div>
            {transportRoutes.map(route => (
              <div key={route.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-emerald-300">{route.code}</span>
                  <span className="text-slate-300">{route.busPlate}</span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {isRtl ? route.nameAr : route.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>{isRtl ? route.driverNameAr : route.driverName}</span>
                  <span className="text-emerald-400 font-medium">
                    {route.status === 'on_route' ? (isRtl ? 'في المسار' : 'En circulation') : (isRtl ? 'وصلت' : 'Arrivé')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: WhatsApp Activity Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                {t.recentWhatsAppLogs}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'سجل المراسلات المباشرة مع الأولياء' : 'Historique des notifications envoyées en direct'}
              </p>
            </div>
            <button
              id="view-all-whatsapp-logs-btn"
              onClick={() => onNavigateTab('whatsapp_center')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{isRtl ? 'عرض الكل' : 'Tout voir'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {whatsappLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    log.type === 'absence' ? 'bg-rose-50 text-rose-600' :
                    log.type === 'payment' ? 'bg-amber-50 text-amber-600' :
                    log.type === 'grade' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.recipientName}</span>
                      {log.studentName && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {log.studentName}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed max-w-xl line-clamp-2">
                      {isRtl ? log.contentAr : log.contentFr}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono pt-0.5" dir="ltr">
                      {log.phone} • {log.timestamp}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تم التسليم' : 'Délivré'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
