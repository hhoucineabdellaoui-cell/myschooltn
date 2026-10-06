import React, { useRef } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  Building2, 
  User, 
  BadgeCheck, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { PaymentRecord, Student, Parent, Language } from '../types';
import { numberToFrenchWords, numberToArabicWords } from '../utils/numberToWords';

interface PaymentReceiptModalProps {
  payment: PaymentRecord;
  student?: Student;
  parent?: Parent;
  lang: Language;
  onClose: () => void;
  onOpenWhatsApp?: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  student,
  parent,
  lang,
  onClose,
  onOpenWhatsApp
}) => {
  const isRtl = lang === 'ar';
  const receiptRef = useRef<HTMLDivElement>(null);

  const paymentDate = payment.paidDate || new Date().toISOString().split('T')[0];
  const paymentMethod = payment.paymentMethod || 'Espèces';

  const studentFullName = student 
    ? (isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`)
    : 'Élève';

  const parentFullName = parent 
    ? (isRtl ? parent.nameAr : parent.name)
    : 'Parent / Tuteur légal';

  const amountInFrench = numberToFrenchWords(payment.amount);
  const amountInArabic = numberToArabicWords(payment.amount);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!onOpenWhatsApp || !parent) return;
    const msg = isRtl
      ? `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}، تؤكد لكم الإدارة خلاص المبلغ المستوجب وقدره ${payment.amount} د.ت للتلميذ(ة) ${studentFullName}.\nرقم الوصل: ${payment.receiptNumber}\nتاريخ الخلاص: ${paymentDate}\nشكراً لحسن تعاونكم.`
      : `Bonjour M./Mme ${parent.name},\nL'établissement Privé MySchoolTN vous confirme la réception de votre règlement de ${payment.amount} DT pour ${studentFullName}.\nReçu N°: ${payment.receiptNumber}\nDate de règlement: ${paymentDate}\nMerci pour votre confiance.`;
    
    onOpenWhatsApp(parentFullName, parent.phone, msg, studentFullName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Action Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {isRtl ? 'وصل خلاص رسمي' : 'Reçu de Paiement Officiel'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Réf: {payment.receiptNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {parent && onOpenWhatsApp && (
              <button
                id="share-receipt-whatsapp-btn"
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title={isRtl ? 'مشاركة الوصل عبر واتساب' : 'Partager le reçu via WhatsApp'}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'واتساب' : 'WhatsApp'}</span>
              </button>
            )}
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRtl ? 'طباعة الوصل' : 'Imprimer le reçu'}</span>
            </button>
            <button
              id="close-receipt-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div 
          id="printable-receipt" 
          ref={receiptRef}
          className="p-6 sm:p-10 bg-white text-slate-800 text-xs font-sans select-text"
        >
          {/* Header of the Institution */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5">
            <div className="flex items-start justify-between gap-4">
              {/* French side */}
              <div className="text-left space-y-0.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  République Tunisienne
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Ministère de l'Éducation
                </div>
                <div className="text-base font-black text-slate-900 pt-1 tracking-tight flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  Établissement Privé MySchoolTN
                </div>
                <div className="text-[10px] text-slate-600">
                  Agrément Ministériel N° 2018/451
                </div>
              </div>

              {/* School Emblem / Center Watermark */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-600 flex flex-col items-center justify-center text-emerald-700 shadow-xs">
                  <Building2 className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">TN</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">2024 - 2025</span>
              </div>

              {/* Arabic side */}
              <div className="text-right space-y-0.5" dir="rtl">
                <div className="text-[10px] font-bold text-slate-500">
                  الجمهورية التونسية
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  وزارة التربية والتعليم
                </div>
                <div className="text-base font-black text-slate-900 pt-1">
                  المؤسسة التربوية الخاصة MySchoolTN
                </div>
                <div className="text-[10px] text-slate-600">
                  ترخيص وزاري عدد 451 / 2018
                </div>
              </div>
            </div>

            {/* School Coordinates Footer bar */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>📍 Av. Habib Bourguiba, 1001 Tunis</span>
              <span>📞 (+216) 71 890 123</span>
              <span>✉️ contact@madrasati.tn</span>
              <span>MF: 1428579/B/A/M/000</span>
            </div>
          </div>

          {/* RECEIPT BANNER */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase">
                  ACQUITTÉ
                </span>
                <span className="text-base font-black text-slate-900">
                  REÇU DE RÈGLEMENT SCOLAIRE
                </span>
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5" dir="rtl">
                وصل خلاص رسمي مبرئ للذمة
              </div>
            </div>
            <div className="text-left sm:text-right font-mono space-y-0.5 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200 w-full sm:w-auto">
              <div className="text-xs font-bold text-slate-900">
                N° REÇU : <span className="text-emerald-700 underline">{payment.receiptNumber}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Date : <span className="font-semibold text-slate-800">{paymentDate}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Mode : <span className="font-semibold text-slate-800">{paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* PARTIES PRENANTES (Student & Parent Details) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Élève */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Élève Bénéficiaire / التلميذ
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                  {student?.id || payment.studentId}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-black text-slate-900 text-sm">
                  {student ? `${student.firstName} ${student.lastName}` : 'Élève'}
                </div>
                {student && (
                  <div className="text-slate-600 font-bold" dir="rtl">
                    {student.firstNameAr} {student.lastNameAr}
                  </div>
                )}
                <div className="text-slate-500 text-[11px] pt-1">
                  Classe : <span className="font-bold text-slate-800">{student?.className || '-'}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Régime : <span className="font-semibold text-slate-700">{student?.canteenSubscribed ? 'Demi-pensionnaire' : 'Externe'}</span>
                </div>
              </div>
            </div>

            {/* Parent */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Payeur / Responsable Légal / الولي
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                  {parent?.id || payment.parentId}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-black text-slate-900 text-sm">
                  {parent ? parent.name : 'Parent'}
                </div>
                {parent && (
                  <div className="text-slate-600 font-bold" dir="rtl">
                    {parent.nameAr}
                  </div>
                )}
                <div className="text-slate-500 text-[11px] pt-1">
                  Téléphone : <span className="font-mono font-semibold text-slate-800" dir="ltr">{parent?.phone || '-'}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Qualité : <span className="font-semibold text-slate-700">{parent?.relationship || 'Tuteur légal'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU DES PRESTATIONS RÉGLÉES */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-center">N°</th>
                  <th className="px-4 py-2.5">Désignation / Objet de l'opération</th>
                  <th className="px-4 py-2.5 text-center">Catégorie</th>
                  <th className="px-4 py-2.5 text-center">Échéance</th>
                  <th className="px-4 py-2.5 text-right">Montant Réglé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">01</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 text-xs">
                      {payment.title}
                    </div>
                    <div className="text-slate-500 text-[11px]" dir="rtl">
                      {payment.titleAr}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {payment.category === 'tuition' ? 'Scolarité' :
                       payment.category === 'canteen' ? 'Restauration' :
                       payment.category === 'transport' ? 'Transport' : 'Inscription'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600 text-[11px]">
                    {payment.dueDate}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-900 text-sm">
                    {payment.amount.toFixed(3)} DT
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-right text-slate-700 uppercase tracking-wider text-xs">
                    Total Net Réglé
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-black text-emerald-700 text-base">
                    {payment.amount.toFixed(3)} DT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* MONTANT EN TOUTES LETTRES & RESTE À PAYER */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-slate-700">Arrêté le présent reçu à la somme de : </span>
                <span className="font-black text-slate-900 italic">« {amountInFrench} »</span>
              </div>
              <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                Reste à payer : 0.000 DT (SOLDE NUL)
              </div>
            </div>
            <div className="text-xs text-right text-slate-800 font-bold" dir="rtl">
              المبلغ بالأحرف: <span className="text-emerald-900">« {amountInArabic} »</span>
            </div>
          </div>

          {/* OFFICIAL STAMP AND SIGNATURE SECTION */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            {/* Signature Payer */}
            <div className="text-center w-full sm:w-1/3">
              <div className="text-[11px] font-bold text-slate-600 mb-10">
                Émargement du Payeur
              </div>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                Signature du parent / tuteur
              </div>
            </div>

            {/* Official School Stamp (Circular graphic) */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-28 h-28 rounded-full border-4 border-emerald-600 flex flex-col items-center justify-center text-center p-2 rotate-[-6deg] bg-white shadow-xs">
                <div className="absolute inset-1 rounded-full border border-dashed border-emerald-400 pointer-events-none"></div>
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest">
                  MADRASATI TUNIS
                </span>
                <div className="my-0.5 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-black text-emerald-700 uppercase">
                  PAYÉ
                </span>
                <span className="text-[7px] font-mono font-bold text-emerald-600">
                  {paymentDate}
                </span>
                <span className="text-[7px] font-bold text-emerald-800 uppercase">
                  CAISSE CENTRALE
                </span>
              </div>
              <span className="text-[9px] font-semibold text-emerald-700 mt-1">
                Cachet officiel de l'établissement
              </span>
            </div>

            {/* Signature Direction & Caisse */}
            <div className="text-center w-full sm:w-1/3">
              <div className="text-[11px] font-bold text-slate-600 mb-10">
                Direction Financière & Caisse
              </div>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                Cachet et signature autorisés
              </div>
            </div>
          </div>

          {/* FOOTER LEGAL NOTICE */}
          <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 space-y-1">
            <p>
              Ce reçu de règlement est un document justificatif officiel émis par l'Établissement Scolaire Privé MySchoolTN.
              Il confère quittance définitive pour les prestations et la période susmentionnées.
            </p>
            <p dir="rtl" className="text-slate-500">
              وصل خلاص رسمي معتمد صادر عن مصلحة المحاسبة والمصادقة بالمؤسسة التربوية الخاصة MySchoolTN.
            </p>
            <div className="font-mono text-[9px] text-slate-400 pt-1">
              Code d'authentification numérique: TN-MYSCHOOL-{payment.id.replace('pay-', '')}-{payment.receiptNumber}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {isRtl ? 'اضغط على "طباعة" لاستخراج الوصل أو حفظه كملف PDF' : 'Cliquez sur « Imprimer » pour éditer sur papier ou enregistrer en PDF'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة الآن' : 'Imprimer maintenant'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {isRtl ? 'إغلاق' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
