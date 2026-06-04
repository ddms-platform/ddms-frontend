import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { AuthServices } from '@/services/auth-service';
import { getApiErrorMessage, unwrapEnvelope } from '@/lib/auth-session';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { values, getFieldProps, validateAll } = useFormValidation(
    { password: '', confirmPassword: '' },
    {
      password: [
        rules.required(t('auth.resetPassword.password')),
        rules.minLength(8),
      ],
      confirmPassword: [
        rules.required(t('auth.resetPassword.confirmPassword')),
        rules.match('password', 'auth.signUp.passwordsDoNotMatch'),
      ],
    },
    t,
  );

  const passwordProps = getFieldProps('password');
  const confirmPasswordProps = getFieldProps('confirmPassword');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('auth.resetPassword.missingToken'));
      return;
    }
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await AuthServices.resetPassword({
        token,
        password: passwordProps.value,
        confirmPassword: confirmPasswordProps.value,
      });
      const result = unwrapEnvelope(res.data);

      if (!result) {
        toast.error(t('auth.resetPassword.error'));
        return;
      }

      navigate(routeName.resetPasswordSuccess, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.resetPassword.error')));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-6">
          <Link to={routeName.home}>
            <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
          </Link>
          <div className="space-y-2 text-center">
            <h1
              className="text-[28px] font-bold leading-[1.43]"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {t('auth.resetPassword.title')}
            </h1>
            <p className="text-sm" style={{ color: '#ecf0ff' }}>
              {t('auth.resetPassword.missingToken')}
            </p>
          </div>
        </div>
        <Button type="button" variant="cyan" className="h-12 w-full" asChild>
          <Link to={routeName.forgotPassword}>
            {t('auth.resetPassword.requestNewLink')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6">
        <Link to={routeName.home}>
          <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
        </Link>
        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {t('auth.resetPassword.description')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="password"
          label={t('auth.resetPassword.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.resetPassword.passwordPlaceholder')}
          autoComplete="new-password"
          autoFocus
          {...passwordProps}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1"
              style={{ color: '#ecf0ff' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <FormField
          id="confirmPassword"
          label={t('auth.resetPassword.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
          autoComplete="new-password"
          {...confirmPasswordProps}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1"
              style={{ color: '#ecf0ff' }}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {values.password && (
          <p className="text-xs" style={{ color: '#ecf0ff' }}>
            {t('auth.resetPassword.hint')}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          variant="cyan"
          className="mt-2 h-12 w-full text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('auth.resetPassword.submitting')}</span>
            </div>
          ) : (
            t('auth.resetPassword.submit')
          )}
        </Button>
      </form>

      <Button
        type="button"
        variant="dark-outline"
        className="h-12 w-full"
        asChild
      >
        <Link to={routeName.signIn}>
          {t('auth.resetPassword.backToSignIn')}
        </Link>
      </Button>
    </div>
  );
}
