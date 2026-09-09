import { slantedEdgeAlgorithm } from "./slanted-edge.js";
import { siemensStarAlgorithm } from "./siemens-star.js";
import { deadLeavesAlgorithm } from "./dead-leaves.js";
import { linePairsAlgorithm } from "./line-pairs.js";
import { colorCheckerAlgorithm } from "./color-checker.js";
import { grayScaleAlgorithm } from "./gray-scale.js";
import { checkerboardAlgorithm } from "./checkerboard.js";
import { uniformityAlgorithm } from "./uniformity.js";

export const algorithmRegistry = {
  slantedEdge: slantedEdgeAlgorithm,
  siemensStar: siemensStarAlgorithm,
  deadLeaves: deadLeavesAlgorithm,
  linePairs: linePairsAlgorithm,
  colorChecker: colorCheckerAlgorithm,
  grayScale: grayScaleAlgorithm,
  checkerboard: checkerboardAlgorithm,
  uniformity: uniformityAlgorithm
};
