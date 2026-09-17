export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'RECEPTION' | 'COACH';

export type MembershipStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'DEBTOR' | 'SUSPENDED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type DebtMode = 'FIXED_MONTHLY' | 'ONE_TIME_OVERDUE' | 'MANUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Coach {
  id: string;
  userId?: string;
  name: string;
  specialization: string; // e.g. "MMA & BJJ", "Grappling & Striking"
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  name: string; // "СМЕНА 1 (Тоқ)", "СМЕНА 2 (Ҷуфт)"
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  daysTextTj: string; // "Душанбе • Чоршанбе • Ҷумъа"
  daysTextRu: string; // "Понедельник • Среда • Пятница"
  startTime: string; // "18:00"
  endTime: string; // "19:30"
  coachId: string;
  coachName: string;
  capacity: number;
  isActive: boolean;
}

export interface StudentGuardian {
  name: string;
  relation: string; // "Падар", "Модар", "Бародар"
  phone: string;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. "TB-1024"
  fullName: string;
  phone: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  photoUrl?: string;
  registrationDate: string;
  shiftId: string;
  monthlyPrice: number; // in TJS (сомонӣ)
  notes?: string;
  isMinor: boolean;
  guardian?: StudentGuardian;
  telegramChatId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Membership {
  id: string;
  studentId: string;
  shiftId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationMonths: number;
  price: number;
  status: MembershipStatus;
  daysRemaining: number;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. "REC-202609-0012"
  studentId: string;
  studentName: string;
  amount: number; // TJS
  paymentDate: string;
  paymentMethod: PaymentMethod;
  membershipPeriod: string; // "17.09.2026 - 17.10.2026"
  receivedBy: string; // staff name
  receivedById: string;
  notes?: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  studentId: string;
  studentName: string;
  phone: string;
  shiftId: string;
  amount: number;
  overdueDate: string; // Date membership expired
  daysOverdue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  shiftId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // coach/staff name
  markedById: string;
  markedAt: string;
  notes?: string;
}

export interface NotificationLog {
  id: string;
  studentId?: string;
  studentName?: string;
  phone?: string;
  channel: 'SMS' | 'TELEGRAM' | 'IN_APP';
  type: 'EXPIRING_SOON' | 'EXPIRING_TOMORROW' | 'EXPIRED' | 'PAYMENT_RECEIVED' | 'DEBT_REMINDER' | 'WELCOME' | 'RENEWAL';
  message: string;
  status: 'SENT' | 'FAILED' | 'CONFIG_MISSING';
  errorDetails?: string;
  sentAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  titleTj: string;
  titleRu: string;
  templateTj: string;
  templateRu: string;
  channels: ('SMS' | 'TELEGRAM' | 'IN_APP')[];
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface GymSettings {
  gymName: string;
  subtitle: string;
  phone: string;
  address: string;
  currency: string; // "TJS"
  currencySymbol: string; // "сомонӣ"
  timezone: string; // "Asia/Dushanbe"
  defaultLanguage: 'tj' | 'ru';
  debtMode: DebtMode;
  autoExtendPolicy: 'PRESERVE_REMAINING' | 'START_FROM_TODAY';
  reminderDaysBefore: number[]; // [7, 3, 1]
  smsConfigured: boolean;
  smsSenderName: string;
  smsApiKey?: string;
  telegramConfigured: boolean;
  telegramBotToken?: string;
  telegramAdminChatId?: string;
}
