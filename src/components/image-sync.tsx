import { useEffect, useState } from "react";
import localforage from "localforage";

interface ImageItem {
  id: string;
  name: string;
  url: string;
}

interface ImageSyncProps {
  imgItem: ImageItem;
}

const imageDbStore = localforage.createInstance({
  name: "imgStore",
});

export function ImageSync({ imgItem }: ImageSyncProps) {
  const [imgUrl, setImgUrl] = useState<string>(imgItem.url || "");

  useEffect(() => {
    const loadImage = async () => {
      if (imgItem.url === "Storage") {
        const url = (await imageDbStore.getItem(imgItem.id)) as string;
        setImgUrl(url);
      } else {
        setImgUrl(import.meta.env.VITE_BASE_URL.slice(0, -1) + imgItem.url);
      }
    };
    loadImage();
  }, [imgItem]);

  return <img src={imgUrl} alt="Image" className="object-cover h-full rounded-xl" />;
}
