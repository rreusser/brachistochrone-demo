'use strict';

var d3 = require('d3');
var Spline = require('./spline');
var Brachistochrone = require('./brachistochrone');

var el = document.getElementById('plot');

var margin = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 50
};

var transitionDuration = 0;

var width = el.offsetWidth - margin.right - margin.left;
var height = el.offsetHeight - margin.top - margin.bottom;

var nCurve = 100;
var yMin = 0;
var yMax = 2;
var xMin = 0;
var xMax = xMin + (yMax - yMin) * width / height;
var xScale, yScale;
var lineplot, drag, line, solutionPath, trialPath, handles;

var brachistochrone = new Brachistochrone (
  xMin + (xMax - xMin) * 0.1,
  yMin + (yMax - yMin) * 0.9,
  xMin + (xMax - xMin) * 0.9,
  yMin + (yMax - yMin) * 0.2,
  9.81
);

var nAnchor = 4;
var solutionCurve = [];
var testCurve = [];
var testAnchors = [];
var testSpline;

initializeSolution();
initializeSVG();

function computeControlPoints () {
  testSpline.fromAnchorPoints(testAnchors);
}

function computeAnchorPoints () {
  testAnchors = brachistochrone.tabulate(nAnchor);
}

function tabulateTestSpline () {
  testCurve = testSpline.tabulate(nCurve);
}

function initializeSolution () {
  brachistochrone.solve();
  computeAnchorPoints();
  solutionCurve = brachistochrone.tabulate(nCurve);

  testSpline = new Spline(4, nAnchor);
  testSpline.fromAnchorPoints(testAnchors);
  testAnchors = testSpline.fitToFunction(brachistochrone.evaluateByX, brachistochrone.a, brachistochrone.b);
  tabulateTestSpline();
}

function updateSolution () {
  brachistochrone.solve();
  solutionCurve = brachistochrone.tabulate(nCurve);
}

function initializeSVG() {
  xScale = d3.scale.linear().domain([xMin, xMax]).range([0, width]);
  yScale = d3.scale.linear().domain([yMin, yMax]).range([height, 0]);

  var xAxis = d3.svg.axis().orient('bottom').scale(xScale).ticks(11, d3.format(',d'));
  var yAxis = d3.svg.axis().orient('left').scale(yScale);

  var svg = d3.select('#plot').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('class', 'gRoot');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('text')
      .attr('class', 'x label')
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('y', height - 3)
      .text('x, meters');

  svg.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', 0)
      .attr('y', 15)
      .attr('transform', 'rotate(-90)')
      .text('y, meters');

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  lineplot = svg.append('g')
      .attr('class', 'lineplot');

  drag = d3.behavior.drag()
      .on('dragstart', dragstarted)
      .on('drag', dragged)
      .on('dragend', dragended);

  line = d3.svg.line()
    .x(function (d) { return xScale(d[0]); })
    .y(function (d) { return yScale(d[1]); });

  solutionPath = lineplot.append('path')
      .attr('class', 'ref-curve')
      .attr('d', line(solutionCurve));

  trialPath = lineplot.append('path')
      .attr('class', 'trial-path')
      .attr('d', line(testCurve));

  draw();
}

function isEndpoint (d, i) {
  return i === 0 || i === testAnchors.length - 1;
}

function draw () {
  handles = lineplot.selectAll('g')
      .data(testAnchors);

  var gEnter = handles.enter().append('g')
      .attr('class', 'pt')
      .attr('transform', function (d) { return 'translate(' + xScale(d[0]) + ',' + yScale(d[1]) + ')'; })
      .call(drag)
      .on('mouseover', function (d, i) { d3.select(this).classed('hover', true); })
      .on('mouseout', function (d, i) { d3.select(this).classed('hover', false); });

  gEnter.classed('draggable', true);

  gEnter.filter(function (d, i) { if (i === nAnchor - 1 || i === 0) { return true; } })
    .classed('draggable-nsew', true);

  gEnter.append('circle')
      .attr('r', 20)
      .attr('class', 'handle')
      .attr('opacity', 0.05);

  gEnter.append('circle')
      .attr('class', 'dot')
      .attr('r', 2);

  handles.transition().duration(transitionDuration)
      .attr('transform', function (d) { return 'translate(' + xScale(d[0]) + ',' + yScale(d[1]) + ')'; });

  handles.exit().remove();

  trialPath.transition().duration(transitionDuration)
      .attr('d', line(testCurve));

  solutionPath.transition().duration(transitionDuration)
      .attr('d', line(solutionCurve));
}

function dragstarted (d, i) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed('dragging', true);
}

function dragged (d, i) {
  var x = Math.max(xMin, Math.min(xMax, xScale.invert(d3.event.x)));
  var y = Math.max(yMin, Math.min(yMax, yScale.invert(d3.event.y)));

  if (i === nAnchor - 1) {
    brachistochrone.b = x;
    brachistochrone.B = y;
  } else if (i === 0) {
    brachistochrone.a = x;
    brachistochrone.A = y;
  }

  testAnchors[i][0] = x;
  testAnchors[i][1] = y;

  if (isEndpoint(d, i)) {
    updateSolution();
  }

  computeControlPoints();
  tabulateTestSpline();

  draw();
}

function dragended (d, i) {
  d3.select(this).classed('dragging', false);

  if (isEndpoint(d, i)) {
    updateSolution();
  }

  computeControlPoints();
  tabulateTestSpline();

  draw();
}
