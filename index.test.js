"use strict";

const stringify = require("json-stable-stringify");
const irregularVoronoi = require("./index");
const { writeFileSync } = require("fs");

function feature(type, coordinates) {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type,
      coordinates,
    },
  };
}

test("handles when only one point is passed", () => {
  const minx = 0;
  const miny = 0;
  const maxx = 10;
  const maxy = 10;

  const poly = feature("Polygon", [
    [
      [minx, miny],
      [maxx, miny],
      [maxx, maxy],
      [minx, miny],
    ],
  ]);

  const points = [feature("Point", [2, 2])];

  const out = irregularVoronoi(poly, points);
  expect(out.length).toBe(1);
});

test("handles when a bbox is an input", () => {
  const minx = 0;
  const miny = 0;
  const maxx = 10;
  const maxy = 10;

  const poly = feature("Polygon", [
    [
      [minx, miny],
      [maxx, miny],
      [maxx, maxy],
      [minx, maxy],
      [minx, miny],
    ],
  ]);

  const points = [feature("Point", [2, 2]), feature("Point", [8, 8])];

  const out = irregularVoronoi(poly, points);
  expect(out.length).toBe(2);
});

test("works", () => {
  const input = require("./__fixtures__/input.json");

  const polygon = input[0];
  const points = input.slice(1);

  const polys = irregularVoronoi(polygon, points);
  const fc = {
    type: "FeatureCollection",
    features: polys.concat(points),
  };

  writeFileSync("./__fixtures__/result.json", stringify(fc));

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

  writeFileSync("./__fixtures__/lake-result.json", stringify(fc));

  expect(polys).toMatchSnapshot();
});
