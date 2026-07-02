import { Toaster } from '@/components/ui/sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layouts/auth-layout';
import MainLayout from '@/components/layouts/main-layout';
import OwnerLayout from '@/components/layouts/owner-layout';
import { ErrorBoundary } from './components/shared/error-boundary';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { routeName } from '@/constants/route-name';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'));
const VerifyEmailPendingPage = lazy(
  () => import('@/pages/auth/verify-email-pending'),
);
const VerifyEmailSuccessPage = lazy(
  () => import('@/pages/auth/verify-email-success'),
);
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));
const ResetPasswordSuccessPage = lazy(
  () => import('@/pages/auth/reset-password-success'),
);
const MyToursPage = lazy(() => import('@/pages/my-tours/index'));
const WalletPage = lazy(() => import('@/pages/wallet/index'));
const HomePage = lazy(() => import('@/pages/home/index'));
const BecomeOwnerPage = lazy(() => import('@/pages/become-owner/index'));
const OwnerRegistrationPage = lazy(
  () => import('@/pages/owner-registration/index'),
);
const OwnerDashboard = lazy(() => import('@/pages/owner/index'));
const OwnerBoatList = lazy(() => import('@/pages/owner/boats/index'));
const OwnerBoatForm = lazy(() => import('@/pages/owner/boats/boat-form'));
const DockMapPage = lazy(() => import('@/pages/owner/dock-map/index'));
const OwnerServicesPage = lazy(() => import('@/pages/owner/services/index'));
const OwnerToursPage = lazy(() => import('@/pages/owner/tours/index'));
const ProfilePage = lazy(() => import('@/pages/profile/index'));
const TourDetailPage = lazy(() => import('@/pages/tours/tour-detail'));
const TourListPage = lazy(() => import('@/pages/tours/tour-list'));
const BookingPage = lazy(() => import('@/pages/tours/booking'));
const WishlistPage = lazy(() => import('@/pages/customer/wishlist/index'));
const BoatDetailPage = lazy(() => import('@/pages/boats/boat-detail'));
const AdminMaintenancePage = lazy(
  () => import('@/pages/owner/boats/admin-maintenance'),
);
const OwnerRevenuePage = lazy(() => import('@/pages/owner/revenue/index'));
const InboxPage = lazy(() => import('@/pages/inbox/index'));

import { GoogleOAuthProvider } from '@react-oauth/google';

function PageLoader() {
  return <LoadingSpinner fullScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider
        clientId={
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          '747852977200-546j036ca6ftgpmvmtju936r0ujckrai.apps.googleusercontent.com'
        }
      >
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <Toaster position="top-right" richColors closeButton />
                <Routes>
                  {/* Auth Routes - own layout, no header/footer */}
                  <Route element={<AuthLayout />}>
                    <Route
                      path={routeName.signIn}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <SignInPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.signUp}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <SignUpPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.verifyEmail}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <VerifyEmailPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.verifyEmailPending}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <VerifyEmailPendingPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.verifyEmailSuccess}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <VerifyEmailSuccessPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.forgotPassword}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <ForgotPasswordPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.resetPassword}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <ResetPasswordPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.resetPasswordSuccess}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <ResetPasswordSuccessPage />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* Public pages - with GlobalHeader + GlobalFooter */}
                  <Route element={<MainLayout />}>
                    <Route
                      path={routeName.home}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <HomePage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.tours}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <TourListPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.tourDetail}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <TourDetailPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.tourBooking}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <BookingPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.boatDetail}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <BoatDetailPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path={routeName.becomeOwner}
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <BecomeOwnerPage />
                        </Suspense>
                      }
                    />
                    {/* Authenticated user pages */}
                    <Route element={<ProtectedRoute />}>
                      <Route
                        path={routeName.ownerRegistration}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerRegistrationPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.profile}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <ProfilePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.myTours}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <MyToursPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <WishlistPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.wallet}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <WalletPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.inbox}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <InboxPage />
                          </Suspense>
                        }
                      />
                    </Route>
                  </Route>

                  {/* Owner pages - sidebar layout, role-gated */}
                  <Route element={<ProtectedRoute roles={['owner']} />}>
                    <Route element={<OwnerLayout />}>
                      <Route
                        path={routeName.owner}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerDashboard />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.ownerBoats}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerBoatList />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.ownerBoatsNew}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerBoatForm />
                          </Suspense>
                        }
                      />
                      <Route
                        path={routeName.ownerBoatEdit}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerBoatForm />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/owner/admin-maintenance"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <AdminMaintenancePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/owner/dock-map"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <DockMapPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/owner/services"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerServicesPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/owner/tours"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerToursPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/owner/revenue"
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <OwnerRevenuePage />
                          </Suspense>
                        }
                      />
                    </Route>
                  </Route>

                  {/* Catch-all */}
                  <Route
                    path="*"
                    element={<Navigate to={routeName.home} replace />}
                  />
                </Routes>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}
