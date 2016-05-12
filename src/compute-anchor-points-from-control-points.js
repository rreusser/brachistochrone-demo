'use strict';

var bspline = require('b-spline');

module.exports = computeControlPointsFromAnchorPoints;

function computeControlPointsFromAnchorPoints (anchorPoints, order, controlPoints, knot, weight) {
  var n = controlPoints.length;

  for (var i = 0; i < n; i++) {
    anchorPoints[i] = bspline(i / (n - 1), order, controlPoints, knot, weight);
  }
}
