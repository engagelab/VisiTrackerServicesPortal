iObserveApp.controller('StatisticsCtrl', function($scope, $http, $modal, iObserveUser, iObserveData, iObserveUtilities) {
    $scope.roomListRequested = false;
    $scope.roomListButton = 0;
    $scope.studyChartButton = 0;
    $scope.sessionListRequested = false;
    $scope.sessionListButton = 0;
    $scope.sessionChartButton = 0;
    $scope.surveyChartButton = 0;
    $scope.sessionInfoListRequested = false;
    $scope.sessionInfoListButton = 0;
    $scope.sessionSequenceRequested = false;
    $scope.sessionSequenceButton = 0;
    $scope.chartPartialLoaded = false;
    $scope.chartRequested = false;
    $scope.showChart = false;
    $scope.chartList = iObserveUtilities.loadJSONFile("js/chartTypes.json");
    $scope.chartName = "";
    $scope.studies = [];
    var studyPromise = iObserveData.doGetStatsStudies();
    studyPromise.then(function (response) {
        $scope.studies = response[0];
    });

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.timeConverterShort = iObserveUtilities.timeConverterShort;
    $scope.tDiff = iObserveUtilities.tDiff;
    $scope.tDiffMoment = iObserveUtilities.tDiffMoment;

    $scope.showSessionList = false;

    $scope.currentRoom = { uri: 'http://net.engagelab.iobserveservice.s3.amazonaws.com/62b6e818-3757-423d-afb6-8eb15e5bcee0.png' };
    $scope.chartStyle = {
        'background-image': 'url(' + $scope.currentRoom.uri + ')',
        'width': '1024px',
        'height': '723px',
        'padding-top': '27px',
        'padding-left': '25px',
        'background-repeat':'no-repeat'
    };

    var activeStudyButton = null;
    var activeRoomButton = null;
    var activeSessionButton = null;

    $scope.partialLoaded = function () {
        $scope.chartPartialLoaded = true;

        $('html, body').stop().animate({
            scrollTop: $("#statChartDiv").offset().top
        }, 1500);
    }

    $scope.foldRooms = function($study, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentStudy == $study || $scope.roomListRequested == false) {
            if($scope.roomListRequested == true) {
                $scope.roomListRequested = false;
                $scope.sessionListRequested = false;
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                activeStudyButton = null;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.roomListRequested = true;
                $scope.currentStudy = $study;
                iObserveData.doGetRoomsForSpace($scope.currentStudy._id).then(function(resultData) {
                    $scope.rooms = resultData[0];
                })
            }
        }
        else {
            $scope.roomListRequested = false;
            $scope.sessionListRequested = false;
            $scope.sessionInfoListRequested = false;
            $scope.foldRooms($study, e);
        }
    };

    $scope.foldSessions = function($room, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeRoomButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentRoom == $room || $scope.sessionListRequested == false) {
            if($scope.sessionListRequested == true) {
                $scope.sessionListRequested = false;
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                activeRoomButton = null;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.sessionListRequested = false;
                $scope.currentRoom = $room;
                $scope.chartStyle = {
                    'background-image': 'url(' + $scope.currentRoom.uri + ')',
                    'width': '1024px',
                    'height': '723px',
                    'padding-top': '25px',
                    'padding-left': '25px',
                    'background-repeat':'no-repeat'
                };
                iObserveData.doGetBasicSessionsForSpaceAndRoom($scope.currentStudy._id, $scope.currentRoom._id).then(function(resultData) {
                    $scope.sessions = resultData[0];
                    $scope.sessionListRequested = true;
                    if($scope.sessions.length > 0)
                        $scope.showSessionList = true;
                })
            }
        //    $(angular.element(e.target)).parent().siblings().toggleClass('selected');
        }
        else {
            $scope.sessionListRequested = false;
            $scope.sessionInfoListRequested = false;
            //   $scope.roomListButton = 0;
            $scope.foldSessions($room, e);
        }
    };

    $scope.foldSessionInfo = function($session, e) {
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeRoomButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        activeSessionButton = $(e.target).closest('button');
        $scope.sessionSequenceRequested = false;
        $scope.chartShortName = "";
        $scope.chartRequested = false;
        if($scope.currentSession == $session || $scope.sessionInfoListRequested == false) {
            if($scope.sessionInfoListRequested == true) {
                $scope.sessionInfoListRequested = false;
                $scope.sessionSequenceRequested = false;
                $scope.chartPartialLoaded = false;
                activeSessionButton = null;
                $(e.target).closest('button').removeClass("btn-success").addClass("btn-info").removeClass("active");
            }
            else {
                $scope.sessionInfoListRequested = false;
                iObserveData.doGetSession($session._id).then(function(resultData) {
                    $scope.currentSession = resultData[0];
                    iObserveData.doGetEvents($scope.currentSession._id).then(function(resultData) {
                        $scope.chartData = resultData[0];
                        $scope.sessionInfoListRequested = true;
                    });
                });
            }
         //   $(angular.element(e.target)).parent().siblings().toggleClass('selected');
        }
        else {
            $scope.sessionInfoListRequested = false;
            //   $scope.roomListButton = 0;
            $scope.foldSessionInfo($session, e);
        }
    };

    $scope.displaySessionSequence = function(e) {
        $scope.sessionSequenceRequested = !$scope.sessionSequenceRequested;
        $(e.target).closest('button').toggleClass("btn-info").toggleClass("btn-success");
    };

    $scope.countSessionsForRoom = function(room) {
        var count = 0;
        for(var i=0;i<$scope.currentStudy.sessionobs.length;i++) {
            if($scope.currentStudy.sessionobs[i].room_id == room._id)
                count++;
        }
        return count;
    };

    $scope.displayChart = function($chart, e) {
        //ngProgress.start();
        $("button.btn").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success").addClass("active");
        activeStudyButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        if(activeRoomButton != null)
            activeRoomButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        if(activeSessionButton != null)
            activeSessionButton.removeClass("btn-info").addClass("btn-success").addClass("active");
        $scope.chartName = $chart.name;
        $scope.chartShortName = $chart.shortName;
        $scope.chartRequested = true;
    };

    $scope.showImageModal = function () {

        var modalInstance = $modal.open({
            templateUrl: 'ImageDetailModal.html',
            controller: 'ImageDetailModalCtrl',
            windowClass: 'imageDetailModal',
            size: 'lg',
            resolve: {
                currentSession: function () {
                    return $scope.currentSession;
                }
            }
        });

  /*      modalInstance.result.then(function(command) {
        }, function() {
        });
  */
    };

    $scope.setVisitorClass = function (visitorColor) {
           return "visitor-color-" + visitorColor;
    };

    $scope.getChartControllerName = function () {
        return "ChartCtrl-" + $scope.chartShortName;
    }

    $scope.getInteraction = function(res) {
        if(res == "NONE") {
            res = "";
        }
        return res;
    }

});

