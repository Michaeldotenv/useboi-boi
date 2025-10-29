"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "./api";

export type CartItem = {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  options?: Record<string, any>;
};

type CartState = {
  items: CartItem[];
  vendorId: string | null; // lock cart to a single vendor at a time
  cartId: string | null; // backend cart ID
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  syncWithBackend: () => Promise<void>;
  createBackendCart: (storeId: string) => Promise<string | null>;
  totalQuantity: () => number;
  subtotal: () => number;
};

// Generate a MongoDB-compatible ObjectID (24 hex characters)
function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomBytes = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return (timestamp + randomBytes).substring(0, 24);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,
      cartId: null,
      isSyncing: false,
      
      addItem: async (incoming, quantity = 1) => {
        set((state) => {
          // If cart has a different vendor, reset it to avoid cross-merchant orders
          if (state.vendorId && state.vendorId !== incoming.vendorId) {
            return {
              items: [{ ...incoming, quantity }],
              vendorId: incoming.vendorId,
              cartId: null, // Will be created during sync
            } as CartState;
          }

          const existing = state.items.find((it) => it.id === incoming.id);
          if (existing) {
            return {
              ...state,
              items: state.items.map((it) =>
                it.id === incoming.id ? { ...it, quantity: it.quantity + quantity } : it
              ),
            };
          }
          
          return {
            ...state,
            vendorId: state.vendorId ?? incoming.vendorId,
            items: [...state.items, { ...incoming, quantity }],
          };
        });

        // Sync with backend after local update
        const state = get();
        if (state.vendorId && state.items.length > 0) {
          await get().syncWithBackend();
        }
      },
      
      removeItem: async (id) => {
        set((state) => {
          const next = state.items.filter((it) => it.id !== id);
          return {
            ...state,
            items: next,
            vendorId: next.length ? state.vendorId : null,
            cartId: next.length ? state.cartId : null,
          };
        });

        // Sync with backend after local update
        const state = get();
        if (state.cartId) {
          await get().syncWithBackend();
        }
      },
      
      clearCart: () => set({ items: [], vendorId: null, cartId: null }),
      
      increment: async (id) => {
        set((state) => ({
          ...state,
          items: state.items.map((it) => (it.id === id ? { ...it, quantity: it.quantity + 1 } : it)),
        }));

        // Sync with backend after local update
        const state = get();
        if (state.cartId) {
          await get().syncWithBackend();
        }
      },
      
      decrement: async (id) => {
        set((state) => ({
          ...state,
          items: state.items
            .map((it) => (it.id === id ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))
            .filter(Boolean) as CartItem[],
        }));

        // Sync with backend after local update
        const state = get();
        if (state.cartId) {
          await get().syncWithBackend();
        }
      },

      createBackendCart: async (storeId: string) => {
        try {
          const response = await api.createCart({ storeId });
          const cartData = (response as any).data || response;
          const newCartId = cartData.id;
          set({ cartId: newCartId });
          return newCartId;
        } catch (error) {
          console.error("Failed to create backend cart:", error);
          // If backend creation fails, we already have a client-side ID
          return get().cartId;
        }
      },

      syncWithBackend: async () => {
        const state = get();
        if (state.isSyncing || !state.vendorId || state.items.length === 0) return;

        set({ isSyncing: true });
        
        try {
          let cartId = state.cartId;
          
          // Create backend cart if it doesn't exist
          if (!cartId) {
            cartId = await get().createBackendCart(state.vendorId);
            if (!cartId) {
              throw new Error("Failed to get cart ID");
            }
          }

          // Sync each item in the cart with the backend
          for (const item of state.items) {
            try {
              await api.addCartItem(cartId, {
                itemId: item.id,
                quantity: item.quantity
              });
            } catch (error) {
              console.error(`Failed to sync item ${item.id}:`, error);
            }
          }
        } catch (error) {
          console.error("Failed to sync cart with backend:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      totalQuantity: () => get().items.reduce((sum, it) => sum + it.quantity, 0),
      subtotal: () => get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    }),
    {
      name: "boiboi_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items, 
        vendorId: state.vendorId, 
        cartId: state.cartId 
      }),
    }
  )
);


