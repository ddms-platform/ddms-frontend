import type React from 'react';

// ── Boat ──
export interface Boat {
  id: string;
  name: string;
  type: string;
  capacity: number;
  image: string;
  available: boolean;
  description: string;
}

// ── Room ──
export interface RoomReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface RoomOption {
  id: string;
  name: string;
  type: 'vip' | 'deluxe' | 'standard';
  price: number;
  maxAdults: number;
  maxChildren: number;
  area: string;
  bed: string;
  rating: number;
  reviewCount: number;
  totalRooms: number;
  availableRooms: number;
  bookedRooms?: number;
  selectedUnitIndex?: number;
  selectedUnitLabel?: string;
  images: string[];
  description: string;
  amenities: { icon: React.ElementType; label: string }[];
  reviews: RoomReview[];
  ratingBreakdown: { stars: number; count: number }[];
}

// ── Booking state shared across steps ──
export interface BookingState {
  step: number;
  selectedDate: string;
  selectedTime: string;
  selectedBoat: Boat | null;
  selectedRoom: RoomOption | null;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
}
