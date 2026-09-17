import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  Bell,
  Coins,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';

export type NavSection =
  | 'dashboard'
  | 'students'
  | 'shifts'
  | 'attendance'
  | 'payments'
  | 'debtors'
  | 'notifications'
  | 'finance'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  debtorCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  debtorCount = 0,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const { user, logout, canManageFinance, canEditSettings } = useAuth();

  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    allowed: boolean;
  }> = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      id: 'students',
      label: t.navStudents,
      icon: Users,
      allowed: true,
    },
    {
      id: 'shifts',
      label: t.navShifts,
      icon: Layers,
      allowed: true,
    },
    {
      id: 'attendance',
      label: t.navAttendance,
      icon: CalendarCheck,
      allowed: true,
    },
    {
      id: 'payments',
      label: t.navPayments,
      icon: CreditCard,
      allowed: true,
    },
    {
      id: 'debtors',
      label: t.navDebtors,
      icon: AlertCircle,
      badge: debtorCount,
      badgeColor: 'bg-rose-600 text-white',
      allowed: true,
    },
    {
      id: 'notifications',
      label: t.navNotifications,
      icon: Bell,
      allowed: true,
    },
    {
      id: 'finance',
      label: t.navFinance,
      icon: Coins,
      allowed: canManageFinance,
    },
    {
      id: 'reports',
      label: t.navReports,
      icon: BarChart3,
      allowed: true,
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      allowed: canEditSettings,
    },
  ];

  const handleItemClick = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#04160f] text-zinc-100 flex flex-col border-r border-emerald-900/50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-950/40 border border-emerald-300/30">
              🥊
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1">
                TM BAYONOV
              </h1>
              <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                MMA TRAINING CENTER
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              const isDebtor = item.id === 'debtors';

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                      : isDebtor
                      ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                      : 'text-emerald-200/70 hover:bg-[#07251a] hover:text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-slate-950' : isDebtor ? 'text-rose-400' : 'text-emerald-400/80'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-slate-950 text-emerald-300' : item.badgeColor || 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-red-500 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <span className="inline-block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {user?.role === 'SUPER_ADMIN'
                    ? 'Сармудир'
                    : user?.role === 'ADMIN'
                    ? 'Админ'
                    : user?.role === 'RECEPTION'
                    ? 'Ресепшн'
                    : 'Мураббӣ'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Баромад"
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
