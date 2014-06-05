iObserveApp.controller('ChartCtrl-firstTurnEstimation', function($scope, iObserveData, ngProgress) {

    Array.prototype.repeat= function(what, L){
        while(L) this[--L]= what;
        return this;
    };

    $scope.myStartDateTime = new Date(2014,1,1);
    $scope.myEndDateTime = new Date(2114,1,1);
    $scope.series = [];

    var processData = function () {

        // Determine angles and max value
        for(var e=0; e<$scope.eventCollection.length; e++) {
            if($scope.eventCollection[e].length > 2) {
                var a = [$scope.eventCollection[e][0].xpos,$scope.eventCollection[e][0].ypos];
                var b = [$scope.eventCollection[e][1].xpos,$scope.eventCollection[e][1].ypos];
                var c = [$scope.eventCollection[e][2].xpos,$scope.eventCollection[e][2].ypos];

             //   var a = [0,-50];
             //   var b = [50,50];
             //   var c = [25,-50];

                var notFound = true;
                var searchIndex = 0;
                while(notFound && searchIndex < $scope.currentRoom.start_points.length ) {
                    // Find which start point is in use, so we can create multiple charts
                    if(a[0] == $scope.currentRoom.start_points[searchIndex].xpos && a[1] == $scope.currentRoom.start_points[searchIndex].ypos) {
                        notFound = false;
                        // Vectors must be shifted to origin (midway vector b will be at 0,0)
                        a = [(a[0]-b[0]),(a[1]-b[1])];
                        c = [(c[0]-b[0]),(c[1]-b[1])];
                        b = [0,0];

                        var angle = (Math.atan2(c[1],c[0]) - Math.atan2(a[1],a[0])) * (180/Math.PI);
                        var index = Math.floor(angle/45);
                        $scope.series[searchIndex].values[0][index]++;
                    }
                    searchIndex++;
                }
            }
        }
        /*
        for(var eachSeries=0; eachSeries<$scope.series.length; eachSeries++) {


          //  var chartElement = angular.element("#chartFirstTurn");
          //  var divElement = document.createElement('div');
          //  divElement.id = '#chartFirstTurn-' + eachSeries;
          //  chartElement.appendChild(divElement);


            ngProgress.complete();
        }
        */
    };

    var requestData = function () {

        // Create default series for each entrance
        for (var i=0; i< $scope.currentRoom.start_points.length; i++) {
            var row = {name: $scope.currentRoom.start_points[i].label, rotation: $scope.currentRoom.start_points[i].rotation, values: [[].repeat(0, 8)] };
            $scope.series.push(row);
        }

        // ngProgress.start();
        var start = moment($scope.myStartDateTime).unix();
        var end = moment($scope.myEndDateTime).unix();
        iObserveData.doGetStatEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id, start, end, 'firstTurnEstimation').then(function(resultData) {
            $scope.eventCollection = resultData[0].events;
            processData();
        })
    };

    requestData();

}).directive('chartFirstTurnChart', function() {
    return {
        restrict: 'E',
        scope: {
            s: '=' // bi-directional data-binding
        },
        template: '<p>{{s.name}}</p>',
        link: function(scope, element, attr) {
            var series, minVal = 0, maxVal = 1, radius, radiusLength;
            var w = 500, h = 500, axis = 8, time = 10, ruleColor = '#CCC';
            var vizPadding = {
                top: 25,
                right: 25,
                bottom: 25,
                left: 25
            };
            var numticks;
            var keys = ["0", "45", "90", "135", "180", "225", "270", "315"];
            var timeseries = [];
            var sdat = [];

            scope.render = function (s) {
                maxVal = Math.max.apply(null, s.values[0]);
                if (maxVal == 0) { return; }
                numticks = maxVal >= 5 ? maxVal / 5 : 1;
                sdat.length = 0;
                timeseries.length = 0;

                for (var i = 0; i <= numticks; i++) {
                    sdat[i] = (maxVal / numticks) * i;
                }

                for (var j = 0; j < time; j++) {
                    timeseries[j] = s.values;
                }

                var vizBody = buildBase(s.rotation);
                setScales(vizBody);
                drawBars(0, vizBody);
                addLineAxes(vizBody);
                addCircleAxes(vizBody);
            };

            scope.$watch('s', function() {
                scope.render(scope.s);
            }, true);


            function buildBase(rotation){
                var viz = d3.select(element[0])
                    .append('svg:svg')
                    .attr('width', w)
                    .attr('height', h)
                    .attr("transform", "rotate("+rotation+")");

                viz.append("svg:rect")
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('height', 0)
                    .attr('width', 0)
                    .attr('height', 0);

                var vizBody = viz.append("svg:g")
                    .attr('id', 'body');
                return vizBody;
            }

            function setScales(vizBody) {
                var heightCircleConstraint,
                    widthCircleConstraint,
                    circleConstraint,
                    centerXPos,
                    centerYPos;

                //need a circle so find constraining dimension
                heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
                widthCircleConstraint = w - vizPadding.left - vizPadding.right;
                circleConstraint = d3.min([heightCircleConstraint, widthCircleConstraint]);

                radius = d3.scale.linear().domain([0, maxVal])
                    .range([0, (circleConstraint / 2)]);
                radiusLength = radius(maxVal);

                //attach everything to the group that is centered around middle
                centerXPos = widthCircleConstraint / 2 + vizPadding.left;
                centerYPos = heightCircleConstraint / 2 + vizPadding.top;

                vizBody.attr("transform", "translate(" + centerXPos + ", " + centerYPos + ")");
            }

            function addCircleAxes(vizBody) {
                var radialTicks = radius.ticks(numticks), circleAxes, i;

                vizBody.selectAll('.circle-ticks').remove();

                circleAxes = vizBody.selectAll('.circle-ticks')
                    .data(sdat)
                    .enter().append('svg:g')
                    .attr("class", "circle-ticks");

                circleAxes.append("svg:circle")
                    .attr("r", function (d, i) { return radius(d); })
                    .attr("class", "circle")
                    .style("stroke", ruleColor)
                    .style("opacity", 0.7)
                    .style("fill", "none");

                circleAxes.append("svg:text")
                    .attr("text-anchor", "left")
                    .attr("dy", function (d) { return -1 * radius(d); })
                    .text(String);
            }

            function addLineAxes(vizBody) {
                var radialTicks = radius.ticks(numticks), lineAxes;

                vizBody.selectAll('.line-ticks').remove();

                lineAxes = vizBody.selectAll('.line-ticks')
                    .data(keys)
                    .enter().append('svg:g')
                    .attr("transform", function (d, i) {
                        return "rotate(" + ((i / axis * 360) - 90) +
                            ")translate(" + radius(maxVal) + ")";
                    })
                    .attr("class", "line-ticks");

                lineAxes.append('svg:line')
                    .attr("x2", -1 * radius(maxVal))
                    .style("stroke", ruleColor)
                    .style("opacity", 0.75)
                    .style("fill", "none");

                lineAxes.append('svg:text')
                    .text(function(d,i){ return keys[i]; })
                    .attr("text-anchor", "middle")
//      .attr("transform", function (d, i) {
//          return (i / axis * 360) < 180 ? null : "rotate(90)";
//      });
            }

            function drawBars(val, vizBody) {
                var groups, bar;
                pie = d3.layout.pie().value(function(d) { return d; }).sort(null);
                d = [];
                for(i = 0; i<timeseries[val][0].length; i++) { d.push(1); }

                groups = vizBody.selectAll('.series')
                    .data([d]);
                groups.enter().append("svg:g")
                    .attr('class', 'series')
                    .style('fill', "blue")
                    .style('stroke', "black");

                groups.exit().remove();

                bar = d3.svg.arc()
                    .innerRadius( 0 )
                    .outerRadius( function(d,i) { return radius( timeseries[val][0][i] ); });

                arcs = groups.selectAll(".series g.arc")
                    .data(pie)
                    .enter()
                    .append("g")
                    .attr("class", "attr");

                arcs.append("path")
                    .attr("fill", "blue")
                    .attr("d", bar)
                    .style("opacity", 0.4);
            }

        }
    };
});