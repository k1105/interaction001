import dynamic from "next/dynamic";
import p5Types from "p5";
import { MutableRefObject } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { updateHandposeHistory } from "../lib/updateHandposeHistory";
import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { getShapedRawHandpose } from "../lib/getShapedRawHandpose";

type Props = {
  handpose: MutableRefObject<handPoseDetection.Hand[]>;
};

const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const HandSketch = ({ handpose }: Props) => {
  let handposeHistory: {
    left: Keypoint[][];
    right: Keypoint[][];
  } = { left: [], right: [] };

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(255);
    p5.strokeWeight(10);
  };

  const draw = (p5: p5Types) => {
    handposeHistory = updateHandposeHistory(handpose.current, handposeHistory); //handposeHistoryの更新
    const hands = getSmoothedHandpose(handpose.current, handposeHistory); //平滑化された手指の動きを取得する

    p5.background(1, 25, 96);
    const D = 100;
    if (hands.left.length > 0) {
      p5.push();
      p5.translate(p5.width / 2 - 300, p5.height / 2 + 50);
      p5.noStroke();
      for (let i = 0; i < 5; i++) {
        const start = i * 4 + 1;
        const end = i * 4 + 4;
        const d = hands.left[end].y - hands.left[start].y;
        p5.ellipse(
          D * Math.cos(((Math.PI * 2) / 5) * i),
          D * Math.sin(((Math.PI * 2) / 5) * i),
          d
        );
      }
      p5.pop();
    }
    if (hands.right.length > 0) {
      p5.push();
      p5.translate(p5.width / 2 + 300, p5.height / 2 + 50);
      p5.noStroke();
      for (let i = 0; i < 5; i++) {
        const start = i * 4 + 1;
        const end = i * 4 + 4;
        const d = hands.right[end].y - hands.right[start].y;
        p5.ellipse(
          D * Math.cos(((Math.PI * 2) / 5) * i),
          D * Math.sin(((Math.PI * 2) / 5) * i),
          d
        );
      }
      p5.pop();
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
