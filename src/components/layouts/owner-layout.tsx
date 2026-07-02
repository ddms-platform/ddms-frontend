import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, Menu, X, Sun, Moon } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import { performLogout } from '@/lib/auth-session';
// import logo from '@/assets/logo.png';
import TranslationToggle from '@/components/shared/translation-toggle';
import useTheme from '@/contexts/ThemeContext';
import {
  ownerSidelinks,
  ownerSecondaryLinks,
  ownerLogoutLink,
} from '@/data/owner-sidelinks';

export default function OwnerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const visibleLinks = ownerSidelinks;

  const handleLogout = async () => {
    await performLogout(logout);
    navigate(routeName.signIn);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ddms-bg-owner">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
        style={{
          backgroundColor: 'var(--ddms-bg-card)',
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <Link to={routeName.owner} className="flex items-center gap-2.5">
              <span className="text-lg font-black tracking-widest text-ddms-secondary">
                MARINA COMMAND
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to={routeName.owner} className="mx-auto">
              <span className="text-xl font-black text-ddms-secondary">MC</span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 transition-colors hover:bg-foreground/5 lg:hidden text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Nav — driven by ownerSidelinks */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'shadow-sm bg-border' : 'hover:bg-foreground/5'} ${collapsed ? 'justify-center' : ''}`
                  }
                  style={({ isActive }) => ({
                    color: isActive
                      ? 'var(--ddms-secondary)'
                      : 'var(--foreground)',
                    borderLeft: isActive
                      ? '3px solid var(--ddms-secondary)'
                      : '3px solid transparent',
                  })}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {!collapsed && (
                    <span>
                      {link.title.startsWith('ownerLayout.nav.')
                        ? t(link.title)
                        : link.title}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mx-2 my-4 h-px bg-border" />

          {/* Secondary Nav — driven by ownerSecondaryLinks */}
          <ul className="space-y-1">
            {ownerSecondaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5 text-foreground ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {!collapsed && <span>{t(link.title)}</span>}
                </Link>
              </li>
            ))}
            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5 text-rose-500 ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="shrink-0">{ownerLogoutLink.icon}</span>
                {!collapsed && <span>{t(ownerLogoutLink.title)}</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="hidden border-t border-border p-3 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 text-foreground ${collapsed ? 'justify-center' : ''}`}
          >
            <ChevronLeft
              size={18}
              className="shrink-0 transition-transform duration-200"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            {!collapsed && <span>{t('ownerLayout.collapse')}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-6"
          style={{
            backgroundColor: 'var(--ddms-bg-card)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-foreground/5 lg:hidden text-foreground"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full p-2 transition-all hover:bg-foreground/5 active:scale-[0.97] text-foreground"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <TranslationToggle />
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user?.name || 'Owner'}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('ownerLayout.role')}
              </p>
            </div>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                  color: 'var(--ddms-bg-main)',
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
