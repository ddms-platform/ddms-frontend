import { Wifi, Wind, Tv, Bath, Coffee, Eye, DoorOpen } from 'lucide-react';
import type { Boat, RoomOption } from './types';

// ── Tour ──
export const MOCK_TOUR = {
  title: 'Tour Sông Hàn Về Đêm',
  price: 350000,
  duration: '2 giờ',
  maxGuests: 30,
};

export const AVAILABLE_DATES = [
  '2026-04-25',
  '2026-04-26',
  '2026-04-27',
  '2026-04-28',
  '2026-04-29',
  '2026-04-30',
  '2026-05-01',
];

export const TIME_SLOTS = ['17:30', '19:00', '20:30'];

// ── Boats ──
export const MOCK_BOATS: Boat[] = [
  {
    id: 'boat-1',
    name: 'Rồng Vàng',
    type: 'cruise',
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
    available: true,
    description: 'Du thuyền hạng sang với 2 tầng, phòng VIP',
  },
  {
    id: 'boat-2',
    name: 'Sông Hàn 01',
    type: 'standard',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400&h=250&fit=crop',
    available: true,
    description: 'Thuyền tiêu chuẩn, thoáng mát',
  },
  {
    id: 'boat-3',
    name: 'Phượng Hoàng',
    type: 'luxury',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=400&h=250&fit=crop',
    available: false,
    description: 'Du thuyền cao cấp, nội thất sang trọng',
  },
  {
    id: 'boat-4',
    name: 'Bạch Đằng Star',
    type: 'party',
    capacity: 50,
    image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=400&h=250&fit=crop',
    available: true,
    description: 'Thuyền tiệc lớn, sân khấu ngoài trời',
  },
  {
    id: 'boat-5',
    name: 'Cá Chép Đỏ',
    type: 'standard',
    capacity: 25,
    image: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=400&h=250&fit=crop',
    available: false,
    description: 'Đang bảo trì định kỳ',
  },
  {
    id: 'boat-6',
    name: 'Hải Âu',
    type: 'speedboat',
    capacity: 12,
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=250&fit=crop',
    available: true,
    description: 'Ca nô cao tốc, trải nghiệm mạo hiểm',
  },
];

