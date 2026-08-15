import axios from 'axios';

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

/**
 * Toa do co dinh cho tung khu vuc. Truoc day component goi
 * geocoding-api.open-meteo.com de doi ten dia diem sang toa do, nhung ten
 * diem don khach trong DB ("Ben Du Thuyen Song Han", "Vinh Da Nang"...)
 * khong phai ten hanh chinh nen API khong tim ra va widget bao khong co du
 * lieu. Tra cuu tai cho vua chac chan vua bot mot vong goi mang.
 */
const COORDS: Record<string, { lat: number; lon: number; label: string }> = {
  'da nang': { lat: 16.0544, lon: 108.2022, label: 'Đà Nẵng' },
  'hoi an': { lat: 15.8801, lon: 108.338, label: 'Hội An' },
  'ha long': { lat: 20.9101, lon: 107.1839, label: 'Hạ Long' },
  'nha trang': { lat: 12.2388, lon: 109.1967, label: 'Nha Trang' },
  'phu quoc': { lat: 10.2899, lon: 103.984, label: 'Phú Quốc' },
  'hai phong': { lat: 20.8449, lon: 106.6881, label: 'Hải Phòng' },
  'vung tau': { lat: 10.3459, lon: 107.0843, label: 'Vũng Tàu' },
  'phan thiet': { lat: 10.9804, lon: 108.2622, label: 'Phan Thiết' },
};

/** DDMS chi khai thac tuyen Da Nang nen day la mac dinh, khong phai loi. */
const DEFAULT_AREA = COORDS['da nang'];

/** Bo dau tieng Viet de "Song Han" va "Sông Hàn" doi chieu nhu nhau. */
const noAccent = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

/** Doi ten diem don khach sang khu vuc co du bao. */
export const resolveArea = (locationName?: string | null) => {
  if (!locationName) return DEFAULT_AREA;
  const key = noAccent(locationName);

  if (
    /(son tra|my khe|bach dang|song han|vinh da nang|ngu hanh son|da nang)/.test(
      key,
    )
  )
    return COORDS['da nang'];
  if (/(cu lao cham|hoi an)/.test(key)) return COORDS['hoi an'];
  if (/(ha long|tuan chau)/.test(key)) return COORDS['ha long'];
  if (/(lan ha|cat ba|hai phong)/.test(key)) return COORDS['hai phong'];
  if (/nha trang/.test(key)) return COORDS['nha trang'];
  if (/phu quoc/.test(key)) return COORDS['phu quoc'];
  if (/vung tau/.test(key)) return COORDS['vung tau'];
  if (/(mui ne|phan thiet)/.test(key)) return COORDS['phan thiet'];

  // Khong nhan ra thi van tra du bao Da Nang thay vi de trong.
  return DEFAULT_AREA;
};

export const weatherService = {
  resolveArea,

  getWeatherForecast: async (
    locationName?: string | null,
  ): Promise<WeatherForecast[]> => {
    try {
      const { lat, lon } = resolveArea(locationName);
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=Asia%2FHo_Chi_Minh&forecast_days=5`;
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
