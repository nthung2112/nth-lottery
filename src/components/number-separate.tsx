import { useEffect, useState, useRef, useImperativeHandle } from "react";

interface Separate {
  id: string;
  count: number;
  isUsedCount: number;
}

interface NumberSeparateProps {
  totalNumber: number;
  separatedNumber: Separate[];
  onSubmitData: (data: Separate[]) => void;
  ref: React.RefObject<NumberSeparateRef | null>;
}

export interface NumberSeparateRef {
  showModal: () => void;
  closeModal: () => void;
}

export function NumberSeparate({
  totalNumber,
  separatedNumber,
  onSubmitData,
  ref,
}: NumberSeparateProps) {
  const [scaleList, setScaleList] = useState<number[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [localSeparatedNumber, setLocalSeparatedNumber] = useState<Separate[]>(separatedNumber);

  const editScale = (item: number) => {
    if (item === totalNumber) {
      return;
    }

    setScaleList((prevList) => {
      if (prevList.includes(item)) {
        const index = prevList.indexOf(item);
        const newList = [...prevList];
        newList.splice(index, 1);
        return newList;
      }

      return [...prevList, item].sort((a, b) => a - b);
    });
  };

  const clearData = () => {
    onSubmitData(localSeparatedNumber);
    dialogRef.current?.close();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        showModal() {
          dialogRef.current?.showModal();
        },
        closeModal() {
          dialogRef.current?.close();
        },
      };
    },
    []
  );

  useEffect(() => {
    const newSeparatedNumber: Separate[] = [];
    for (let i = 1; i < scaleList.length; i++) {
      newSeparatedNumber[i - 1] = {
        id: i.toString(),
        count: scaleList[i] - scaleList[i - 1],
        isUsedCount: 0,
      };
    }
    setLocalSeparatedNumber(newSeparatedNumber);
  }, [scaleList]);

  useEffect(() => {
    if (totalNumber <= 0) {
      return;
    }

    const initialScaleList = new Array(separatedNumber.length + 1).fill(totalNumber);
    for (let i = separatedNumber.length - 1; i >= 0; i--) {
      initialScaleList[i] = initialScaleList[i + 1] - separatedNumber[i].count;
    }
    if (initialScaleList[0] !== 0) {
      initialScaleList.unshift(0);
    }
    setScaleList(initialScaleList);
  }, [totalNumber, separatedNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <dialog ref={dialogRef} className="z-50 overflow-hidden border-none modal">
      <div className="overflow-hidden modal-box">
        <h3 className="pb-6 text-lg font-bold">Suggest!</h3>
        <p className="pb-8">Only 10 digits can be drawn in a single draw</p>
        <div className="flex justify-between px-3 text-center separated-number">
          {[...Array(totalNumber)].map((_, index) => {
            const item = index + 1;
            return (
              <div key={item} className="relative flex flex-col items-center cursor-pointer">
                <div
                  className="absolute mb-12 text-center tooltip -top-5 hover:text-lg"
                  data-tip="Left-click to cut"
                  onClick={() => editScale(item)}
                >
                  <span>{item}</span>
                </div>
                <div
                  className={`text-center ${
                    scaleList.includes(item) ? "text-red-500 font-extrabold" : ""
                  }`}
                >
                  |
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={clearData}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