iObserveApp.controller('ImageDetailModalCtrl', function($scope, $modalInstance, currentSession) {
        $scope.currentSession = currentSession;
});

/*
iObserveApp.controller('TestDialogController', ['$scope', function($scope, dialog, chartData) {
    $scope.chartData = chartData;
    $scope.close = function(result){
        dialog.close(result);
    };


    function plotChart() {

        ;
    }
    plotChart();
}]);
*/

/*
iObserveApp.directive('chartVisualization', function (iObserveCharting) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="chartTemplateRootElement">' +
                      '<form ng-submit="">' +
                            'Select all <input type="checkbox" ng-model="chartControls.selectAll">' +
                      '</form>' +
                      '<div id="chart"></div>' +
                  '</div>',
        scope: {
            val: '=val',
            chartControls: '='
        },
        link: function (scope, element, attrs) {

            var svg = d3.select("#chart")
                .append("svg")
                .attr("width", 100)
                .attr("height", 100);

            scope.$watch('val', function (newVal, oldVal) {
                if (!newVal || newVal === oldVal) {
                    return;
                }
                svg.selectAll('*').remove();
                iObserveCharting.plotChart(newVal, svg);
            });

            scope.$watch('chartControls.selectAll', function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                if (newVal)
                    iObserveCharting.modifyChart("selectAllCircles", newVal, svg);
            })
        }
    }
});
*/