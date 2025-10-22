import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useRef, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
const ReplayScene = ({ frame, replayData }) => {
  const frameIndex = Math.min(Math.floor(frame / 30), replayData.length - 1);
  const frameData = replayData[frameIndex] || replayData[0];
  if (!frameData) return null;
  const progress = frame % 30 / 30;
  const nextFrameIndex = Math.min(frameIndex + 1, replayData.length - 1);
  const nextFrameData = replayData[nextFrameIndex];
  const cameraPosition = useMemo(() => {
    if (nextFrameData && frameIndex !== nextFrameIndex) {
      return new THREE.Vector3().lerpVectors(
        frameData.cameraPosition,
        nextFrameData.cameraPosition,
        progress
      );
    }
    return frameData.cameraPosition;
  }, [frameData, nextFrameData, progress, frameIndex, nextFrameIndex]);
  const cameraTarget = useMemo(() => {
    if (nextFrameData && frameIndex !== nextFrameIndex) {
      return new THREE.Vector3().lerpVectors(
        frameData.cameraTarget,
        nextFrameData.cameraTarget,
        progress
      );
    }
    return frameData.cameraTarget;
  }, [frameData, nextFrameData, progress, frameIndex, nextFrameIndex]);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("ambientLight", { intensity: 0.6 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 41,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("directionalLight", { position: [10, 20, 0], intensity: 0.6 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 42,
      columnNumber: 7
    }),
    frameData.stack.map((block, i) => /* @__PURE__ */ jsxDEV("mesh", { position: block.position, quaternion: block.quaternion, children: [
      /* @__PURE__ */ jsxDEV("boxGeometry", { args: [block.scale.x, block.scale.y, block.scale.z] }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 46,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV("meshLambertMaterial", { color: block.color }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 47,
        columnNumber: 11
      })
    ] }, `stack-${i}`, true, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 9
    })),
    frameData.overhangs.map((overhang, i) => {
      let position = overhang.position;
      let quaternion = overhang.quaternion;
      if (nextFrameData && nextFrameData.overhangs[i] && frameIndex !== nextFrameIndex) {
        position = new THREE.Vector3().lerpVectors(
          overhang.position,
          nextFrameData.overhangs[i].position,
          progress
        );
        quaternion = new THREE.Quaternion().slerpQuaternions(
          overhang.quaternion,
          nextFrameData.overhangs[i].quaternion,
          progress
        );
      }
      return /* @__PURE__ */ jsxDEV("mesh", { position, quaternion, children: [
        /* @__PURE__ */ jsxDEV("boxGeometry", { args: [overhang.scale.x, overhang.scale.y, overhang.scale.z] }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 70,
          columnNumber: 13
        }),
        /* @__PURE__ */ jsxDEV("meshLambertMaterial", { color: overhang.color }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 71,
          columnNumber: 13
        })
      ] }, `overhang-${i}`, true, {
        fileName: "<stdin>",
        lineNumber: 69,
        columnNumber: 11
      });
    }),
    /* @__PURE__ */ jsxDEV(
      "perspectiveCamera",
      {
        makeDefault: true,
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        lookAt: cameraTarget
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 76,
        columnNumber: 7
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 40,
    columnNumber: 5
  });
};
const ReplayComposition = ({ replayData, finalScore }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: "#d0e7f9" }, children: [
    /* @__PURE__ */ jsxDEV(
      ThreeCanvas,
      {
        orthographic: false,
        width: 540,
        height: 960,
        style: { width: "100%", height: "100%" },
        children: /* @__PURE__ */ jsxDEV(ReplayScene, { frame, replayData }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 97,
          columnNumber: 9
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 91,
        columnNumber: 7
      }
    ),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "5%",
      pointerEvents: "none"
    }, children: /* @__PURE__ */ jsxDEV("h1", { style: {
      color: "white",
      fontSize: "72px",
      textShadow: "4px 4px 8px rgba(0,0,0,0.8)",
      margin: 0
    }, children: [
      "Score: ",
      finalScore
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 106,
      columnNumber: 9
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 100,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: "5%",
      pointerEvents: "none"
    }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      color: "white",
      fontSize: "36px",
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
    }, children: "Instant Replay" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 122,
      columnNumber: 9
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 116,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 90,
    columnNumber: 5
  });
};
export {
  ReplayComposition
};
