'use strict';

module.exports = uniformKnotVector;

function uniformKnotVector (n, order) {
  var len = n + order;
  var knot = [];
  for (var i = 0; i < order; i++) {
    knot[i] = 0;
    knot[len - i - 1] = 1;
  }
  for (var i = 0; i < n - order; i++) {
    knot[order + i] = (i + 1) / (n + 1 - order);
  }
  return knot;
}

