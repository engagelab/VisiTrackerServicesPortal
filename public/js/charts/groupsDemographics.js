iObserveApp.controller('ChartCtrl-groupsDemographics', function($scope, iObserveData) {

    var chartData = [
        {
            "key": "Groups",
            "values": [
                {
                    "label":"Group of 1",
                    "color": "#A6591A",
                    "value":0
                },
                {
                    "label":"Group of 2",
                    "color": "#FF9F50",
                    "value":0
                },
                {
                    "label":"Group of 3",
                    "color": "#FFB77C",
                    "value":0
                },
                {
                    "label":"Group of 4",
                    "color": "#FFCA9F",
                    "value":0
                }
            ]
        }
    ]

    $scope.objSet = { "Groups sizes" : chartData[0] };

    $scope.getCSVArray = function () {
        var flattenedArray = [];
        /*for(var i=0; i<5; i++) {
            var newRow = {group: objRowNames[i], Male: 0, Female: 0, Norwegian: 0, Tourist: 0, Other: 0};
            for(var j=0; j<5;j++) {
                newRow[objHeader[j]] = objSet[objHeader[j]].values[i].value;
            }
            flattenedArray.push(newRow);
        }*/
        return flattenedArray;
    };

    $scope.reDraw = function() {
        d3.select('#chartGroupsDemographics')
            .append("svg")
            .datum(chartData)
            .transition().duration(500)
            .call(chart);

        nv.utils.windowResize(chart.update);

        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
    };

    var processData = function () {

        iObserveData.doGetStatSessionsGroupDemographicsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.objSet["Groups sizes"].values[0].value = resultData[0][0].value;
            $scope.objSet["Groups sizes"].values[1].value = resultData[0][1].value;
            $scope.objSet["Groups sizes"].values[2].value = resultData[0][2].value;
            $scope.objSet["Groups sizes"].values[3].value = resultData[0][3].value;

            $scope.reDraw();
        })
    };

    processData();
    //ngProgress.complete();

    var chart;
    nv.addGraph(function() {
       // chart = nv.models.multiBarHorizontalChart()
        chart = nv.models.multiBarChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showControls(false)
            .showLegend(false)
            .margin({top: 30, right: 20, bottom: 50, left: 30});

        chart.yAxis
            .tickFormat(d3.format(',d'));

        return chart;
    });

});