import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Printer,
  X,
  Search
} from 'lucide-react';
import { PaymentRecord, Student, Parent, Language } from '../../types';
import { useTranslation } from '../../translations';
import { generatePaymentMessage } from '../../utils/whatsapp';
import { PaymentReceiptModal } from '../PaymentReceiptModal';

interface PaymentsTabProps {
  payments: PaymentRecord[];
  students: Student[];
  parents: Parent[];
  lang: Language;
  onUpdatePayment: (payment: PaymentRecord) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string, studentName?: string) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  students,
  parents,
  lang,
  onUpdatePayment,
  onAddPayment,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Form State
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || 'stu-1');
  const [title, setTitle] = useState('Frais de scolarité - Mars 2025');
  const [titleAr, setTitleAr] = useState('معلوم الدراسة - مارس 2025');
  const [category, setCategory] = useState<'tuition' | 'canteen' | 'transport' | 'registration'>('tuition');
  const [amount, setAmount] = useState(380);
  const [dueDate, setDueDate] = useState('2025-03-05');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Chèque' | 'Virement bancaire' | 'En ligne / D17'>('Espèces');

  const filteredPayments = payments.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    const parent = parents.find(par => par.id === p.parentId);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.titleAr.includes(searchTerm) ||
      (student && (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || student.firstNameAr.includes(searchTerm))) ||
      (parent && (parent.name.toLowerCase().includes(searchTerm.toLowerCase()) || parent.nameAr.includes(searchTerm)));
    
    return matchesStatus && matchesSearch;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, c) => acc + c.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, c) => acc + c.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((acc, c) => acc + c.amount, 0);

  const handleSendReminder = (payment: PaymentRecord) => {
    const student = students.find(s => s.id === payment.studentId);
    const parent = parents.find(p => p.id === payment.parentId);
    if (!student || !parent) return;

    const studentFullName = isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`;
    const parentFullName = isRtl ? parent.nameAr : parent.name;
    const message = generatePaymentMessage(student, parent, payment, lang);
    onOpenWhatsApp(parentFullName, parent.phone, message, studentFullName);
  };

  const handleTogglePaid = (payment: PaymentRecord) => {
    const newStatus = payment.status === 'paid' ? 'pending' : 'paid';
    const updatedPayment: PaymentRecord = {
      ...payment,
      status: newStatus,
      paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: payment.paymentMethod || 'Espèces'
    };
    onUpdatePayment(updatedPayment);

    if (newStatus === 'paid') {
      setSelectedReceiptPayment(updatedPayment);
    }
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === targetStudentId);
    if (!student) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: targetStudentId,
      parentId: student.parentId,
      title,
      titleAr,
      category,
      amount: Number(amount),
      currency: 'DT',
      dueDate,
      status: paymentStatus,
      paidDate: paymentStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: paymentStatus === 'paid' ? paymentMethod : undefined,
      receiptNumber: `REC-TN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    };

    onAddPayment(newPayment);
    setIsAddModalOpen(false);

    if (paymentStatus === 'paid') {
      setSelectedReceiptPayment(newPayment);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">{t.paid}</div>
            <div className="text-xl font-black text-emerald-600 mt-1">{totalPaid.toLocaleString()} {t.currency || 'DT'}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">{t.pending}</div>
            <div className="text-xl font-black text-amber-600 mt-1">{totalPending.toLocaleString()} {t.currency || 'DT'}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">{t.overdue}</div>
            <div className="text-xl font-black text-rose-600 mt-1">{totalOverdue.toLocaleString()} {t.currency || 'DT'}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              {t.paid}
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              {t.pending}
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              {t.overdue}
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white ${
                isRtl ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'
              }`}
            />
          </div>
        </div>

        <button
          id="open-add-payment-modal-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addPayment}</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold">
                <th className="px-4 py-3 text-start">{t.students}</th>
                <th className="px-4 py-3 text-start">{isRtl ? 'البيان' : 'Libellé'}</th>
                <th className="px-4 py-3 text-start">{t.amount}</th>
                <th className="px-4 py-3 text-start">{t.dueDate}</th>
                <th className="px-4 py-3 text-center">{t.status}</th>
                <th className="px-4 py-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(p => {
                const student = students.find(s => s.id === p.studentId);
                const parent = parents.find(par => par.id === p.parentId);
                const studentName = student ? (isRtl ? `${student.firstNameAr} ${student.lastNameAr}` : `${student.firstName} ${student.lastName}`) : 'Élève';
                const parentName = parent ? (isRtl ? parent.nameAr : parent.name) : '-';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{studentName}</div>
                      <div className="text-[11px] text-slate-400">
                        {isRtl ? `الولي: ${parentName}` : `Parent : ${parentName}`}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{isRtl ? p.titleAr : p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Réf: {p.receiptNumber}</div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-mono font-black text-slate-900 text-sm">
                      {p.amount} {p.currency}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 font-medium text-slate-600">
                      {p.dueDate}
                      {p.paidDate && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          {isRtl ? `خالص بتاريخ: ${p.paidDate}` : `Réglé le : ${p.paidDate}`}
                        </div>
                      )}
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePaid(p)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                          p.status === 'overdue' ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' :
                          'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title={isRtl ? 'انقر لتبديل حالة الخلاص' : 'Cliquer pour basculer le statut'}
                      >
                        {p.status === 'paid' ? t.paid : p.status === 'overdue' ? t.overdue : t.pending}
                      </button>
                    </td>

                    {/* Action WhatsApp Reminder or Print Receipt */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status === 'paid' ? (
                          <button
                            id={`print-receipt-${p.id}-btn`}
                            onClick={() => setSelectedReceiptPayment(p)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                            title={isRtl ? 'طباعة الوصل الرسمي' : 'Imprimer le reçu de paiement officiel'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'طباعة الوصل' : 'Imprimer Reçu'}</span>
                          </button>
                        ) : (
                          <button
                            id={`reminder-payment-${p.id}-btn`}
                            onClick={() => handleSendReminder(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            title={t.sendReminderWhatsApp}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'تذكير' : 'Relance'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{t.addPayment}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.students}</label>
                <select
                  value={targetStudentId}
                  onChange={e => setTargetStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? `${s.firstNameAr} ${s.lastNameAr}` : `${s.firstName} ${s.lastName}`} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                  >
                    <option value="tuition">{t.paymentCategory.tuition}</option>
                    <option value="canteen">{t.paymentCategory.canteen}</option>
                    <option value="transport">{t.paymentCategory.transport}</option>
                    <option value="registration">{t.paymentCategory.registration}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'الحالة الأولية' : 'Statut initial'}
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white font-bold"
                  >
                    <option value="paid">{isRtl ? 'خالص (توليد وصل)' : 'Réglé (Générer reçu)'}</option>
                    <option value="pending">{isRtl ? 'في الانتظار' : 'En attente'}</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'paid' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'طريقة الخلاص' : 'Mode de règlement'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                  >
                    <option value="Espèces">Espèces (نقداً)</option>
                    <option value="Chèque">Chèque bancaire (شيك بنكي)</option>
                    <option value="Virement bancaire">Virement bancaire (تحويل بنكي)</option>
                    <option value="En ligne / D17">Carte / D17 Poste Tunisienne (بطاقة / د17)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Libellé (FR)</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البيان (AR)</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={e => setTitleAr(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isRtl ? 'المبلغ (د.ت)' : 'Montant (DT)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t.dueDate}</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
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
                  {paymentStatus === 'paid' 
                    ? (isRtl ? 'حفظ وطباعة الوصل' : 'Enregistrer & Imprimer') 
                    : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          student={students.find(s => s.id === selectedReceiptPayment.studentId)}
          parent={parents.find(p => p.id === (students.find(s => s.id === selectedReceiptPayment.studentId)?.parentId || selectedReceiptPayment.parentId))}
          lang={lang}
          onClose={() => setSelectedReceiptPayment(null)}
          onOpenWhatsApp={onOpenWhatsApp}
        />
      )}
    </div>
  );
};
