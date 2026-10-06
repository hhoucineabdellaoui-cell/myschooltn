import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  FileText, 
  Filter, 
  X, 
  BookOpen, 
  Trash2,
  MessageSquare
} from 'lucide-react';
import { Student, Parent, ClassRoom, GradeRecord, Language, SchoolSubject } from '../../types';
import { useTranslation } from '../../translations';
import { generateGradeMessage } from '../../utils/whatsapp';

const INITIAL_SUBJECTS: SchoolSubject[] = [
  { id: 'sub-1', name: 'Mathématiques', nameAr: 'الرياضيات', code: 'MATH', coefficient: 4 },
  { id: 'sub-2', name: 'Langue Arabe', nameAr: 'اللغة العربية', code: 'ARAB', coefficient: 4 },
  { id: 'sub-3', name: 'Français', nameAr: 'اللغة الفرنسية', code: 'FRAN', coefficient: 3 },
  { id: 'sub-4', name: 'Sciences de la Vie et de la Terre', nameAr: 'علوم الحياة والأرض', code: 'SVT', coefficient: 2 },
  { id: 'sub-5', name: 'Histoire-Géographie', nameAr: 'التاريخ والجغرافيا', code: 'HG', coefficient: 2 },
  { id: 'sub-6', name: 'Anglais', nameAr: 'اللغة الإنجليزية', code: 'ANGL', coefficient: 2 },
  { id: 'sub-7', name: 'Informatique & Technologie', nameAr: 'الإعلامية والتكنولوجيا', code: 'INFO', coefficient: 1.5 },
  { id: 'sub-8', name: 'Éducation Islamique', nameAr: 'التربية الإسلامية', code: 'ISLM', coefficient: 1 },
  { id: 'sub-9', name: 'Éducation Civique', nameAr: 'التربية المدنية', code: 'CIVI', coefficient: 1 },
  { id: 'sub-10', name: 'Éducation Physique & Sportive', nameAr: 'التربية البدنية', code: 'EPS', coefficient: 1 }
];

interface GradesTabProps {
  students: Student[];
  parents: Parent[];
  classes: ClassRoom[];
  grades: GradeRecord[];
  lang: Language;
  onAddGrade: (grade: GradeRecord) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const GradesTab: React.FC<GradesTabProps> = ({
  students,
  parents,
  classes,
  grades,
  lang,
  onAddGrade,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-1');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState<SchoolSubject[]>(INITIAL_SUBJECTS);
  const [newSubName, setNewSubName] = useState('');
  const [newSubNameAr, setNewSubNameAr] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubCoef, setNewSubCoef] = useState(2);

  // Form State
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || 'stu-1');
  const [subject, setSubject] = useState('Mathématiques');
  const [subjectAr, setSubjectAr] = useState('الرياضيات');
  const [examType, setExamType] = useState<'Devoir 1' | 'Devoir 2' | 'Examen Trimestre' | 'Contrôle Continu'>('Examen Trimestre');
  const [score, setScore] = useState(17);
  const [maxScore, setMaxScore] = useState(20);
  const [coefficient, setCoefficient] = useState(4);
  const [remarks, setRemarks] = useState('Très bon travail');
  const [remarksAr, setRemarksAr] = useState('عمل متميز وجاد');

  const classStudents = students.filter(s => s.classId === selectedClassId);
  const studentIds = classStudents.map(s => s.id);
  const filteredGrades = grades.filter(g => {
    const isStudentInClass = studentIds.includes(g.studentId);
    const matchesSubject = selectedSubject === 'all' || g.subject === selectedSubject;
    return isStudentInClass && matchesSubject;
  });

  const subjectsList = Array.from(new Set([...subjects.map(s => s.name), ...grades.map(g => g.subject)]));

