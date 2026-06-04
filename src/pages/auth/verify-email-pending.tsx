import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import { AuthServices } from '@/services/auth-service';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/auth-session';
import { ApiErrorCode } from '@/constants/apiError';
import logo from '@/assets/logo.png';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPendingPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error(t('auth.verifyEmail.noEmail'));
      return;
    }

    setIsSending(true);
    try {
      const res = await AuthServices.resendVerificationEmail({ email });
      const link = res.data?.result?.verificationLink;
      if (link) {
        console.info('Dev verification link:', link);
      }
      toast.success(t('auth.verifyEmail.resendSuccess'));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      if (getApiErrorCode(error) === ApiErrorCode.RATE_LIMITED) {
        toast.error(t('auth.verifyEmail.resendRateLimited'));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error(
          getApiErrorMessage(error, t('auth.verifyEmail.resendError')),
        );
      }
    } finally {
      setIsSending(false);
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
            {t('auth.verifyEmail.pendingTitle')}
          </h1>
          <p className="text-sm" style={{ color: '#ecf0ff' }}>
            {t('auth.verifyEmail.pendingDescription', {
              email: email || 'your email',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="cyan"
          className="h-12 w-full"
          disabled={isSending || cooldown > 0}
          onClick={handleResend}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('auth.verifyEmail.resending')}</span>
            </div>
          ) : cooldown > 0 ? (
            t('auth.verifyEmail.resendIn', { seconds: cooldown })
          ) : (
            t('auth.verifyEmail.resend')
          )}
        </Button>

        <Button
          type="button"
          variant="dark-outline"
          className="h-12 w-full"
          asChild
        >
          <Link to={routeName.signIn}>
            {t('auth.verifyEmail.backToSignIn')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
