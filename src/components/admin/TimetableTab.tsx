import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Filter, 
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import { TimetableSlot, ClassRoom, Language } from '../../types';
import { useTranslation } from '../../translations';

interface TimetableTabProps {
  classes: ClassRoom[];
  timetable: TimetableSlot[];
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string) => void;
  onAddSlot?: (slot: TimetableSlot) => void;
  onUpdateSlot?: (slot: TimetableSlot) => void;
  onDeleteSlot?: (slotId: string) => void;
}

const COLOR_OPTIONS = [
  { label: 'Bleu', class: 'border-blue-500 bg-blue-50/60 text-blue-950' },
  { label: 'Émeraude', class: 'border-emerald-500 bg-emerald-50/60 text-emerald-950' },
  { label: 'Ambre', class: 'border-amber-500 bg-amber-50/60 text-amber-950' },
  { label: 'Violet', class: 'border-purple-500 bg-purple-50/60 text-purple-950' },
  { label: 'Rose', class: 'border-rose-500 bg-rose-50/60 text-rose-950' },
  { label: 'Cyan', class: 'border-cyan-500 bg-cyan-50/60 text-cyan-950' },
];

const STANDARD_TIME_SLOTS = [
  '08:30 - 10:00',
  '10:15 - 11:45',
  '12:00 - 13:30',
  '14:00 - 15:30',
  '15:45 - 17:15'
];

