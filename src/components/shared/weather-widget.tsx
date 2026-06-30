import { useEffect, useState } from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import {
  weatherService,
  type WeatherForecast,
} from '@/services/weatherService';

interface WeatherWidgetProps {
  location: string;
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await weatherService.getWeatherForecast(location);
        if (mounted) {
          if (data && data.length > 0) {
            setForecasts(data);
          } else {
            setError('Không thể lấy thông tin thời tiết');
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Đã có lỗi xảy ra');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (location) {
      fetchWeather();
    } else {
      setLoading(false);
      setError('Chưa có vị trí');
    }

    return () => {
      mounted = false;
    };
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-[#0A192F]/50 border border-white/10 rounded-xl backdrop-blur-sm min-h-37.5">
        <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin mb-3" />
        <p className="text-sm text-gray-400">Đang tải dự báo thời tiết...</p>
      </div>
    );
  }

  if (error || forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-[#0A192F]/50 border border-white/10 rounded-xl backdrop-blur-sm min-h-37.5">
        <Cloud className="w-8 h-8 text-gray-500 mb-3" />
        <p className="text-sm text-gray-400">
          Không có dữ liệu thời tiết tại <b>{location}</b>
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-linear-to-br from-[#0A192F]/80 to-[#112240]/80 border border-white/10 rounded-xl backdrop-blur-md shadow-xl text-white">
      <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
        <Cloud className="w-6 h-6 text-[#00F0FF]" />
        <h3 className="font-semibold text-lg">
          Dự báo thời tiết <span className="text-[#00F0FF]">{location}</span>
        </h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {forecasts.slice(0, 5).map((day, idx) => {
          const dateObj = new Date(day.date);
          const isToday = idx === 0;
          const dayName = isToday
            ? 'Hôm nay'
            : new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(
                dateObj,
              );

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                isToday
                  ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 ring-1 ring-[#00F0FF]/50'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <span
                className={`text-xs font-medium mb-1 ${isToday ? 'text-[#00F0FF]' : 'text-gray-400'}`}
              >
                {dayName}
              </span>
              <span
                className="text-2xl my-2"
                title={weatherService.getWeatherDescription(day.weatherCode)}
              >
                {weatherService.getWeatherIcon(day.weatherCode)}
              </span>
              <div className="flex items-center gap-1.5 text-xs mt-1 font-semibold">
                <span className="text-[#FF5C00]">
                  {Math.round(day.maxTemp)}°
                </span>
                <span className="text-gray-500 font-light">/</span>
                <span className="text-[#00F0FF]">
                  {Math.round(day.minTemp)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
