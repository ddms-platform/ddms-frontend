import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Ship,
  DoorOpen,
  Layers,
  ImageIcon,
  Wrench,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MOCK_OWNER_BOATS,
  BOAT_TYPES,
  type BoatCabin,
  type BoatService,
} from '@/data/owner-boats';
import { routeName } from '@/constants/route-name';

type Tab = 'basic' | 'cabins' | 'services' | 'images' | 'maintenance';

export default function BoatForm() {
  const { t } = useTranslation();
  const { boatId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!boatId;
  const existing = isEdit
    ? MOCK_OWNER_BOATS.find((b) => b.id === boatId)
    : null;

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [name, setName] = useState(existing?.name || '');
  const [type, setType] = useState(existing?.type || 'standard');
  const [maxPassengers, setMaxPassengers] = useState(
    existing?.maxPassengers?.toString() || '',
  );
  const [cabins, setCabins] = useState<BoatCabin[]>(existing?.cabins || []);
  const [services, setServices] = useState<BoatService[]>(
    existing?.services || [],
  );
  const [saving, setSaving] = useState(false);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'basic', label: t('ownerBoats.form.tabs.basic'), icon: Ship },
    { id: 'cabins', label: t('ownerBoats.form.tabs.cabins'), icon: DoorOpen },
    { id: 'services', label: t('ownerBoats.form.tabs.services'), icon: Layers },
    { id: 'images', label: t('ownerBoats.form.tabs.images'), icon: ImageIcon },
    {
      id: 'maintenance',
      label: t('ownerBoats.form.tabs.maintenance'),
      icon: Wrench,
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    navigate(routeName.ownerBoats);
  };

  const addCabin = () =>
    setCabins((prev) => [
      ...prev,
      {
        id: `new-c-${Date.now()}`,
        name: '',
        capacity: 2,
        price: 0,
        totalRooms: 1,
      },
    ]);
  const updateCabin = (
    idx: number,
    field: keyof BoatCabin,
    value: string | number,
  ) =>
    setCabins((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  const removeCabin = (idx: number) =>
    setCabins((prev) => prev.filter((_, i) => i !== idx));

  const addService = () =>
    setServices((prev) => [
      ...prev,
      { id: `new-s-${Date.now()}`, name: '', price: 0, isActive: true },
    ]);
  const updateService = (
    idx: number,
    field: keyof BoatService,
    value: string | number | boolean,
  ) =>
    setServices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  const removeService = (idx: number) =>
    setServices((prev) => prev.filter((_, i) => i !== idx));

  const sectionStyle = {
    backgroundColor: '#112240',
    border: '1px solid rgba(255,255,255,0.04)',
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={routeName.ownerBoats}>
              <ArrowLeft size={18} style={{ color: '#ecf0ff' }} />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              {isEdit
                ? t('ownerBoats.form.editTitle', { name: existing?.name || '' })
                : t('ownerBoats.form.createTitle')}
            </h1>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {isEdit
                ? t('ownerBoats.form.editSubtitle')
                : t('ownerBoats.form.createSubtitle')}
            </p>
          </div>
        </div>
        <Button
          variant="cyan"
          size="action"
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? t('ownerBoats.form.saving') : t('ownerBoats.form.save')}
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="mt-6 flex gap-1 overflow-x-auto rounded-xl p-1"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor:
                activeTab === id ? 'rgba(0,240,255,0.1)' : 'transparent',
              color: activeTab === id ? '#00F0FF' : '#ecf0ff',
            }}
          >
            <Icon size={16} />
            {label}
            {id === 'cabins' && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {cabins.length}
              </span>
            )}
            {id === 'services' && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {services.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
            <h2
              className="text-base font-semibold"
              style={{ color: '#ffffff' }}
            >
              {t('ownerBoats.form.basic.title')}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#ecf0ff' }}
                >
                  {t('ownerBoats.form.basic.name')} *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('ownerBoats.form.basic.namePlaceholder')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#ecf0ff' }}
                >
                  {t('ownerBoats.form.basic.type')} *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                >
                  {BOAT_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {t(`ownerBoats.types.${bt.value}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#ecf0ff' }}
                >
                  {t('ownerBoats.form.basic.capacity')} *
                </label>
                <Input
                  type="number"
                  value={maxPassengers}
                  onChange={(e) => setMaxPassengers(e.target.value)}
                  placeholder={t('ownerBoats.form.basic.capacityPlaceholder')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cabins' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.cabins.count', {
                  count: String(cabins.length),
                })}
              </p>
              <Button
                variant="cyan"
                size="sm"
                className="gap-1.5"
                onClick={addCabin}
              >
                <Plus size={14} />
                {t('ownerBoats.form.cabins.add')}
              </Button>
            </div>
            {cabins.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={sectionStyle}
              >
                <DoorOpen
                  size={40}
                  className="mx-auto"
                  style={{ color: 'rgba(0,240,255,0.3)' }}
                />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.cabins.empty')}
                </p>
              </div>
            ) : (
              cabins.map((cabin, idx) => (
                <div
                  key={cabin.id}
                  className="rounded-2xl p-4"
                  style={sectionStyle}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} style={{ color: '#ecf0ff' }} />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: '#ffffff' }}
                      >
                        {t('ownerBoats.form.cabins.label', {
                          index: String(idx + 1),
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCabin(idx)}
                      className="rounded-lg p-1.5 hover:bg-white/5"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.cabins.name')}
                      </label>
                      <Input
                        value={cabin.name}
                        onChange={(e) =>
                          updateCabin(idx, 'name', e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.cabins.capacity')}
                      </label>
                      <Input
                        type="number"
                        value={cabin.capacity}
                        onChange={(e) =>
                          updateCabin(idx, 'capacity', +e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.cabins.price')}
                      </label>
                      <Input
                        type="number"
                        value={cabin.price}
                        onChange={(e) =>
                          updateCabin(idx, 'price', +e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.cabins.totalRooms')}
                      </label>
                      <Input
                        type="number"
                        value={cabin.totalRooms}
                        onChange={(e) =>
                          updateCabin(idx, 'totalRooms', +e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.services.count', {
                  count: String(services.length),
                })}
              </p>
              <Button
                variant="cyan"
                size="sm"
                className="gap-1.5"
                onClick={addService}
              >
                <Plus size={14} />
                {t('ownerBoats.form.services.add')}
              </Button>
            </div>
            {services.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={sectionStyle}
              >
                <Layers
                  size={40}
                  className="mx-auto"
                  style={{ color: 'rgba(0,240,255,0.3)' }}
                />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.services.empty')}
                </p>
              </div>
            ) : (
              services.map((svc, idx) => (
                <div
                  key={svc.id}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={sectionStyle}
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.services.name')}
                      </label>
                      <Input
                        value={svc.name}
                        onChange={(e) =>
                          updateService(idx, 'name', e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.services.price')}
                      </label>
                      <Input
                        type="number"
                        value={svc.price}
                        onChange={(e) =>
                          updateService(idx, 'price', +e.target.value)
                        }
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <label
                        className="flex items-center gap-2 text-xs"
                        style={{ color: '#ecf0ff' }}
                      >
                        <input
                          type="checkbox"
                          checked={svc.isActive}
                          onChange={(e) =>
                            updateService(idx, 'isActive', e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#00F0FF]"
                        />
                        {t('ownerBoats.form.services.active')}
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(idx)}
                    className="shrink-0 rounded-lg p-1.5 hover:bg-white/5"
                  >
                    <Trash2 size={14} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
            <h2
              className="text-base font-semibold"
              style={{ color: '#ffffff' }}
            >
              {t('ownerBoats.form.images.title')}
            </h2>
            {existing?.images && existing.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {existing.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-4/3 overflow-hidden rounded-xl"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || ''}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-full p-2 hover:bg-white/20">
                        <Trash2 size={16} style={{ color: '#ffffff' }} />
                      </button>
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                        <p className="text-[11px] text-white">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  className="flex aspect-4/3 flex-col items-center justify-center rounded-xl border-2 border-dashed hover:border-[#00F0FF]/40"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Plus size={24} style={{ color: '#ecf0ff' }} />
                  <span className="mt-1 text-xs" style={{ color: '#ecf0ff' }}>
                    {t('ownerBoats.form.images.add')}
                  </span>
                </button>
              </div>
            ) : (
              <div
                className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed py-12"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <ImageIcon size={40} style={{ color: 'rgba(0,240,255,0.3)' }} />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.images.dragDrop')}
                </p>
                <Button variant="dark-outline" size="sm" className="mt-3">
                  {t('ownerBoats.form.images.select')}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h2
                className="text-base font-semibold"
                style={{ color: '#ffffff' }}
              >
                {t('ownerBoats.form.maintenance.title')}
              </h2>
              <Button variant="cyan" size="sm" className="gap-1.5">
                <Plus size={14} />
                {t('ownerBoats.form.maintenance.add')}
              </Button>
            </div>
            {existing?.maintenances && existing.maintenances.length > 0 ? (
              <div className="mt-4 space-y-3">
                {existing.maintenances.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.12)',
                    }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {m.reason || t('ownerBoats.form.maintenance.default')}
                      </p>
                      <p className="text-xs" style={{ color: '#ecf0ff' }}>
                        {new Date(m.startTime).toLocaleDateString('vi-VN')} →{' '}
                        {new Date(m.endTime).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button className="rounded-lg p-1.5 hover:bg-white/5">
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.maintenance.empty')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
