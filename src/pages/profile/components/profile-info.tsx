import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin, Save, X, Pencil } from 'lucide-react';

interface ProfileField {
  key: string;
  icon: React.ElementType;
  type: string;
  value: string;
}

export default function ProfileInfo() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [fields, setFields] = useState<ProfileField[]>([
    { key: 'fullName', icon: User, type: 'text', value: 'Nguyễn Tuấn' },
    { key: 'email', icon: Mail, type: 'email', value: 'tuan.nguyen@example.com' },
    { key: 'phone', icon: Phone, type: 'tel', value: '0903 123 456' },
    { key: 'address', icon: MapPin, type: 'text', value: 'Đà Nẵng, Việt Nam' },
  ]);

  const [editValues, setEditValues] = useState<string[]>(fields.map((f) => f.value));

  const handleEdit = () => {
    setEditValues(fields.map((f) => f.value));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setFields((prev) => prev.map((f, i) => ({ ...f, value: editValues[i] })));
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: '#ffffff',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ color: '#222222', letterSpacing: '-0.18px' }}
        >
          {t('profile.personalInfo')}
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
            style={{ backgroundColor: '#f2f2f2', color: '#222222' }}
          >
            <Pencil size={14} />
            {t('profile.edit')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
              style={{ borderColor: '#c1c1c1', color: '#6a6a6a' }}
            >
              <X size={14} />
              {t('profile.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: '#222222' }}
            >
              <Save size={14} />
              {isSaving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {fields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#222222' }}>
                {t(`profile.fields.${field.key}`)}
              </label>
              <div className="relative">
                <div
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#6a6a6a' }}
                >
                  <Icon size={18} />
                </div>
                {isEditing ? (
                  <input
                    type={field.type}
                    value={editValues[index]}
                    onChange={(e) =>
                      setEditValues((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      })
                    }
                    className="w-full rounded-lg border py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: '#c1c1c1',
                      color: '#222222',
                    }}
                  />
                ) : (
                  <div
                    className="w-full rounded-lg py-3 pl-11 pr-4 text-sm font-medium"
                    style={{ backgroundColor: '#f7f7f7', color: '#222222' }}
                  >
                    {field.value}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
