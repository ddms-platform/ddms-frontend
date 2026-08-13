import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface TripCartItem {
  tourId: string;
  tourName: string;
  price: number;
  imageUrl?: string;
}

interface TripCartValue {
  items: TripCartItem[];
  currentIndex: number;
  setCart: (items: TripCartItem[]) => void;
  clear: () => void;
  advance: () => TripCartItem | null;
  currentItem: TripCartItem | null;
  hasNext: boolean;
}

const TripCartContext = createContext<TripCartValue | null>(null);

export function TripCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TripCartItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setCart = useCallback((newItems: TripCartItem[]) => {
    setItems(newItems);
    setCurrentIndex(0);
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCurrentIndex(0);
  }, []);

  const advance = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= items.length) {
      setItems([]);
      setCurrentIndex(0);
      return null;
    }
    setCurrentIndex(next);
    return items[next];
  }, [currentIndex, items]);

  const currentItem = items[currentIndex] ?? null;
  const hasNext = currentIndex + 1 < items.length;

  return (
    <TripCartContext.Provider
      value={{
        items,
        currentIndex,
        setCart,
        clear,
        advance,
        currentItem,
        hasNext,
      }}
    >
      {children}
    </TripCartContext.Provider>
  );
}

export function useTripCart() {
  const ctx = useContext(TripCartContext);
  if (!ctx) throw new Error('useTripCart must be used inside TripCartProvider');
  return ctx;
}
