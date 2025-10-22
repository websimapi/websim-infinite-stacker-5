import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import {
  AbsoluteFill,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing
} from "remotion";
const BLOCK_HEIGHT = 0.25;
const ORIGINAL_BLOCK_SIZE = 1;
const Block3D = ({ x, y, z, width, depth, color }) => {
  const scale = 80;
  const height = BLOCK_HEIGHT * scale;
  const w = width * scale;
  const d = depth * scale;
  const style = {
    transformStyle: "preserve-3d",
    position: "absolute",
    width: `${w}px`,
    height: `${height}px`,
    top: `calc(50% - ${height / 2}px)`,
    left: `calc(50% - ${w / 2}px)`,
    transform: `translateX(${x * scale}px) translateY(${y * scale}px) translateZ(${z * scale}px)`
  };
  const faceStyle = (c) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    background: c,
    border: "1px solid rgba(0,0,0,0.3)",
    boxSizing: "border-box"
  });
  return /* @__PURE__ */ jsxDEV("div", { style, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), height: `${d}px`, width: `${w}px`, transform: `translateY(${(height - d) / 2}px) rotateX(90deg)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 42,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), transform: `translateZ(${d / 2}px)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 43,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), transform: `translateZ(-${d / 2}px)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 44,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), width: `${d}px`, transform: `translateX(${(w - d) / 2}px) rotateY(90deg)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), width: `${d}px`, transform: `translateX(-${(w - d) / 2}px) rotateY(-90deg)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 46,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { ...faceStyle(color), height: `${d}px`, width: `${w}px`, transform: `translateY(-${(height - d) / 2}px) rotateX(-90deg)` } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 47,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 41,
    columnNumber: 5
  });
};
const PlacedBlock = ({ data }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const scale = spring({
    fps,
    frame,
    config: { stiffness: 100, damping: 15 },
    durationInFrames: 30
  });
  return /* @__PURE__ */ jsxDEV("div", { style: { transform: `scale(${scale})` }, children: /* @__PURE__ */ jsxDEV(Block3D, { ...data }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 63,
    columnNumber: 55
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 63,
    columnNumber: 10
  });
};
const FallingBlock = ({ data }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 60], [data.y, data.y - 10], {
    easing: Easing.in(Easing.cubic),
    extrapolateRight: "clamp"
  });
  const rotate = interpolate(frame, [0, 60], [0, 90]);
  return /* @__PURE__ */ jsxDEV("div", { style: { transform: `rotateZ(${rotate}deg)` }, children: /* @__PURE__ */ jsxDEV(Block3D, { ...data, y }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 75,
    columnNumber: 60
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 75,
    columnNumber: 10
  });
};
const ReplayComposition = ({ replayData, finalScore }) => {
  const { fps } = useVideoConfig();
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: "linear-gradient(to bottom, #d0e7f9, #78a7c9)" }, children: [
    /* @__PURE__ */ jsxDEV(Series, { children: [
      /* @__PURE__ */ jsxDEV(Series.Sequence, { durationInFrames: 60, children: /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", transformStyle: "preserve-3d", perspective: "2000px" }, children: /* @__PURE__ */ jsxDEV("div", { style: { transform: "rotateX(60deg) rotateZ(0deg) translateY(200px)" }, children: /* @__PURE__ */ jsxDEV(
        Block3D,
        {
          x: 0,
          y: 0,
          z: 0,
          width: ORIGINAL_BLOCK_SIZE,
          depth: ORIGINAL_BLOCK_SIZE,
          color: "#aaaaaa"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 87,
          columnNumber: 15
        }
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 86,
        columnNumber: 13
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 85,
        columnNumber: 11
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 84,
        columnNumber: 9
      }),
      replayData.map((step, i) => /* @__PURE__ */ jsxDEV(Series.Sequence, { durationInFrames: 60, children: /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", transformStyle: "preserve-3d", perspective: "2000px" }, children: /* @__PURE__ */ jsxDEV("div", { style: { transform: `rotateX(60deg) rotateZ(0deg) translateY(${interpolate(i, [0, replayData.length], [200, -200 - replayData.length * 10])}px)` }, children: [
        /* @__PURE__ */ jsxDEV(Block3D, { x: 0, y: 0, z: 0, width: 1, depth: 1, color: "#aaaaaa" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 100,
          columnNumber: 17
        }),
        replayData.slice(0, i).map((s, j) => s.placed && /* @__PURE__ */ jsxDEV(Block3D, { ...s.placed }, `p-${j}`, false, {
          fileName: "<stdin>",
          lineNumber: 102,
          columnNumber: 31
        })),
        step.placed && /* @__PURE__ */ jsxDEV(PlacedBlock, { data: step.placed }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 104,
          columnNumber: 33
        }),
        step.overhang && /* @__PURE__ */ jsxDEV(FallingBlock, { data: step.overhang }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 105,
          columnNumber: 35
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 99,
        columnNumber: 15
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 98,
        columnNumber: 13
      }) }, i, false, {
        fileName: "<stdin>",
        lineNumber: 97,
        columnNumber: 11
      }))
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 83,
      columnNumber: 7
    }),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { justifyContent: "flex-end", alignItems: "center", paddingBottom: "15%" }, children: /* @__PURE__ */ jsxDEV("h1", { style: { color: "white", fontSize: "96px", textShadow: "4px 4px 8px rgba(0,0,0,0.5)" }, children: [
      "Score: ",
      finalScore
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 112,
      columnNumber: 9
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 111,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 82,
    columnNumber: 5
  });
};
export {
  ReplayComposition
};