export const TimetableTab: React.FC<TimetableTabProps> = ({
  classes,
  timetable,
  lang,
  onOpenWhatsApp,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-1');
  const [selectedDay, setSelectedDay] = useState<'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  // New slot form state
  const [newDay, setNewDay] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('monday');
  const [newTimeSlot, setNewTimeSlot] = useState(STANDARD_TIME_SLOTS[0]);
  const [newSubject, setNewSubject] = useState('Mathématiques');
  const [newSubjectAr, setNewSubjectAr] = useState('الرياضيات');
  const [newTeacherName, setNewTeacherName] = useState('Mme Karoui');
  const [newTeacherNameAr, setNewTeacherNameAr] = useState('السيدة القروي');
  const [newRoom, setNewRoom] = useState('Salle 102');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].class);

  // Edit slot form state
  const [editDay, setEditDay] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('monday');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editSubjectAr, setEditSubjectAr] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherNameAr, setEditTeacherNameAr] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editColor, setEditColor] = useState('');

  const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ];

  const classSchedule = timetable.filter(slot => slot.classId === selectedClassId);
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const className = selectedClass ? (isRtl ? selectedClass.nameAr : selectedClass.name) : '';

  const handleBroadcastTimetable = () => {
    const text = isRtl
      ? `📅 جدول أوقات الأسبوع - تونس\nالقسم : *${className}*\n- الإثنين : 08:30 رياضيات / 10:15 عربية / 14:00 فرنسية\n- الثلاثاء : 08:30 إيقاظ علمي / 10:15 تربية إسلامية\n- الأربعاء : 08:30 رياضيات\n- الخميس : 14:00 تربية بدنية\n- الجمعة : 08:30 إعلامية وتكنولوجيا\nأسبوع دراسي موفق لجميع أبنائنا!`
      : `📅 *Emploi du temps hebdomadaire - Écoles Tunisie*\nClasse : *${className}*\n• Lundi : 08h30 Maths / 10h15 Arabe / 14h00 Français\n• Mardi : 08h30 Éveil Scientifique / 10h15 Éducation Islamique\n• Mercredi : 08h30 Géométrie & Maths\n• Jeudi : 14h00 Éducation Physique & Sportive\n• Vendredi : 08h30 Informatique & Technologie\nBonne semaine scolaire à tous nos élèves !`;

    onOpenWhatsApp(isRtl ? `أولياء قسم ${className}` : `Parents de la classe ${className}`, '+21698123456', text);
  };

  const handleStartEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setEditDay(slot.day);
    setEditTimeSlot(slot.timeSlot);
    setEditSubject(slot.subject);
    setEditSubjectAr(slot.subjectAr);
    setEditTeacherName(slot.teacherName);
    setEditTeacherNameAr(slot.teacherNameAr);
    setEditRoom(slot.room);
    setEditColor(slot.color);
  };

  const handleSaveAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      classId: selectedClassId,
      day: newDay,
      timeSlot: newTimeSlot,
      subject: newSubject.trim(),
      subjectAr: newSubjectAr.trim() || newSubject.trim(),
      teacherName: newTeacherName.trim(),
      teacherNameAr: newTeacherNameAr.trim() || newTeacherName.trim(),
      room: newRoom.trim(),
      color: newColor
    };

    if (onAddSlot) {
      onAddSlot(newSlot);
    }
    setIsAddModalOpen(false);
  };

  const handleSaveEditSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const updatedSlot: TimetableSlot = {
      ...editingSlot,
      day: editDay,
      timeSlot: editTimeSlot,
      subject: editSubject.trim(),
      subjectAr: editSubjectAr.trim() || editSubject.trim(),
      teacherName: editTeacherName.trim(),
      teacherNameAr: editTeacherNameAr.trim() || editTeacherName.trim(),
      room: editRoom.trim(),
      color: editColor
    };

    if (onUpdateSlot) {
      onUpdateSlot(updatedSlot);
    }
    setEditingSlot(null);
  };

  const handleConfirmDeleteSlot = () => {
    if (!slotToDelete) return;
    if (onDeleteSlot) {
      onDeleteSlot(slotToDelete.id);
    }
    setSlotToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="timetable-class-select"
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

          {/* Day Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDay === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.all}
            </button>
            {days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedDay === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Slot Button */}
          <button
            id="add-timetable-slot-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة حصة' : 'Ajouter une séance'}</span>
          </button>

          {/* WhatsApp Broadcast Timetable */}
          <button
            id="broadcast-timetable-btn"
            onClick={handleBroadcastTimetable}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{isRtl ? 'مشاركة عبر واتساب' : 'Partager'}</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days
          .filter(d => selectedDay === 'all' || selectedDay === d)
          .map(day => {
            const daySlots = classSchedule.filter(s => s.day === day);
            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{t[day]}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {daySlots.length} {isRtl ? 'حصص' : 'cours'}
                    </span>
                    <button
                      onClick={() => {
                        setNewDay(day);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                      title={isRtl ? `إضافة حصة يوم ${t[day]}` : `Ajouter un cours le ${t[day]}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {daySlots.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    {isRtl ? 'لا توجد حصص مبرمجة' : 'Aucun cours programmé'}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {daySlots.map(slot => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border-l-4 ${slot.color} transition-all hover:shadow-xs relative group`}
                      >
                        <div className="flex items-start justify-between font-bold text-xs gap-2">
                          <span className="text-slate-900">{isRtl ? slot.subjectAr : slot.subject}</span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="flex items-center gap-1 font-mono text-[11px] font-medium opacity-80" dir="ltr">
                              <Clock className="w-3 h-3" />
                              <span>{slot.timeSlot}</span>
                            </span>

                            {/* Action Buttons: Modifier & Supprimer */}
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                id={`edit-slot-${slot.id}`}
                                onClick={() => handleStartEditSlot(slot)}
                                className="p-1 rounded-md bg-white/80 hover:bg-white text-blue-700 hover:text-blue-800 shadow-2xs transition-all cursor-pointer"
                                title={isRtl ? 'تعديل الحصة' : 'Modifier la séance'}
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                id={`delete-slot-${slot.id}`}
                                onClick={() => setSlotToDelete(slot)}
                                className="p-1 rounded-md bg-white/80 hover:bg-white text-red-600 hover:text-red-700 shadow-2xs transition-all cursor-pointer"
                                title={isRtl ? 'حذف الحصة' : 'Supprimer la séance'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px] opacity-90">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User className="w-3 h-3 text-slate-400" />
                            {isRtl ? slot.teacherNameAr : slot.teacherName}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  {isRtl ? `إضافة حصة - ${className}` : `Ajouter une séance - ${className}`}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAddSlot} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'اليوم' : 'Jour'}</label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-semibold"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{t[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'التوقيت' : 'Créneau horaire'}</label>
                  <input
                    type="text"
                    required
                    value={newTimeSlot}
                    onChange={e => setNewTimeSlot(e.target.value)}
                    placeholder="08:30 - 10:00"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Matière (FR)</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Ex: Mathématiques"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المادة (AR)</label>
                  <input
                    type="text"
                    value={newSubjectAr}
                    onChange={e => setNewSubjectAr(e.target.value)}
                    placeholder="الرياضيات"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enseignant (FR)</label>
                  <input
                    type="text"
                    required
                    value={newTeacherName}
                    onChange={e => setNewTeacherName(e.target.value)}
                    placeholder="Mme Karoui"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المدرس (AR)</label>
                  <input
                    type="text"
                    value={newTeacherNameAr}
                    onChange={e => setNewTeacherNameAr(e.target.value)}
                    placeholder="السيدة القروي"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'القاعة' : 'Salle / Local'}</label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    placeholder="Ex: Salle 102, Labo"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'اللون' : 'Thème visuel'}</label>
                  <select
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-semibold"
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.label} value={opt.class}>{opt.label}</option>
                    ))}
                  </select>
                </div>
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

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isRtl ? 'تعديل الحصة' : 'Modifier la séance'}
                </h3>
              </div>
              <button onClick={() => setEditingSlot(null)} className="text-white/80 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSlot} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'اليوم' : 'Jour'}</label>
                  <select
                    value={editDay}
                    onChange={e => setEditDay(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-semibold"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{t[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'التوقيت' : 'Créneau horaire'}</label>
                  <input
                    type="text"
                    required
                    value={editTimeSlot}
                    onChange={e => setEditTimeSlot(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Matière (FR)</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المادة (AR)</label>
                  <input
                    type="text"
                    value={editSubjectAr}
                    onChange={e => setEditSubjectAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enseignant (FR)</label>
                  <input
                    type="text"
                    required
                    value={editTeacherName}
                    onChange={e => setEditTeacherName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المدرس (AR)</label>
                  <input
                    type="text"
                    value={editTeacherNameAr}
                    onChange={e => setEditTeacherNameAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'القاعة' : 'Salle / Local'}</label>
                  <input
                    type="text"
                    required
                    value={editRoom}
                    onChange={e => setEditRoom(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isRtl ? 'اللون' : 'Thème visuel'}</label>
                  <select
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-semibold"
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.label} value={opt.class}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Slot Confirmation Modal */}
      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isRtl ? 'حذف هذه الحصة ؟' : 'Supprimer cette séance ?'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? `هل تريد فعلاً حذف حصة ${slotToDelete.subjectAr} (${slotToDelete.timeSlot}) ؟`
                  : `Voulez-vous vraiment supprimer le cours de ${slotToDelete.subject} (${slotToDelete.timeSlot}) ?`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSlot}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isRtl ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
