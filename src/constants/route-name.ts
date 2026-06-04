export const routeName = Object.freeze({
  // Auth
  signIn: '/sign-in',
  signUp: '/sign-up',
  verifyEmail: '/verify-email',
  verifyEmailPending: '/verify-email/pending',
  verifyEmailSuccess: '/verify-email/success',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  resetPasswordSuccess: '/reset-password/success',

  // Public
  home: '/',
  tours: '/tours',
  tourDetail: '/tours/:id',
  tourBooking: '/tours/:id/booking',
  boatDetail: '/boats/:boatId',
  becomeOwner: '/become-owner',
  profile: '/profile',
  myTours: '/my-tours',

  // Legal
  terms: '/terms',
  privacy: '/privacy',

  // Owner
  owner: '/owner',
  ownerBoats: '/owner/boats',
  ownerBoatsNew: '/owner/boats/new',
  ownerBoatEdit: '/owner/boats/:boatId/edit',
  ownerTours: '/owner/tours',
  ownerBookings: '/owner/bookings',
  ownerProfile: '/owner/profile',

  // System
  maintenance: '/maintenance',
  dashboard: '/dashboard',
});
