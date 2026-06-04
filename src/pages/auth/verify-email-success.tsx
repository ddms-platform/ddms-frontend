import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import logo from '@/assets/logo.png';

export default function VerifyEmailSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const alreadyVerified =
    (location.state as { alreadyVerified?: boolean } | null)?.alreadyVerified ??
    false;

  const handleGoToSignIn = () => {
    navigate(routeName.signIn, {
      replace: true,
      state: { fromVerifySuccess: true },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6">
        <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />

        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(52,168,83,0.15)' }}
        >
          <CheckCircle2 size={40} style={{ color: '#34A853' }} />
        </div>

        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {alreadyVerified
              ? t('auth.verifyEmail.alreadyVerifiedTitle')
              : t('auth.verifyEmail.successTitle')}
          </h1>
          <p className="text-sm leading-[1.43]" style={{ color: '#ecf0ff' }}>
            {alreadyVerified
              ? t('auth.verifyEmail.alreadyVerifiedDescription')
              : t('auth.verifyEmail.successDescription')}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="cyan"
        className="h-12 w-full text-base"
        onClick={handleGoToSignIn}
      >
        {t('auth.verifyEmail.goToSignIn')}
      </Button>
    </div>
  );
}
