import useLanguage from '@/contexts/LanguageContext';

export default function BookingPromo() {
  const { language } = useLanguage();

  const handleSearchClick = () => {
    // Simple mock search action
    window.location.href = '/tours';
  };

  return (
    <section className="bg-background text-white py-16 px-6 select-none border-none">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Search Form Card ── */}
          <div
            className="border rounded-2xl p-6 flex flex-col justify-between relative min-h-120 bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              {/* Departure Port */}
              <div
                className="flex flex-col gap-1 border rounded-xl px-4 py-2.5 mb-4 bg-transparent"
                style={{ borderColor: 'var(--border)' }}
              >
                <label className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                  {language === 'VN' ? 'Cảng đi' : 'Departure Port'}
                </label>
                <select className="bg-transparent text-white text-sm outline-none border-none cursor-pointer w-full font-medium scheme-dark">
                  <option
                    value="han_river"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Cảng du thuyền Sông Hàn'
                      : 'Han River Cruise Port'}
                  </option>
                  <option
                    value="bach_dang"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Bến du thuyền Bạch Đằng'
                      : 'Bach Dang Yacht Port'}
                  </option>
                  <option
                    value="tien_sa"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Cảng du thuyền Tiên Sa'
                      : 'Tien Sa Cruise Port'}
                  </option>
                </select>
              </div>

              {/* Route */}
              <div
                className="flex flex-col gap-1 border rounded-xl px-4 py-2.5 mb-4 bg-transparent"
                style={{ borderColor: 'var(--border)' }}
              >
                <label className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                  {language === 'VN' ? 'Tuyến du ngoạn' : 'Route / Destination'}
                </label>
                <select className="bg-transparent text-white text-sm outline-none border-none cursor-pointer w-full font-medium scheme-dark">
                  <option
                    value="han_river_sightseeing"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Du ngoạn Sông Hàn (Ngắm cầu)'
                      : 'Han River Sightseeing'}
                  </option>
                  <option
                    value="danang_bay"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Khám phá Vịnh Đà Nẵng'
                      : 'Danang Bay Exploration'}
                  </option>
                  <option
                    value="hon_chao"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Tour Đảo Hòn Chảo'
                      : 'Hon Chao Island Tour'}
                  </option>
                  <option
                    value="sunset_cruise"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Sunset Cruise (Hoàng hôn)'
                      : 'Sunset Cruise Tour'}
                  </option>
                </select>
              </div>

              {/* Date */}
              <div
                className="flex flex-col gap-1 border rounded-xl px-4 py-2.5 mb-4 bg-transparent"
                style={{ borderColor: 'var(--border)' }}
              >
                <label className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                  {language === 'VN' ? 'Ngày khởi hành' : 'Departure Date'}
                </label>
                <input
                  type="date"
                  defaultValue="2026-07-04"
                  className="bg-transparent text-white text-sm outline-none border-none cursor-pointer w-full font-medium scheme-dark"
                />
              </div>

              {/* Guests */}
              <div
                className="flex flex-col gap-1 border rounded-xl px-4 py-2.5 mb-6 bg-transparent"
                style={{ borderColor: 'var(--border)' }}
              >
                <label className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                  {language === 'VN' ? 'Số hành khách' : 'Guests'}
                </label>
                <select className="bg-transparent text-white text-sm outline-none border-none cursor-pointer w-full font-medium scheme-dark">
                  <option
                    value="1"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? '1 Khách (Người lớn)'
                      : '1 Guest (Adult)'}
                  </option>
                  <option
                    value="2"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? '2 Khách (Người lớn)'
                      : '2 Guests (Adults)'}
                  </option>
                  <option
                    value="3"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN' ? '3-4 Khách' : '3-4 Guests'}
                  </option>
                  <option
                    value="family"
                    style={{
                      backgroundColor: 'var(--ddms-bg-card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {language === 'VN'
                      ? 'Gia đình (2 Lớn + Trẻ em)'
                      : 'Family (2 Adults + Kids)'}
                  </option>
                </select>
              </div>
            </div>

            {/* Action button & Small brand logo layout in corner */}
            <div className="mt-4 flex flex-col gap-6">
              <button
                onClick={handleSearchClick}
                className="w-full bg-ddms-secondary text-primary-foreground hover:text-white text-center py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-md shadow-ddms-secondary/15 text-base relative overflow-hidden group/btn border-none"
              >
                {/* Staggered sequential slide-in horizontal background layers on hover */}
                <div className="absolute inset-0 bg-[#00d4e0] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none delay-500 group-hover/btn:delay-0" />
                <div className="absolute inset-0 bg-[#004d94] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none delay-[250ms] group-hover/btn:delay-[250ms]" />
                <div className="absolute inset-0 bg-[#002244] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none group-hover/btn:delay-500" />

                <span className="relative z-10 transition-colors duration-150 group-hover/btn:delay-[750ms]">
                  {language === 'VN' ? 'Đặt chuyến ngay' : 'Book Now'}
                </span>
              </button>
            </div>
          </div>

          {/* ── Right Columns: Promotional Cards ── */}
          {/* Card 1: DIFF Fireworks */}
          <a
            href="/tours"
            className="flex flex-col rounded-2xl overflow-hidden border bg-transparent hover:bg-white/5 transition-all duration-300 group cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80"
                alt="DIFF Fireworks Night"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold block mb-1">
                {language === 'VN'
                  ? 'Trải nghiệm pháo hoa'
                  : 'DIFF Cruise Experience'}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug">
                {language === 'VN'
                  ? 'Du thuyền Đêm Pháo Hoa DIFF'
                  : 'DIFF Fireworks Night Cruise'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {language === 'VN'
                  ? 'Chiêm ngưỡng những màn trình diễn pháo hoa quốc tế lộng lẫy và toàn cảnh sông Hàn lung linh từ vị trí đắc địa nhất trên boong du thuyền hạng sang.'
                  : 'Enjoy the spectacular international fireworks display and glowing Han river lights from the premium deck of our luxury cruise ship.'}
              </p>
            </div>
          </a>

          {/* Card 2: Catamaran Sunset */}
          <a
            href="/tours"
            className="flex flex-col rounded-2xl overflow-hidden border bg-transparent hover:bg-white/5 transition-all duration-300 group cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Catamaran Sunset"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                {language === 'VN'
                  ? 'Du thuyền hoàng hôn'
                  : 'Private Sunset Charter'}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug">
                {language === 'VN'
                  ? 'Du thuyền riêng ngắm hoàng hôn Vịnh Đà Nẵng'
                  : 'Danang Bay Catamaran Sunset Cruise'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {language === 'VN'
                  ? 'Tổ chức tiệc tối lãng mạn, sự kiện cá nhân hoặc ngắm hoàng hôn buông xuống chân đèo Hải Vân trên du thuyền Catamaran riêng tư sang trọng.'
                  : 'Organize private events, sunset dinners, or peaceful sea cruises along the Hai Van pass on our premium catamaran.'}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
