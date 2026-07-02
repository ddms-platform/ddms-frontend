import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { AuthServices } from '@/services/auth-service';
import { toast } from 'sonner';
import { routeName } from '@/constants/route-name';
import { useAuth } from '@/hooks/use-auth';
import {
  getApiErrorMessage,
  loginWithTokens,
  unwrapEnvelope,
} from '@/lib/auth-session';
import logo from '@/assets/logo.png';

export default function SignUpPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      toast.error(t('auth.signUp.error'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthServices.googleLogin({ idToken: credential });
      const tokens = unwrapEnvelope(res.data);

      if (!tokens?.token) {
        toast.error(t('auth.signUp.error'));
        return;
      }

      await loginWithTokens(tokens, login);
      toast.success(t('auth.signUp.success'));
      navigate(routeName.home, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.signUp.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const { values, getFieldProps, validateAll } = useFormValidation(
    { fullName: '', email: '', password: '', confirmPassword: '' },
    {
      fullName: [rules.required(t('auth.signUp.fullName')), rules.minLength(2)],
      email: [rules.required(t('auth.signUp.email')), rules.email()],
      password: [rules.required(t('auth.signUp.password')), rules.password()],
      confirmPassword: [
        rules.required(t('auth.signUp.confirmPassword')),
        rules.match('password', 'auth.signUp.passwordsDoNotMatch'),
      ],
    },
    t,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!agreeTerms) {
      setTermsError(t('validation.termsRequired'));
      return;
    }
    if (!isValid) return;

    setIsLoading(true);
    try {
      const res = await AuthServices.register({
        fullName: fullNameProps.value,
        email: emailProps.value,
        password: passwordProps.value,
        confirmPassword: confirmPasswordProps.value,
      });

      const result = unwrapEnvelope(res.data);
      if (!result) {
        toast.error(t('auth.signUp.error'));
        return;
      }

      toast.success(result.message || t('auth.signUp.success'));

      if (result.verificationLink) {
        console.info('Dev verification link:', result.verificationLink);
        toast.info('Dev: check console for verification link');
      }

      navigate(routeName.verifyEmailPending, {
        state: { email: result.email },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.signUp.error')));
    } finally {
      setIsLoading(false);
    }
  };

  const fullNameProps = getFieldProps('fullName');
  const emailProps = getFieldProps('email');
  const passwordProps = getFieldProps('password');
  const confirmPasswordProps = getFieldProps('confirmPassword');

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
            {t('auth.signUp.title')}
          </h1>
          <p className="text-sm leading-[1.43] text-muted-foreground">
            {t('auth.signUp.description')}
          </p>
        </div>
      </div>

      <div className="flex justify-center [&>div]:w-full">
        <GoogleLogin
          onSuccess={(credentialResponse) =>
            handleGoogleSuccess(credentialResponse.credential)
          }
          onError={() => toast.error(t('auth.signUp.error'))}
          theme="filled_black"
          size="large"
          width="100%"
          text="signup_with"
          shape="rectangular"
        />
      </div>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-4 text-xs font-medium text-muted-foreground">
          {t('auth.signUp.orSignUpWithEmail')}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="fullName"
          label={t('auth.signUp.fullName')}
          placeholder={t('auth.signUp.fullNamePlaceholder')}
          autoComplete="name"
          autoFocus
          {...fullNameProps}
        />

        <FormField
          id="email"
          label={t('auth.signUp.email')}
          type="email"
          placeholder={t('auth.signUp.emailPlaceholder')}
          autoComplete="email"
          {...emailProps}
        />

        <div className="flex flex-col gap-2">
          <FormField
            id="password"
            label={t('auth.signUp.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.signUp.passwordPlaceholder')}
            autoComplete="new-password"
            {...passwordProps}
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

          {values.password && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((level) => {
                const strength = getPasswordStrength(values.password);
                return (
                  <div
                    key={level}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        level <= strength
                          ? strength <= 1
                            ? '#c13515'
                            : strength <= 2
                              ? '#FBBC05'
                              : '#34A853'
                          : '#e0e0e0',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <FormField
          id="confirmPassword"
          label={t('auth.signUp.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          {...confirmPasswordProps}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                setTermsError(
                  e.target.checked ? undefined : t('validation.termsRequired'),
                );
              }}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-ddms-secondary"
            />
            <label
              htmlFor="terms"
              className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
            >
              {t('auth.signUp.agreeToTerms')}{' '}
              <Link
                to={routeName.terms}
                className="font-medium underline underline-offset-4 transition-colors text-foreground"
              >
                {t('auth.signUp.termsOfService')}
              </Link>{' '}
              {t('auth.signUp.and')}{' '}
              <Link
                to={routeName.privacy}
                className="font-medium underline underline-offset-4 transition-colors text-foreground"
              >
                {t('auth.signUp.privacyPolicy')}
              </Link>
            </label>
          </div>
          {termsError && <p className="text-xs text-rose-500">{termsError}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          variant="cyan"
          className="mt-2 h-12 w-full text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('auth.signUp.creatingAccount')}</span>
            </div>
          ) : (
            t('auth.signUp.createAccount')
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.signUp.alreadyHaveAccount')}?{' '}
        <Link
          to={routeName.signIn}
          className="font-semibold transition-colors hover:underline text-ddms-secondary"
        >
          {t('auth.signUp.signInLink')}
        </Link>
      </p>
    </div>
  );
}

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}
