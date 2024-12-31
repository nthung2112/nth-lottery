import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { themeChange } from "theme-change";

import { useGlobalStore } from "@/store/global";

import { PlayMusic } from "./play-music";
import { SvgIcon } from "./svg-icon";

const useScroll = (ref: React.RefObject<HTMLElement | null>) => {
  const [y, setY] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      setY(element.scrollTop);
    };

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [ref]);

  return { y, setY };
};

export function Layout() {
  const mainContainer = useRef<HTMLElement>(null);
  const { y, setY } = useScroll(mainContainer);
  const { globalConfig } = useGlobalStore();

  const scrollToTop = () => {
    setY(0);
    mainContainer.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    themeChange(globalConfig.theme as any);
  }, []);

  return (
    <div className="w-screen h-screen">
      {y > 400 && (
        <div
          className="fixed z-50 flex items-center justify-center w-10 h-10 rounded-full shadow-lg cursor-pointer right-12 bottom-12 bg-slate-700 hover:bg-slate-600"
          onClick={scrollToTop}
        >
          <SvgIcon name="CircleArrowUp" />
        </div>
      )}
      <main
        ref={mainContainer}
        className="box-content w-screen h-screen overflow-x-hidden overflow-y-auto"
      >
        <Outlet />
        <ToastContainer />
      </main>
      <div className="absolute right-0 bottom-1/2">
        <PlayMusic />
      </div>
    </div>
  );
}
