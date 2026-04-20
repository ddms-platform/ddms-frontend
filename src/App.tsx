import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layouts/auth-layout';
import { ErrorBoundary } from './components/shared/error-boundary';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { lazy } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';

const SignInPage = lazy(() => import('@/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('@/pages/auth/sign-up'));
const DashboardPage = lazy(() => import('@/pages/dashboard/index'));

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
            </Route>

            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Redirect root to sign-in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
