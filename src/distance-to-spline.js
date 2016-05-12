'use strict';

var closestPoint = require('./closest-point-finder');
var l2Distance = require('./l2-distance');
var bspline = require('b-spline');

module.exports = distanceToSpline;

function distanceToSpline (p0, order, points, knots, weight) {
  var options = {};

  if (knots) {
    options.lowerBound = knots[0];
    options.upperBound = knots[knots.length - 1];
  } else {
    options.lowerBound = 0;
    options.upperBound = knots.length - 1;
  }

  var func = function (t) {
    t = Math.min(Math.max(options.lowerBound, t), options.upperBound);
    return bspline(t, order, points, knots, weight);

  };

  var tMin = closestPoint(p0, func, options);

  return l2Distance(p0, bspline(tMin, order, points, knots, weight));
}
