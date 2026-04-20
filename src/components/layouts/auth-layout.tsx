import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding / Decorative */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        {/* Gradient background with Rausch Red */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #ff385c 0%, #e00b41 40%, #bd1e59 70%, #460479 100%)',
          }}
        />

        {/* Decorative circles */}
        <div
          className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-15"
          style={{ backgroundColor: '#ffffff' }}
        />
        <div
          className="absolute -bottom-10 right-10 h-60 w-60 rounded-full opacity-10"
          style={{ backgroundColor: '#ffffff' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full opacity-8"
          style={{ backgroundColor: '#ffffff' }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center px-12">
          <div className="max-w-md space-y-8 text-center">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              Welcome to DDMS
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Hệ thống quản lý và hỗ trợ đặt tour du lịch đường thủy tại thành phố Đà Nẵng. Trải
              nghiệm sông nước tuyệt vời chỉ với vài thao tác đơn giản.
            </p>

            {/* Feature highlights */}
            <div className="mt-12 space-y-4">
              {[
                { icon: '🚢', text: 'Quản lý tour đường thủy dễ dàng' },
                { icon: '📅', text: 'Đặt lịch & theo dõi chuyến đi realtime' },
                { icon: '🌊', text: 'Khám phá vẻ đẹp sông Hàn, Đà Nẵng' },
              ].map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-105">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
