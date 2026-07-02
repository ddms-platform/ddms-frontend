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

  const validate = (currentValues = values) => {
    const errs: Record<string, string> = {};
    if (!currentValues.current)
      errs.current = t('profile.changePassword.errors.currentRequired');
    if (!currentValues.new)
      errs.new = t('profile.changePassword.errors.newRequired');
    else if (!isPasswordPolicyValid(currentValues.new))
      errs.new = t('validation.passwordPolicy');
    if (currentValues.new !== currentValues.confirm && currentValues.confirm)
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
        backgroundColor: 'var(--ddms-bg-card)',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, var(--ddms-secondary), var(--ring))',
            }}
          >
            <ShieldCheck size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h3
              className="text-lg font-semibold text-foreground"
              style={{ letterSpacing: '-0.18px' }}
            >
              {t('profile.changePassword.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('profile.changePassword.description')}
            </p>
          </div>
        </div>
        {!isOpen && (
          <Button
            variant="outline"
            size="action"
            className="text-foreground border-foreground/30 hover:bg-foreground/5 bg-ddms-bg-main"
            onClick={() => setIsOpen(true)}
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type={showPasswords[key] ? 'text' : 'password'}
                  value={values[key]}
                  onChange={(e) => {
                    const newValues = { ...values, [key]: e.target.value };
                    setValues(newValues);
                    validate(newValues);
                  }}
                  className="w-full rounded-lg border py-3 pl-11 pr-12 text-sm font-medium outline-none transition-all focus:ring-2 bg-ddms-bg-main text-foreground focus:ring-ddms-secondary"
                  style={{
                    borderColor: errors[key] ? '#ff6b6b' : 'var(--border)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-muted-foreground hover:text-foreground"
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
                  <p className="mt-1 text-xs text-rose-500">{errors[key]}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="action"
              className="flex-1 text-foreground border-foreground/30 hover:bg-foreground/5"
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
