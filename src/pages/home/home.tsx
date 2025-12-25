import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as TWEEN from "@tweenjs/tween.js";
import { Object3D, Object3DEventMap, PerspectiveCamera, Scene } from "three";
import { CSS3DObject, CSS3DRenderer } from "three-css3d";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { toast } from "react-toastify";

import { StarsBackground } from "@/components/stars-background";
import { createElementStyle, getElementPosition } from "@/pages/home/home-dom";
import { useGlobalStore } from "@/store/global";
import { getNotPersonList, getNotThisPrizePersonList, usePersonStore } from "@/store/person";
import { usePrizeStore } from "@/store/prize";
import { rgba } from "@/utils/color";

import { confettiFire, initTableData, selectCard } from "./home-util";
import { PrizeList } from "./prize-list";

import "./home.css";
import {
  createCardElement,
  createHelixVertices,
  createSphereVertices,
  createTableVertices,
  initializeControls,
  initializeRenderer,
  initializeScene,
} from "./home-three";
import { createPositionTween, createRotationTween, defaultAnimationConfig } from "./home-tween";

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    personConfig,
    setDefaultPersonList: setDefaultPerson,
    addAlreadyPersonList,
  } = usePersonStore();
  const { globalConfig } = useGlobalStore();
  const { prizeConfig, setCurrentPrize, updatePrizeConfig } = usePrizeStore();

  const notThisPrizePersonList = getNotThisPrizePersonList(personConfig);
  const notPersonList = getNotPersonList(personConfig);

  const { currentPrize } = prizeConfig;
  const { patternList, patternColor, cardColor, textSize, textColor } = globalConfig.theme;
  const cardSize = {
    width: globalConfig.theme.cardWidth,
    height: globalConfig.theme.cardHeight,
  };

  // State
  const [tableData] = useState<any[]>(() => initTableData(personConfig, globalConfig));
  const [currentStatus, setCurrentStatus] = useState(0);
  const [canOperate, setCanOperate] = useState(true);
  const [luckyTargets, setLuckyTargets] = useState<any[]>([]);
  const [luckyCardList, setLuckyCardList] = useState<number[]>([]);
  const [luckyCount, setLuckyCount] = useState(10);

  // Three.js refs
  const sceneRef = useRef<Scene>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const rendererRef = useRef<CSS3DRenderer>(null);
  const controlsRef = useRef<TrackballControls>(null);
  const objectsRef = useRef<any[]>([]);
  const intervalTimerRef = useRef<NodeJS.Timeout | number>(null);
  const animationRef = useRef<number>(null);

  const targets = useRef({
    grid: [] as any[],
    helix: [] as any[],
    table: [] as Object3D<Object3DEventMap>[],
    sphere: [] as Object3D<Object3DEventMap>[],
  });

  // Three.js initialization
  const init = () => {
    if (!containerRef.current || sceneRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const { scene, camera } = initializeScene(width, height);
    const renderer = initializeRenderer(width, height);

    containerRef.current?.appendChild(renderer.domElement);

    const controls = initializeControls(camera, renderer, render);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Create and add objects
    objectsRef.current = tableData.map((item, i) => {
      const styledElement = createCardElement(item, i, globalConfig.theme);
      const object = new CSS3DObject(styledElement);
      object.position.set(
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000,
        Math.random() * 4000 - 2000
      );

      scene.add(object);
      return object;
    });

    targets.current.table = createTableVertices(tableData, globalConfig);
    targets.current.sphere = createSphereVertices(objectsRef.current.length);
    targets.current.helix = createHelixVertices(objectsRef.current.length);

    transform(targets.current.table, 1000);
    render();
  };

  const transform = (targets: Object3D<Object3DEventMap>[], duration: number): Promise<void> => {
    TWEEN.removeAll();

    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current as number);
      intervalTimerRef.current = null;
      randomBallData("sphere");
    }

    return new Promise((resolve) => {
      const config = { ...defaultAnimationConfig, duration };

      objectsRef.current.forEach((object, i) => {
        const target = targets[i];

        createPositionTween(object, target.position, config).start();
        createRotationTween(object, target.rotation, config)
          .start()
          .onComplete(() => {
            if (luckyCardList.length) {
              luckyCardList.forEach((cardIndex: number) => {
                const item = objectsRef.current[cardIndex];
                createElementStyle(
                  item.element,
                  {} as any,
                  i,
                  patternList,
                  patternColor,
                  cardColor,
                  cardSize,
                  textSize,
                  "sphere"
                );
              });
            }
            setLuckyTargets([]);
            setLuckyCardList([]);
            setCanOperate(true);
          });
      });

      // Synchronization tween
      new TWEEN.Tween({})
        .to({}, duration * 2)
        .onUpdate(render)
        .start()
        .onComplete(() => {
          setCanOperate(true);
          resolve();
        });
    });
  };

  function rollBall(rotateY: number, duration: number) {
    TWEEN.removeAll();

    if (sceneRef.current?.rotation) {
      sceneRef.current.rotation.y = 0;
    }
    const ballRotationY = Math.PI * rotateY * 1000;
    new TWEEN.Tween(sceneRef.current?.rotation!)
      .to(
        {
          x: 0,
          y: ballRotationY,
          z: 0,
        },
        duration * 1000
      )
      .onUpdate(render)
      .start();
  }

  function resetCamera() {
    new TWEEN.Tween(cameraRef.current?.position!)
      .to(
        {
          x: 0,
          y: 0,
          z: 3000,
        },
        1000
      )
      .onUpdate(render)
      .start()
      .onComplete(() => {
        new TWEEN.Tween(cameraRef.current?.rotation!)
          .to(
            {
              x: 0,
              y: 0,
              z: 0,
            },
            1000
          )
          .onUpdate(render)
          .start()
          .onComplete(() => {
            setCanOperate(true);
            if (cameraRef.current) {
              cameraRef.current.position.y = 0;
              cameraRef.current.position.x = 0;
              cameraRef.current.position.z = 3000;
              cameraRef.current.rotation.x = 0;
              cameraRef.current.rotation.y = 0;
              cameraRef.current.rotation.z = -0;
            }

            controlsRef.current?.reset();
          });
      });
  }

  // Animation and render functions
  const render = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const setDefaultPersonList = () => {
    setDefaultPerson();
    window.location.reload();
  };

  const randomBallData = (mod: "default" | "lucky" | "sphere" = "default") => {
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current as number);
    }

    intervalTimerRef.current = setInterval(() => {
      const indexLength = 4;
      const cardRandomIndexArr: number[] = [];
      const personRandomIndexArr: number[] = [];

      for (let i = 0; i < indexLength; i++) {
        cardRandomIndexArr.push(Math.round(Math.random() * (tableData.length - 1)));
        personRandomIndexArr.push(
          Math.round(Math.random() * (personConfig.allPersonList.length - 1))
        );
      }

      cardRandomIndexArr.forEach((cardIndex, i) => {
        if (!objectsRef.current[cardIndex]) return;

        objectsRef.current[cardIndex].element = createElementStyle(
          objectsRef.current[cardIndex].element,
          personConfig.allPersonList[personRandomIndexArr[i]],
          cardIndex,
          patternList,
          patternColor,
          cardColor,
          cardSize,
          textSize,
          mod
        );
      });
    }, 200);
  };

  function animation() {
    TWEEN.update();
    controlsRef.current?.update();
    animationRef.current = requestAnimationFrame(animation);
  }

  const enterLottery = useCallback(async () => {
    if (!canOperate) return;

    if (!intervalTimerRef.current) {
      randomBallData();
    }

    if (patternList.length) {
      for (let i = 0; i < patternList.length; i++) {
        if (i < globalConfig.rowCount * 7) {
          objectsRef.current[patternList[i] - 1].element.style.backgroundColor = rgba(
            cardColor,
            Math.random() * 0.5 + 0.25
          );
        }
      }
    }

    setCanOperate(false);
    await transform(targets.current.sphere, 1000);
    setCurrentStatus(1);
    rollBall(0.1, 2000);
  }, [canOperate, targets]);

  const startLottery = useCallback(() => {
    if (!canOperate) return;

    if (currentPrize?.isUsed || !currentPrize) {
      toast(t("home.lotteryOver"), {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: true,
      });
      return;
    }

    const personPool = currentPrize.isAll ? notThisPrizePersonList : notPersonList;

    if (personPool.length < currentPrize.count - currentPrize.isUsedCount) {
      toast(t("home.notEnoughPeople"), {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: true,
      });
      return;
    }

    let leftover = currentPrize.count - currentPrize.isUsedCount;
    const customCount = currentPrize.separateCount;

    // Handle custom count logic
    if (customCount?.enable && customCount.countList.length > 0) {
      for (let i = 0; i < customCount.countList.length; i++) {
        if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
          leftover = customCount.countList[i].count - customCount.countList[i].isUsedCount;
          break;
        }
      }
    }

    // Max 10 people
    const newLuckyCount = Math.min(leftover, 10);
    const newLuckyTargets = [];

    for (let i = 0; i < newLuckyCount; i++) {
      if (personPool.length > 0) {
        const randomIndex = Math.round(Math.random() * (personPool.length - 1));
        newLuckyTargets.push(personPool[randomIndex]);
        personPool.splice(randomIndex, 1);
      }
    }

    setLuckyCount(newLuckyCount);
    setLuckyTargets(newLuckyTargets);
    setCurrentStatus(2);
    rollBall(10, 3000);

    toast(t("home.drawingLots", { prizeName: currentPrize.name, count: leftover }), {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: true,
    });
  }, [canOperate, currentPrize, luckyCount]);

  const stopLottery = useCallback(async () => {
    if (!canOperate) return;

    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current as number);
      intervalTimerRef.current = null;
    }

    setCanOperate(false);
    rollBall(0, 1);

    const windowSize = { width: window.innerWidth, height: window.innerHeight };

    // Collect all card indices first to avoid race conditions
    const newCardIndices: number[] = [];
    const updatedLuckyCardList = [...luckyCardList];

    luckyTargets.forEach((person) => {
      const cardIndex = selectCard(updatedLuckyCardList, tableData.length, person.id);
      newCardIndices.push(cardIndex);
      updatedLuckyCardList.push(cardIndex);
    });

    // Update state once with all new card indices
    setLuckyCardList(updatedLuckyCardList);

    // Now animate all the cards
    luckyTargets.forEach((person, index) => {
      const cardIndex = newCardIndices[index];
      const item = objectsRef.current[cardIndex];
      const { xTable, yTable } = getElementPosition(
        item,
        globalConfig.rowCount,
        luckyTargets.length,
        { width: cardSize.width * 2, height: cardSize.height * 2 },
        windowSize,
        index
      );

      new TWEEN.Tween(item.position)
        .to({ x: xTable, y: yTable, z: 1000 }, 1200)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onStart(() => {
          item.element = createElementStyle(
            item.element,
            person,
            cardIndex,
            patternList,
            patternColor,
            globalConfig.theme.luckyCardColor,
            { width: cardSize.width * 2, height: cardSize.height * 2 },
            textSize * 2,
            "lucky"
          );
        })
        .start()
        .onComplete(() => {
          setCanOperate(true);
          setCurrentStatus(3);
        });

      new TWEEN.Tween(item.rotation)
        .to({ x: 0, y: 0, z: 0 }, 900)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
        .onComplete(() => {
          confettiFire();
          resetCamera();
        });
    });
  }, [canOperate, luckyTargets, objectsRef, luckyCardList]);

  const continueLottery = useCallback(async () => {
    if (!canOperate) return;

    const separateCount = structuredClone(currentPrize.separateCount);
    if (separateCount?.enable && separateCount.countList.length > 0) {
      for (const countItem of separateCount.countList) {
        if (countItem.isUsedCount < countItem.count) {
          countItem.isUsedCount += luckyCount;
          break;
        }
      }
    }

    const newCurrentPrize = {
      ...currentPrize,
      separateCount,
      isUsedCount: currentPrize.isUsedCount + luckyCount,
      isUsed: currentPrize.isUsedCount + luckyCount >= currentPrize.count,
    };

    setCurrentPrize(newCurrentPrize);
    setLuckyCount(0);
    addAlreadyPersonList(luckyTargets, newCurrentPrize);
    updatePrizeConfig(newCurrentPrize);
    await enterLottery();
  }, [canOperate, currentPrize, luckyCount, luckyTargets]);

  const quitLottery = useCallback(() => {
    enterLottery();
    setCurrentStatus(0);
  }, []);

  const listenKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Escape" && !canOperate) return;

      if (e.code === "Escape" && currentStatus === 3) {
        quitLottery();
        return;
      }

      if (e.code !== "Space") return;

      switch (currentStatus) {
        case 0:
          enterLottery();
          break;
        case 1:
          startLottery();
          break;
        case 2:
          stopLottery();
          break;
        case 3:
          continueLottery();
          break;
        default:
          break;
      }
    },
    [currentStatus, canOperate]
  );

  useEffect(() => {
    window.addEventListener("keydown", listenKeyboard);
    return () => {
      window.removeEventListener("keydown", listenKeyboard);
    };
  }, [listenKeyboard]);

  // Lifecycle hooks
  useEffect(() => {
    init();
    animationRef.current = requestAnimationFrame(animation);
    randomBallData();

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current as number);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 left-1/2">
        <h2
          className="pt-12 m-0 mb-12 tracking-wide text-center leading-12 header-title"
          style={{
            fontSize: `${textSize * 1.5}px`,
            color: textColor,
          }}
        >
          {globalConfig.topTitle}
        </h2>

        <div className="flex gap-3">
          {tableData.length <= 0 && (
            <>
              <button
                className="cursor-pointer btn btn-outline btn-secondary btn-lg"
                onClick={() => navigate("/config")}
              >
                {t("home.noPersonnel")}
              </button>
              <button
                className="cursor-pointer btn btn-outline btn-secondary btn-lg"
                onClick={setDefaultPersonList}
              >
                {t("home.useDefaultData")}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        id="container"
        ref={containerRef}
        className="3dContainer"
        style={{
          color: textColor,
        }}
      >
        <div id="menu">
          {currentStatus === 0 && tableData.length > 0 && (
            <button className="btn-end" onClick={enterLottery}>
              {t("home.enterDraw")}
            </button>
          )}

          {currentStatus === 1 && (
            <div className="start">
              <button className="btn-start" onClick={startLottery}>
                <strong className="strong-text">{t("home.start")}</strong>
                <div id="container-stars">
                  <div id="stars" />
                </div>
                <div id="glow">
                  <div className="circle" />
                  <div className="circle" />
                </div>
              </button>
            </div>
          )}

          {currentStatus === 2 && (
            <button className="btn-end btn glass btn-lg" onClick={stopLottery}>
              {t("home.drawLucky")}
            </button>
          )}

          {currentStatus === 3 && (
            <div className="flex justify-center gap-6 enStop">
              <div className="start">
                <button className="btn-start" onClick={continueLottery}>
                  <strong className="strong-text">{t("home.continue")}</strong>
                  <div id="container-stars">
                    <div id="stars" />
                  </div>
                  <div id="glow">
                    <div className="circle" />
                    <div className="circle" />
                  </div>
                </button>
              </div>

              <div className="start">
                <button className="btn-cancel" onClick={quitLottery}>
                  <strong className="strong-text">{t("home.cancel")}</strong>
                  <div id="container-stars">
                    <div id="stars" />
                  </div>
                  <div id="glow">
                    <div className="circle" />
                    <div className="circle" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StarsBackground homeBackground={globalConfig.theme.background} />
      <div className="absolute left-0 top-32">
        <PrizeList />
      </div>
    </>
  );
}

export default Home;
