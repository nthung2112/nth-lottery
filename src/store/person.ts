import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IPersonConfig, IPrizeConfig } from "@/types/storeType";
import { defaultPersonList } from "./data";
import { usePrizeStore } from "./prize";
import dayjs from "dayjs";

export interface PersonConfigState {
  allPersonList: IPersonConfig[];
  alreadyPersonList: IPersonConfig[];
}

export interface PersonState {
  personConfig: PersonConfigState;
  addNotPersonList: (personList: IPersonConfig[]) => void;
  addAlreadyPersonList: (personList: IPersonConfig[], prize: IPrizeConfig | null) => void;
  moveAlreadyToNot: (person: IPersonConfig) => void;
  deletePerson: (person: IPersonConfig) => void;
  deleteAllPerson: () => void;
  resetPerson: () => void;
  resetAlreadyPerson: () => void;
  setDefaultPersonList: () => void;
  reset: () => void;
}

const initialState = {
  personConfig: {
    allPersonList: [],
    alreadyPersonList: [],
  },
};

export const usePersonStore = create<PersonState>()(
  persist(
    immer((set, _get) => ({
      ...initialState,

      addNotPersonList: (personList) =>
        set((state) => {
          if (personList.length <= 0) return;
          personList.forEach((item) => {
            state.personConfig.allPersonList.push(item);
          });
        }),

      addAlreadyPersonList: (personList, prize) =>
        set((state) => {
          if (personList.length <= 0) return;
          personList.forEach((person) => {
            state.personConfig.allPersonList.forEach((item) => {
              if (item.id === person.id && prize) {
                item.isWin = true;
                item.prizeName.push(prize.name);
                item.prizeTime.push(dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"));
                item.prizeId.push(prize.id as string);
              }
            });
            state.personConfig.alreadyPersonList.push(person);
          });
        }),

      moveAlreadyToNot: (person) =>
        set((state) => {
          if (!person.id) return;
          state.personConfig.allPersonList.forEach((item) => {
            if (item.id === person.id) {
              item.isWin = false;
              item.prizeName = [];
              item.prizeTime = [];
              item.prizeId = [];
            }
          });
          state.personConfig.alreadyPersonList = state.personConfig.alreadyPersonList.filter(
            (item) => item.id !== person.id
          );
        }),

      deletePerson: (person) =>
        set((state) => {
          if (!person.id) return;
          state.personConfig.allPersonList = state.personConfig.allPersonList.filter(
            (item) => item.id !== person.id
          );
          state.personConfig.alreadyPersonList = state.personConfig.alreadyPersonList.filter(
            (item) => item.id !== person.id
          );
        }),

      deleteAllPerson: () =>
        set((state) => {
          state.personConfig.allPersonList = [];
          state.personConfig.alreadyPersonList = [];
        }),

      resetPerson: () =>
        set((state) => {
          state.personConfig.allPersonList = [];
          state.personConfig.alreadyPersonList = [];
        }),

      resetAlreadyPerson: () =>
        set((state) => {
          state.personConfig.allPersonList.forEach((item) => {
            item.isWin = false;
            item.prizeName = [];
            item.prizeTime = [];
            item.prizeId = [];
          });
          state.personConfig.alreadyPersonList = [];
        }),

      setDefaultPersonList: () =>
        set((state) => {
          state.personConfig.allPersonList = defaultPersonList;
          state.personConfig.alreadyPersonList = [];
        }),

      reset: () => set(initialState),
    })),
    {
      name: "person-storage",
      partialize: (state) => ({ personConfig: state.personConfig }),
    }
  )
);

// Selectors
export const getAllPersonList = (state: PersonState) =>
  state.personConfig.allPersonList.filter((item) => item);

export const getNotThisPrizePersonList = (personConfig: PersonConfigState) => {
  const currentPrize = usePrizeStore.getState().prizeConfig.currentPrize;
  return personConfig.allPersonList.filter(
    (item) => !item.prizeId.includes(currentPrize.id as string)
  );
};

export const getAlreadyPersonList = (state: PersonState) =>
  state.personConfig.allPersonList.filter((item) => item.isWin === true);

export const getNotPersonList = (personConfig: PersonConfigState) =>
  personConfig.allPersonList.filter((item) => item.isWin === false);

export const getAlreadyPersonDetail = (state: PersonState) => state.personConfig.alreadyPersonList;
