import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar, NavSection } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { DashboardView } from './features/dashboard/DashboardView.js';
import { StudentsView } from './features/students/StudentsView.js';
import { DebtorsView } from './features/debts/DebtorsView.js';
import { AttendanceView } from './features/attendance/AttendanceView.js';
import { PaymentsView } from './features/payments/PaymentsView.js';
import { ShiftsView } from './features/shifts/ShiftsView.js';
import { NotificationsView } from './features/notifications/NotificationsView.js';
import { ReportsView } from './features/reports/ReportsView.js';
import { SettingsView } from './features/settings/SettingsView.js';
import { StudentFormModal } from './features/students/StudentFormModal.js';
import { StudentProfileModal } from './features/students/StudentProfileModal.js';
import { RenewalModal } from './features/memberships/RenewalModal.js';
import { QrCodeModal } from './components/common/QrCodeModal.js';
import { ReceiptModal } from './components/common/ReceiptModal.js';
import { QuickPaymentModal } from './features/payments/QuickPaymentModal.js';
import { ConfirmDialog } from './components/common/ConfirmDialog.js';
import {
  DashboardOverview,
  EnrichedStudent,
  Shift,
  Student,
  Payment,
  GymSettings,
} from './types/index.js';
import { api } from './api/client.js';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Navigation state
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [extraFilter, setExtraFilter] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global gym data
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<EnrichedStudent | Student | null>(null);
  const [renewStudent, setRenewStudent] = useState<EnrichedStudent | Student | null>(null);
  const [qrStudent, setQrStudent] = useState<EnrichedStudent | Student | null>(null);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    payment: Payment;
    student?: Student | null;
    shift?: Shift | null;
    gym?: GymSettings | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh dashboard data
  const refreshData = async () => {
    try {
      const [ovData, shData] = await Promise.all([
        api.getDashboardOverview(),
        api.getShifts(),
      ]);
      setOverview(ovData);
      setShifts(shData);
    } catch (err) {
      console.error('Failed to load gym data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleNavigate = (section: NavSection, filter?: string) => {
    setCurrentSection(section);
    setExtraFilter(filter || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const res = await api.getReceipt(paymentId);
      setReceiptData({
        payment: res.receipt,
        student: res.student,
        shift: res.shift,
        gym: res.gym,
      });
    } catch (err: any) {
      alert(err.message || 'Хатогӣ ҳангоми боргирии квитансия');
    }
  };

  const handleRenewSuccess = (result: { paymentId: string }) => {
    refreshData();
    handleViewReceipt(result.paymentId);
  };

  const handlePayDebtSuccess = (paymentId: string) => {
    refreshData();
    handleViewReceipt(paymentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Хатогӣ ҳангоми несткунии шогирд');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReminder = async (student: Student) => {
    try {
      await api.sendNotification({
        studentId: student.id,
        channel: 'SMS',
        type: 'EXPIRING_3_DAYS',
      });
      alert(`Паёми ёдраскунӣ ба ${student.fullName} (${student.phone}) ирсол карда шуд!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getSectionTitle = (section: NavSection): string => {
    switch (section) {
      case 'dashboard':
        return t.navDashboard;
      case 'students':
        return t.navStudents;
      case 'shifts':
        return t.navShifts;
      case 'attendance':
        return t.navAttendance;
      case 'payments':
        return t.navPayments;
      case 'debtors':
        return t.navDebtors;
      case 'notifications':
        return t.navNotifications;
      case 'finance':
        return t.navFinance;
      case 'reports':
        return t.navReports;
      case 'settings':
        return t.navSettings;
      default:
        return 'TM BAYONOV MMA';
    }
  };

  return (
    <div className="min-h-screen bg-[#051710] text-zinc-100 flex flex-col font-sans selection:bg-emerald-400 selection:text-emerald-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(s) => handleNavigate(s)}
        debtorCount={overview?.stats?.debtorsCount || 0}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Content */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-[#051710]">
        <Header
          title={getSectionTitle(currentSection)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onGlobalSearch={(q) => {
            if (q.trim() && currentSection !== 'students') {
              setCurrentSection('students');
            }
          }}
          onOpenNotifications={() => handleNavigate('notifications')}
          unreadNotificationsCount={overview?.stats?.debtorsCount || 0}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full bg-[#062217] rounded-3xl my-3 shadow-2xl border border-emerald-900/50 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle top ambient emerald glow */}
          <div className="absolute top-0 right-1/4 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          {currentSection === 'dashboard' && (
            <DashboardView
              overview={overview}
              onNavigate={handleNavigate}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setIsAddStudentOpen(true);
              }}
              onOpenQuickPayment={() => setIsQuickPaymentOpen(true)}
              onViewReceipt={handleViewReceipt}
              onRefresh={refreshData}
            />
          )}

          {currentSection === 'students' && (
            <StudentsView
              initialStatusFilter={extraFilter}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setIsAddStudentOpen(true);
              }}
              onOpenProfile={(st) => setProfileStudent(st)}
              onOpenRenew={(st) => setRenewStudent(st)}
              onOpenQr={(st) => setQrStudent(st)}
              onOpenEdit={(st) => {
                setStudentToEdit(st);
                setIsAddStudentOpen(true);
              }}
              onDeleteStudent={(st) => setDeleteTarget(st)}
            />
          )}

          {currentSection === 'shifts' && (
            <ShiftsView
              onOpenAttendance={(shiftId) => handleNavigate('attendance', shiftId)}
              onFilterStudentsByShift={(shiftId) => handleNavigate('students', shiftId)}
            />
          )}

          {currentSection === 'attendance' && (
            <AttendanceView
              initialShiftId={extraFilter}
              onOpenRenew={(st) => setRenewStudent(st)}
            />
          )}

          {currentSection === 'payments' && (
            <PaymentsView
              onViewReceipt={handleViewReceipt}
              onOpenQuickPayment={() => setIsQuickPaymentOpen(true)}
            />
          )}

          {currentSection === 'debtors' && (
            <DebtorsView onPaySuccess={handlePayDebtSuccess} />
          )}

          {currentSection === 'notifications' && <NotificationsView />}

          {(currentSection === 'finance' || currentSection === 'reports') && (
            <ReportsView />
          )}

          {currentSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* MODALS */}

      {/* 1. Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentToEdit(null);
        }}
        shifts={shifts}
        studentToEdit={studentToEdit}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* 2. Renewal Modal */}
      <RenewalModal
        isOpen={!!renewStudent}
        onClose={() => setRenewStudent(null)}
        student={renewStudent}
        onRenewSuccess={handleRenewSuccess}
      />

      {/* 3. Student Profile Modal */}
      <StudentProfileModal
        isOpen={!!profileStudent}
        onClose={() => setProfileStudent(null)}
        student={profileStudent}
        onOpenRenew={(st) => {
          setProfileStudent(null);
          setRenewStudent(st);
        }}
        onOpenQr={(st) => {
          setProfileStudent(null);
          setQrStudent(st);
        }}
        onOpenEdit={(st) => {
          setProfileStudent(null);
          setStudentToEdit(st);
          setIsAddStudentOpen(true);
        }}
        onSendReminder={handleSendReminder}
        onViewReceipt={handleViewReceipt}
      />

      {/* 4. Student QR Code / Pass Modal */}
      <QrCodeModal
        isOpen={!!qrStudent}
        onClose={() => setQrStudent(null)}
        student={qrStudent}
      />

      {/* 5. Official Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        payment={receiptData?.payment || null}
        student={receiptData?.student || null}
        shift={receiptData?.shift || null}
        gym={receiptData?.gym || null}
      />

      {/* 6. Quick Payment Modal */}
      <QuickPaymentModal
        isOpen={isQuickPaymentOpen}
        onClose={() => setIsQuickPaymentOpen(false)}
        onSuccess={(paymentId) => {
          refreshData();
          handleViewReceipt(paymentId);
        }}
      />

      {/* 7. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDeleteTitle}
        message={t.confirmDeleteMsg.replace('{name}', deleteTarget?.fullName || '')}
        confirmText="Ҳа, нест карда шавад"
        cancelText={t.cancel}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
