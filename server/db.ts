import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Coach,
  Shift,
  Student,
  Membership,
  Payment,
  Debt,
  AttendanceRecord,
  NotificationLog,
  NotificationTemplate,
  AuditLog,
  GymSettings,
  MembershipStatus,
} from './types.js';

interface DatabaseSchema {
  users: User[];
  coaches: Coach[];
  shifts: Shift[];
  students: Student[];
  memberships: Membership[];
  payments: Payment[];
  debts: Debt[];
  attendance: AttendanceRecord[];
  notifications: NotificationLog[];
  templates: NotificationTemplate[];
  auditLogs: AuditLog[];
  settings: GymSettings;
  lastDailyCheck?: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'gym_database.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Current date in Asia/Dushanbe context (approx simulation using 2026-09-17)
export function getDushanbeCurrentDate(): string {
  // Use today's system date or target simulated date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTj(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return isoDate;
}

// Initial seed data generator
function createSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);

  const users: User[] = [
    {
      id: 'usr-superadmin-01',
      name: 'Устод Баёнов',
      email: 'admin@tmbayonov.tj',
      role: 'SUPER_ADMIN',
      passwordHash: bcrypt.hashSync('admin123', salt),
      phone: '+992900000001',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr-admin-02',
      name: 'Маъмури толор',
      email: 'manager@tmbayonov.tj',
      role: 'ADMIN',
      passwordHash: bcrypt.hashSync('admin123', salt),
      phone: '+992900000002',
      createdAt: '2026-01-05T00:00:00Z',
    },
    {
      id: 'usr-reception-01',
      name: 'Мадинаи Ресепшн',
      email: 'reception@tmbayonov.tj',
      role: 'RECEPTION',
      passwordHash: bcrypt.hashSync('reception123', salt),
      phone: '+992900000003',
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr-coach-01',
      name: 'Мураббӣ Баёнов',
      email: 'coach@tmbayonov.tj',
      role: 'COACH',
      passwordHash: bcrypt.hashSync('coach123', salt),
      phone: '+992900000004',
      createdAt: '2026-01-10T00:00:00Z',
    },
  ];

  const coaches: Coach[] = [
    {
      id: 'coach-01',
      userId: 'usr-coach-01',
      name: 'Баёнов Таҳмурас (Сармураббӣ)',
      specialization: 'MMA & Муҳорибаи омехта, Грэпплинг',
      phone: '+992918889900',
      isActive: true,
    },
    {
      id: 'coach-02',
      name: 'Шеров Фаррух',
      specialization: 'Бокс & Тайский бокс (К-1)',
      phone: '+992935554433',
      isActive: true,
    },
  ];

  const shifts: Shift[] = [
    {
      id: 'shift-01',
      name: 'СМЕНА 1 (Тоқ)',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      daysTextTj: 'Душанбе • Чоршанбе • Ҷумъа',
      daysTextRu: 'Понедельник • Среда • Пятница',
      startTime: '18:00',
      endTime: '19:30',
      coachId: 'coach-01',
      coachName: 'Баёнов Таҳмурас',
      capacity: 35,
      isActive: true,
    },
    {
      id: 'shift-02',
      name: 'СМЕНА 2 (Ҷуфт)',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
      daysTextTj: 'Сешанбе • Панҷшанбе • Шанбе',
      daysTextRu: 'Вторник • Четверг • Суббота',
      startTime: '19:30',
      endTime: '21:00',
      coachId: 'coach-02',
      coachName: 'Шеров Фаррух',
      capacity: 35,
      isActive: true,
    },
  ];

  const students: Student[] = [
    {
      id: 'std-01',
      studentCode: 'TB-1001',
      fullName: 'Садриддин Зокиров',
      phone: '+992901112233',
      birthDate: '2004-05-14',
      gender: 'MALE',
      address: 'ш. Душанбе, н. Сино, кӯч. Борбад 45',
      registrationDate: '2026-08-17',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      notes: 'Спаррингҳои сатҳи миёна, омодагӣ ба мусобиқа',
      isMinor: false,
      telegramChatId: 'tg_sadriddin',
      createdAt: '2026-08-17T10:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-02',
      studentCode: 'TB-1002',
      fullName: 'Фирӯз Саидов',
      phone: '+992934445566',
      birthDate: '2002-11-20',
      gender: 'MALE',
      address: 'ш. Душанбе, н. Шоҳмансур',
      registrationDate: '2026-07-10',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      notes: 'Муҳлаташ гузаштааст, дар сафари корӣ буд',
      isMinor: false,
      createdAt: '2026-07-10T12:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-03',
      studentCode: 'TB-1003',
      fullName: 'Муҳаммад Алии Карим',
      phone: '+992987778899',
      birthDate: '2005-02-18',
      gender: 'MALE',
      address: 'ш. Душанбе, кӯч. Рудакӣ 120',
      registrationDate: '2026-09-01',
      shiftId: 'shift-02',
      monthlyPrice: 350,
      notes: 'Гурӯҳи мукаммали MMA',
      isMinor: false,
      createdAt: '2026-09-01T15:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-04',
      studentCode: 'TB-1004',
      fullName: 'Камол Нозиров',
      phone: '+992928881122',
      birthDate: '2001-09-09',
      gender: 'MALE',
      address: 'ш. Душанбе, н. Фирдавсӣ',
      registrationDate: '2026-06-12',
      shiftId: 'shift-02',
      monthlyPrice: 300,
      notes: '2 моҳ қарздор',
      isMinor: false,
      createdAt: '2026-06-12T09:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-05',
      studentCode: 'TB-1005',
      fullName: 'Беҳрӯз Раҷабов',
      phone: '+992919992211',
      birthDate: '2008-04-12',
      gender: 'MALE',
      address: 'ш. Душанбе, 102 мкр',
      registrationDate: '2026-08-20',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      notes: 'Наврас, гурӯҳи наврасон',
      isMinor: true,
      guardian: {
        name: 'Раҷабов Комрон (Падар)',
        relation: 'Падар',
        phone: '+992918882233',
      },
      createdAt: '2026-08-20T11:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-06',
      studentCode: 'TB-1006',
      fullName: 'Рустам Холов',
      phone: '+992905556677',
      birthDate: '2003-07-22',
      gender: 'MALE',
      address: 'ш. Душанбе, н. И.Сомонӣ',
      registrationDate: '2026-08-18',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      isMinor: false,
      createdAt: '2026-08-18T14:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-07',
      studentCode: 'TB-1007',
      fullName: 'Дилшод Самадов',
      phone: '+992931110022',
      birthDate: '1999-03-30',
      gender: 'MALE',
      address: 'ш. Душанбе, Зарафшон',
      registrationDate: '2026-09-10',
      shiftId: 'shift-02',
      monthlyPrice: 350,
      isMinor: false,
      createdAt: '2026-09-10T16:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-08',
      studentCode: 'TB-1008',
      fullName: 'Умед Бобоев',
      phone: '+992907773344',
      birthDate: '2006-10-15',
      gender: 'MALE',
      address: 'ш. Душанбе, н. Сино',
      registrationDate: '2026-08-25',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      isMinor: false,
      createdAt: '2026-08-25T17:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-09',
      studentCode: 'TB-1009',
      fullName: 'Алишер Ғафуров',
      phone: '+992923334455',
      birthDate: '2000-01-11',
      gender: 'MALE',
      address: 'ш. Душанбе, Саховат',
      registrationDate: '2026-08-16',
      shiftId: 'shift-02',
      monthlyPrice: 300,
      isMinor: false,
      createdAt: '2026-08-16T12:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'std-10',
      studentCode: 'TB-1010',
      fullName: 'Суҳроб Маҷидов',
      phone: '+992915557788',
      birthDate: '2007-06-19',
      gender: 'MALE',
      address: 'ш. Душанбе, кӯч. Айнӣ',
      registrationDate: '2026-08-17',
      shiftId: 'shift-01',
      monthlyPrice: 300,
      isMinor: true,
      guardian: {
        name: 'Маҷидова Зебо (Модар)',
        relation: 'Модар',
        phone: '+992917770011',
      },
      createdAt: '2026-08-17T11:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
  ];

  // Memberships linked to students
  const memberships: Membership[] = [
    {
      id: 'mb-01',
      studentId: 'std-01',
      shiftId: 'shift-01',
      startDate: '2026-09-17',
      endDate: '2026-10-17',
      durationMonths: 1,
      price: 300,
      status: 'ACTIVE',
      daysRemaining: 30,
      lastPaymentDate: '2026-09-17',
      createdAt: '2026-09-17T09:00:00Z',
      updatedAt: '2026-09-17T09:00:00Z',
    },
    {
      id: 'mb-02',
      studentId: 'std-02',
      shiftId: 'shift-01',
      startDate: '2026-08-10',
      endDate: '2026-09-10', // Expired 7 days ago
      durationMonths: 1,
      price: 300,
      status: 'DEBTOR',
      daysRemaining: -7,
      lastPaymentDate: '2026-08-10',
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-09-11T00:00:00Z',
    },
    {
      id: 'mb-03',
      studentId: 'std-03',
      shiftId: 'shift-02',
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      durationMonths: 1,
      price: 350,
      status: 'ACTIVE',
      daysRemaining: 14,
      lastPaymentDate: '2026-09-01',
      createdAt: '2026-09-01T15:00:00Z',
      updatedAt: '2026-09-01T15:00:00Z',
    },
    {
      id: 'mb-04',
      studentId: 'std-04',
      shiftId: 'shift-02',
      startDate: '2026-07-12',
      endDate: '2026-08-12', // Expired >1 month ago
      durationMonths: 1,
      price: 300,
      status: 'DEBTOR',
      daysRemaining: -36,
      lastPaymentDate: '2026-07-12',
      createdAt: '2026-07-12T09:00:00Z',
      updatedAt: '2026-08-13T00:00:00Z',
    },
    {
      id: 'mb-05',
      studentId: 'std-05',
      shiftId: 'shift-01',
      startDate: '2026-08-20',
      endDate: '2026-09-20', // Expiring in 3 days!
      durationMonths: 1,
      price: 300,
      status: 'EXPIRING_SOON',
      daysRemaining: 3,
      lastPaymentDate: '2026-08-20',
      createdAt: '2026-08-20T11:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'mb-06',
      studentId: 'std-06',
      shiftId: 'shift-01',
      startDate: '2026-08-18',
      endDate: '2026-09-18', // Expiring tomorrow (1 day!)
      durationMonths: 1,
      price: 300,
      status: 'EXPIRING_SOON',
      daysRemaining: 1,
      lastPaymentDate: '2026-08-18',
      createdAt: '2026-08-18T14:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'mb-07',
      studentId: 'std-07',
      shiftId: 'shift-02',
      startDate: '2026-09-10',
      endDate: '2026-10-10',
      durationMonths: 1,
      price: 350,
      status: 'ACTIVE',
      daysRemaining: 23,
      lastPaymentDate: '2026-09-10',
      createdAt: '2026-09-10T16:00:00Z',
      updatedAt: '2026-09-10T16:00:00Z',
    },
    {
      id: 'mb-08',
      studentId: 'std-08',
      shiftId: 'shift-01',
      startDate: '2026-08-25',
      endDate: '2026-09-25', // Expiring in 8 days
      durationMonths: 1,
      price: 300,
      status: 'ACTIVE',
      daysRemaining: 8,
      lastPaymentDate: '2026-08-25',
      createdAt: '2026-08-25T17:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'mb-09',
      studentId: 'std-09',
      shiftId: 'shift-02',
      startDate: '2026-08-16',
      endDate: '2026-09-16', // Expired yesterday
      durationMonths: 1,
      price: 300,
      status: 'EXPIRED',
      daysRemaining: -1,
      lastPaymentDate: '2026-08-16',
      createdAt: '2026-08-16T12:00:00Z',
      updatedAt: '2026-09-17T00:00:00Z',
    },
    {
      id: 'mb-10',
      studentId: 'std-10',
      shiftId: 'shift-01',
      startDate: '2026-08-17',
      endDate: '2026-09-17', // Expiring today
      durationMonths: 1,
      price: 300,
      status: 'EXPIRING_SOON',
      daysRemaining: 0,
      lastPaymentDate: '2026-08-17',
      createdAt: '2026-08-17T11:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
  ];

  // Payments
  const payments: Payment[] = [
    {
      id: 'pay-01',
      receiptNumber: 'REC-202609-001',
      studentId: 'std-01',
      studentName: 'Садриддин Зокиров',
      amount: 300,
      paymentDate: '2026-09-17',
      paymentMethod: 'CASH',
      membershipPeriod: '17.09.2026 - 17.10.2026',
      receivedBy: 'Мадинаи Ресепшн',
      receivedById: 'usr-reception-01',
      notes: 'Пардохти саривақтӣ',
      createdAt: '2026-09-17T09:15:00Z',
    },
    {
      id: 'pay-02',
      receiptNumber: 'REC-202609-002',
      studentId: 'std-07',
      studentName: 'Дилшод Самадов',
      amount: 350,
      paymentDate: '2026-09-10',
      paymentMethod: 'CARD',
      membershipPeriod: '10.09.2026 - 10.10.2026',
      receivedBy: 'Мадинаи Ресепшн',
      receivedById: 'usr-reception-01',
      notes: 'Корти Корти Миллӣ',
      createdAt: '2026-09-10T16:10:00Z',
    },
    {
      id: 'pay-03',
      receiptNumber: 'REC-202609-003',
      studentId: 'std-03',
      studentName: 'Муҳаммад Алии Карим',
      amount: 350,
      paymentDate: '2026-09-01',
      paymentMethod: 'BANK_TRANSFER',
      membershipPeriod: '01.09.2026 - 01.10.2026',
      receivedBy: 'Устод Баёнов',
      receivedById: 'usr-superadmin-01',
      notes: 'Алиф Мобайл',
      createdAt: '2026-09-01T15:20:00Z',
    },
    {
      id: 'pay-04',
      receiptNumber: 'REC-202609-004',
      studentId: 'std-08',
      studentName: 'Умед Бобоев',
      amount: 300,
      paymentDate: '2026-08-25',
      paymentMethod: 'CASH',
      membershipPeriod: '25.08.2026 - 25.09.2026',
      receivedBy: 'Мадинаи Ресепшн',
      receivedById: 'usr-reception-01',
      createdAt: '2026-08-25T17:15:00Z',
    },
  ];

  // Debts
  const debts: Debt[] = [
    {
      id: 'dbt-01',
      studentId: 'std-02',
      studentName: 'Фирӯз Саидов',
      phone: '+992934445566',
      shiftId: 'shift-01',
      amount: 300,
      overdueDate: '2026-09-10',
      daysOverdue: 7,
      notes: 'Абонементи моҳи нав пардохт нашудааст',
      createdAt: '2026-09-11T00:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'dbt-02',
      studentId: 'std-04',
      studentName: 'Камол Нозиров',
      phone: '+992928881122',
      shiftId: 'shift-02',
      amount: 600,
      overdueDate: '2026-08-12',
      daysOverdue: 36,
      notes: '2 моҳ қарз: Август ва Сентябр',
      createdAt: '2026-08-13T00:00:00Z',
      updatedAt: '2026-09-17T08:00:00Z',
    },
  ];

  // Attendance
  const attendance: AttendanceRecord[] = [
    {
      id: 'att-01',
      studentId: 'std-01',
      shiftId: 'shift-01',
      date: '2026-09-16',
      status: 'PRESENT',
      markedBy: 'Баёнов Таҳмурас',
      markedById: 'coach-01',
      markedAt: '2026-09-16T18:05:00Z',
    },
    {
      id: 'att-02',
      studentId: 'std-05',
      shiftId: 'shift-01',
      date: '2026-09-16',
      status: 'PRESENT',
      markedBy: 'Баёнов Таҳмурас',
      markedById: 'coach-01',
      markedAt: '2026-09-16T18:05:00Z',
    },
    {
      id: 'att-03',
      studentId: 'std-06',
      shiftId: 'shift-01',
      date: '2026-09-16',
      status: 'LATE',
      notes: '15 дақиқа дер омад',
      markedBy: 'Баёнов Таҳмурас',
      markedById: 'coach-01',
      markedAt: '2026-09-16T18:20:00Z',
    },
    {
      id: 'att-04',
      studentId: 'std-08',
      shiftId: 'shift-01',
      date: '2026-09-16',
      status: 'ABSENT',
      markedBy: 'Баёнов Таҳмурас',
      markedById: 'coach-01',
      markedAt: '2026-09-16T18:05:00Z',
    },
    {
      id: 'att-05',
      studentId: 'std-10',
      shiftId: 'shift-01',
      date: '2026-09-16',
      status: 'EXCUSED',
      notes: 'Иҷозат гирифта буд',
      markedBy: 'Баёнов Таҳмурас',
      markedById: 'coach-01',
      markedAt: '2026-09-16T18:05:00Z',
    },
  ];

  // Templates
  const templates: NotificationTemplate[] = [
    {
      id: 'tmpl-exp-soon',
      type: 'EXPIRING_SOON',
      titleTj: 'Муҳлати абонемент наздик аст',
      titleRu: 'Срок абонемента истекает',
      templateTj: 'Салом, {student_name}! Абонементи шумо дар {gym_name} рӯзи {expiration_date} ба анҷом мерасад. Лутфан барои идомаи машқҳо саривақт тамдид кунед. Маблағ: {amount} сомонӣ.',
      templateRu: 'Здравствуйте, {student_name}! Срок вашего абонемента в {gym_name} истекает {expiration_date}. Пожалуйста, продлите его заранее. Сумма: {amount} сомони.',
      channels: ['SMS', 'TELEGRAM', 'IN_APP'],
      enabled: true,
    },
    {
      id: 'tmpl-exp-tomorrow',
      type: 'EXPIRING_TOMORROW',
      titleTj: 'Абонемент пагоҳ ба охир мерасад',
      titleRu: 'Абонемент истекает завтра',
      templateTj: 'Салом, {student_name}! Абонементи шумо пагоҳ ба анҷом мерасад. Барои идомаи машқҳо лутфан пардохти моҳи навро анҷом диҳед. TM BAYONOV MMA',
      templateRu: 'Здравствуйте, {student_name}! Ваш абонемент истекает завтра. Для продолжения тренировок просим оплатить новый месяц. TM BAYONOV MMA',
      channels: ['SMS', 'TELEGRAM', 'IN_APP'],
      enabled: true,
    },
    {
      id: 'tmpl-expired',
      type: 'EXPIRED',
      titleTj: 'Абонемент ба охир расид',
      titleRu: 'Абонемент истек',
      templateTj: 'Ҳурматӣ {student_name}! Мӯҳлати абонементи шумо дар TM BAYONOV MMA гузашт. Лутфан ба ресепшн муроҷиат намуда, онро тамдид намоед.',
      templateRu: 'Уважаемый {student_name}! Срок действия вашего абонемента в TM BAYONOV MMA завершился. Пожалуйста, обратитесь на ресепшн для продления.',
      channels: ['SMS', 'TELEGRAM', 'IN_APP'],
      enabled: true,
    },
    {
      id: 'tmpl-pay-received',
      type: 'PAYMENT_RECEIVED',
      titleTj: 'Пардохт қабул шуд',
      titleRu: 'Оплата получена',
      templateTj: 'Ташаккур, {student_name}! Пардохти шумо ба маблағи {amount} сомонӣ бомуваффақият сабт шуд. Мӯҳлати нав то: {expiration_date}. TM BAYONOV MMA.',
      templateRu: 'Спасибо, {student_name}! Оплата на сумму {amount} сомони успешно принята. Новый срок до: {expiration_date}. TM BAYONOV MMA.',
      channels: ['SMS', 'TELEGRAM', 'IN_APP'],
      enabled: true,
    },
    {
      id: 'tmpl-debt-reminder',
      type: 'DEBT_REMINDER',
      titleTj: 'Ёдраскунии қарздорӣ',
      titleRu: 'Напоминание о задолженности',
      templateTj: 'Ҳурматӣ {student_name}! Шумо дар толори TM BAYONOV MMA маблағи {amount} сомонӣ қарздории пардохтнашуда доред. Лутфан ҳарчи зудтар пардохт намоед.',
      templateRu: 'Уважаемый {student_name}! У вас имеется задолженность по оплате абонемента в размере {amount} сомони в TM BAYONOV MMA. Просим погасить задолженность.',
      channels: ['SMS', 'TELEGRAM', 'IN_APP'],
      enabled: true,
    },
  ];

  const notifications: NotificationLog[] = [
    {
      id: 'notif-01',
      studentId: 'std-06',
      studentName: 'Рустам Холов',
      phone: '+992905556677',
      channel: 'SMS',
      type: 'EXPIRING_SOON',
      message: 'Салом, Рустам Холов! Абонементи шумо пагоҳ ба анҷом мерасад. Барои идомаи машқҳо лутфан пардохти моҳи навро анҷом диҳед.',
      status: 'SENT',
      sentAt: '2026-09-17T08:00:00Z',
    },
    {
      id: 'notif-02',
      studentId: 'std-01',
      studentName: 'Садриддин Зокиров',
      phone: '+992901112233',
      channel: 'TELEGRAM',
      type: 'PAYMENT_RECEIVED',
      message: 'Ташаккур, Садриддин Зокиров! Пардохти шумо 300 сомонӣ қабул шуд. Муҳлат то 17.10.2026.',
      status: 'SENT',
      sentAt: '2026-09-17T09:16:00Z',
    },
    {
      id: 'notif-03',
      studentId: 'std-02',
      studentName: 'Фирӯз Саидов',
      phone: '+992934445566',
      channel: 'SMS',
      type: 'DEBT_REMINDER',
      message: 'Ҳурматӣ Фирӯз Саидов! Шумо 300 сомонӣ қарздорӣ доред. TM BAYONOV MMA.',
      status: 'SENT',
      sentAt: '2026-09-17T08:30:00Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-01',
      userId: 'usr-reception-01',
      userName: 'Мадинаи Ресепшн',
      userRole: 'RECEPTION',
      action: 'PAYMENT_RECEIVED',
      entity: 'Payment',
      entityId: 'pay-01',
      details: 'Пардохти 300 сомонӣ аз шогирд Садриддин Зокиров қабул шуд (REC-202609-001)',
      timestamp: '2026-09-17T09:15:00Z',
    },
    {
      id: 'aud-02',
      userId: 'usr-reception-01',
      userName: 'Мадинаи Ресепшн',
      userRole: 'RECEPTION',
      action: 'MEMBERSHIP_RENEWED',
      entity: 'Membership',
      entityId: 'mb-01',
      details: 'Абонементи Садриддин Зокиров то 17.10.2026 тамдид карда шуд',
      timestamp: '2026-09-17T09:15:00Z',
    },
    {
      id: 'aud-03',
      userId: 'usr-coach-01',
      userName: 'Баёнов Таҳмурас',
      userRole: 'COACH',
      action: 'ATTENDANCE_MARKED',
      entity: 'Attendance',
      details: 'Давомоти Сменаи 1 барои санаи 16.09.2026 сабт карда шуд',
      timestamp: '2026-09-16T18:25:00Z',
    },
  ];

  const settings: GymSettings = {
    gymName: 'TM BAYONOV',
    subtitle: 'MMA TRAINING CENTER',
    phone: '+992 90 000 0001',
    address: 'Ҷумҳурии Тоҷикистон, ш. Душанбе, хиёбони Исмоили Сомонӣ 24',
    currency: 'TJS',
    currencySymbol: 'сомонӣ',
    timezone: 'Asia/Dushanbe',
    defaultLanguage: 'tj',
    debtMode: 'FIXED_MONTHLY',
    autoExtendPolicy: 'PRESERVE_REMAINING',
    reminderDaysBefore: [7, 3, 1],
    smsConfigured: true,
    smsSenderName: 'TMBAYONOV',
    smsApiKey: 'sk_live_tajik_sms_demo',
    telegramConfigured: true,
    telegramBotToken: 'bot_tmbayonov_mma_demo_token',
    telegramAdminChatId: '-10023456789',
  };

  return {
    users,
    coaches,
    shifts,
    students,
    memberships,
    payments,
    debts,
    attendance,
    notifications,
    templates,
    auditLogs,
    settings,
    lastDailyCheck: '2026-09-17',
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed reading database file, recreating seed data:', err);
        this.data = createSeedData();
        this.save();
      }
    } else {
      this.data = createSeedData();
      this.save();
    }
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed saving database:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  // Transaction helper
  public mutate<T>(fn: (db: DatabaseSchema) => T): T {
    const result = fn(this.data);
    this.save();
    return result;
  }
}

export const db = new DatabaseManager();
