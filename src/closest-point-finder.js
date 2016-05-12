'use strict';

var minimize = require('minimize-golden-section-1d');
var l2Distance = require('./l2-distance');

module.exports = closestPoint;

function closestPoint (p, f, options) {
  //console.log('get closest:', p, options)

  return minimize(function (x) {
    //console.log('x=',x);
    return l2Distance(p, f(x));
  }, options);
}

