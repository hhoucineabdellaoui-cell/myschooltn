import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Award, 
  Search, 
  CheckCircle, 
  MessageSquare, 
  School, 
  FileCheck, 
  Pencil, 
  Trash2,
  X 
} from 'lucide-react';
import { Language, TunisianSchool } from '../../types';
import { useTranslation } from '../../translations';

interface TunisiaSchoolsTabProps {
  schools: TunisianSchool[];
  activeSchoolId: string;
  onSelectSchool: (schoolId: string) => void;
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg?: string) => void;
  onAddNewSchool?: (newSchool: TunisianSchool) => void;
  onUpdateSchool?: (updatedSchool: TunisianSchool) => void;
  onDeleteSchool?: (schoolId: string) => void;
}

export const TunisiaSchoolsTab: React.FC<TunisiaSchoolsTabProps> = ({
  schools,
  activeSchoolId,
  onSelectSchool,
  lang,
  onOpenWhatsApp,
  onAddNewSchool,
  onUpdateSchool,
  onDeleteSchool
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<TunisianSchool | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<TunisianSchool | null>(null);

  // Form state for new school
  const [newName, setNewName] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newGov, setNewGov] = useState('Tunis');
  const [newCity, setNewCity] = useState('Tunis');
  const [newType, setNewType] = useState<'complexe' | 'primaire' | 'college' | 'lycee'>('complexe');
  const [newCategory, setNewCategory] = useState<'prive' | 'public' | 'pilote' | 'international'>('prive');
  const [newPhone, setNewPhone] = useState('+216 ');
  const [newDirector, setNewDirector] = useState('');

  // Form state for editing school
  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editGov, setEditGov] = useState('Tunis');
  const [editCity, setEditCity] = useState('Tunis');
  const [editDelegation, setEditDelegation] = useState('');
  const [editType, setEditType] = useState<'complexe' | 'primaire' | 'college' | 'lycee'>('complexe');
  const [editCategory, setEditCategory] = useState<'prive' | 'public' | 'pilote' | 'international'>('prive');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDirector, setEditDirector] = useState('');
  const [editStudentCount, setEditStudentCount] = useState(400);
  const [editClassesCount, setEditClassesCount] = useState(16);
  const [editSuccessRate, setEditSuccessRate] = useState(98);

  const handleStartEdit = (sch: TunisianSchool) => {
    setEditingSchool(sch);
    setEditName(sch.name);
    setEditNameAr(sch.nameAr);
    setEditGov(sch.governorate);
    setEditCity(sch.city);
    setEditDelegation(sch.delegation);
    setEditType(sch.type);
    setEditCategory(sch.category);
    setEditPhone(sch.phone);
    setEditEmail(sch.email);
    setEditDirector(sch.directorName);
    setEditStudentCount(sch.studentCount);
    setEditClassesCount(sch.classesCount);
    setEditSuccessRate(sch.successRate);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    const updated: TunisianSchool = {
      ...editingSchool,
      name: editName.trim(),
      nameAr: editNameAr.trim() || editName.trim(),
      governorate: editGov,
      governorateAr: editGov,
      city: editCity.trim(),
      cityAr: editCity.trim(),
      delegation: editDelegation.trim() || `Délégation Régionale ${editGov}`,
      delegationAr: editDelegation.trim() || `المندوبية الجهوية ${editGov}`,
      type: editType,
      category: editCategory,
      phone: editPhone.trim(),
      email: editEmail.trim(),
      directorName: editDirector.trim(),
      directorNameAr: editDirector.trim(),
      studentCount: Number(editStudentCount) || editingSchool.studentCount,
      classesCount: Number(editClassesCount) || editingSchool.classesCount,
      successRate: Number(editSuccessRate) || editingSchool.successRate
    };

    if (onUpdateSchool) {
      onUpdateSchool(updated);
    }
    setEditingSchool(null);
  };

  const handleConfirmDelete = () => {
    if (!schoolToDelete) return;
    if (onDeleteSchool) {
      onDeleteSchool(schoolToDelete.id);
    }
    setSchoolToDelete(null);
  };

  const governorates = [
    { fr: 'Tunis', ar: 'تونس' },
    { fr: 'Ariana', ar: 'أريانة' },
    { fr: 'Ben Arous', ar: 'بن عروس' },
    { fr: 'Manouba', ar: 'منوبة' },
    { fr: 'Sousse', ar: 'سوسة' },
    { fr: 'Sfax', ar: 'صفاقس' },
    { fr: 'Nabeul', ar: 'نابل' },
    { fr: 'Monastir', ar: 'المنستير' },
    { fr: 'Bizerte', ar: 'بنزرت' }
  ];

  const filteredSchools = schools.filter(s => {
    const matchSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr.includes(searchQuery) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cityAr.includes(searchQuery) ||
      s.governorate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGov = selectedGovernorate === 'all' || s.governorate.toLowerCase() === selectedGovernorate.toLowerCase();
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchSearch && matchGov && matchCat;
  });

  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: TunisianSchool = {
      id: `sch-${Date.now()}`,
      name: newName,
      nameAr: newNameAr || newName,
      type: newType,
      category: newCategory,
      governorate: newGov,
      governorateAr: newGov,
      delegation: `Délégation Régionale ${newGov}`,
      delegationAr: `المندوبية الجهوية ${newGov}`,
      city: newCity,
      cityAr: newCity,
      address: `${newCity}, ${newGov}, Tunisie`,
      addressAr: `${newCity}، ${newGov}، تونس`,
      phone: newPhone,
      email: `contact@${newName.toLowerCase().replace(/[^a-z0-9]/g, '')}.tn`,
      directorName: newDirector || 'Direction Pédagogique',
      directorNameAr: newDirector || 'الإدارة التربوية',
      studentCount: 450,
      classesCount: 18,
      successRate: 98.0,
      isPartner: true,
      motto: 'Excellence & Réussite Éducative',
      mottoAr: 'التميز والنجاح التربوي'
    };

    if (onAddNewSchool) {
      onAddNewSchool(created);
    }
    onSelectSchool(created.id);
    setShowAddModal(false);
    setNewName('');
    setNewNameAr('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Official Tunisian Ministry Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold tracking-wide uppercase border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isRtl ? 'الجمهورية التونسية - وزارة التربية والتعليم' : 'République Tunisienne - Ministère de l\'Éducation'}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {isRtl ? 'المدارس والمعاهد في تونس' : 'Les Écoles & Lycées en Tunisie'}
            </h1>
            <p className="text-red-100 text-sm sm:text-base leading-relaxed">
              {isRtl 
                ? 'منظومة مطابقة للبرامج الرسمية التونسية: الابتدائي (مناظرة السيزيام)، الإعدادي (مناظرة النوفيام)، والثانوي (الباكالوريا التونسية) مع الربط الفوري عبر واتساب (+216).'
                : 'Plateforme conforme aux normes éducatives tunisiennes : Primaire (Concours 6ème), Préparatoire (Concours 9ème), Lycée (Baccalauréat tunisien) & intégration WhatsApp (+216).'}
            </p>
          </div>

          {/* Quick Active School Indicator */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full md:w-auto shrink-0">
            <div className="text-xs text-red-200 font-semibold mb-1">
              {isRtl ? 'المؤسسة النشطة حالياً :' : 'Établissement actif :'}
            </div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{isRtl ? activeSchool.nameAr : activeSchool.name}</span>
            </div>
            <div className="text-xs text-red-100 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-red-300" />
              <span>{isRtl ? activeSchool.cityAr : activeSchool.city}, {isRtl ? activeSchool.governorateAr : activeSchool.governorate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tunisia Educational Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-red-200 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black">
              1-6
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isRtl ? 'التعليم الابتدائي الأساسي' : 'Enseignement Primaire de Base'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'من السنة الأولى إلى السادسة' : 'De la 1ère à la 6ème année'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isRtl
              ? 'إعداد مكثف لمناظرة الدخول إلى المدارس الإعدادية النموذجية (السيزيام). نظام فروض المراقبة والفروض التأليفية الثلاثية.'
              : 'Préparation au Concours "Sixième" d\'accès aux Collèges Pilotes. Système de devoirs de contrôle et devoirs de synthèse trimestriels.'}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-red-700 font-bold">
            <span>{isRtl ? 'مناظرة السيزيام النموذجية' : 'Concours 6ème'}</span>
            <FileCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-red-200 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
              7-9
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isRtl ? 'التعليم الإعدادي' : 'Enseignement Préparatoire / Collège'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'السنوات 7، 8 و9 أساسي' : '7ème, 8ème & 9ème année'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isRtl
              ? 'مناظرة النوفيام الوطنية للدخول إلى المعاهد النموذجية. ضوارب وزارية رسمية واحتساب دقيق للمعدلات الثلاثية والسنوية.'
              : 'Concours national "Neuvième" pour l\'admission aux Lycées Pilotes. Coefficients ministériels et calcul rigoureux de la moyenne trimestrielle.'}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold">
            <span>{isRtl ? 'مناظرة النوفيام النموذجية' : 'Concours 9ème Pilote'}</span>
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-red-200 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              BAC
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isRtl ? 'التعليم الثانوي والباكالوريا' : 'Enseignement Secondaire & Baccalauréat'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? '7 شعب رسمية' : '7 filières officielles'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isRtl
              ? 'رياضيات، علوم تجريبية، اقتصاد وتصرف، آداب، علوم تقنية، علوم إعلامية ورياضة مع المتابعة الفورية للنتائج.'
              : 'Mathématiques, Sciences Expérimentales, Économie & Gestion, Lettres, Technique, Informatique et Sport.'}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>{isRtl ? 'امتحان الباكالوريا التونسية' : 'Baccalauréat Tunisien'}</span>
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Directory Controls & Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث عن مدرسة أو معهد أو ولاية أو مدينة في تونس...' : 'Rechercher une école, un lycée, une ville ou un gouvernorat en Tunisie...'}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="all">{isRtl ? 'جميع الولايات' : 'Tous les gouvernorats'}</option>
              {governorates.map(g => (
                <option key={g.fr} value={g.fr}>
                  {isRtl ? g.ar : g.fr}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="all">{isRtl ? 'جميع الأصناف' : 'Toutes les catégories'}</option>
              <option value="prive">{isRtl ? 'خاص مرخص' : 'Privé Homologué'}</option>
              <option value="pilote">{isRtl ? 'مؤسسات نموذجية' : 'Établissements Pilotes'}</option>
              <option value="international">{isRtl ? 'دولي / ثنائي اللغة' : 'International / Bilingue'}</option>
              <option value="public">{isRtl ? 'عمومي' : 'Public'}</option>
            </select>

            <button
              id="add-tunisia-school-btn"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <School className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إضافة مؤسسة' : 'Ajouter une école'}</span>
            </button>
          </div>
        </div>

        {/* Quick Governorates Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold me-2 shrink-0">{isRtl ? 'الولايات :' : 'Gouvernorats :'}</span>
          <button
            onClick={() => setSelectedGovernorate('all')}
            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
              selectedGovernorate === 'all'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRtl ? 'الكل' : 'Tous'}
          </button>
          {governorates.map(g => (
            <button
              key={g.fr}
              onClick={() => setSelectedGovernorate(g.fr)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                selectedGovernorate.toLowerCase() === g.fr.toLowerCase()
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isRtl ? g.ar : g.fr}
            </button>
          ))}
        </div>
      </div>

      {/* Schools Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((sch) => {
          const isSelected = sch.id === activeSchoolId;
          return (
            <div
              key={sch.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'border-red-600 ring-2 ring-red-600/20 shadow-md' 
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                      sch.category === 'pilote'
                        ? 'bg-amber-100 text-amber-800'
                        : sch.category === 'international'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sch.category === 'pilote' 
                        ? (isRtl ? 'نموذجي متميز' : 'Pilote d\'Excellence')
                        : sch.category === 'international'
                        ? (isRtl ? 'دولي' : 'International')
                        : (isRtl ? 'خاص مرخص' : 'Privé Agréé')}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">
                      {isRtl ? sch.nameAr : sch.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isRtl ? sch.name : sch.nameAr}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-red-700 bg-red-50 px-2 py-1 rounded-lg border border-red-200 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'نشط' : 'Actif'}</span>
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {isRtl ? sch.cityAr : sch.city}, {isRtl ? sch.governorateAr : sch.governorate}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 ps-5">
                    {isRtl ? sch.delegationAr : sch.delegation}
                  </div>
                  <div className="flex items-center gap-2 ps-5 text-slate-700">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span dir="ltr" className="font-mono font-semibold">{sch.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-slate-50/80 rounded-xl p-2">
                    <div className="text-base font-black text-slate-900">{sch.studentCount}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{isRtl ? 'تلميذ' : 'Élèves'}</div>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2">
                    <div className="text-base font-black text-slate-900">{sch.classesCount}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{isRtl ? 'أقسام' : 'Classes'}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2">
                    <div className="text-base font-black text-emerald-700">{sch.successRate}%</div>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">{isRtl ? 'نجاح' : 'Réussite'}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  &ldquo;{isRtl ? sch.mottoAr : sch.motto}&rdquo;
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onSelectSchool(sch.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isSelected 
                    ? (isRtl ? 'المؤسسة المعتمدة' : 'Sélectionnée') 
                    : (isRtl ? 'اعتماد وإدارة' : 'Gérer')}
                </button>
                <button
                  id={`edit-school-btn-${sch.id}`}
                  onClick={() => handleStartEdit(sch)}
                  title={isRtl ? 'تعديل بيانات المؤسسة' : 'Modifier les données de l\'école'}
                  className="p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  id={`delete-school-btn-${sch.id}`}
                  onClick={() => setSchoolToDelete(sch)}
                  title={isRtl ? 'حذف المؤسسة' : 'Supprimer l\'école'}
                  className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenWhatsApp(
                    isRtl ? sch.directorNameAr : sch.directorName,
                    sch.phone,
                    isRtl ? `مرحبا بإدارة ${sch.nameAr}، تواصل عبر منصة MySchoolTN.` : `Bonjour l'administration de ${sch.name}, contact via MySchoolTN.`
                  )}
                  title={isRtl ? 'مراسلة عبر واتساب (+216)' : 'Contacter par WhatsApp (+216)'}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New School in Tunisia */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isRtl ? 'إضافة مؤسسة تربوية في تونس' : 'Ajouter une école en Tunisie'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'تسجيل جديد ضمن شبكة MySchoolTN' : 'Enregistrement dans le réseau MySchoolTN'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isRtl ? 'اسم المؤسسة (بالفرنسية)' : 'Nom de l\'établissement (Français)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Groupe Scolaire Hannibal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isRtl ? 'اسم المؤسسة (بالعربية)' : 'Nom de l\'établissement (Arabe)'}
                </label>
                <input
                  type="text"
                  placeholder="المجمع المدرسي حنبعل"
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  dir="rtl"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الولاية' : 'Gouvernorat'}
                  </label>
                  <select
                    value={newGov}
                    onChange={(e) => {
                      setNewGov(e.target.value);
                      setNewCity(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    {governorates.map(g => (
                      <option key={g.fr} value={g.fr}>{isRtl ? g.ar : g.fr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'المدينة / المعتمدية' : 'Ville / Quartier'}
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Ex: Carthage Byrsa"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الصنف' : 'Catégorie'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value="prive">{isRtl ? 'خاص مرخص' : 'Privé homologué'}</option>
                    <option value="pilote">{isRtl ? 'نموذجي متميز' : 'Pilote d\'excellence'}</option>
                    <option value="international">{isRtl ? 'دولي' : 'International'}</option>
                    <option value="public">{isRtl ? 'عمومي' : 'Public'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الهاتف وواتساب (+216)' : 'Téléphone WhatsApp (+216)'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+216 71 000 000"
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isRtl ? 'المدير(ة) / المشرف البيداغوجي' : 'Directeur(rice) / Responsable pédagogique'}
                </label>
                <input
                  type="text"
                  value={newDirector}
                  onChange={(e) => setNewDirector(e.target.value)}
                  placeholder="Ex: M. Hichem Ben Salem"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {isRtl ? 'تسجيل وتفعيل' : 'Enregistrer et Activer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit School in Tunisia */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isRtl ? 'تعديل بيانات المؤسسة' : 'Modifier les données de l\'établissement'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'تحديث المعلومات في المنظومة' : 'Mettre à jour les informations dans le système'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSchool(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'اسم المؤسسة (FR) *' : 'Nom de l\'établissement (FR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الاسم بالعربية *' : 'Nom en Arabe *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    dir="rtl"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الولاية' : 'Gouvernorat'}
                  </label>
                  <select
                    value={editGov}
                    onChange={(e) => setEditGov(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {governorates.map(g => (
                      <option key={g.fr} value={g.fr}>
                        {isRtl ? g.ar : g.fr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'المدينة / المعتمدية' : 'Ville / Délégation'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الصنف' : 'Catégorie'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="prive">{isRtl ? 'خاص مرخص' : 'Privé Homologué'}</option>
                    <option value="pilote">{isRtl ? 'معهد نموذجي' : 'Établissement Pilote'}</option>
                    <option value="international">{isRtl ? 'دولي' : 'International / Bilingue'}</option>
                    <option value="public">{isRtl ? 'عمومي' : 'Public'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'النوع' : 'Cycle / Type'}
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="complexe">{isRtl ? 'مجمع تربوي' : 'Complexe Éducatif'}</option>
                    <option value="primaire">{isRtl ? 'مدرسة ابتدائية' : 'École Primaire'}</option>
                    <option value="college">{isRtl ? 'مدرسة إعدادية' : 'Collège'}</option>
                    <option value="lycee">{isRtl ? 'معهد ثانوي' : 'Lycée Secondaire'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'الهاتف (+216)' : 'Téléphone (+216)'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'البريد الإلكتروني' : 'Email de contact'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'عدد التلاميذ' : 'Nb Élèves'}
                  </label>
                  <input
                    type="number"
                    value={editStudentCount}
                    onChange={(e) => setEditStudentCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'عدد الأقسام' : 'Nb Classes'}
                  </label>
                  <input
                    type="number"
                    value={editClassesCount}
                    onChange={(e) => setEditClassesCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isRtl ? 'نسبة النجاح %' : 'Taux Réussite %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editSuccessRate}
                    onChange={(e) => setEditSuccessRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isRtl ? 'المدير(ة) / المشرف البيداغوجي' : 'Directeur(rice) / Responsable pédagogique'}
                </label>
                <input
                  type="text"
                  value={editDirector}
                  onChange={(e) => setEditDirector(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete School Confirmation Modal */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isRtl ? 'حذف هذه المؤسسة ؟' : 'Supprimer cet établissement ?'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? `هل تريد فعلاً حذف ${schoolToDelete.nameAr} (${schoolToDelete.cityAr}) ؟`
                  : `Voulez-vous vraiment supprimer l'école ${schoolToDelete.name} (${schoolToDelete.city}) ?`}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isRtl ? 'حذف نهائي' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
