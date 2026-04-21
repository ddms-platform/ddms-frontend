import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layouts/auth-layout';
import MainLayout from '@/components/layouts/main-layout';
import { ErrorBoundary } from './components/shared/error-boundary';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));
const DashboardPage = lazy(() => import('@/pages/dashboard/index'));
const HomePage = lazy(() => import('@/pages/home/index'));
const ProfilePage = lazy(() => import('@/pages/profile/index'));
const TourDetailPage = lazy(() => import('@/pages/tours/tour-detail'));
const TourListPage = lazy(() => import('@/pages/tours/tour-list'));
const BookingPage = lazy(() => import('@/pages/tours/booking'));

function PageLoader() {
  return <LoadingSpinner fullScreen />;
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            {/* Auth Routes - own layout, no header/footer */}
            <Route element={<AuthLayout />}>
              <Route
                path="/sign-in"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SignInPage />
                  </Suspense>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SignUpPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Public pages - with GlobalHeader + GlobalFooter */}
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="/tours"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TourListPage />
                  </Suspense>
                }
              />
              <Route
                path="/tours/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TourDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/tours/:id/booking"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <BookingPage />
                  </Suspense>
                }
              />
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                }
              />
            </Route>

            {/* Protected pages - with GlobalHeader (no auth btn) + GlobalFooter */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route element={<MainLayout showAuth={false} />}>
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
