import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Eye, 
  UserCheck, 
  Utensils, 
  Bus,
  X,
  Check,
  Pencil,
  Trash2,
  Upload,
  Camera,
  Sparkles
} from 'lucide-react';
import { Student, Parent, ClassRoom, Language } from '../../types';
import { useTranslation } from '../../translations';

interface StudentsTabProps {
  students: Student[];
  parents: Parent[];
  classes: ClassRoom[];
  lang: Language;
  onSelectStudent: (student: Student) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  parents,
  classes,
  lang,
  onSelectStudent,
  onOpenWhatsApp,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [newMatricule, setNewMatricule] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newFirstNameAr, setNewFirstNameAr] = useState('');
  const [newLastNameAr, setNewLastNameAr] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'cls-1');
  const [newParentId, setNewParentId] = useState(parents[0]?.id || 'par-1');
  const [newBirthDate, setNewBirthDate] = useState('2015-06-15');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newCanteen, setNewCanteen] = useState(true);
  const [newTransport, setNewTransport] = useState(true);

  // Edit and Delete Student State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isEditPhotoDragging, setIsEditPhotoDragging] = useState(false);

  useEffect(() => {
    if (parents.length > 0 && (!newParentId || !parents.some(p => p.id === newParentId))) {
      setNewParentId(parents[0].id);
    }
  }, [parents, newParentId]);

  const handlePhotoFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoFile = (file?: File) => {
    if (!file || !editingStudent) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingStudent({
          ...editingStudent,
          photo: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const generateAutoMatricule = () => {
    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(100 + Math.random() * 900);
    return `TUN-${currentYear}-${randomSeq}`;
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.firstNameAr.includes(searchTerm) ||
      student.lastNameAr.includes(searchTerm) ||
      (student.matricule && student.matricule.toLowerCase().includes(searchLower)) ||
      student.id.toLowerCase().includes(searchLower);

    const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
    return matchesSearch && matchesClass;
  });

  const handleWhatsAppClick = (student: Student) => {
    const parent = parents.find(p => p.id === student.parentId);
    if (!parent) return;
    const studentFullName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
    const parentFullName = isRtl ? parent.nameAr : parent.name;
    const defaultMsg = isRtl
      ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، تتواصل معكم إدارة المؤسسة بخصوص التلميذ(ة) ${studentFullName}.`
      : `Bonjour M./Mme ${parent.name}, l'administration de l'établissement scolaire vous contacte au sujet de ${studentFullName}.`;
    onOpenWhatsApp(parentFullName, parent.phone, defaultMsg, studentFullName);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const selectedCls = classes.find(c => c.id === editingStudent.classId);
    const updated: Student = {
      ...editingStudent,
      className: selectedCls?.name || editingStudent.className,
      classNameAr: selectedCls?.nameAr || editingStudent.classNameAr
    };
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    setEditingStudent(null);
  };

  const handleConfirmDeleteStudent = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
    }
    setStudentToDelete(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;
    const selectedCls = classes.find(c => c.id === newClassId);
    const resolvedParentId = newParentId && parents.some(p => p.id === newParentId)
      ? newParentId
      : (parents[0]?.id || '');
    const finalMatricule = newMatricule.trim() || generateAutoMatricule();

    const student: Student = {
      id: `stu-${Date.now()}`,
      matricule: finalMatricule,
      firstName: newFirstName,
      lastName: newLastName,
      firstNameAr: newFirstNameAr || newFirstName,
      lastNameAr: newLastNameAr || newLastName,
      classId: newClassId,
      className: selectedCls?.name || 'Classe',
      classNameAr: selectedCls?.nameAr || 'قسم',
      parentId: resolvedParentId,
      photo: newPhoto || (newGender === 'M' 
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=250'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'),
      birthDate: newBirthDate,
      gender: newGender,
      bloodType: 'O+',
      canteenSubscribed: newCanteen,
      transportSubscribed: newTransport,
      attendanceRate: 100,
      averageGrade: 16.0
    };
    onAddStudent(student);
    setIsAddModalOpen(false);
    setNewMatricule('');
    setNewPhoto('');
    setNewFirstName('');
    setNewLastName('');
    setNewFirstNameAr('');
    setNewLastNameAr('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            id="student-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="student-class-filter"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">{t.allClasses}</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {isRtl ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="open-add-student-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addStudent}</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
                <th className="px-4 py-3.5 text-start">{t.students}</th>
                <th className="px-4 py-3.5 text-start">{t.classGroup}</th>
                <th className="px-4 py-3.5 text-start">{t.parents}</th>
                <th className="px-4 py-3.5 text-center">{t.studentAverage}</th>
                <th className="px-4 py-3.5 text-center">{t.attendanceRate}</th>
                <th className="px-4 py-3.5 text-center">{isRtl ? 'الخدمات' : 'Services'}</th>
                <th className="px-4 py-3.5 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((student) => {
                const parent = parents.find(p => p.id === student.parentId);
                const studentName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
                const parentName = parent ? (isRtl ? parent.nameAr : parent.name) : '-';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photo}
                          alt={studentName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{studentName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {student.matricule ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200/60">
                                <span>{isRtl ? 'معرف:' : 'Mat:'}</span>
                                <span>{student.matricule}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">ID: {student.id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/50">
                        {isRtl ? student.classNameAr : student.className}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {parent ? (
                        <>
                          <div className="font-semibold text-slate-800">{parentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                            {parent.phone}
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingStudent({ ...student })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                          title={isRtl ? 'ربط بولي أمر' : 'Cliquer pour rattacher à un parent'}
                        >
                          <UserCheck className="w-3 h-3 text-amber-600" />
                          <span>{isRtl ? '+ ربط بولي' : '+ Rattacher'}</span>
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                        student.averageGrade >= 16 ? 'bg-emerald-100 text-emerald-800' :
                        student.averageGrade >= 12 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {student.averageGrade}/20
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-bold text-slate-700">
                        {student.attendanceRate}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {student.canteenSubscribed && (
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600" title={isRtl ? 'المطعم' : 'Cantine'}>
                            <Utensils className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {student.transportSubscribed && (
                          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600" title={isRtl ? 'النقل' : 'Transport'}>
                            <Bus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`whatsapp-student-${student.id}-btn`}
                          onClick={() => handleWhatsAppClick(student)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title={t.sendWhatsApp}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          id={`view-student-${student.id}-btn`}
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title={t.viewDetails}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-student-${student.id}-btn`}
                          onClick={() => setEditingStudent({ ...student })}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title={isRtl ? 'تعديل التلميذ' : 'Modifier cet élève'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-student-${student.id}-btn`}
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title={isRtl ? 'حذف التلميذ' : 'Supprimer cet élève'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold">{t.addStudent}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                {/* Photo Upload & Matricule Section */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{isRtl ? 'صورة التلميذ' : 'Photo de l\'élève'}</span>
                    </span>
                    {newPhoto && (
                      <button
                        type="button"
                        onClick={() => setNewPhoto('')}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        {isRtl ? 'إزالة الصورة' : 'Effacer la photo'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white shadow-2xs shrink-0 flex items-center justify-center group">
                      {newPhoto ? (
                        <img
                          src={newPhoto}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Camera className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsPhotoDragging(true); }}
                      onDragLeave={() => setIsPhotoDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsPhotoDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handlePhotoFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                        isPhotoDragging 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 bg-white'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold mb-0.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isRtl ? 'تحميل صورة' : 'Importer une photo'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isRtl ? 'انقر أو اسحب ملف الصورة (PNG, JPG)' : 'Cliquer ou glisser-déposer (PNG, JPG)'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block">
                        {isRtl ? 'المعرف الفريد (Matricule)' : 'Matricule (Identifiant unique)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewMatricule(generateAutoMatricule())}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isRtl ? 'توليد آلي' : 'Générer auto'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newMatricule}
                      onChange={e => setNewMatricule(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="Ex: TUN-2024-009"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prénom (Français)</label>
                    <input
                      type="text"
                      required
                      value={newFirstName}
                      onChange={e => setNewFirstName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Yassine"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nom (Français)</label>
                    <input
                      type="text"
                      required
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Bennani"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الاسم (بالعربية)</label>
                    <input
                      type="text"
                      value={newFirstNameAr}
                      onChange={e => setNewFirstNameAr(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      placeholder="ياسين"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اللقب (بالعربية)</label>
                    <input
                      type="text"
                      value={newLastNameAr}
                      onChange={e => setNewLastNameAr(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      placeholder="البناني"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t.classGroup}</label>
                    <select
                      value={newClassId}
                      onChange={e => setNewClassId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {isRtl ? c.nameAr : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t.parents}</label>
                    <select
                      value={newParentId}
                      onChange={e => setNewParentId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>
                          {isRtl ? p.nameAr : p.name} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'تاريخ الولادة' : 'Date de naissance'}</label>
                    <input
                      type="date"
                      value={newBirthDate}
                      onChange={e => setNewBirthDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'الجنس' : 'Genre'}</label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value as 'M' | 'F')}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      <option value="M">{isRtl ? 'ذكر (Garçon)' : 'Masculin (M)'}</option>
                      <option value="F">{isRtl ? 'أنثى (Fille)' : 'Féminin (F)'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanteen}
                      onChange={e => setNewCanteen(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{isRtl ? 'اشتراك في المطعم المدرسي' : 'Inscription Cantine'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTransport}
                      onChange={e => setNewTransport(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{isRtl ? 'اشتراك في النقل المدرسي' : 'Inscription Transport'}</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'تأكيد التسجيل' : 'Valider l\'inscription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-bold">{isRtl ? 'تعديل بيانات التلميذ' : 'Modifier les données de l\'élève'}</h3>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditStudent} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                {/* Photo & Matricule Edit */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{isRtl ? 'صورة التلميذ' : 'Photo de l\'élève'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0 flex items-center justify-center">
                      <img
                        src={editingStudent.photo}
                        alt={editingStudent.firstName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsEditPhotoDragging(true); }}
                      onDragLeave={() => setIsEditPhotoDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsEditPhotoDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleEditPhotoFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => editFileInputRef.current?.click()}
                      className={`flex-1 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                        isEditPhotoDragging 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 bg-white'
                      }`}
                    >
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleEditPhotoFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold mb-0.5">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isRtl ? 'تغيير الصورة' : 'Changer la photo'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isRtl ? 'انقر أو اسحب صورة جديدة' : 'Cliquer ou glisser-déposer une nouvelle photo'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="font-bold text-slate-700 block mb-1">
                      {isRtl ? 'المعرف الفريد (Matricule)' : 'Matricule (Identifiant unique)'}
                    </label>
                    <input
                      type="text"
                      value={editingStudent.matricule || ''}
                      onChange={e => setEditingStudent({ ...editingStudent, matricule: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Ex: TUN-2024-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prénom (Français)</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.firstName}
                      onChange={e => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nom (Français)</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.lastName}
                      onChange={e => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الاسم (بالعربية)</label>
                    <input
                      type="text"
                      value={editingStudent.firstNameAr}
                      onChange={e => setEditingStudent({ ...editingStudent, firstNameAr: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اللقب (بالعربية)</label>
                    <input
                      type="text"
                      value={editingStudent.lastNameAr}
                      onChange={e => setEditingStudent({ ...editingStudent, lastNameAr: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t.classGroup}</label>
                    <select
                      value={editingStudent.classId}
                      onChange={e => setEditingStudent({ ...editingStudent, classId: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {isRtl ? c.nameAr : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{t.parents}</label>
                    <select
                      value={editingStudent.parentId}
                      onChange={e => setEditingStudent({ ...editingStudent, parentId: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>
                          {isRtl ? p.nameAr : p.name} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'تاريخ الولادة' : 'Date de naissance'}</label>
                    <input
                      type="date"
                      value={editingStudent.birthDate}
                      onChange={e => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'الجنس' : 'Genre'}</label>
                    <select
                      value={editingStudent.gender}
                      onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value as 'M' | 'F' })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      <option value="M">{isRtl ? 'ذكر (Garçon)' : 'Masculin (M)'}</option>
                      <option value="F">{isRtl ? 'أنثى (Fille)' : 'Féminin (F)'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.canteenSubscribed}
                      onChange={e => setEditingStudent({ ...editingStudent, canteenSubscribed: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{isRtl ? 'اشتراك في المطعم المدرسي' : 'Inscription Cantine'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.transportSubscribed}
                      onChange={e => setEditingStudent({ ...editingStudent, transportSubscribed: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{isRtl ? 'اشتراك في النقل المدرسي' : 'Inscription Transport'}</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ التعديلات' : 'Valider les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {isRtl ? 'تأكيد حذف التلميذ' : 'Confirmer la suppression de l\'élève'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه.' : 'Cette action est irréversible.'}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
              <span className="font-bold text-slate-900">
                {isRtl ? `${studentToDelete.firstNameAr} ${studentToDelete.lastNameAr}` : `${studentToDelete.firstName} ${studentToDelete.lastName}`}
              </span>
              <span className="mx-2 text-slate-300">|</span>
              <span>{isRtl ? studentToDelete.classNameAr : studentToDelete.className}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isRtl ? 'حذف نهائي' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
