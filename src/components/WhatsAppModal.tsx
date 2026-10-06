import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, User, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../translations';
import { createWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  defaultMessage: string;
  messageType?: string;
  studentName?: string;
  lang: Language;
  onMessageSent?: (log: {
    recipientName: string;
    phone: string;
    message: string;
    studentName?: string;
  }) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  defaultMessage,
  studentName,
  lang,
  onMessageSent
}) => {
  const t = useTranslation(lang);
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);
  const isRtl = lang === 'ar';

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = createWhatsAppUrl(recipientPhone, message);
    window.open(url, '_blank');
    if (onMessageSent) {
      onMessageSent({
        recipientName,
        phone: recipientPhone,
        message,
        studentName
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isRtl ? 'إرسال رسالة واتساب' : 'Envoyer un message WhatsApp'}
              </h3>
              <p className="text-xs text-emerald-100">
                {isRtl ? 'تواصل مباشر مع ولي الأمر' : 'Communication directe avec le parent'}
              </p>
            </div>
          </div>
          <button
            id="close-whatsapp-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Recipient Details Card */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{t.selectRecipient}</div>
                <div className="text-sm font-bold text-slate-800">{recipientName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span dir="ltr">{recipientPhone}</span>
            </div>
          </div>

          {studentName && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 px-1">
              <span className="font-semibold text-slate-700">
                {isRtl ? 'التلميذ المعني :' : 'Élève concerné :'}
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200/50">
                {studentName}
              </span>
            </div>
          )}

          {/* Message textarea */}
          <div>
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
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans"
              placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Saisissez votre message ici...'}
            />
          </div>

          {/* WhatsApp Preview Bubble Simulation */}
          <div className="rounded-2xl bg-[#e5ddd5] p-4 border border-emerald-900/10 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                {isRtl ? 'معاينة رسالة واتساب' : 'Interface WhatsApp Direct'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold" dir="ltr">
                {recipientPhone}
              </span>
            </div>
            <div className="bg-white rounded-xl p-3.5 text-xs text-slate-800 shadow-sm max-w-md ml-auto mr-0 rounded-tr-none border border-slate-100 whitespace-pre-wrap leading-relaxed">
              {message}
              <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1.5" dir="ltr">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-emerald-500 font-bold">✓✓</span>
              </div>
            </div>

            {/* Simulated WhatsApp chat input bar with direct Send button */}
            <div className="bg-slate-100/90 rounded-xl p-2 flex items-center gap-2 border border-slate-300/60">
              <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-xs text-slate-500 truncate">
                {message ? (message.length > 50 ? message.substring(0, 50) + '...' : message) : (isRtl ? 'اكتب رسالة...' : 'Écrire un message...')}
              </div>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={isRtl ? 'إرسال مباشر عبر واتساب' : 'Envoyer directement sur WhatsApp'}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إرسال' : 'Envoyer'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="cancel-whatsapp-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <div className="flex items-center gap-2">
            <button
              id="log-only-whatsapp-btn"
              type="button"
              onClick={() => {
                if (onMessageSent) {
                  onMessageSent({
                    recipientName,
                    phone: recipientPhone,
                    message,
                    studentName
                  });
                }
                onClose();
              }}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 inline me-1" />
              <span>{isRtl ? 'تسجيل كمرسل' : 'Marquer envoyé'}</span>
            </button>
            <button
              id="send-whatsapp-action-btn"
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'إرسال (WhatsApp Web / App)' : 'Envoyer sur WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
