import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Send, 
  Trash2, 
  MessageSquare, 
  ShieldCheck,
  Building2, 
  Save, 
  Check, 
  CalendarDays, 
  Timer, 
  Search, 
  Printer, 
  CheckCircle, 
  XCircle,
  LayoutGrid, 
  List 
} from 'lucide-react';
import { 
  Teacher, 
  ClassRoom, 
  Student, 
  Parent, 
  AttendanceRecord, 
  GradeRecord, 
  HomeworkItem, 
  Language, 
  AttendanceStatus 
} from '../types';
import { useTranslation } from '../translations';

export interface TeacherPortalProps {
  currentTeacher: Teacher;
  allTeachers?: Teacher[];
  classes: ClassRoom[];
  students: Student[];
  parents?: Parent[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  homework: HomeworkItem[];
  lang: Language;
  onUpdateAttendance: (updated: AttendanceRecord) => void;
  onBatchUpdateAttendance?: (updatedList: AttendanceRecord[]) => void;
  onAddGrade: (grade: GradeRecord) => void;
  onBatchAddGrades?: (grades: GradeRecord[]) => void;
  onAddHomework: (hw: HomeworkItem) => void;
  onDeleteHomework?: (hwId: string) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentTeacher,
  allTeachers = [],
  classes,
  students,
  parents = [],
  attendance,
  grades,
  homework,
  lang,
  onUpdateAttendance,
  onBatchUpdateAttendance,
  onAddGrade,
  onBatchAddGrades,
  onAddHomework,
  onDeleteHomework,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'roll_call' | 'homework' | 'grades' | 'overview'>('roll_call');

  // Teacher's classes
  const teacherClasses = useMemo(() => {
    return classes.filter(c => 
      c.mainTeacherId === currentTeacher.id || 
      currentTeacher.classes.some(tcName => tcName.toLowerCase().includes(c.level.toLowerCase()) || tcName.includes(c.name))
    );
  }, [classes, currentTeacher]);

  const effectiveClasses = teacherClasses.length > 0 ? teacherClasses : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return effectiveClasses[0]?.id || classes[0]?.id || 'cls-1';
  });

  const selectedClass = classes.find(c => c.id === selectedClassId) || effectiveClasses[0] || classes[0];

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId || s.className === selectedClass.name);
  }, [students, selectedClassId, selectedClass]);

  // ROLL CALL STATE
  const [rollCallDate, setRollCallDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [rollCallTimeSlot, setRollCallTimeSlot] = useState<string>('08:30 - 10:00');
  const [rollCallSyncedNotice, setRollCallSyncedNotice] = useState<string | null>(null);

  // Quick mark all present
  const handleMarkAllPresent = () => {
    const recordsToSync: AttendanceRecord[] = classStudents.map(student => {
      const existing = attendance.find(a => a.studentId === student.id && a.date === rollCallDate);
      return {
        id: existing?.id || `att-${Date.now()}-${student.id}`,
        studentId: student.id,
        date: rollCallDate,
        status: 'present',
        timeSlot: rollCallTimeSlot,
        subject: currentTeacher.subject,
        subjectAr: currentTeacher.subjectAr,
        notifiedWhatsapp: existing?.notifiedWhatsapp || false,
        submittedByTeacherId: currentTeacher.id,
        submittedByTeacherName: currentTeacher.name,
        submittedByTeacherNameAr: currentTeacher.nameAr,
        submittedAt: new Date().toISOString(),
        adminValidated: false
      };
    });

    if (onBatchUpdateAttendance) {
      onBatchUpdateAttendance(recordsToSync);
    } else {
      recordsToSync.forEach(r => onUpdateAttendance(r));
    }

    setRollCallSyncedNotice(
      isRtl 
        ? 'تم تسجيل حضور جميع التلاميذ وإرسال ورقة المناداة إلى الإدارة.'
        : '✓ Tous les élèves ont été marqués présents et la feuille transmise à l\'administration.'
    );
    setTimeout(() => setRollCallSyncedNotice(null), 5000);
  };

  // Change individual student attendance
  const handleStudentStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    const existing = attendance.find(a => a.studentId === student.id && a.date === rollCallDate);
    const updated: AttendanceRecord = {
      id: existing?.id || `att-${Date.now()}-${student.id}`,
      studentId: student.id,
      date: rollCallDate,
      status: newStatus,
      timeSlot: rollCallTimeSlot,
      subject: currentTeacher.subject,
      subjectAr: currentTeacher.subjectAr,
      reason: existing?.reason || (newStatus === 'absent' ? 'Non justifié' : newStatus === 'late' ? 'Retard en classe' : undefined),
      reasonAr: existing?.reasonAr || (newStatus === 'absent' ? 'غير مبرر' : newStatus === 'late' ? 'تأخير في القسم' : undefined),
      delayMinutes: newStatus === 'late' ? (existing?.delayMinutes || 15) : undefined,
      isJustified: newStatus === 'excused' ? true : existing?.isJustified,
      parentNote: existing?.parentNote,
      parentJustifiedAt: existing?.parentJustifiedAt,
      notifiedWhatsapp: existing?.notifiedWhatsapp || false,
      submittedByTeacherId: currentTeacher.id,
      submittedByTeacherName: currentTeacher.name,
      submittedByTeacherNameAr: currentTeacher.nameAr,
      submittedAt: new Date().toISOString(),
      adminValidated: false
    };
    onUpdateAttendance(updated);
  };

  // Transmit attendance sheet to School Administration
  const handleTransmitRollCallToAdmin = () => {
    const recordsToSync: AttendanceRecord[] = classStudents.map(student => {
      const existing = attendance.find(a => a.studentId === student.id && a.date === rollCallDate);
      return {
        id: existing?.id || `att-${Date.now()}-${student.id}`,
        studentId: student.id,
        date: rollCallDate,
        status: existing?.status || 'present',
        timeSlot: rollCallTimeSlot,
        subject: currentTeacher.subject,
        subjectAr: currentTeacher.subjectAr,
        reason: existing?.reason,
        reasonAr: existing?.reasonAr,
        delayMinutes: existing?.delayMinutes,
        isJustified: existing?.isJustified,
        parentNote: existing?.parentNote,
        parentJustifiedAt: existing?.parentJustifiedAt,
        notifiedWhatsapp: existing?.notifiedWhatsapp || false,
        submittedByTeacherId: currentTeacher.id,
        submittedByTeacherName: currentTeacher.name,
        submittedByTeacherNameAr: currentTeacher.nameAr,
        submittedAt: new Date().toISOString(),
        adminValidated: false
      };
    });

    if (onBatchUpdateAttendance) {
      onBatchUpdateAttendance(recordsToSync);
    } else {
      recordsToSync.forEach(r => onUpdateAttendance(r));
    }

    const absentCount = recordsToSync.filter(r => r.status === 'absent').length;
    const lateCount = recordsToSync.filter(r => r.status === 'late').length;

    setRollCallSyncedNotice(
      isRtl
        ? `تم إرسال ورقة المناداة إلى الإدارة بنجاح (${absentCount} غياب، ${lateCount} تأخير). الإدارة تتكفل بمراسلة الأولياء.`
        : `✓ Feuille d'appel transmise avec succès à l'administration (${absentCount} absence(s), ${lateCount} retard(s)). L'administration assure seule le relais officiel avec les familles.`
    );
    setTimeout(() => setRollCallSyncedNotice(null), 6000);
  };

  // HOMEWORK STATE
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [hwEstimatedMinutes, setHwEstimatedMinutes] = useState(30);
  const [hwSuccessMsg, setHwSuccessMsg] = useState<string | null>(null);

  const classHomeworkList = useMemo(() => {
    return homework.filter(h => h.classId === selectedClassId || h.className === selectedClass.name);
  }, [homework, selectedClassId, selectedClass]);

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDesc.trim()) return;

    const newHw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      classId: selectedClass.id,
      className: selectedClass.name,
      classNameAr: selectedClass.nameAr,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      teacherNameAr: currentTeacher.nameAr,
      subject: currentTeacher.subject,
      subjectAr: currentTeacher.subjectAr,
      title: hwTitle.trim(),
      titleAr: hwTitle.trim(),
      description: hwDesc.trim(),
      descriptionAr: hwDesc.trim(),
      dueDate: hwDueDate,
      assignedDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: Number(hwEstimatedMinutes) || 30,
      status: 'active',
      submittedToAdmin: true,
      submittedAt: new Date().toISOString(),
      adminValidated: false
    };

    onAddHomework(newHw);
    setHwTitle('');
    setHwDesc('');
    setHwSuccessMsg(
      isRtl 
        ? 'تم نشر العمل المنزلي بنجاح وإرساله للإدارة ومزامنته مع الأولياء.'
        : '✓ Le travail à la maison a été transmis à l\'administration et synchronisé avec succès.'
    );
    setTimeout(() => setHwSuccessMsg(null), 5000);
  };

  const handleBroadcastHomeworkWhatsApp = (hwItem: HomeworkItem) => {
    const defaultMsg = isRtl
      ? `تحية طيبة للأولياء الكرام،\n\nإشعار رسمي من إدارة المؤسسة بخصوص عمل منزلي جديد (بطلب من الأستاذ ${currentTeacher.nameAr} - ${currentTeacher.subjectAr}) :\n\n📌 *القسم : ${selectedClass.nameAr}*\n📖 *الموضوع :* ${hwItem.title}\n📝 *التعليمات :* ${hwItem.description}\n⏳ *آخر أجل للتسليم :* ${hwItem.dueDate}\n⏱️ *المدة التقديرية :* ${hwItem.estimatedMinutes || 30} دقيقة\n\nمع فائق الشكر والتقدير.`
      : `Bonjour chers parents,\n\nNotification officielle transmise par l'Administration Scolaire (à la demande du professeur ${currentTeacher.name} - ${currentTeacher.subject}) :\n\n📌 *Travail à la maison - Classe : ${selectedClass.name}*\n📖 *Titre :* ${hwItem.title}\n📝 *Consignes :* ${hwItem.description}\n⏳ *Date limite de remise :* ${hwItem.dueDate}\n⏱️ *Durée estimée :* ${hwItem.estimatedMinutes || 30} minutes\n\nMerci d'assurer le suivi de vos enfants. Cordialement, La Direction.`;

    onOpenWhatsApp(
      isRtl ? `أولياء تلاميذ ${selectedClass.nameAr}` : `Administration - Parents ${selectedClass.name}`,
      '+21698123456',
      defaultMsg,
      selectedClass.name
    );
  };

  // GRADES ENTRY STATE
  const [examType, setExamType] = useState<string>('Devoir de Contrôle 1');
  const [examDate, setExamDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [maxScore, setMaxScore] = useState<number>(20);
  const [coefficient, setCoefficient] = useState<number>(2);
  const [scoresInput, setScoresInput] = useState<Record<string, { score: string; remarks: string }>>({});
  const [gradesSavedNotice, setGradesSavedNotice] = useState<string | null>(null);

  const currentClassGrades = useMemo(() => {
    return grades.filter(g => 
      g.subject === currentTeacher.subject &&
      g.examType === examType &&
      classStudents.some(s => s.id === g.studentId)
    );
  }, [grades, currentTeacher.subject, examType, classStudents]);

  const handleScoreChange = (studentId: string, value: string) => {
    setScoresInput(prev => ({
      ...prev,
      [studentId]: {
        score: value,
        remarks: prev[studentId]?.remarks || ''
      }
    }));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setScoresInput(prev => ({
      ...prev,
      [studentId]: {
        score: prev[studentId]?.score || '',
        remarks: value
      }
    }));
  };

  const handleSaveAllGrades = () => {
    const gradesToSave: GradeRecord[] = [];
    classStudents.forEach(student => {
      const studentInput = scoresInput[student.id];
      const existingGrade = currentClassGrades.find(g => g.studentId === student.id);
      
      const scoreStr = studentInput ? studentInput.score : existingGrade ? String(existingGrade.score) : '';
      if (scoreStr !== '' && !isNaN(Number(scoreStr))) {
        const numScore = Math.min(maxScore, Math.max(0, parseFloat(scoreStr)));
        const newGradeRecord: GradeRecord = {
          id: existingGrade?.id || `grd-${Date.now()}-${student.id}`,
          studentId: student.id,
          subject: currentTeacher.subject,
          subjectAr: currentTeacher.subjectAr,
          examType: examType,
          examTypeAr: examType === 'Devoir de Contrôle 1' ? 'فرض مراقبة 1' : examType === 'Devoir de Contrôle 2' ? 'فرض مراقبة 2' : examType === 'Devoir de Synthèse' ? 'فرض تأليفي' : examType,
          score: numScore,
          maxScore: maxScore,
          coefficient: coefficient,
          date: examDate,
          teacherRemarks: studentInput?.remarks || existingGrade?.teacherRemarks || 'Bon travail régulier',
          teacherRemarksAr: studentInput?.remarks || existingGrade?.teacherRemarksAr || 'عمل جاد ومثمر',
          submittedByTeacherId: currentTeacher.id,
          submittedByTeacherName: currentTeacher.name,
          submittedByTeacherNameAr: currentTeacher.nameAr,
          submittedAt: new Date().toISOString(),
          adminValidated: false
        };
        gradesToSave.push(newGradeRecord);
      }
    });

    if (gradesToSave.length > 0) {
      if (onBatchAddGrades) {
        onBatchAddGrades(gradesToSave);
      } else {
        gradesToSave.forEach(g => onAddGrade(g));
      }
    }

    setGradesSavedNotice(
      isRtl 
        ? `تم حفظ ${gradesToSave.length} عدد(اً) بنجاح وإرسالها إلى إدارة المدرسة وتحديث بطاقات الأعداد والمعدلات.`
        : `✓ ${gradesToSave.length} note(s) transmise(s) avec succès à l'administration scolaire. Les bulletins et moyennes des élèves ont été mis à jour.`
    );
    setTimeout(() => setGradesSavedNotice(null), 6000);
  };

  const gradeStats = useMemo(() => {
    const scores: number[] = [];
    classStudents.forEach(s => {
      const val = scoresInput[s.id]?.score;
      if (val !== undefined && val !== '' && !isNaN(Number(val))) {
        scores.push(parseFloat(val));
      } else {
        const existing = currentClassGrades.find(g => g.studentId === s.id);
        if (existing) scores.push(existing.score);
      }
    });
    if (scores.length === 0) return { avg: 0, min: 0, max: 0, passRate: 0, total: 0 };
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Number((sum / scores.length).toFixed(2));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const passCount = scores.filter(s => s >= 10).length;
    const passRate = Number(((passCount / scores.length) * 100).toFixed(1));
    return { avg, min, max, passRate, total: scores.length };
  }, [classStudents, scoresInput, currentClassGrades]);

  // OVERVIEW STATE
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewViewMode, setOverviewViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<Student | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [adminNoteSuccess, setAdminNoteSuccess] = useState<string | null>(null);

  const classMainTeacher = useMemo(() => {
    return allTeachers.find(t => t.id === selectedClass.mainTeacherId) || (selectedClass.mainTeacherId === currentTeacher.id ? currentTeacher : null);
  }, [allTeachers, selectedClass, currentTeacher]);

  const todayClassAttendance = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const classStudentIds = new Set(classStudents.map(s => s.id));
    const records = attendance.filter(a => a.date === todayStr && classStudentIds.has(a.studentId));
    const presents = records.filter(r => r.status === 'present').length;
    const absents = records.filter(r => r.status === 'absent').length;
    const lates = records.filter(r => r.status === 'late').length;
    const total = classStudents.length;
    const rate = total > 0 ? Math.round(((total - absents) / total) * 100) : 100;
    return { presents, absents, lates, rate, recordedCount: records.length };
  }, [attendance, classStudents]);

  const classAverage = useMemo(() => {
    const classStudentIds = new Set(classStudents.map(s => s.id));
    const classGradesList = grades.filter(g => classStudentIds.has(g.studentId));
    if (classGradesList.length > 0) {
      const sum = classGradesList.reduce((acc, g) => acc + g.score, 0);
      return (sum / classGradesList.length).toFixed(2);
    }
    if (classStudents.length > 0) {
      const sum = classStudents.reduce((acc, s) => acc + (s.averageGrade || 0), 0);
      return (sum / classStudents.length).toFixed(2);
    }
    return '14.50';
  }, [classStudents, grades]);

  const filteredOverviewStudents = useMemo(() => {
    const q = overviewSearch.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(s => 
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.firstNameAr.includes(q) ||
      s.lastNameAr.includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [classStudents, overviewSearch]);

  const handleSendAdminObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNote || !adminNoteText.trim()) return;

    const parent = (parents || []).find(p => p.id === selectedStudentForNote.parentId);
    const parentName = parent ? (isRtl ? parent.nameAr : parent.name) : (isRtl ? 'الولي' : 'Parent');
    const studentName = isRtl 
      ? `${selectedStudentForNote.firstNameAr} ${selectedStudentForNote.lastNameAr}`
      : `${selectedStudentForNote.firstName} ${selectedStudentForNote.lastName}`;

    const adminMessage = isRtl
      ? `تحية طيبة لإدارة المؤسسة / الرقابة العامة،\n\nمن المدرس: ${currentTeacher.nameAr} (${currentTeacher.subjectAr})\nالقسم: ${selectedClass.nameAr}\nبخصوص التلميذ(ة): ${studentName} (المعرف: ${selectedStudentForNote.id})\nالولي: ${parentName} (${parent?.phone || 'غير مسجل'})\n\n📌 *ملاحظة بيداغوجية موجهة للولي رسمياً :*\n${adminNoteText.trim()}\n\nيرجى التفضل بإشعار العائلة رسمياً. شكراً.`
      : `Bonjour à la Direction / Surveillance générale,\n\nDe la part du professeur : ${currentTeacher.name} (${currentTeacher.subject})\nClasse : ${selectedClass.name}\nConcernant l'élève : ${studentName} (ID : ${selectedStudentForNote.id})\nParent : ${parentName} (${parent?.phone || 'N/A'})\n\n📌 *Observation pédagogique à relayer officiellement au parent :*\n${adminNoteText.trim()}\n\nMerci à l'administration d'assurer le relais officiel avec la famille.`;

    onOpenWhatsApp(
      isRtl ? `إدارة المدرسة - متابعة ${studentName}` : `Direction - Suivi ${studentName}`,
      '+21698123456',
      adminMessage,
      studentName
    );

    setAdminNoteSuccess(
      isRtl
        ? `تم إرسال الملاحظة بخصوص ${studentName} إلى الإدارة لإشعار العائلة.`
        : `✓ L'observation concernant ${studentName} a été transmise à l'administration pour échange avec la famille.`
    );
    setAdminNoteText('');
    setSelectedStudentForNote(null);
    setTimeout(() => setAdminNoteSuccess(null), 6000);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner: Teacher Identity & Quick Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={currentTeacher.photo} 
              alt={currentTeacher.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {isRtl ? currentTeacher.nameAr : currentTeacher.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isRtl ? currentTeacher.subjectAr : currentTeacher.subject}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>✉️ {currentTeacher.email}</span>
                <span>📞 {currentTeacher.phone}</span>
              </p>
            </div>
          </div>

          {/* Active Class Selector */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <Users className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                {isRtl ? 'القسم النشط :' : 'Classe active :'}
              </label>
              <select
                id="teacher-select-class"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setScoresInput({});
                }}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer pr-4"
              >
                {effectiveClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {isRtl ? c.nameAr : c.name} ({c.studentCount} {isRtl ? 'تلميذاً' : 'élèves'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Sync Indicator Pill */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isRtl ? 'مزامنة مباشرة في الوقت الفعلي مع الإدارة وأولياء الأمور' : 'Synchronisation directe en temps réel avec l\'Administration et les Parents'}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
            <span>{isRtl ? 'الأقسام المسندة :' : 'Classes attribuées :'} <strong className="text-slate-800">{effectiveClasses.length}</strong></span>
            <span>•</span>
            <span>{isRtl ? 'تلاميذ القسم :' : 'Élèves de la classe :'} <strong className="text-slate-800">{classStudents.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <button
          id="teacher-tab-rollcall"
          onClick={() => setActiveSubTab('roll_call')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'roll_call'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isRtl ? 'مناداة الحضور' : 'Faire l\'appel'}</span>
        </button>
        <button
          id="teacher-tab-homework"
          onClick={() => setActiveSubTab('homework')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'homework'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isRtl ? 'عمل منزلي' : 'Travail à la maison'}</span>
          {classHomeworkList.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeSubTab === 'homework' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'}`}>
              {classHomeworkList.length}
            </span>
          )}
        </button>
        <button
          id="teacher-tab-grades"
          onClick={() => setActiveSubTab('grades')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'grades'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isRtl ? 'رصد الأعداد' : 'Saisie des notes'}</span>
        </button>
        <button
          id="teacher-tab-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isRtl ? 'دليل القسم' : 'Fiche de classe'}</span>
        </button>
      </div>

      {/* TAB 1: ROLL CALL */}
      {activeSubTab === 'roll_call' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? `ورقة المناداة : ${selectedClass.nameAr}` : `Feuille d'appel : ${selectedClass.name}`}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl 
                    ? 'يتم إرسال ورقة المناداة مباشرة إلى الإدارة التي تتولى حصرياً إشعار الأولياء.'
                    : 'La feuille d\'appel est transmise à l\'administration qui assure seule l\'intermédiaire avec les familles.'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="teacher-mark-all-present-btn"
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.markAllPresent}</span>
                </button>
                <button
                  id="teacher-transmit-admin-btn"
                  onClick={handleTransmitRollCallToAdmin}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isRtl ? 'إرسال إلى الإدارة' : 'Transmettre à l\'administration'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'تاريخ الحصة :' : 'Date de la séance :'}
                </label>
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={(e) => setRollCallDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'توقيت الحصة :' : 'Créneau horaire :'}
                </label>
                <select
                  value={rollCallTimeSlot}
                  onChange={(e) => setRollCallTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="08:30 - 10:00">08:30 - 10:00 (الحصة 1)</option>
                  <option value="10:15 - 12:00">10:15 - 12:00 (الحصة 2)</option>
                  <option value="14:00 - 15:30">14:00 - 15:30 (الحصة 3)</option>
                  <option value="15:45 - 17:30">15:45 - 17:30 (الحصة 4)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'المادة المعتمدة :' : 'Matière enseignée :'}
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
                  {isRtl ? currentTeacher.subjectAr : currentTeacher.subject}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>{isRtl ? 'مبدأ الوساطة الإدارية' : 'Principe d\'intermédiation administrative'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-200/70 text-blue-800 font-semibold">
                    {isRtl ? 'شؤون التلاميذ والإدارة' : 'Surveillance Générale & Direction'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  {isRtl 
                    ? 'يتم إرسال ورقة المناداة المنجزة من قبل الأستاذ إلى إدارة المدرسة التي تتولى حصرياً التواصل مع الأولياء ومتابعة التبريرات.'
                    : 'La feuille d\'appel réalisée par l\'enseignant est transmise directement à l\'administration de l\'école. L\'administration assure obligatoirement le rôle d\'intermédiaire exclusif avec les parents.'}
                </p>
              </div>
            </div>

            {rollCallSyncedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rollCallSyncedNotice}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" dir={isRtl ? 'rtl' : 'ltr'}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">{isRtl ? 'التلميذ' : 'Élève'}</th>
                    <th className="px-4 py-3 text-center">{isRtl ? 'حالة الحضور' : 'État de présence'}</th>
                    <th className="px-4 py-3">{isRtl ? 'السبب / التأخير' : 'Motif / Retard'}</th>
                    <th className="px-4 py-3 text-center">{isRtl ? 'الوضع الإداري' : 'Statut Administratif'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((student) => {
                    const record = attendance.find(a => a.studentId === student.id && a.date === rollCallDate) || {
                      id: `temp-${student.id}`,
                      studentId: student.id,
                      date: rollCallDate,
                      status: 'present' as AttendanceStatus,
                      timeSlot: rollCallTimeSlot,
                      notifiedWhatsapp: false
                    };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={student.photo} 
                              alt={student.firstName} 
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {isRtl ? `نسبة المواظبة: ${student.attendanceRate}%` : `Assiduité : ${student.attendanceRate}%`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1">
                            <button
                              id={`teacher-status-present-${student.id}`}
                              onClick={() => handleStudentStatusChange(student, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                record.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.present}
                            </button>
                            <button
                              id={`teacher-status-late-${student.id}`}
                              onClick={() => handleStudentStatusChange(student, 'late')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                record.status === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.late}
                            </button>
                            <button
                              id={`teacher-status-absent-${student.id}`}
                              onClick={() => handleStudentStatusChange(student, 'absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                record.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.absent}
                            </button>
                            <button
                              id={`teacher-status-excused-${student.id}`}
                              onClick={() => handleStudentStatusChange(student, 'excused')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                record.status === 'excused'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.excused}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {record.status !== 'present' ? (
                            <div className="space-y-1.5 max-w-xs">
                              {record.status === 'late' && (
                                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="font-bold text-amber-900 text-[11px]">{isRtl ? 'التأخير :' : 'Retard :'}</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={record.delayMinutes || 15}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 15;
                                      onUpdateAttendance({
                                        ...record,
                                        delayMinutes: val
                                      });
                                    }}
                                    className="w-12 bg-white border border-amber-300 rounded px-1 text-center font-bold text-xs"
                                  />
                                  <span className="text-amber-800 text-[11px]">{isRtl ? 'دق' : 'min'}</span>
                                </div>
                              )}
                              {record.parentNote && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-1 text-[11px]">
                                  <strong>{isRtl ? 'تبرير الولي:' : 'Justif. parent:'}</strong> "{record.parentNote}"
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
                                placeholder={isRtl ? 'سبب الغياب / ملاحظة...' : 'Motif / Remarque...'}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              {isRtl ? 'حاضر(ة) في الحصة' : 'Présent(e) en cours'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(record.status === 'absent' || record.status === 'late') ? (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border shadow-2xs ${
                                record.adminValidated
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                <span>
                                  {record.adminValidated 
                                    ? (isRtl ? 'مصادق من الإدارة' : 'Validé par l\'admin') 
                                    : (isRtl ? 'تم الإرسال للإدارة' : 'Transmis à la direction')}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isRtl ? 'وساطة رسمية' : 'Intermédiaire officiel'}
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{isRtl ? 'الإدارة المدرسية هي الوسيط المخول قانوناً بمراسلة الأولياء ومتابعة التبريرات.' : 'L\'administration scolaire est l\'unique intermédiaire habilité à contacter les parents et suivre les justificatifs.'}</span>
              </div>
              <button
                id="teacher-bottom-save-call-btn"
                onClick={handleTransmitRollCallToAdmin}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>{isRtl ? 'إرسال ورقة المناداة إلى الإدارة' : 'Transmettre la feuille d\'appel à l\'administration'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOMEWORK */}
      {activeSubTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>{isRtl ? 'إسناد عمل منزلي جديد' : 'Assigner un travail à la maison'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isRtl 
                  ? `سيظهر هذا العمل المنزلي مباشرة في فضاء أولياء أمور قسم ${selectedClass.nameAr} ولدى الإدارة.`
                  : `Ce travail sera immédiatement visible sur le portail des parents de ${selectedClass.name} et l'administration.`}
              </p>
            </div>

            {hwSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{hwSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'القسم المستهدف :' : 'Classe cible :'}
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                  {isRtl ? selectedClass.nameAr : selectedClass.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'المادة :' : 'Matière :'}
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800">
                  {isRtl ? currentTeacher.subjectAr : currentTeacher.subject}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'عنوان العمل المنزلي :' : 'Titre du travail :'}
                </label>
                <input
                  id="teacher-hw-title"
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder={isRtl ? 'تمارين 14 و15 ص 68 - هندسة' : 'Ex: Exercices 12 et 14 p. 45 - Géométrie'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRtl ? 'آخر أجل للتسليم :' : 'Date de remise :'}
                  </label>
                  <input
                    id="teacher-hw-duedate"
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRtl ? 'المدة التقديرية :' : 'Durée estimée :'}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id="teacher-hw-duration"
                      type="number"
                      min="5"
                      max="180"
                      value={hwEstimatedMinutes}
                      onChange={(e) => setHwEstimatedMinutes(parseInt(e.target.value) || 30)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">{isRtl ? 'دق' : 'min'}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'التعليمات والتفاصيل :' : 'Consignes détaillées & exercices :'}
                </label>
                <textarea
                  id="teacher-hw-desc"
                  rows={4}
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  placeholder={isRtl ? 'اكتب تفاصيل الواجب والملاحظات للتلاميذ...' : 'Détaillez les exercices à résoudre, le support (cahier de cours ou feuille double)...'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                ></textarea>
              </div>
              <button
                id="teacher-submit-hw-btn"
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? 'نشر وتزامن العمل المنزلي' : 'Publier et synchroniser le travail'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isRtl ? `الأعمال المنزلية لقسم ${selectedClass.nameAr}` : `Travaux programmés pour ${selectedClass.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl 
                      ? 'الواجبات متاحة فورياً للأولياء والإدارة.'
                      : 'Les devoirs sont directement visibles par les familles et l\'administration.'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {classHomeworkList.length} {isRtl ? 'أعمال مسجلة' : 'travaux'}
                </span>
              </div>

              {classHomeworkList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">{t.noHomeworkYet}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-4 space-y-3">
                  {classHomeworkList.map(hwItem => (
                    <div key={hwItem.id} className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {isRtl ? hwItem.subjectAr : hwItem.subject}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            {isRtl ? 'آخر أجل:' : 'Pour le :'} <strong>{hwItem.dueDate}</strong>
                          </span>
                          {hwItem.estimatedMinutes && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                              <Timer className="w-3 h-3 text-amber-600" />
                              {hwItem.estimatedMinutes} {isRtl ? 'دق' : 'min'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {isRtl ? (hwItem.titleAr || hwItem.title) : hwItem.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                          {isRtl ? (hwItem.descriptionAr || hwItem.description) : hwItem.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{isRtl ? 'المدرس :' : 'Enseignant :'} {isRtl ? hwItem.teacherNameAr : hwItem.teacherName}</span>
                          <span>•</span>
                          <span>{isRtl ? 'تاريخ التكليف :' : 'Assigné le :'} {hwItem.assignedDate}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleBroadcastHomeworkWhatsApp(hwItem)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title={isRtl ? 'نشر للأولياء عبر واتساب' : 'Diffuser aux parents sur WhatsApp'}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                        {onDeleteHomework && (
                          <button
                            onClick={() => onDeleteHomework(hwItem.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title={isRtl ? 'حذف هذا الواجب' : 'Supprimer ce travail'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>{t.cancel}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRADES ENTRY */}
      {activeSubTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>
                    {isRtl 
                      ? `رصد أعداد مادة ${currentTeacher.subjectAr} - قسم ${selectedClass.nameAr}`
                      : `Saisie des notes en ${currentTeacher.subject} - ${selectedClass.name}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl 
                    ? 'الأعداد المسجلة تحدث آلياً المعدلات وبطاقات الأعداد لدى الإدارة والأولياء.'
                    : 'Les notes saisies mettent à jour automatiquement les moyennes et les bulletins scolaires.'}
                </p>
              </div>

              {gradeStats.total > 0 && (
                <div className="flex items-center gap-3 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isRtl ? 'معدل القسم' : 'Moyenne classe'}</span>
                    <strong className="text-emerald-900 text-sm font-black">{gradeStats.avg} / {maxScore}</strong>
                  </div>
                  <div className="h-6 w-px bg-emerald-200"></div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isRtl ? 'نسبة النجاح' : 'Taux réussite'}</span>
                    <strong className="text-emerald-700 text-sm font-black">{gradeStats.passRate}%</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'نوع الامتحان :' : 'Type d\'évaluation :'}
                </label>
                <select
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    setScoresInput({});
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Devoir de Contrôle 1">{isRtl ? 'فرض مراقبة 1' : 'Devoir de Contrôle 1'}</option>
                  <option value="Devoir de Contrôle 2">{isRtl ? 'فرض مراقبة 2' : 'Devoir de Contrôle 2'}</option>
                  <option value="Devoir de Synthèse">{isRtl ? 'فرض تأليفي (Synthèse)' : 'Devoir de Synthèse'}</option>
                  <option value="Contrôle Continu">{isRtl ? 'مراقبة مستمرة' : 'Contrôle Continu'}</option>
                  <option value="Travaux Pratiques">{isRtl ? 'تطبيقي / شفاهي' : 'Travaux Pratiques / Oral'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'تاريخ الامتحان :' : 'Date de l\'évaluation :'}
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'العدد الأقصى (الباريم) :' : 'Barème note max :'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseInt(e.target.value) || 20)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {isRtl ? 'الضارب (Coef) :' : 'Coefficient :'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={coefficient}
                  onChange={(e) => setCoefficient(parseFloat(e.target.value) || 2)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {gradesSavedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gradesSavedNotice}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" dir={isRtl ? 'rtl' : 'ltr'}>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">{isRtl ? 'التلميذ' : 'Élève'}</th>
                    <th className="px-4 py-3 text-center">{isRtl ? 'العدد المتحصل عليه' : 'Note obtenue'}</th>
                    <th className="px-4 py-3">{isRtl ? 'ملاحظة الأستاذ' : 'Appréciation du professeur'}</th>
                    <th className="px-4 py-3 text-center">{isRtl ? 'الملاحظة' : 'Mention'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((student) => {
                    const existing = currentClassGrades.find(g => g.studentId === student.id);
                    const currentScoreVal = scoresInput[student.id]?.score !== undefined 
                      ? scoresInput[student.id].score 
                      : existing ? String(existing.score) : '';
                    const numScore = parseFloat(currentScoreVal);
                    const hasValidScore = !isNaN(numScore);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={student.photo} 
                              alt={student.firstName} 
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {isRtl ? `المعدل العام: ${student.averageGrade}/20` : `Moyenne générale: ${student.averageGrade}/20`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              id={`teacher-grade-input-${student.id}`}
                              type="number"
                              min="0"
                              max={maxScore}
                              step="0.25"
                              value={currentScoreVal}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              placeholder="0.00"
                              className={`w-20 px-2.5 py-1.5 rounded-xl border text-center font-black text-sm focus:outline-none focus:ring-2 ${
                                hasValidScore && numScore >= 14
                                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500/20'
                                  : hasValidScore && numScore >= 10
                                  ? 'border-blue-300 bg-blue-50/50 text-blue-900 focus:ring-blue-500/20'
                                  : hasValidScore
                                  ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500/20'
                                  : 'border-slate-200 bg-white text-slate-800 focus:ring-emerald-500/20'
                              }`}
                            />
                            <span className="text-xs font-bold text-slate-400">/ {maxScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={scoresInput[student.id]?.remarks !== undefined ? scoresInput[student.id].remarks : (isRtl ? existing?.teacherRemarksAr : existing?.teacherRemarks) || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            placeholder={isRtl ? 'ملاحظة بيداغوجية...' : 'Appréciation (ex: Très bon travail, poursuivre ainsi)...'}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasValidScore ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              numScore >= 16 ? 'bg-emerald-100 text-emerald-800' :
                              numScore >= 14 ? 'bg-teal-100 text-teal-800' :
                              numScore >= 12 ? 'bg-blue-100 text-blue-800' :
                              numScore >= 10 ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {numScore >= 16 ? (isRtl ? 'حسن جداً' : 'Très Bien') :
                               numScore >= 14 ? (isRtl ? 'حسن' : 'Bien') :
                               numScore >= 12 ? (isRtl ? 'قريب من الحسن' : 'Assez Bien') :
                               numScore >= 10 ? (isRtl ? 'متوسط' : 'Passable') :
                               (isRtl ? 'دون المتوسط' : 'Insuffisant')}
                            </span>
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isRtl ? 'الأعداد تسجل فوراً في السجلات المركزية وبطاقات الأعداد وتتاح مباشرة للأولياء.' : 'Toutes les notes saisies sont immédiatement répercutées sur les bulletins de l\'administration et des parents.'}</span>
              </div>
              <button
                id="teacher-save-grades-btn"
                onClick={handleSaveAllGrades}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveAndSyncGrades}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLASS OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-5">
          {adminNoteSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{adminNoteSuccess}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">
                      {isRtl ? `دليل قسم : ${selectedClass.nameAr}` : `Fiche de classe : ${selectedClass.name}`}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {isRtl ? (selectedClass.levelAr || selectedClass.level) : selectedClass.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>🏢 {isRtl ? 'المؤسسة التربوية' : 'Établissement Scolaire'}</span>
                    <span>🚪 {isRtl ? `القاعة : ${selectedClass.roomNumber}` : `Salle : ${selectedClass.roomNumber}`}</span>
                    <span>👨‍🏫 {isRtl ? 'الأستاذ الرئيسي : ' : 'Prof. Principal : '} 
                      <strong>{classMainTeacher ? (isRtl ? classMainTeacher.nameAr : classMainTeacher.name) : (isRtl ? 'إدارة الدراسات' : 'Direction des études')}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <button
                id="print-class-sheet-btn"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs self-start md:self-auto"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{isRtl ? 'طباعة القائمة' : 'Imprimer la fiche'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  {isRtl ? 'مجموع التلاميذ' : 'Effectif total'}
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {classStudents.length} <span className="text-xs font-semibold text-slate-400">/ {selectedClass.capacity || 30}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">
                  {isRtl ? 'حضور اليوم' : 'Présence du jour'}
                </span>
                <div className="text-xl font-black text-emerald-700 mt-0.5">
                  {todayClassAttendance.rate}% 
                  <span className="text-[11px] font-medium text-emerald-600 mr-1.5 ml-1.5">
                    ({todayClassAttendance.presents} {isRtl ? 'حاضر' : 'présents'})
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">
                  {isRtl ? 'معدل القسم' : 'Moyenne de classe'}
                </span>
                <div className="text-xl font-black text-blue-700 mt-0.5">
                  {classAverage} <span className="text-xs font-semibold text-blue-500">/ 20</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
                <span className="text-[11px] font-bold text-amber-700 uppercase block">
                  {isRtl ? 'الأعمال المنزلية' : 'Devoirs actifs'}
                </span>
                <div className="text-xl font-black text-amber-700 mt-0.5">
                  {classHomeworkList.length} <span className="text-xs font-semibold text-amber-600">{isRtl ? 'واجب' : 'devoir(s)'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-blue-900">
                {isRtl ? 'قاعدة الوساطة الإدارية الحصرية' : 'Règle de médiation administrative exclusive'}
              </div>
              <p className="text-blue-700/90 mt-0.5 leading-relaxed">
                {isRtl 
                  ? 'جميع الملاحظات وأوراق المناداة والأعمال المنزلية تمر عبر إدارة المؤسسة لضمان توثيق المراسلات الرسمية مع الأولياء.'
                  : 'Toutes les transmissions (feuilles d\'appel, saisies de notes, devoirs et observations) sont centralisées auprès de l\'administration scolaire (Surveillance générale). L\'administration assure seule le relais et le contact officiel avec les parents.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="overview-student-search"
                  type="text"
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  placeholder={isRtl ? 'بحث عن تلميذ بالاسم أو اللقب أو المعرف...' : 'Rechercher un élève par nom, prénom ou identifiant...'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setOverviewViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    overviewViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'جدول' : 'Tableau'}</span>
                </button>
                <button
                  onClick={() => setOverviewViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    overviewViewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'بطاقات' : 'Cartes'}</span>
                </button>
              </div>
            </div>

            {overviewViewMode === 'table' && (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                      <th className="py-3 px-3 text-start w-10">#</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'التلميذ' : 'Élève'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'المعرف' : 'Identifiant'}</th>
                      <th className="py-3 px-3 text-center">{isRtl ? 'حضور اليوم' : 'Statut aujourd\'hui'}</th>
                      <th className="py-3 px-3 text-center">{isRtl ? 'المعدل' : 'Moyenne'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'الولي المسؤول' : 'Parent responsable'}</th>
                      <th className="py-3 px-3 text-end">{isRtl ? 'إجراء إداري' : 'Action administrative'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOverviewStudents.map((student, idx) => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayRecord = attendance.find(a => a.studentId === student.id && a.date === todayStr);
                      const parent = (parents || []).find(p => p.id === student.parentId);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={student.photo} 
                                alt={student.firstName} 
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900">
                                  {isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {isRtl ? `${student.firstName} ${student.lastName}` : `${student.firstNameAr} ${student.lastNameAr}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {student.matricule || student.id}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {todayRecord?.status === 'present' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                {isRtl ? 'حاضر' : 'Présent'}
                              </span>
                            ) : todayRecord?.status === 'absent' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                {isRtl ? 'غائب' : 'Absent'}
                              </span>
                            ) : todayRecord?.status === 'late' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                {isRtl ? 'متأخر' : 'En retard'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                {isRtl ? 'مسجل' : 'Inscrit'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            <span className={`px-2 py-0.5 rounded-md ${
                              (student.averageGrade || 0) >= 14 ? 'bg-emerald-50 text-emerald-700' :
                              (student.averageGrade || 0) >= 10 ? 'bg-amber-50 text-amber-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {student.averageGrade}/20
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {parent ? (
                              <div>
                                <div className="font-semibold text-slate-800 text-[11px]">
                                  {isRtl ? parent.nameAr : parent.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {parent.relationship === 'Père' ? (isRtl ? 'أب' : 'Père') : (isRtl ? 'أم' : 'Mère')} • {parent.phone}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-end">
                            <button
                              onClick={() => setSelectedStudentForNote(student)}
                              className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer ml-auto transition-all"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'إشعار عبر الإدارة' : 'Notifier via l\'administration'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {overviewViewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredOverviewStudents.map(student => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const todayRecord = attendance.find(a => a.studentId === student.id && a.date === todayStr);
                  const parent = (parents || []).find(p => p.id === student.parentId);

                  return (
                    <div key={student.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={student.photo} 
                            alt={student.firstName} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {student.matricule || student.id}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-xs font-black text-slate-900">
                            {student.averageGrade}/20
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {isRtl ? 'المعدل' : 'Moyenne'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          {todayRecord?.status === 'present' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'حاضر اليوم' : 'Présent aujourd\'hui'}</span>
                            </span>
                          ) : todayRecord?.status === 'absent' ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'غائب اليوم' : 'Absent aujourd\'hui'}</span>
                            </span>
                          ) : todayRecord?.status === 'late' ? (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'متأخر اليوم' : 'En retard'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">{isRtl ? 'مسجل' : 'Inscrit'}</span>
                          )}
                        </span>
                        {parent && (
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {isRtl ? parent.nameAr : parent.name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedStudentForNote(student)}
                        className="w-full py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-blue-200/60"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'إشعار عبر الإدارة' : 'Notifier via l\'administration'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedStudentForNote && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'إرسال ملاحظة بيداغوجية للإدارة' : 'Transmettre une observation administrative'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isRtl 
                          ? `${selectedStudentForNote.firstNameAr} ${selectedStudentForNote.lastNameAr} - قسم ${selectedClass.nameAr}`
                          : `${selectedStudentForNote.firstName} ${selectedStudentForNote.lastName} - Classe ${selectedClass.name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudentForNote(null);
                      setAdminNoteText('');
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                  <p className="leading-relaxed">
                    {isRtl
                      ? 'ملاحظة مؤسسية: إدارة المؤسسة هي الوسيط الحصري المخول بمراسلة الأولياء. يتم تحويل هذه الملاحظة مباشرة إليها لإجراء اللازم.'
                      : 'Note institutionnelle : L\'administration scolaire assure le rôle d\'intermédiaire exclusif. Cette observation lui est directement transmise pour notification officielle de la famille.'}
                  </p>
                </div>

                <form onSubmit={handleSendAdminObservation} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'نص الملاحظة البيداغوجية أو السلوكية :' : 'Observation pédagogique ou de comportement :'}
                    </label>
                    <textarea
                      rows={4}
                      value={adminNoteText}
                      onChange={(e) => setAdminNoteText(e.target.value)}
                      placeholder={isRtl ? 'مثال: نرجو من العائلة الحرص على متابعة التمارين المنزلية بانتظام...' : 'Exemple: Travail régulier à encourager, prière d\'assurer le suivi des devoirs à la maison...'}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForNote(null);
                        setAdminNoteText('');
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إرسال للإدارة' : 'Transmettre à l\'administration'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
