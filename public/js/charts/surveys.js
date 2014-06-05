iObserveApp.controller('ChartCtrl-survey', function($scope, $timeout, iObserveData) {

    $scope.surveys = [];
    $scope.selectedSurvey = null;
    $scope.dropdown = [];
    $scope.textQuestion = {question: null};
    $scope.textQuestionAnswer = {answer: null};

    var chartData = [];
    $scope.textAnswers = [];

    // Convert an array of objects into an array of primitives from the key 'extractItem'
    var extractObjectsFromObjectArray = function (arrayOfObjects, extractItem) {
        var newArray = [];
        for(var i=0; i<arrayOfObjects.length; i++) {
            newArray.push(arrayOfObjects[i][extractItem]);
        }
        return newArray;
    };

    // Add up a total for answers (one survey, multiple poeple)
    // Relying on the fact that order is preserved in JSON arrays - that the question index matches the inner answer index
    // answerArray : the entire set of answers for a single survey
    // questionLabels : array of strings containing the possible answers
    // answerIndex : where the answer is located within a single person's survey
    var tallyRadioButtonAnswers = function (answerArray, questionLabels, answerIndex) {
        var results = [];
        for(var i=0; i<questionLabels.length; i++) {
            var result = {
                label : questionLabels[i],
                value : 0
            }
            results.push(result);
        }
        for(var j=0; j<answerArray.length; j++) {
            var scoreIndex = questionLabels.indexOf(answerArray[j][answerIndex].answer);
            if(scoreIndex != -1)
                results[scoreIndex].value++;
        }
        return results;
    };

    var tallyCheckBoxAnswers = function (answerArray, questionLabels, answerIndex) {
        var results = [];
        for(var i=0; i<questionLabels.length; i++) {
            var result = {
                label : questionLabels[i],
                value : 0
            };
            results.push(result);
        }
        for(var j=0; j<answerArray.length; j++) {
            var answer = answerArray[j][answerIndex].answer;
            // A checkbox answer is an array and may have zero to many values
            for(var k=0; k<answer.length; k++) {
                var scoreIndex = questionLabels.indexOf(answer[k]);
                if( scoreIndex != -1)
                    results[scoreIndex].value++;
            }
        }
        return results;
    };

    var getTextFieldAnswers = function (answerArray, answerIndex) {
        var results = [];
        for(var i=0; i< answerArray.length; i++) {
            var result = answerArray[i][answerIndex].answer;
            if(result != "")
                results.push(result);
        }
        return results;
    };

    var getTextAreaAnswers = function (answerArray, answerIndex) {
        var results = [];
        for(var i=0; i< answerArray.length; i++) {
            var result = answerArray[i][answerIndex].answer;
            if(result != "")
                results.push(result);
        }
        return results;
    };

    $scope.showTextAnswers = function () {
        $scope.selectedQuestion = $scope.textQuestion.question;
        $scope.textQuestionAnswer.answer = $scope.textQuestion.question.answer[0];
    };

    var setupSelectionMenu = function () {
            for(var i=0; i < $scope.surveys.length; i++) {
                var currentSurvey = $scope.surveys[i];
                var newObject = {
                    text : currentSurvey.label.toString(), index: i
                }
                $scope.dropdown.push(newObject);
            }
    };

    $scope.processData = function () {

        chartData = [];
        $scope.textAnswers = [];
        $scope.textQuestion.question = null;

        if($scope.selectedSurvey == null)
            return;

        // Set up Question structures with Answer tallies
        for(var i=0; i<$scope.surveys[$scope.selectedSurvey.index].questions.length; i++) {
            var currentQuestion = $scope.surveys[$scope.selectedSurvey.index].questions[i];
            switch(currentQuestion.type) {
                case 'TextField' :
                    var newTFObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        answer : getTextFieldAnswers($scope.surveys[$scope.selectedSurvey.index].answers, i)
                    }; $scope.textAnswers.push(newTFObject); break;
                case 'TextArea' :
                    var newTAObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        answer : getTextAreaAnswers($scope.surveys[$scope.selectedSurvey.index].answers, i)
                    }; $scope.textAnswers.push(newTAObject); break;
                case 'RadioButtons' :
                    var labels = extractObjectsFromObjectArray(currentQuestion.options, 'label');
                    var resultObject = tallyRadioButtonAnswers($scope.surveys[$scope.selectedSurvey.index].answers, labels, i);
                    var newRBChartObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        maxValue : d3.max(resultObject, function(d) { return +d.value;} ),
                        results : resultObject
                    }; chartData.push(newRBChartObject); break;
                case 'Checkboxes' :
                    var labels = extractObjectsFromObjectArray(currentQuestion.options, 'label');
                    var resultObject = tallyCheckBoxAnswers($scope.surveys[$scope.selectedSurvey.index].answers, labels, i);
                    var newCBChartObject = {
                        id : currentQuestion._id,
                        label : currentQuestion.label,
                        type : currentQuestion.type,
                        maxValue : d3.max(resultObject, function(d) { return +d.value;} ),
                        results : resultObject
                    }; chartData.push(newCBChartObject); break;
                default : break;
            }
        }

        if($scope.textAnswers.length > 0) {
            $scope.textQuestion.question = $scope.textAnswers[0];
            $scope.textQuestionAnswer.answer = $scope.textQuestion.question.answer[0];
        }
        drawChart();

    };


    $scope.$watch('chartPartialLoaded', function(newValue) {
        iObserveData.goGetSurveysForSpace($scope.currentStudy._id).then(function(resultData) {
            $scope.surveys = resultData[0];
            //$timeout(setupSelectionMenu, 0);
            setupSelectionMenu();
        })
    });

    function wordwrap(text, max) {
        var regex = new RegExp(".{0,"+max+"}(?:\\s|$)","g");
        var lines = [];

        var line;
        while ((line = regex.exec(text))!="") {
            lines.push(line);
        }

        return lines;
    }

    function drawChart() {

        var xTranslation = 0, yTranslation = 0, labelpad = 165;

        var outerMargin = {top: 75, right: 150, bottom: 75, left: 150},
            margin = {top: 75, right: 75, bottom: 75, left: 75},
            width = 250 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        d3.select("svg").remove("svg");

        var svg = d3.select("#chartSurvey").append("svg")
            .attr("class", "surveychart")
            .attr("width", 1024)
            .attr("height", 723)
            .append("g")
            .attr("transform", "translate(" + outerMargin.left + "," + outerMargin.top + ")");

        for(var i=0; i<chartData.length; i++) {
            var data = chartData[i].results;

            // Two functions to fit raw data into appropriate chart sizing
            var xFit = d3.scale.linear().domain([0, chartData[i].maxValue]).rangeRound([0, width]);
            var yFit = d3.scale.ordinal().domain(d3.range(data.length)).rangeBands([0, width]);

            // Each chart set up
            var newG = svg.append("g");

            newG.attr("transform", function() {
                    var x = xTranslation;
                    var y = yTranslation;
                    yTranslation = xTranslation == 750 ? yTranslation+250 : yTranslation;
                    xTranslation = xTranslation == 750 ? 0 : xTranslation+250;
                    return "translate(" + x + "," + y + ")";
                })
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            newG.selectAll("line")
                .data(xFit.ticks(5).map(xFit.tickFormat(5, "d")))
                .enter().append("line")
                .attr("x1", xFit)
                .attr("x2", xFit)
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "#ccc");

            var bars = newG.selectAll("g.rect")
                .data(data)
                .enter().append("svg:rect")
                // Individual bars set up
                .attr("fill", "darkblue" )
                .attr("width", function(d) { return xFit(d.value); })
                .attr("height", function(d,i) {return yFit.rangeBand()} )
                .attr("y", function(d,i) {return yFit(i)});

            var bartext = newG.selectAll(".bartext")
                .data(data)
                .enter().append("text")
                .attr("x", function(d) { return xFit(d.value); })
                .attr("y", function(d,i) { return yFit(i) + yFit.rangeBand() / 2; })
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "end") // text-align: right
                .text(function(d) { if(d.value > 0) return d.value; })

            var labels = newG.selectAll(".labels")
                .data(data)
                .enter().append("text")
                .attr("x", 0 )
                .attr("y", function(d,i) { return yFit(i) + yFit.rangeBand() / 2; })
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "end") // text-align: right
                .text(function(d) { return d.label; });

            var vSeparation = 13, textX=50, textY=100, maxLength=20;

            var title = newG.append("text")
                .attr("x", width/2 )
                .attr("y", height+20)
             //   .attr("dx", -3) // padding-right
             //   .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "middle") // text-align: right
                .attr("font-size", 14)
               // .text(chartData[i].label)
                .each(function (d) {
                    var lines = wordwrap(chartData[i].label, maxLength);

                    for (var j = 0; j < lines.length; j++) {
                        d3.select(this).append("tspan").attr("dy",vSeparation).attr("x",textX).text(lines[j]);
                    }
                });

            newG.selectAll(".rule")
                .data(xFit.ticks(5).map(xFit.tickFormat(5, "d")))
                .enter().append("text")
                .attr("class", "rule")
                .attr("x", xFit)
                .attr("y", 0)
                .attr("dy", -3)
                .attr("text-anchor", "middle")
                .text(String);

            var axisH = newG.append("line")
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "#000");
        }
    }
});