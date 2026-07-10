import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { notificationService } from '@/services/notificationService';
import type { NotificationResponse } from '@/interfaces/notification';
import { chatSignalRService } from '@/services/chatSignalRService';

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setNotifications([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    notificationService
      .getNotifications(20)
      .then((data) => setNotifications(data))
      .catch((err) => console.error('Failed to load notifications:', err));

    chatSignalRService
      .startConnection(
        () => {},
        (newNotif: NotificationResponse) => {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        },
      )
      .catch((err) =>
        console.error('Failed to connect to SignalR notifications:', err),
      );
  }, [isAuthenticated]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notification.justNow', 'Vừa xong');
    if (diffMins < 60)
      return `${diffMins} ${t('notification.minutesAgo', 'phút trước')}`;
    if (diffHours < 24)
      return `${diffHours} ${t('notification.hoursAgo', 'giờ trước')}`;
    if (diffDays === 1) return t('notification.yesterday', 'Hôm qua');
    return date.toLocaleDateString();
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }
    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  return (
    <div className="relative flex items-center" ref={notificationRef}>
      <button
        onClick={() => setNotificationOpen((prev) => !prev)}
        className="group relative flex items-center justify-center rounded-full p-2.5 transition-all hover:bg-white/5 active:scale-[0.97] header-link border-none bg-transparent outline-none cursor-pointer text-inherit"
        title={t('nav.notifications', 'Notifications')}
        aria-expanded={notificationOpen}
        aria-haspopup="true"
      >
        <Bell
          size={22}
          className="transition-all duration-300 group-hover:scale-110"
        />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white transition-transform duration-300 group-hover:scale-105 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div
          className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'var(--ddms-bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between pb-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h3
              className="font-bold text-base"
              style={{ color: 'var(--foreground)' }}
            >
              {t('notification.title', 'Thông báo')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors border-none bg-transparent cursor-pointer"
              >
                <CheckCheck size={14} />
                {t('notification.markAllRead', 'Đọc tất cả')}
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <div
            className="max-h-90 overflow-y-auto mt-2 -mx-2 px-2 flex flex-col divide-y"
            style={{ borderColor: 'var(--border)' }}
          >
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                {t('notification.empty', 'Không có thông báo nào')}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`py-3 px-2 rounded-xl transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 flex items-start gap-3 relative ${
                    !notif.isRead ? 'bg-blue-600/5 dark:bg-blue-600/10' : ''
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Blue dot indicator for unread */}
                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-4.5 w-2 h-2 rounded-full bg-blue-600" />
                  )}

                  <div className="flex-1 pl-3.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4
                        className={`text-sm font-bold leading-tight ${
                          !notif.isRead ? 'opacity-100' : 'opacity-70'
                        }`}
                        style={{ color: 'var(--foreground)' }}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-normal line-clamp-3">
                      {notif.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="pt-3 mt-2 border-t text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <Link
              to="/profile?tab=notifications"
              onClick={() => setNotificationOpen(false)}
              className="text-xs font-bold transition-colors inline-block opacity-80 hover:opacity-100"
              style={{ color: 'var(--foreground)' }}
            >
              {t('notification.viewAll', 'Xem tất cả thông báo')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
