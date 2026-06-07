// ── Types matching database schema ──

export type BoatStatus = 'idle' | 'running';

export interface BoatCabin {
  id: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export interface BoatService {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface BoatImage {
  id: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
}

export interface BoatMaintenance {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface OwnerBoat {
  id: string;
  name: string;
  type: string;
  maxPassengers: number;
  status: BoatStatus;
  createdAt: string;
  updatedAt: string;
  cabins: BoatCabin[];
  services: BoatService[];
  images: BoatImage[];
  maintenances: BoatMaintenance[];
  // Computed / aggregated
  totalCabins: number;
  totalServices: number;
  activeTours: number;
  totalBookings: number;
  revenue: number;
}

// ── Boat Types ──
export const BOAT_TYPES = [
  { value: 'cruise', label: 'Du thuyền' },
  { value: 'standard', label: 'Thuyền tiêu chuẩn' },
  { value: 'luxury', label: 'Cao cấp' },
  { value: 'party', label: 'Thuyền tiệc' },
  { value: 'speedboat', label: 'Ca nô cao tốc' },
] as const;

// ── Mock Data ──
export const MOCK_OWNER_BOATS: OwnerBoat[] = [];
