import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFormValidation, rules } from '@/hooks/use-form-validation';
import FormField from '@/components/shared/form-field';
import { AuthServices } from '@/services/auth-service';
import { getApiErrorMessage, unwrapEnvelope } from '@/lib/auth-session';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { getFieldProps, validateAll } = useFormValidation(
    { email: '' },
    {
      email: [rules.required(t('auth.forgotPassword.email')), rules.email()],
    },
    t,
  );

  const emailProps = getFieldProps('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await AuthServices.forgotPassword({
        email: emailProps.value,
      });
      const result = unwrapEnvelope(res.data);

      if (!result) {
        toast.error(t('auth.forgotPassword.error'));
        return;
      }

      if (result.verificationLink) {
        console.info('Dev password reset link:', result.verificationLink);
        toast.info('Dev: check console for reset link');
      }

      toast.success(result.message || t('auth.forgotPassword.success'));
      setSubmitted(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.forgotPassword.error')));
    } finally {
      setIsLoading(false);
    }
  };

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
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {submitted
              ? t('auth.forgotPassword.submittedDescription')
              : t('auth.forgotPassword.description')}
          </p>
        </div>
      </div>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <FormField
            id="email"
            label={t('auth.forgotPassword.email')}
            type="email"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            autoComplete="email"
            autoFocus
            {...emailProps}
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
                <span>{t('auth.forgotPassword.sending')}</span>
              </div>
            ) : (
              t('auth.forgotPassword.submit')
            )}
          </Button>
        </form>
      ) : null}

      <Button
        type="button"
        variant={submitted ? 'cyan' : 'dark-outline'}
        className="h-12 w-full"
        asChild
      >
        <Link to={routeName.signIn}>
          {t('auth.forgotPassword.backToSignIn')}
        </Link>
      </Button>
    </div>
  );
}
