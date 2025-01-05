import { Object3D, PerspectiveCamera, Scene, Spherical, Vector3 } from "three";
import { CSS3DRenderer } from "three-css3d";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

import { createElementStyle } from "@/pages/home/home-dom";
import { GlobalConfig, Theme } from "@/store/global";

// Constants
const SCENE_CONFIG = {
  fieldView: 40,
  near: 1,
  far: 10000,
  cameraZ: 3000,
} as const;

const CONTROLS_CONFIG = {
  rotateSpeed: 1,
  staticMoving: true,
  minDistance: 500,
  maxDistance: 6000,
} as const;

const RENDERER_STYLES = {
  position: "absolute",
  paddingTop: "50px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
} as const;

interface VertexConfig {
  radius: number;
  spacing: number;
  scale: number;
}

const VERTEX_CONFIG: Record<string, VertexConfig> = {
  table: {
    radius: 90,
    spacing: 20,
    scale: 1.0,
  },
  sphere: {
    radius: 800,
    spacing: 2,
    scale: 2.0,
  },
  helix: {
    radius: 800,
    spacing: 8,
    scale: 1.1,
  },
};

// Initialize Three.js components
export const initializeScene = (width: number, height: number) => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    SCENE_CONFIG.fieldView,
    width / height,
    SCENE_CONFIG.near,
    SCENE_CONFIG.far
  );
  camera.position.z = SCENE_CONFIG.cameraZ;

  return { scene, camera };
};

export const initializeRenderer = (width: number, height: number) => {
  const renderer = new CSS3DRenderer();
  renderer.setSize(width, height * 0.9);
  Object.assign(renderer.domElement.style, RENDERER_STYLES);
  return renderer;
};

export const initializeControls = (
  camera: PerspectiveCamera,
  renderer: CSS3DRenderer,
  onRender: () => void
) => {
  const controls = new TrackballControls(camera, renderer.domElement);
  Object.assign(controls, CONTROLS_CONFIG);
  controls.addEventListener("change", onRender);
  return controls;
};

export const createCardElement = (item: any, index: number, config: Theme) => {
  const element = document.createElement("div");
  element.className = "element-card";

  const fragment = document.createDocumentFragment();

  const number = document.createElement("div");
  number.className = "card-id";
  number.textContent = item.uid;
  fragment.appendChild(number);

  const symbol = document.createElement("div");
  symbol.className = "card-name";
  symbol.textContent = item.name;
  fragment.appendChild(symbol);

  const detail = document.createElement("div");
  detail.className = "card-detail";
  detail.innerHTML = `${item.department}<br/>${item.identity}`;
  fragment.appendChild(detail);

  element.appendChild(fragment);

  return createElementStyle(
    element,
    item,
    index,
    config.patternList,
    config.patternColor,
    config.cardColor,
    {
      width: config.cardWidth,
      height: config.cardHeight,
    },
    config.textSize
  );
};

export const createTableVertices = (tableData: any[], globalConfig: GlobalConfig) => {
  const { cardWidth, cardHeight } = globalConfig.theme;
  const { radius, spacing } = VERTEX_CONFIG.table;

  return tableData.map((item) => {
    const object = new Object3D();
    object.position.set(
      item.x * (cardWidth + spacing * 2) - globalConfig.rowCount * radius,
      -item.y * (cardHeight + spacing) + 1000,
      0
    );
    return object;
  });
};

export const createSphereVertices = (objLength: number) => {
  const { radius, scale } = VERTEX_CONFIG.sphere;
  const vector = new Vector3();

  return Array.from({ length: objLength }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / objLength);
    const theta = Math.sqrt(objLength * Math.PI) * phi;
    const object = new Object3D();

    object.position.setFromSpherical(new Spherical(radius, phi, theta));

    vector.copy(object.position).multiplyScalar(scale);
    object.lookAt(vector);
    return object;
  });
};

export const createHelixVertices = (objLength: number) => {
  const { radius, spacing, scale } = VERTEX_CONFIG.helix;
  const vector = new Vector3();

  return Array.from({ length: objLength }, (_, i) => {
    const phi = i * 0.213 + Math.PI;
    const object = new Object3D();

    object.position.set(
      radius * Math.sin(phi),
      -(i * spacing) + 450,
      radius * Math.cos(phi + Math.PI)
    );
    object.scale.setScalar(scale);

    vector.set(object.position.x * 2, object.position.y, object.position.z * 2);

    object.lookAt(vector);
    return object;
  });
};
