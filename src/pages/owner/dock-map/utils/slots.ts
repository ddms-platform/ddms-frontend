export interface DockSlot {
  id: string;
  x: number;
  y: number;
  rotate: number;
  pier: string;
}

const generateSlots = (): DockSlot[] => {
  const slots: DockSlot[] = [];
  const startX = 18;
  const gapX = 10;

  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `A${i + 1}`,
      x: startX + i * gapX,
      y: 8,
      rotate: 180,
      pier: 'Cầu tàu A (Phía trên)',
    });
    slots.push({
      id: `A${i + 9}`,
      x: startX + i * gapX,
      y: 32,
      rotate: 0,
      pier: 'Cầu tàu A (Phía dưới)',
    });
  }

  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `B${i + 1}`,
      x: startX + i * gapX,
      y: 53,
      rotate: 180,
      pier: 'Cầu tàu B (Phía trên)',
    });
    slots.push({
      id: `B${i + 9}`,
      x: startX + i * gapX,
      y: 77,
      rotate: 0,
      pier: 'Cầu tàu B (Phía dưới)',
    });
  }

  return slots;
};

export const ALL_SLOTS = generateSlots();
