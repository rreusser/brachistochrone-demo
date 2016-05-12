'use strict';

var distanceToSpline = require('./distance-to-spline');
var minimize = require('minimize-powell');

module.exports = fitSplineToCurve;

function fitSplineToCurve (f, t0, t1, n, order, points, knot, weight) {
  var i;
  var y = [];

  var samples = 10;

  // Compute the endpoints:
  var f0 = f(t0);
  var f1 = f(t1);

  // Infer the dimensionality:
  var dim = f0.length;

  var pts = [];

  for (i = 0; i < points.length; i++) {
    pts[i] = points[i].slice(0);
  }

  pts[0] = f(t0);
  pts[n - 1] = f(t1);

  // Construct a solution vector:
  for (i = 1; i < n - 1; i++) {
    y[2 * i - 2] = pts[i][0];
    y[2 * i - 1] = pts[i][1];
  }

  var func = function (y0) {
    var err = 0;
    for (var sample = 0; sample < samples; sample++) {
      var t = t0 + (t1 - t0) * sample / (samples - 1);

      var pRef = f(t);

      for (var i = 1; i < n - 1; i++) {
        pts[i][0] = y0[2 * i - 2];
        pts[i][1] = y0[2 * i - 1];
      }

      var dist = distanceToSpline(pRef, order, pts, knot, weight);
      err += dist * dist;
    }

    return err;
  };

  var soln =  minimize(func, y, {initialIncrement: 1e-3});

  for (var i = 1; i < n - 1; i++) {
    pts[i][0] = soln[2 * i - 2];
    pts[i][1] = soln[2 * i - 1];
  }

  return pts;
}
