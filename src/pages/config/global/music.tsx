import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import localforage from "localforage";
import { toast } from "react-toastify";

import { IMusic } from "@/types/storeType";
import { readFileData } from "@/utils/file";
import { useGlobalStore } from "@/store/global";

const audioDbStore = localforage.createInstance({
  name: "audioStore",
});

export default function MusicConfig() {
  const { t } = useTranslation();
  const {
    globalConfig: { musicList },
    setCurrentMusic,
    removeMusic,
    resetMusicList,
    clearMusicList,
    addMusic,
  } = useGlobalStore();

  const play = async (item: IMusic) => {
    setCurrentMusic(item, false);
  };

  const deleteMusic = (item: IMusic) => {
    removeMusic(item.id);
    audioDbStore.removeItem(item.name);
  };

  const resetMusic = () => {
    resetMusicList();
    audioDbStore.clear();
  };

  const deleteAll = () => {
    clearMusicList();
    audioDbStore.clear();
  };

  const getMusicDbStore = async () => {
    const keys = await audioDbStore.keys();
    if (keys.length > 0) {
      audioDbStore.iterate((_value: string, key: string) => {
        if (musicList.some((item) => item.name === key)) {
          return;
        }
        addMusic({
          id: key + new Date().getTime().toString(),
          name: key,
          url: "Storage",
        });
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const isAudio = /audio*/.test(e.target.files[0].type);
    if (!isAudio) {
      toast(t("music.notAudioFile"));
      return;
    }

    const { dataUrl, fileName } = await readFileData(e.target.files[0]);
    audioDbStore
      .setItem(`${new Date().getTime().toString()}-${fileName}`, dataUrl)
      .then(() => {
        toast(t("music.uploadSuccess"));
        getMusicDbStore();
      })
      .catch(() => {
        toast(t("music.uploadFailed"));
      });
  };

  useEffect(() => {
    getMusicDbStore();
  }, []);

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <button className="btn btn-primary btn-sm" onClick={resetMusic}>
          {t("music.resetMusicList")}
        </button>
        <label htmlFor="explore">
          <input
            type="file"
            id="explore"
            accept="audio/mp3,audio/*;"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <span className="btn btn-primary btn-sm">{t("music.uploadMusic")}</span>
        </label>
        <button className="btn btn-error btn-sm" onClick={deleteAll}>
          {t("music.deleteAll")}
        </button>
      </div>
      <div>
        <ul className="p-0">
          {musicList.map((item) => (
            <li key={item.id} className="flex items-center gap-6 pb-2 mb-3">
              <div className="mr-12 overflow-hidden w-72 whitespace-nowrap text-ellipsis">
                <span>{item.name}</span>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary btn-xs" onClick={() => play(item)}>
                  {t("music.play")}
                </button>
                <button className="btn btn-error btn-xs" onClick={() => deleteMusic(item)}>
                  {t("music.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
