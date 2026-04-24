import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import logo from '@/assets/logo.png';

export default function SignInPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { getFieldProps, validateAll } = useFormValidation(
    { email: '', password: '' },
    {
      email: [rules.required(t('auth.signIn.email')), rules.email()],
      password: [rules.required(t('auth.signIn.password')), rules.minLength(6)],
    },
    t
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    // TODO: Implement sign-in logic
    setTimeout(() => {
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 2000);
  };

  const emailProps = getFieldProps('email');
  const passwordProps = getFieldProps('password');

  return (
    <div className="flex flex-col gap-8">
      {/* Logo & Header */}
      <div className="flex flex-col items-center gap-6">
        <Link to="/" className="transition-transform hover:scale-105 active:scale-95">
          <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
        </Link>
        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {t('auth.signIn.title')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {t('auth.signIn.description')}
          </p>
        </div>
      </div>

      {/* Sign-in Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="email"
          label={t('auth.signIn.email')}
          type="email"
          placeholder={t('auth.signIn.emailPlaceholder')}
          autoComplete="email"
          autoFocus
          {...emailProps}
        />

        <FormField
          id="password"
          label={t('auth.signIn.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.signIn.passwordPlaceholder')}
          autoComplete="current-password"
          {...passwordProps}
          labelExtra={
            <Link
              to="/forgot-password"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: '#00F0FF' }}
            >
              {t('auth.signIn.forgotPassword')}
            </Link>
          }
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
              style={{ color: '#ecf0ff' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-12 w-full rounded-lg text-base font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#00F0FF', color: '#0A192F', border: 'none' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('auth.signIn.signingIn')}</span>
            </div>
          ) : (
            t('auth.signIn.signIn')
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
        <span className="px-4 text-xs font-medium" style={{ color: '#ecf0ff' }}>
          {t('auth.signIn.orContinueWith')}
        </span>
        <div className="flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      {/* Sign-up Link */}
      <p className="text-center text-sm" style={{ color: '#ecf0ff' }}>
        {t('auth.signIn.dontHaveAccount')}?{' '}
        <Link
          to="/sign-up"
          className="font-semibold transition-colors hover:underline"
          style={{ color: '#00F0FF' }}
        >
          {t('auth.signIn.signUpLink')}
        </Link>
      </p>
    </div>
  );
}
