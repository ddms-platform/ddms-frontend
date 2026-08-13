import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import api from '@/services/api';
import type {
  ComboForm,
  FaqForm,
  RoomForm,
  RouteForm,
  ServiceFormState,
} from '../service-tab';

const NEW_SERVICE_ID_PREFIX = 'new_';

const VALID_SERVICE_TYPES = [
  'cruise',
  'complex_tour',
  'dinner',
  'fishing',
  'speedboat',
] as const;

const SERVICE_TYPE_ALIASES: Record<string, string> = {
  'tour ngắn': 'cruise',
  'tour ngan': 'cruise',
  cruise: 'cruise',
  'tour dài ngày': 'complex_tour',
  'tour dai ngay': 'complex_tour',
  complex_tour: 'complex_tour',
  'ăn tối': 'dinner',
  'an toi': 'dinner',
  dinner: 'dinner',
  'câu mực đêm': 'fishing',
  'cau muc dem': 'fishing',
  fishing: 'fishing',
  'thuê ca nô': 'speedboat',
  'thue ca no': 'speedboat',
  speedboat: 'speedboat',
};

function normalizeServiceType(raw: unknown): string {
  if (typeof raw !== 'string') return 'cruise';
  const key = raw.trim().toLowerCase();
  const mapped = SERVICE_TYPE_ALIASES[key];
  if (mapped) return mapped;
  if ((VALID_SERVICE_TYPES as readonly string[]).includes(key)) return key;
  return 'cruise';
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function readSheet<T = Record<string, unknown>>(
  wb: XLSX.WorkBook,
  name: string,
): T[] {
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: '' });
}

/**
 * Parse an uploaded multi-sheet Excel file into ServiceFormState drafts.
 *
 * Expected sheets (all optional except "Services"):
 *   - Services: serviceType, name, basePrice, description, equipments, pricePerDay, route
 *   - Rooms:    service_name, name, capacity, price, description, imageUrl
 *   - Combos:   service_name, name, price, description, imageUrl
 *   - Faqs:     service_name, question, answer
 *   - Routes:   service_name, name, startPoint, endPoint, description
 *
 * Nested rows link back to their service via matching `service_name` (case-insensitive).
 */
