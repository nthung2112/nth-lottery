import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { defaultMusicList, defaultImageList, defaultPatternList } from "./data";
import { IMusic, IImage } from "@/types/storeType";

export interface Theme {
  name: string;
  detail: { primary: string };
  cardColor: string;
  cardWidth: number;
  cardHeight: number;
  textColor: string;
  luckyCardColor: string;
  textSize: number;
  patternColor: string;
  patternList: number[];
  background: any;
}

export interface GlobalConfig {
  rowCount: number;
  isSHowPrizeList: boolean;
  topTitle: string;
  theme: Theme;
  musicList: IMusic[];
  imageList: IImage[];
}

export interface CurrentMusic {
  item: IMusic;
  paused: boolean;
}

export interface GlobalState {
  globalConfig: GlobalConfig;
  currentMusic: CurrentMusic;
  setRowCount: (count: number) => void;
  setTopTitle: (title: string) => void;
  setTheme: (theme: Pick<Theme, "name" | "detail">) => void;
  setCardColor: (color: string) => void;
  setLuckyCardColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setCardSize: (size: { width: number; height: number }) => void;
  setTextSize: (size: number) => void;
  setPatterColor: (color: string) => void;
  setPatternList: (list: number[]) => void;
  resetPatternList: () => void;
  addMusic: (music: IMusic) => void;
  removeMusic: (musicId: string) => void;
  setCurrentMusic: (musicItem: IMusic, paused?: boolean) => void;
  resetMusicList: () => void;
  clearMusicList: () => void;
  addImage: (image: IImage) => void;
  removeImage: (imageId: string) => void;
  resetImageList: () => void;
  clearImageList: () => void;
  setIsShowPrizeList: (show: boolean) => void;
  setBackground: (background: Record<string, any>) => void;
  reset: () => void;
}

const initialState = {
  globalConfig: {
    rowCount: 17,
    isSHowPrizeList: true,
    topTitle: "NTH Lottery",
    theme: {
      name: "dracula",
      detail: { primary: "#0f5fd3" },
      cardColor: "#ff79c6",
      cardWidth: 140,
      cardHeight: 200,
      textColor: "#ffffff",
      luckyCardColor: "#ECB1AC",
      textSize: 30,
      patternColor: "#1b66c9",
      patternList: defaultPatternList,
      background: {},
    },
    musicList: defaultMusicList,
    imageList: defaultImageList,
  },
  currentMusic: {
    item: defaultMusicList[0],
    paused: true,
  },
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setRowCount: (count) =>
        set((state) => {
          state.globalConfig.rowCount = count;
        }),

      setTopTitle: (title) =>
        set((state) => {
          state.globalConfig.topTitle = title;
        }),

      setTheme: (theme) =>
        set((state) => {
          Object.assign(state.globalConfig.theme, theme);
        }),

      setCurrentMusic: (musicItem, paused = true) =>
        set((state) => {
          state.currentMusic = { item: musicItem, paused };
        }),

      setCardColor: (color) =>
        set((state) => {
          state.globalConfig.theme.cardColor = color;
        }),

      setLuckyCardColor: (color) =>
        set((state) => {
          state.globalConfig.theme.luckyCardColor = color;
        }),

      setTextColor: (color) =>
        set((state) => {
          state.globalConfig.theme.textColor = color;
        }),

      setCardSize: (size) =>
        set((state) => {
          state.globalConfig.theme.cardWidth = size.width;
          state.globalConfig.theme.cardHeight = size.height;
        }),

      setTextSize: (size) =>
        set((state) => {
          state.globalConfig.theme.textSize = size;
        }),

      setPatterColor: (color) =>
        set((state) => {
          state.globalConfig.theme.patternColor = color;
        }),

      setPatternList: (list) =>
        set((state) => {
          state.globalConfig.theme.patternList = list;
        }),

      resetPatternList: () =>
        set((state) => {
          state.globalConfig.theme.patternList = defaultPatternList;
        }),

      addMusic: (music) =>
        set((state) => {
          state.globalConfig.musicList.push(music);
        }),

      removeMusic: (musicId) =>
        set((state) => {
          state.globalConfig.musicList = state.globalConfig.musicList.filter(
            (music) => music.id !== musicId
          );
        }),

      resetMusicList: () =>
        set((state) => {
          state.globalConfig.musicList = defaultMusicList;
        }),

      clearMusicList: () =>
        set((state) => {
          state.globalConfig.musicList = [];
        }),

      addImage: (image) =>
        set((state) => {
          state.globalConfig.imageList.push(image);
        }),

      removeImage: (imageId) =>
        set((state) => {
          state.globalConfig.imageList = state.globalConfig.imageList.filter(
            (image) => image.id !== imageId
          );
        }),

      resetImageList: () =>
        set((state) => {
          state.globalConfig.imageList = defaultImageList;
        }),

      clearImageList: () =>
        set((state) => {
          state.globalConfig.imageList = [];
        }),

      setIsShowPrizeList: (show) =>
        set((state) => {
          state.globalConfig.isSHowPrizeList = show;
        }),

      setBackground: (background) =>
        set((state) => {
          state.globalConfig.theme.background = background;
        }),

      reset: () => set(() => initialState),
    })),
    {
      name: "global-config-storage",
      partialize: (state) => ({ globalConfig: state.globalConfig }),
    }
  )
);
