import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { Parent, Student, WhatsAppMessageLog, Language } from '../../types';
import { useTranslation } from '../../translations';
import { createWhatsAppUrl } from '../../utils/whatsapp';

interface WhatsAppCenterTabProps {
  parents: Parent[];
  students: Student[];
  whatsappLogs: WhatsAppMessageLog[];
  lang: Language;
  onSendMessage: (log: WhatsAppMessageLog) => void;
}

export const WhatsAppCenterTab: React.FC<WhatsAppCenterTabProps> = ({
  parents,
  whatsappLogs,
  lang,
  onSendMessage
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const [selectedParentId, setSelectedParentId] = useState<string>(parents[0]?.id || '');
  const [customPhone, setCustomPhone] = useState('+216 98 123 456');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<'custom' | 'absence' | 'payment' | 'exam' | 'transport' | 'announcement'>('absence');

  const selectedParent = parents.find(p => p.id === selectedParentId);

  // Template generators
  const applyTemplate = (type: 'absence' | 'payment' | 'exam' | 'transport' | 'announcement') => {
    setActiveTemplate(type);
    const pName = selectedParent ? (isRtl ? selectedParent.nameAr : selectedParent.name) : (isRtl ? 'ولي الأمر' : 'M./Mme le Parent');
    
    if (type === 'absence') {
      setMessage(
        isRtl
          ? `مرحبا ولي أمر التلميذ(ة) ${pName}،\nتعلمكم إدارة المؤسسة بغياب تلميذكم هذا الصباح.\nيرجى التفضل بتبرير الغياب عبر فضاء الأولياء أو لدى شؤون التلاميذ بالمدرسة.\nإدارة المؤسسة التربوية - تونس (+216).`
          : `Bonjour M./Mme ${pName},\nL'administration vous informe de l'absence signalée de votre enfant ce matin.\nMerci de bien vouloir justifier cette absence via l'espace parents ou auprès du secrétariat.\nDirection Établissement Scolaire - Tunisie.`
      );
    } else if (type === 'payment') {
      setMessage(
        isRtl
          ? `مرحبا ولي أمر التلميذ(ة) ${pName}،\nنذكركم بموعد خلاص المعاليم المدرسية للشهر الجاري (المبلغ : 380 د.ت).\nشكراً لحسن تعاونكم الدائم.\nمصلحة المحاسبة والمالية - مدارس تونس.`
          : `Bonjour M./Mme ${pName},\nNous vous rappelons l'échéance de règlement des frais scolaires pour le mois en cours (Montant : 380 DT).\nMerci pour votre ponctualité habituelle.\nService Comptabilité Écoles de Tunisie.`
      );
    } else if (type === 'exam') {
      setMessage(
        isRtl
          ? `مرحبا ولي أمر التلميذ(ة) ${pName}،\nيسعدنا إعلامكم بنشر نتائج الفروض وبطاقات الأعداد عبر فضاء الأولياء.\nتهانينا لتلميذكم على العمل الجاد والنتائج المتميزة.\nالإدارة البيداغوجية - مدارس تونس.`
          : `Bonjour M./Mme ${pName},\nLes résultats des devoirs de contrôle et synthèses sont désormais disponibles sur votre Espace Parent.\nFélicitations à votre enfant pour son sérieux et son travail assidu aux examens !\nDirection Pédagogique - Écoles de Tunisie.`
      );
    } else if (type === 'transport') {
      setMessage(
        isRtl
          ? `🚌 تنبيه حافلة النقل المدرسي - تونس\nأولياء الأمور الكرام، حافلة النقل تقترب من محطتكم (حوالي 5 دقائق).\nيرجى التواجد في الموعد لتسلم أبنائكم.\nمصلحة النقل المدرسي.`
          : `🚌 *Alerte Bus Scolaire - Tunisie*\nChers Parents,\nLe bus scolaire approche de votre arrêt (environ 5 minutes).\nMerci d'être au point de rencontre pour récupérer vos enfants.\nService Transport Scolaire.`
      );
    } else if (type === 'announcement') {
      setMessage(
        isRtl
          ? `📢 بلاغ إخباري هام إلى الأولياء\nأولياء الأمور الكرام، يسعدنا دعوتكم إلى اللقاء البيداغوجي المفتوح هذا السبت انطلاقاً من الساعة 09:30 صباحاً، مع التركيز على الاستعداد للمناظرات الوطنية.\nحضوركم يسعدنا ويدعم تميز أبنائنا.\nالإدارة التربوية - مدارس تونس.`
          : `📢 *Communiqué Important aux Parents*\nChers Parents,\nNous avons le plaisir de vous convier à la rencontre pédagogique parents-enseignants ce samedi à partir de 09h30, avec un focus sur la préparation aux concours nationaux.\nVotre présence est précieuse pour la réussite de nos élèves.\nDirection Pédagogique - Écoles de Tunisie.`
      );
    }
  };

  React.useEffect(() => {
    applyTemplate('absence');
  }, [selectedParentId, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const phoneToUse = selectedParent ? selectedParent.phone : customPhone;
    const recipientToUse = selectedParent ? (isRtl ? selectedParent.nameAr : selectedParent.name) : 'Parent';
    const url = createWhatsAppUrl(phoneToUse, message);
    window.open(url, '_blank');

    const newLog: WhatsAppMessageLog = {
      id: `msg-${Date.now()}`,
      recipientName: recipientToUse,
      phone: phoneToUse,
      type: activeTemplate === 'custom' ? 'custom' : activeTemplate,
      contentFr: message,
      contentAr: message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'sent'
    };
    onSendMessage(newLog);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{t.whatsappHub}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.whatsappSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>API WhatsApp Direct (+216)</span>
          </span>
        </div>
      </div>

      {/* Main Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Template selection (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            {t.composeMessage}
          </h4>

          {/* Preset Template Chips */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.templates}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('absence')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTemplate === 'absence'
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t.templateAbsence}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('payment')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTemplate === 'payment'
                    ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t.templatePayment}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('exam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTemplate === 'exam'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t.templateExam}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('transport')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTemplate === 'transport'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t.templateTransport}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('announcement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTemplate === 'announcement'
                    ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t.templateGeneral}
              </button>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.selectRecipient}
              </label>
              <select
                id="whatsapp-select-recipient"
                value={selectedParentId}
                onChange={e => setSelectedParentId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {parents.map(p => (
                  <option key={p.id} value={p.id}>
                    {isRtl ? p.nameAr : p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.recipientPhone}
              </label>
              <input
                type="text"
                value={selectedParent ? selectedParent.phone : customPhone}
                onChange={e => setCustomPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono bg-slate-50 text-slate-800"
                dir="ltr"
              />
            </div>
          </div>

          {/* Message Content */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t.messageContent}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (isRtl ? 'تم النسخ!' : 'Copié !') : (isRtl ? 'نسخ' : 'Copier')}
              </button>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setActiveTemplate('custom');
              }}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
            />
          </div>

          {/* Send Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              id="whatsapp-center-send-btn"
              type="button"
              onClick={handleSendWhatsApp}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'إرسال عبر واتساب' : 'Envoyer sur WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: WhatsApp Live Bubble Preview & Recent Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#e5ddd5] rounded-2xl p-4 border border-slate-300/60 shadow-xs space-y-3">
            <div className="bg-[#075e54] text-white p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                  {selectedParent?.name.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="font-bold text-xs">
                    {selectedParent ? (isRtl ? selectedParent.nameAr : selectedParent.name) : 'Destinataire'}
                  </div>
                  <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {isRtl ? 'متصل الآن' : 'En ligne'}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono opacity-80" dir="ltr">
                WhatsApp Web
              </div>
            </div>

            <div className="bg-white rounded-xl p-3.5 text-xs text-slate-800 shadow-sm max-w-[90%] ml-auto mr-0 rounded-tr-none border border-slate-100/60 whitespace-pre-wrap leading-relaxed">
              {message}
              <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1" dir="ltr">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-emerald-500 font-bold">✓✓</span>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-2 flex items-center gap-2 border border-emerald-800/20 shadow-xs">
              <input
                type="text"
                readOnly
                value={message.replace(/\n/g, ' ')}
                className="flex-1 bg-transparent text-[11px] text-slate-600 truncate border-none outline-none font-sans px-1"
                placeholder={isRtl ? 'اكتب رسالة...' : 'Écrire un message...'}
              />
              <button
                id="preview-whatsapp-send-btn"
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title={isRtl ? 'إرسال عبر واتساب' : 'Envoyer sur l\'interface WhatsApp'}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إرسال' : 'Envoyer'}</span>
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-medium">
              {isRtl ? 'الرسائل مشفرة تماماً بين الطرفين' : 'Les messages sont chiffrés de bout en bout'}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {t.messageHistory}
            </h4>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {whatsappLogs.map(log => (
                <div key={log.id} className="py-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{log.recipientName}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                      {isRtl ? 'مرسل' : 'Envoyé'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1">
                    {isRtl ? log.contentAr : log.contentFr}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                    {log.phone} • {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
