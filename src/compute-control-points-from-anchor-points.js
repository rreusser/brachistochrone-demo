'use strict';

module.exports = computeControlPointsFromAnchorPoints;

var ndarray = require('ndarray');
var pool = require('ndarray-scratch');
var fill = require('ndarray-fill');
var solve = require('ndarray-lup-solve');
var lup = require('ndarray-lup-factorization');
var bspline = require('b-spline');

function computeControlPointsFromAnchorPoints (controlPoints, order, anchorPoints, knot, weight) {
  var n = anchorPoints.length;
  var M = pool.zeros([n, n]);
  var P = [];
  var input = [];

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      input[j] = [i === j ? 1 : 0];
    }
    fill(M.pick(null, i), function (j) {
      var t = j / (n - 1);
      return bspline(j / (n - 1), order, input, knot);
    });
  }

  var xC = [];
  var yC = [];
  for (var i = 0; i < n; i++) {
    xC[i] = anchorPoints[i][0];
    yC[i] = anchorPoints[i][1];
  }

  lup(M, M, P);
  solve(M, M, P, ndarray(xC));
  solve(M, M, P, ndarray(yC));

  for (var i = 0; i < n; i++) {
    controlPoints[i] = [];
    controlPoints[i][0] = xC[i]
    controlPoints[i][1] = yC[i]
  }

  pool.free(M);
}

