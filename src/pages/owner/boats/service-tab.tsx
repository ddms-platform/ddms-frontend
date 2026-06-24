import {
  Ship,
  Utensils,
  Anchor,
  Plus,
  Trash2,
  Map as MapIcon,
  Bed,
  MessageCircleQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/services/api';

export interface ComboForm {
  name: string;
  price: string;
  description: string;
  imageUrl?: string;
}
export interface RoomForm {
  name: string;
  capacity: string;
  price: string;
  description: string;
  imageUrl?: string;
}
export interface RouteForm {
  name: string;
  startPoint: string;
  endPoint: string;
  description: string;
}
export interface FaqForm {
  question: string;
  answer: string;
}

export interface ServiceFormState {
  id: string;
  serviceType: string;
  name: string;
  basePrice: string;
  description: string;
  route: string;
  routes: RouteForm[];
  combos: ComboForm[];
  rooms: RoomForm[];
  faqs: FaqForm[];
  equipments: string;
  pricePerDay: string;
}

export const getEmptyService = (): ServiceFormState => ({
  id: Math.random().toString(36).substring(7),
  serviceType: 'cruise',
  name: '',
  basePrice: '',
  description: '',
  route: '',
  routes: [{ name: '', startPoint: '', endPoint: '', description: '' }],
  combos: [{ name: '', price: '', description: '', imageUrl: '' }],
  rooms: [{ name: '', capacity: '', price: '', description: '', imageUrl: '' }],
  faqs: [{ question: '', answer: '' }],
  equipments: '',
  pricePerDay: '',
});

interface ServiceTabProps {
  boatType: string;
  services: ServiceFormState[];
  onChange: (services: ServiceFormState[]) => void;
}

export default function ServiceTab({
  boatType,
  services,
  onChange,
}: ServiceTabProps) {
  const handleAddService = () => {
    onChange([...services, getEmptyService()]);
  };

  const handleRemoveService = (id: string) => {
    if (services.length === 1) return toast.error('Phải có ít nhất 1 dịch vụ!');
    onChange(services.filter((s) => s.id !== id));
  };

  const updateService = (
    id: string,
    field: keyof ServiceFormState,
    value: any,
  ) => {
    onChange(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleAddDynamicArrayItem = (
    serviceId: string,
    arrayName: 'combos' | 'rooms' | 'faqs' | 'routes',
  ) => {
    onChange(
      services.map((s) => {
        if (s.id === serviceId) {
          if (arrayName === 'combos')
            return {
              ...s,
              combos: [
                ...s.combos,
                { name: '', price: '', description: '', imageUrl: '' },
              ],
            };
          if (arrayName === 'rooms')
            return {
              ...s,
              rooms: [
                ...s.rooms,
                {
                  name: '',
                  capacity: '',
                  price: '',
                  description: '',
                  imageUrl: '',
                },
              ],
            };
          if (arrayName === 'faqs')
            return { ...s, faqs: [...s.faqs, { question: '', answer: '' }] };
          if (arrayName === 'routes')
            return {
              ...s,
              routes: [
                ...s.routes,
                { name: '', startPoint: '', endPoint: '', description: '' },
              ],
            };
        }
        return s;
      }),
    );
  };

  const handleUpdateDynamicArrayItem = (
    serviceId: string,
    arrayName: 'combos' | 'rooms' | 'faqs' | 'routes',
    index: number,
    field: string,
    value: string,
  ) => {
    onChange(
      services.map((s) => {
        if (s.id === serviceId) {
          const newArr = [...s[arrayName]] as any[];
          newArr[index] = { ...newArr[index], [field]: value };
          return { ...s, [arrayName]: newArr };
        }
        return s;
      }),
    );
  };

  const handleUploadImage = async (
    serviceId: string,
    arrayName: 'combos' | 'rooms',
    index: number,
    file: File,
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/owner/services/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.isSuccess) {
        handleUpdateDynamicArrayItem(
          serviceId,
          arrayName,
          index,
          'imageUrl',
          res.data.result,
        );
        toast.success('Tải ảnh lên thành công!');
      } else {
        toast.error('Lỗi khi tải ảnh lên.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải ảnh.');
    }
  };

  const renderDynamicFields = (srv: ServiceFormState) => {
    switch (srv.serviceType) {
      case 'cruise':
        return (
          <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <MapIcon className="w-5 h-5" /> Lộ trình Tour Ngắn
            </h3>
            <div className="space-y-4">
              {srv.routes.map((route, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      Chặng {idx + 1}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400">
                        Tên chặng / Hoạt động
                      </label>
                      <Input
                        placeholder="VD: Đón khách & Khởi hành"
                        className="bg-[#0B132B] border-slate-700 mt-1"
                        value={route.name}
                        onChange={(e) =>
                          handleUpdateDynamicArrayItem(
                            srv.id,
                            'routes',
                            idx,
                            'name',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-slate-400">
                          Từ (Điểm bắt đầu)
                        </label>
                        <Input
                          placeholder="Bến Bạch Đằng"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={route.startPoint}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'routes',
                              idx,
                              'startPoint',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-400">
                          Đến (Điểm kết thúc)
                        </label>
                        <Input
                          placeholder="Cầu Rồng"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={route.endPoint}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'routes',
                              idx,
                              'endPoint',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">
                      Mô tả chi tiết chặng này
                    </label>
                    <Textarea
                      placeholder="VD: Đón khách tại bến, bắt đầu hành trình ngắm cảnh sông Hàn về đêm..."
                      className="bg-[#0B132B] border-slate-700 mt-1 h-15"
                      value={route.description}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'routes',
                          idx,
                          'description',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddDynamicArrayItem(srv.id, 'routes')}
                className="w-full border-dashed border-slate-700 bg-transparent text-cyan-400 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm Chặng Mới
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-800/50">
              <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-4">
                <Bed className="w-5 h-5" /> Danh sách Phòng Nghỉ (Tùy chọn)
              </h3>
              <div className="space-y-4">
                {srv.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-slate-400">
                          Tên hạng phòng
                        </label>
                        <Input
                          placeholder="VD: Ocean View Suite"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.name}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-slate-400">
                          Số khách
                        </label>
                        <Input
                          type="number"
                          placeholder="2"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.capacity}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'capacity',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-slate-400">
                          Giá phụ thu (VNĐ)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.price}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'price',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_200px] gap-4">
                      <div>
                        <label className="text-xs text-slate-400">
                          Mô tả Phòng
                        </label>
                        <Input
                          placeholder="VD: Phòng riêng tư lãng mạn dành cho 2 người, trang trí hoa hồng..."
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.description}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">
                          Ảnh Phòng (1 tấm)
                        </label>
                        <div className="relative mt-1">
                          {room.imageUrl ? (
                            <div className="relative h-10 rounded-md overflow-hidden border border-slate-700 group">
                              <img
                                src={room.imageUrl}
                                alt="Room"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="text-[10px] text-white cursor-pointer bg-slate-800 px-2 py-1 rounded">
                                  Đổi ảnh
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0])
                                        handleUploadImage(
                                          srv.id,
                                          'rooms',
                                          idx,
                                          e.target.files[0],
                                        );
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center h-10 border border-dashed border-slate-700 rounded-md bg-[#0B132B] cursor-pointer hover:bg-slate-800/50 transition-colors">
                              <span className="text-xs text-slate-400 text-center px-2">
                                Tải ảnh lên
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0])
                                    handleUploadImage(
                                      srv.id,
                                      'rooms',
                                      idx,
                                      e.target.files[0],
                                    );
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddDynamicArrayItem(srv.id, 'rooms')}
                  className="w-full border-dashed border-slate-700 bg-transparent text-purple-400 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm Hạng Phòng (Tùy chọn)
                </Button>
              </div>
            </div>
          </div>
        );
      case 'dinner':
        return (
          <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
              <Utensils className="w-5 h-5" /> Dịch vụ Ăn tối (Menu Combos)
            </h3>
            <p className="text-xs text-slate-400">
              Vé lên tàu là mặc định. Thêm các combo ăn uống để khách chọn thêm.
            </p>
            {srv.combos.map((combo, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
              >
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400">Tên Combo</label>
                    <Input
                      placeholder="VD: Combo Hải sản nướng"
                      className="bg-[#0B132B] border-slate-700 mt-1"
                      value={combo.name}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'combos',
                          idx,
                          'name',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="w-40">
                    <label className="text-xs text-slate-400">Giá (VNĐ)</label>
                    <Input
                      type="number"
                      placeholder="450000"
                      className="bg-[#0B132B] border-slate-700 mt-1"
                      value={combo.price}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'combos',
                          idx,
                          'price',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div>
                    <label className="text-xs text-slate-400">
                      Mô tả Combo
                    </label>
                    <Input
                      placeholder="VD: Set menu hải sản 5 món đặc sản Đà Nẵng..."
                      className="bg-[#0B132B] border-slate-700 mt-1"
                      value={combo.description}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'combos',
                          idx,
                          'description',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">
                      Ảnh Combo (1 tấm)
                    </label>
                    <div className="relative mt-1">
                      {combo.imageUrl ? (
                        <div className="relative h-10 rounded-md overflow-hidden border border-slate-700 group">
                          <img
                            src={combo.imageUrl}
                            alt="Combo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="text-[10px] text-white cursor-pointer bg-slate-800 px-2 py-1 rounded">
                              Đổi ảnh
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0])
                                    handleUploadImage(
                                      srv.id,
                                      'combos',
                                      idx,
                                      e.target.files[0],
                                    );
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center h-10 border border-dashed border-slate-700 rounded-md bg-[#0B132B] cursor-pointer hover:bg-slate-800/50 transition-colors">
                          <span className="text-xs text-slate-400 text-center px-2">
                            Tải ảnh lên
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0])
                                handleUploadImage(
                                  srv.id,
                                  'combos',
                                  idx,
                                  e.target.files[0],
                                );
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddDynamicArrayItem(srv.id, 'combos')}
              className="w-full border-dashed border-slate-700 bg-transparent text-yellow-400 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Combo Mới
            </Button>
          </div>
        );
      case 'complex_tour':
        return (
          <div className="space-y-8 border-t border-slate-800 pt-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-4">
                <MapIcon className="w-5 h-5" /> Lộ trình Tour Dài Ngày
              </h3>
              <div className="space-y-4">
                {srv.routes.map((route, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-bold">
                        Ngày / Chặng {idx + 1}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">
                          Tên chặng / Hoạt động
                        </label>
                        <Input
                          placeholder="VD: Ngày 1: Đón khách & Nhận phòng"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={route.name}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'routes',
                              idx,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400">
                            Từ (Điểm bắt đầu)
                          </label>
                          <Input
                            placeholder="Bến Bạch Đằng"
                            className="bg-[#0B132B] border-slate-700 mt-1"
                            value={route.startPoint}
                            onChange={(e) =>
                              handleUpdateDynamicArrayItem(
                                srv.id,
                                'routes',
                                idx,
                                'startPoint',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-400">
                            Đến (Điểm kết thúc)
                          </label>
                          <Input
                            placeholder="Bán Đảo Sơn Trà"
                            className="bg-[#0B132B] border-slate-700 mt-1"
                            value={route.endPoint}
                            onChange={(e) =>
                              handleUpdateDynamicArrayItem(
                                srv.id,
                                'routes',
                                idx,
                                'endPoint',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">
                        Mô tả chi tiết
                      </label>
                      <Textarea
                        placeholder="VD: Khởi hành tại bến, di chuyển tham quan Vịnh Đà Nẵng, ăn trưa trên tàu..."
                        className="bg-[#0B132B] border-slate-700 mt-1 h-15"
                        value={route.description}
                        onChange={(e) =>
                          handleUpdateDynamicArrayItem(
                            srv.id,
                            'routes',
                            idx,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddDynamicArrayItem(srv.id, 'routes')}
                  className="w-full border-dashed border-slate-700 bg-transparent text-cyan-400 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm Chặng Mới
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-4">
                <Bed className="w-5 h-5" /> Danh sách Phòng Nghỉ (Cabins)
              </h3>
              <div className="space-y-4">
                {srv.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-slate-400">
                          Tên hạng phòng
                        </label>
                        <Input
                          placeholder="VD: Ocean View Suite"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.name}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-slate-400">
                          Số khách
                        </label>
                        <Input
                          type="number"
                          placeholder="2"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.capacity}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'capacity',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-slate-400">
                          Giá phụ thu (VNĐ)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.price}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'price',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-[1fr_200px] gap-4">
                      <div>
                        <label className="text-xs text-slate-400">
                          Mô tả Phòng
                        </label>
                        <Input
                          placeholder="VD: Phòng riêng tư lãng mạn dành cho 2 người, trang trí hoa hồng và nến..."
                          className="bg-[#0B132B] border-slate-700 mt-1"
                          value={room.description}
                          onChange={(e) =>
                            handleUpdateDynamicArrayItem(
                              srv.id,
                              'rooms',
                              idx,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">
                          Ảnh Phòng (1 tấm)
                        </label>
                        <div className="relative mt-1">
                          {room.imageUrl ? (
                            <div className="relative h-10 rounded-md overflow-hidden border border-slate-700 group">
                              <img
                                src={room.imageUrl}
                                alt="Room"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="text-[10px] text-white cursor-pointer bg-slate-800 px-2 py-1 rounded">
                                  Đổi ảnh
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0])
                                        handleUploadImage(
                                          srv.id,
                                          'rooms',
                                          idx,
                                          e.target.files[0],
                                        );
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center h-10 border border-dashed border-slate-700 rounded-md bg-[#0B132B] cursor-pointer hover:bg-slate-800/50 transition-colors">
                              <span className="text-xs text-slate-400 text-center px-2">
                                Tải ảnh lên
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0])
                                    handleUploadImage(
                                      srv.id,
                                      'rooms',
                                      idx,
                                      e.target.files[0],
                                    );
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddDynamicArrayItem(srv.id, 'rooms')}
                  className="w-full border-dashed border-slate-700 bg-transparent text-purple-400 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm Hạng Phòng Mới
                </Button>
              </div>
            </div>
          </div>
        );
      case 'fishing':
        return (
          <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <Anchor className="w-5 h-5" /> Trải nghiệm Câu Mực Đêm
            </h3>
            <div>
              <label className="text-sm font-medium text-slate-300">
                Dụng cụ cung cấp
              </label>
              <Textarea
                placeholder="VD: Cần câu mực, mồi giả, áo phao, bữa ăn nhẹ..."
                className="bg-[#0B132B] border-slate-700 mt-1"
                value={srv.equipments}
                onChange={(e) =>
                  updateService(srv.id, 'equipments', e.target.value)
                }
              />
            </div>
          </div>
        );
      case 'speedboat':
        return (
          <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
              <Ship className="w-5 h-5" /> Cho thuê Ca Nô Cao Tốc
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-300">
                  Giá thuê 1 Giờ (Mặc định)
                </label>
                <Input
                  type="number"
                  disabled
                  value={srv.basePrice}
                  className="bg-[#0B132B] border-slate-700 mt-1 opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-300">
                  Giá thuê Nguyên Ngày
                </label>
                <Input
                  type="number"
                  placeholder="5000000"
                  className="bg-[#0B132B] border-slate-700 mt-1"
                  value={srv.pricePerDay}
                  onChange={(e) =>
                    updateService(srv.id, 'pricePerDay', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {services.map((srv, index) => (
        <div
          key={srv.id}
          className="relative bg-[#0A1128] border border-slate-700 rounded-xl p-6 mb-6"
        >
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-800/50">
            <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-md text-sm border border-cyan-500/30">
                #{index + 1}
              </span>
              CẤU HÌNH DỊCH VỤ
            </h2>
            {services.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveService(srv.id)}
                className="bg-red-500/20 text-red-500 hover:bg-red-500/40 border-none"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa Dịch Vụ Này
              </Button>
            )}
          </div>

          <div className="mb-8 bg-slate-800/20 p-4 rounded-xl border border-slate-700/50">
            <label className="text-sm font-medium text-slate-300 block mb-3">
              Phân Loại Dịch Vụ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'cruise')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'cruise' ? 'bg-cyan-500 text-[#0B132B] shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
              >
                Tour Ngắn
              </button>
              <button
                type="button"
                onClick={() =>
                  updateService(srv.id, 'serviceType', 'complex_tour')
                }
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'complex_tour' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
              >
                Tour Dài Ngày
              </button>
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'dinner')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'dinner' ? 'bg-yellow-500 text-[#0B132B] shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
              >
                Ăn Tối
              </button>
              {boatType === 'fishing' && (
                <button
                  type="button"
                  onClick={() =>
                    updateService(srv.id, 'serviceType', 'fishing')
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'fishing' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                >
                  Câu Mực Đêm
                </button>
              )}
              {boatType === 'speedboat' && (
                <button
                  type="button"
                  onClick={() =>
                    updateService(srv.id, 'serviceType', 'speedboat')
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'speedboat' ? 'bg-emerald-500 text-[#0B132B] shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                >
                  Thuê Ca Nô
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Tên dịch vụ / Tour
                </label>
                <Input
                  required
                  placeholder="VD: Tour Ngắm Hoàng Hôn"
                  className="bg-[#0B132B] border-slate-700 mt-1 text-white"
                  value={srv.name}
                  onChange={(e) =>
                    updateService(srv.id, 'name', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Giá vé cơ bản / Vé lên tàu (VNĐ)
                </label>
                <Input
                  required
                  type="number"
                  placeholder="200000"
                  className="bg-[#0B132B] border-slate-700 mt-1 text-white"
                  value={srv.basePrice}
                  onChange={(e) =>
                    updateService(srv.id, 'basePrice', e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">
                Mô tả tóm tắt
              </label>
              <Textarea
                required
                placeholder="Mô tả dịch vụ của bạn..."
                className="bg-[#0B132B] border-slate-700 mt-1 h-27 resize-none text-white"
                value={srv.description}
                onChange={(e) =>
                  updateService(srv.id, 'description', e.target.value)
                }
              />
            </div>
          </div>

          {renderDynamicFields(srv)}

          <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-2">
              <MessageCircleQuestion className="w-5 h-5" /> Câu hỏi thường gặp
              (FAQs)
            </h3>
            <div className="space-y-3">
              {srv.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50"
                >
                  <div>
                    <label className="text-xs text-slate-400">
                      Câu hỏi (Q)
                    </label>
                    <Input
                      placeholder="VD: Tour có đón trả khách tại khách sạn không?"
                      className="bg-[#0B132B] border-slate-700 mt-1"
                      value={faq.question}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'faqs',
                          idx,
                          'question',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">
                      Trả lời (A)
                    </label>
                    <Textarea
                      placeholder="VD: Có, chúng tôi đón khách tại các khách sạn trung tâm..."
                      className="bg-[#0B132B] border-slate-700 mt-1 h-15"
                      value={faq.answer}
                      onChange={(e) =>
                        handleUpdateDynamicArrayItem(
                          srv.id,
                          'faqs',
                          idx,
                          'answer',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddDynamicArrayItem(srv.id, 'faqs')}
                className="w-full border-dashed border-slate-700 bg-transparent text-green-400 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm Câu Hỏi Khác
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddService}
        className="w-full border-dashed border-cyan-500/50 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 py-8"
      >
        <Plus className="w-5 h-5 mr-2" /> THÊM MỘT DỊCH VỤ KHÁC CHO TÀU NÀY
      </Button>
    </div>
  );
}
