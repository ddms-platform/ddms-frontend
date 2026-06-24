import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Ship,
  Anchor,
  FileImage,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AuthServices } from '@/services/auth-service';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { getBoatTypes } from '@/services/system-service';
import type { IBoatType } from '@/services/system-service';

export default function OwnerRegistrationPage() {
  // const { t } = useTranslation();
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

  const [vessels, setVessels] = useState([
    {
      Name: '',
      Type: boatTypes.length > 0 ? boatTypes[0].code : 'yacht',
      Length: '',
      Beam: '',
      RegistrationNumber: '',
      MooringType: 'Floating',
      ExpectedDockingDate: '',
      ImageFiles: [] as File[],
      DocumentFiles: [] as File[],
    },
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
    setVessels([
      ...vessels,
      {
        Name: '',
        Type: boatTypes.length > 0 ? boatTypes[0].code : 'yacht',
        Length: '',
        Beam: '',
        RegistrationNumber: '',
        MooringType: 'Floating',
        ExpectedDockingDate: '',
        ImageFiles: [],
        DocumentFiles: [],
      },
    ]);
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
        {/* Header Section */}
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
          {/* OWNER INFO SECTION */}
          <div className="bg-[#0D1C33] rounded-lg p-6 shadow-xl">
            <h2 className="text-[16px] font-bold text-[#00F0FF] mb-5 flex items-center gap-2 uppercase tracking-wide">
              <User size={18} /> THÔNG TIN CHỦ SỞ HỮU
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-300">
                  Họ và Tên
                </label>
                <input
                  required
                  type="text"
                  name="FullName"
                  value={ownerInfo.FullName}
                  onChange={handleOwnerChange}
                  className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-300">
                  Email liên lạc
                </label>
                <input
                  required
                  type="email"
                  name="Email"
                  value={ownerInfo.Email}
                  onChange={handleOwnerChange}
                  className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-300">
                  Số điện thoại
                </label>
                <input
                  required
                  type="text"
                  name="Phone"
                  value={ownerInfo.Phone}
                  onChange={handleOwnerChange}
                  className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                  placeholder="+84 900 000 000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-300">
                  Số CCCD / Hộ chiếu
                </label>
                <input
                  required
                  type="text"
                  name="LicenseNumber"
                  value={ownerInfo.LicenseNumber}
                  onChange={handleOwnerChange}
                  className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                  placeholder="012345678901"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[13px] font-bold text-gray-300">
                  Địa chỉ liên lạc
                </label>
                <input
                  required
                  type="text"
                  name="Address"
                  value={ownerInfo.Address}
                  onChange={handleOwnerChange}
                  className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố..."
                />
              </div>
            </div>
          </div>

          {vessels.map((vessel, index) => (
            <React.Fragment key={index}>
              {/* VESSEL INFO SECTION */}
              <div className="bg-[#0D1C33] rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[16px] font-bold text-[#00F0FF] flex items-center gap-2 uppercase tracking-wide">
                    <Ship size={18} /> THÔNG TIN DU THUYỀN{' '}
                    {index > 0 ? index + 1 : ''}
                  </h2>
                  <div className="flex items-center gap-2">
                    {index === vessels.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddVessel}
                        className="w-8 h-8 rounded bg-[#00F0FF] text-[#0D1C33] flex items-center justify-center hover:bg-[#00d4e0] transition-colors shadow-lg"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                    {vessels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVessel(index)}
                        className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vessel Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-300">
                      Tên thuyền (Vessel Name)
                    </label>
                    <input
                      required
                      type="text"
                      value={vessel.Name}
                      onChange={(e) =>
                        handleVesselChange(index, 'Name', e.target.value)
                      }
                      className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                      placeholder="SEA MAJESTY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-300">
                      Loại thuyền
                    </label>
                    <select
                      value={vessel.Type}
                      onChange={(e) =>
                        handleVesselChange(index, 'Type', e.target.value)
                      }
                      className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all appearance-none cursor-pointer"
                    >
                      {boatTypes.length > 0 ? (
                        boatTypes.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.name_vi}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="yacht">
                            Du thuyền cá nhân (Yacht)
                          </option>
                          <option value="catamaran">
                            Thuyền hai thân (Catamaran)
                          </option>
                          <option value="speedboat">
                            Ca nô tốc độ (Speedboat)
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-300">
                      Chiều dài (LOA - m)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={vessel.Length}
                      onChange={(e) =>
                        handleVesselChange(index, 'Length', e.target.value)
                      }
                      className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                      placeholder="24.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-300">
                      Chiều rộng (Beam - m)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={vessel.Beam}
                      onChange={(e) =>
                        handleVesselChange(index, 'Beam', e.target.value)
                      }
                      className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                      placeholder="6.2"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[13px] font-bold text-gray-300">
                      Số đăng ký hàng hải
                    </label>
                    <input
                      required
                      type="text"
                      value={vessel.RegistrationNumber}
                      onChange={(e) =>
                        handleVesselChange(
                          index,
                          'RegistrationNumber',
                          e.target.value,
                        )
                      }
                      className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500"
                      placeholder="REG-99283-VN"
                    />
                  </div>
                </div>

                {/* Mooring Type */}
                <div className="mb-8 pt-6 border-t border-gray-700/50">
                  <h3 className="text-[14px] font-bold text-[#00F0FF] mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Anchor size={16} /> NHU CẦU NEO ĐẬU
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-300">
                        Loại bến mong muốn
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleVesselChange(index, 'MooringType', 'Floating')
                          }
                          className={`flex-1 py-3 px-2 text-[14px] uppercase font-bold rounded transition-colors ${vessel.MooringType === 'Floating' ? 'border border-[#00F0FF] text-[#00F0FF] bg-[#060D17]/50' : 'bg-[#060D17] text-gray-400 hover:text-white'}`}
                        >
                          BẾN NỔI (FLOATING)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleVesselChange(index, 'MooringType', 'Fixed')
                          }
                          className={`flex-1 py-3 px-2 text-[14px] uppercase font-bold rounded transition-colors ${vessel.MooringType === 'Fixed' ? 'border border-[#00F0FF] text-[#00F0FF] bg-[#060D17]/50' : 'bg-[#060D17] text-gray-400 hover:text-white'}`}
                        >
                          BẾN CỐ ĐỊNH
                        </button>
                      </div>
                      <details className="mt-3 group">
                        <summary className="text-[12px] text-[#00F0FF] cursor-pointer list-none flex items-center gap-1.5 opacity-80 hover:opacity-100 w-fit">
                          <Info size={14} /> Tìm hiểu thêm về các loại bến
                        </summary>
                        <div className="mt-2 p-3.5 bg-[#060D17] rounded text-[12px] leading-relaxed text-gray-300 space-y-2.5 border border-gray-700/50">
                          <p>
                            <strong className="text-white">
                              Bến nổi (Floating):
                            </strong>{' '}
                            Hệ thống phao neo đậu linh hoạt, tự động nâng hạ
                            theo mực nước thủy triều. Giúp việc bước lên/xuống
                            du thuyền luôn dễ dàng, bằng phẳng và an toàn.
                          </p>
                          <p>
                            <strong className="text-white">
                              Bến cố định (Fixed):
                            </strong>{' '}
                            Cầu cảng xây kiên cố bê tông. Khoảng cách từ mặt bến
                            xuống thuyền sẽ thay đổi lên xuống theo thủy triều.
                            Thường dành cho siêu du thuyền hoặc tàu neo đậu dài
                            hạn ít di chuyển.
                          </p>
                        </div>
                      </details>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-300">
                        Ngày dự kiến cập bến
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="date"
                          value={vessel.ExpectedDockingDate}
                          onChange={(e) =>
                            handleVesselChange(
                              index,
                              'ExpectedDockingDate',
                              e.target.value,
                            )
                          }
                          style={{ colorScheme: 'dark' }}
                          className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents & Images */}
                <div className="pt-6 border-t border-gray-700/50">
                  <h3 className="text-[14px] font-bold text-[#00F0FF] mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <FileImage size={16} /> TÀI LIỆU & HÌNH ẢNH
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div
                      className="relative overflow-hidden rounded-lg bg-[#060D17] border border-dashed border-gray-700/70 hover:border-[#00F0FF]/50 transition-colors group"
                      style={{ minHeight: '180px' }}
                    >
                      {vessel.ImageFiles.length > 0 ? (
                        <div className="absolute inset-0 flex flex-col z-20 pointer-events-auto bg-[#060D17]">
                          <div className="p-3 bg-[#172A4A]/50 border-b border-gray-700/50 flex justify-between items-center">
                            <p className="text-[13px] text-gray-300 font-bold">
                              Đã chọn {vessel.ImageFiles.length} hình ảnh
                            </p>
                            <label className="text-[12px] text-[#00F0FF] cursor-pointer hover:underline flex items-center gap-1">
                              <Plus size={14} /> Thêm ảnh
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  handleFileChange(
                                    index,
                                    'ImageFiles',
                                    e.target.files,
                                  );
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                            {vessel.ImageFiles.map((file, i) => (
                              <div
                                key={i}
                                className="relative aspect-video rounded overflow-hidden group/img"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt="preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(index, 'ImageFiles', i)
                                  }
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            required
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) =>
                              handleFileChange(
                                index,
                                'ImageFiles',
                                e.target.files,
                              )
                            }
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <FileImage className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#00F0FF] transition-colors" />
                            <p className="text-[15px] text-white mb-1">
                              Tải lên ảnh du thuyền
                            </p>
                            <p className="text-[12px] text-gray-500">
                              Cho phép chọn nhiều ảnh (PNG, JPG)
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Document Upload */}
                    <div
                      className="relative overflow-hidden rounded-lg bg-[#060D17] border border-dashed border-gray-700/70 hover:border-[#00F0FF]/50 transition-colors group"
                      style={{ minHeight: '180px' }}
                    >
                      {vessel.DocumentFiles.length > 0 ? (
                        <div className="absolute inset-0 flex flex-col z-20 pointer-events-auto bg-[#060D17]">
                          <div className="p-3 bg-[#172A4A]/50 border-b border-gray-700/50 flex justify-between items-center">
                            <p className="text-[13px] text-gray-300 font-bold">
                              Đã chọn {vessel.DocumentFiles.length} tài liệu
                            </p>
                            <label className="text-[12px] text-[#00F0FF] cursor-pointer hover:underline flex items-center gap-1">
                              <Plus size={14} /> Thêm file
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  handleFileChange(
                                    index,
                                    'DocumentFiles',
                                    e.target.files,
                                  );
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {vessel.DocumentFiles.map((file, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-[12px] text-gray-300 bg-[#0A1322] p-2 rounded border border-gray-700/50 group/doc"
                              >
                                <FileText
                                  size={14}
                                  className="text-[#00F0FF] shrink-0"
                                />
                                <span className="truncate flex-1">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(index, 'DocumentFiles', i)
                                  }
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            required
                            type="file"
                            accept=".pdf,image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) =>
                              handleFileChange(
                                index,
                                'DocumentFiles',
                                e.target.files,
                              )
                            }
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <FileText className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#00F0FF] transition-colors" />
                            <p className="text-[15px] text-white mb-1">
                              Giấy tờ đăng ký hàng hải
                            </p>
                            <p className="text-[12px] text-gray-500">
                              PDF, JPG (Cho phép nhiều file)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* ACTION BUTTONS */}
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
