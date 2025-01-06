import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

interface AnimationConfig {
  duration: number;
  easing: (k: number) => number;
}

export const defaultAnimationConfig: AnimationConfig = {
  duration: 1000,
  easing: TWEEN.Easing.Exponential.InOut,
};

export const createPositionTween = (
  object: THREE.Object3D,
  target: THREE.Vector3,
  config: AnimationConfig
) => {
  return new TWEEN.Tween(object.position)
    .to(
      {
        x: target.x,
        y: target.y,
        z: target.z,
      },
      config.duration + Math.random() * config.duration
    )
    .easing(config.easing);
};

export const createRotationTween = (
  object: THREE.Object3D,
  target: THREE.Euler,
  config: AnimationConfig
) => {
  return new TWEEN.Tween(object.rotation)
    .to(
      {
        x: target.x,
        y: target.y,
        z: target.z,
      },
      config.duration + Math.random() * config.duration
    )
    .easing(config.easing);
};
