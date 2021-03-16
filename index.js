"use strict";
const bbox = require("@turf/bbox").default;
const voronoi = require("@turf/voronoi");
const difference = require("@turf/difference");
const pointInPoly = require("@turf/boolean-point-in-polygon").default;
const union = require("@turf/union").default;

module.exports = function (polygon, points) {
  const box = bbox(polygon);
  const polys = voronoi(
    { type: "FeatureCollection", features: points },
    { bbox: box }
  ).features.reduce((m, f) => {
    const mask = difference(f, polygon);
    if (mask === null) {
      m.push(f);
      return m;
    }

    const out = difference(f, mask);
    if (out.geometry.type === "Polygon") {
      m.push(out);
      return m;
    }

    out.geometry.coordinates.forEach((lr) => {
      m.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: lr,
        },
      });
    });

    return m;
  }, []);

  const hasPoint = [];
  const noPoint = [];
  for (const poly of polys) {
    let found = false;
    for (const point of points) {
      if (pointInPoly(point, poly)) {
        found = true;
      }
    }
    if (found) {
      hasPoint.push(poly);
    } else {
      noPoint.push(poly);
    }
  }

  for (const poly of noPoint) {
    let merged = false;
    for (let i = 0; i < hasPoint.length; i++) {
      const one = union(poly, hasPoint[i]);
      if (one.geometry.type === "Polygon") {
        hasPoint[i] = one;
        merged = true;
        break;
      }
    }
    if (merged === false) {
      throw new Error("Unable to join a pointless polygon to a pointfull one");
    }
  }

  return hasPoint;
};
