import React from 'react';
import { X, MessageSquare, Phone, Mail, MapPin, Award, Calendar, Bus, Utensils } from 'lucide-react';
import { Student, Parent, GradeRecord, AttendanceRecord, PaymentRecord, Language } from '../types';
import { useTranslation } from '../translations';

interface StudentDetailModalProps {
  student: Student | null;
  parent: Parent | undefined;
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  lang: Language;
  onClose: () => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  parent,
  grades,
  attendance,
  payments,
  lang,
  onClose,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  if (!student) return null;

  const studentName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
  const parentName = parent ? (isRtl ? parent.nameAr : parent.name) : '';
  const className = isRtl ? student.classNameAr : student.className;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentPayments = payments.filter(p => p.studentId === student.id);

  const handleContactParent = () => {
    if (!parent) return;
    const msg = isRtl
      ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، بخصوص التلميذ(ة) ${student.firstNameAr} ${student.lastNameAr}...`
      : `Bonjour M./Mme ${parent.name}, à propos de l'élève ${student.firstName} ${student.lastName}...`;
    onOpenWhatsApp(parentName, parent.phone, msg, studentName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={student.photo} 
              alt={studentName} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{studentName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {className}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isRtl ? `تاريخ الولادة: ${student.birthDate} • فصيلة الدم: ${student.bloodType}` : `Né(e) le ${student.birthDate} • Groupe sanguin : ${student.bloodType}`}
              </p>
            </div>
          </div>
          <button
            id="close-student-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500">{t.studentAverage}</div>
              <div className="text-lg font-black text-emerald-600 mt-1">{student.averageGrade}/20</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500">{t.attendanceRate}</div>
              <div className="text-lg font-black text-blue-600 mt-1">{student.attendanceRate}%</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500">{isRtl ? 'المطعم' : 'Cantine'}</div>
              <div className="text-xs font-bold mt-2 text-slate-700 flex items-center justify-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                {student.canteenSubscribed ? (isRtl ? 'مشترك' : 'Inscrit') : (isRtl ? 'غير مشترك' : 'Non')}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500">{isRtl ? 'النقل' : 'Transport'}</div>
              <div className="text-xs font-bold mt-2 text-slate-700 flex items-center justify-center gap-1">
                <Bus className="w-3.5 h-3.5 text-indigo-500" />
                {student.transportSubscribed ? (isRtl ? 'مشترك' : 'Inscrit') : (isRtl ? 'غير مشترك' : 'Non')}
              </div>
            </div>
          </div>

          {/* Parent Information Card */}
          {parent && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{t.parentDetails}</span>
                </div>
                <button
                  id="contact-parent-whatsapp-modal-btn"
                  onClick={handleContactParent}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.sendWhatsApp}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{isRtl ? 'الاسم :' : 'Nom :'}</span>
                  <span className="font-semibold text-slate-800">{parentName} ({isRtl ? parent.relationshipAr : parent.relationship})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span dir="ltr" className="font-mono font-medium">{parent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{parent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? parent.addressAr : parent.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Grades Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              {t.latestGrades}
            </h4>
            {studentGrades.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{isRtl ? 'لا توجد أعداد مسجلة حالياً' : 'Aucune note enregistrée pour l\'instant'}</p>
            ) : (
              <div className="space-y-1.5">
                {studentGrades.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{isRtl ? g.subjectAr : g.subject}</div>
                      <div className="text-[11px] text-slate-400">{isRtl ? g.examTypeAr : g.examType} • {g.date}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-emerald-600">{g.score}</span>
                      <span className="text-slate-400 text-[11px]">/{g.maxScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance History Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              {t.attendance}
            </h4>
            {studentAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{isRtl ? 'حضور منتظم دون غيابات مسجلة' : 'Présence régulière sans incident'}</p>
            ) : (
              <div className="space-y-1.5">
                {studentAttendance.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'absent' ? 'bg-rose-100 text-rose-800' :
                        a.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {a.status === 'present' ? t.present : a.status === 'absent' ? t.absent : a.status === 'late' ? t.late : t.excused}
                      </span>
                      <span className="text-slate-600">{a.date} ({a.timeSlot})</span>
                    </div>
                    {a.reason && (
                      <span className="text-[11px] text-slate-500 italic max-w-[200px] truncate">
                        {isRtl ? a.reasonAr : a.reason}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              {t.payments}
            </h4>
            {studentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{isRtl ? 'الوضعية المالية مسواة بالكامل' : 'Situation financière à jour'}</p>
            ) : (
              <div className="space-y-1.5">
                {studentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{isRtl ? p.titleAr : p.title}</div>
                      <div className="text-[11px] text-slate-400">{isRtl ? 'الأجل :' : 'Échéance :'} {p.dueDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-800">{p.amount} {p.currency}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'paid' ? t.paid : p.status === 'overdue' ? t.overdue : t.pending}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            id="footer-close-student-modal-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
          {parent && (
            <button
              id="footer-whatsapp-student-modal-btn"
              onClick={handleContactParent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              {t.sendWhatsApp}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
