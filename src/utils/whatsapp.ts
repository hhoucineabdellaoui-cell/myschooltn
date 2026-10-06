import { Language, Student, Parent, AttendanceRecord, PaymentRecord, GradeRecord, TransportRoute } from '../types';

/**
 * Formats a phone number for WhatsApp wa.me link
 * Handles Tunisian standard format (+216, 8 digits)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If starts with 0 (e.g. 098123456 or local), remove 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // If standard Tunisian 8-digit phone without country code
  if (cleaned.length === 8) {
    cleaned = '216' + cleaned;
  }
  // Default to Tunisia country code if not already prefixed
  if (!cleaned.startsWith('216') && cleaned.length < 11) {
    cleaned = '216' + cleaned;
  }
  return cleaned;
}

/**
 * Creates direct WhatsApp Web / App link with prefilled text
 */
export function createWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates ready-to-send absence or tardiness notice
 */
export function generateAbsenceMessage(
  student: Student,
  parent: Parent,
  attendance: AttendanceRecord,
  lang: Language
): string {
  const isLate = attendance.status === 'late';
  const delayStr = attendance.delayMinutes ? ` (${attendance.delayMinutes} min)` : '';

  if (lang === 'ar') {
    if (isLate) {
      return `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}،\nتعلمكم إدارة المؤسسة التربوية بأن التلميذ(ة) *${student.firstNameAr} ${student.lastNameAr}* (القسم: ${student.classNameAr}) قد وصل(ت) متأخراً(ة) اليوم بتاريخ ${attendance.date} (${attendance.timeSlot}${attendance.delayMinutes ? ` - تأخير ${attendance.delayMinutes} دقيقة` : ''}).\nيرجى السهر على احترام المواعيد. مع تحيات إدارة المؤسسة التربوية (+216).`;
    }
    return `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}،\nتعلمكم إدارة المؤسسة التربوية بغياب التلميذ(ة) *${student.firstNameAr} ${student.lastNameAr}* (القسم: ${student.classNameAr}) اليوم بتاريخ ${attendance.date} (${attendance.timeSlot}).\nيرجى التفضل بتبرير الغياب عبر فضاء الأولياء أو التواصل مع الإدارة. مع تحيات الإدارة التربوية (+216).`;
  }

  if (isLate) {
    return `Bonjour M./Mme ${parent.name},\nL'administration de l'établissement vous informe que votre enfant *${student.firstName} ${student.lastName}* (Classe: ${student.className}) a été marqué(e) *EN RETARD* ce jour le ${attendance.date} (${attendance.timeSlot}${delayStr}).\nMerci de veiller à la ponctualité de votre enfant pour le bon déroulement des apprentissages.\nCordialement, Vie Scolaire - Écoles de Tunisie (+216).`;
  }

  return `Bonjour M./Mme ${parent.name},\nL'administration de l'établissement vous informe que votre enfant *${student.firstName} ${student.lastName}* (Classe: ${student.className}) a été marqué(e) *ABSENT(E)* ce jour le ${attendance.date} (${attendance.timeSlot}).\nMerci de bien vouloir justifier cette absence via votre Espace Parent ou de contacter le secrétariat.\nCordialement, Direction Pédagogique - Écoles de Tunisie (+216).`;
}

/**
 * Generates payment reminder message
 */
export function generatePaymentMessage(
  student: Student,
  parent: Parent,
  payment: PaymentRecord,
  lang: Language
): string {
  if (lang === 'ar') {
    return `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}،\nتذكركم مصلحة الحسابات بالمؤسسة التربوية بموعد خلاص المعاليم المدرسية للتلميذ(ة) *${student.firstNameAr} ${student.lastNameAr}*.\n- البيان : *${payment.titleAr}*\n- المبلغ : *${payment.amount} دينار تونسي*\n- الأجل الأخير : *${payment.dueDate}*\nشكراً لحسن تعاونكم. مصلحة المالية والحسابات (+216).`;
  }

  return `Bonjour M./Mme ${parent.name},\nLe service financier de l'établissement vous rappelle l'échéance de règlement pour votre enfant *${student.firstName} ${student.lastName}*.\n- Objet : *${payment.title}*\n- Montant : *${payment.amount} DT*\n- Date limite : *${payment.dueDate}*\nNous vous remercions pour votre confiance et ponctualité.\nService Comptabilité Écoles de Tunisie.`;
}

/**
 * Generates report card / grade message
 */
export function generateGradeMessage(
  student: Student,
  parent: Parent,
  grade: GradeRecord,
  lang: Language
): string {
  if (lang === 'ar') {
    return `مرحبا ولي أمر التلميذ(ة) ${parent.nameAr}،\nيسعدنا إعلامكم بنتيجة التقييم للتلميذ(ة) *${student.firstNameAr} ${student.lastNameAr}*:\n- المادة : *${grade.subjectAr}* (${grade.examTypeAr})\n- العدد : *${grade.score} / ${grade.maxScore}* (ضارب : ${grade.coefficient})\n- الملاحظة : ${grade.teacherRemarksAr || 'عمل جاد ومثمر'}\nتهانينا على المجهود المتواصل! الإدارة التربوية (+216).`;
  }

  return `Bonjour M./Mme ${parent.name},\nNous vous transmettons le résultat de l'évaluation pour *${student.firstName} ${student.lastName}* :\n- Matière : *${grade.subject}* (${grade.examType})\n- Note obtenue : *${grade.score} / ${grade.maxScore}* (Coef : ${grade.coefficient})\n- Appréciation : ${grade.teacherRemarks || 'Bon investissement régulier'}\nFélicitations pour ses efforts continus !\nDirection Pédagogique - Écoles de Tunisie.`;
}

/**
 * Generates school bus alert
 */
export function generateBusAlertMessage(
  route: TransportRoute,
  stopName: string,
  stopNameAr: string,
  lang: Language
): string {
  if (lang === 'ar') {
    return `🚌 تنبيه حافلة النقل المدرسي - تونس\nأولياء الأمور الكرام، حافلة الخط: *${route.nameAr}* (الترقيم: ${route.busPlate}) تقترب من محطة: *${stopNameAr}*.\nالوقت المتوقع للوصول: *خلال 5 دقائق*.\nيرجى التواجد في الموعد لتسلم أبنائكم.\nالسائق (${route.driverNameAr}): ${route.driverPhone}`;
  }

  return `🚌 *Alerte Bus Scolaire - Tunisie*\nChers Parents, Le bus de la ligne : *${route.name}* (Immatriculation : ${route.busPlate}) approche de l'arrêt : *${stopName}*.\n- Arrivée estimée : dans *5 minutes*.\nMerci d'être présent au point de rencontre pour récupérer votre enfant en toute sécurité.\nChauffeur (${route.driverName}) : ${route.driverPhone}`;
}
