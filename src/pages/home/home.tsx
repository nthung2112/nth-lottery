import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as TWEEN from "@tweenjs/tween.js";
import { Object3D, PerspectiveCamera, Scene, Vector3 } from "three";
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

function Home() {
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
    table: [] as any[],
    sphere: [] as any[],
  });

  const createTableVertices = () => {
    for (const tableItem of tableData) {
      const object = new Object3D();
      object.position.x =
        tableItem.x * (globalConfig.theme.cardWidth + 40) - globalConfig.rowCount * 90;
      object.position.y = -tableItem.y * (globalConfig.theme.cardHeight + 20) + 1000;
      object.position.z = 0;
      targets.current.table.push(object);
    }
  };

  const createSphereVertices = () => {
    const objLength = objectsRef.current.length;
    const vector = new Vector3();

    for (let i = 0; i < objLength; ++i) {
      const phi = Math.acos(-1 + (2 * i) / objLength);
      const theta = Math.sqrt(objLength * Math.PI) * phi;
      const object = new Object3D();

      object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
      object.position.z = -800 * Math.cos(phi);

      vector.copy(object.position).multiplyScalar(2);
      object.lookAt(vector);
      targets.current.sphere.push(object);
    }
  };

  const createHelixVertices = () => {
    const vector = new Vector3();
    const objLength = objectsRef.current.length;

    for (let i = 0; i < objLength; ++i) {
      const phi = i * 0.213 + Math.PI;
      const object = new Object3D();

      object.position.x = 800 * Math.sin(phi);
      object.position.y = -(i * 8) + 450;
      object.position.z = 800 * Math.cos(phi + Math.PI);
      object.scale.set(1.1, 1.1, 1.1);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);
      targets.current.helix.push(object);
    }
  };

  // Three.js initialization
  const init = () => {
    if (!containerRef.current || sceneRef.current) return;

    const fieldView = 40;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // Initialize scene
    sceneRef.current = new Scene();
    cameraRef.current = new PerspectiveCamera(fieldView, aspect, 1, 10000);
    cameraRef.current.position.z = 3000;

    // Initialize renderer
    rendererRef.current = new CSS3DRenderer();
    rendererRef.current.setSize(width, height * 0.9);
    rendererRef.current.domElement.style.position = "absolute";
    rendererRef.current.domElement.style.paddingTop = "50px";
    rendererRef.current.domElement.style.top = "50%";
    rendererRef.current.domElement.style.left = "50%";
    rendererRef.current.domElement.style.transform = "translate(-50%, -50%)";

    containerRef.current.appendChild(rendererRef.current.domElement);

    // Initialize controls
    if (cameraRef.current && rendererRef.current) {
      controlsRef.current = new TrackballControls(
        cameraRef.current,
        rendererRef.current.domElement
      );
      controlsRef.current.rotateSpeed = 1;
      controlsRef.current.staticMoving = true;
      controlsRef.current.minDistance = 500;
      controlsRef.current.maxDistance = 6000;
      controlsRef.current.addEventListener("change", render);
    }

    // Create objects
    // Create elements
    tableData.forEach((item, i) => {
      const element = document.createElement("div");
      element.className = "element-card";

      const number = document.createElement("div");
      number.className = "card-id";
      number.textContent = item.uid;
      element.appendChild(number);

      const symbol = document.createElement("div");
      symbol.className = "card-name";
      symbol.textContent = item.name;
      element.appendChild(symbol);

      const detail = document.createElement("div");
      detail.className = "card-detail";
      detail.innerHTML = `${item.department}<br/>${item.identity}`;
      element.appendChild(detail);

      const styledElement = createElementStyle(
        element,
        item,
        i,
        patternList,
        patternColor,
        cardColor,
        cardSize,
        textSize
      );
      const object = new CSS3DObject(styledElement);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;

      if (sceneRef.current) {
        sceneRef.current.add(object);
      }
      objectsRef.current.push(object);
    });

    createTableVertices();
    createSphereVertices();
    createHelixVertices();

    transform(targets.current.table, 1000);
    render();
  };

  const transform = (targets: any[], duration: number): Promise<void> => {
    TWEEN.removeAll();

    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current as number);
      intervalTimerRef.current = null;
      randomBallData("sphere");
    }

    return new Promise((resolve) => {
      const objLength = objectsRef.current.length;

      for (let i = 0; i < objLength; ++i) {
        const object = objectsRef.current[i];
        const target = targets[i];

        // Position animation
        new TWEEN.Tween(object.position)
          .to(
            {
              x: target.position.x,
              y: target.position.y,
              z: target.position.z,
            },
            Math.random() * duration + duration
          )
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        // Rotation animation
        new TWEEN.Tween(object.rotation)
          .to(
            {
              x: target.rotation.x,
              y: target.rotation.y,
              z: target.rotation.z,
            },
            Math.random() * duration + duration
          )
          .easing(TWEEN.Easing.Exponential.InOut)
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
      }

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

  // // 旋转的动画
  function rollBall(rotateY: number, duration: number) {
    TWEEN.removeAll();

    if (sceneRef.current?.rotation) {
      sceneRef.current.rotation.y = 0;
    }
    const ballRotationY = Math.PI * rotateY * 1000;
    const rotateObj = new TWEEN.Tween(sceneRef.current?.rotation!);
    rotateObj
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
      toast("The lottery is over", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: true,
      });
      return;
    }

    const personPool = currentPrize.isAll ? notThisPrizePersonList : notPersonList;

    if (personPool.length < currentPrize.count - currentPrize.isUsedCount) {
      toast("Not enough people in the lottery", {
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

    toast(`Draw now ${currentPrize.name} ${leftover} person`, {
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

    luckyTargets.forEach((person, index) => {
      const cardIndex = selectCard(luckyCardList, tableData.length, person.id);
      setLuckyCardList((prev) => [...prev, cardIndex]);

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

    const customCount = currentPrize.separateCount;
    let separateCount = currentPrize.separateCount;
    if (customCount?.enable && customCount.countList.length > 0) {
      const updatedCountList = customCount.countList.map((count) => {
        if (count.isUsedCount < count.count) {
          return { ...count, isUsedCount: count.isUsedCount + luckyCount };
        }
        return count;
      });
      separateCount = { ...currentPrize.separateCount, countList: updatedCountList };
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
                There is no personnel information, go to Import
              </button>
              <button
                className="cursor-pointer btn btn-outline btn-secondary btn-lg"
                onClick={setDefaultPersonList}
              >
                Use default data
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
              Enter the draw
            </button>
          )}

          {currentStatus === 1 && (
            <div className="start">
              <button className="btn-start" onClick={startLottery}>
                <strong className="strong-text">Start</strong>
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
              Draw the lucky one
            </button>
          )}

          {currentStatus === 3 && (
            <div className="flex justify-center gap-6 enStop">
              <div className="start">
                <button className="btn-start" onClick={continueLottery}>
                  <strong className="strong-text">Continue!</strong>
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
                  <strong className="strong-text">Cancel</strong>
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
