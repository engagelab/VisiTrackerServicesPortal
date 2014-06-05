iObserveApp.controller('ChartCtrl-frequencyMapDurationQuantity', function($scope, $timeout, iObserveData, ngProgress) {

    var chartData = [];
    var firstEventCreationTime = 0;
    var lastEventCreationTimeInSeconds = 0;
    var mapScale = 5;
    var sessionList = [];
    var timeSlider;

    $scope.myStartDateTime = new Date();
    $scope.myEndDateTime = new Date();

    $scope.ageGroups = ["Child", "Young adult", "Adult", "Middle aged", "Senior"];
    $scope.nationalities = ["Norwegian", "Tourist", "Other"];

    var ds = new Date(2014, 0, 0, 0, 0, 1, 0);
    ds.setHours( 0 );
    ds.setMinutes( 0 );
    ds.setSeconds( 0 );
    $scope.myStartDateTime = ds;
    var de = new Date();
    de.setHours( 23 );
    de.setMinutes( 59 );
    de.setSeconds( 59 );
    $scope.myEndDateTime = de;

    $scope.openDatePanelStart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.openedDPS = true;
    };
    $scope.openDatePanelEnd = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.openedDPE = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1024)
        .attr("height", 723)
        .attr("top", -723);

    $scope.dateTimeUpdate = function() {
        var start = moment($scope.myStartDateTime).unix();
        var end = moment($scope.myEndDateTime).unix();
        ngProgress.start();
        iObserveData.doGetStatEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id, start, end, 'durationquantity').then(function(resultData) {
            $scope.sessionDetails = resultData[0].sessions;
            $scope.eventCollection = resultData[0].events;
            processData();
            drawChart();
            $timeout(assignCheckBoxes, 0);
        })
    };

    $scope.timeChanged = function () {
        console.log('Time changed to: ' + $scope.mytime);
    };

    var processData = function () {
        var progressCounter = 0;
        var nextEventTime = 0;
        var relativeCreationTimeInSeconds = 0;

        // Iterate over the entire set of sessions
        for(var i=0; i<$scope.eventCollection.length; i++) {
            var eventSubset = $scope.eventCollection[i];
            var optionsObject = {
                hidden : false,
                lastEventTime : 0
            };
            lastEventCreationTimeInSeconds = 0;
            // Iterate over events within the session
            for(var j=0; j<eventSubset.length; j++) {
                var storedVisitorsIds = [];
                var ageGroupList = [];
                var nationalityList = [];
                var event = eventSubset[j];

                // This counters a bug caused when an event is posted with no interactions
                if(event.interactions.length > 0) {

                    if(j == 0)
                        firstEventCreationTime = event.created_on;
                    relativeCreationTimeInSeconds = getRelativeCreationTime(event.created_on);
        /*
                    // Iterate through Interactions and Visitors and collect unique visitors for this event
                    for(var k=0; k<event.interactions.length; k++) {
                        var interaction = event.interactions[k];

                        for(var l=0;  l<interaction.visitors.length; l++) {
                            var visitor = interaction.visitors[l];
                            if(storedVisitorsIds.indexOf(visitor._id) == -1) {
                                storedVisitorsIds.push(visitor._id);
                                if(ageGroupList.indexOf(visitor.age) == -1) {
                                    ageGroupList.push(visitor.age);
                                }
                                if(nationalityList.indexOf(visitor.nationality) == -1) {
                                    nationalityList.push(visitor.nationality);
                                }
                            }
                        }
                    }
        */
                    // Create a data point with the information gathered
        /*          if(j < eventSubset.length-1)
                        nextEventTime = eventSubset[j+1].created_on;
                    else if(j == eventSubset.length-1)
                        nextEventTime = event.created_on+1;   // The final event will be the exit of the session - represent it as one second long
        */          var dataPoint = {
                        id : event._id,
                        session : i.toString(),
                        relativeCreationTimeInSeconds : relativeCreationTimeInSeconds,
                        x : event.xpos,
                        y : event.ypos,
               //         ageGroups : ageGroupList,
               //         nationalities : nationalityList,
                        radius : event.interactions[0].visitors.length,      // Adds a radius to represent number of visitors at the event
                        duration : getTimeDuration(event.created_on, event.finished_on)
                    }
                    chartData.push(dataPoint);
                    if(lastEventCreationTimeInSeconds < relativeCreationTimeInSeconds)
                        lastEventCreationTimeInSeconds = relativeCreationTimeInSeconds;
                }
            }
            optionsObject.lastEventTime = lastEventCreationTimeInSeconds;
            // Index of the optionsObject is the session number used for checkboxes
            sessionList.push(optionsObject);
            progressCounter++;
            ngProgress.set(progressCounter/$scope.eventCollection.length*100);
        }
        ngProgress.complete();
    };

    function sortFunction(a, b) {
        if(a.relativeCreationTimeInSeconds < b.relativeCreationTimeInSeconds)
            return -1;
        else if(a.relativeCreationTimeInSeconds > b.relativeCreationTimeInSeconds)
            return 1;
        else if(a.relativeCreationTimeInSeconds == b.relativeCreationTimeInSeconds)
            return 0;
    }

    $scope.getCSVArray = function () {
        var flattenedArray = [];
        for(var i=0; i<chartData.length; i++) {
            var newRow = {Time: chartData[i].relativeCreationTimeInSeconds, X: chartData[i].x, Y: chartData[i].y, Duration: chartData[i].duration, Quantity: chartData[i].radius, EventID: chartData[i].id};
            flattenedArray.push(newRow);
        }
        flattenedArray.sort(sortFunction);
        return flattenedArray;
    };

    // Calculate the time passed in seconds since the first event
    var getRelativeCreationTime = function (time) {
        var a = moment.unix(firstEventCreationTime);
        var b = moment.unix(time);
        var difference = b.diff(a, 'seconds');
        return difference;
    }

    // Calculate the time duration in seconds between events
    var getTimeDuration = function (timeNow, timeNext) {
        var a = moment.unix(timeNow);
        var b = moment.unix(timeNext);
        var difference = b.diff(a, 'seconds');
        return difference;
    }

    // Find the time when occurs the last event for visible sessions
    var getLastEventTime = function () {
        var newLastEventTime = 0;
        for(var i=0; i<sessionList.length; i++) {
            if(!sessionList[i].hidden && newLastEventTime < sessionList[i].lastEventTime)
                newLastEventTime = sessionList[i].lastEventTime;
        }
        lastEventCreationTimeInSeconds = newLastEventTime;
        return newLastEventTime;
    }

    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.doGetBasicSessionsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            //$scope.sessionDetails = resultData[0];
        })
