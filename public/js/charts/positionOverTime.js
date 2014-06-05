iObserveApp.controller('ChartCtrl-positionOverTime', function($scope, iObserveData, iObserveUtilities) {

    var chartData = [];
    var linkData = [];
    var linkCircleData = [];
    var firstEventCreationTime = null;
    var lastEventCreationTime = 0;

    // Set up the basic D3 drawing area
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", 45);

    // Iterate through the server's data response and take what's needed
    var processData = function () {

        // Set up initial positions to match number of visitors
        var xPrev = [];
        var yPrev = [];

        var event = null;

        var relativeCreationTime = 0;
        if($scope.chartData.length > 0) {
            firstEventCreationTime = moment.unix($scope.chartData[0].created_on);
            var xPrevStart = $scope.chartData[0].xpos;
            var yPrevStart = $scope.chartData[0].ypos;
            for(var initIt=0;initIt<$scope.uniqueVisitors.length;initIt++) {
                xPrev[initIt] = xPrevStart;
                yPrev[initIt] = yPrevStart;
            }
        }
        else return;

        // Iterate through Events
        for(var i=0; i<$scope.chartData.length; i++) {
            event = $scope.chartData[i];
            relativeCreationTime = getRelativeCreationTime(event.created_on);
            var bitsChecked = 0; // Bitwise variable to track four visitors
            var interactionIterator = 0;
            var linksPrinted = false;
            var rolloverText = "";
            // Iterate through Interactions within the event, check which visitors are present
            while(interactionIterator<event.interactions.length && bitsChecked != Math.pow(2, $scope.uniqueVisitors.length)-1) {
                // The set of visitors in the current interaction
                var eventVisitorIDs = event.interactions[interactionIterator].visitor_ids;
                // Set up the data points and lines, with locations, for each unique visitor. Process each visitor only once.
                for(var v=0; v<$scope.uniqueVisitors.length; v++) {
                    if(eventVisitorIDs.indexOf($scope.uniqueVisitors[v]._id) != -1) {
                        bitsChecked = bitsChecked | (1 << v);
                        var visitor = $scope.uniqueVisitors[v];
                        var col = iObserveUtilities.decColor2hex(visitor.color);

                        var eventDataPoint = {
                            eventIndex : i,
                            visitorIndex : v,
                            relativeCreationTime : relativeCreationTime,
                            x : event.xpos,
                            y : event.ypos,
                            radius : 5,
                            color : col,
                            sex: visitor.sex,
                            age: visitor.age,
                            nationality : visitor.nationality
                        };
                        if(!linksPrinted) {
                            var linkDataPoint = {
                                eventIndex : i,
                                visitorIndex : v,
                                relativeCreationTime : relativeCreationTime,
                                x : event.xpos,
                                y : event.ypos,
                                xPrev : xPrev[v],
                                yPrev : yPrev[v],
                                color : col
                            };
                            linkData.push(linkDataPoint);
                        }
                        chartData.push(eventDataPoint);
                        xPrev[v] = event.xpos;
                        yPrev[v] = event.ypos;
                    }
                }
                linksPrinted = true;
                interactionIterator++;
            }
            for(var ii=0; ii<event.interactions.length; ii++) {
                rolloverText += event.interactions[ii].actions[0].type + ' '
                    + event.interactions[ii].resources[0].type + '\n';
            }
            var linkCircleDataPoint = {
                eventIndex : i,
                relativeCreationTime : relativeCreationTime,
                x : event.xpos,
                y : event.ypos,
                description : rolloverText.trim()
            };
            linkCircleData.push(linkCircleDataPoint);
        }
        lastEventCreationTime = event.created_on;
    };

    // Calculate the time passed in seconds since the first event
    var getRelativeCreationTime = function (time) {
        var b = moment.unix(time);
        var difference = b.diff(firstEventCreationTime, 'seconds');
        return difference;
    }

    // Due to this chart being loaded via a partial, set up must be initiated after the partial is loaded so that DOM elements are available
    // Make sure to call ngProgress.complete() once the chart processing in done
    $scope.$watch('chartPartialLoaded', function(newValue) {
        if(newValue == true) {
            iObserveData.doGetSession($scope.currentSession._id).then(function(resultData1) {
                $scope.uniqueVisitors = resultData1[0].visitorgroup.visitors;
                processData();
                buildMarkers();
                drawChart();
/*                iObserveData.doGetEvents($scope.currentSession._id).then(function(resultData2) {
                    $scope.eventCollection = resultData2[0];

                    //ngProgress.complete();
                 //   $timeout(assignCheckBoxes, 0);
                });
*/            })
        }
    });

    // Offsets for each visitor calculated by unique index (currently up to four)
    var calculateClusterCoordinates = function (x,y,visitorIndex) {
        var newCoords = {x : 0, y : 0};
        switch(visitorIndex) {
            case 0 : newCoords.x = x - 7; newCoords.y = y - 7; break;
            case 1 : newCoords.x = x + 7; newCoords.y = y - 7; break;
            case 2 : newCoords.x = x - 7; newCoords.y = y + 7; break;
            case 3 : newCoords.x = x + 7; newCoords.y = y + 7; break;
        }
        return newCoords;
    }

    // Create the D3 arrow markers for different colours
    var buildMarkers = function () {
        var linkDataIndex = 0;
        var eventIndex = linkData[linkDataIndex].eventIndex;
        for(var i=0; i<iObserveUtilities.colorsUsed.length; i++) {
    //    while(eventIndex == 0) {
            svg.append("defs").append("svg:marker")
                .attr("id", "arrow"+iObserveUtilities.colorsUsed[i])
                .attr("viewBox","0 0 10 10")
                .attr("refX","30")
                .attr("refY","5")
                .attr("markerUnits","strokeWidth")
                .attr("markerWidth","9")
                .attr("markerHeight","5")
                .attr("orient","auto")
                .append("svg:path")
                .attr("d","M 0 0 L 10 5 L 0 10 z")
                .attr("fill", iObserveUtilities.colorsUsed[i]);

        //    linkDataIndex++;
        //    eventIndex = linkData[linkDataIndex].eventIndex;
        }
    }

    // Draw the D3 chart objects in the svg (layering over the floorplan graphic)
    var drawChart = function () {

        var eventLink = svg.selectAll(".eventLink")
            .data(linkData)
            .enter()
            .append("svg:line")
            .attr("class", "eventLink")
            // Exclude drawing a line to the first event point
            .filter(function(d, i) { return d.eventIndex != 0; })
            .attr("marker-end", function(d) { return "arrow"+ d.color })
            .attr("x1", function(d) { return d.xPrev + d.visitorIndex*2})
            .attr("y1", function(d) { return d.yPrev})
            .attr("x2", function(d) { return d.x + d.visitorIndex*2})
            .attr("y2", function(d) { return d.y})
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("stroke-width", 2);

        var linkCircle = svg.selectAll(".linkCircle")
            .data(linkCircleData)
            .enter()
            .append("svg:circle")
            .attr("class", "linkCircle")
            .style("stroke", "gray")
            .attr("r", 20 )
            .attr("cx", function(d) { return d.x })
            .attr("cy", function(d) { return d.y })
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("fill", "white")
            .append("svg:title")
            .text(function(d) { return d.description; });

        var eventCircle = svg.selectAll(".eventCircle")
            .data(chartData)
            .enter()
            .append("svg:circle")
            .attr("class", "eventCircle")
            .style("stroke", "gray")
            .attr("r", function(d) { return d.radius; })
            .attr("cx", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).x; })
            .attr("cy", function(d) { return calculateClusterCoordinates(d.x, d.y, d.visitorIndex).y; })
            .attr("display", function(d) { return d.eventIndex <= 0 ? "inline" : "none"})
            .attr("fill", function(d) { return d.color; });

        // The slider (dragger) - Works by relative creation time from first event
        // Usage:  http://code.ovidiu.ch/dragdealer/
        new Dragdealer('eventSlider', {
                horizontal: true,
                vertical: false,
                xPrecision: 1024,
                x: 0,
                animationCallback: function(x, y)
                {
                    var totalSteps = getRelativeCreationTime(lastEventCreationTime);
                    $("#eventSliderBar").html("<i class='icon-double-angle-left'></i>&nbsp<span>t: "+Math.round(x*totalSteps)+"s</span>&nbsp<i class='icon-double-angle-right'></i>");
                    svg.selectAll(".eventCircle")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"});
                    svg.selectAll(".eventLink")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"})
                        .style("stroke", function(d) { return d.color; })
                        .attr("marker-end", function(d) { return "url(#arrow"+d.color+")" })

                    svg.selectAll(".linkCircle")
                        .attr("display", function(d) { return d.relativeCreationTime <= x*totalSteps ? "inline" : "none"})
                }
        });

        /* Alternative slider setup - works by equally dividing by number of events
        new Dragdealer('eventSlider', {
            horizontal: true,
            vertical: false,
            xPrecision: 1024,
            x: 0,
            animationCallback: function(x, y)
            {
                var totalSteps = $scope.chartData.length;
                svg.selectAll("circle")
                    .attr("display", function(d) { return d.eventIndex+1 <= x*totalSteps ? "inline" : "none"})
            }
        });
        */

    }

});







