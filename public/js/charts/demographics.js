iObserveApp.controller('ChartCtrl-demographics', function($scope, iObserveData, ngProgress) {

    var chartData = [
        {
            "key": "Male",
            "color": "#3B40BF",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Female",
            "color": "#BF3B3B",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Norwegian",
            "color": "#3BBF4D",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Tourist",
            "color": "#157047",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        },
        {
            "key": "Other",
            "color": "#000000",
            "values": [
                {
                    "label" : "Child",
                    "value" : 0
                },
                {
                    "label" : "Young Adult",
                    "value" : 0
                },
                {
                    "label" : "Adult",
                    "value" : 0
                },
                {
                    "label" : "Middle Aged",
                    "value" : 0
                },
                {
                    "label" : "Senior",
                    "value" : 0
                }
            ]
        }
    ]

    var objHeader = ["Male", "Female", "Norwegian", "Tourist", "Other"];
    var objRowNames = ["Child", "Young Adult", "Adult", "Middle Aged", "Senior"];
    var objSet = { "Male" : chartData[0], "Female" : chartData[1], "Norwegian" : chartData[2], "Tourist" : chartData[3], "Other" : chartData[4] };

    $scope.getCSVArray = function () {
        var flattenedArray = [];
        for(var i=0; i<5; i++) {
            var newRow = {age: objRowNames[i], Male: 0, Female: 0, Norwegian: 0, Tourist: 0, Other: 0};
            for(var j=0; j<5;j++) {
                newRow[objHeader[j]] = objSet[objHeader[j]].values[i].value;
            }
            flattenedArray.push(newRow);
        }
        return flattenedArray;
    };

    var requestData = function () {
        ngProgress.start();
        iObserveData.doGetStatSessionsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.sessionsFullListing = resultData[0];
            processData();
            drawChart();
            ngProgress.complete();
        })
    };

    function processData() {

        for(var i=0; i<$scope.sessionsFullListing.length; i++) {
            var session = $scope.sessionsFullListing[i];
            // session in sessions
            for(var j=0; j<session.visitorgroup.visitors.length; j++) {
                var visitor = session.visitorgroup.visitors[j];
                var filter = visitor.sex;
                if(filter) {
                    switch(visitor.age) {
                        case "Child" : objSet[filter].values[0].value++; break;
                        case "Young adult" : objSet[filter].values[1].value++; break;
                        case "Adult" : objSet[filter].values[2].value++; break;
                        case "Middle aged" : objSet[filter].values[3].value++; break;
                        case "Senior" : objSet[filter].values[4].value++; break;
                        default : break;
                    }
                }
                filter = visitor.nationality;
                if(filter) {
                    switch(visitor.age) {
                        case "Child" : objSet[filter].values[0].value++; break;
                        case "Young adult" : objSet[filter].values[1].value++; break;
                        case "Adult" : objSet[filter].values[2].value++; break;
                        case "Middle aged" : objSet[filter].values[3].value++; break;
                        case "Senior" : objSet[filter].values[4].value++; break;
                        default : break;
                    }
                }
            }
        }
    };

    requestData();
    //ngProgress.complete();

    function drawChart() {
        nv.addGraph(function () {
            // chart = nv.models.multiBarHorizontalChart()
            var chart = nv.models.multiBarChart()
                .x(function (d) {
                    return d.label
                })
                .y(function (d) {
                    return d.value
                })
                .margin({top: 30, right: 20, bottom: 50, left: 20})
                //.showValues(true)
                //.tooltips(false)
                //.barColor(d3.scale.category20().range())
                .showControls(true);

            chart.yAxis
                .tickFormat(d3.format(',d'));

            d3.select('#chartDemographics')
                .append("svg")
                .datum(chartData)
                .transition().duration(500)
                .call(chart);

            nv.utils.windowResize(chart.update);

            chart.dispatch.on('stateChange', function (e) {
                nv.log('New State:', JSON.stringify(e));
            });

            return chart;
        });
    }

});