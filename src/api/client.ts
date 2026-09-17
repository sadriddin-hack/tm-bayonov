import {
  DashboardOverview,
  EnrichedStudent,
  Student,
  Shift,
  Coach,
  Debt,
  Payment,
  AttendanceSessionResponse,
  AttendanceRecord,
  NotificationLog,
  NotificationTemplate,
  GymSettings,
  AuditLog,
} from '../types/index.js';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tm_bayonov_jwt');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Хатогии дархост');
  }

  return data as T;
}

export const api = {
  // Dashboard
  getDashboardOverview: () => request<DashboardOverview>('/dashboard/overview'),

  // Students
  getStudents: (params: { search?: string; shiftId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.shiftId) query.append('shiftId', params.shiftId);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return request<{ items: EnrichedStudent[]; total: number; totalPages: number; page: number }>(
      `/students?${query.toString()}`
    );
  },
  getStudentById: (id: string) => request<any>(`/students/${id}`),
  createStudent: (payload: any) => request<Student>('/students', { method: 'POST', body: JSON.stringify(payload) }),
  updateStudent: (id: string, payload: any) => request<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteStudent: (id: string) => request<{ success: boolean; message: string }>(`/students/${id}`, { method: 'DELETE' }),

  // Memberships & Renewals
  renewMembership: (payload: {
    studentId: string;
    durationMonths: number;
    amount: number;
    paymentMethod: string;
    notes?: string;
    startDateOverride?: string;
  }) => request<{ membership: any; paymentId: string; receiptNumber: string }>('/memberships/renew', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  evaluateMemberships: () => request<{ success: boolean; stats: any }>('/memberships/evaluate', { method: 'POST' }),

  // Debts
  getDebts: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{ items: Debt[]; totalCount: number; totalAmount: number }>(`/debts${query}`);
  },
  payDebt: (debtId: string, payload: { amount: number; paymentMethod: string; notes?: string }) =>
    request<{ success: boolean; payment: any; remainingDebt: number }>(`/debts/${debtId}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Payments & Receipts
  getPayments: (params?: { studentId?: string; search?: string; dateFrom?: string; dateTo?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.search) query.append('search', params.search);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    return request<{ items: Payment[]; totalCount: number; totalAmount: number }>(`/payments?${query.toString()}`);
  },
  createPayment: (payload: any) => request<Payment>('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  getReceipt: (paymentId: string) =>
    request<{ receipt: Payment; student: Student; shift: Shift | null; gym: GymSettings }>(
      `/payments/${paymentId}/receipt`
    ),

  // Attendance
  getAttendanceSession: (shiftId: string, date?: string) => {
    const query = date ? `?shiftId=${shiftId}&date=${date}` : `?shiftId=${shiftId}`;
    return request<AttendanceSessionResponse>(`/attendance/session${query}`);
  },
  markAttendance: (payload: {
    studentId: string;
    shiftId: string;
    date: string;
    status: string;
    notes?: string;
  }) => request<AttendanceRecord>('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),
  getStudentAttendanceStats: (studentId: string) => request<any>(`/attendance/student/${studentId}`),

  // Shifts & Coaches
  getShifts: () => request<Shift[]>('/shifts'),
  createShift: (payload: any) => request<Shift>('/shifts', { method: 'POST', body: JSON.stringify(payload) }),
  getCoaches: () => request<Coach[]>('/coaches'),

  // Notifications
  getNotifications: () => request<NotificationLog[]>('/notifications'),
  sendNotification: (payload: {
    studentId?: string;
    channel?: 'SMS' | 'TELEGRAM' | 'IN_APP';
    type?: string;
    customMessage?: string;
  }) => request<NotificationLog>('/notifications/send', { method: 'POST', body: JSON.stringify(payload) }),
  getTemplates: () => request<NotificationTemplate[]>('/notifications/templates'),
  updateTemplate: (id: string, payload: Partial<NotificationTemplate>) =>
    request<NotificationTemplate>(`/notifications/templates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getTelegramSummary: () => request<{ text: string }>('/notifications/telegram-summary'),

  // Reports
  getFinanceReport: () => request<any>('/reports/finance'),

  // Settings & Audit
  getSettings: () => request<GymSettings>('/settings'),
  updateSettings: (payload: Partial<GymSettings>) =>
    request<GymSettings>('/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),
};
