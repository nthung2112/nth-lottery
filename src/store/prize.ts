import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IPrizeConfig } from "@/types/storeType";
import { defaultPrizeList, defaultCurrentPrize } from "./data";

interface PrizeState {
  prizeConfig: {
    prizeList: IPrizeConfig[];
    currentPrize: IPrizeConfig;
    temporaryPrize: IPrizeConfig;
  };
  setPrizeList: (prizeList: IPrizeConfig[]) => void;
  addPrizeConfig: (prizeConfigItem: IPrizeConfig) => void;
  deletePrizeConfig: (prizeConfigItemId: number | string) => void;
  updatePrizeConfig: (prizeConfigItem: IPrizeConfig) => void;
  deleteAllPrizeConfig: () => void;
  setCurrentPrize: (prizeConfigItem: IPrizeConfig) => void;
  setTemporaryPrize: (prizeItem: IPrizeConfig) => void;
  setTemporaryPrizeValue: (prizeItem: IPrizeConfig) => void;
  resetTemporaryPrize: () => void;
  resetDefault: () => void;
  resetPrizeUsage: () => void;
  removePrizeUsage: (prizeIds: string[]) => void;
}

const initialTemporaryPrize: IPrizeConfig = {
  id: "",
  name: "",
  sort: 0,
  isAll: false,
  count: 1,
  isUsedCount: 0,
  picture: {
    id: "-1",
    name: "",
    url: "",
  },
  separateCount: {
    enable: true,
    countList: [],
  },
  desc: "",
  isShow: false,
  isUsed: false,
  frequency: 1,
};

const initialState = {
  prizeConfig: {
    prizeList: defaultPrizeList,
    currentPrize: defaultCurrentPrize,
    temporaryPrize: initialTemporaryPrize,
  },
};

export const usePrizeStore = create<PrizeState>()(
  persist(
    immer((set, _get) => ({
      ...initialState,

      setPrizeList: (prizeList) =>
        set((state) => {
          state.prizeConfig.prizeList = prizeList;
        }),

      addPrizeConfig: (prizeConfigItem) =>
        set((state) => {
          state.prizeConfig.prizeList.push(prizeConfigItem);
        }),

      deletePrizeConfig: (prizeConfigItemId) =>
        set((state) => {
          state.prizeConfig.prizeList = state.prizeConfig.prizeList.filter(
            (item) => item.id !== prizeConfigItemId
          );
        }),

      updatePrizeConfig: (prizeConfigItem) =>
        set((state) => {
          if (state.prizeConfig.temporaryPrize.isShow) {
            state.prizeConfig.temporaryPrize = prizeConfigItem;
          }

          if (!(prizeConfigItem.isUsed && state.prizeConfig.prizeList.length)) {
            return;
          }
          const nextPrize = state.prizeConfig.prizeList.find(
            (item) => !item.isUsed && item.id !== prizeConfigItem.id
          );
          if (nextPrize) {
            state.prizeConfig.currentPrize = nextPrize;
          }

          if (state.prizeConfig.temporaryPrize.isShow) {
            state.prizeConfig.temporaryPrize = initialTemporaryPrize;
          }
        }),

      deleteAllPrizeConfig: () =>
        set((state) => {
          state.prizeConfig.prizeList = [];
        }),

      setCurrentPrize: (prizeConfigItem) =>
        set((state) => {
          state.prizeConfig.currentPrize = prizeConfigItem;
          const currentIndex = state.prizeConfig.prizeList.findIndex(
            (item) => item.id === prizeConfigItem.id
          );
          if (currentIndex > -1) {
            state.prizeConfig.prizeList[currentIndex] = prizeConfigItem;
          }
        }),

      setTemporaryPrize: (prizeItem) =>
        set((state) => {
          if (!prizeItem.isShow) {
            const nextPrize = state.prizeConfig.prizeList.find((item) => !item.isUsed);
            if (nextPrize) {
              state.prizeConfig.currentPrize = nextPrize;
            }
            state.prizeConfig.temporaryPrize = initialTemporaryPrize;
            return;
          }
          state.prizeConfig.temporaryPrize = prizeItem;
        }),

      setTemporaryPrizeValue: (prizeItem) =>
        set((state) => {
          state.prizeConfig.temporaryPrize = prizeItem;
        }),

      resetTemporaryPrize: () =>
        set((state) => {
          state.prizeConfig.temporaryPrize = initialTemporaryPrize;
        }),

      resetDefault: () => set(() => initialState),
      resetPrizeUsage: () =>
        set((state) => {
          state.prizeConfig.prizeList.forEach((item) => {
            item.isUsedCount = 0;
            item.isUsed = false;
            if (item.separateCount && item.separateCount.countList) {
              item.separateCount.countList.forEach((countItem) => {
                countItem.isUsedCount = 0;
              });
            }
          });
          // Also reset currentPrize if it was marked as used
          const firstPrize = state.prizeConfig.prizeList[0];
          if (firstPrize) {
            state.prizeConfig.currentPrize = firstPrize;
          }
        }),
      removePrizeUsage: (prizeIds) =>
        set((state) => {
          if (prizeIds.length <= 0) return;
          prizeIds.forEach((prizeId) => {
            const prizeIndex = state.prizeConfig.prizeList.findIndex((p) => p.id === prizeId);
            if (prizeIndex <= -1) {
              return;
            }
            const prize = state.prizeConfig.prizeList[prizeIndex];
            // Decrement the used count
            prize.isUsedCount = Math.max(0, prize.isUsedCount - 1);
            prize.isUsed = prize.isUsedCount < prize.count ? false : prize.isUsed;

            // Update separateCount if it exists
            if (prize.separateCount?.enable && prize.separateCount.countList.length > 0) {
              // Find the last non-zero countList item and decrement it
              const countList = prize.separateCount.countList;
              for (let i = countList.length - 1; i >= 0; i--) {
                if (countList[i].isUsedCount > 0) {
                  countList[i].isUsedCount = Math.max(0, countList[i].isUsedCount - 1);
                  break;
                }
              }
            }

            // Update currentPrize if it matches the one we just changed
            if (state.prizeConfig.currentPrize.id === prizeId) {
              state.prizeConfig.currentPrize = prize;
            }
          });
        }),
    })),
    {
      name: "prize-storage",
      partialize: (state) => ({ prizeConfig: state.prizeConfig }),
    }
  )
);

// Selectors
export const getPrizeConfigById = (id: number | string) =>
  usePrizeStore.getState().prizeConfig.prizeList.find((item) => item.id === id);