export async function parseServicesExcel(
  file: File,
): Promise<{ services: ServiceFormState[]; errors: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });

  if (wb.SheetNames.length === 0) {
    return { services: [], errors: ['File không có sheet nào.'] };
  }

  // First sheet is treated as Services regardless of name (backward compat).
  const servicesSheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === 'services') ||
    wb.SheetNames[0];

  const serviceRows = readSheet<{
    serviceType?: string;
    name?: string;
    basePrice?: string | number;
    description?: string;
    equipments?: string;
    pricePerDay?: string | number;
    route?: string;
  }>(wb, servicesSheetName);

  const roomRows = readSheet<{
    service_name?: string;
    name?: string;
    capacity?: string | number;
    price?: string | number;
    description?: string;
    imageUrl?: string;
    imageFile?: string;
  }>(wb, 'Rooms');

  const comboRows = readSheet<{
    service_name?: string;
    name?: string;
    price?: string | number;
    description?: string;
    imageUrl?: string;
    imageFile?: string;
  }>(wb, 'Combos');

  const faqRows = readSheet<{
    service_name?: string;
    question?: string;
    answer?: string;
  }>(wb, 'Faqs');

  const routeRows = readSheet<{
    service_name?: string;
    name?: string;
    startPoint?: string;
    endPoint?: string;
    description?: string;
  }>(wb, 'Routes');

  const services: ServiceFormState[] = [];
  const errors: string[] = [];
  const byName = new Map<string, ServiceFormState>();

  serviceRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const name = toStr(row.name);
    if (!name) {
      errors.push(`Services dòng ${rowNum}: thiếu tên dịch vụ.`);
      return;
    }
    const basePrice = toStr(row.basePrice);
    if (!basePrice) {
      errors.push(`Services dòng ${rowNum}: thiếu giá cơ bản.`);
      return;
    }

    const svc: ServiceFormState = {
      id: `${NEW_SERVICE_ID_PREFIX}${Math.random().toString(36).substring(7)}`,
      serviceType: normalizeServiceType(row.serviceType),
      name,
      basePrice,
      description: toStr(row.description),
      route: toStr(row.route),
      routes: [],
      combos: [],
      rooms: [],
      faqs: [],
      equipments: toStr(row.equipments),
      pricePerDay: toStr(row.pricePerDay),
    };
    services.push(svc);
    byName.set(name.toLowerCase(), svc);
  });

  const findService = (rawName: unknown, label: string, rowNum: number) => {
    const key = toStr(rawName).toLowerCase();
    if (!key) {
      errors.push(`${label} dòng ${rowNum}: thiếu service_name.`);
      return null;
    }
    const svc = byName.get(key);
    if (!svc) {
      errors.push(
        `${label} dòng ${rowNum}: không tìm thấy dịch vụ "${toStr(rawName)}".`,
      );
      return null;
    }
    return svc;
  };

  roomRows.forEach((row, idx) => {
    const svc = findService(row.service_name, 'Rooms', idx + 2);
    if (!svc) return;
    const room: RoomForm & { __imageFile?: string } = {
      name: toStr(row.name),
      capacity: toStr(row.capacity),
      price: toStr(row.price),
      description: toStr(row.description),
      imageUrl: toStr(row.imageUrl),
    };
    const imgFile = toStr(row.imageFile);
    if (imgFile && !room.imageUrl) room.__imageFile = imgFile;
    if (!room.name) return;
    svc.rooms.push(room);
  });

  comboRows.forEach((row, idx) => {
    const svc = findService(row.service_name, 'Combos', idx + 2);
    if (!svc) return;
    const combo: ComboForm & { __imageFile?: string } = {
      name: toStr(row.name),
      price: toStr(row.price),
      description: toStr(row.description),
      imageUrl: toStr(row.imageUrl),
    };
    const imgFile = toStr(row.imageFile);
    if (imgFile && !combo.imageUrl) combo.__imageFile = imgFile;
    if (!combo.name) return;
    svc.combos.push(combo);
  });

  faqRows.forEach((row, idx) => {
    const svc = findService(row.service_name, 'Faqs', idx + 2);
    if (!svc) return;
    const faq: FaqForm = {
      question: toStr(row.question),
      answer: toStr(row.answer),
    };
    if (!faq.question) return;
    svc.faqs.push(faq);
  });

  routeRows.forEach((row, idx) => {
    const svc = findService(row.service_name, 'Routes', idx + 2);
    if (!svc) return;
    const route: RouteForm = {
      name: toStr(row.name),
      startPoint: toStr(row.startPoint),
      endPoint: toStr(row.endPoint),
      description: toStr(row.description),
    };
    if (!route.name && !route.startPoint) return;
    svc.routes.push(route);
  });

  // Ensure every service has at least 1 placeholder row (form UI expects it)
  for (const svc of services) {
    if (svc.rooms.length === 0)
      svc.rooms.push({
        name: '',
        capacity: '',
        price: '',
        description: '',
        imageUrl: '',
      });
    if (svc.combos.length === 0)
      svc.combos.push({ name: '', price: '', description: '', imageUrl: '' });
    if (svc.faqs.length === 0) svc.faqs.push({ question: '', answer: '' });
    if (svc.routes.length === 0)
      svc.routes.push({
        name: '',
        startPoint: '',
        endPoint: '',
        description: '',
      });
  }

  return { services, errors };
}

/**
 * Generate a multi-sheet .xlsx template so the owner can fill in services
 * plus nested rooms/combos/FAQs/routes (with image URLs).
 */
