import { useEffect, useRef, useState } from "react";

import { ImageSync } from "@/components/image-sync";
import { NumberSeparate } from "@/components/number-separate";
import { SvgIcon } from "@/components/svg-icon";
import { useGlobalStore } from "@/store/global";
import { usePrizeStore } from "@/store/prize";
import { useSystemStore } from "@/store/system";
import { IPrizeConfig } from "@/types/storeType";

import defaultPrizeImage from "../../assets/images/龙.png";

import "./prize-list.css";

export function PrizeList() {
  // Store
  const { prizeConfig, setTemporaryPrize, setTemporaryPrizeValue, setCurrentPrize } =
    usePrizeStore();
  const { prizeList, currentPrize, temporaryPrize } = prizeConfig;
  const { globalConfig } = useGlobalStore();
  const { imageList, isSHowPrizeList } = globalConfig;
  const { isMobile } = useSystemStore();

  // States
  const [prizeShow, setPrizeShow] = useState(isSHowPrizeList);
  const [selectedPrize, setSelectedPrize] = useState<IPrizeConfig | null>(null);

  // Refs
  const prizeListRef = useRef<HTMLUListElement>(null);
  const prizeListContainerRef = useRef<HTMLDivElement>(null);
  const temporaryPrizeRef = useRef<HTMLDialogElement>(null);

  // Methods
  const getPrizeListHeight = () => {
    if (prizeListRef.current) {
      return prizeListRef.current.offsetHeight;
    }
    return 200;
  };

  const addTemporaryPrize = () => {
    temporaryPrizeRef.current?.showModal();
  };

  const deleteTemporaryPrize = () => {
    setTemporaryPrize({
      ...temporaryPrize,
      isShow: false,
    });
  };

  const submitTemporaryPrize = () => {
    if (!temporaryPrize.name || !temporaryPrize.count) {
      alert("Please fill in complete information");
      return;
    }

    const newTemporaryPrize = {
      ...temporaryPrize,
      isShow: true,
      id: Date.now().toString(),
    };
    setCurrentPrize(newTemporaryPrize);
  };

  const selectPrize = (item: IPrizeConfig) => {
    const newSelectedPrize = {
      ...item,
      isUsedCount: 0,
      isUsed: false,
    };

    if (newSelectedPrize.separateCount.countList.length <= 1) {
      newSelectedPrize.separateCount = {
        enable: true,
        countList: [
          {
            id: "0",
            count: item.count,
            isUsedCount: 0,
          },
        ],
      };
    }

    setSelectedPrize(newSelectedPrize);
  };

  const submitData = (value: any) => {
    if (selectedPrize) {
      setSelectedPrize({
        ...selectedPrize,
        separateCount: {
          ...selectedPrize.separateCount,
          countList: value,
        },
      });
    }
    setSelectedPrize(null);
  };

  // const changePersonCount = () => {
  //   setTemporaryPrize({
  //     ...temporaryPrize,
  //     separateCount: {
  //       ...temporaryPrize.separateCount,
  //       countList: [],
  //     },
  //   });
  // };

  const handleChange = (field: string, value: string | number | boolean) => {
    setTemporaryPrizeValue({
      ...temporaryPrize,
      [field]: value,
    });
  };

  // Effects
  useEffect(() => {
    if (prizeListContainerRef.current) {
      prizeListContainerRef.current.style.height = `${getPrizeListHeight()}px`;
    }

    // Set initial current prize
    for (const prizeItem of prizeList) {
      if (prizeItem.isUsedCount < prizeItem.count) {
        setCurrentPrize(prizeItem);
        break;
      }
    }
  }, []);

  return (
    <div className="flex items-center">
      {/* Dialog */}
      <dialog id="my_modal_1" ref={temporaryPrizeRef} className="border-none modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add temporary lottery</h3>
          <div className="flex flex-col gap-3">
            <label className="flex w-full max-w-xs">
              <div className="label">
                <span className="label-text">Name:</span>
              </div>
              <input
                type="text"
                value={temporaryPrize.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Input name"
                className="max-w-xs input-sm input input-bordered"
              />
            </label>

            <label className="flex w-full max-w-xs">
              <div className="label">
                <span className="label-text">Whether all members participate</span>
              </div>
              <input
                type="checkbox"
                checked={temporaryPrize.isAll}
                onChange={() => handleChange("isAll", !temporaryPrize.isAll)}
                className="mt-2 border-solid checkbox checkbox-secondary border-1"
              />
            </label>

            <label className="flex w-full max-w-xs">
              <div className="label">
                <span className="label-text">Number of winners</span>
              </div>
              <input
                type="number"
                value={temporaryPrize.count}
                onChange={(e) => handleChange("count", parseInt(e.target.value))}
                placeholder="Number of winners"
                className="max-w-xs input-sm input input-bordered"
              />
            </label>

            <label className="flex w-full max-w-xs">
              <div className="label">
                <span className="label-text">Number of winners used</span>
              </div>
              <input
                disabled
                type="number"
                value={temporaryPrize.isUsedCount}
                placeholder="Number of winners"
                className="max-w-xs input-sm input input-bordered"
              />
            </label>

            {temporaryPrize.separateCount && (
              <label className="flex w-full max-w-xs">
                <div className="label">
                  <span className="label-text">The number of single draws</span>
                </div>
                <div
                  className="flex justify-start h-full"
                  onClick={() => selectPrize(temporaryPrize)}
                >
                  {temporaryPrize.separateCount.countList.length ? (
                    <ul className="flex flex-wrap w-full h-full gap-1 p-0 pt-1 m-0 cursor-pointer">
                      {temporaryPrize.separateCount.countList.map((se) => (
                        <li
                          key={se.id}
                          className="relative flex items-center justify-center w-8 h-8 bg-slate-600/60 separated"
                        >
                          <div
                            className="flex items-center justify-center w-full h-full tooltip"
                            data-tip={`已抽取:${se.isUsedCount}/${se.count}`}
                          >
                            <div
                              className="absolute left-0 z-50 h-full bg-blue-300/80"
                              style={{ width: `${(se.isUsedCount * 100) / se.count}%` }}
                            />
                            <span>{se.count}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button className="btn btn-secondary btn-xs">Set up</button>
                  )}
                </div>
              </label>
            )}

            <label className="flex w-full max-w-xs">
              <div className="label">
                <span className="label-text">Image</span>
              </div>
              <select
                className="flex-1 w-12 select select-warning select-sm"
                value={temporaryPrize.picture.id}
                onChange={(e) => handleChange("picture", e.target.value)}
              >
                {temporaryPrize.picture.id && <option value="">❌</option>}
                <option disabled>Choose a picture</option>
                {imageList.map((picItem) => (
                  <option key={picItem.id} value={picItem.id}>
                    {picItem.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="modal-action">
            <form method="dialog" className="flex gap-3">
              <button className="btn btn-sm" onClick={submitTemporaryPrize}>
                Are you sure
              </button>
              <button className="btn btn-sm">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>

      {selectedPrize?.count && (
        <NumberSeparate
          totalNumber={selectedPrize?.count!}
          separatedNumber={selectedPrize?.separateCount.countList!}
          onSubmitData={submitData}
        />
      )}

      <div ref={prizeListContainerRef}>
        {/* Temporary Prize */}
        {temporaryPrize.isShow && (
          <div className={`h-20 w-72 ${temporaryPrize.isShow ? "current-prize" : ""}`}>
            <div className="relative flex flex-row items-center justify-between w-full h-full shadow-xl card bg-base-100">
              {temporaryPrize.isUsed && (
                <div className="absolute z-50 w-full h-full bg-gray-800/70 item-mask rounded-xl" />
              )}
              <figure className="w-10 h-10 rounded-xl m-4">
                {temporaryPrize.picture.url ? (
                  <ImageSync imgItem={temporaryPrize.picture} />
                ) : (
                  <img
                    src={defaultPrizeImage}
                    alt="Prize"
                    className="object-cover h-full rounded-xl"
                  />
                )}
              </figure>
              <div className="items-center p-0 text-center card-body">
                <div className="tooltip tooltip-left" data-tip={temporaryPrize.name}>
                  <h2 className="p-0 m-0 overflow-hidden w-28 card-title whitespace-nowrap text-ellipsis">
                    {temporaryPrize.name}
                  </h2>
                </div>
                <p className="absolute z-40 p-0 m-0 text-gray-300/80 mt-9">
                  {temporaryPrize.isUsedCount}/{temporaryPrize.count}
                </p>
                <progress
                  className="w-3/4 h-6 progress progress-primary"
                  value={temporaryPrize.isUsedCount}
                  max={temporaryPrize.count}
                />
              </div>
              <div className="flex flex-col gap-1 mr-2">
                <div className="tooltip tooltip-left" data-tip="编辑">
                  <div className="cursor-pointer hover:text-blue-400" onClick={addTemporaryPrize}>
                    <SvgIcon name="Pencil" />
                  </div>
                </div>
                <div className="tooltip tooltip-left" data-tip="删除">
                  <div
                    className="cursor-pointer hover:text-blue-400"
                    onClick={deleteTemporaryPrize}
                  >
                    <SvgIcon name="Delete" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prize List */}
        {prizeShow && !isMobile && !temporaryPrize.isShow && (
          <div className="flex items-center prize-list-appear">
            <ul className="flex flex-col gap-1 p-2 rounded-xl bg-slate-500/50" ref={prizeListRef}>
              {prizeList.map(
                (item) =>
                  item.isShow && (
                    <li
                      key={item.id}
                      className={currentPrize.id === item.id ? "current-prize" : ""}
                    >
                      <div
                        className={`relative flex flex-row items-center justify-between w-64 h-20 shadow-xl card bg-base-100`}
                      >
                        {item.isUsed && (
                          <div className="absolute z-50 w-full h-full bg-gray-800/70 item-mask rounded-xl" />
                        )}
                        <figure className="w-10 h-10 rounded-xl m-4">
                          {item.picture.url ? (
                            <ImageSync imgItem={item.picture} />
                          ) : (
                            <img
                              src={defaultPrizeImage}
                              alt="Prize"
                              className="object-cover h-full rounded-xl"
                            />
                          )}
                        </figure>
                        <div className="items-center p-0 text-center card-body">
                          <div className="tooltip tooltip-left" data-tip={item.name}>
                            <h2 className="p-0 m-0 overflow-hidden text-center card-title whitespace-nowrap text-ellipsis">
                              {item.name}
                            </h2>
                          </div>
                          <p className="absolute z-40 p-0 m-0 text-gray-300/80 mt-9">
                            {item.isUsedCount}/{item.count}
                          </p>
                          <progress
                            className="w-3/4 h-6 progress progress-primary"
                            value={item.isUsedCount}
                            max={item.count}
                          />
                        </div>
                      </div>
                    </li>
                  )
              )}
            </ul>
            <div className="flex flex-col gap-3">
              <div className="tooltip tooltip-right" data-tip="Awards list">
                <div
                  className="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50"
                  onClick={() => setPrizeShow(!prizeShow)}
                >
                  <SvgIcon name="ChevronLeft" className="w-full h-full" />
                </div>
              </div>
              <div className="tooltip tooltip-right" data-tip="Add lottery">
                <div
                  className="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50"
                  onClick={addTemporaryPrize}
                >
                  <SvgIcon name="Plus" className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show/Hide toggle button */}
      {!prizeShow && (
        <div className="tooltip tooltip-right" data-tip="Awards list">
          <div
            className="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50"
            onClick={() => setPrizeShow(true)}
          >
            <SvgIcon name="ChevronRight" className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
