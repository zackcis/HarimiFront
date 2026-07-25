'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type CartLine = {
  variantId: number;
  productId: number;
  productSlug: string;
  title: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  unitPrice: string;
  imageUrl: string | null;
  quantity: number;
};

type OpenMiniCartOptions = {
  /** Auto-dismiss after a short preview (used after add-to-bag). */
  autoClose?: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** True after the first localStorage hydrate — wait before clear-on-paid. */
  ready: boolean;
  miniCartOpen: boolean;
  /** Most recently added variant — highlighted in the mini cart. */
  lastAddedVariantId: number | null;
  openMiniCart: (options?: OpenMiniCartOptions) => void;
  closeMiniCart: () => void;
  addItem: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  updateQty: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'harimi.cart.v1';
const AUTO_CLOSE_MS = 2800;

function writeStorage(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // private mode / quota — ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [lastAddedVariantId, setLastAddedVariantId] = useState<number | null>(null);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoClose = useCallback(() => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
  }, []);

  const closeMiniCart = useCallback(() => {
    clearAutoClose();
    setMiniCartOpen(false);
  }, [clearAutoClose]);

  const openMiniCart = useCallback(
    (options?: OpenMiniCartOptions) => {
      clearAutoClose();
      setMiniCartOpen(true);
      if (options?.autoClose) {
        autoCloseTimer.current = setTimeout(() => {
          setMiniCartOpen(false);
          autoCloseTimer.current = null;
        }, AUTO_CLOSE_MS);
      }
    },
    [clearAutoClose],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          setLines(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStorage(lines);
  }, [lines, ready]);

  useEffect(
    () => () => {
      clearAutoClose();
    },
    [clearAutoClose],
  );

  const addItem = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.variantId === line.variantId);
        if (existing) {
          return prev.map((l) =>
            l.variantId === line.variantId
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          );
        }
        return [...prev, { ...line, quantity }];
      });
      setLastAddedVariantId(line.variantId);
      openMiniCart({ autoClose: true });
    },
    [openMiniCart],
  );

  const updateQty = useCallback((variantId: number, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.variantId === variantId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    // Persist immediately so a late hydrate (or remount) cannot resurrect the bag.
    writeStorage([]);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      ready,
      miniCartOpen,
      lastAddedVariantId,
      openMiniCart,
      closeMiniCart,
      addItem,
      updateQty,
      removeItem,
      clear,
    }),
    [
      lines,
      ready,
      miniCartOpen,
      lastAddedVariantId,
      openMiniCart,
      closeMiniCart,
      addItem,
      updateQty,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
