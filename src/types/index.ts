export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'RECEPTION' | 'COACH';

export type MembershipStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'DEBTOR' | 'SUSPENDED' | 'CANCELLED' | 'INACTIVE';

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type DebtMode = 'FIXED_MONTHLY' | 'ONE_TIME_OVERDUE' | 'MANUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentGuardian {
  name: string;
  relation: string;
  phone: string;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  phone: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  photoUrl?: string;
  registrationDate: string;
  shiftId: string;
  monthlyPrice: number;
  notes?: string;
  isMinor: boolean;
  guardian?: StudentGuardian;
  telegramChatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedStudent extends Student {
  shiftName: string;
  shiftDays: string;
  coachName: string;
  status: MembershipStatus;
  daysRemaining: number | null;
  startDate: string;
  endDate: string;
  debtAmount: number;
  daysOverdue: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
}

export interface Membership {
  id: string;
  studentId: string;
  shiftId: string;
  startDate: string;
  endDate: string;
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
  receiptNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  membershipPeriod: string;
  receivedBy: string;
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
  shiftName?: string;
  amount: number;
  overdueDate: string;
  daysOverdue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  daysOfWeek: number[];
  daysTextTj: string;
  daysTextRu: string;
  startTime: string;
  endTime: string;
  coachId: string;
  coachName: string;
  capacity: number;
  isActive: boolean;
  isToday?: boolean;
  studentCount?: number;
}

export interface Coach {
  id: string;
  userId?: string;
  name: string;
  specialization: string;
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  shiftId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  markedById: string;
  markedAt: string;
}

export interface AttendanceRosterItem {
  studentId: string;
  studentCode: string;
  fullName: string;
  phone: string;
  membershipStatus: MembershipStatus;
  isDebtor: boolean;
  attendanceStatus: AttendanceStatus | null;
  recordId: string | null;
  notes: string;
  markedAt: string | null;
  markedBy: string | null;
}

export interface AttendanceSessionResponse {
  shift: Shift;
  date: string;
  roster: AttendanceRosterItem[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    unmarked: number;
  };
  students?: Array<{
    student: Student;
    membership: Membership;
    record: AttendanceRecord | null;
  }>;
  stats?: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  };
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

export interface GymSettings {
  gymName: string;
  subtitle: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultLanguage: 'tj' | 'ru';
  debtMode: DebtMode;
  autoExtendPolicy: 'PRESERVE_REMAINING' | 'START_FROM_TODAY';
  reminderDaysBefore: number[];
  smsConfigured: boolean;
  smsSenderName: string;
  smsApiKey?: string;
  telegramConfigured: boolean;
  telegramBotToken?: string;
  telegramAdminChatId?: string;
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
  timestamp: string;
}

export interface DashboardOverview {
  stats: {
    totalStudents: number;
    activeMemberships: number;
    expiringSoon: number;
    expired: number;
    debtorsCount: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalDebtAmount: number;
    activeTodayStudentsCount: number;
  };
  alerts: Array<{
    id: string;
    type: 'DANGER' | 'WARNING' | 'DEBT' | 'INFO';
    count: number;
    labelTj: string;
    labelRu: string;
    action: string;
  }>;
  todayShifts: Shift[];
  recentPayments: Payment[];
  topDebtors: Debt[];
  currentDate: string;
}
