import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import localforage from "localforage";
import { useGlobalStore } from "@/store/global";
import { IMusic } from "@/types/storeType";
import { SvgIcon } from "./svg-icon";

const audioDbStore = localforage.createInstance({
  name: "audioStore",
});

export function PlayMusic() {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(new Audio());
  const settingRef = useRef<HTMLDivElement>(null);

  const {
    globalConfig: { musicList: localMusicList },
    currentMusic,
    setCurrentMusic,
  } = useGlobalStore();

  const play = async (item: IMusic) => {
    if (!item) return;
    if (!item.url) return;

    const audioUrl =
      item.url === "Storage"
        ? ((await audioDbStore.getItem(item.name)) as string)
        : import.meta.env.VITE_BASE_URL.slice(0, -1) + item.url;

    audioRef.current.pause();
    audioRef.current.src = audioUrl;
    audioRef.current.play();
  };

  const playMusic = (item: IMusic, skip = false) => {
    if (!item) return;
    if (!currentMusic.paused && !skip) {
      setCurrentMusic(item, true);
      return;
    }
    setCurrentMusic(item, false);
  };

  const nextPlay = () => {
    if (localMusicList.length < 1) {
      return;
    }
    let index = localMusicList.findIndex((item: IMusic) => item.name === currentMusic.item.name);
    index++;
    if (index >= localMusicList.length) {
      index = 0;
    }
    setCurrentMusic(localMusicList[index], false);
  };

  useEffect(() => {
    // Mount
    setCurrentMusic(localMusicList[0], true);
    // audioRef.current.addEventListener("ended", nextPlay);

    // // Unmount
    // return () => {
    //   audioRef.current.removeEventListener("ended", nextPlay);
    // };
  }, []);

  useEffect(() => {
    if (!currentMusic.paused && audioRef.current) {
      play(currentMusic.item);
    } else {
      audioRef.current.pause();
    }
  }, [currentMusic]);

  const enterConfig = () => navigate("/config");

  const enterHome = () => navigate("/");

  return (
    <div className="flex flex-col gap-3" ref={settingRef}>
      {location.pathname.includes("/config") ? (
        <div className="tooltip tooltip-left" data-tip="Home page">
          <div
            className="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
            onClick={enterHome}
          >
            <SvgIcon name="House" />
          </div>
        </div>
      ) : (
        <div className="tooltip tooltip-left" data-tip="Settings/Configs">
          <div
            className="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
            onClick={enterConfig}
          >
            <SvgIcon name="Settings" />
          </div>
        </div>
      )}

      <div
        className="tooltip tooltip-left before:whitespace-pre-wrap before:content-[attr(data-tip)]"
        data-tip={
          currentMusic.item
            ? `${currentMusic.item.name}\n Right click to play next song`
            : "No music to play"
        }
      >
        <div
          className="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
          onClick={() => playMusic(currentMusic.item)}
          onContextMenu={(e) => {
            e.preventDefault();
            nextPlay();
          }}
        >
          <SvgIcon name={currentMusic.paused ? "Play" : "Pause"} />
        </div>
      </div>
    </div>
  );
}
