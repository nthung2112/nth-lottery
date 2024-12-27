import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SystemState {
  isMobile: boolean;
  isChrome: boolean;
  setIsMobile: (isMobile: boolean) => void;
  setIsChrome: (isChrome: boolean) => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      isMobile: false,
      isChrome: true,
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
      setIsChrome: (isChrome: boolean) => set({ isChrome }),
    }),
    {
      name: "system-storage",
    }
  )
);