/*        iObserveData.doGetStatEventsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
            $scope.sessionDetails = resultData[0].sessions;
            $scope.eventCollection = resultData[0].events;
            processData();
            drawChart();
            //ngProgress.complete();
            $timeout(assignCheckBoxes, 0);
        })
*/
    });

    var drawChart = function () {
        getLastEventTime();
        svg.selectAll(".eventCircle")
            .data(chartData)
            .enter()
            .append("svg:circle")
            .attr("class", "eventCircle")
            .style("fill", "#FF0000")
            .attr("r", function(d) { return d.radius*mapScale; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .style("opacity", function(d) {
                if(d.duration >= 40)
                    return 1;
                else if(d.duration >= 30)
                    return 0.8;
                else if(d.duration >= 20)
                    return 0.6;
                else if(d.duration >= 10)
                    return 0.4;
                else if(d.duration >= 5)
                    return 0.2;
                else if(d.duration > 0)
                    return 0.1;
                else
                    return 0;
            })
            .attr("display", function(d) { return d.relativeCreationTimeInSeconds == 0 ? "inline" : "none"});

        // The slider (dragger) - Works by relative creation time from first event
        // Usage:  http://code.ovidiu.ch/dragdealer/
        timeSlider = new Dragdealer('eventSlider', {
            horizontal: true,
            vertical: false,
            xPrecision: 1024,
            x: 0,
            animationCallback: function(x, y)
            {
                var totalSteps = lastEventCreationTimeInSeconds;
                $("#eventSliderBar").html("<i class='icon-double-angle-left'></i>&nbsp<span>t: "+Math.round(x*totalSteps)+"s</span>&nbsp<i class='icon-double-angle-right'></i>");
                svg.selectAll(".eventCircle")
                    .attr("display", function(d) {
                        if(!sessionList[d.session].hidden && d.relativeCreationTimeInSeconds <= x*totalSteps)
                            return  "inline";
                        else
                            return "none";
                    });
            }
        });

        new Dragdealer('scaleSlider', {
            horizontal: true,
            vertical: false,
            xPrecision: 100,
            x: 0.4,
            animationCallback: function(x, y)
            {
                $("#scaleSliderBar").html("<span>"+Math.round(x*100)+"%</span>");
                mapScale = x*100/10;
                svg.selectAll(".eventCircle")
                    .attr("r", function(d) { return d.radius*mapScale; })
            }
        });
    };

    var assignCheckBoxes = function () {

        d3.selectAll(".session_filter_button")
            .property("checked", true)
            .on("change", function() {
                var session = this.value,
                    display = this.checked ? "inline" : "none";
                if(sessionList[session].hidden) {
                    sessionList[session].hidden = false;
                    display = "inline";
                }
                else {
                    sessionList[session].hidden = true;
                    display = "none";
                }
                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.session === session; })
                    .attr("display", display);

                getLastEventTime();
                var newX = timeSlider.getValue()[0];
                $("#eventSliderBar").html("<i class='icon-double-angle-left'></i>&nbsp<span>t: "+Math.round(newX*lastEventCreationTimeInSeconds)+"s</span>&nbsp<i class='icon-double-angle-right'></i>");

     /*
                timeSlider = new Dragdealer('eventSlider', {
                    horizontal: true,
                    vertical: false,
                    x: newX,
                    animationCallback: function(x, y)
                    {
                        //var newX = ($("#eventSliderBar").position().left + 100) / 1024;
                        var totalSteps = lastEventCreationTimeInSeconds;
                        $("#eventSliderBar").html("<i class='icon-double-angle-left'></i>&nbsp<span>t: "+Math.round(newX*totalSteps)+"s</span>&nbsp<i class='icon-double-angle-right'></i>");
                        svg.selectAll(".eventCircle")
                            .attr("display", function(d) {
                                if(!sessionList[d.session].hidden && d.relativeCreationTimeInSeconds <= newX*totalSteps)
                                    return  "inline";
                                else
                                    return "none";
                            });
                    }
                });
*/
            });
        /*
        d3.selectAll(".age_filter_button")
            .property("checked", true)
            .on("change", function() {
                var age = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.ageGroups.indexOf(age) != -1 && d.selectable; })
                    .attr("display", display);
            });

        d3.selectAll(".nation_filter_button")
            .property("checked", true)
            .on("change", function() {
                var nation = this.value,
                    display = this.checked ? "inline" : "none";

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return d.nationalities.indexOf(nation) != -1; })
                    .attr("display", display);
            });
        */
    };

