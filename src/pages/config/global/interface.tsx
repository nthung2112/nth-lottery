import { useEffect, useRef, useState } from "react";
import { Theme } from "daisyui";
import daisyuiThemes from "daisyui/src/theming/themes";
import { themeChange } from "theme-change";
import { z as zod } from "zod";

import { useGlobalStore } from "@/store/global";
import { getNotPersonList, usePersonStore } from "@/store/person";
import { usePrizeStore } from "@/store/prize";
import { isHex, isRgbOrRgba } from "@/utils/color";

import { PatternSetting } from "./pattern-setting";

export default function FaceConfig() {
  // Store
  const {
    globalConfig,
    setPatternList,
    resetPatternList,
    setCardColor,
    setTheme,
    setTopTitle,
    setRowCount,
    setCardSize,
    setBackground,
    setPatterColor,
    setTextSize,
    setTextColor,
    setLuckyCardColor,
    setIsShowPrizeList,
    reset: resetGlobal,
  } = useGlobalStore();
  const { resetDefault: resetPrize } = usePrizeStore();
  const {
    personConfig,
    deleteAllPerson,
    addNotPersonList,
    addAlreadyPersonList,
    reset: resetPerson,
  } = usePersonStore();
  const themeConfig = globalConfig.theme;
  const notPersonList = getNotPersonList(personConfig);

  // Refs
  const resetDataDialogRef = useRef<HTMLDialogElement>(null);

  // State
  const [isRowCountChange, setIsRowCountChange] = useState<0 | 1 | 2>(0);
  const [themeValue, setThemeValue] = useState(globalConfig.theme.name);
  const [rowCountValue, setRowCountValue] = useState(globalConfig.rowCount);
  const [formError, setFormError] = useState({ rowCount: "" });

  const themeList = Object.keys(daisyuiThemes);
  const daisyuiThemeList = daisyuiThemes;

  // Validation schema
  const schema = zod.object({
    rowCount: zod.number().min(1, "Minimum is 1").max(100, "Maximum is 100"),
  });

  // Effects
  useEffect(() => {
    const validateRowCount = async () => {
      try {
        await schema.parseAsync({ rowCount: rowCountValue });
        setIsRowCountChange(1);
        setRowCount(rowCountValue);
        setFormError({ rowCount: "" });
      } catch (err: any) {
        setFormError({ rowCount: err.errors[0].message });
      }
    };
    validateRowCount();
  }, [rowCountValue]);

  useEffect(() => {
    const selectedThemeDetail = daisyuiThemeList[themeValue as Theme] as any;
    setTheme({ name: themeValue, detail: selectedThemeDetail });
    themeChange(false);

    if (
      selectedThemeDetail?.primary &&
      (isHex(selectedThemeDetail.primary) || isRgbOrRgba(selectedThemeDetail.primary))
    ) {
      setCardColor(selectedThemeDetail.primary);
    }
  }, [themeValue]);

  // Handlers
  const resetPersonLayout = () => {
    setIsRowCountChange(2);
    setTimeout(() => {
      const alreadyLen = personConfig.alreadyPersonList.length;
      const notLen = notPersonList.length;

      if (alreadyLen <= 0 && notLen <= 0) return;

      const allPersonList = [...personConfig.alreadyPersonList, ...notPersonList];
      const newAlreadyPersonList = allPersonList.slice(0, alreadyLen);
      const newNotPersonList = allPersonList.slice(alreadyLen, notLen + alreadyLen);

      deleteAllPerson();
      addNotPersonList(newNotPersonList);
      addAlreadyPersonList(newAlreadyPersonList, null);

      setIsRowCountChange(0);
    }, 1000);
  };

  const clearPattern = () => {
    setPatternList([]);
  };

  const resetPattern = () => {
    resetPatternList();
  };

  const resetData = () => {
    resetGlobal();
    resetPerson();
    resetPrize();
    window.location.reload();
  };

  return (
    <>
      <dialog ref={resetDataDialogRef} className="modal border-none">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Attention!</h3>
          <p className="py-4">This operation will reset all data. Do you want to continue?</p>
          <div className="modal-action">
            <div className="flex gap-3">
              <button className="btn" onClick={() => resetDataDialogRef.current?.close()}>
                Cancel
              </button>
              <button className="btn" onClick={resetData}>
                OK
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <div>
        <h2>Global configuration</h2>
        <div className="mb-8">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => resetDataDialogRef.current?.showModal()}
          >
            Reset all data
          </button>
        </div>

        <label className="flex flex-row items-center w-full gap-24 mb-10 form-control">
          <div>
            <div className="label">
              <span className="label-text">Title</span>
            </div>
            <input
              type="text"
              value={globalConfig.topTitle}
              onChange={(e) => setTopTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full max-w-xs input input-bordered"
            />
          </div>
        </label>

        <label className="flex flex-row items-center w-full gap-24 mb-10 form-control">
          <div>
            <div className="label">
              <span className="label-text">Number of columns</span>
            </div>
            <input
              type="number"
              value={rowCountValue}
              onChange={(e) => setRowCountValue(Number(e.target.value))}
              placeholder="Type here"
              className="w-full max-w-xs input input-bordered"
            />
            <div className="help">
              {formError.rowCount && (
                <span className="text-sm text-red-400 help-text">{formError.rowCount}</span>
              )}
            </div>
          </div>
          <div>
            <div
              className="tooltip"
              data-tip="This item is time consuming and performance intensive"
            >
              <button
                className="mt-5 btn btn-info btn-sm"
                disabled={isRowCountChange !== 1}
                onClick={resetPersonLayout}
              >
                <span>Reset layout</span>
                {isRowCountChange === 2 && <span className="loading loading-ring loading-md" />}
              </button>
            </div>
          </div>
        </label>

        {/* Theme Selector */}
        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Select theme</span>
          </div>
          <select
            data-choose-theme
            className="w-full max-w-xs border-solid select border-1 capitalize"
            value={themeConfig.name}
            onChange={(e) => setThemeValue(e.target.value)}
          >
            <option disabled>Select topic</option>
            {themeList.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {/* Background Image Selector */}
        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Select background image</span>
          </div>
          <select
            className="w-full max-w-xs border-solid select border-1 capitalize"
            value={themeConfig.background?.id}
            onChange={(e) => {
              const selected = [{ name: "None", url: "", id: "" }, ...globalConfig.imageList].find(
                (item) => item.id === e.target.value
              );
              setBackground(selected as any);
            }}
          >
            <option disabled>Select background image</option>
            {[{ name: "None", url: "", id: "" }, ...globalConfig.imageList].map((item, index) => (
              <option key={index} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        {/* Color Pickers */}
        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Card color</span>
          </div>
          <input
            type="color"
            name="cardColor"
            value={themeConfig.cardColor}
            onChange={(e) => setCardColor(e.target.value)}
          />
        </label>

        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Winning card color</span>
          </div>
          <input
            type="color"
            name="luckyCardColorValue"
            value={themeConfig.luckyCardColor}
            onChange={(e) => setLuckyCardColor(e.target.value)}
          />
        </label>

        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Text color</span>
          </div>
          <input
            type="color"
            name="textColor"
            value={themeConfig.textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </label>

        <label className="flex flex-row w-full max-w-xs gap-10 mb-10 form-control">
          <div>
            <div className="label">
              <span className="label-text">Card width</span>
            </div>
            <input
              type="number"
              value={themeConfig.cardWidth}
              onChange={(e) =>
                setCardSize({
                  height: themeConfig.cardHeight,
                  width: Number(e.target.value),
                })
              }
              className="w-full max-w-xs input input-bordered"
            />
          </div>
          <div>
            <div className="label">
              <span className="label-text">Card height</span>
            </div>
            <input
              type="number"
              value={themeConfig.cardHeight}
              onChange={(e) =>
                setCardSize({
                  width: themeConfig.cardWidth,
                  height: Number(e.target.value),
                })
              }
              className="w-full max-w-xs input input-bordered"
            />
          </div>
        </label>

        <label className="w-full max-w-xs mb-10 form-control">
          <div className="label">
            <span className="label-text">Text size</span>
          </div>
          <input
            type="number"
            value={themeConfig.textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            placeholder="Type here"
            className="w-full max-w-xs input input-bordered"
          />
        </label>
        <label className="w-full max-w-xs form-control">
          <div className="label">
            <span className="label-text">Highlight color</span>
          </div>
          <input
            type="color"
            name="patternColor"
            value={themeConfig.patternColor}
            onChange={(e) => setPatterColor(e.target.value)}
          />
        </label>

        {/* Pattern Settings */}
        <label className="flex flex-row items-center w-full gap-24 mb-0 form-control">
          <div>
            <div className="label">
              <span className="label-text">Pattern settings</span>
            </div>
            <div className="h-auto">
              <PatternSetting
                rowCount={globalConfig.rowCount}
                cardColor={globalConfig.theme.cardColor}
                patternColor={globalConfig.theme.patternColor}
                patternList={globalConfig.theme.patternList}
                onPatternChange={setPatternList}
              />
            </div>
          </div>
        </label>

        <div className="flex w-full h-24 gap-3 m-0">
          <button className="mt-5 btn btn-info btn-sm" onClick={clearPattern}>
            <span>Clear pattern settings</span>
          </button>
          <div
            className="tooltip"
            data-tip="The default pattern setting is effective for 17 columns. Please set the other number of columns by yourself."
          >
            <button className="mt-5 btn btn-info btn-sm" onClick={resetPattern}>
              <span>Default pattern settings</span>
            </button>
          </div>
        </div>

        {/* Prize List Toggle */}
        <label className="w-full max-w-xs mb-10 form-control">
          <div className="label">
            <span className="label-text">Whether to always display the prize list</span>
          </div>
          <input
            type="checkbox"
            checked={globalConfig.isSHowPrizeList}
            onChange={() => setIsShowPrizeList(!globalConfig.isSHowPrizeList)}
            className="mt-2 border-solid checkbox checkbox-secondary border-1"
          />
        </label>
      </div>
    </>
  );
}
