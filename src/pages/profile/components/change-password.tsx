import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
    if (!values.current) errs.current = t('profile.changePassword.errors.currentRequired');
    if (!values.new) errs.new = t('profile.changePassword.errors.newRequired');
    else if (values.new.length < 6) errs.new = t('profile.changePassword.errors.minLength');
    if (values.new !== values.confirm) errs.confirm = t('profile.changePassword.errors.mismatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    // TODO: API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setValues({ current: '', new: '', confirm: '' });
    setIsOpen(false);
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
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
            style={{ backgroundColor: '#112240', color: '#ffffff' }}
          >
            {t('profile.changePassword.change')}
          </button>
        )}
      </div>

      {/* Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {passwordFields.map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#ffffff' }}>
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
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-lg border py-3 pl-11 pr-12 text-sm font-medium outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: errors[key] ? '#ff6b6b' : 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#ecf0ff' }}
                >
                  {showPasswords[key] ? <EyeOff size={18} /> : <Eye size={18} />}
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
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setErrors({});
                setValues({ current: '', new: '', confirm: '' });
              }}
              className="flex-1 rounded-lg border py-3 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ecf0ff' }}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg py-3 text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: '#222222' }}
            >
              {isSaving ? t('profile.saving') : t('profile.changePassword.update')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
