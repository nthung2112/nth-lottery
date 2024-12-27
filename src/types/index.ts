export interface MusicItem {
  name: string;
  url: string;
}

export interface CurrentMusic {
  item: MusicItem;
  paused: boolean;
}