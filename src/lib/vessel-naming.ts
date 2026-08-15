/**
 * Tiện ích chuẩn hoá & hỗ trợ quy chuẩn đặt tên du thuyền (Vessel Naming Convention).
 */

/**
 * Chuẩn hoá tên du thuyền / phương tiện:
 * - Cắt khoảng trắng đầu cuối
 * - Rút gọn khoảng trắng kép thành khoảng trắng đơn
 * - Chuyển thành IN HOA (UPPERCASE) theo chuẩn đăng kiểm hàng hải
 */
export function cleanVesselName(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Kiểm tra tên tàu có hợp lệ (từ 3 ký tự, không chứa emoji / ký tự đặc biệt lạ).
 */
export function hasInvalidVesselChars(raw: string): boolean {
  if (!raw) return false;
  // Cho phép chữ cái (kể cả tiếng Việt có dấu), chữ số, khoảng trắng, gạch ngang '-', gạch dưới '_'
  return /[^\p{L}\p{N}\s\-_]/u.test(raw);
}

/**
 * Gợi ý các hậu tố chuẩn dựa trên từng loại phương tiện.
 */
export function getSuggestedVesselSuffixes(vesselType: string): string[] {
  const type = (vesselType || '').toLowerCase();

  // 1. Thuyền đánh cá / Câu cá giải trí (fishing_boat)
  if (
    type.includes('fishing') ||
    type.includes('đánh cá') ||
    type.includes('câu cá') ||
    type.includes('ngư')
  ) {
    return ['FISHING 01', 'ANGLER 01', 'CÂU CÁ 01', 'BIỂN BẠC 01'];
  }

  // 2. Thuyền hai thân (catamaran)
  if (type.includes('catamaran') || type.includes('hai thân')) {
    return ['CATAMARAN 01', 'CRUISE', 'CAT 01', '01'];
  }

  // 3. Cano / Ca nô cao tốc (speedboat)
  if (
    type.includes('speed') ||
    type.includes('cano') ||
    type.includes('ca nô') ||
    type.includes('cao tốc')
  ) {
    return ['EXPRESS 01', 'SPEEDY 01', 'SPEEDBOAT', 'CANO 01'];
  }

  // 4. Tàu du lịch cỡ vừa / ngắm cảnh (cruiser / tour boat)
  if (
    type.includes('cruiser') ||
    type.includes('cỡ vừa') ||
    type.includes('tour') ||
    type.includes('sightseeing') ||
    type.includes('du lịch') ||
    type.includes('gỗ')
  ) {
    return ['CRUISER 01', 'TOURIST 01', 'SÔNG HÀN 01', 'DRAGON 01'];
  }

  // 5. Mặc định cho du thuyền cá nhân / cao cấp (yacht / cruise)
  return ['YACHT', 'CRUISE', 'PRINCESS', 'ROYAL 01'];
}

/**
 * Lấy ví dụ tên tàu mẫu phù hợp với loại thuyền đang chọn.
 */
export function getVesselNamingExample(vesselType: string): string {
  const type = (vesselType || '').toLowerCase();

  if (
    type.includes('fishing') ||
    type.includes('đánh cá') ||
    type.includes('câu cá') ||
    type.includes('ngư')
  ) {
    return 'SƠN TRÀ FISHING 01, BIỂN ĐÔNG ANGLER 02';
  }

  if (type.includes('catamaran') || type.includes('hai thân')) {
    return 'POSEIDON CATAMARAN 01, BLUE OCEAN CAT 02';
  }

  if (
    type.includes('speed') ||
    type.includes('cano') ||
    type.includes('ca nô') ||
    type.includes('cao tốc')
  ) {
    return 'CHAM ISLAND EXPRESS 02, SƠN TRÀ SPEEDY 01';
  }

  if (
    type.includes('cruiser') ||
    type.includes('cỡ vừa') ||
    type.includes('tour') ||
    type.includes('sightseeing') ||
    type.includes('du lịch')
  ) {
    return 'SÔNG HÀN TOURIST 01, RỒNG ĐÀ THÀNH CRUISER 02';
  }

  return 'POSEIDON CRUISE DANANG, DANANG PRINCESS 01';
}

/**
 * Tự động tạo 5 tên du thuyền mẫu chất lượng cao dựa trên từ khóa & loại tàu.
 */
export function generateLocalFallbackVesselNames(
  keywords: string,
  vesselType: string,
): string[] {
  const type = (vesselType || '').toLowerCase();
  const kw =
    !keywords || keywords.includes('thuyền') || keywords.includes('du thuyền')
      ? 'ĐÀ NẴNG'
      : cleanVesselName(keywords);

  if (
    type.includes('fishing') ||
    type.includes('đánh cá') ||
    type.includes('câu cá') ||
    type.includes('ngư')
  ) {
    return [
      `${kw} FISHING 01`,
      `SƠN TRÀ ${kw} ANGLER 01`,
      `${kw} BIỂN BẠC 01`,
      `BIỂN ĐÔNG ${kw} FISHING 02`,
      `${kw} CÂU CÁ 01`,
    ];
  }

  if (type.includes('catamaran') || type.includes('hai thân')) {
    return [
      `${kw} CATAMARAN 01`,
      `POSEIDON ${kw} CAT 01`,
      `BLUE OCEAN ${kw} CATAMARAN 02`,
      `${kw} ROYAL CAT 01`,
      `ĐÀ THÀNH ${kw} CATAMARAN 01`,
    ];
  }

  if (
    type.includes('speed') ||
    type.includes('cano') ||
    type.includes('ca nô') ||
    type.includes('cao tốc')
  ) {
    return [
      `${kw} EXPRESS 01`,
      `CHAM ISLAND ${kw} EXPRESS 02`,
      `${kw} SPEEDY 01`,
      `SƠN TRÀ ${kw} SPEEDBOAT 01`,
      `${kw} SPEEDY OCEAN 09`,
    ];
  }

  if (
    type.includes('cruiser') ||
    type.includes('cỡ vừa') ||
    type.includes('tour') ||
    type.includes('sightseeing') ||
    type.includes('du lịch')
  ) {
    return [
      `${kw} TOURIST 01`,
      `SÔNG HÀN ${kw} CRUISER 01`,
      `${kw} DRAGON TOURIST 02`,
      `RỒNG ĐÀ THÀNH ${kw} 01`,
      `${kw} SÔNG HÀN CRUISER 02`,
    ];
  }

  return [
    `POSEIDON ${kw} CRUISE`,
    `${kw} PRINCESS CRUISE 01`,
    `ROYAL ${kw} YACHT 01`,
    `${kw} LUXURY CRUISE 02`,
    `DANANG ${kw} YACHT 01`,
  ];
}
