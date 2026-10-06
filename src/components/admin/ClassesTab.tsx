import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  Users, 
  GraduationCap, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  DoorClosed,
  ArrowRight
} from 'lucide-react';
import { ClassRoom, Student, Teacher, Parent, Language } from '../../types';
import { useTranslation } from '../../translations';

interface ClassesTabProps {
  classes: ClassRoom[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  lang: Language;
  onAddClass: (newClass: ClassRoom) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onDeleteClass: (classId: string, reassignedClassId?: string) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string) => void;
  onNavigateToStudents?: (classId: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  students,
  teachers,
  parents,
  lang,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onOpenWhatsApp,
  onNavigateToStudents
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Primaire' | 'Collège' | 'Lycée'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [viewStudentsClass, setViewStudentsClass] = useState<ClassRoom | null>(null);

  // Form State for Add
  const [newClass, setNewClass] = useState<Omit<ClassRoom, 'id' | 'studentCount'>>({
    name: '',
    nameAr: '',
    level: 'Primaire',
    roomNumber: '',
    mainTeacherId: teachers[0]?.id || ''
  });

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.nameAr.includes(searchTerm) ||
      cls.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || cls.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getClassStudentCount = (classId: string) => {
    return students.filter(s => s.classId === classId).length;
  };

  const totalStudents = students.length;
  const averageStudentsPerClass = classes.length > 0 
    ? Math.round(totalStudents / classes.length) 
    : 0;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;

    const created: ClassRoom = {
      id: `cls-${Date.now()}`,
      name: newClass.name.trim(),
      nameAr: newClass.nameAr.trim() || newClass.name.trim(),
      level: newClass.level,
      roomNumber: newClass.roomNumber.trim() || (isRtl ? 'قاعة 101' : 'Salle 101'),
      mainTeacherId: newClass.mainTeacherId,
      studentCount: 0
    };

    onAddClass(created);
    setIsAddModalOpen(false);
    setNewClass({
      name: '',
      nameAr: '',
      level: 'Primaire',
      roomNumber: '',
      mainTeacherId: teachers[0]?.id || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editingClass.name.trim()) return;

    onUpdateClass({
      ...editingClass,
      name: editingClass.name.trim(),
      nameAr: editingClass.nameAr.trim() || editingClass.name.trim(),
      roomNumber: editingClass.roomNumber.trim()
    });
    setEditingClass(null);
  };

  const handleConfirmDelete = () => {
    if (!classToDelete) return;
    onDeleteClass(classToDelete.id, reassignTargetId || undefined);
    setClassToDelete(null);
    setReassignTargetId('');
  };

  const handleBroadcastClassParents = (cls: ClassRoom) => {
    const classStudents = students.filter(s => s.classId === cls.id);
    const parentIds = Array.from(new Set(classStudents.map(s => s.parentId).filter(Boolean)));
    const classParents = parents.filter(p => parentIds.includes(p.id));
    const clsName = isRtl ? cls.nameAr : cls.name;
    const defaultMsg = isRtl
      ? `تحية طيبة لأولياء أمور قسم ${clsName}...`
      : `Bonjour chers parents des élèves de la classe ${clsName}, nous vous informons concernant le déroulement des cours...`;

    const samplePhone = classParents[0]?.phone || '+216 98 123 456';
    onOpenWhatsApp(
      isRtl ? `أولياء قسم ${clsName} (${classParents.length})` : `Parents de la classe ${clsName} (${classParents.length})`,
      samplePhone,
      defaultMsg
    );
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Header & Metrics Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {isRtl ? 'الأقسام والفصول البيداغوجية' : 'Classes & Groupes Pédagogiques'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isRtl 
                  ? 'إدارة الأقسام، المستويات، القاعات والأساتذة الرئيسيون'
                  : 'Gestion des classes, niveaux scolaires, salles et professeurs principaux'}
              </p>
            </div>
          </div>
          <button
            id="add-class-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إحداث قسم جديد' : 'Créer une classe'}</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isRtl ? 'مجموع الأقسام' : 'Total Classes'}
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{classes.length}</div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {isRtl ? 'التلاميذ المسجلون' : 'Élèves Inscrits'}
            </div>
            <div className="text-xl font-black text-emerald-900 mt-1">{totalStudents}</div>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              {isRtl ? 'معدل التلاميذ / قسم' : 'Moyenne / Classe'}
            </div>
            <div className="text-xl font-black text-blue-900 mt-1">
              {averageStudentsPerClass} <span className="text-xs font-normal">{isRtl ? 'تلميذاً' : 'élèves'}</span>
            </div>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              {isRtl ? 'الأساتذة الرئيسيون' : 'Prof. Principaux'}
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">{teachers.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isRtl ? 'بحث عن قسم أو قاعة أو مستوى...' : 'Rechercher une classe, salle, niveau...'}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Primaire', 'Collège', 'Lycée'] as const).map(lvl => {
            const isSelected = levelFilter === lvl;
            const labels: Record<string, { fr: string; ar: string }> = {
              all: { fr: 'Tous les niveaux', ar: 'جميع المستويات' },
              Primaire: { fr: 'Primaire', ar: 'ابتدائي' },
              Collège: { fr: 'Collège', ar: 'إعدادي' },
              Lycée: { fr: 'Lycée', ar: 'ثانوي' }
            };
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {isRtl ? labels[lvl].ar : labels[lvl].fr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isRtl ? 'لا توجد أقسام مطابقة' : 'Aucune classe trouvée'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isRtl 
              ? 'يرجى تغيير معايير البحث أو الضغط على "إحداث قسم جديد" لإضافة قسم.' 
              : 'Modifiez vos critères de recherche ou cliquez sur "Créer une classe" pour ajouter un groupe.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            {isRtl ? 'إحداث قسم الآن' : 'Créer une classe maintenant'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map(cls => {
            const currentStudentsCount = getClassStudentCount(cls.id);
            const teacher = teachers.find(t => t.id === cls.mainTeacherId);
            const teacherName = teacher 
              ? (isRtl ? teacher.nameAr : teacher.name) 
              : (isRtl ? 'غير محدد' : 'Non assigné');

            const levelBadgeColor = 
              cls.level === 'Primaire' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              cls.level === 'Collège' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-indigo-50 text-indigo-700 border-indigo-200';

            return (
              <div 
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelBadgeColor}`}>
                      {cls.level}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      <DoorClosed className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cls.roomNumber}</span>
                    </span>
                  </div>

                  {/* Class Name */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {isRtl ? cls.nameAr : cls.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {isRtl ? cls.name : cls.nameAr}
                    </div>
                  </div>

                  {/* Principal Teacher */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {teacher?.photo ? (
                        <img src={teacher.photo} alt={teacherName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {isRtl ? 'الأستاذ الرئيسي' : 'Professeur Principal'}
                        </div>
                        <div className="text-xs font-bold text-slate-800">{teacherName}</div>
                      </div>
                    </div>
                    {teacher && (
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {isRtl ? teacher.subjectAr : teacher.subject}
                      </span>
                    )}
                  </div>

                  {/* Students Enrolled Indicator */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-900">
                        {isRtl ? 'عدد التلاميذ' : 'Effectif Élèves'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                      {currentStudentsCount}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewStudentsClass(cls)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      title={isRtl ? 'عرض تلاميذ هذا القسم' : 'Voir les élèves de cette classe'}
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isRtl ? 'التلاميذ' : 'Élèves'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBroadcastClassParents(cls)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                      title={isRtl ? 'مراسلة أولياء القسم عبر واتساب' : 'WhatsApp aux parents de la classe'}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingClass({ ...cls })}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                      title={isRtl ? 'تعديل بيانات القسم' : 'Modifier cette classe'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClassToDelete(cls);
                        const otherClasses = classes.filter(c => c.id !== cls.id);
                        setReassignTargetId(otherClasses[0]?.id || '');
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                      title={isRtl ? 'حذف هذا القسم' : 'Supprimer cette classe'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD CLASS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isRtl ? 'إحداث قسم جديد' : 'Créer une nouvelle classe'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)} 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 text-xs flex-1 overflow-y-auto min-h-0">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'اسم القسم (بالفرنسية) *' : 'Nom de la classe (FR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.name}
                    onChange={e => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: 8ème Année de Base - B"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'اسم القسم (بالعربية) *' : 'Nom de la classe (AR) *'}
                  </label>
                  <input
                    type="text"
                    value={newClass.nameAr}
                    onChange={e => setNewClass(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="السنة الثامنة أساسي - ب"
                    dir="rtl"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {isRtl ? 'المستوى التعليمي *' : 'Niveau d\'enseignement *'}
                    </label>
                    <select
                      value={newClass.level}
                      onChange={e => setNewClass(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Primaire">{isRtl ? 'ابتدائي (Primaire)' : 'Primaire'}</option>
                      <option value="Collège">{isRtl ? 'إعدادي (Collège)' : 'Collège'}</option>
                      <option value="Lycée">{isRtl ? 'ثانوي (Lycée)' : 'Lycée'}</option>
                      <option value="Autre">{isRtl ? 'أخرى' : 'Autre'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {isRtl ? 'قاعة الدرس' : 'Salle de classe'}
                    </label>
                    <input
                      type="text"
                      value={newClass.roomNumber}
                      onChange={e => setNewClass(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="Ex: Salle Carthage 103"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'الأستاذ الرئيسي' : 'Professeur Principal'}
                  </label>
                  <select
                    value={newClass.mainTeacherId}
                    onChange={e => setNewClass(prev => ({ ...prev, mainTeacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="">{isRtl ? '-- حدد الأستاذ الرئيسي --' : '-- Sélectionner un enseignant --'}</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {isRtl ? `${t.nameAr} (${t.subjectAr})` : `${t.name} (${t.subject})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer text-xs transition-all"
                >
                  {isRtl ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'تأكيد وإحداث القسم' : 'Valider et créer la classe'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLASS MODAL */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isRtl 
                    ? `تعديل القسم : ${editingClass.nameAr || editingClass.name}`
                    : `Modifier la classe : ${editingClass.name}`}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingClass(null)} 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 text-xs flex-1 overflow-y-auto min-h-0">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'اسم القسم (FR) *' : 'Nom de la classe (FR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClass.name}
                    onChange={e => setEditingClass({ ...editingClass, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'اسم القسم (AR) *' : 'Nom de la classe (AR) *'}
                  </label>
                  <input
                    type="text"
                    value={editingClass.nameAr}
                    onChange={e => setEditingClass({ ...editingClass, nameAr: e.target.value })}
                    dir="rtl"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {isRtl ? 'المستوى التعليمي *' : 'Niveau d\'enseignement *'}
                    </label>
                    <select
                      value={editingClass.level}
                      onChange={e => setEditingClass({ ...editingClass, level: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Primaire">{isRtl ? 'ابتدائي (Primaire)' : 'Primaire'}</option>
                      <option value="Collège">{isRtl ? 'إعدادي (Collège)' : 'Collège'}</option>
                      <option value="Lycée">{isRtl ? 'ثانوي (Lycée)' : 'Lycée'}</option>
                      <option value="Autre">{isRtl ? 'أخرى' : 'Autre'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {isRtl ? 'قاعة الدرس' : 'Salle de classe'}
                    </label>
                    <input
                      type="text"
                      value={editingClass.roomNumber}
                      onChange={e => setEditingClass({ ...editingClass, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isRtl ? 'الأستاذ الرئيسي' : 'Professeur Principal'}
                  </label>
                  <select
                    value={editingClass.mainTeacherId}
                    onChange={e => setEditingClass({ ...editingClass, mainTeacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">{isRtl ? '-- حدد الأستاذ الرئيسي --' : '-- Sélectionner un enseignant --'}</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {isRtl ? `${t.nameAr} (${t.subjectAr})` : `${t.name} (${t.subject})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer text-xs transition-all"
                >
                  {isRtl ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-600/20 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ التعديلات' : 'Valider les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CLASS MODAL */}
      {classToDelete && (() => {
        const enrolledStudents = students.filter(s => s.classId === classToDelete.id);
        const otherClasses = classes.filter(c => c.id !== classToDelete.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    {isRtl ? 'تأكيد حذف القسم' : 'Confirmer la suppression'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isRtl 
                      ? `هل أنت متأكد من حذف القسم "${classToDelete.nameAr || classToDelete.name}" نهائياً؟`
                      : `Êtes-vous sûr de vouloir supprimer définitivement la classe "${classToDelete.name}" ?`}
                  </p>
                </div>
                {enrolledStudents.length > 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {isRtl 
                          ? `تنبيه: يحتوي هذا القسم على ${enrolledStudents.length} تلميذ(اً)`
                          : `Attention : cette classe contient ${enrolledStudents.length} élève(s)`}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {isRtl 
                        ? 'اختر قسماً بديلاً لتحويل التلاميذ إليه تلقائياً :'
                        : 'Sélectionnez une classe cible pour réaffecter automatiquement ces élèves :'}
                    </p>
                    {otherClasses.length > 0 ? (
                      <select
                        value={reassignTargetId}
                        onChange={e => setReassignTargetId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer"
                      >
                        {otherClasses.map(oc => (
                          <option key={oc.id} value={oc.id}>
                            {isRtl ? oc.nameAr : oc.name} ({oc.level})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[10px] text-rose-600 italic">
                        {isRtl ? 'لا توجد أقسام أخرى متاحة للتحويل.' : 'Aucune autre classe disponible pour le transfert.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
                >
                  {isRtl ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/20 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRtl ? 'تأكيد الحذف' : 'Supprimer la classe'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW STUDENTS OF CLASS MODAL */}
      {viewStudentsClass && (() => {
        const classStudents = students.filter(s => s.classId === viewStudentsClass.id);
        const clsName = isRtl ? viewStudentsClass.nameAr : viewStudentsClass.name;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold">
                      {isRtl ? `تلاميذ قسم : ${clsName}` : `Élèves de : ${clsName}`}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      {classStudents.length} {isRtl ? 'تلميذاً مسجلاً' : 'élève(s) inscrit(s)'}
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setViewStudentsClass(null)} 
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-2 flex-1 overflow-y-auto min-h-0 text-xs">
                {classStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-semibold">
                      {isRtl ? 'لا يوجد تلاميذ مسجلون في هذا القسم حالياً' : 'Aucun élève inscrit dans cette classe pour le moment'}
                    </p>
                  </div>
                ) : (
                  classStudents.map((stu, index) => {
                    const stuName = isRtl ? `${stu.firstNameAr} ${stu.lastNameAr}` : `${stu.firstName} ${stu.lastName}`;
                    const parent = parents.find(p => p.id === stu.parentId);
                    return (
                      <div
                        key={stu.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-400 w-4 text-center">
                            {index + 1}
                          </span>
                          <img src={stu.photo} alt={stuName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100" />
                          <div>
                            <div className="font-bold text-slate-900">{stuName}</div>
                            <div className="text-[10px] text-slate-500">
                              {parent ? (isRtl ? `الولي: ${parent.nameAr}` : `Parent: ${parent.name}`) : (isRtl ? 'بدون ولي' : 'Sans tuteur')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {stu.averageGrade}/20
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
                {onNavigateToStudents && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewStudentsClass(null);
                      onNavigateToStudents(viewStudentsClass.id);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isRtl ? 'إدارة في تبويب التلاميذ' : 'Gérer dans l\'onglet élèves'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewStudentsClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer text-xs ml-auto"
                >
                  {isRtl ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
