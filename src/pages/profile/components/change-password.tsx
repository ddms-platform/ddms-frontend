import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { isPasswordPolicyValid } from '@/hooks/use-form-validation';
import { AuthServices } from '@/services/auth-service';

export default function ChangePassword() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [values, setValues] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleShow = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.current)
      errs.current = t('profile.changePassword.errors.currentRequired');
    if (!values.new) errs.new = t('profile.changePassword.errors.newRequired');
    else if (!isPasswordPolicyValid(values.new))
      errs.new = t('validation.passwordPolicy');
    if (values.new !== values.confirm)
      errs.confirm = t('profile.changePassword.errors.mismatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const res = await AuthServices.changePassword({
        currentPassword: values.current,
        newPassword: values.new,
        confirmPassword: values.confirm,
      });

      if (res.status === 200 && res.data?.code === 1000) {
        toast.success(t('profile.changePassword.success'));
        setValues({ current: '', new: '', confirm: '' });
        setErrors({});
        setIsOpen(false);
        return;
      }

      const fieldErrors = res.data?.fieldErrors;
      if (fieldErrors) {
        const mapped: Record<string, string> = {};
        if (fieldErrors.currentPassword?.[0])
          mapped.current = fieldErrors.currentPassword[0];
        if (fieldErrors.newPassword?.[0])
          mapped.new = fieldErrors.newPassword[0];
        if (fieldErrors.confirmPassword?.[0])
          mapped.confirm = fieldErrors.confirmPassword[0];
        if (Object.keys(mapped).length > 0) setErrors(mapped);
      }

      toast.error(res.data?.message || t('profile.changePassword.error'));
    } catch {
      toast.error(t('profile.changePassword.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const passwordFields = [
    { key: 'current' as const, label: t('profile.changePassword.current') },
    { key: 'new' as const, label: t('profile.changePassword.new') },
    { key: 'confirm' as const, label: t('profile.changePassword.confirm') },
  ];

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: '#0A192F',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #00F0FF, #00d4e0)' }}
          >
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: '#ffffff', letterSpacing: '-0.18px' }}
            >
              {t('profile.changePassword.title')}
            </h3>
            <p className="text-sm" style={{ color: '#ecf0ff' }}>
              {t('profile.changePassword.description')}
            </p>
          </div>
        </div>
        {!isOpen && (
          <Button
            variant="dark-outline"
            size="action"
            onClick={() => setIsOpen(true)}
            style={{ backgroundColor: '#112240' }}
          >
            {t('profile.changePassword.change')}
          </Button>
        )}
      </div>

      {/* Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {passwordFields.map(({ key, label }) => (
            <div key={key}>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: '#ffffff' }}
              >
                {label}
              </label>
              <div className="relative">
                <div
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#ecf0ff' }}
                >
                  <Lock size={18} />
                </div>
                <input
                  type={showPasswords[key] ? 'text' : 'password'}
                  value={values[key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full rounded-lg border py-3 pl-11 pr-12 text-sm font-medium outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: errors[key]
                      ? '#ff6b6b'
                      : 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#ecf0ff' }}
                >
                  {showPasswords[key] ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <div className="min-h-4.5">
                {errors[key] && (
                  <p className="mt-1 text-xs" style={{ color: '#ff6b6b' }}>
                    {errors[key]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button
              variant="dark-outline"
              size="action"
              className="flex-1"
              type="button"
              onClick={() => {
                setIsOpen(false);
                setErrors({});
                setValues({ current: '', new: '', confirm: '' });
              }}
            >
              {t('profile.cancel')}
            </Button>
            <Button
              variant="cyan"
              size="action"
              className="flex-1"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? t('profile.saving')
                : t('profile.changePassword.update')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