// ── Rooms per boat ──
export const BOAT_ROOMS: Record<string, RoomOption[]> = {
  'boat-1': [
    {
      id: 'r1',
      name: 'Phòng VIP Panorama',
      type: 'vip',
      price: 2500000,
      maxAdults: 2,
      maxChildren: 1,
      area: '25m²',
      bed: '1 King',
      rating: 4.95,
      reviewCount: 89,
      totalRooms: 2,
      availableRooms: 1,
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop',
      ],
      description:
        'Phòng VIP cao cấp nhất với view panorama 180 độ ra sông Hàn. Nội thất gỗ tự nhiên, minibar miễn phí, đèn chiếu sáng thông minh.',
      amenities: [
        { icon: Wifi, label: 'WiFi tốc độ cao' },
        { icon: Wind, label: 'Điều hòa 2 chiều' },
        { icon: Tv, label: 'Smart TV 55"' },
        { icon: Bath, label: 'Bồn tắm Jacuzzi' },
        { icon: Coffee, label: 'Minibar miễn phí' },
        { icon: Eye, label: 'View sông 180°' },
      ],
      ratingBreakdown: [
        { stars: 5, count: 68 },
        { stars: 4, count: 15 },
        { stars: 3, count: 4 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 },
      ],
      reviews: [
        {
          id: 1,
          name: 'Minh Anh',
          rating: 5,
          date: '20/04/2026',
          comment: 'Phòng rất đẹp, view sông Hàn tuyệt vời! Minibar miễn phí là điểm cộng lớn.',
        },
        {
          id: 2,
          name: 'David K.',
          rating: 5,
          date: '15/04/2026',
          comment: 'Amazing luxury cabin. The panoramic view is breathtaking, especially at night.',
        },
        {
          id: 3,
          name: 'Hương Trần',
          rating: 4,
          date: '10/04/2026',
          comment: 'Nội thất sang trọng, bồn tắm rộng. Chỉ tiếc phòng hơi nhỏ so với giá.',
        },
        {
          id: 4,
          name: 'Quốc Bảo',
          rating: 5,
          date: '05/04/2026',
          comment: 'Trải nghiệm tuyệt vời, xứng đáng từng đồng!',
        },
      ],
    },
    {
      id: 'r2',
      name: 'Phòng Deluxe River',
      type: 'deluxe',
      price: 1800000,
      maxAdults: 2,
      maxChildren: 2,
      area: '20m²',
      bed: '1 Queen',
      rating: 4.8,
      reviewCount: 156,
      totalRooms: 4,
      availableRooms: 3,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop',
      ],
      description:
        'Phòng Deluxe rộng rãi với ban công riêng nhìn ra sông. Giường Queen êm ái, phòng tắm hiện đại.',
      amenities: [
        { icon: Wifi, label: 'WiFi' },
        { icon: Wind, label: 'Điều hòa' },
        { icon: Tv, label: 'TV 43"' },
        { icon: Eye, label: 'Ban công riêng' },
      ],
      ratingBreakdown: [
        { stars: 5, count: 102 },
        { stars: 4, count: 38 },
        { stars: 3, count: 12 },
        { stars: 2, count: 3 },
        { stars: 1, count: 1 },
      ],
      reviews: [
        {
          id: 1,
          name: 'Thanh Hoa',
          rating: 5,
          date: '18/04/2026',
          comment: 'Ban công nhìn ra sông rất lãng mạn, đặc biệt lúc hoàng hôn.',
        },
        {
          id: 2,
          name: 'John M.',
          rating: 4,
          date: '12/04/2026',
          comment: 'Great room with a lovely balcony. The bed was very comfortable.',
        },
        {
          id: 3,
          name: 'Linh Chi',
          rating: 5,
          date: '08/04/2026',
          comment: 'Phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!',
        },
      ],
    },
    {
      id: 'r3',
      name: 'Phòng Standard',
      type: 'standard',
      price: 900000,
      maxAdults: 2,
      maxChildren: 1,
      area: '14m²',
      bed: '2 Single',
      rating: 4.5,
      reviewCount: 230,
      totalRooms: 6,
      availableRooms: 4,
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop'],
      description:
        'Phòng tiêu chuẩn gọn gàng, đầy đủ tiện nghi cơ bản. Phù hợp cho chuyến đi ngắn.',
      amenities: [
        { icon: Wifi, label: 'WiFi' },
        { icon: Wind, label: 'Điều hòa' },
        { icon: DoorOpen, label: 'Phòng riêng' },
      ],
      ratingBreakdown: [
        { stars: 5, count: 120 },
        { stars: 4, count: 72 },
        { stars: 3, count: 25 },
        { stars: 2, count: 8 },
        { stars: 1, count: 5 },
      ],
      reviews: [
        {
          id: 1,
          name: 'Lan Anh',
          rating: 5,
          date: '22/04/2026',
          comment: 'Giá tốt, phòng sạch! Rất phù hợp cho 2 người.',
        },
        {
          id: 2,
          name: 'Phúc Nguyễn',
          rating: 4,
          date: '08/04/2026',
          comment: 'Ổn cho chuyến đi ngắn. Tiện nghi đầy đủ.',
        },
      ],
    },
  ],
  'boat-4': [
    {
      id: 'r4',
      name: 'Party Suite',
      type: 'vip',
      price: 3000000,
      maxAdults: 4,
      maxChildren: 0,
      area: '35m²',
      bed: '2 Queen',
      rating: 4.9,
      reviewCount: 67,
      totalRooms: 2,
      availableRooms: 2,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=800&h=500&fit=crop'],
      description:
        'Suite tiệc lớn với không gian mở, hệ thống đèn LED, loa karaoke chất lượng cao.',
      amenities: [
        { icon: Wifi, label: 'WiFi' },
        { icon: Wind, label: 'Điều hòa' },
        { icon: Tv, label: 'Karaoke' },
        { icon: Coffee, label: 'Minibar' },
      ],
      ratingBreakdown: [
        { stars: 5, count: 50 },
        { stars: 4, count: 12 },
        { stars: 3, count: 3 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 },
      ],
      reviews: [
        {
          id: 1,
          name: 'Tuấn Anh',
          rating: 5,
          date: '25/04/2026',
          comment: 'Party trên thuyền cực vui! Karaoke hay lắm.',
        },
      ],
    },
  ],
};

export const DEFAULT_BOAT_ROOMS: RoomOption[] = [
  {
    id: 'rd1',
    name: 'Cabin Standard',
    type: 'standard',
    price: 800000,
    maxAdults: 2,
    maxChildren: 1,
    area: '12m²',
    bed: '1 Double',
    rating: 4.3,
    reviewCount: 45,
    totalRooms: 3,
    availableRooms: 2,
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop'],
    description: 'Cabin tiêu chuẩn nhỏ gọn, đầy đủ tiện nghi cơ bản.',
    amenities: [
      { icon: Wifi, label: 'WiFi' },
      { icon: Wind, label: 'Điều hòa' },
    ],
    ratingBreakdown: [
      { stars: 5, count: 20 },
      { stars: 4, count: 15 },
      { stars: 3, count: 6 },
      { stars: 2, count: 3 },
      { stars: 1, count: 1 },
    ],
    reviews: [
      {
        id: 1,
        name: 'Khách',
        rating: 4,
        date: '01/04/2026',
        comment: 'Phòng ổn, sạch sẽ. Giá hợp lý.',
      },
    ],
  },
];
