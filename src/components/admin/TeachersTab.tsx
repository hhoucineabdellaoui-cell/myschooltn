import React, { useState, useRef } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  BookOpen, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  Upload, 
  Camera,
  MessageSquare
} from 'lucide-react';
import { Teacher, Language } from '../../types';
import { useTranslation } from '../../translations';

interface TeachersTabProps {
  teachers: Teacher[];
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string) => void;
  onAddTeacher: (newTeacher: Teacher) => void;
  onUpdateTeacher?: (updatedTeacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  lang,
  onOpenWhatsApp,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [phone, setPhone] = useState('+216 ');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isEditPhotoDragging, setIsEditPhotoDragging] = useState(false);

  const handlePhotoFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoFile = (file?: File) => {
    if (!file || !editingTeacher) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingTeacher({
          ...editingTeacher,
          photo: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredTeachers = teachers.filter(tch => {
    return (
      tch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tch.nameAr.includes(searchTerm) ||
      tch.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tch.subjectAr.includes(searchTerm)
    );
  });

  const handleWhatsAppTeacher = (tch: Teacher) => {
    const teacherName = isRtl ? tch.nameAr : tch.name;
    const msg = isRtl
      ? `مرحبا الأستاذ(ة) ${tch.nameAr}، تواصل من إدارة المؤسسة بخصوص التنسيق البيداغوجي وتوزيع الحصص.`
      : `Bonjour M./Mme ${tch.name}, communication de la direction concernant les cours et la coordination pédagogique.`;
    onOpenWhatsApp(teacherName, tch.phone, msg);
  };

  const handleCallTeacher = (rawPhone: string) => {
    const cleanNumber = rawPhone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (onUpdateTeacher) {
      onUpdateTeacher(editingTeacher);
    }
    setEditingTeacher(null);
  };

  const handleConfirmDeleteTeacher = () => {
    if (teacherToDelete && onDeleteTeacher) {
      onDeleteTeacher(teacherToDelete.id);
    }
    setTeacherToDelete(null);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject) return;

    const newTch: Teacher = {
      id: `tch-${Date.now()}`,
      name,
      nameAr: nameAr || name,
      subject,
      subjectAr: subjectAr || subject,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ecole-tunisie.tn`,
      classes: ['6ème Année de Base (Concours 6ème)'],
      photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    };

    onAddTeacher(newTch);
    setIsAddModalOpen(false);
    setName('');
    setNameAr('');
    setSubject('');
    setSubjectAr('');
    setPhone('+216 ');
    setEmail('');
    setPhoto('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            id="teacher-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRtl ? 'بحث عن مدرس أو مادة...' : 'Rechercher un enseignant, matière...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
        <button
          id="open-add-teacher-modal-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTeacher}</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((tch) => {
          const teacherName = isRtl ? tch.nameAr : tch.name;
          const subjectName = isRtl ? tch.subjectAr : tch.subject;

          return (
            <div 
              key={tch.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={tch.photo}
                      alt={teacherName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{teacherName}</h3>
                      <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{subjectName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-teacher-${tch.id}-btn`}
                      onClick={() => setEditingTeacher({ ...tch })}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title={isRtl ? 'تعديل بيانات المدرس' : 'Modifier cet enseignant'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-teacher-${tch.id}-btn`}
                      onClick={() => setTeacherToDelete(tch)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                      title={isRtl ? 'حذف هذا المدرس' : 'Supprimer cet enseignant'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span dir="ltr" className="font-mono font-medium text-slate-800">{tch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{tch.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? 'الأقسام المسندة :' : 'Classes assignées :'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tch.classes.map((cls, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200/60">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`call-teacher-${tch.id}-btn`}
                  type="button"
                  onClick={() => handleCallTeacher(tch.phone)}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t.callPhone}
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isRtl ? 'اتصال' : 'Appeler'}</span>
                </button>
                <button
                  id={`whatsapp-teacher-${tch.id}-btn`}
                  type="button"
                  onClick={() => handleWhatsAppTeacher(tch)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title={t.sendWhatsApp}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold">{t.addTeacher}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
                {/* Photo Upload Section */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{isRtl ? 'صورة المدرس(ة)' : 'Photo de l\'enseignant(e)'}</span>
                    </span>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        {isRtl ? 'إزالة' : 'Effacer'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white shadow-2xs shrink-0 flex items-center justify-center">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-400 stroke-1" />
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
                      className={`flex-1 border-2 border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all ${
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
                      <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold mb-0.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isRtl ? 'تحميل صورة' : 'Importer photo enseignant'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isRtl ? 'انقر أو اسحب (PNG, JPG)' : 'Cliquer ou glisser-déposer (PNG, JPG)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom complet (Français)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="Ex: Youssef Mansouri"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل (بالعربية)</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="يوسف المنصوري"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Matière (Français)</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="Ex: Mathématiques"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المادة (بالعربية)</label>
                    <input
                      type="text"
                      value={subjectAr}
                      onChange={e => setSubjectAr(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="الرياضيات"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'رقم الهاتف وواتساب (+216)' : 'Numéro WhatsApp (+216)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="+216 98 112 233"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-bold">{isRtl ? 'تعديل بيانات المدرس' : 'Modifier l\'enseignant'}</h3>
              </div>
              <button onClick={() => setEditingTeacher(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditTeacher} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
                {/* Photo Edit Section */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{isRtl ? 'صورة المدرس(ة)' : 'Photo de l\'enseignant(e)'}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0 flex items-center justify-center">
                      <img
                        src={editingTeacher.photo}
                        alt={editingTeacher.name}
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
                      className={`flex-1 border-2 border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all ${
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
                      <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold mb-0.5">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isRtl ? 'تغيير الصورة' : 'Changer la photo'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isRtl ? 'انقر أو اسحب' : 'Cliquer ou glisser-déposer'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom complet (Français)</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.name}
                    onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل (بالعربية)</label>
                  <input
                    type="text"
                    value={editingTeacher.nameAr}
                    onChange={e => setEditingTeacher({ ...editingTeacher, nameAr: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Matière (Français)</label>
                    <input
                      type="text"
                      required
                      value={editingTeacher.subject}
                      onChange={e => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المادة (بالعربية)</label>
                    <input
                      type="text"
                      value={editingTeacher.subjectAr}
                      onChange={e => setEditingTeacher({ ...editingTeacher, subjectAr: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'رقم الهاتف وواتساب (+216)' : 'Numéro WhatsApp (+216)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.phone}
                    onChange={e => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {isRtl ? 'تأكيد حذف المدرس' : 'Confirmer la suppression de l\'enseignant'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'سيتم سحب هذا المدرس من الفريق التربوي.' : 'Cette action retirera cet enseignant de l\'équipe pédagogique.'}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {isRtl ? teacherToDelete.nameAr : teacherToDelete.name}
              </span>
              <span className="text-emerald-700 font-medium">
                {isRtl ? teacherToDelete.subjectAr : teacherToDelete.subject}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeacher}
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
