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
          if (!storeId || storeId.trim() === '') {
            throw new Error("Store ID is required to create a cart");
          }
          
          const response = await api.createCart({ storeId });
          
          // Handle different response formats
          let cartData: any;
          if (typeof response === 'object' && response !== null) {
            cartData = (response as any).data || response;
          } else {
            throw new Error("Invalid response format from cart creation API");
          }
          
          const newCartId = cartData?.id || cartData?._id;
          
          if (!newCartId || (typeof newCartId === 'string' && newCartId.trim() === '')) {
            console.error("Cart creation response:", response);
            throw new Error("Cart ID not returned from server. Please try again.");
          }
          
          // Ensure cartId is a string
          const cartIdString = String(newCartId).trim();
          
          // Set cartId in state immediately
          set({ cartId: cartIdString });
          
          return cartIdString;
        } catch (error: any) {
          console.error("Failed to create backend cart:", error);
          const errorMessage = error?.message || "Failed to create cart. Please try again.";
          // Re-throw the error so syncWithBackend can handle it
          throw new Error(errorMessage);
        }
      },

      syncWithBackend: async () => {
        const state = get();
        if (state.isSyncing || !state.vendorId || state.items.length === 0) {
          // If already syncing, wait for it to complete
          if (state.isSyncing) {
            // Wait for sync to complete (max 5 seconds)
            let attempts = 0;
            while (get().isSyncing && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
          }
          return;
        }

        set({ isSyncing: true });
        
        try {
          let cartId = state.cartId;
          
          // Create backend cart if it doesn't exist
          if (!cartId) {
            cartId = await get().createBackendCart(state.vendorId);
            if (!cartId || cartId.trim() === '') {
              throw new Error("Failed to create cart. Please try again.");
            }
            // Ensure cartId is immediately set in state
            set({ cartId });
            // Wait a bit for state to persist
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Double-check cartId is still valid after state update
          const currentState = get();
          const finalCartId = currentState.cartId || cartId;
          
          if (!finalCartId || finalCartId.trim() === '') {
            throw new Error("Cart ID is missing after creation. Please try again.");
          }

          // Sync each item in the cart with the backend
          for (const item of currentState.items) {
            try {
              await api.addCartItem(finalCartId, {
                itemId: item.id,
                quantity: item.quantity
              });
            } catch (error) {
              console.error(`Failed to sync item ${item.id}:`, error);
              // Continue with other items even if one fails
            }
          }

          // Final verification that cartId is set
          const finalState = get();
          if (!finalState.cartId || finalState.cartId.trim() === '') {
            set({ cartId: finalCartId });
          }
        } catch (error) {
          console.error("Failed to sync cart with backend:", error);
          // Re-throw the error so caller can handle it
          throw error;
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


