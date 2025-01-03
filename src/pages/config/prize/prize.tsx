import { useRef, useState } from "react";
import { SvgIcon } from "@/components/svg-icon";
import { NumberSeparate, NumberSeparateRef } from "@/components/number-separate";
import { IPrizeConfig } from "@/types/storeType";
import { useGlobalStore } from "@/store/global";
import { usePrizeStore } from "@/store/prize";

export default function PrizeConfig() {
  const { globalConfig } = useGlobalStore();
  const { prizeConfig, resetDefault, deleteAllPrizeConfig } = usePrizeStore();

  const [prizeList, setPrizeList] = useState<IPrizeConfig[]>(prizeConfig.prizeList);
  const [selectedPrize, setSelectedPrize] = useState<IPrizeConfig | null>(null);
  const numberSeparateRef = useRef<NumberSeparateRef>(null);

  const addPrize = () => {
    const defaultPrizeConfig: IPrizeConfig = {
      id: new Date().getTime().toString(),
      name: "Awards",
      sort: 0,
      isAll: false,
      count: 1,
      isUsedCount: 0,
      picture: {
        id: "",
        name: "",
        url: "",
      },
      separateCount: {
        enable: false,
        countList: [],
      },
      desc: "",
      isUsed: false,
      isShow: true,
      frequency: 1,
    };
    setPrizeList([...prizeList, defaultPrizeConfig]);
  };

  const selectPrize = (item: IPrizeConfig) => {
    const newItem = { ...item };
    newItem.isUsedCount = 0;
    newItem.isUsed = false;

    if (newItem.separateCount.countList.length > 1) {
      setSelectedPrize(newItem);
      numberSeparateRef.current?.showModal();
      return;
    }

    newItem.separateCount = {
      enable: true,
      countList: [
        {
          id: "0",
          count: item.count,
          isUsedCount: 0,
        },
      ],
    };
    setSelectedPrize(newItem);
    numberSeparateRef.current?.showModal();
  };

  const changePrizeStatus = (item: IPrizeConfig) => {
    const updatedList = prizeList.map((prize) => {
      if (prize.id === item.id) {
        return {
          ...prize,
          isUsedCount: !prize.isUsed ? prize.count : 0,
          separateCount: { ...prize.separateCount, countList: [] },
          isUsed: !prize.isUsed,
        };
      }
      return prize;
    });
    setPrizeList(updatedList);
  };

  const changePrizePerson = (item: IPrizeConfig) => {
    let indexPrize = -1;
    for (let i = 0; i < prizeList.length; i++) {
      if (prizeList[i].id == item.id) {
        indexPrize = i;
        break;
      }
    }
    if (indexPrize > -1) {
      prizeList[indexPrize].separateCount.countList = [];
      prizeList[indexPrize].isUsedCount = prizeList[indexPrize].isUsed
        ? prizeList[indexPrize].count
        : 0;
    }
  };

  const sort = (item: IPrizeConfig, direction: number) => {
    const index = prizeList.findIndex((prize) => prize.id === item.id);
    const newList = [...prizeList];
    if (direction === 1 && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 0 && index < prizeList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setPrizeList(newList);
  };

  return (
    <div>
      <h2 className="text-3xl sm:text-4x pb-4">Award configuration</h2>
      <div className="flex w-full gap-3">
        <button className="btn btn-info btn-sm" onClick={addPrize}>
          Add to
        </button>
        <button className="btn btn-info btn-sm" onClick={resetDefault}>
          Default list
        </button>
        <button className="btn btn-error btn-sm" onClick={deleteAllPrizeConfig}>
          Delete all
        </button>
      </div>

      <div role="alert" className="w-auto my-4 alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="w-6 h-6 stroke-current shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Performing operations may reset data, please operate with caution</span>
      </div>

      <ul className="p-0 m-0">
        {prizeList.map((item, index) => (
          <li
            key={item.id}
            className={`flex gap-10 ${
              prizeConfig.currentPrize?.id === item.id ? "border-1 border-dotted rounded-xl" : ""
            }`}
          >
            <label className="max-w-xs mb-10 form-control">
              <div className="flex flex-col items-center gap-2 pt-5">
                <SvgIcon
                  className={`cursor-pointer hover:text-blue-400 ${
                    index === 0 ? "opacity-0 cursor-default" : ""
                  }`}
                  name="AArrowUp"
                  onClick={() => sort(item, 1)}
                />
                <SvgIcon
                  className={`cursor-pointer hover:text-blue-400 ${
                    index === prizeList.length - 1 ? "opacity-0 cursor-default" : ""
                  }`}
                  name="AArrowDown"
                  onClick={() => sort(item, 0)}
                />
              </div>
            </label>

            <label className="w-1/2 max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">Name</span>
              </div>
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const newList = [...prizeList];
                  const prize = newList.find((p) => p.id === item.id);
                  if (prize) prize.name = e.target.value;
                  setPrizeList(newList);
                }}
                placeholder="Name"
                className="w-full max-w-xs input-sm input input-bordered"
              />
            </label>

            <label className="w-1/2 max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">All members participate</span>
              </div>
              <input
                type="checkbox"
                checked={item.isAll}
                onChange={() => {
                  const newList = prizeList.map((prize) =>
                    prize.id === item.id ? { ...prize, isAll: !prize.isAll } : prize
                  );
                  setPrizeList(newList);
                }}
                className="mt-2 border-solid checkbox checkbox-secondary border-1"
              />
            </label>

            <label className="w-1/2 max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">Number of people in the lottery</span>
              </div>
              <input
                type="number"
                value={item.count}
                onChange={(e) => {
                  const newList = [...prizeList];
                  const prize = newList.find((p) => p.id === item.id);
                  if (prize) prize.count = parseInt(e.target.value);
                  setPrizeList(newList);
                  changePrizePerson(item);
                }}
                placeholder="Number of winners"
                className="w-full max-w-xs p-0 m-0 input-sm input input-bordered"
              />
              <div
                className="tooltip tooltip-bottom"
                data-tip={`Extracted:${item.isUsedCount}/${item.count}`}
              >
                <progress className="w-full progress" value={item.isUsedCount} max={item.count} />
              </div>
            </label>

            <label className="w-1/2 max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">Extracted</span>
              </div>
              <input
                type="checkbox"
                checked={item.isUsed}
                onChange={() => changePrizeStatus(item)}
                className="mt-2 border-solid checkbox checkbox-secondary border-1"
              />
            </label>

            <label className="w-full max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">Image</span>
              </div>
              <select
                className="w-full max-w-xs select select-warning select-sm"
                value={item.picture.id}
                onChange={(e) => {
                  const newList = [...prizeList];
                  const prize = newList.find((p) => p.id === item.id);
                  if (prize) {
                    prize.picture = globalConfig.imageList.find((img) => img.id === e.target.value) || {
                      id: "",
                      name: "",
                      url: "",
                    };
                  }
                  setPrizeList(newList);
                }}
              >
                {item.picture.id && <option value="">❌</option>}
                <option disabled>Choose a picture</option>
                {globalConfig.imageList.map((pic) => (
                  <option key={pic.id} value={pic.id}>
                    {pic.name}
                  </option>
                ))}
              </select>
            </label>

            {item.separateCount && (
              <label className="w-full max-w-xs mb-10 form-control">
                <div className="label">
                  <span className="label-text">The number of single draws</span>
                </div>
                <div className="flex justify-start w-full h-full" onClick={() => selectPrize(item)}>
                  {item.separateCount.countList.length > 0 ? (
                    <ul className="flex flex-wrap w-full h-full gap-1 p-0 pt-1 m-0 cursor-pointer">
                      {item.separateCount.countList.map((se) => (
                        <li
                          key={se.id}
                          className="relative flex items-center justify-center w-8 h-8 bg-slate-600/60 separated"
                        >
                          <div
                            className="flex items-center justify-center w-full h-full tooltip"
                            data-tip={`Extracted:${se.isUsedCount}/${se.count}`}
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

            <label className="w-full max-w-xs mb-10 form-control">
              <div className="label">
                <span className="label-text">Operate</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => {
                    setPrizeList(prizeList.filter((p) => p.id !== item.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </label>
          </li>
        ))}
      </ul>

      {selectedPrize && (
        <NumberSeparate
          ref={numberSeparateRef}
          totalNumber={selectedPrize.count}
          separatedNumber={selectedPrize.separateCount.countList}
          onSubmitData={() => {
            setSelectedPrize(null);
          }}
        />
      )}
    </div>
  );
}
