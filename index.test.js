"use strict";

const irregularVoronoi = require("./index");
const { writeFileSync } = require("fs");

test("works", () => {
  const input = require("./__fixtures__/input.json");

  const polygon = input[0];
  const points = input.slice(1);

  const polys = irregularVoronoi(polygon, points);
  const fc = {
    type: "FeatureCollection",
    features: polys.concat(points),
  };

  writeFileSync("./__fixtures__/result.json", JSON.stringify(fc));

  expect(polys).toMatchSnapshot();
});
