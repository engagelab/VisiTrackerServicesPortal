/**
 * Created with JetBrains RubyMine.
 * User: jeremyt
 * Date: 7/1/13
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */

//Directive to handle the drag and drop of start/stop coordinates for the floor plan
iObserveApp.directive('poiDraggable', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            var options = scope.$eval(attrs.poiDraggable);
            elm.draggable(options);
        }
    };
});


/*iObserveApp.controller('SurveyDropdownCtrl', function ($scope) {
    $scope.items = [
        {"text": "Short Text", "clicktext": "addSelectedQuestion('tf')"},
        {"text": "Long Text", "clicktext": "addSelectedQuestion('ta')"},
        {"text": "Single Choice or Ranking", "clicktext": "addSelectedQuestion('rb')"},
        {"text": "Multiple Choice Checkboxes", "clicktext": "addSelectedQuestion('cb')"}
    ];

});
*/
//iObserveApp.controller('StudiesCtrl', function ($scope, $dialog, iObserveUser, iObserveData, iObserveUtilities) {
iObserveApp.controller('StudiesCtrl', function ($scope, $modal, iObserveUser, iObserveData, iObserveUtilities) {

    //$scope variable definition
    $scope.studies = null;
    $scope.isAddStudyCollapsed = true;
    $scope.isAddSurveyCollapsed = true;
    $scope.isAddRoomCollapsed = true;
    $scope.isStudyChosen = false;
    $scope.currentStudy = null;
    $scope.currentSurvey = null;
    $scope.rooms = null;
    $scope.surveys = null;
    $scope.sessions = null;
    $scope.roomLabel = "";
    $scope.studyToDelete = null;
    $scope.roomToDelete = null;
    $scope.uploadResponse = "";
    $scope.isEditRoomCollapsed = true;
    $scope.roomToEdit = null;
    $scope.roomStartPoints = null;
    $scope.roomEndPoints = null;
    $scope.actionLabel = "";
    $scope.resourceLabel = "";
    $scope.isWrongImageSize = true;
    $scope.isSurveySelected = true;
    $scope.currentSelectedSurvey = undefined;
    $scope.tfQuestion = undefined;
    $scope.taQuestion = undefined;
    $scope.rbQuestion = undefined;
    $scope.cbQuestion = undefined;
    $scope.formRadioButtonsList = new Array();
    $scope.formCheckBoxButtonsList = new Array();
    $scope.formItemType = "";
    var activeStudyButton = null;
    $scope.expandStudyButton = 0;

    initStudiesPage();

    $scope.timeConverter = iObserveUtilities.timeConverter;
    $scope.tDiff = iObserveUtilities.tDiff;
    $scope.tDiffMoment = iObserveUtilities.tDiffMoment;
    $scope.locked = false;

    $scope.studyTabs = [
        {title:'Surveys', active: true, tabindex: 0},
        {title:'Rooms', tabindex: 1}
    ];
    $scope.studyTabs.activeTab = 0;

    /*

     Global

     */
    $scope.surveytypes = [
        {"text": "Please select..", "clicktext": ""},
        {"text": "Short Text", "clicktext": "tf"},
        {"text": "Long Text", "clicktext": "ta"},
        {"text": "Single Choice or Ranking", "clicktext": "rb"},
        {"text": "Multiple Choice Checkboxes", "clicktext": "cb"}
    ];
    $scope.selectedSurvey = {"type":""};
    $scope.selectedSurvey.type = $scope.surveytypes[0];


    function initStudiesPage() {
        console.log("refreshing studies ....");
        //$scope.studies = iObserveData.doGetStatsStudies();
        $scope.studies = iObserveData.doGetStudies();
        $scope.studies.then(function (response) {
            $scope.studies = response[0];
        });
    };

    function getID() {
        if ($scope.roomLabel != "") {
            return $scope.roomLabel;
        }
        else {
            return iObserveUtilities.getRandomUUID();
        }
    };

    function getStartObjectRotation(uid) {

        for (var i in $scope.roomToEdit.start_points) {
            if ($scope.roomToEdit.start_points[i].uuid == uid) {
                return $scope.roomToEdit.start_points[i].rotation;
                break;
            }
        }
    };

    function getEndObjectRotation(uid) {

        for (var i in $scope.roomToEdit.end_points) {
            if ($scope.roomToEdit.end_points[i].uuid == uid) {
                return $scope.roomToEdit.end_points[i].rotation;
                break;
            }
        }
    };
    /*

     Study

     */
    //toggle add study
    $scope.toggleAddStudy = function() {
        if($scope.isAddStudyCollapsed) {
            $scope.isAddStudyCollapsed = false;
            $("#addStudyButton").addClass("icon-chevron-sign-up").removeClass("icon-chevron-sign-down");
        }
        else {
            $scope.isAddStudyCollapsed = true;
            $("#addStudyButton").addClass("icon-plus").removeClass("icon-chevron-sign-up");
        }
    }

    //create study
    $scope.createNewStudy = function () {
        var label = (angular.element.find('#studyLabelInput'))[0];

        if (label.value != "") {
            var data = {label: label.value};
            iObserveData.doNewStudy(data).then(function (resultData) {
                initStudiesPage();
            });

            label.value = '';
        }

        $scope.toggleAddStudy();

    };


    $scope.getActions = function () {
        var doactions = iObserveData.doGetActions();
        doactions.then(function (data) {
            var resultData = data[0];
            var actionsIds = [];
            for (var j = 0; j < $scope.currentStudy.actions.length; j++) {
                actionsIds.push($scope.currentStudy.actions[j]._id);
            }

            $scope.allActions = [];
            $scope.spaceActions = [];

            for (var i = 0; i < resultData.length; i++) {
                if (actionsIds.indexOf(resultData[i]._id) > -1) {
                    $scope.spaceActions.push(resultData[i]);
                }
                else {
                    $scope.allActions.push(resultData[i]);
                }
            }

            if (actionsIds.length < 3) {
                $scope.isSpaceActionsEmpty = false;
            }
        });
    };

    $scope.getResources = function () {
        iObserveData.doGetResources().then(function (data) {
            var resultData = data[0];
            var resourcesIds = [];
            for (var j = 0; j < $scope.currentStudy.resources.length; j++) {
                resourcesIds.push($scope.currentStudy.resources[j]._id);
            }

            $scope.allResources = [];
            $scope.spaceResources = [];

            for (var i = 0; i < resultData.length; i++) {
                if (resourcesIds.indexOf(resultData[i]._id) > -1) {
                    $scope.spaceResources.push(resultData[i]);
                }
                else {
                    $scope.allResources.push(resultData[i]);
                }
            }

            if (resourcesIds.length < 2) {
                $scope.isSpaceResourcesEmpty = false;
            }
        });
    }

    //expand study
    $scope.expandStudy = function ($study, e) {
        if($scope.isStudyChosen) {
            $scope.isStudyChosen = false;
            $(e.target).closest('button').addClass("btn-info").removeClass("btn-success").removeClass("active");
        }


        $(".studynav").addClass("btn-info").removeClass("btn-success").removeClass("active");
        $(e.target).closest('button').removeClass("btn-info").addClass("btn-success");
        //activeStudyButton = $(e.target).closest('button');

        $scope.currentStudy = $study;
        $scope.isStudyChosen = true;
        $scope.isSpaceActionsEmpty = true;
        $scope.isSpaceResourcesEmpty = true;
        $scope.surveys = $scope.currentStudy.surveys;
        $scope.isEditRoomCollapsed = true;
        $scope.currentSelectedSurvey = null;
        $scope.refreshSurveys();
        $scope.rooms = $scope.currentStudy.rooms;
        $scope.sessions = $scope.currentStudy.sessionobs;
        // hide unfinished sessions from the result
        for (var k = 0; k < $scope.sessions.length; k++) {
            if ($scope.sessions[k].finished_on == null) {
                $scope.sessions.splice(k, 1);
            }
        }

        $scope.getActions();
        $scope.getResources();

    };


    /*

     Survey

     */
    //toggle add survey
    $scope.toggleAddSurvey = function() {
        if($scope.isAddSurveyCollapsed) {
            $scope.isAddSurveyCollapsed = false;
            $("#addSurveyButton").addClass("icon-chevron-sign-up").removeClass("icon-plus");
        }
        else {
            $scope.isAddSurveyCollapsed = true;
            $("#addSurveyButton").addClass("icon-plus").removeClass("icon-chevron-sign-up");
        }
    }


    //refresh surveys
    $scope.refreshSurveys = function () {
        $scope.survey = $scope.surveys[0];
        if($scope.studyTabs.activeTab == 0) {
            if ($scope.surveys.length == 0) {
                (angular.element.find('#surveyEditDiv'))[0].style.visibility = "hidden";
            }
            else {
                (angular.element.find('#surveyEditDiv'))[0].style.visibility = "visible";
                $scope.editSurvey($scope.survey);
            }
        }
    };

    //new survey
    $scope.createNewSurvey = function () {
        var data = null;
        var label = (angular.element.find('#surveyLabelInput'))[0];

        if (label.value != "") {
            data = {study_id: $scope.currentStudy._id, label: label.value};
        }
        else {
            data = {study_id: $scope.currentStudy._id, label: getID()};
        }

        iObserveData.doNewSurvey(data).then(function (args) {
            var statusCode = args[1];

            if (Number(statusCode) == 200) {
                iObserveData.doGetStudies().then(function(data) {
                    $scope.studies = data[0];
                    setTimeout($scope.activateCurrentSurvey, 1000);
                });
            }
        });

        label.value = '';
        $scope.toggleAddSurvey();
    };

    //activate current survey
    $scope.activateCurrentSurvey = function () {
        (angular.element.find('#'+$scope.currentStudy._id))[0].click();
    };

    //formatted survey name
    $scope.getFormattedSurvey = function (s) {
        return 'Survey ' + $scope.surveys.indexOf(s) + ': ' + $scope.timeConverter(s.created_on);
    };

    // formatted survey type
    $scope.getFormattedSurveyType = function (t) {
        if(t == "TextField") return "Short Text";
        else if(t == "TextArea") return "Long Text";
        else if(t == "RadioButtons") return "Single Choice or Ranking";
        else if(t == "Checkboxes") return "Multiple Choice Checkboxes";
    };

    //edit survey
    $scope.editSurvey = function (s) {
        $scope.isSurveySelected = false;
        $scope.currentSelectedSurvey = s;
        $scope.formItemType = "";
    };

    // show question type
    $scope.addSelectedQuestion = function (selected) {
        var type = selected.clicktext;
        switch (type) {
            case 'tf':
                $scope.formItemType = 'TextField';
                break;
            case 'ta':
                $scope.formItemType = 'TextArea';
                break;
            case 'rb':
                $scope.formItemType = 'RadioButtons';
                $scope.formRadioButtonsList = [];
                $scope.radioitem = $scope.formRadioButtonsList[0];
                break;
            case 'cb':
                $scope.formItemType = 'Checkboxes';
                $scope.formCheckBoxesList = [];
                break;
            default:
                $scope.formItemType = '';
        }
    };

    //create form item
    $scope.postFormItem = function (formdata) {

        var data = {
            survey_id: $scope.currentSelectedSurvey._id,
            type: $scope.formItemType
        };

        var valid = false;
        switch ($scope.formItemType) {

            case 'TextField':
                if (formdata != undefined && formdata != "") {
                    data.label = formdata;
                    valid = true;
                }

                break;
            case 'TextArea':
                if (formdata != undefined && formdata != "") {
                    data.label = formdata;
                    valid = true;
                }

                break;
            case 'RadioButtons':
                if (formdata != undefined && formdata != "" && $scope.formRadioButtonsList.length > 0) {
                    data.label = formdata;
                    data.options = $scope.formRadioButtonsList;
                    valid = true;
                }

                break;
            case 'Checkboxes':
                if (formdata != undefined && formdata != "" && $scope.formCheckBoxButtonsList.length > 0) {
                    data.label = formdata;
                    data.options = $scope.formCheckBoxButtonsList;
                    valid = true;
                }

                break;
        }

        if (valid) {
            iObserveData.doNewQuestion(data).then(function (args) {
                var acceptedQuestion = args[0];
                var statusCode = args[1];

                if (Number(statusCode) == 200) {
                    $scope.currentSelectedSurvey.questions.push(acceptedQuestion);
                    $scope.formItemType = "";
                }
            });
        }
        $scope.formItemType = '';
        $scope.selectedSurvey.type = $scope.surveytypes[0];
    };

    // add new radiobutton option
    $scope.addNewRadioButton = function (radioLabel) {
        var canAdd = true;
        for (var i = 0; i < $scope.formRadioButtonsList.length; i++) {
            if (($scope.formRadioButtonsList)[i].label == radioLabel.toLowerCase()) {
                canAdd = false;
            }
        }

        if (radioLabel != "" && canAdd) {
            $scope.formRadioButtonsList.push({label: radioLabel.toLowerCase(), uid: getID()});
            (angular.element.find('#formRadioButtonInput'))[0].text = "";
        }
    };

    //delete radiobutton option
    $scope.deleteRadioButton = function (selectedItem) {
        if(selectedItem != undefined) {
            for(var i=0; i < $scope.formRadioButtonsList.length; i++) {
                if(($scope.formRadioButtonsList)[i].uid == selectedItem.uid) {
                    $scope.formRadioButtonsList.splice(i, 1);
                }
            }
        }
    };

    // add new checkbox button option
    $scope.addNewCheckBoxButton = function (checkboxLabel) {
        var canAdd = true;

        for (var i = 0; i < $scope.formCheckBoxButtonsList.length; i++) {
            if (($scope.formCheckBoxButtonsList)[i].label == checkboxLabel.toLowerCase()) {
                canAdd = false;
            }
        }

        if (checkboxLabel != null && checkboxLabel != "" && canAdd) {
            $scope.formCheckBoxButtonsList.push({label: checkboxLabel.toLowerCase(), uid: getID()});
            (angular.element.find('#formCheckBoxButtonInput'))[0].text = "";
        }
    };

    //delete radiobutton option
    $scope.deleteCheckBoxButton = function (selectedItem) {
        if(selectedItem != undefined) {
            for(var i=0; i < $scope.formCheckBoxButtonsList.length; i++) {
                if(($scope.formCheckBoxButtonsList)[i].uid == selectedItem.uid) {
                    $scope.formCheckBoxButtonsList.splice(i, 1);
                }
            }
        }
    };

    //delete selected question
    $scope.deleteQuestion = function (quest_id) {

        iObserveData.doDeleteQuestion(quest_id).then(function (args) {
            var statusCode = args[1];

            if (Number(statusCode) == 200) {
                for (var i = 0; i < ($scope.currentSelectedSurvey.questions).length; i++) {
                    if (quest_id == ($scope.currentSelectedSurvey.questions)[i]._id) {
                        $scope.currentSelectedSurvey.questions.splice(i, 1);
                    }
                }
            }
        });
    };

    $scope.getFormattedQuestionOptions = function(questionOptionsObject) {

        var options = "";
        for(var i = 0; i<questionOptionsObject.length; i++) {
            options = options + questionOptionsObject[i].label + ", ";
        }

        return options.substr(0, options.length-2);
    };


    /*

     Space


     */
    //toggle add study
    $scope.toggleAddSpace = function() {
        if($scope.isAddRoomCollapsed) {
            $scope.isAddRoomCollapsed = false;
            $("#addSpaceButton").addClass("icon-chevron-sign-up").removeClass("icon-plus");
        }
        else {
            $scope.isAddRoomCollapsed = true;
            $("#addSpaceButton").addClass("icon-plus").removeClass("icon-chevron-sign-up");
        }
    }

    //file submit changed
    $scope.file_changed = function (element, $scope) {
        var f = element.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image;
            img.onload = function () {
                console.log(img.width + " " + img.height);
                if (img.width == 1024 && img.height == 723) {
                    console.log('image dimensions OK');
                }
                else {
                    (angular.element.find('#imageUploaderForm'))[0].reset();
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(f);
    };

    //roomsubmitted
    $scope.roomSubmited = function (content, completed) {
        if (completed) {
            $scope.uploadResponse = content;
            if ($scope.uploadResponse._id != "") {

                var label = (angular.element.find('#roomLabelInput'))[0];
                if(label.value == "") {
                    label.value = getID();
                }

                iObserveData.doCreateStudyRoom({spaceid: $scope.currentStudy._id, label: label.value, uri: $scope.uploadResponse.url}).then(function (data) {
                    var resultData = data[0];
                    if (resultData._id != "") {
                        iObserveData.doGetStudies().then(function(data) {
                            $scope.studies = data[0];
                            $scope.toggleAddSpace()
                            setTimeout($scope.activateCurrentSurvey, 1000);
                            (angular.element.find('#imageUploaderForm'))[0].reset();
                        });
                    }
                });
            }

        }
    };

    //edit room
    $scope.openEditRoom = function ($selectedRoom) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit = $selectedRoom;
        $scope.roomStartPoints = $scope.roomToEdit.start_points;
        $scope.roomEndPoints = $scope.roomToEdit.end_points;
    };

    //toggle show/hide room edit mode
    $scope.showhideEditMode = function () {

        if ($scope.roomStartPoints.length > 0 && $scope.roomEndPoints.length > 0) {
            var newSPoints = [];

            var look = angular.element.find('.startPoint');
            for (var i = 0; i < look.length; i++) {
                newSPoints.push({uuid: look[i].id, rotation: getStartObjectRotation(look[i].id), xpos: look[i].offsetLeft, ypos: look[i].offsetTop, label: String(look[i].innerText).replace(/\n/g, "")});
                //newSPoints.push({uuid: look[i].id, rotation: getStartObjectRotation(look[i].id), xpos: Number((look[i].style.left).replace("px", "")), ypos: Number((look[i].style.top.replace("px", ""))), label: look[i].innerText.substr(0, look[i].innerText.length-5).replace("\n", "")});
            }
            $scope.roomToEdit.start_points = newSPoints;

            var data = {_id: $scope.roomToEdit._id, start_points: $scope.roomToEdit.start_points };

            iObserveData.doUpdateRoomStartCoordinates(data).then(function (resultData) {
                var newEPoints = [];

                var look = angular.element.find('.endPoint');
                for (var i = 0; i < look.length; i++) {
                    newEPoints.push({uuid: look[i].id, rotation: getEndObjectRotation(look[i].id), xpos: look[i].offsetLeft, ypos: look[i].offsetTop, label: String(look[i].innerText).replace(/\n/g, "")});
                    //newEPoints.push({uuid: look[i].id, rotation: getEndObjectRotation(look[i].id), xpos: Number((look[i].style.left).replace("px", "")), ypos: Number((look[i].style.top.replace("px", ""))), label: look[i].innerText.substr(0, look[i].innerText.length-5).replace("\n", "")});
                }
                $scope.roomToEdit.end_points = newEPoints;

                var data = {_id: $scope.roomToEdit._id, end_points: $scope.roomToEdit.end_points};
                iObserveData.doUpdateRoomEndCoordinates(data).then(function (resultData) {
                    $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
                });

            });
        }
        else {

            var title = 'Missing start or end coordinates';
            var msg = 'Please make sure to add at least one start point (green arrow) and one end point (red arrow), before saving.';
            var btns = [
                {result: 'ok', label: 'OK', cssClass: 'btn-primary'}
            ];

           /* $dialog.messageBox(title, msg, btns).open();       */
        }
    }

    //remove start point
    $scope.removeStartPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for (var i in $scope.roomToEdit.start_points) {
            if ($scope.roomToEdit.start_points[i].uuid == $uid) {
                $scope.roomToEdit.start_points.splice(i, 1);
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    //rotate start point
    $scope.rotateStartPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for (var i in $scope.roomToEdit.start_points) {
            if ($scope.roomToEdit.start_points[i].uuid == $uid) {
                $scope.roomToEdit.start_points[i].rotation = $scope.roomToEdit.start_points[i].rotation + 90;
                if ($scope.roomToEdit.start_points[i].rotation >= 360) {
                    $scope.roomToEdit.start_points[i].rotation = 0;
                }
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    //remove end point
    $scope.removeEndPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for (var i in $scope.roomToEdit.end_points) {
            if ($scope.roomToEdit.end_points[i].uuid == $uid) {
                $scope.roomToEdit.end_points.splice(i, 1);
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    //rotate end point
    $scope.rotateEndPoint = function ($uid) {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        for (var i in $scope.roomToEdit.end_points) {
            if ($scope.roomToEdit.end_points[i].uuid == $uid) {
                $scope.roomToEdit.end_points[i].rotation = $scope.roomToEdit.end_points[i].rotation + 90;
                if ($scope.roomToEdit.end_points[i].rotation >= 360) {
                    $scope.roomToEdit.end_points[i].rotation = 0;
                }
                break;
            }
        }
        $scope.openEditRoom($scope.roomToEdit);
    };

    //add start point
    $scope.addStartPoint = function () {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit.start_points.push({uuid: getID(), xpos: 1024 / 2, ypos: 768 / 2, rotation: 0, label: null});
        $scope.openEditRoom($scope.roomToEdit);
    };

    //add end point
    $scope.addEndPoint = function () {
        $scope.isEditRoomCollapsed = !$scope.isEditRoomCollapsed;
        $scope.roomToEdit.end_points.push({uuid: getID(), xpos: 1024 / 2, ypos: 768 / 2, rotation: 0, label: null});
        $scope.openEditRoom($scope.roomToEdit);
    };

    $scope.getPOILabel = function(currentPOI) {
        if(currentPOI.label != null) {
            return currentPOI.label;
        }
        else {
            return currentPOI.uuid;
        }

    };

    $scope.openEditStartPOILabelModal = function(currentPOI) {
        $scope.currentStartPOILabelEdit = currentPOI;

        var modalInstance = $modal.open({
            templateUrl: 'OpenEditStartPOILabelModalCtrl.html',
            controller: 'OpenEditStartPOILabelModalInstanceCtrl',
            resolve: {
                'currentPOI': function() {
                    return currentPOI;
                }
            }
        });

        modalInstance.result.then(function (newLabel) {
            for (var i in $scope.roomToEdit.start_points) {
                if ($scope.roomToEdit.start_points[i].uuid == $scope.currentStartPOILabelEdit.uuid) {
                    $scope.roomToEdit.start_points[i].label = newLabel;
                    break;
                }
            };
        }, function () {
            console.log("EditStartPOILabel panel dismissed");
        });

    };

    $scope.openEditEndPOILabelModal = function(currentPOI) {
        $scope.currentEndPOILabelEdit = currentPOI;

        var modalInstance = $modal.open({
            templateUrl: 'OpenEditEndPOILabelModalCtrl.html',
            controller: 'OpenEditEndPOILabelModalInstanceCtrl',
            resolve: {
                'currentPOI': function() {
                    return currentPOI;
                }
            }
        });

        modalInstance.result.then(function (newLabel) {
            for (var i in $scope.roomToEdit.end_points) {
                if ($scope.roomToEdit.end_points[i].uuid == $scope.currentEndPOILabelEdit.uuid) {
                    $scope.roomToEdit.end_points[i].label = newLabel;
                    break;
                }
            };
        }, function () {
            console.log("EditEndPOILabel panel dismissed");
        });

    };

    $scope.openActionModal = function() {

        var modalInstance = $modal.open({
            templateUrl: 'StudiesActionsModalCtrl.html',
            controller: 'StudiesActionsModalInstanceCtrl',
            resolve: {
                'allActions': function() {
                    return $scope.allActions;
                },
                'spaceActions': function() {
                    return $scope.spaceActions;
                },
                'currentStudy': function() {
                    return $scope.currentStudy;
                }
            }
        });

        modalInstance.result.then(function (currentStudy) {
            $scope.currentStudy = currentStudy;

            if ($scope.currentStudy.actions.length > 2) {
                $scope.isSpaceActionsEmpty = true;
            }
            else {
                $scope.isSpaceActionsEmpty = false;
            }

        }, function () {
            console.log("action panel dismissed");
        });

    };

    $scope.openResourceModal = function() {

        var modalInstance = $modal.open({
            templateUrl: 'StudiesResourcesModalCtrl.html',
            controller: 'StudiesResourcesModalInstanceCtrl',
            resolve: {
                'allResources': function() {
                    return $scope.allResources;
                },
                'spaceResources': function() {
                    return $scope.spaceResources;
                },
                'currentStudy': function() {
                    return $scope.currentStudy;
                }
            }
        });

        modalInstance.result.then(function (currentStudy) {
            $scope.currentStudy = currentStudy;

            if ($scope.currentStudy.resources.length > 1) {
                $scope.isSpaceResourcesEmpty = true;
            }
            else {
                $scope.isSpaceResourcesEmpty = false;
            }

        }, function () {
            console.log("resource panel dismissed");
        });
    };


    $scope.openDeleteRoomModal = function() {

        $scope.rooms.forEach(function(room){
           if(room.active) {
           $scope.roomToDelete = room;
           }
        });


        var modalInstance = $modal.open({
            templateUrl: 'StudiesDeleteRoomModalCtrl.html',
            controller: 'StudiesDeleteRoomModalInstanceCtrl',
            resolve: {
                'roomToDelete': function() {
                    return $scope.roomToDelete;
                }
            }
        });

        modalInstance.result.then(function (selectedRoom) {
            iObserveData.doDeleteRoom(selectedRoom._id).then(function (resultData) {
                iObserveData.doGetStudies().then(function(data) {
                    $scope.studies = data[0];
                    setTimeout($scope.activateCurrentSurvey, 1000);
                    (angular.element.find('#imageUploaderForm'))[0].reset();
                    $scope.roomToDelete = null;
                });
            });

        }, function () {
            $scope.roomToDelete = null;
        });
    };

    //delete study
    $scope.deleteStudy = function (selectedStudy) {
        $scope.studyToDelete = selectedStudy;

        var modalInstance = $modal.open({
            templateUrl: 'StudiesDeleteStudyModalCtrl.html',
            controller: 'StudiesDeleteStudyModalInstanceCtrl',
            resolve: {
                'studyToDelete': function() {
                    return $scope.studyToDelete;
                }
            }
        });

        modalInstance.result.then(function (selectedStudy) {

            iObserveData.doDeleteStudy(selectedStudy._id).then(function (resultData) {
                initStudiesPage();
            });

        }, function () {
            $scope.studyToDelete = null;
        });
    };

    //delete survey
    $scope.deleteSurvey = function (selectedSurvey) {
        $scope.surveyToDelete = selectedSurvey;

        var modalInstance = $modal.open({
            templateUrl: 'StudiesDeleteSurveyModalCtrl.html',
            controller: 'StudiesDeleteSurveyModalInstanceCtrl',
            resolve: {
                'surveyToDelete': function() {
                    return $scope.surveyToDelete;
                }
            }
        });

        modalInstance.result.then(function (selectedSurvey) {

            iObserveData.doDeleteSurvey(selectedSurvey._id).then(function (args) {
                var statusCode = args[1];

                if (Number(statusCode) == 200) {
                    for (var i = 0; i < ($scope.surveys).length; i++) {
                        if (selectedSurvey._id == ($scope.surveys)[i]._id) {
                            $scope.surveys.splice(i, 1);
                        }
                    }

                    $scope.currentSelectedSurvey = undefined;
                    $scope.refreshSurveys();

                }
            });

        }, function () {
            $scope.surveyToDelete = null;
        });
    };
});

iObserveApp.controller('OpenEditStartPOILabelModalInstanceCtrl', function($scope, iObserveData, $modalInstance, currentPOI) {
    $scope.currentPOI = currentPOI;

    if(currentPOI.label != null) {
        $scope.startPOILabel = currentPOI.label;
    }
    else {
        $scope.startPOILabel = currentPOI.uuid;
    }

    $scope.updateLabel = function (lab) {
        $modalInstance.close(lab);
    };
});

iObserveApp.controller('OpenEditEndPOILabelModalInstanceCtrl', function($scope, iObserveData, $modalInstance, currentPOI) {
    $scope.currentPOI = currentPOI;

    if(currentPOI.label != null) {
        $scope.endPOILabel = currentPOI.label;
    }
    else {
        $scope.endPOILabel = currentPOI.uuid;
    }

    $scope.updateLabel = function (lab) {
        $modalInstance.close(lab);
    };
});

iObserveApp.controller('StudiesDeleteStudyModalInstanceCtrl', function($scope, iObserveData, $modalInstance, studyToDelete) {
    $scope.studyToDelete = studyToDelete;

    $scope.okDeleteStudy = function () {
        $modalInstance.close($scope.studyToDelete);
    };

    $scope.cancelDeleteStudy = function () {
        $modalInstance.dismiss();
    };
});

iObserveApp.controller('StudiesDeleteRoomModalInstanceCtrl', function($scope, iObserveData, $modalInstance, roomToDelete) {
    $scope.roomToDelete = roomToDelete;

    $scope.okDeleteRoom = function () {
        $modalInstance.close($scope.roomToDelete);
    };

    $scope.cancelDeleteRoom = function () {
        $modalInstance.dismiss();
    };
});

iObserveApp.controller('StudiesActionsModalInstanceCtrl', function($scope, iObserveData, $modalInstance, allActions, spaceActions, currentStudy) {
    $scope.isAddActionCollapsed = true;
    $scope.allActions = allActions;
    $scope.spaceActions = spaceActions;
    $scope.currentStudy = currentStudy;

    // create new action
    $scope.createNewAction = function () {
        var label = (angular.element.find('#actionLabelInput'))[0];

        if (label.value != "") {
            var data = {type: label.value};

            iObserveData.doNewAction(data).then(function (args) {
                var newAction = args[0];
                var statusCode = args[1];

                if (Number(statusCode) == 200) {
                    $scope.allActions.push(newAction);
                    $scope.currentStudy.actions.push(newAction);
                }

                label.value = '';
            });
        }
        $scope.isAddActionCollapsed = true;
    };

    //remove action from space
    $scope.removeActionFromSpace = function () {
        var selectBoxSpaceActions = angular.element.find('#spaceActionsList option:selected');

        for (var i = 0; i < selectBoxSpaceActions.length; i++) {
            if (selectBoxSpaceActions[i].text != "START" && selectBoxSpaceActions[i].text != "STOP") {
                $scope.allActions.push($scope.spaceActions[selectBoxSpaceActions[i].index]);
                $scope.spaceActions.splice(selectBoxSpaceActions[i].index, 1);
            }
        }
    };

    //add action to space
    $scope.addActionToSpace = function () {
        var selectBoxAllActions = angular.element.find('#allActionsList option:selected');

        for (var i = 0; i < selectBoxAllActions.length; i++) {
            $scope.spaceActions.push($scope.allActions[selectBoxAllActions[i].index]);
            $scope.allActions.splice(selectBoxAllActions[i].index, 1);
        }
    };

    // close and save space actions
    $scope.closeAndSaveSpaceActions = function () {
        var data = {_id: $scope.currentStudy._id, actions: $scope.spaceActions};
        iObserveData.doUpdateSpaceActions(data).then(function (resultData) {
            $scope.currentStudy.actions = $scope.spaceActions;
            $modalInstance.close($scope.currentStudy);
        });
    };

    // close space actions
    $scope.closeSpaceActions = function () {
        $modalInstance.dismiss();
    };

});


iObserveApp.controller('StudiesResourcesModalInstanceCtrl', function($scope, iObserveData, $modalInstance, allResources, spaceResources, currentStudy) {
    $scope.isAddResourceCollapsed = true;
    $scope.allResources = allResources;
    $scope.spaceResources = spaceResources;
    $scope.currentStudy = currentStudy;

    //create new resource
    $scope.createNewResource = function () {
        var label = (angular.element.find('#resourceLabelInput'))[0];

        if (label.value != "") {
            var data = {type: label.value};

            iObserveData.doNewResource(data).then(function (args) {
                var newResource = args[0];
                var statusCode = args[1];

                if (Number(statusCode) == 200) {
                    $scope.allResources.push(newResource);
                    $scope.currentStudy.resources.push(newResource);
                }

                label.value = '';
            });
        }
        $scope.isAddResourceCollapsed = true;
    };

    //remove resource from space
    $scope.removeResourceFromSpace = function () {
        var selectBoxSpaceResources = angular.element.find('#spaceResourcesList option:selected');

        for (var i = 0; i < selectBoxSpaceResources.length; i++) {
            if (selectBoxSpaceResources[i].text != "NONE") {
                $scope.allResources.push($scope.spaceResources[selectBoxSpaceResources[i].index]);
                $scope.spaceResources.splice(selectBoxSpaceResources[i].index, 1);
            }
        }
    };

    //add resource to space
    $scope.addResourceToSpace = function () {
        var selectBoxAllResources = angular.element.find('#allResourcesList option:selected');

        for (var i = 0; i < selectBoxAllResources.length; i++) {
            $scope.spaceResources.push($scope.allResources[selectBoxAllResources[i].index]);
            $scope.allResources.splice(selectBoxAllResources[i].index, 1);
        }
    };

    //close and save space resources
    $scope.closeAndSaveSpaceResources = function () {
        var data = {_id: $scope.currentStudy._id, resources: $scope.spaceResources};
        iObserveData.doUpdateSpaceResources(data).then(function (resultData) {
            $scope.currentStudy.resources = $scope.spaceResources;
            $modalInstance.close($scope.currentStudy);
        });
    };

    // close space resources
    $scope.closeSpaceResources = function () {
        $modalInstance.dismiss();
    };

});

iObserveApp.controller('StudiesDeleteSurveyModalInstanceCtrl', function($scope, iObserveData, $modalInstance, surveyToDelete) {
    $scope.surveyToDelete = surveyToDelete;

    $scope.okDeleteSurvey = function () {
        $modalInstance.close($scope.surveyToDelete);
    };

    $scope.cancelDeleteSurvey = function () {
        $modalInstance.dismiss();
    };
});