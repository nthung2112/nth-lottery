import { ChangeEvent } from "react";
import localforage from "localforage";
import { toast } from "react-toastify";
import { ImageSync } from "@/components/image-sync";
import { useGlobalStore } from "@/store/global";
import { IImage } from "@/types/storeType";

const imageDbStore = localforage.createInstance({
  name: "imgStore",
});

const ToastMessage = {
  SUCCESS: "Upload successful",
  FAILED: "Upload failed",
  NOTMATCH: "Not a picture",
};
const limitType = "image/*";

export default function ImageConfig() {
  const { globalConfig, addImage, removeImage } = useGlobalStore();
  const { imageList } = globalConfig;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const isImage = /image*/.test(e.target.files[0].type);
    if (!isImage) {
      toast(ToastMessage.NOTMATCH);
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      const fileName = file.name;

      try {
        await imageDbStore.setItem(`${new Date().getTime().toString()}-${fileName}`, dataUrl);
        toast(ToastMessage.SUCCESS);
        getImageDbStore();
      } catch {
        toast(ToastMessage.FAILED);
      }
    };
    reader.readAsDataURL(file);
  };

  const getImageDbStore = async () => {
    const keys = await imageDbStore.keys();
    if (keys.length > 0) {
      imageDbStore.iterate((_value, key) => {
        if (imageList.some((item) => item.name === key)) {
          return;
        }
        addImage({
          id: key,
          name: key,
          url: "Storage",
        });
      });
    }
  };

  const handleRemoveImage = async (item: IImage) => {
    if (item.url === "Storage") {
      await imageDbStore.removeItem(item.id);
    }
    removeImage(item.id);
  };

  return (
    <div>
      <div>
        <label htmlFor="explore">
          <input
            type="file"
            id="explore"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept={limitType}
          />
          <span className="btn btn-primary btn-sm">Upload image</span>
        </label>
      </div>
      <ul className="menu p-0">
        {imageList.map((item) => (
          <li key={item.id} className="mb-3">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="avatar h-14">
                  <div className="w-12 h-12 mask mask-squircle hover:w-14 hover:h-14">
                    <ImageSync imgItem={item} />
                  </div>
                </div>
                <div className="w-64">
                  <div className="overflow-hidden font-bold whitespace-nowrap text-ellipsis">
                    {item.name}
                  </div>
                </div>
              </div>
              <button className="btn btn-error btn-xs" onClick={() => handleRemoveImage(item)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
