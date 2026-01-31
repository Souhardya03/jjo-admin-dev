// stores/useScrollStore.ts
import { create } from "zustand";

type ScrollStore = {
  y: number;
  setY: (y: number) => void;
};

export const useScrollStore = create<ScrollStore>((set) => ({
  y: 0,
  setY: (y) => set({ y }),
}));
