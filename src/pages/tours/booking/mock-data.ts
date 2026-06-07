import type { Boat, RoomOption } from './types';

// ── Tour ──
export const MOCK_TOUR = {
  title: '',
  price: 0,
  duration: '',
  maxGuests: 0,
};

export const AVAILABLE_DATES: string[] = [];

export const TIME_SLOTS: string[] = [];

// ── Boats ──
export const MOCK_BOATS: Boat[] = [];

// ── Rooms per boat ──
export const BOAT_ROOMS: Record<string, RoomOption[]> = {};

export const DEFAULT_BOAT_ROOMS: RoomOption[] = [];
