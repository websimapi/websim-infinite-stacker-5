import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useMemo, useRef, useEffect } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate
} from "remotion";
import { ThreeCanvas, useThree } from "@remotion/three";
import * as THREE from "three";
import * as CANNON from "cannon-es";
const BLOCK_HEIGHT = 0.25;
const ThreeScene = ({ replayData }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const worldRef = useRef(null);
  const blocksRef = useRef([]);
  const { stack, overhangs, lastFrame } = useMemo(() => {
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    const baseBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(0.5, BLOCK_HEIGHT / 2, 0.5)),
      position: new CANNON.Vec3(0, -BLOCK_HEIGHT, 0)
    });
    world.addBody(baseBody);
    const localStack = [];
    const localOverhangs = [];
    replayData.forEach((step, i) => {
      if (step.placed) {
        const { x, y, z, width, depth, color } = step.placed;
        const body = new CANNON.Body({
          mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(width / 2, BLOCK_HEIGHT / 2, depth / 2)),
          position: new CANNON.Vec3(x, y, z)
        });
        world.addBody(body);
        localStack.push({ data: { ...step.placed }, body });
      }
      if (step.overhang) {
        const { x, y, z, width, depth, color } = step.overhang;
        const body = new CANNON.Body({
          mass: 1,
          shape: new CANNON.Box(new CANNON.Vec3(width / 2, BLOCK_HEIGHT / 2, depth / 2)),
          position: new CANNON.Vec3(x, y, z)
        });
        world.addBody(body);
        localOverhangs.push({ data: { ...step.overhang }, body, startFrame: (i + 1) * 60 });
      }
    });
    worldRef.current = world;
    return { stack: localStack, overhangs: localOverhangs, lastFrame: replayData.length * 60 };
  }, [replayData]);
  useEffect(() => {
    const physicsFrame = Math.min(frame, lastFrame);
    stack.forEach((b) => b.body.position.copy(b.data));
    overhangs.forEach((o) => {
      o.body.position.set(o.data.x, o.data.y, o.data.z);
      o.body.velocity.set(0, 0, 0);
      o.body.angularVelocity.set(0, 0, 0);
      o.body.quaternion.set(0, 0, 0, 1);
    });
    for (let i = 0; i < physicsFrame; i++) {
      overhangs.forEach((o) => {
        if (i === o.startFrame) {
          o.body.velocity.set((Math.random() - 0.5) * 2, -1, (Math.random() - 0.5) * 2);
          o.body.angularVelocity.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
        }
      });
      worldRef.current.step(1 / 30);
    }
    if (blocksRef.current.length > 0) {
      overhangs.forEach((o, i) => {
        const mesh = blocksRef.current[i];
        if (frame >= o.startFrame) {
          mesh.position.copy(o.body.position);
          mesh.quaternion.copy(o.body.quaternion);
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      });
    }
  }, [frame, stack, overhangs, lastFrame]);
  useEffect(() => {
    const aspect = 540 / 960;
    const frustumSize = 4;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.near = 1;
    camera.far = 100;
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  const cameraY = interpolate(frame, [0, replayData.length * 60], [4, 4 + replayData.length * BLOCK_HEIGHT]);
  camera.position.y = cameraY;
  const lookAtY = interpolate(frame, [0, replayData.length * 60], [0, replayData.length * BLOCK_HEIGHT * 0.5]);
  camera.lookAt(0, lookAtY, 0);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("ambientLight", { intensity: 0.6 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 123,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("directionalLight", { position: [10, 20, 0], intensity: 0.6 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 124,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("mesh", { "position-y": -BLOCK_HEIGHT, children: [
      /* @__PURE__ */ jsxDEV("boxGeometry", { args: [1, BLOCK_HEIGHT, 1] }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 128,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV("meshLambertMaterial", { color: "#aaaaaa" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 129,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 127,
      columnNumber: 7
    }),
    replayData.map((step, i) => {
      if (!step.placed) return null;
      const isVisible = frame >= (i + 1) * 60;
      return /* @__PURE__ */ jsxDEV("mesh", { visible: isVisible, position: [step.placed.x, step.placed.y, step.placed.z], children: [
        /* @__PURE__ */ jsxDEV("boxGeometry", { args: [step.placed.width, BLOCK_HEIGHT, step.placed.depth] }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 138,
          columnNumber: 13
        }),
        /* @__PURE__ */ jsxDEV("meshLambertMaterial", { color: `#${step.placed.color}` }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 139,
          columnNumber: 13
        })
      ] }, `p-${i}`, true, {
        fileName: "<stdin>",
        lineNumber: 137,
        columnNumber: 11
      });
    }),
    overhangs.map((o, i) => /* @__PURE__ */ jsxDEV("mesh", { ref: (el) => blocksRef.current[i] = el, children: [
      /* @__PURE__ */ jsxDEV("boxGeometry", { args: [o.data.width, BLOCK_HEIGHT, o.data.depth] }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 147,
        columnNumber: 13
      }),
      /* @__PURE__ */ jsxDEV("meshLambertMaterial", { color: `#${o.data.color}` }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 148,
        columnNumber: 13
      })
    ] }, `o-${i}`, true, {
      fileName: "<stdin>",
      lineNumber: 146,
      columnNumber: 10
    }))
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 122,
    columnNumber: 5
  });
};
const ReplayComposition = ({ replayData, finalScore }) => {
  const { fps } = useVideoConfig();
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#d0e7f9" }, children: [
    /* @__PURE__ */ jsxDEV(ThreeCanvas, { width: 540, height: 960, orthographic: true, children: /* @__PURE__ */ jsxDEV(ThreeScene, { replayData }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 162,
      columnNumber: 9
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 161,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "10%"
    }, children: /* @__PURE__ */ jsxDEV("h1", { style: { color: "white", fontSize: "72px", textShadow: "3px 3px 6px rgba(0,0,0,0.5)" }, children: [
      "Score: ",
      finalScore
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 170,
      columnNumber: 9
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 165,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 160,
    columnNumber: 5
  });
};
export {
  ReplayComposition
};
