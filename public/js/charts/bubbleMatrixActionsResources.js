iObserveApp.controller('ChartCtrl-bubbleMatrixActionsResources', function($scope, iObserveData, ngProgress) {

    Array.prototype.repeat= function(what, L){
        while(L) this[--L]= what;
        return this;
    };

    $scope.actionList = [];
    $scope.resourceList = [];
    $scope.myStartDateTime = new Date(2014,1,1);
    $scope.myEndDateTime = new Date(2114,1,1);
    $scope.chartData = { columns: [], rows: [] };

    var tipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var chart = d3.select('#chartActionsResources').append('svg')
        .chart('BubbleMatrix')
        .width(1000).height(1000);

    var largestValue = 0;

    var drawChart = function () {
        chart.draw($scope.chartData);

        d3.selectAll('circle')
            .on("mouseover", function(d) {
                tipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tipDiv.html("<strong>Count: </strong>" + (d[0] * largestValue).toFixed(0))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    };

    var processData = function () {
        var count = 0;

        for (var i= 0; i<$scope.sessionCollection.length; i++) {
            var events =  $scope.sessionCollection[i];
            for (var j= 0; j<events.length; j++) {
                var interactions = events[j].interactions;
                // Here each action and resource combination is noted as a counter increment
                // Actual values are calculated between 0 and 1 (percent) therefore calculations are made
                for (var k=0; k<interactions.length; k++) {
                    var actionIdx = $scope.actions.indexOf(events[j].interactions[k].actions[0].type);
                    var resourceIdx = $scope.resources.indexOf(events[j].interactions[k].resources[0].type);
                    count = ++$scope.chartData.rows[resourceIdx].counters[actionIdx];
                    if (count > largestValue)
                        largestValue = count;
                }
            }
        }
        // Now that we know the count and largest value, create values within an array required by bubble matrix
        for (var r = 0; r< $scope.resources.length;r++) {
            for (var a = 0; a < $scope.actions.length; a++) {
                $scope.chartData.rows[r].values[a] = [$scope.chartData.rows[r].counters[a] / largestValue];
            }
        }
        ngProgress.complete();
        drawChart();
    };

    var requestData = function () {
        ngProgress.start();
        iObserveData.doGetSpaceActionsAndResourceList($scope.currentStudy._id).then(function(resultData) {
            $scope.actions = [];
            $scope.resources = [];

            // Gather action names for x axis (columns)
            for (var i=0; i< resultData[0].actions.length; i++){
                $scope.actions.push(resultData[0].actions[i].type)
            }
            $scope.chartData.columns = $scope.actions;

            // Gather resource names for y axis (rows)
            for (var j=0; j< resultData[0].resources.length; j++){
                $scope.resources.push(resultData[0].resources[j].type);
            }

            // Create default rows with values and counters
            for (var k=0; k< $scope.resources.length; k++) {
                var row = { name: $scope.resources[k], values: [].repeat([0], $scope.actions.length), counters: [].repeat(0, $scope.actions.length) };
                $scope.chartData.rows.push(row);
            }

            // Request the event data
            var start = moment($scope.myStartDateTime).unix();
            var end = moment($scope.myEndDateTime).unix();
            iObserveData.doGetStatEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id, start, end, 'actionsresourcesbubble').then(function(resultData) {
                $scope.sessionCollection = resultData[0].sessionevents;
                processData();
            })
        })


    };

    requestData();

});