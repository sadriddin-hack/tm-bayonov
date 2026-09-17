import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Bell,
  Coins,
  History,
  Download,
} from 'lucide-react';
import { GymSettings, AuditLog } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';

export const SettingsView: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'audit'>('general');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getSettings(), api.getAuditLogs()]).then(([s, logs]) => {
      setSettings(s);
      setAuditLogs(logs);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setFeedback('Танзимот бомуваффақият захира карда шуд!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-12 text-center text-zinc-400 text-xs font-bold">{t.loading}</div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          {t.settingsTitle}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Танзимоти асосии толор, нархномаи абонемент, каналҳои огоҳинома ва таърихи амалиётҳо
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Маълумоти умумии толор</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Танзимоти SMS ва Telegram</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Журнали амниятӣ (Audit Logs)</span>
        </button>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
              Брендинг ва Суроға
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Номи толор:
                </label>
                <input
                  type="text"
                  value={settings.gymName}
                  onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Зерсарлавҳа:
                </label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-red-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Телефони қабулгоҳ:
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Суроға:
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
              Қоидаҳои абонемент ва нархгузорӣ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Нархи стандартии моҳона (сомонӣ):
                </label>
                <input
                  type="number"
                  value={settings.defaultMonthlyPrice}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultMonthlyPrice: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-black text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Огоҳинома то анҷом (рӯз):
                </label>
                <input
                  type="number"
                  value={settings.expiringSoonThresholdDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      expiringSoonThresholdDays: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Мӯҳлати иловагӣ / имтиёзнок (рӯз):
                </label>
                <input
                  type="number"
                  value={settings.debtGracePeriodDays}
                  onChange={(e) =>
                    setSettings({ ...settings, debtGracePeriodDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t.loading : 'Захираи танзимот'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
              Провайдери SMS ва Telegram Bot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Номи фиристандаи SMS (Sender ID):
                </label>
                <input
                  type="text"
                  value={settings.smsSenderName}
                  onChange={(e) => setSettings({ ...settings, smsSenderName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                  Telegram Chat ID барои ҳисобот:
                </label>
                <input
                  type="text"
                  value={settings.telegramChatId}
                  onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automatedMorningReminders}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      automatedMorningReminders: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    Ирсоли худкори паёмҳои саҳарӣ соати 08:00
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Ба таври автоматӣ шогирдонеро, ки абонементашон дар 3 рӯз тамом мешавад ё қарздор шудаанд, огоҳ мекунад.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t.loading : 'Захираи танзимот'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Истифодабаранда</th>
                  <th className="p-4">Нақш</th>
                  <th className="p-4">Амал (Action)</th>
                  <th className="p-4">Тафсилот</th>
                  <th className="p-4">Вақт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-zinc-900 dark:text-white">{log.userName}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 uppercase font-mono">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-red-600">{log.action}</td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{log.details}</td>
                    <td className="p-4 font-mono text-zinc-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