export function buildTemplateBlob(): Blob {
  const wb = XLSX.utils.book_new();

  const servicesRows: (string | number)[][] = [
    [
      'serviceType',
      'name',
      'basePrice',
      'description',
      'equipments',
      'pricePerDay',
      'route',
    ],
    [
      'cruise',
      'Tour Ngắm Hoàng Hôn',
      200000,
      'Tour ngắm hoàng hôn 2 tiếng trên sông Hàn',
      '',
      '',
      'Bến Bạch Đằng - Cầu Rồng',
    ],
    [
      'complex_tour',
      'Tour Cù Lao Chàm 2N1Đ',
      1500000,
      'Trải nghiệm nghỉ dưỡng + lặn ngắm san hô',
      '',
      750000,
      '',
    ],
    [
      'dinner',
      'Bữa Tối Trên Du Thuyền',
      500000,
      'Menu Á - Âu 5 món',
      '',
      '',
      '',
    ],
  ];
  const wsServices = XLSX.utils.aoa_to_sheet(servicesRows);
  wsServices['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 12 },
    { wch: 40 },
    { wch: 20 },
    { wch: 12 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsServices, 'Services');

  const roomsRows: (string | number)[][] = [
    [
      'service_name',
      'name',
      'capacity',
      'price',
      'description',
      'imageUrl',
      'imageFile',
    ],
    [
      'Tour Cù Lao Chàm 2N1Đ',
      'Phòng VIP view biển',
      2,
      500000,
      'Giường đôi, ban công riêng',
      '',
      'vip-room.jpg',
    ],
    [
      'Tour Cù Lao Chàm 2N1Đ',
      'Phòng Standard',
      2,
      300000,
      'Giường đôi tiêu chuẩn',
      '',
      'standard-room.jpg',
    ],
  ];
  const wsRooms = XLSX.utils.aoa_to_sheet(roomsRows);
  wsRooms['!cols'] = [
    { wch: 28 },
    { wch: 24 },
    { wch: 10 },
    { wch: 12 },
    { wch: 30 },
    { wch: 30 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms');

  const combosRows: (string | number)[][] = [
    ['service_name', 'name', 'price', 'description', 'imageUrl', 'imageFile'],
    [
      'Bữa Tối Trên Du Thuyền',
      'Combo Gia đình 4 người',
      1800000,
      'Bao gồm 4 suất ăn + đồ uống',
      '',
      'family-combo.jpg',
    ],
    [
      'Tour Ngắm Hoàng Hôn',
      'Gói Đôi Lãng Mạn',
      450000,
      'Kèm trà chiều + hoa',
      '',
      'couple.jpg',
    ],
  ];
  const wsCombos = XLSX.utils.aoa_to_sheet(combosRows);
  wsCombos['!cols'] = [
    { wch: 28 },
    { wch: 26 },
    { wch: 12 },
    { wch: 30 },
    { wch: 30 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCombos, 'Combos');

  const faqsRows: (string | number)[][] = [
    ['service_name', 'question', 'answer'],
    [
      'Tour Ngắm Hoàng Hôn',
      'Tour có phù hợp với trẻ em không?',
      'Có, trẻ dưới 6 tuổi miễn phí.',
    ],
    [
      'Tour Ngắm Hoàng Hôn',
      'Có được hủy sau khi đặt không?',
      'Miễn phí hủy trước 24 giờ.',
    ],
  ];
  const wsFaqs = XLSX.utils.aoa_to_sheet(faqsRows);
  wsFaqs['!cols'] = [{ wch: 28 }, { wch: 40 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsFaqs, 'Faqs');

  const routesRows: (string | number)[][] = [
    ['service_name', 'name', 'startPoint', 'endPoint', 'description'],
    [
      'Tour Ngắm Hoàng Hôn',
      'Chặng 1',
      'Bến Bạch Đằng',
      'Cầu Rồng',
      'Ngắm cảnh dọc sông Hàn',
    ],
    [
      'Tour Ngắm Hoàng Hôn',
      'Chặng 2',
      'Cầu Rồng',
      'Bến Bạch Đằng',
      'Quay về bến',
    ],
  ];
  const wsRoutes = XLSX.utils.aoa_to_sheet(routesRows);
  wsRoutes['!cols'] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRoutes, 'Routes');

  const arr = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([arr], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadTemplate(filename = 'template-dich-vu-tau.xlsx') {
  const blob = buildTemplateBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

async function uploadImageBlob(blob: Blob, name: string): Promise<string> {
  const form = new FormData();
  form.append('file', blob, name);
  const res = await api.post('/owner/services/upload-image', form);
  const url = res.data?.result || res.data?.imageUrl || res.data?.url;
  if (typeof url !== 'string' || !url) {
    throw new Error(`Upload failed for ${name}`);
  }
  return url;
}

/**
 * Parse a ZIP archive containing:
 *   - one .xlsx/.xls file (services template, at any depth)
 *   - image files referenced from Rooms/Combos sheets via `imageFile` column
 *
 * Filenames in `imageFile` are matched against basenames inside the ZIP
 * (case-insensitive). Each unique image is uploaded once to Cloudinary via
 * /owner/services/upload-image, then its URL is substituted into the
 * corresponding room/combo entry.
 */
export async function parseServicesZip(
  file: File,
  onProgress?: (uploaded: number, total: number) => void,
): Promise<{ services: ServiceFormState[]; errors: string[] }> {
  const zip = await JSZip.loadAsync(file);
  const errors: string[] = [];

  // Locate the Excel file inside the ZIP
  let xlsxEntry: JSZip.JSZipObject | null = null;
  const imageByBasename = new Map<string, JSZip.JSZipObject>();

  zip.forEach((_, entry) => {
    if (entry.dir) return;
    const lower = entry.name.toLowerCase();
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      // Prefer top-level file if multiple
      if (
        !xlsxEntry ||
        entry.name.split('/').length < xlsxEntry.name.split('/').length
      ) {
        xlsxEntry = entry;
      }
    } else {
      const ext = lower.split('.').pop() ?? '';
      if (MIME_BY_EXT[ext]) {
        const basename = entry.name.split('/').pop()!.toLowerCase();
        imageByBasename.set(basename, entry);
      }
    }
  });

  if (!xlsxEntry) {
    return {
      services: [],
      errors: ['Không tìm thấy file .xlsx trong ZIP.'],
    };
  }

  // Parse Excel — reuse existing logic by feeding the extracted xlsx as a File.
  const xlsxBuf = await (xlsxEntry as JSZip.JSZipObject).async('arraybuffer');
  const pseudoFile = new File([xlsxBuf], (xlsxEntry as JSZip.JSZipObject).name);
  const { services, errors: excelErrors } =
    await parseServicesExcel(pseudoFile);
  errors.push(...excelErrors);

  // Collect unique image filenames referenced from Rooms/Combos
  const referenced = new Set<string>();
  for (const svc of services) {
    for (const room of svc.rooms) {
      const f = (room as RoomForm & { __imageFile?: string }).__imageFile;
      if (f) referenced.add(f.toLowerCase());
    }
    for (const combo of svc.combos) {
      const f = (combo as ComboForm & { __imageFile?: string }).__imageFile;
      if (f) referenced.add(f.toLowerCase());
    }
  }

  // Upload each referenced image once (dedup by filename)
  const urlByFile = new Map<string, string>();
  const list = [...referenced];
  for (let i = 0; i < list.length; i++) {
    const basename = list[i];
    const entry = imageByBasename.get(basename);
    if (!entry) {
      errors.push(`Không tìm thấy ảnh "${basename}" trong ZIP.`);
      onProgress?.(i + 1, list.length);
      continue;
    }
    try {
      const ext = basename.split('.').pop() ?? 'jpg';
      const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
      const blob = await entry.async('blob');
      const typed = new Blob([blob], { type: mime });
      const url = await uploadImageBlob(typed, basename);
      urlByFile.set(basename, url);
    } catch (err) {
      console.error(`Upload failed for ${basename}:`, err);
      errors.push(`Không upload được ảnh "${basename}".`);
    }
    onProgress?.(i + 1, list.length);
  }

  // Substitute URLs back into rooms/combos
  for (const svc of services) {
    svc.rooms = svc.rooms.map((r) => {
      const meta = r as RoomForm & { __imageFile?: string };
      if (meta.__imageFile && !r.imageUrl) {
        const url = urlByFile.get(meta.__imageFile.toLowerCase());
        if (url) r.imageUrl = url;
      }
      const { __imageFile: _, ...clean } = meta;
      void _;
      return clean;
    });
    svc.combos = svc.combos.map((c) => {
      const meta = c as ComboForm & { __imageFile?: string };
      if (meta.__imageFile && !c.imageUrl) {
        const url = urlByFile.get(meta.__imageFile.toLowerCase());
        if (url) c.imageUrl = url;
      }
      const { __imageFile: _, ...clean } = meta;
      void _;
      return clean;
    });
  }

  return { services, errors };
}
