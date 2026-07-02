import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  LogOut,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Wallet,
  MessageSquare,
  Heart,
  Sun,
  Moon,
} from 'lucide-react';
import TranslationToggle from '@/components/shared/translation-toggle';
import useTheme from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { performLogout } from '@/lib/auth-session';
import logo from '@/assets/logo.png';
import { wishlistService } from '@/services/wishlistService';

interface NavLink {
  label: string;
  href: string;
}

interface GlobalHeaderProps {
  /** Navigation links (anchors or routes) */
  navLinks?: NavLink[];
  transparent?: boolean;
}

export default function GlobalHeader({
  navLinks,
  transparent = false,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchWishlistCount = useCallback(() => {
    if (user) {
      wishlistService
        .getWishlistedTourIds()
        .then((ids) => setWishlistCount(ids.length))
        .catch(console.error);
    } else {
      Promise.resolve().then(() => setWishlistCount(0));
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistCount();
    window.addEventListener('wishlist-updated', fetchWishlistCount);
    return () =>
      window.removeEventListener('wishlist-updated', fetchWishlistCount);
  }, [fetchWishlistCount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await performLogout(logout);
    navigate(routeName.signIn);
  };

  // Avatar initials from user name
  const initials = user?.name
    ? user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '?';
  const isOwner = user?.roles.includes('owner') ?? false;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: transparent
          ? 'transparent'
          : isScrolled
            ? 'var(--ddms-bg-header-glass)'
            : 'var(--ddms-bg-header)',
        backdropFilter: !transparent && isScrolled ? 'blur(20px)' : 'none',
        boxShadow: transparent
          ? 'none'
          : isScrolled
            ? '0 4px 20px -5px rgba(10, 37, 64, 0.08), 0 1px 0 var(--border)'
            : '0 10px 25px -5px rgba(10, 37, 64, 0.12), 0 8px 16px -8px rgba(10, 37, 64, 0.1), 0 1px 0 var(--border)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={routeName.home} className="flex items-center gap-2">
          <img src={logo} alt="DDMS" className="h-10 w-auto" />
        </Link>

        {/* Nav Links */}
        {navLinks && navLinks.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-ddms-secondary"
                style={{ color: 'var(--ddms-text-header)' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full p-2 transition-all hover:bg-white/5 active:scale-[0.97]"
            style={{ color: 'var(--ddms-text-header)' }}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <TranslationToggle />

          {!isOwner && !user?.hasOwnerProfile && (
            <Link
              to={routeName.becomeOwner}
              className="hidden items-center rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/5 hover:text-ddms-secondary sm:inline-flex"
              style={{ color: 'var(--ddms-text-header)' }}
            >
              {t('becomeOwner.navLink')}
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="relative flex items-center justify-center rounded-full p-2 transition-all hover:bg-white/5 active:scale-[0.97]"
              title={t('nav.wishlist', 'Wishlist')}
            >
              <Heart size={20} style={{ color: '#ff385c' }} />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff385c] text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            /* ── Logged-in: Avatar + Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-menu-button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-all hover:bg-white/5 active:scale-[0.97]"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--ddms-secondary), #00d4e0)',
                      color: 'var(--ddms-primary)',
                    }}
                  >
                    {initials}
                  </div>
                )}

                {/* Name + chevron (hidden on mobile) */}
                <span
                  className="hidden text-sm font-medium sm:inline"
                  style={{ color: 'var(--ddms-text-header)' }}
                >
                  {user?.name || 'User'}
                </span>
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200"
                  style={{
                    color: 'var(--ddms-text-header)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl py-1 shadow-xl"
                  style={{
                    backgroundColor: 'var(--ddms-bg-card)',
                    border: '1px solid var(--border)',
                    animation: 'fadeInDown 0.15s ease-out',
                  }}
                  role="menu"
                >
                  {/* User info */}
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {user?.name || 'User'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {user?.email || ''}
                    </p>
                  </div>

                  {/* Menu items */}
                  {isOwner && (
                    <Link
                      to={routeName.owner}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ color: 'var(--foreground)' }}
                      role="menuitem"
                    >
                      <LayoutDashboard size={16} />
                      {t('header.user.ownerDashboard')}
                    </Link>
                  )}
                  <Link
                    to={routeName.profile}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: 'var(--foreground)' }}
                    role="menuitem"
                  >
                    <User size={16} />
                    {t('header.user.profile')}
                  </Link>
                  <Link
                    to={routeName.myTours}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: 'var(--foreground)' }}
                    role="menuitem"
                  >
                    <MapPin size={16} />
                    {t('header.user.myTours')}
                  </Link>
                  <Link
                    to={routeName.wallet}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: 'var(--foreground)' }}
                    role="menuitem"
                  >
                    <Wallet size={16} />
                    {t('header.user.wallet', 'Ví của tôi')}
                  </Link>
                  <Link
                    to={routeName.inbox}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: 'var(--foreground)' }}
                    role="menuitem"
                  >
                    <MessageSquare size={16} />
                    {t('header.user.inbox', 'Tin nhắn')}
                  </Link>

                  <div
                    className="my-1 h-px"
                    style={{ backgroundColor: 'var(--border)' }}
                  />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: '#EF4444' }}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    {t('header.user.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged-in: Sign In button ── */
            <Button variant="cyan" size="action" asChild>
              <Link to={routeName.signIn}>{t('home.nav.signIn')}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown animation keyframes */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
