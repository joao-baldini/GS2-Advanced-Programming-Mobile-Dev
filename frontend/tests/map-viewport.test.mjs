import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampViewport,
  INITIAL_VIEWPORT,
  toViewBox,
  zoomViewport,
} from "../src/utils/mapViewport.ts";

test("zoom remains between 100% and 400%", () => {
  assert.equal(zoomViewport(INITIAL_VIEWPORT, 10).zoom, 4);
  assert.deepEqual(zoomViewport(INITIAL_VIEWPORT, 0.5), INITIAL_VIEWPORT);
});
test("panning is constrained to the territory boundaries", () => {
  assert.deepEqual(clampViewport({ zoom: 2, x: -100, y: 900 }), {
    zoom: 2,
    x: 180,
    y: 285,
  });
});
test("zoom changes the visible extent while reset restores the whole territory", () => {
  assert.equal(toViewBox(zoomViewport(INITIAL_VIEWPORT, 2)), "180 95 360 190");
  assert.equal(toViewBox(INITIAL_VIEWPORT), "0 0 720 380");
});
