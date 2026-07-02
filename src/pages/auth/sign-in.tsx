import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { useAuth } from '@/hooks/use-auth';
import { AuthServices } from '@/services/auth-service';
import { toast } from 'sonner';
import { routeName } from '@/constants/route-name';
import {
  getApiErrorCode,
  getApiErrorMessage,
  loginWithTokens,
  unwrapEnvelope,
} from '@/lib/auth-session';
import { ApiErrorCode } from '@/constants/apiError';
import logo from '@/assets/logo.png';

export default function SignInPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const state = location.state as {
      fromVerifySuccess?: boolean;
      fromPasswordResetSuccess?: boolean;
    } | null;

    if (state?.fromVerifySuccess) {
      toast.success(t('auth.signIn.pleaseLoginAfterVerify'));
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.fromPasswordResetSuccess) {
      toast.success(t('auth.signIn.pleaseLoginAfterReset'));
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Run once on mount; intentionally not depending on changing values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getFieldProps, validateAll } = useFormValidation(
    { email: '', password: '' },
    {
      email: [rules.required(t('auth.signIn.email')), rules.email()],
      password: [rules.required(t('auth.signIn.password')), rules.password()],
    },
    t,
  );

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      toast.error(t('auth.signIn.error'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthServices.googleLogin({ idToken: credential });
      const tokens = unwrapEnvelope(res.data);

      if (!tokens?.token) {
        toast.error(t('auth.signIn.error'));
        return;
      }

      await loginWithTokens(tokens, login);
      toast.success(t('auth.signIn.success'));
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.signIn.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await AuthServices.login({
        email: emailProps.value,
        password: passwordProps.value,
      });

      const tokens = unwrapEnvelope(res.data);
      if (!tokens?.token) {
        toast.error(t('auth.signIn.error'));
        return;
      }

      await loginWithTokens(tokens, login);
      toast.success(t('auth.signIn.success'));
      navigate(from, { replace: true });
    } catch (error) {
      if (getApiErrorCode(error) === ApiErrorCode.EMAIL_NOT_VERIFIED) {
        toast.error(getApiErrorMessage(error, t('auth.verifyEmail.error')));
        navigate(routeName.verifyEmailPending, {
          state: { email: emailProps.value },
        });
        return;
      }
      toast.error(getApiErrorMessage(error, t('auth.signIn.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const emailProps = getFieldProps('email');
  const passwordProps = getFieldProps('password');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6">
        <Link
          to={routeName.home}
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
        </Link>
        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43] text-foreground"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('auth.signIn.title')}
          </h1>
          <p className="text-sm leading-[1.43] text-muted-foreground">
            {t('auth.signIn.description')}
          </p>
        </div>
      </div>

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
              to={routeName.forgotPassword}
              className="text-sm font-medium transition-colors hover:underline text-ddms-secondary"
            >
              {t('auth.signIn.forgotPassword')}
            </Link>
          }
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <Button
          type="submit"
          disabled={isLoading}
          variant="cyan"
          className="mt-2 h-12 w-full text-base"
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

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-4 text-xs font-medium text-muted-foreground">
          {t('auth.signIn.orContinueWith')}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <div className="flex justify-center [&>div]:w-full">
        <GoogleLogin
          onSuccess={(credentialResponse) =>
            handleGoogleSuccess(credentialResponse.credential)
          }
          onError={() => toast.error(t('auth.signIn.error'))}
          theme="filled_black"
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.signIn.dontHaveAccount')}?{' '}
        <Link
          to={routeName.signUp}
          className="font-semibold transition-colors hover:underline text-ddms-secondary"
        >
          {t('auth.signIn.signUpLink')}
        </Link>
      </p>
    </div>
  );
}
