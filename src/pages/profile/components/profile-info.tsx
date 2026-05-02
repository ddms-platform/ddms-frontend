import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MapPin, Save, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        backgroundColor: '#0A192F',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ color: '#ffffff', letterSpacing: '-0.18px' }}
        >
          {t('profile.personalInfo')}
        </h3>
        {!isEditing ? (
          <Button
            variant="dark-outline"
            size="action"
            className="gap-2"
            onClick={handleEdit}
            style={{ backgroundColor: '#112240' }}
          >
            <Pencil size={14} />
            {t('profile.edit')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="dark-outline" size="action" className="gap-1.5" onClick={handleCancel}>
              <X size={14} />
              {t('profile.cancel')}
            </Button>
            <Button
              variant="cyan"
              size="action"
              className="gap-1.5"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={14} />
              {isSaving ? t('profile.saving') : t('profile.save')}
            </Button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {fields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#ffffff' }}>
                {t(`profile.fields.${field.key}`)}
              </label>
              <div className="relative">
                <div
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#ecf0ff' }}
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
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: '#ffffff',
                    }}
                  />
                ) : (
                  <div
                    className="w-full rounded-lg py-3 pl-11 pr-4 text-sm font-medium"
                    style={{ backgroundColor: '#112240', color: '#ffffff' }}
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
