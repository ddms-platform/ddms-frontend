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
  Search,
  X,
} from 'lucide-react';
import TranslationToggle from '@/components/shared/translation-toggle';
import useTheme from '@/contexts/ThemeContext';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { performLogout } from '@/lib/auth-session';
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

  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchClosing, setIsSearchClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#searchOverlay') {
        setIsSearchOpen(true);
        window.history.pushState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCloseSearch = () => {
    setIsSearchClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsSearchClosing(false);
    }, 380); // matches the 380ms animation duration
  };

  const handleSearch = () => {
    setIsSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/tours?location=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tours');
    }
  };

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
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`z-50 transition-all duration-300 animate-header-entrance ${
          transparent ? 'absolute top-0 left-0 right-0' : 'relative'
        }`}
        style={{
          backgroundColor: transparent
            ? isHovered
              ? 'var(--ddms-bg-header)'
              : 'transparent'
            : 'var(--ddms-bg-header)',
          backdropFilter: 'none',
          boxShadow: 'none',
        }}
      >
        <div className="mx-auto flex max-w-400 items-center justify-between px-6 md:px-12 py-6">
          {/* Custom Brand Logo */}
          <Link
            to={routeName.home}
            className="flex items-center gap-2 hover:opacity-90 select-none transition-opacity duration-200 shadow-none border-none p-0 bg-transparent"
            style={{ color: 'var(--ddms-text-header)' }}
          >
            {/* Recreated Monogram Sail Vector Icon */}
            <svg
              className="w-10 h-10 select-none pointer-events-none"
              style={{ color: '#E31C24' }}
              viewBox="0 0 100 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 15v50c0 0 20 0 20-25S15 15 15 15z" />
              <path d="M25 25v30c0 0 20 0 20-15s-20-15-20-15z" />
              <path d="M45 40c10-20 25-20 25 0s15 20 15 0" />
            </svg>
            {/* Logo Text Wordmark */}
            <span className="text-2xl md:text-3xl font-semibold tracking-tight uppercase">
              ddms
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks &&
              navLinks.length > 0 &&
              navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-semibold transition-colors header-link"
                >
                  {link.label}
                </a>
              ))}

            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 text-base font-semibold transition-colors cursor-pointer bg-transparent border-none outline-none p-0 header-link"
            >
              <Search size={18} />
              <span>Search</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full p-2.5 transition-all hover:bg-white/5 active:scale-[0.97] header-link"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <TranslationToggle />

            {!isOwner && !user?.hasOwnerProfile && (
              <Link
                to={routeName.becomeOwner}
                className="hidden items-center rounded-full px-4 py-2 text-base font-semibold transition-colors hover:bg-white/5 sm:inline-flex header-link"
              >
                {t('becomeOwner.navLink')}
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="group relative flex items-center justify-center rounded-full p-2.5 transition-all hover:bg-white/5 active:scale-[0.97]"
                title={t('nav.wishlist', 'Wishlist')}
              >
                <Heart
                  size={22}
                  color="#ff385c"
                  className="fill-transparent transition-all duration-300 group-hover:fill-[#ff385c] group-hover:scale-110"
                />
                {wishlistCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff385c] text-[10px] font-bold text-white transition-transform duration-300 group-hover:scale-105">
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
                  className="flex items-center gap-3 rounded-full py-2 pl-2 pr-4 transition-all hover:bg-white/5 active:scale-[0.97]"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
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
                    className="hidden text-base font-semibold sm:inline"
                    style={{ color: 'var(--ddms-text-header)' }}
                  >
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200"
                    style={{
                      color: 'var(--ddms-text-header)',
                      transform: dropdownOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
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
              <Button
                variant="cyan"
                size="action"
                className="text-base py-3 px-5 rounded-xl font-semibold"
                asChild
              >
                <Link to={routeName.signIn}>{t('home.nav.signIn')}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Dropdown and Entrance animation keyframes */}
        <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .animate-header-entrance {
          animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes searchSlideDown {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        .animate-search-overlay {
          animation: searchSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes searchSlideUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-100%); }
        }
        .animate-search-exit {
          animation: searchSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-link {
          color: var(--ddms-text-header);
          transition: color 0.2s ease;
        }
        .header-link:hover {
          color: var(--ddms-secondary) !important;
        }
        .close-btn-rotate {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .close-btn-rotate:hover {
          transform: rotate(360deg) scale(1.08) !important;
        }
      `}</style>
      </header>

      {/* ── Search Fullscreen Overlay (rendered outside header to avoid transform containment) ── */}
      {isSearchOpen && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col bg-[#001c38] text-white px-6 md:px-16 py-8 select-none ${isSearchClosing ? 'animate-search-exit' : 'animate-search-overlay'}`}
        >
          {/* Top Row: Close Button */}
          <div className="flex justify-end w-full">
            <button
              onClick={handleCloseSearch}
              className="text-white/75 hover:text-white transition-colors duration-200 p-2 cursor-pointer bg-transparent border-none close-btn-rotate"
              aria-label="Close search"
            >
              <X size={40} />
            </button>
          </div>

          {/* Central Search Form Area */}
          <div className="flex-1 flex flex-col items-center pt-[15vh]">
            <div className="w-full max-w-4xl">
              {/* Input field with bottom line layout */}
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-4">
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-transparent text-3xl md:text-5xl font-light outline-none border-none text-white placeholder-white/35"
                  autoFocus
                />

                {/* Search Button inside input line */}
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 text-ddms-secondary hover:opacity-80 font-bold transition-all hover:translate-x-1 duration-200 cursor-pointer bg-transparent border-none p-0 shrink-0 select-none text-lg md:text-xl pl-4"
                >
                  <span>{t('header.search')}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
