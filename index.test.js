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

test("works with crazy lakes", () => {
  const polygon = require("./__fixtures__/lake.json");
  const points = require("./__fixtures__/lake-points.json");

  const polys = irregularVoronoi(polygon, points);
  const fc = {
    type: "FeatureCollection",
    features: polys.concat(points),
  };

  writeFileSync("./__fixtures__/lake-result.json", JSON.stringify(fc));

  expect(polys).toMatchSnapshot();
});
