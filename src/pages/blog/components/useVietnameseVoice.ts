import { useEffect, useState } from 'react';

/**
 * Chọn giọng đọc tiếng Việt của trình duyệt.
 *
 * speechSynthesis.getVoices() trả về mảng rỗng ở lần gọi đầu trên Chrome —
 * danh sách giọng nạp bất đồng bộ và chỉ sẵn sàng sau sự kiện voiceschanged.
 * Gọi một lần rồi thôi là hay trượt giọng vi-VN và đọc tiếng Việt bằng giọng
 * Anh, nghe rất kỳ.
 */
export function useVietnameseVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  // Tinh ngay khi render, khong dat qua setState trong effect.
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;

    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const vi = voices.filter((v) => v.lang?.toLowerCase().startsWith('vi'));
      // Giọng nữ hợp với vai người dẫn bản tin hơn; không có thì lấy giọng vi đầu tiên.
      const preferred =
        vi.find((v) => /female|nữ|hoaimy|linh|mai/i.test(v.name)) ?? vi[0];
      if (preferred) setVoice(preferred);
    };

    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, [supported]);

  return { voice, supported, hasVietnamese: voice !== null };
}
