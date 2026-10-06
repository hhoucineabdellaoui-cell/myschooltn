import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Plus, 
  X, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  Key, 
  UserPlus, 
  Link2, 
  Check,
  MessageSquare
} from 'lucide-react';
import { Parent, Student, Language } from '../../types';
import { useTranslation } from '../../translations';

interface ParentsTabProps {
  parents: Parent[];
  students: Student[];
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
  onAddParent: (newParent: Parent) => void;
  onUpdateParent?: (updatedParent: Parent) => void;
  onDeleteParent?: (parentId: string) => void;
  onLinkStudentToParent?: (studentId: string, parentId: string) => void;
}

export const ParentsTab: React.FC<ParentsTabProps> = ({
  parents,
  students,
  lang,
  onOpenWhatsApp,
  onAddParent,
  onUpdateParent,
  onDeleteParent,
  onLinkStudentToParent
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);

  // Quick link student state
  const [parentToQuickLink, setParentToQuickLink] = useState<Parent | null>(null);
  const [quickLinkStudentSearch, setQuickLinkStudentSearch] = useState('');

  // New Parent state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('+216 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('parent123');
  const [address, setAddress] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [relationship, setRelationship] = useState('Père');
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  // Robust child matcher for parents
  const getParentChildren = (parent: Parent) => {
    return students.filter(s => {
      if (s.parentId === parent.id) return true;
      if (Array.isArray(parent.childrenIds) && parent.childrenIds.includes(s.id)) return true;
      return false;
    });
  };

  const filteredParents = parents.filter(p => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameAr.includes(searchTerm) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleWhatsApp = (parent: Parent) => {
    const parentName = isRtl ? parent.nameAr : parent.name;
    const parentChildren = getParentChildren(parent);
    const childNames = parentChildren.map(c => isRtl ? c.firstNameAr : c.firstName).join(', ');
    const msg = isRtl
      ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr} ${childNames ? ` بخصوص ابنكم (${childNames})` : ''}.`
      : `Bonjour M./Mme ${parent.name}, communication de la direction de l'établissement scolaire${childNames ? ` concernant votre enfant (${childNames})` : ''}.`;
    onOpenWhatsApp(parentName, parent.phone, msg, childNames);
  };

  const handleCallParent = (rawPhone: string) => {
    const cleanNumber = rawPhone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleShareCredentialsWhatsApp = (parent: Parent) => {
    const parentName = isRtl ? parent.nameAr : parent.name;
    const parentChildren = getParentChildren(parent);
    const childNames = parentChildren.map(c => isRtl ? c.firstNameAr : c.firstName).join(', ');
    const pwd = parent.password || 'parent123';

    const msg = isRtl
      ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، إليكم بيانات الدخول إلى فضاء الأولياء MySchoolTN :\n- المعرف : ${parent.email} أو ${parent.phone}\n- كلمة المرور : ${pwd}\n${childNames ? `- التلميذ المسجل : ${childNames}\n` : ''}بإمكانكم الاطلاع على بطاقات الأعداد، الغيابات، جدول الأوقات ومتابعة الحافلة المدرسية.`
      : `Bonjour M./Mme ${parent.name}, voici vos identifiants d'accès à l'Espace Parents MySchoolTN :\n- Identifiant : ${parent.email} ou ${parent.phone}\n- Mot de passe : ${pwd}\n${childNames ? `- Élève suivi : ${childNames}\n` : ''}Accédez dès maintenant au suivi scolaire, notes et emploi du temps.`;

    onOpenWhatsApp(parentName, parent.phone, msg, childNames);
  };

  const handleSaveEditParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;
    if (onUpdateParent) {
      onUpdateParent(editingParent);
    }
    setEditingParent(null);
  };

  const handleConfirmDeleteParent = () => {
    if (parentToDelete && onDeleteParent) {
      onDeleteParent(parentToDelete.id);
    }
    setParentToDelete(null);
  };

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newParent: Parent = {
      id: `par-${Date.now()}`,
      name,
      nameAr: nameAr || name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      password: password || 'parent123',
      address: address || 'Tunis, Tunisie',
      addressAr: addressAr || 'تونس، الجمهورية التونسية',
      childrenIds: selectedChildrenIds,
      relationship,
      relationshipAr: relationship === 'Père' ? 'أب' : 'أم',
      whatsappOptIn: true
    };

    onAddParent(newParent);
    setIsAddModalOpen(false);
    setName('');
    setNameAr('');
    setPhone('+216 ');
    setEmail('');
    setPassword('parent123');
    setAddress('');
    setAddressAr('');
    setSelectedChildrenIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            id="parent-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRtl ? 'بحث عن ولي أمر بالاسم أو الهاتف...' : 'Rechercher un parent, téléphone...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
        <button
          id="open-add-parent-modal-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة ولي أمر' : 'Ajouter un parent'}</span>
        </button>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParents.map((parent) => {
          const parentName = isRtl ? parent.nameAr : parent.name;
          const parentChildren = getParentChildren(parent);

          return (
            <div 
              key={parent.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-black text-base shadow-xs">
                    {parent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{parentName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isRtl ? parent.relationshipAr : parent.relationship}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        WhatsApp OK
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    id={`edit-parent-${parent.id}-btn`}
                    onClick={() => setEditingParent({ ...parent })}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                    title={isRtl ? 'تعديل هذا الولي' : 'Modifier ce parent'}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`delete-parent-${parent.id}-btn`}
                    onClick={() => setParentToDelete(parent)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                    title={isRtl ? 'حذف هذا الولي' : 'Supprimer ce parent'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span dir="ltr" className="font-mono font-medium text-slate-900">{parent.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`call-parent-${parent.id}-btn`}
                      onClick={() => handleCallParent(parent.phone)}
                      className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      title={t.callPhone}
                    >
                      <Phone className="w-3 h-3" />
                      <span>{isRtl ? 'اتصال' : 'Appeler'}</span>
                    </button>
                    <button
                      id={`whatsapp-parent-${parent.id}-btn`}
                      onClick={() => handleWhatsApp(parent)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      title={t.sendWhatsApp}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{parent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{isRtl ? parent.addressAr : parent.address}</span>
                </div>
              </div>

              {/* Linked Children */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'الأبناء المتمدرسون :' : 'Enfants scolarisés :'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParentToQuickLink(parent);
                      setQuickLinkStudentSearch('');
                    }}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200/90 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isRtl ? '+ ربط تلميذ' : '+ Rattacher un élève'}</span>
                  </button>
                </div>

                {parentChildren.length === 0 ? (
                  <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <p className="text-xs text-amber-900 font-medium">
                      {isRtl ? 'لا يوجد أبناء مرتبطون بهذا الولي حالياً.' : 'Aucun enfant rattaché à ce parent pour le moment.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setParentToQuickLink(parent);
                        setQuickLinkStudentSearch('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'ربط تلميذ' : 'Rattacher un élève'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {parentChildren.map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
                        <img src={c.photo} alt={c.firstName} className="w-5 h-5 rounded-full object-cover" />
                        <span>{isRtl ? `${c.firstNameAr} ${c.lastNameAr}` : `${c.firstName} ${c.lastName}`}</span>
                        <span className="text-[10px] text-slate-400">({isRtl ? c.classNameAr : c.className})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Login Credentials & WhatsApp Share */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1 font-bold text-emerald-900 text-[11px]">
                    <Key className="w-3 h-3 text-emerald-600" />
                    <span>{isRtl ? 'بيانات دخول فضاء الأولياء :' : 'Accès Espace Parents :'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    <span className="font-semibold text-slate-800">Login:</span> {parent.email} <span className="text-slate-300">•</span> <span className="font-semibold text-slate-800">Mdp:</span> {parent.password || 'parent123'}
                  </div>
                </div>
                <button
                  id={`share-parent-credentials-${parent.id}-btn`}
                  type="button"
                  onClick={() => handleShareCredentialsWhatsApp(parent)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  title={isRtl ? 'إرسال بيانات الدخول عبر واتساب' : 'Envoyer les accès par WhatsApp'}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{isRtl ? 'مشاركة الحساب' : 'Partager accès'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Parent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">{isRtl ? 'إضافة ولي أمر' : 'Ajouter un parent'}</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateParent} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom complet (Français)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Tariq Bennani"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل (بالعربية)</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                    placeholder="طارق البناني"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'رقم الهاتف وواتساب (+216)' : 'Numéro WhatsApp (avec indicatif +216)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    placeholder="+216 98 123 456"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">صلة القرابة</label>
                    <select
                      value={relationship}
                      onChange={e => setRelationship(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      <option value="Père">{isRtl ? 'أب' : 'Père'}</option>
                      <option value="Mère">{isRtl ? 'أم' : 'Mère'}</option>
                      <option value="Tuteur légal">{isRtl ? 'ولي أمر / وصي' : 'Tuteur légal'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      {isRtl ? 'الأبناء المتمدرسون (حدد الأبناء)' : 'Élèves à rattacher (sélectionnez les enfants)'}
                    </label>
                    {selectedChildrenIds.length > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {isRtl ? `${selectedChildrenIds.length} تم تحديدهم` : `${selectedChildrenIds.length} sélectionné(s)`}
                      </span>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 max-h-40 overflow-y-auto space-y-1.5">
                    {students.length === 0 ? (
                      <p className="text-slate-400 text-center py-2 italic">{isRtl ? 'لا يوجد تلاميذ' : 'Aucun élève'}</p>
                    ) : (
                      students.map(stu => {
                        const isChecked = selectedChildrenIds.includes(stu.id);
                        const stuName = isRtl ? `${stu.firstNameAr} ${stu.lastNameAr}` : `${stu.firstName} ${stu.lastName}`;
                        const stuClass = isRtl ? stu.classNameAr : stu.className;
                        return (
                          <label 
                            key={stu.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedChildrenIds(prev => prev.filter(id => id !== stu.id));
                                  } else {
                                    setSelectedChildrenIds(prev => [...prev, stu.id]);
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <img src={stu.photo} alt={stuName} className="w-5 h-5 rounded-full object-cover" />
                              <span>{stuName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">({stuClass})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'كلمة المرور لفضاء الأولياء' : 'Mot de passe Espace Parent'}
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    placeholder="parent123"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 font-medium">
                  {selectedChildrenIds.length > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {isRtl ? `${selectedChildrenIds.length} تلميذ مرتبط` : `${selectedChildrenIds.length} élève(s) rattaché(s)`}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {isRtl ? 'لم يتم ربط أي ابن' : 'Aucun enfant rattaché'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isRtl ? 'تأكيد وحفظ' : 'Valider et Enregistrer'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Parent Modal */}
      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-bold">{isRtl ? 'تعديل بيانات الولي' : 'Modifier les données du parent'}</h3>
              </div>
              <button onClick={() => setEditingParent(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditParent} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom complet (Français)</label>
                  <input
                    type="text"
                    required
                    value={editingParent.name}
                    onChange={e => setEditingParent({ ...editingParent, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل (بالعربية)</label>
                  <input
                    type="text"
                    value={editingParent.nameAr}
                    onChange={e => setEditingParent({ ...editingParent, nameAr: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'رقم الهاتف (+216)' : 'Numéro WhatsApp (+216)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingParent.phone}
                    onChange={e => setEditingParent({ ...editingParent, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={editingParent.email}
                      onChange={e => setEditingParent({ ...editingParent, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">صلة القرابة</label>
                    <select
                      value={editingParent.relationship}
                      onChange={e => setEditingParent({ 
                        ...editingParent, 
                        relationship: e.target.value as any,
                        relationshipAr: e.target.value === 'Père' ? 'أب' : 'أم'
                      })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                    >
                      <option value="Père">{isRtl ? 'أب' : 'Père'}</option>
                      <option value="Mère">{isRtl ? 'أم' : 'Mère'}</option>
                      <option value="Tuteur">{isRtl ? 'وصي قانوني' : 'Tuteur légal'}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'كلمة المرور لفضاء الأولياء' : 'Mot de passe Espace Parent'}
                  </label>
                  <input
                    type="text"
                    value={editingParent.password || 'parent123'}
                    onChange={e => setEditingParent({ ...editingParent, password: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                    placeholder="parent123"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
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

      {/* Delete Parent Confirmation Modal */}
      {parentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {isRtl ? 'تأكيد حذف الولي' : 'Confirmer la suppression du parent'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'هذا الإجراء سيحذف بطاقة الولي من المنظومة.' : 'Cette action supprimera la fiche parent.'}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {isRtl ? parentToDelete.nameAr : parentToDelete.name}
              </span>
              <span dir="ltr" className="font-mono text-slate-500">{parentToDelete.phone}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteParent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isRtl ? 'حذف نهائي' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Link Student to Parent Modal */}
      {parentToQuickLink && (() => {
        const availableStudents = students.filter(s => {
          const isAlreadyLinked = (parentToQuickLink.childrenIds || []).includes(s.id) || s.parentId === parentToQuickLink.id;
          if (isAlreadyLinked) return false;
          if (!quickLinkStudentSearch.trim()) return true;
          const q = quickLinkStudentSearch.toLowerCase();
          return (
            s.firstName.toLowerCase().includes(q) ||
            s.lastName.toLowerCase().includes(q) ||
            s.firstNameAr.includes(q) ||
            s.lastNameAr.includes(q) ||
            s.className.toLowerCase().includes(q)
          );
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="text-base font-bold">
                    {isRtl 
                      ? `ربط تلميذ بالولي : ${parentToQuickLink.nameAr || parentToQuickLink.name}` 
                      : `Rattacher un élève à ${parentToQuickLink.name}`}
                  </h3>
                </div>
                <button 
                  onClick={() => setParentToQuickLink(null)} 
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs flex-1 overflow-y-auto min-h-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={quickLinkStudentSearch}
                    onChange={e => setQuickLinkStudentSearch(e.target.value)}
                    placeholder={isRtl ? 'بحث عن تلميذ بالاسم أو القسم...' : 'Rechercher un élève par nom ou classe...'}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  {availableStudents.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                      <p className="font-semibold">{isRtl ? 'لا يوجد تلاميذ متاحون للربط' : 'Aucun élève disponible à rattacher'}</p>
                      <p className="text-[11px] text-slate-400">
                        {isRtl 
                          ? 'إما أن جميع التلاميذ مرتبطون بالفعل، أو لا يوجد تطابق مع البحث.'
                          : 'Soit tous les élèves sont déjà associés, soit aucun élève ne correspond à votre recherche.'}
                      </p>
                    </div>
                  ) : (
                    availableStudents.map(stu => {
                      const stuName = isRtl ? `${stu.firstNameAr} ${stu.lastNameAr}` : `${stu.firstName} ${stu.lastName}`;
                      const stuClass = isRtl ? stu.classNameAr : stu.className;
                      return (
                        <div
                          key={stu.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={stu.photo} alt={stuName} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100" />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{stuName}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{stuClass}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onLinkStudentToParent) {
                                onLinkStudentToParent(stu.id, parentToQuickLink.id);
                              }
                              setParentToQuickLink(null);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                          >
                            <Link2 className="w-4 h-4" />
                            <span>{isRtl ? 'ربط' : 'Rattacher'}</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-600 font-medium">
                  {isRtl 
                    ? `${availableStudents.length} تلميذ متاح` 
                    : `${availableStudents.length} élève(s) disponible(s)`}
                </span>
                <button
                  type="button"
                  onClick={() => setParentToQuickLink(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer text-xs transition-all"
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
