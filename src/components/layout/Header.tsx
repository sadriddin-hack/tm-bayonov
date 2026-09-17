import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  Bell,
  Search,
  Calendar,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  title: string;
  onOpenMobileSidebar: () => void;
  onGlobalSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenMobileSidebar,
  onGlobalSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, quickDemoLogin } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onGlobalSearch) onGlobalSearch(e.target.value);
  };

  // Format today's date in Tajikistan format
  const todayFormatted = '17 Сентябр 2026';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-[#04160f]/95 backdrop-blur-md border-b border-emerald-900/50 text-white transition-colors">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-emerald-400 hover:bg-[#07251a] lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.todayLabel}: {todayFormatted} • Asia/Dushanbe</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Fast Search */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-[#072418] border border-emerald-800/50 rounded-xl focus:outline-none focus:border-emerald-400 text-emerald-100 placeholder-emerald-400/40"
          />
        </div>

        {/* Fast Role Switcher Dropdown (for testing RBAC easily) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#072418] hover:bg-[#0c3524] border border-emerald-800/60 text-emerald-200 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">
              {user?.role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : user?.role === 'ADMIN'
                ? 'Admin'
                : user?.role === 'RECEPTION'
                ? 'Reception'
                : 'Coach'}
            </span>
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#072418] border border-emerald-800/60 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-emerald-100">
              <p className="px-3 py-1 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
                Ивази нақш (Смена роли):
              </p>
              {(['SUPER_ADMIN', 'ADMIN', 'RECEPTION', 'COACH'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    quickDemoLogin(r);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-semibold flex items-center justify-between hover:bg-[#0c3524] ${
                    user?.role === r ? 'text-emerald-300 font-bold bg-emerald-950/40' : 'text-emerald-200/80'
                  }`}
                >
                  <span>
                    {r === 'SUPER_ADMIN'
                      ? 'Устод (Super Admin)'
                      : r === 'ADMIN'
                      ? 'Маъмур (Admin)'
                      : r === 'RECEPTION'
                      ? 'Қабулгоҳ (Reception)'
                      : 'Мураббӣ (Coach)'}
                  </span>
                  {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          title={t.navNotifications}
          className="relative p-2.5 rounded-xl text-emerald-300 hover:bg-[#072418] border border-emerald-800/50 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          )}
        </button>

        {/* Language Switcher TJ / RU */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5">
          <button
            onClick={() => setLanguage('tj')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              language === 'tj'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            TJ
          </button>
          <button
            onClick={() => setLanguage('ru')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              language === 'ru'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            RU
          </button>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title="Рӯшноӣ / Торикӣ"
          className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>
      </div>
    </header>
  );
};
