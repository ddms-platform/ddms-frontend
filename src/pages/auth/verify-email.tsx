import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AuthServices } from '@/services/auth-service';
import { routeName } from '@/constants/route-name';
import { getApiErrorMessage, unwrapEnvelope } from '@/lib/auth-session';
import logo from '@/assets/logo.png';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : t('auth.verifyEmail.missingToken'),
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await AuthServices.verifyEmail({ token });
        const result = unwrapEnvelope(res.data);

        if (!result) {
          throw new Error(t('auth.verifyEmail.error'));
        }

        if (!cancelled) {
          navigate(routeName.verifyEmailSuccess, {
            replace: true,
            state: { alreadyVerified: result.alreadyVerified },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            getApiErrorMessage(error, t('auth.verifyEmail.error')),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate, t]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6">
        <img src={logo} alt="DDMS Logo" className="h-16 w-auto" />
        <div className="space-y-2 text-center">
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {t('auth.verifyEmail.title')}
          </h1>
          {status === 'loading' && (
            <div
              className="flex items-center justify-center gap-2 text-sm"
              style={{ color: '#ecf0ff' }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.verifyEmail.verifying')}
            </div>
          )}
          {status === 'error' && (
            <p className="text-sm" style={{ color: '#ecf0ff' }}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {status === 'error' && (
        <Button
          type="button"
          variant="cyan"
          className="h-12 w-full"
          onClick={() => navigate(routeName.signIn)}
        >
          {t('auth.verifyEmail.backToSignIn')}
        </Button>
      )}
    </div>
  );
}
