import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowUpRight } from 'lucide-react';
import { CyanAnimatedButton } from '@/components/common/CyanAnimatedButton';
import DateInput from '@/components/ui/date-input';
import { dockService, type Dock } from '@/services/dockService';
import {
  tourService,
  type TourSearchItemResponse,
} from '@/services/tourService';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingPromo() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [docks, setDocks] = useState<Dock[]>([]);
  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPort, setSelectedPort] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [departureDate, setDepartureDate] = useState('');
  const [selectedGuests, setSelectedGuests] = useState('1');

  // Nạp dữ liệu Cảng & Tour thực tế từ Backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [docksRes, toursRes] = await Promise.allSettled([
          dockService.getAll({ pageSize: 50 }),
          tourService.searchTours({ status: 'active', pageSize: 20 }),
        ]);

        if (isMounted) {
          if (
            docksRes.status === 'fulfilled' &&
            docksRes.value &&
            Array.isArray(docksRes.value.data)
          ) {
            setDocks(docksRes.value.data);
          }
          if (
            toursRes.status === 'fulfilled' &&
            toursRes.value &&
            Array.isArray(toursRes.value.items)
          ) {
            setTours(toursRes.value.items);
          }
        }
      } catch (err) {
        console.error('Error fetching promo search data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Trích xuất danh sách Điểm đến / Tuyến đường duy nhất từ Tour thực tế
  const routeOptions = useMemo(() => {
    if (!tours || tours.length === 0) {
      return [
        { value: 'Sông Hàn', label: t('home.promo.routeHanRiver') },
        { value: 'Vịnh Đà Nẵng', label: t('home.promo.routeDanangBay') },
        { value: 'Hòn Chảo', label: t('home.promo.routeHonChao') },
        { value: 'Hoàng Hôn', label: t('home.promo.routeSunset') },
      ];
    }

    const uniqueLocations = new Set<string>();
    const options: { value: string; label: string }[] = [];

    // Ưu tiên gom nhóm theo địa điểm thực tế của các Tour
    tours.forEach((tour) => {
      if (tour.location && !uniqueLocations.has(tour.location.trim())) {
        uniqueLocations.add(tour.location.trim());
        options.push({
          value: tour.location.trim(),
          label: `${tour.location.trim()}`,
        });
      }
    });

    // Nếu có ít địa điểm, thêm trực tiếp tên từng tour vào danh sách lựa chọn
    if (options.length < 4) {
      tours.slice(0, 6).forEach((tour) => {
        if (!options.some((o) => o.value === tour.name)) {
          options.push({
            value: tour.name,
            label: tour.name,
          });
        }
      });
    }

    return options;
  }, [tours, t]);

  // Xử lý sự kiện tìm kiếm & chuyển hướng
  const handleSearchClick = () => {
    const params = new URLSearchParams();

    let searchKeyword = '';
    if (selectedRoute !== 'all') {
      searchKeyword = selectedRoute;
    } else if (selectedPort !== 'all') {
      const foundDock = docks.find((d) => d.id === selectedPort);
      searchKeyword = foundDock ? foundDock.name : selectedPort;
    }

    if (searchKeyword) {
      params.set('keyword', searchKeyword);
    }
    if (departureDate) {
      params.set('date', departureDate);
    }

    navigate(`/tours?${params.toString()}`);
  };

  // Lấy 2 tour thật nổi bật cho 2 card quảng bá bên phải
  const promoTour1 = tours.length > 0 ? tours[0] : null;
  const promoTour2 = tours.length > 1 ? tours[1] : null;

  return (
    <section
      id="booking-search"
      className="bg-transparent text-foreground py-16 px-6 select-none border-none"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cột Trái: Khối Tìm kiếm & Đặt chuyến nhanh (Real Data) ── */}
          <div className="border border-border rounded-2xl p-6 flex flex-col justify-between relative min-h-120 bg-ddms-bg-card backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              {/* Cảng khởi hành (Real Docks from DB) */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.departurePort')}
                </label>
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium"
                >
                  <option
                    value="all"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.allPorts')}
                  </option>
                  {docks.length > 0
                    ? docks.map((dock) => (
                        <option
                          key={dock.id}
                          value={dock.id}
                          className="bg-ddms-bg-card text-foreground"
                        >
                          {dock.name}
                          {dock.location ? ` - ${dock.location}` : ''}
                        </option>
                      ))
                    : [
                        { id: 'han_river', name: t('home.promo.portHanRiver') },
                        {
                          id: 'bach_dang',
                          name: t('home.promo.portBachDang'),
                        },
                        { id: 'tien_sa', name: t('home.promo.portTienSa') },
                      ].map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="bg-ddms-bg-card text-foreground"
                        >
                          {p.name}
                        </option>
                      ))}
                </select>
              </div>

              {/* Tuyến đường / Điểm đến (Real Routes from Tours) */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.route')}
                </label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium"
                >
                  <option
                    value="all"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.allRoutes')}
                  </option>
                  {routeOptions.map((route) => (
                    <option
                      key={route.value}
                      value={route.value}
                      className="bg-ddms-bg-card text-foreground truncate"
                    >
                      {route.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày khởi hành */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.departureDate')}
                </label>
                <DateInput
                  value={departureDate}
                  onChange={setDepartureDate}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent text-foreground text-sm outline-none border-none w-full font-medium placeholder:text-muted-foreground"
                />
              </div>

              {/* Số lượng hành khách */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-6 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.guests')}
                </label>
                <select
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(e.target.value)}
                  className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium"
                >
                  <option value="1" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guest')}
                  </option>
                  <option value="2" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guests2')}
                  </option>
                  <option value="3" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guests3')}
                  </option>
                  <option
                    value="family"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.family')}
                  </option>
                  <option
                    value="group"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.group')}
                  </option>
                </select>
              </div>
            </div>

            {/* Nút Tìm kiếm & Đặt chuyến ngay */}
            <div className="mt-4 flex flex-col gap-6">
              <CyanAnimatedButton onClick={handleSearchClick}>
                {t('home.promo.bookNow')}
              </CyanAnimatedButton>
            </div>
          </div>

          {/* ── Cột Phải: 2 Card Tour Thực Tế Nổi Bật (Real Tours) ── */}
          {loading ? (
            <>
              <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card p-4 space-y-4">
                <Skeleton className="h-52 w-full rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card p-4 space-y-4">
                <Skeleton className="h-52 w-full rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            </>
          ) : (
            <>
              {/* Card 1: Tour 1 */}
              <Link
                to={promoTour1 ? `/tours/${promoTour1.id}` : '/tours'}
                className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={
                      promoTour1?.imageUrl ||
                      'https://diff.vn/wp-content/uploads/2026/07/khan-dai-scaled.jpg'
                    }
                    alt={promoTour1?.name || 'DIFF Fireworks Night'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-70" />
                  {promoTour1 && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        <Star
                          size={12}
                          className="fill-amber-400 text-amber-400"
                        />
                        {promoTour1.avgRating > 0
                          ? promoTour1.avgRating.toFixed(1)
                          : '5.0'}
                      </span>
                      <span className="bg-cyan-500/90 text-white px-2.5 py-1 rounded-full font-bold">
                        {formatPrice(promoTour1.price)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-rose-500 font-bold block mb-1">
                      {promoTour1?.location ||
                        t('home.promo.fireworksCategory')}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2 leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors flex items-center justify-between gap-1">
                      <span>
                        {promoTour1?.name || t('home.promo.fireworksTitle')}
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-normal line-clamp-3">
                      {promoTour1?.description || t('home.promo.fireworksDesc')}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Card 2: Tour 2 */}
              <Link
                to={promoTour2 ? `/tours/${promoTour2.id}` : '/tours'}
                className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={
                      promoTour2?.imageUrl ||
                      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={promoTour2?.name || 'Catamaran Sunset'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-70" />
                  {promoTour2 && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        <Star
                          size={12}
                          className="fill-amber-400 text-amber-400"
                        />
                        {promoTour2.avgRating > 0
                          ? promoTour2.avgRating.toFixed(1)
                          : '4.9'}
                      </span>
                      <span className="bg-cyan-500/90 text-white px-2.5 py-1 rounded-full font-bold">
                        {formatPrice(promoTour2.price)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                      {promoTour2?.location || t('home.promo.sunsetCategory')}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2 leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors flex items-center justify-between gap-1">
                      <span>
                        {promoTour2?.name || t('home.promo.sunsetTitle')}
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-normal line-clamp-3">
                      {promoTour2?.description || t('home.promo.sunsetDesc')}
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
