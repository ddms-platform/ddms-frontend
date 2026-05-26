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
import { routeName } from '@/constants/route-name';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));
const MyToursPage = lazy(() => import('@/pages/my-tours/index'));
const HomePage = lazy(() => import('@/pages/home/index'));
const BecomeOwnerPage = lazy(() => import('@/pages/become-owner/index'));
const OwnerDashboard = lazy(() => import('@/pages/owner/index'));
const OwnerBoatList = lazy(() => import('@/pages/owner/boats/index'));
const OwnerBoatForm = lazy(() => import('@/pages/owner/boats/boat-form'));
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
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to={routeName.home} replace />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
