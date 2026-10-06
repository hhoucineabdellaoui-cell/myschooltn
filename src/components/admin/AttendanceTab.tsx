import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  FileCheck, 
  Eye, 
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Student, Parent, ClassRoom, AttendanceRecord, AttendanceStatus, Language } from '../../types';
import { useTranslation } from '../../translations';
import { generateAbsenceMessage } from '../../utils/whatsapp';

interface AttendanceTabProps {
  students: Student[];
  parents: Parent[];
  classes: ClassRoom[];
  attendance: AttendanceRecord[];
  lang: Language;
  onUpdateAttendance: (updated: AttendanceRecord) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  students,
  parents,
  classes,
  attendance,
  lang,
  onUpdateAttendance,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(() => {
    const latestDate = attendance.length > 0 
      ? [...attendance].sort((a, b) => b.date.localeCompare(a.date))[0].date 
      : todayDateStr;
    return latestDate || todayDateStr;
  });
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-1');

  // Submitted sheets from teachers for administration validation
  const submittedSheets = useMemo(() => {
    const list = attendance.filter(a => a.submittedByTeacherName || a.submittedAt);
    const groups: { [key: string]: {
      id: string;
      date: string;
      classId: string;
      className: string;
      classNameAr: string;
      teacherName: string;
      teacherNameAr: string;
      subject: string;
      subjectAr: string;
      timeSlot: string;
      submittedAt?: string;
      adminValidated?: boolean;
      absentsCount: number;
      latesCount: number;
      totalCount: number;
      records: AttendanceRecord[];
    }} = {};

    list.forEach(item => {
      const student = students.find(s => s.id === item.studentId);
      const cId = student?.classId || 'cls-1';
      const classObj = classes.find(c => c.id === cId);
      const groupKey = `${item.date}_${cId}_${item.timeSlot || 'slot'}_${item.submittedByTeacherName || 'teacher'}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          date: item.date,
          classId: cId,
          className: classObj?.name || 'Classe',
          classNameAr: classObj?.nameAr || 'قسم',
          teacherName: item.submittedByTeacherName || 'Enseignant',
          teacherNameAr: item.submittedByTeacherNameAr || item.submittedByTeacherName || 'مدرس',
          subject: item.subject || 'Matière',
          subjectAr: item.subjectAr || item.subject || 'مادة',
          timeSlot: item.timeSlot || '08:30 - 10:00',
          submittedAt: item.submittedAt,
          adminValidated: item.adminValidated,
          absentsCount: 0,
          latesCount: 0,
          totalCount: 0,
          records: []
        };
      }

      groups[groupKey].records.push(item);
      groups[groupKey].totalCount++;
      if (item.status === 'absent') groups[groupKey].absentsCount++;
      if (item.status === 'late') groups[groupKey].latesCount++;
      if (!item.adminValidated) groups[groupKey].adminValidated = false;
    });

    return Object.values(groups).sort((a, b) => (b.submittedAt || b.date).localeCompare(a.submittedAt || a.date));
  }, [attendance, students, classes]);

  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Calculate attendance rate for the class today
  const classAttendanceRecords = classStudents.map(s => {
    return (
      attendance.find(a => a.studentId === s.id && a.date === selectedDate) || {
        id: `att-gen-${s.id}-${selectedDate}`,
        studentId: s.id,
        date: selectedDate,
        status: 'present' as AttendanceStatus,
        timeSlot: 'Journée entière',
        notifiedWhatsapp: false
      }
    );
  });

  const presentCount = classAttendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = classAttendanceRecords.filter(r => r.status === 'absent').length;
  const lateCount = classAttendanceRecords.filter(r => r.status === 'late').length;

  const handleStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    const existing = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
    const updated: AttendanceRecord = {
      id: existing?.id || `att-${Date.now()}-${student.id}`,
      studentId: student.id,
      date: selectedDate,
      status: newStatus,
      timeSlot: existing?.timeSlot || '08:30 - 12:00',
      reason: existing?.reason || (newStatus === 'absent' ? 'Non justifié' : newStatus === 'late' ? 'Retard en classe' : undefined),
      reasonAr: existing?.reasonAr || (newStatus === 'absent' ? 'غير مبرر' : newStatus === 'late' ? 'تأخير في القسم' : undefined),
      delayMinutes: newStatus === 'late' ? (existing?.delayMinutes || 15) : undefined,
      isJustified: newStatus === 'excused' ? true : existing?.isJustified,
      parentNote: existing?.parentNote,
      parentJustifiedAt: existing?.parentJustifiedAt,
      notifiedWhatsapp: existing?.notifiedWhatsapp || false
    };
    onUpdateAttendance(updated);
  };

  const handleWhatsAppAlert = (student: Student, record: AttendanceRecord) => {
    const parent = parents.find(p => p.id === student.parentId);
    if (!parent) return;

    const studentFullName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
    const parentFullName = isRtl ? parent.nameAr : parent.name;
    const msg = generateAbsenceMessage(student, parent, record, lang);

    onOpenWhatsApp(parentFullName, parent.phone, msg, studentFullName);

    onUpdateAttendance({
      ...record,
      notifiedWhatsapp: true,
      adminValidated: true,
      adminValidatedAt: new Date().toISOString()
    });
  };

  const handleMarkAllPresent = () => {
    classStudents.forEach(s => {
      const existing = attendance.find(a => a.studentId === s.id && a.date === selectedDate);
      onUpdateAttendance({
        id: existing?.id || `att-${Date.now()}-${s.id}`,
        studentId: s.id,
        date: selectedDate,
        status: 'present',
        timeSlot: 'Journée entière',
        notifiedWhatsapp: false,
        adminValidated: true,
        adminValidatedAt: new Date().toISOString()
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Administrative Intermediary Role & Teacher Transmission Overview */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200 border border-white/10 shrink-0 mt-0.5 sm:mt-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">
                  {isRtl ? 'خلية الوساطة الإدارية وشؤون التلاميذ' : 'Cellule de Médiation Administrative & Vie Scolaire'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/20">
                  {isRtl ? 'وسيط حصري مع الأولياء' : 'Intermédiaire Exclusif'}
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
                {isRtl 
                  ? 'تستقبل الإدارة أوراق الحضور الواردة من المدرسين، وتصادق على أسباب الغياب والتأخير وتتولى وحدها التواصل الرسمي مع العائلات.'
                  : 'L\'administration réceptionne les feuilles d\'appel transmises par les enseignants, valide les motifs et assure seule le contact officiel avec les familles.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Roll Call Sheets from Teachers */}
      {submittedSheets.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? 'أوراق الحضور الواردة من الأساتذة' : 'Feuilles d\'appel transmises par les professeurs'}</span>
            </h4>
            <span className="text-xs text-slate-400 font-semibold">
              {submittedSheets.length} {isRtl ? 'ورقة' : 'feuille(s)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {submittedSheets.map(sheet => (
              <div 
                key={sheet.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  selectedDate === sheet.date && selectedClassId === sheet.classId
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {isRtl ? sheet.classNameAr : sheet.className} • {isRtl ? sheet.teacherNameAr : sheet.teacherName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                       {isRtl ? sheet.subjectAr : sheet.subject} • {sheet.timeSlot}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                       {sheet.date}
                    </div>
                  </div>
                  {sheet.adminValidated ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isRtl ? 'مصادق عليها' : 'Validée'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{isRtl ? 'في الانتظار' : 'À valider'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-rose-600 font-bold">
                    {sheet.absentsCount} {isRtl ? 'غياب' : 'absent(s)'}
                  </span>
                  <span>•</span>
                  <span className="text-amber-600 font-bold">
                    {sheet.latesCount} {isRtl ? 'تأخير' : 'retard(s)'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">
                    {sheet.totalCount} {isRtl ? 'تلاميذ' : 'élèves'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => {
                      setSelectedDate(sheet.date);
                      setSelectedClassId(sheet.classId);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'معاينة' : 'Examiner'}</span>
                  </button>
                  {!sheet.adminValidated && (
                    <button
                      onClick={() => {
                        sheet.records.forEach(r => {
                          onUpdateAttendance({
                            ...r,
                            adminValidated: true,
                            adminValidatedAt: new Date().toISOString()
                          });
                        });
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                      title={isRtl ? 'مصادقة' : 'Valider'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مصادقة' : 'Valider'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Controls: Date, Class, Quick Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(todayDateStr)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedDate === todayDateStr 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {isRtl ? 'اليوم' : "Aujourd'hui"}
            </button>
          </div>

          {/* Class Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="attendance-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {isRtl ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mark all present button */}
        <button
          id="mark-all-present-btn"
          onClick={handleMarkAllPresent}
          className="px-4 py-2 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.markAllPresent}</span>
        </button>
      </div>

      {/* Class Statistics Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.present}</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{presentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.absent}</div>
            <div className="text-xl font-black text-rose-600 mt-0.5">{absentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.late}</div>
            <div className="text-xl font-black text-amber-600 mt-0.5">{lateCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {t.markAttendance}
            </h3>
            <p className="text-xs text-slate-500">
              {t.attendanceForDate} <span className="font-semibold text-slate-700">{selectedDate}</span>
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {classStudents.length} {t.students}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold">
                <th className="px-4 py-3 text-start">{t.students}</th>
                <th className="px-4 py-3 text-center">{t.status}</th>
                <th className="px-4 py-3 text-start">{t.reason}</th>
                <th className="px-4 py-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map(student => {
                const record = attendance.find(a => a.studentId === student.id && a.date === selectedDate) || {
                  id: `att-tmp-${student.id}`,
                  studentId: student.id,
                  date: selectedDate,
                  status: 'present' as AttendanceStatus,
                  timeSlot: '08:30 - 12:00',
                  notifiedWhatsapp: false
                };
                const parent = parents.find(p => p.id === student.parentId);
                const studentName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photo}
                          alt={studentName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{studentName}</div>
                          <div className="text-[11px] text-slate-400">
                            {isRtl ? `الولي: ${parent?.nameAr}` : `Parent : ${parent?.name}`}
                          </div>
                          {record.submittedByTeacherName && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg w-fit">
                              <GraduationCap className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>
                                {isRtl ? 'ورقة الأستاذ:' : 'Feuille du prof :'}{' '}
                                <strong className="font-semibold">
                                  {isRtl ? (record.submittedByTeacherNameAr || record.submittedByTeacherName) : record.submittedByTeacherName}
                                </strong>
                                {record.subject && ` (${isRtl ? (record.subjectAr || record.subject) : record.subject})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Buttons Pill */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
                        <button
                          id={`att-present-${student.id}-btn`}
                          onClick={() => handleStatusChange(student, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            record.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          {t.present}
                        </button>
                        <button
                          id={`att-absent-${student.id}-btn`}
                          onClick={() => handleStatusChange(student, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            record.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          {t.absent}
                        </button>
                        <button
                          id={`att-late-${student.id}-btn`}
                          onClick={() => handleStatusChange(student, 'late')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            record.status === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          {t.late}
                        </button>
                        <button
                          id={`att-excused-${student.id}-btn`}
                          onClick={() => handleStatusChange(student, 'excused')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            record.status === 'excused'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700'
                          }`}
                        >
                          {t.excused}
                        </button>
                      </div>
                    </td>

                    {/* Reason input, delay minutes, and parent justification */}
                    <td className="px-4 py-3">
                      {record.status !== 'present' ? (
                        <div className="space-y-1.5 min-w-[200px]">
                          {record.status === 'late' && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="text-[11px] font-bold text-amber-900">
                                {isRtl ? 'التأخير :' : 'Retard :'}
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="180"
                                value={record.delayMinutes || 15}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  onUpdateAttendance({
                                    ...record,
                                    delayMinutes: val
                                  });
                                }}
                                className="w-14 bg-white border border-amber-300 rounded px-1.5 py-0.5 text-xs font-bold text-center text-amber-950 focus:outline-none"
                              />
                              <span className="text-[11px] text-amber-800 font-medium">{isRtl ? 'دق' : 'min'}</span>
                            </div>
                          )}

                          {record.parentNote && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-1.5 text-[11px] space-y-1">
                              <div className="flex items-center justify-between gap-1 font-bold">
                                <span>{isRtl ? 'تبرير الولي الوارد :' : '✓ Justificatif parent reçu :'}</span>
                                {record.status !== 'excused' && (
                                  <button
                                    onClick={() => {
                                      onUpdateAttendance({
                                        ...record,
                                        status: 'excused',
                                        isJustified: true
                                      });
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    {isRtl ? 'قبول' : 'Valider'}
                                  </button>
                                )}
                              </div>
                              <div className="italic text-emerald-800">
                                "{record.parentNote}"
                              </div>
                            </div>
                          )}

                          <input
                            type="text"
                            value={(isRtl ? record.reasonAr : record.reason) || ''}
                            onChange={(e) => {
                              onUpdateAttendance({
                                ...record,
                                reason: e.target.value,
                                reasonAr: e.target.value
                              });
                            }}
                            placeholder={isRtl ? 'سبب الغياب أو التأخير...' : 'Motif d\'absence ou retard...'}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          />

                          {/* Administration Intermediary Validation Status */}
                          <div className="flex items-center gap-2 pt-0.5">
                            {record.adminValidated ? (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{isRtl ? 'مصادق من الإدارة' : 'Validé par la Surveillance'}</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateAttendance({
                                    ...record,
                                    adminValidated: true,
                                    adminValidatedAt: new Date().toISOString()
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Building2 className="w-3 h-3 text-blue-600" />
                                <span>{isRtl ? 'مصادقة للإشعار' : 'Valider pour notification'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          {isRtl ? 'حاضر في الحصة' : 'Présent au cours'}
                        </span>
                      )}
                    </td>

                    {/* Action: WhatsApp Official Alert */}
                    <td className="px-4 py-3 text-center">
                      {(record.status === 'absent' || record.status === 'late') ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            id={`notify-whatsapp-attendance-${student.id}-btn`}
                            onClick={() => handleWhatsAppAlert(student, record)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all mx-auto cursor-pointer ${
                              record.notifiedWhatsapp
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {record.notifiedWhatsapp ? t.notified : t.notifyParentInstant}
                            </span>
                          </button>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isRtl ? 'صادر عن إدارة المؤسسة' : 'Émis par la Direction'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
