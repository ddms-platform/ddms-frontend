import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { AuthServices } from '@/services/auth-service';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBoatTypes } from '@/services/system-service';
import type { IBoatType } from '@/services/system-service';
import OwnerInfoSection from './components/OwnerInfoSection';
import VesselSection, {
  type VesselFormState,
} from './components/VesselSection';

const buildEmptyVessel = (defaultType: string): VesselFormState => ({
  Name: '',
  Type: defaultType,
  Length: '',
  Beam: '',
  RegistrationNumber: '',
  MooringType: 'Floating',
  ExpectedDockingDate: '',
  ImageFiles: [],
  DocumentFiles: [],
});

export default function OwnerRegistrationPage() {
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [boatTypes, setBoatTypes] = useState<IBoatType[]>([]);

  React.useEffect(() => {
    getBoatTypes()
      .then((res) => {
        if (res.data) setBoatTypes(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const [ownerInfo, setOwnerInfo] = useState({
    FullName: user?.name || '',
    Email: user?.email || '',
    Phone: user?.phone || '',
    LicenseNumber: '',
    Address: user?.address || '',
  });

  const [vessels, setVessels] = useState<VesselFormState[]>([
    buildEmptyVessel('yacht'),
  ]);

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerInfo({ ...ownerInfo, [e.target.name]: e.target.value });
  };

  const handleVesselChange = (index: number, field: string, value: any) => {
    const newVessels = [...vessels];
    newVessels[index] = { ...newVessels[index], [field]: value };
    setVessels(newVessels);
  };

  const handleFileChange = (
    index: number,
    field: 'ImageFiles' | 'DocumentFiles',
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
    field: 'ImageFiles' | 'DocumentFiles',
    fileIndex: number,
  ) => {
    const updated = [...vessels];
    const newFiles = [...updated[vesselIndex][field]];
    newFiles.splice(fileIndex, 1);
    updated[vesselIndex] = { ...updated[vesselIndex], [field]: newFiles };
    setVessels(updated);
  };

  const handleAddVessel = () => {
    const defaultType = boatTypes.length > 0 ? boatTypes[0].code : 'yacht';
    setVessels([...vessels, buildEmptyVessel(defaultType)]);
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
        vessel.DocumentFiles.forEach((file) =>
          formData.append(`Vessels[${index}].DocumentFiles`, file),
        );
      });

      const res = await AuthServices.registerOwner(formData);
      if (res.status === 200) {
        toast.success(res.data.message || 'Đăng ký thành công!');
        await reloadUser();
        navigate(routeName.home);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050D1A] text-white font-sans flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-212.5">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">
            Đăng ký Chủ thuyền Mới
          </h1>
          <p className="text-[15px] text-gray-300">
            Hoàn tất biểu mẫu dưới đây để gia nhập hệ sinh thái quản lý cảng
            biển cao cấp Marina Command. Thông tin của bạn sẽ được bảo mật và xử
            lý bởi bộ phận vận hành cảng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <OwnerInfoSection
            ownerInfo={ownerInfo}
            onChange={handleOwnerChange}
          />

          {vessels.map((vessel, index) => (
            <VesselSection
              key={index}
              vessel={vessel}
              index={index}
              totalCount={vessels.length}
              boatTypes={boatTypes}
              onChange={(field, value) =>
                handleVesselChange(index, field, value)
              }
              onAddFiles={(field, files) =>
                handleFileChange(index, field, files)
              }
              onRemoveFile={(field, fileIndex) =>
                handleRemoveFile(index, field, fileIndex)
              }
              onAddVessel={handleAddVessel}
              onRemoveVessel={() => handleRemoveVessel(index)}
            />
          ))}

          <div className="flex justify-end gap-4 mt-8 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 rounded border border-gray-600 text-[14px] font-bold text-gray-300 hover:bg-gray-800 transition-colors"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded bg-[#00F0FF] text-[#0A192F] text-[14px] font-bold uppercase tracking-wide hover:bg-[#00d4e0] transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  GỬI ĐĂNG KÝ <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
