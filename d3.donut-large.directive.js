/*global angular, donutLargeChart*/
angular
    .module('app')
    .directive('donutLargeChart', donutLargeChart);

donutLargeChart.$inject = ['$window', '$timeout', 'd3Service'];

function donutLargeChart($window, $timeout, d3Service) {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            data: '=',
            graphid: '@'
        },
        link: function (scope, element, attrs) {

            d3Service.d3().then(function (d3) {
                var height = 120;
                var width = 120;
                var τ = 2 * Math.PI;
                var arc = d3.svg.arc()
                    .innerRadius(50)
                    .outerRadius(55)
                    .cornerRadius(20)
                    .startAngle(0);
                var foreground, info;
                var rendered = false;

                // creates the svg element in the directive div
                var svg = d3.select(element[0])
                    .append('svg')
                    .attr('height', height)
                    .append('g')
                    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

                // watch for data changes and re-render
                scope.$watch('data', function (newVals, oldVals) {
                    if (rendered) {
                        return scope.update(newVals);
                    }
                }, true);

                // Watch for resize event
                scope.$watch(function () {
                    return angular.element($window)[0].innerWidth;
                }, function () {
                    scope.render(scope.data);
                });

                /**
                 * when the data changes update the arc and text
                 * @param {number} data between 1 and 100
                 */
                scope.update = function (data) {
                    info.select('text')
                        .transition()
                        .duration(1500)
                        .style("fill", getColour(data))
                        .text(data);

                    var value = data / 100;
                    foreground.transition()
                        .duration(1500)
                        .style("stroke", getColour(data))
                        .call(arcTween, value * τ);
                };

                /**
                 * draws the donut chart on the screen
                 * @param {number} data
                 */
                scope.render = function (data) {
                    // If we don't pass any data, return out of the element
                    if (!data) {
                        return;
                    }

                    // Add the background arc, from 0 to 100% (τ).
                    svg.append('path')
                        .datum({
                            endAngle: τ
                        })
                        .attr('class', 'outer')
                        .attr('d', arc);

                    // adds the forground part to the donut
                    foreground = svg.append('path')
                        .datum({
                            endAngle: 0.127 * τ
                        })
                        .attr('stroke', 'red')
                        .attr('d', arc);

                    var value = data / 100;
                    foreground.transition()
                        .duration(1500)
                        .style("stroke", getColour(data))
                        .call(arcTween, value * τ);

                    // adds the text element in the middle of the donut
                    info = svg.append('g')
                        .attr('class', 'info');

                    info.append('text')
                        .text(data)
                        .attr('text-anchor', 'middle')
                        .attr('class', 'name')
                        .style("fill", 'red')
                        .attr('transform', 'translate(0,10)');

                    info.select('text')
                        .transition()
                        .duration(1500)
                        .style("fill", getColour(data))
                        .text(data);

                    // stops the update function working before it has been rendered
                    rendered = true;
                };

                /**
                 * Creates a tween on the specified transition's 'd' attribute, transitioning
                 * any selected arcs from their current angle to the specified new angle.
                 */
                function arcTween(transition, newAngle) {
                    transition.attrTween('d', function (d) {
                        var interpolate = d3.interpolate(d.endAngle, newAngle);

                        return function (t) {
                            d.endAngle = interpolate(t);
                            return arc(d);
                        };
                    });
                }
            });
        }
    };
}

function getColour(data) {
    var colour;

    if (data < 50) {
        colour = '#ff4d4d';
    } else if (data < 70) {
        colour = '#fbc300';
    } else if (data <= 100) {
        colour = '#66b366';
    }

    return colour;
}
