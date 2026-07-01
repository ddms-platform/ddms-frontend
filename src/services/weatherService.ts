import axios from 'axios';

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

const extractCity = (loc: string) => {
  const lower = loc.toLowerCase();
  if (
    lower.includes('hàn') ||
    lower.includes('đà nẵng') ||
    lower.includes('bạch đằng')
  )
    return 'Da Nang';
  if (lower.includes('hạ long') || lower.includes('tuần châu'))
    return 'Ha Long';
  if (lower.includes('phú quốc')) return 'Phu Quoc';
  if (lower.includes('nha trang')) return 'Nha Trang';
  if (
    lower.includes('lan hạ') ||
    lower.includes('cát bà') ||
    lower.includes('hải phòng')
  )
    return 'Hai Phong';
  if (lower.includes('cù lao chàm') || lower.includes('hội an'))
    return 'Hoi An';
  if (lower.includes('vũng tàu')) return 'Vung Tau';
  if (lower.includes('mũi né') || lower.includes('phan thiết'))
    return 'Phan Thiet';
  return loc; // fallback to original
};

export const weatherService = {
  getWeatherForecast: async (
    locationName: string,
  ): Promise<WeatherForecast[]> => {
    try {
      if (!locationName) return [];

      let queryName = locationName;
      let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryName)}&count=1&language=vi&format=json`;
      let geoRes = await axios.get(geoUrl);

      // Fallback if not found
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        const fallbackCity = extractCity(locationName);
        if (fallbackCity !== locationName) {
          queryName = fallbackCity;
          geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryName)}&count=1&language=vi&format=json`;
          geoRes = await axios.get(geoUrl);
        }
      }

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return [];
      }

      const { latitude, longitude } = geoRes.data.results[0];

      // 2. Lấy dự báo thời tiết 5 ngày
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=5`;
      const weatherRes = await axios.get(weatherUrl);

      const daily = weatherRes.data.daily;
      if (!daily) return [];

      const forecasts: WeatherForecast[] = [];
      for (let i = 0; i < daily.time.length; i++) {
        forecasts.push({
          date: daily.time[i],
          maxTemp: daily.temperature_2m_max[i],
          minTemp: daily.temperature_2m_min[i],
          weatherCode: daily.weather_code[i],
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return [];
    }
  },

  getWeatherIcon: (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️';
    if (code === 1 || code === 2 || code === 3) return '⛅';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌧️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '☁️';
  },

  getWeatherDescription: (code: number) => {
    if (code === 0) return 'Trời quang';
    if (code === 1 || code === 2 || code === 3) return 'Có mây';
    if (code === 45 || code === 48) return 'Sương mù';
    if (code >= 51 && code <= 55) return 'Mưa phùn';
    if (code >= 61 && code <= 65) return 'Mưa';
    if (code >= 71 && code <= 77) return 'Tuyết rơi';
    if (code >= 80 && code <= 82) return 'Mưa rào';
    if (code >= 95 && code <= 99) return 'Có dông';
    return 'Không rõ';
  },
};
