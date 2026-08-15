import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Plus, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthServices } from '@/services/auth-service';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { cardStyle } from './components/form-styles';
import { getBoatTypes } from '@/services/system-service';
import type { IBoatType } from '@/services/system-service';
import OwnerInfoSection from './components/OwnerInfoSection';
import VesselSection, {
  type VesselFormState,
} from './components/VesselSection';
import type {
  CertificateFormItem,
  CertificateTypeItem,
  OwnerEntityType,
} from '@/services/certificateService';
import { certificateService } from '@/services/certificateService';

const buildEmptyCertificate = (
  defaultType = 'registration',
): CertificateFormItem => ({
  certificateType: defaultType,
  file: null,
  expiryDate: '',
});

const buildEmptyVessel = (
  defaultType: string,
  defaultCertType = 'registration',
): VesselFormState => ({
  Name: '',
  Type: defaultType,
  Length: '',
  Beam: '',
  RegistrationNumber: '',
  MooringType: 'Floating',
  ExpectedDockingDate: '',
  ImageFiles: [],
  Certificates: [buildEmptyCertificate(defaultCertType)],
});

export default function OwnerRegistrationPage() {
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [boatTypes, setBoatTypes] = useState<IBoatType[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<
    CertificateTypeItem[]
  >([]);
  const defaultCertType = certificateTypes[0]?.code || 'registration';

  const [ownerInfo, setOwnerInfo] = useState({
    FullName: user?.name || '',
    Email: user?.email || '',
    Phone: user?.phone || '',
    LicenseNumber: '',
    Address: user?.address || '',
    EntityType: 'individual' as OwnerEntityType,
  });

  const [vessels, setVessels] = useState<VesselFormState[]>([
    buildEmptyVessel('yacht'),
  ]);

  React.useEffect(() => {
    getBoatTypes()
      .then((res) => {
        let typesData = res.data as any;
        if (typesData && typesData.data) typesData = typesData.data;

        if (Array.isArray(typesData)) {
          setBoatTypes(typesData);
          if (typesData.length > 0) {
            const firstTypeCode = typesData[0].code;
            setVessels((prev) =>
              prev.map((v) => {
                const typeExists = typesData.some(
                  (t: IBoatType) => t.code === v.Type,
                );
                if (!typeExists) {
                  return { ...v, Type: firstTypeCode };
                }
                return v;
              }),
            );
          }
        }
      })
      .catch((err) => console.log(err));

    certificateService
      .getTypes('boat')
      .then((types) => {
        if (Array.isArray(types) && types.length > 0) {
          const boatTypesOnly = types.filter((t) => t.isActive !== false);
          const active = boatTypesOnly.length > 0 ? boatTypesOnly : types;
          setCertificateTypes(active);
          const firstCode = active[0].code;
          setVessels((prev) =>
            prev.map((v) => ({
              ...v,
              Certificates: v.Certificates.map((c) => {
                const exists = active.some((t) => t.code === c.certificateType);
                return exists ? c : { ...c, certificateType: firstCode };
              }),
            })),
          );
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleOwnerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setOwnerInfo({ ...ownerInfo, [name]: value });
  };

  const handleEntityTypeChange = (value: OwnerEntityType) => {
    setOwnerInfo((prev) => ({ ...prev, EntityType: value }));
  };

  const handleVesselChange = (index: number, field: string, value: any) => {
    const newVessels = [...vessels];
    newVessels[index] = { ...newVessels[index], [field]: value };
    setVessels(newVessels);
  };

  const handleFileChange = (
    index: number,
    field: 'ImageFiles',
    files: FileList | null,
  ) => {
    if (!files) return;
    const updated = [...vessels];
    const currentFiles = updated[index][field];
    const newFiles = Array.from(files).filter(
      (f) => !currentFiles.some((cf) => cf.name === f.name),
    );
    updated[index] = {
      ...updated[index],
      [field]: [...currentFiles, ...newFiles],
    };
    setVessels(updated);
  };

  const handleRemoveFile = (
    vesselIndex: number,
    field: 'ImageFiles',
    fileIndex: number,
  ) => {
    const updated = [...vessels];
    const newFiles = [...updated[vesselIndex][field]];
    newFiles.splice(fileIndex, 1);
    updated[vesselIndex] = { ...updated[vesselIndex], [field]: newFiles };
    setVessels(updated);
  };

  const handleCertificateChange = (
    vesselIndex: number,
    certIndex: number,
    field: keyof CertificateFormItem,
    value: string | File | null,
  ) => {
    const updated = [...vessels];
    const certs = [...updated[vesselIndex].Certificates];
    certs[certIndex] = { ...certs[certIndex], [field]: value };
    updated[vesselIndex] = { ...updated[vesselIndex], Certificates: certs };
    setVessels(updated);
  };

  const handleAddCertificate = (vesselIndex: number) => {
    const updated = [...vessels];
    updated[vesselIndex] = {
      ...updated[vesselIndex],
      Certificates: [
        ...updated[vesselIndex].Certificates,
        buildEmptyCertificate(defaultCertType),
      ],
    };
    setVessels(updated);
  };

  const handleRemoveCertificate = (vesselIndex: number, certIndex: number) => {
    const updated = [...vessels];
    const certs = updated[vesselIndex].Certificates.filter(
      (_, i) => i !== certIndex,
    );
    updated[vesselIndex] = { ...updated[vesselIndex], Certificates: certs };
    setVessels(updated);
  };

  const handleAddVessel = () => {
    const defaultType = boatTypes.length > 0 ? boatTypes[0].code : 'yacht';
    setVessels([...vessels, buildEmptyVessel(defaultType, defaultCertType)]);
  };

  const handleRemoveVessel = (index: number) => {
    setVessels(vessels.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('FullName', ownerInfo.FullName);
      formData.append('Email', ownerInfo.Email);
      formData.append('Phone', ownerInfo.Phone);
      formData.append('LicenseNumber', ownerInfo.LicenseNumber);
      formData.append('Address', ownerInfo.Address);
      formData.append('EntityType', ownerInfo.EntityType);

      vessels.forEach((vessel, index) => {
        formData.append(`Vessels[${index}].Name`, vessel.Name);
        formData.append(`Vessels[${index}].Type`, vessel.Type);
        formData.append(`Vessels[${index}].Length`, vessel.Length);
        formData.append(`Vessels[${index}].Beam`, vessel.Beam);
        formData.append(
          `Vessels[${index}].RegistrationNumber`,
          vessel.RegistrationNumber,
        );
        formData.append(`Vessels[${index}].MooringType`, vessel.MooringType);
        formData.append(
          `Vessels[${index}].ExpectedDockingDate`,
          vessel.ExpectedDockingDate,
        );

        vessel.ImageFiles.forEach((file) =>
          formData.append(`Vessels[${index}].ImageFiles`, file),
        );

        vessel.Certificates.forEach((cert, certIndex) => {
          if (!cert.file) return;
          formData.append(
            `Vessels[${index}].Certificates[${certIndex}].CertificateType`,
            cert.certificateType,
          );
          formData.append(
            `Vessels[${index}].Certificates[${certIndex}].File`,
            cert.file,
          );
          formData.append(
            `Vessels[${index}].Certificates[${certIndex}].ExpiryDate`,
            cert.expiryDate,
          );
        });
      });

      const res = await AuthServices.registerOwner(formData);
      if (res.status === 200) {
        toast.success(res.data.message || t('ownerRegistration.submitSuccess'));
        await reloadUser();
        navigate(routeName.home);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t('ownerRegistration.submitError'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {t('ownerRegistration.back')}
      </button>

      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-ddms-secondary/12 px-3 py-1 text-xs font-semibold text-ddms-secondary">
          <ShieldCheck size={14} />
          {t('ownerRegistration.badge')}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('ownerRegistration.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {t('ownerRegistration.subtitle')}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <OwnerInfoSection
          ownerInfo={ownerInfo}
          onChange={handleOwnerChange}
          onEntityTypeChange={handleEntityTypeChange}
        />

        {vessels.map((vessel, index) => (
          <VesselSection
            key={index}
            vessel={vessel}
            index={index}
            totalCount={vessels.length}
            boatTypes={boatTypes}
            certificateTypes={certificateTypes}
            onChange={(field, value) => handleVesselChange(index, field, value)}
            onAddFiles={(field, files) => handleFileChange(index, field, files)}
            onRemoveFile={(field, fileIndex) =>
              handleRemoveFile(index, field, fileIndex)
            }
            onCertificateChange={(certIndex, field, value) =>
              handleCertificateChange(index, certIndex, field, value)
            }
            onAddCertificate={() => handleAddCertificate(index)}
            onRemoveCertificate={(certIndex) =>
              handleRemoveCertificate(index, certIndex)
            }
            onRemoveVessel={() => handleRemoveVessel(index)}
          />
        ))}

        <button
          type="button"
          onClick={handleAddVessel}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-ddms-secondary/50 hover:text-ddms-secondary"
        >
          <Plus size={16} />
          {t('ownerRegistration.addVessel')}
        </button>

        <div
          className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ ...cardStyle, backdropFilter: 'blur(12px)' }}
        >
          <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-sm">
            {t('ownerRegistration.reviewNote')}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="action"
              className="flex-1 rounded-lg border-foreground/30 text-foreground hover:bg-foreground/5 sm:flex-none"
              onClick={() => navigate(-1)}
            >
              {t('ownerRegistration.cancel')}
            </Button>
            <Button
              type="submit"
              variant="cyan"
              size="action"
              disabled={loading}
              className="flex-1 gap-2 font-semibold sm:flex-none"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {t('ownerRegistration.submit')}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