  const handleSelectSubjectPreset = (subName: string) => {
    const found = subjects.find(s => s.name === subName);
    if (found) {
      setSubject(found.name);
      setSubjectAr(found.nameAr);
      setCoefficient(found.coefficient);
    }
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newSub: SchoolSubject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      nameAr: newSubNameAr.trim() || newSubName.trim(),
      code: newSubCode.trim().toUpperCase() || newSubName.slice(0, 4).toUpperCase(),
      coefficient: Number(newSubCoef) || 1
    };
    setSubjects(prev => [...prev, newSub]);
    setNewSubName('');
    setNewSubNameAr('');
    setNewSubCode('');
    setNewSubCoef(2);
  };

  const handleDeleteSubject = (subId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subId));
  };

  const handleSendGradeWhatsApp = (grade: GradeRecord) => {
    const student = students.find(s => s.id === grade.studentId);
    if (!student) return;
    const parent = parents.find(p => p.id === student.parentId);
    if (!parent) return;

    const studentFullName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
    const parentFullName = isRtl ? parent.nameAr : parent.name;
    const message = generateGradeMessage(student, parent, grade, lang);
    onOpenWhatsApp(parentFullName, parent.phone, message, studentFullName);
  };

  const handleSendFullBulletinWhatsApp = (student: Student) => {
    const parent = parents.find(p => p.id === student.parentId);
    if (!parent) return;

    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentFullName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
    const parentFullName = isRtl ? parent.nameAr : parent.name;

    let bulletinText = '';
    if (isRtl) {
      bulletinText = `📄 بطاقة الأعداد الثلاثية - المؤسسة التربوية بتونس\nولي أمر التلميذ(ة) المحترم(ة): ${parent.nameAr}،\nإليكم بطاقة أعداد التلميذ(ة) *${studentFullName}* (${student.classNameAr}):\n-----------------------------------\n${studentGrades.map(g => `• ${g.subjectAr}: *${g.score}/${g.maxScore}* (ضارب ${g.coefficient}) [${g.examTypeAr}]`).join('\n')}\n-----------------------------------\n🎯 *المعدل الثلاثي :* ${student.averageGrade} / 20\n🏆 *الرتبة :* 2 من 28 تلميذاً\nمع أصدق التهاني بالنجاح والتميز المستمر!`;
    } else {
      bulletinText = `📄 *Bulletin Scolaire Trimestriel - Établissement Scolaire Tunisie*\nCher(e) M./Mme ${parent.name},\nVoici le relevé des notes de votre enfant *${studentFullName}* (${student.className}) :\n-----------------------------------\n${studentGrades.map(g => `• ${g.subject}: *${g.score}/${g.maxScore}* (Coef ${g.coefficient}) [${g.examType}]`).join('\n')}\n-----------------------------------\n🎯 *Moyenne Trimestrielle :* ${student.averageGrade} / 20\n🏆 *Classement :* 2ème sur 28 élèves\nFélicitations pour son implication et son sérieux !`;
    }

    onOpenWhatsApp(parentFullName, parent.phone, bulletinText, studentFullName);
  };

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrade: GradeRecord = {
      id: `grd-${Date.now()}`,
      studentId: targetStudentId,
      subject,
      subjectAr,
      examType,
      examTypeAr: examType === 'Examen Trimestre' ? 'امتحان ثلاثي' : 'فرض مراقبة',
      score: Number(score),
      maxScore: Number(maxScore),
      coefficient: Number(coefficient),
      date: new Date().toISOString().split('T')[0],
      teacherRemarks: remarks,
      teacherRemarksAr: remarksAr
    };

    onAddGrade(newGrade);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="grade-class-select"
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

          {/* Subject Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Award className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="grade-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">{isRtl ? 'جميع المواد' : 'Toutes les matières'}</option>
              {subjectsList.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-manage-subjects-btn"
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? 'إدارة المواد' : 'Ajouter une matière'}</span>
          </button>

          <button
            id="open-add-grade-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة عدد' : 'Ajouter une note'}</span>
          </button>
        </div>
      </div>

      {/* Class Students Report Cards Quick List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {t.generateBulletin}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? 'إرسال بطاقات الأعداد المكتملة عبر واتساب بنقرة واحدة' : 'Transmettre les bulletins complets par WhatsApp en un clic'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classStudents.map(student => {
            const studentName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
            return (
              <div key={student.id} className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img src={student.photo} alt={studentName} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{studentName}</div>
                    <div className="text-[11px] text-emerald-600 font-bold font-mono">
                      {isRtl ? 'المعدل :' : 'Moy :'} {student.averageGrade}/20
                    </div>
                  </div>
                </div>
                <button
                  id={`send-bulletin-btn-${student.id}`}
                  onClick={() => handleSendFullBulletinWhatsApp(student)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  title={t.sendBulletinWhatsApp}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{isRtl ? 'بطاقة الأعداد' : 'Bulletin'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">{t.gradesOverview}</h3>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredGrades.length} {isRtl ? 'تقييمات' : 'évaluations'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold">
                <th className="px-4 py-3 text-start">{t.students}</th>
                <th className="px-4 py-3 text-start">{t.subject}</th>
                <th className="px-4 py-3 text-start">{t.examType}</th>
                <th className="px-4 py-3 text-center">{t.score}</th>
                <th className="px-4 py-3 text-center">{t.coefficient}</th>
                <th className="px-4 py-3 text-start">{t.remarks}</th>
                <th className="px-4 py-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map(grade => {
                const student = students.find(s => s.id === grade.studentId);
                const studentName = student ? (isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`) : 'Élève';

                return (
                  <tr key={grade.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {studentName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {isRtl ? grade.subjectAr : grade.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium border border-slate-200/60">
                        {isRtl ? grade.examTypeAr : grade.examType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                        grade.score >= 16 ? 'bg-emerald-100 text-emerald-800' :
                        grade.score >= 12 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {grade.score}/{grade.maxScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                       {grade.coefficient}
                    </td>
                    <td className="px-4 py-3 text-slate-600 italic max-w-xs truncate">
                      {isRtl ? grade.teacherRemarksAr : grade.teacherRemarks}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        id={`notify-grade-btn-${grade.id}`}
                        onClick={() => handleSendGradeWhatsApp(grade)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs mx-auto cursor-pointer"
                        title={t.sendWhatsApp}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Grade Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{isRtl ? 'إسناد عدد لتلميذ' : 'Ajouter une note'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGrade} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.students}</label>
                <select
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? `${s.firstNameAr} ${s.lastNameAr}` : `${s.firstName} ${s.lastName}`} ({isRtl ? s.classNameAr : s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">{isRtl ? 'اختيار المادة' : 'Sélectionner la matière'}</label>
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsSubjectModalOpen(true); }}
                    className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isRtl ? '+ مادة جديدة' : '+ Créer matière'}</span>
                  </button>
                </div>
                <select
                  value={subject}
                  onChange={e => handleSelectSubjectPreset(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 mb-2"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {isRtl ? `${s.nameAr} (${s.name}) - ضارب ${s.coefficient}` : `${s.name} (${s.nameAr}) - Coef ${s.coefficient}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom matière (FR)</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المادة (AR)</label>
                  <input
                    type="text"
                    value={subjectAr}
                    onChange={e => setSubjectAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Note</label>
                  <input
                    type="number"
                    step="0.25"
                    max="20"
                    min="0"
                    required
                    value={score}
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barème</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={e => setMaxScore(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coefficient</label>
                  <input
                    type="number"
                    value={coefficient}
                    onChange={e => setCoefficient(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Remarques & appréciations</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  placeholder="Ex: Excellent investissement..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Management Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{isRtl ? 'إدارة المواد والضوارب' : 'Gestion des Matières Scolaires'}</h3>
                  <p className="text-xs text-white/60">{isRtl ? 'إضافة وتحديد ضوارب المواد في المنظومة التونسية' : 'Ajouter, paramétrer les coefficients et gérer les matières'}</p>
                </div>
              </div>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Add New Subject Form */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>{isRtl ? 'إضافة مادة تعليمية جديدة' : 'Ajouter une nouvelle matière'}</span>
                </h4>
                <form onSubmit={handleCreateSubject} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nom (Français) *</label>
                      <input
                        type="text"
                        required
                        value={newSubName}
                        onChange={e => setNewSubName(e.target.value)}
                        placeholder="Ex: Sciences Physiques"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">المادة (بالعربية) *</label>
                      <input
                        type="text"
                        required
                        value={newSubNameAr}
                        onChange={e => setNewSubNameAr(e.target.value)}
                        placeholder="العلوم الفيزيائية"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs focus:ring-2 focus:ring-emerald-500"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Code / Abréviation</label>
                      <input
                        type="text"
                        value={newSubCode}
                        onChange={e => setNewSubCode(e.target.value)}
                        placeholder="Ex: PHYS"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Coefficient (الضارب) *</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="10"
                        required
                        value={newSubCoef}
                        onChange={e => setNewSubCoef(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'حفظ المادة' : 'Enregistrer la matière'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Subjects Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isRtl ? `المواد المسجلة (${subjects.length})` : `Matières enregistrées (${subjects.length})`}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {isRtl ? 'البرامج الرسمية التونسية' : 'Curriculum tunisien'}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-start">
                    <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5 text-start">Code</th>
                        <th className="px-3.5 py-2.5 text-start">{isRtl ? 'المادة (فرنسية / عربية)' : 'Matière (FR / AR)'}</th>
                        <th className="px-3.5 py-2.5 text-center">{isRtl ? 'الضارب' : 'Coefficient'}</th>
                        <th className="px-3.5 py-2.5 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-600 text-[11px]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {sub.code}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-slate-900">{sub.name}</div>
                            <div className="text-[11px] text-slate-500">{sub.nameAr}</div>
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <span className="font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs">
                              × {sub.coefficient}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(sub.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title={isRtl ? 'حذف المادة' : 'Supprimer la matière'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
