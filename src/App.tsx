import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layouts/auth-layout';
import MainLayout from '@/components/layouts/main-layout';
import OwnerLayout from '@/components/layouts/owner-layout';
import { ErrorBoundary } from './components/shared/error-boundary';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));
const MyToursPage = lazy(() => import('@/pages/my-tours/index'));
const HomePage = lazy(() => import('@/pages/home/index'));
const BecomeOwnerPage = lazy(() => import('@/pages/become-owner/index'));
const OwnerDashboard = lazy(() => import('@/pages/owner/index'));
const OwnerBoatList = lazy(() => import('@/pages/owner/boats/index'));
const OwnerBoatForm = lazy(() => import('@/pages/owner/boats/boat-form'));
const DockManagementPage = lazy(() => import('@/pages/owner/docks/index'));
const ProfilePage = lazy(() => import('@/pages/profile/index'));
const TourDetailPage = lazy(() => import('@/pages/tours/tour-detail'));
const TourListPage = lazy(() => import('@/pages/tours/tour-list'));
const BookingPage = lazy(() => import('@/pages/tours/booking'));
const BoatDetailPage = lazy(() => import('@/pages/boats/boat-detail'));

function PageLoader() {
  return <LoadingSpinner fullScreen />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
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
                  path="/boats/:boatId"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <BoatDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/become-owner"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <BecomeOwnerPage />
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
                <Route
                  path="/my-tours"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <MyToursPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* Owner pages - sidebar layout, role-gated */}
              <Route element={<ProtectedRoute roles={['owner']} />}>
                <Route element={<OwnerLayout />}>
                  <Route
                    path="/owner"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/owner/boats"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerBoatList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/owner/boats/new"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerBoatForm />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/owner/boats/:boatId/edit"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OwnerBoatForm />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/owner/docks"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <DockManagementPage />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