/*
    var hiddenSessionList = [];
    var hiddenAgeList = [];
    var hiddenNationalityList = [];

    var assignCheckBoxes = function () {

        d3.selectAll(".session_filter_button")
            .property("checked", true)
            .on("change", function() {
                var session = this.value,
                    display = this.checked ? "inline" : "none";

                if(!this.checked) {
                    if(hiddenSessionList.indexOf(session) == -1)
                        hiddenSessionList.push(session);
                }
                else {
                    var index = hiddenSessionList.indexOf(session);
                    if(index >= 0)
                        hiddenSessionList.splice(index, 1);
                }

                svg.selectAll(".eventCircle")
                    .filter(function(d) { return (d.session === session) && (hiddenAgeList.indexOf(d.ageGroups) < 0) && (hiddenNationalityList.indexOf(d.nationalities) < 0); })
                    .attr("display", display);
            });

        d3.selectAll(".age_filter_button")
            .property("checked", true)
            .on("change", function() {
                var age = this.value,
                    display; // = this.checked ? "inline" : "none";

                if(!this.checked) {
                    if(hiddenAgeList.indexOf(age) == -1)
                        hiddenAgeList.push(age);
                    display = "none";
                }
                else {
                    var index = hiddenAgeList.indexOf(age);
                    if(index >= 0)
                        hiddenAgeList.splice(index, 1);
                    display = "inline";
                }

                svg.selectAll(".eventCircle")
                    .filter(function(d) {
                        var result = d.ageGroups.indexOf(age) != -1 && (hiddenSessionList.indexOf(d.session) < 0) && (hiddenNationalityList.indexOf(d.nationalities) < 0);
                        return result;
                    })
                    .attr("display", display);
            });

        d3.selectAll(".nation_filter_button")
            .property("checked", true)
            .on("change", function() {
                var nation = this.value,
                    display = this.checked ? "inline" : "none";

                if(!this.checked) {
                    if(hiddenNationalityList.indexOf(nation) == -1)
                        hiddenNationalityList.push(nation);
                }
                else {
                    var index = hiddenNationalityList.indexOf(nation);
                    if(index >= 0)
                        hiddenNationalityList.splice(index, 1);
                }

                svg.selectAll(".eventCircle")
                    .filter(function(d) {
                        var result = d.nationalities.indexOf(nation) != -1 && (hiddenSessionList.indexOf(d.session) < 0) && (hiddenAgeList.indexOf(d.ageGroups) < 0);
                        return result;
                    })
                    .attr("display", display);
            });

    }
 */
});
