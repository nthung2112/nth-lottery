import confetti from "canvas-confetti";
import dayjs from "dayjs";

import { GlobalConfig } from "@/store/global";
import { PersonConfigState } from "@/store/person";
import { IPersonConfig } from "@/types/storeType";

const filterData = (tableData: any[], localRowCount: number) => {
  const dataLength = tableData.length;
  let j = 0;
  for (let i = 0; i < dataLength; i++) {
    if (i % localRowCount === 0) {
      j++;
    }
    tableData[i].x = (i % localRowCount) + 1;
    tableData[i].y = j;
    tableData[i].id = i;
    // Whether to win
  }

  return tableData;
};

export function addOtherInfo(personList: IPersonConfig[]) {
  const len = personList.length;
  for (let i = 0; i < len; i++) {
    personList[i].id = i;
    personList[i].createTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    personList[i].updateTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    personList[i].prizeName = [] as string[];
    personList[i].prizeTime = [] as string[];
    personList[i].prizeId = [];
    personList[i].isWin = false;
  }

  return personList;
}

export const selectCard = (
  cardIndexArr: number[],
  tableLength: number,
  personId: number
): number => {
  const cardIndex = Math.round(Math.random() * (tableLength - 1));
  if (cardIndexArr.includes(cardIndex)) {
    return selectCard(cardIndexArr, tableLength, personId);
  }

  return cardIndex;
};

// Initialize table data
export function initTableData(personConfig: PersonConfigState, globalConfig: GlobalConfig) {
  if (personConfig.allPersonList.length <= 0) return [];

  const totalCount = globalConfig.rowCount * 7;
  const originPersonData = JSON.parse(JSON.stringify(personConfig.allPersonList));
  const originPersonLength = originPersonData.length;

  let newTableData: any[] = [];
  if (originPersonLength < totalCount) {
    const repeatCount = Math.ceil(totalCount / originPersonLength);
    for (let i = 0; i < repeatCount; i++) {
      newTableData = newTableData.concat(JSON.parse(JSON.stringify(originPersonData)));
    }
  } else {
    newTableData = originPersonData.slice(0, totalCount);
  }

  return filterData(newTableData.slice(0, totalCount), globalConfig.rowCount);
}

export function confettiFire() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    // Launch confetti from left edge
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });

    // Launch confetti from right edge
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Center bursts
  centerFire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  centerFire(0.2, {
    spread: 60,
  });
  centerFire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  centerFire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  centerFire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

function centerFire(particleRatio: number, opts: any) {
  const count = 200;
  confetti({
    origin: { y: 0.7 },
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}
