import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { ReplayComposition } from "./composition.jsx";
let root = null;
function showReplay(replayData) {
  const replayContainer = document.getElementById("replay-container");
  replayContainer.innerHTML = "";
  replayContainer.classList.remove("hidden");
  const playerContainer = document.createElement("div");
  playerContainer.className = "player-container";
  replayContainer.appendChild(playerContainer);
  const closeButton = document.createElement("div");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    if (root) {
      root.unmount();
      root = null;
    }
    replayContainer.classList.add("hidden");
    replayContainer.innerHTML = "";
  };
  playerContainer.appendChild(closeButton);
  const duration = replayData.length * 30;
  const score = replayData.length - 1;
  root = createRoot(playerContainer);
  root.render(
    /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: ReplayComposition,
        durationInFrames: duration,
        fps: 30,
        compositionWidth: 540,
        compositionHeight: 960,
        loop: true,
        controls: true,
        autoplay: true,
        style: { width: "100%", height: "100%" },
        inputProps: { replayData, finalScore: score }
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 36,
        columnNumber: 7
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 35,
      columnNumber: 5
    }, this)
  );
}
export {
  showReplay
};
