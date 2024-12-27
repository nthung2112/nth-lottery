import { useEffect, useRef, useState } from "react";
import Sparticles from "sparticles";
import localforage from "localforage";

interface HomeBackgroundProps {
  id: string;
  name: string;
  url: string;
}

interface StarsBackgroundProps {
  homeBackground: HomeBackgroundProps;
}

const imageDbStore = localforage.createInstance({
  name: "imgStore",
});

export function StarsBackground({
  homeBackground = { id: "", name: "", url: "" },
}: StarsBackgroundProps) {
  const [imgUrl, setImgUrl] = useState<string>("");
  const starRef = useRef<HTMLDivElement>(null);

  const options = {
    shape: "star",
    parallax: 1.2,
    rotate: true,
    twinkle: true,
    speed: 10,
    count: 200,
  };

  const addSparticles = (node: HTMLElement, width: number, height: number) => {
    new Sparticles(node, options, width, height);
  };

  const handleResize = () => {
    if (!starRef.current) {
      return;
    }
    const { clientWidth, clientHeight } = starRef.current;
    addSparticles(starRef.current, clientWidth, clientHeight);
  };

  const getImageStoreItem = async (item: HomeBackgroundProps): Promise<string> => {
    if (item.url === "Storage") {
      const key = item.id;
      return (await imageDbStore.getItem(key)) as string;
    } else {
      return item.url;
    }
  };

  useEffect(() => {
    getImageStoreItem(homeBackground).then((image) => {
      setImgUrl(image);
    });

    if (starRef.current) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [homeBackground]);

  if (homeBackground.url) {
    return (
      <div className="home-background w-screen h-screen overflow-hidden">
        <img src={imgUrl} className="w-full h-full object-cover" alt="" />
      </div>
    );
  }

  return <div className="w-screen h-screen overflow-hidden" ref={starRef} />;
}
