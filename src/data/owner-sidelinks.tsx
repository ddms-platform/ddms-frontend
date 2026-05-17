import { LayoutDashboard, Ship, Map, CalendarCheck, User, Home, LogOut } from 'lucide-react';

export interface NavLink {
  title: string;
  label?: string;
  href: string;
  icon: JSX.Element;
  end?: boolean;
}

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

/**
 * Primary navigation items displayed in the owner sidebar.
 * `title` values are i18n translation keys.
 */
export const ownerSidelinks: SideLink[] = [
  {
    title: 'ownerLayout.nav.dashboard',
    href: '/owner',
    icon: <LayoutDashboard size={20} />,
    end: true,
  },
  {
    title: 'ownerLayout.nav.boats',
    href: '/owner/boats',
    icon: <Ship size={20} />,
  },
  {
    title: 'ownerLayout.nav.tours',
    href: '/owner/tours',
    icon: <Map size={20} />,
  },
  {
    title: 'ownerLayout.nav.bookings',
    href: '/owner/bookings',
    icon: <CalendarCheck size={20} />,
  },
  {
    title: 'ownerLayout.nav.profile',
    href: '/owner/profile',
    icon: <User size={20} />,
  },
];

/**
 * Secondary / utility links at the bottom of the sidebar.
 */
export const ownerSecondaryLinks: NavLink[] = [
  {
    title: 'ownerLayout.backHome',
    href: '/',
    icon: <Home size={20} />,
  },
];

/**
 * Logout action (not a real link, but keeps the same shape for consistency).
 */
export const ownerLogoutLink: NavLink = {
  title: 'ownerLayout.logout',
  href: '#logout',
  icon: <LogOut size={20} />,
};
