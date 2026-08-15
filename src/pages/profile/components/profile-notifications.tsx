import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Search, Clock, CheckCircle2 } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import type { NotificationResponse } from '@/interfaces/notification';
import { parseIsoDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfileNotifications() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(100);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
      toast.success(
        t('notification.allMarkedRead', 'Đã đánh dấu tất cả là đã đọc'),
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    const date = parseIsoDate(dateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return t('notification.justNow', 'Vừa xong');
    if (diffMins < 60)
      return `${diffMins} ${t('notification.minutesAgo', 'phút trước')}`;
    if (diffHours < 24)
      return `${diffHours} ${t('notification.hoursAgo', 'giờ trước')}`;

    return date.toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread' && notif.isRead) return false;
    if (filter === 'read' && !notif.isRead) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: 'var(--ddms-bg-card)',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t('notification.title', 'Thông báo')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} ${t('notification.unreadCount', 'thông báo chưa đọc')}`
                : t('notification.allRead', 'Tất cả thông báo đã được đọc')}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
          >
            <CheckCheck size={16} />
            {t('notification.markAllRead', 'Đọc tất cả')}
          </button>
        )}
      </div>

      {/* Controls & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 pb-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/40 border border-border/50 max-w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('notification.filterAll', 'Tất cả')} ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('notification.filterUnread', 'Chưa đọc')}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              filter === 'read'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('notification.filterRead', 'Đã đọc')}
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'notification.searchPlaceholder',
              'Tìm kiếm thông báo...',
            )}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="mt-2 divide-y divide-border">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Clock
              className="mx-auto mb-2 animate-spin text-blue-500"
              size={24}
            />
            {t('notification.loading', 'Đang tải thông báo...')}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-semibold text-foreground">
              {t('notification.empty', 'Chưa có thông báo nào')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? t(
                    'notification.noSearchResults',
                    'Không tìm thấy thông báo phù hợp với từ khóa.',
                  )
                : t(
                    'notification.noNotificationsDesc',
                    'Khi có cập nhật mới về tour hoặc đơn đặt chỗ, thông báo sẽ hiển thị tại đây.',
                  )}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`py-4 px-3 sm:px-4 rounded-xl transition-all flex items-start gap-4 cursor-pointer my-1.5 ${
                !notif.isRead
                  ? 'bg-blue-600/5 dark:bg-blue-600/10 border-l-4 border-blue-600 hover:bg-blue-600/10'
                  : 'hover:bg-muted/30 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5">
                {!notif.isRead ? (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                ) : (
                  <CheckCircle2
                    size={16}
                    className="text-muted-foreground/50"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4
                    className={`text-sm leading-tight ${
                      !notif.isRead
                        ? 'font-bold text-foreground'
                        : 'font-semibold text-foreground/80'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock size={12} />
                    {formatNotificationTime(notif.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {notif.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
