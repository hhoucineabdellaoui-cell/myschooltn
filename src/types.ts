export type Language = 'fr' | 'ar';

export type UserRole = 'admin' | 'parent' | 'teacher';

export type TabType = 
  | 'overview'
  | 'students'
  | 'parents'
  | 'classes'
  | 'teachers'
  | 'attendance'
  | 'grades'
  | 'timetable'
  | 'payments'
  | 'canteen'
  | 'transport'
  | 'whatsapp_center'
  | 'tunisia_schools';

export interface TunisianSchool {
  id: string;
  name: string;
  nameAr: string;
  type: 'primaire' | 'college' | 'lycee' | 'complexe';
  category: 'public' | 'prive' | 'pilote' | 'international';
  governorate: string; // e.g. "Tunis", "Ariana", "Sousse", "Sfax", "Nabeul", "Bizerte"
  governorateAr: string;
  delegation: string;
  delegationAr: string;
  city: string;
  cityAr: string;
  address: string;
  addressAr: string;
  phone: string; // e.g. "+216 71 888 999"
  email: string;
  directorName: string;
  directorNameAr: string;
  studentCount: number;
  classesCount: number;
  successRate: number; // e.g. 98.5%
  isPartner: boolean;
  motto: string;
  mottoAr: string;
}

export interface Student {
  id: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  classId: string;
  className: string;
  classNameAr: string;
  parentId: string;
  photo: string;
  birthDate: string;
  gender: 'M' | 'F';
  bloodType: string;
  canteenSubscribed: boolean;
  transportSubscribed: boolean;
  transportRouteId?: string;
  attendanceRate: number;
  averageGrade: number;
}

export interface Parent {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  password?: string;
  address: string;
  addressAr: string;
  childrenIds: string[];
  relationship: string;
  relationshipAr: string;
  whatsappOptIn: boolean;
}

export interface AuthUser {
  role: 'admin' | 'parent' | 'teacher';
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone?: string;
  parentId?: string;
  teacherId?: string;
  schoolId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nameAr: string;
  subject: string;
  subjectAr: string;
  phone: string;
  email: string;
  password?: string;
  classes: string[];
  photo: string;
}

export interface HomeworkItem {
  id: string;
  classId: string;
  className: string;
  classNameAr: string;
  teacherId: string;
  teacherName: string;
  teacherNameAr: string;
  subject: string;
  subjectAr: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  dueDate: string; // YYYY-MM-DD
  assignedDate: string; // YYYY-MM-DD
  estimatedMinutes?: number;
  status?: 'active' | 'archived';
  attachmentName?: string;
  submittedToAdmin?: boolean;
  submittedAt?: string;
  adminValidated?: boolean;
  adminValidatedAt?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  nameAr: string;
  level: string;
  levelAr?: string;
  roomNumber: string;
  mainTeacherId: string;
  studentCount: number;
  capacity?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  subject?: string;
  subjectAr?: string;
  reason?: string;
  reasonAr?: string;
  isJustified?: boolean;
  timeSlot: string; // e.g. "08:30 - 12:00"
  notifiedWhatsapp: boolean;
  parentJustifiedAt?: string;
  parentNote?: string;
  delayMinutes?: number;
  submittedByTeacherId?: string;
  submittedByTeacherName?: string;
  submittedByTeacherNameAr?: string;
  submittedAt?: string;
  adminValidated?: boolean;
  adminValidatedAt?: string;
  adminNote?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subject: string;
  subjectAr: string;
  examType: 'Devoir de Contrôle 1' | 'Devoir de Contrôle 2' | 'Devoir de Synthèse' | 'Devoir 1' | 'Devoir 2' | 'Examen Trimestre' | 'Contrôle Continu' | string;
  examTypeAr: string;
  score: number;
  maxScore: number;
  coefficient: number;
  date: string;
  teacherRemarks?: string;
  teacherRemarksAr?: string;
  submittedByTeacherId?: string;
  submittedByTeacherName?: string;
  submittedByTeacherNameAr?: string;
  submittedAt?: string;
  adminValidated?: boolean;
  adminValidatedAt?: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
  nameAr: string;
  code?: string;
  coefficient: number;
  category?: string;
  categoryAr?: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  timeSlot: string;
  subject: string;
  subjectAr: string;
  teacherName: string;
  teacherNameAr: string;
  room: string;
  color: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  parentId: string;
  title: string;
  titleAr: string;
  category: 'tuition' | 'canteen' | 'transport' | 'registration';
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptNumber: string;
  paymentMethod?: 'Espèces' | 'Chèque' | 'Virement bancaire' | 'En ligne / D17' | string;
  notes?: string;
}

export interface CanteenDay {
  day: string;
  dayAr: string;
  date: string;
  starter: string;
  starterAr: string;
  mainDish: string;
  mainDishAr: string;
  dessert: string;
  dessertAr: string;
  calories: number;
  allergens: string[];
}

export interface TransportStop {
  id: string;
  name: string;
  nameAr: string;
  scheduledTime: string;
  passed: boolean;
}

export interface TransportRoute {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  driverName: string;
  driverNameAr: string;
  driverPhone: string;
  supervisorName: string;
  supervisorPhone: string;
  busPlate: string;
  capacity: number;
  currentStudentCount: number;
  status: 'departed' | 'on_route' | 'arrived' | 'idle';
  currentStopIndex: number;
  stops: TransportStop[];
}

export interface WhatsAppMessageLog {
  id: string;
  recipientName: string;
  phone: string;
  type: 'absence' | 'payment' | 'grade' | 'transport' | 'announcement' | 'custom' | 'exam';
  contentFr: string;
  contentAr: string;
  timestamp: string;
  status: 'sent' | 'pending';
  studentName?: string;
}
