"use strict";
const bbox = require("@turf/bbox").default;
const voronoi = require("@turf/voronoi");
const pointInPoly = require("@turf/boolean-point-in-polygon").default;
const polygonClipping = require("polygon-clipping");

function bboxPoly(bbox) {
  const [minx, miny, maxx, maxy] = bbox;
  return [
    [
      [minx, miny],
      [maxx, miny],
      [maxx, maxy],
      [minx, maxy],
      [minx, miny],
    ],
  ];
}

module.exports = function (polygon, points) {
  const box = bbox(polygon);
  const mask = polygonClipping.difference(
    bboxPoly(box),
    polygon.geometry.coordinates
  );
  if (mask.length === 0) throw Error("Failed to diff");

  const vorPolys = voronoi(
    { type: "FeatureCollection", features: points },
    { bbox: box }
  ).features.reduce((m, f) => {
    m.push(f.geometry.coordinates);
    return m;
  }, []);

  const polys = vorPolys.reduce((m, vp) => {
    return m.concat(
      polygonClipping.difference(vp, mask).map((coordinates) => {
        return {
          type: "Polygon",
          coordinates,
        };
      })
    );
  }, []);

  const hasPoint = [];
  let noPoint = [];
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
      noPoint.push(poly.coordinates);
    }
  }

  if (noPoint.length > 1) {
    noPoint = polygonClipping.union(...noPoint);
  }
  noPoint = noPoint.map((coordinates) => {
    return {
      type: "Polygon",
      coordinates,
    };
  });

  for (const poly of noPoint) {
    let merged = false;
    for (let i = 0; i < hasPoint.length; i++) {
      const one = polygonClipping.union(
        poly.coordinates,
        hasPoint[i].coordinates
      );
      if (one.length === 1) {
        hasPoint[i].coordinates = one[0];
        merged = true;
        break;
      }
    }
    if (merged === false) {
      throw new Error("Unable to join a pointless polygon to a pointfull one");
    }
  }

  return hasPoint.map((geometry) => {
    return {
      type: "Feature",
      properties: {},
      geometry,
    };
  });
};
