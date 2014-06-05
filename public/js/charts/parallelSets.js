iObserveApp.controller('ChartCtrl-parallelSets', function($scope) {

    var chartData = [];

    function processData() {
        // event in events - skip first and last items (START and STOP)
        for(var i=1; i<$scope.chartData.length-1; i++) {
            var event = $scope.chartData[i];
            // interaction in interactions
            for(var j=0;  j<event.interactions.length; j++) {
                var interaction = event.interactions[j];
                // each visitor in visitors assigned actions and resources
                for(var k=0;  k<interaction.visitors.length; k++) {
                    var visitor = interaction.visitors[k];
                    for(var l=0;  l<interaction.actions.length; l++) {
                        var action = interaction.actions[l];
                        var resource = interaction.resources[l];
                        var dataPoint = {
                            Sex : visitor.sex,
                            Age : visitor.age,
                            Nationality : visitor.nationality,
                            Action : action.type,
                            // check in case fewer resoures than actions
                            Resource : resource === undefined ? "" : resource.type
                        }
                        chartData.push(dataPoint);
                    }
                }
            }
        }
    }

    processData();

    // attachment of function to d3 object was broken.
    // So add a new var inside function at top of d3.parsets.js:        var dp = window.dp || {};
    //                                                                  window.dp = dp;
    var theChart = dp.parsets()
        .dimensions(["Sex", "Age", "Nationality", "Action", "Resource"]);

    var svg = d3.select("#chartParallelSets")
        .append("svg")
        .attr("width", theChart.width())
        .attr("height", theChart.height());

    svg.datum(chartData).call(theChart);

});