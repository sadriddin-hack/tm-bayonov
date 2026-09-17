import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Copy,
  Save,
} from 'lucide-react';
import { NotificationLog, NotificationTemplate } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';

export const NotificationsView: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'telegram' | 'manual'>('logs');
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [telegramSummary, setTelegramSummary] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [manualPhone, setManualPhone] = useState('+992');
  const [manualText, setManualText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsData, tmplsData, tgData] = await Promise.all([
        api.getNotifications(),
        api.getTemplates(),
        api.getTelegramSummary(),
      ]);
      setLogs(logsData);
      setTemplates(tmplsData);
      setTelegramSummary(tgData.text);
      if (tmplsData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tmplsData[0]);
        setTemplateText(tmplsData[0].templateTj);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTemplate = (tmpl: NotificationTemplate) => {
    setSelectedTemplate(tmpl);
    setTemplateText(tmpl.templateTj);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await api.updateTemplate(selectedTemplate.id, { templateTj: templateText });
      setFeedback('Қолиби паём бомуваффақият захира шуд!');
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    try {
      await api.sendNotification({
        channel: 'SMS',
        type: 'CUSTOM',
        customMessage: manualText,
      });
      setFeedback('Паёми SMS бомуваффақият ирсол карда шуд!');
      setManualText('');
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendTelegramSummary = async () => {
    try {
      await api.sendNotification({
        channel: 'TELEGRAM',
        type: 'DAILY_SUMMARY',
        customMessage: telegramSummary,
      });
      setFeedback('Ҳисоботи шомгоҳӣ ба гурӯҳи Telegram-и роҳбарият фиристода шуд!');
      loadData();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          {t.notificationsTitle}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Маркази паёмҳои SMS, ёдраскуниҳои худкори абонемент ва ҳисоботи Telegram
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
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Таърихи паёмҳо ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Қолибҳои SMS ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'telegram'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ҳисоботи шомгоҳии Telegram</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'manual'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Ирсоли паёми нав</span>
        </button>
      </div>

      {/* TAB 1: LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Шогирд</th>
                  <th className="p-4">Канал</th>
                  <th className="p-4">Намуди паём</th>
                  <th className="p-4">Матни паём</th>
                  <th className="p-4">Ҳолат</th>
                  <th className="p-4">Вақт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-4">
                      <span className="font-extrabold text-zinc-900 dark:text-white block">
                        {log.studentName}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">{log.phone}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-zinc-100 dark:bg-zinc-800">
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {log.type === 'EXPIRING_3_DAYS'
                        ? '3 рӯз пеш'
                        : log.type === 'EXPIRING_TOMORROW'
                        ? 'Пагоҳ муҳлат'
                        : log.type === 'EXPIRING_TODAY'
                        ? 'Имрӯз муҳлат'
                        : log.type === 'DEBT_REMINDER'
                        ? 'Ёдраскунии қарз'
                        : log.type}
                    </td>
                    <td className="p-4 max-w-md text-zinc-600 dark:text-zinc-400 truncate">
                      {log.message}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Фиристода шуд
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400 text-[11px]">{log.sentAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES EDITOR */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              Қолибҳои мавҷуда:
            </h3>
            <div className="space-y-1.5">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`w-full p-3 rounded-xl text-left border transition-all ${
                    selectedTemplate?.id === tmpl.id
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <p className="font-extrabold text-xs">{tmpl.titleTj}</p>
                  <p
                    className={`text-[10px] uppercase font-mono mt-0.5 ${
                      selectedTemplate?.id === tmpl.id ? 'text-red-100' : 'text-zinc-400'
                    }`}
                  >
                    {tmpl.type}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
            {selectedTemplate && (
              <>
                <div>
                  <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {selectedTemplate.titleTj}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Тағйирёбандаҳо: <code className="text-red-600 font-mono">{"{name}"}</code>,{' '}
                    <code className="text-red-600 font-mono">{"{days}"}</code>,{' '}
                    <code className="text-red-600 font-mono">{"{amount}"}</code>,{' '}
                    <code className="text-red-600 font-mono">{"{phone}"}</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">
                    Матни паёми тоҷикӣ:
                  </label>
                  <textarea
                    rows={5}
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="w-full p-3 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveTemplate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Захираи қолиб</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TELEGRAM DAILY EVENING SUMMARY */}
      {activeTab === 'telegram' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                TG
              </div>
              <div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Ҳисоботи шомгоҳии Telegram барои роҳбарият
                </h4>
                <p className="text-xs text-zinc-500">
                  Ба гурӯҳи пӯшидаи Telegram-и TM BAYONOV фиристода мешавад
                </p>
              </div>
            </div>

            <button
              onClick={handleSendTelegramSummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ирсол ба Telegram</span>
            </button>
          </div>

          <div className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl whitespace-pre-wrap leading-relaxed border border-zinc-800 shadow-inner">
            {telegramSummary}
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL SENDER */}
      {activeTab === 'manual' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
          <div>
            <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Ирсоли паёми дастӣ (SMS)
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Фиристодани паём ба рақами телефонҳои Ҷумҳурии Тоҷикистон (+992...)
            </p>
          </div>

          <form onSubmit={handleSendManual} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                Рақами қабулкунанда:
              </label>
              <input
                type="text"
                required
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="+992900000000"
                className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase">
                Матни паём:
              </label>
              <textarea
                rows={4}
                required
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Матни SMS-ро ворид кунед..."
                className="w-full p-3 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Ирсоли SMS</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
