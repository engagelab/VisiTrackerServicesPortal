//angular.module('LocalStorageModule').value('prefix', 'visitracker');
var iObserveApp = angular.module('iObserveApp', ['ngResource', 'ngSanitize', 'localStorageModule', 'ui.bootstrap', 'ngUpload', 'ngCsv', 'ngProgress'], null);
/*
iObserveApp.config(function ($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';
    $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
        //return $.param(data);
        return angular.toJson(data);
        //return data;
    }
});
*/
iObserveApp.factory('iObserveStorage', function ($storage) {
    var vtStorage = $storage('visiTrackerStorage');
    var getItem = function (itemKey) { return vtStorage.getItem(itemKey); };
    var setItem = function (itemKey, itemValue) { return vtStorage.setItem(itemKey, itemValue); };
    var removeItem = function (itemKey) { return vtStorage.removeItem(itemKey); };

    return {
        getItem:getItem,
        setItem:setItem,
        removeItem:removeItem
    }
});

iObserveApp.factory('iObserveConfig', function () {
    return {
        routePrePath: "",               //  http://visitracker.uio.im
        logoutModalDuration: 180000,    //  3 minutes  In milliseconds = 180000
        loginDuration: 86400000         //  24 hours   In milliseconds  = 86400000
    }
});

iObserveApp.factory('iObserveData', function ($http, $q, iObserveConfig, iObserveStorage) {

    function requestHttpData(config) {
        var deferred = $q.defer();
        $http(config).success(function(data, status, textStatus, jqXHR) {
            deferred.resolve([data, status, textStatus, jqXHR]);
        }).error(function(data){
                alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    }

    function getData(url) {
        var config = { method: "GET", url : iObserveConfig.routePrePath + url, params: {token:iObserveStorage.getItem('token')}, data : {} };
        return requestHttpData(config);
    }

    function postData(url, data) {
        var config = { method: "POST", url : iObserveConfig.routePrePath + url, params: {token:iObserveStorage.getItem('token')}, data : data };
        return requestHttpData(config);
    }

    function deleteData(url, data) {
        var config = { method: "DELETE", url : iObserveConfig.routePrePath + url, params: {token:iObserveStorage.getItem('token')}, data : data };
        return requestHttpData(config);
    }

    function putData(url, data) {
        var config = { method: "PUT", url : iObserveConfig.routePrePath + url, params: {token:iObserveStorage.getItem('token')}, data : data };
        return requestHttpData(config);
    }

    // GET requests
    var requestSurveysForSpace = function(space_id) { return getData("/space/" + space_id + "/survey"); };
    var requestEventsForSpaceAndRoom = function(space_id, room_id) { return getData("/space/" + space_id + "/" + room_id + "/events"); };
    var requestStatEventsForSpaceAndRoom = function(space_id, room_id, startDT, endDT, type) { return getData("/portal/space/" + space_id + "/" + room_id + "/" + startDT + "/" + endDT + "/" + type + "/events"); };
    var requestSessionsForSpaceAndRoom = function(space_id, room_id) { return getData("/space/" + space_id + "/" + room_id + "/session"); };
    var requestBasicSessionsForSpaceAndRoom = function(space_id, room_id) { return getData("/portal/space/" + space_id + "/" + room_id + "/basicSession"); };
    var requestStatSessionsForSpaceAndRoom = function(space_id, room_id) { return getData("/portal/space/" + space_id + "/" + room_id + "/session"); };
    var requestRoomsForSpace = function(space_id) { return getData("/space/" + space_id + "/rooms"); };
    var requestStatRoomsForSpace = function(space_id) { return getData("/portal/space/" + space_id + "/rooms"); };
    var requestEventListObject = function(sessionID) { return getData("/session/" + sessionID + "/events"); };
    var requestSessionObject = function(sessionID) { return getData("/session/" + sessionID); };
    var requestStudyListObject = function() { return getData("/user/" + iObserveStorage.getItem('userId') + "/space"); };
    var requestStatsStudyListObject = function() { return getData("/portal/user/" + iObserveStorage.getItem('userId') + "/space"); };
    var requestListActionsObject = function() { return getData("/action/simple"); };
    var requestListResourcesObject = function() { return getData("/resource/simple"); };
    var requestSessionsGroupDemographicsForSpaceAndRoom = function(space_id, room_id) { return getData("/portal/space/" + space_id + "/" + room_id + "/session/visitorgroupbysize"); };
    var requestSpaceActionsAndResourceList = function(space_id) { return getData("/space/" + space_id + "/actionresourcelist"); };
    // POST requests
    var requestNewStudyObject = function(data) { return postData("/user/" + iObserveStorage.getItem('userId') + "/space", data); };
    var requestAddStudyRoomObject = function(data) { return postData("/space/"+data.spaceid+"/room", data); };
    var requestNewActionObject = function(data) { return postData("/action", data); };
    var requestNewResourceObject = function(data) { return postData("/resource", data); };
    var requestNewSurveyObject = function(data) { return postData("/space/" + data.study_id + "/survey", data); };
    var requestNewQuestionObject = function(data) { return postData("/survey/" + data.survey_id + "/question", data); };

    // DELETE requests
    var requestDeleteStudyObject = function(data) { return deleteData("/space/" + data, null); };
    var requestDeleteRoomObject = function(data) { return deleteData("/room/" + data, null); };
    var requestDeleteQuestionObject = function(data) { return deleteData("/question/"+data, null); };
    var requestDeleteSurveyObject = function(data) { return deleteData("/survey/"+data, null); };

    // PUT requests
    var requestUpdateRoomStartCoordinatesObject = function(data) { return putData("/room/startcoords", data); };
    var requestUpdateRoomEndCoordinatesObject = function(data) { return putData("/room/endcoords", data); };
    var requestUpdateSpaceActionsObject = function(data) { return putData("/space/action", data); };
    var requestUpdateSpaceResourcesObject = function(data) { return putData("/space/resource", data); };

    // USER
    // GET requests
    var requestUserLogout = function() { return getData('/logout')};
    var requestUserRegistration = function(data) { return postData('/user', data)};
    var requestUserProfile = function() { return getData('/user/'+iObserveStorage.getItem('userId'))};
    var requestUserUpdateProfile = function() { return getData('/logout')};

    return {
        doGetSession:requestSessionObject,
        goGetSurveysForSpace: requestSurveysForSpace,
        doGetEvents: requestEventListObject,
        doGetSessionsForSpaceAndRoom: requestSessionsForSpaceAndRoom,
        doGetBasicSessionsForSpaceAndRoom: requestBasicSessionsForSpaceAndRoom,
        doGetStatSessionsForSpaceAndRoom: requestStatSessionsForSpaceAndRoom,
        doGetEventsForSpaceAndRoom: requestEventsForSpaceAndRoom,
        doGetStatEventsForSpaceAndRoom: requestStatEventsForSpaceAndRoom,
        doGetStudies: requestStudyListObject,
        doGetStatsStudies: requestStatsStudyListObject,
        doGetRoomsForSpace: requestRoomsForSpace,
        doGetStatRoomsForSpace: requestStatRoomsForSpace,
        doGetSpaceActionsAndResourceList: requestSpaceActionsAndResourceList,
        doNewStudy: requestNewStudyObject,
        doDeleteStudy: requestDeleteStudyObject,
        doCreateStudyRoom: requestAddStudyRoomObject,
        doDeleteRoom: requestDeleteRoomObject,
        doUpdateRoomStartCoordinates: requestUpdateRoomStartCoordinatesObject,
        doUpdateRoomEndCoordinates: requestUpdateRoomEndCoordinatesObject,
        doGetActions: requestListActionsObject,
        doUpdateSpaceActions: requestUpdateSpaceActionsObject,
        doNewAction: requestNewActionObject,
        doGetResources: requestListResourcesObject,
        doUpdateSpaceResources: requestUpdateSpaceResourcesObject,
        doNewResource: requestNewResourceObject,
        doNewSurvey: requestNewSurveyObject,
        doNewQuestion: requestNewQuestionObject,
        doDeleteQuestion: requestDeleteQuestionObject,
        doDeleteSurvey: requestDeleteSurveyObject,
        doGetStatSessionsGroupDemographicsForSpaceAndRoom: requestSessionsGroupDemographicsForSpaceAndRoom,

        // USER
        doUserLogout:requestUserLogout,
        doUserRegistration:requestUserRegistration,
        doUserGetTheProfile:requestUserProfile,
        doUserUpdateProfile:requestUserUpdateProfile
    }
});

iObserveApp.factory('iObserveUser', function ($http, $q, $timeout, iObserveConfig, iObserveStorage, iObserveData) {

    var showHideNavTabs;
    var showTimerModal;

    var userLoginState = function() {
        return (iObserveStorage.getItem('loginState'));
    };

    var userLogout = function() {
        if(iObserveStorage.getItem('loginState')) {
            var deferred = $q.defer();
            stopLogoutTimer();
            iObserveStorage.setItem('tokenExpiry', 0);
            iObserveStorage.setItem('loginState', false);
            iObserveStorage.setItem('userId', '');
            var config = { method : "GET", url : iObserveConfig.routePrePath + '/logout', params: {token :iObserveStorage.getItem('token')} };
            $http(config).success(function(data) {
                iObserveStorage.setItem('token', '');
                deferred.resolve(data);
            }).error(function(data, status){
               //     alert( "Request failed: " + data.message );
                    deferred.reject();
                });
            return deferred.promise;
        }
        else return null;
    };

    var userLogin = function(data) {
        var deferred = $q.defer();
        var config = { method : "POST", url : iObserveConfig.routePrePath + '/login', data : data };
        $http(config).success(function(data) {
                iObserveStorage.setItem('loginState', true);
                iObserveStorage.setItem('token', data.token);
                iObserveStorage.setItem('userId', data.userId);
                var currentDate = new Date();
                iObserveStorage.setItem('tokenExpiry', (currentDate.getTime()) + iObserveConfig.loginDuration);
                startLogoutTimer();
                deferred.resolve(data);
            })
            .error(function(data, status){
                alert( "Request failed: " + data.message  );
                deferred.reject(data);
            });
        return deferred.promise;
    };

    var userRenewLogin = function() {
        var deferred = $q.defer();
        var config = { method: "GET", url : iObserveConfig.routePrePath + '/renewlogin', params: {token:iObserveStorage.getItem('token')} };
        $http(config)
            .success(function(data, status) {
                var thestatus = status;
                var currentDate = new Date();
                iObserveStorage.setItem('tokenExpiry', (currentDate.getTime()) + iObserveConfig.loginDuration);
                startLogoutTimer();
                deferred.resolve(data);
            })
            .error(function(data, status){
                var thestatus = status;
                if(thestatus == 401)
                    alert( "You have missed the renewal period, please log in again" );
                else
                    alert( "Request failed: " + data.message  );
                deferred.reject();
            });
        return deferred.promise;
    };

    var userRegistration = function(data) {
        return iObserveData.doUserRegistration(data);
    };

    var getProfile = function() {
        return iObserveData.doUserGetTheProfile();
    };

    var updateProfile = function(data) {
        return iObserveData.doUserUpdateProfile();
    };

    var mytimeout;
    var onTimeout = function () {
        showTimerModal();
    };

    var startLogoutTimer = function () {
        if(mytimeout != null)
            $timeout.cancel(mytimeout);
        var currentDate = new Date();
        var t1 = iObserveStorage.getItem('tokenExpiry');
        var t2 = currentDate.getTime();
        var t3 = iObserveConfig.logoutModalDuration;
        var duration =  t1 - t2 - t3;  //iObserveStorage.getItem('tokenExpiry') - currentDate.getTime() - iObserveConfig.logoutModalDuration;
        if(duration > 0) {// Only enable showing of logout modal if there is more than it's duration time remaining until logout. Else logout.
            mytimeout = $timeout(onTimeout, duration);  // Duration is the time to display modal
            return true;
        }
        else {
            userLogout();
            return false;
        }
    };

    var stopLogoutTimer = function() {
        $timeout.cancel(mytimeout);
    };

    function setShowHideNavTabsFn (shFunction) {
        showHideNavTabs = shFunction;
    }
    function setShowTimerModal (tmFunction) {
        showTimerModal = tmFunction;
    }

    return {
        getLoginState: function() {
            if(iObserveStorage.getItem('loginState') == true) return "logged in";
            else return "not logged in";
        },
        setShowHideNavTabsFn : setShowHideNavTabsFn,
        setShowTimerModal : setShowTimerModal,
        startLogoutTimer : startLogoutTimer,
        stopLogoutTimer : stopLogoutTimer,
        doUpdateProfile : updateProfile,
        doGetProfile : getProfile,
        doGetLoginState : userLoginState,
        doUserRegistration: userRegistration,
        doUserLogin: userLogin,
        doUserLogout: userLogout,
        doUserRenewLogin : userRenewLogin
    };
});


iObserveApp.factory('iObserveUtilities', function ($http) {

    var colorsUsed = [];

    var timeConverter = function($ts){
        return moment.unix($ts).format("ddd Do MMM YYYY, h:mm a");
    };

    var timeConverterShort = function($ts) {
        return moment.unix($ts).format("h:mm:ss a");
    };

    var timeConverterDateToUnix = function($d) {
        return moment($d).unix();
    };

    var tDiffMoment = function ($a,$b, humanize) {
        var a = moment.unix($a);
        var b = moment.unix($b);
        var difference = b.diff(a);
        if(humanize)
            return moment.duration(difference, "milliseconds").humanize();
        else
            return moment.duration(difference, "milliseconds").asSeconds();
    }


    var tDiff = function($a,$b) {
        var a = new Date($a*1000);
        var b = new Date($b*1000);

        var nTotalDiff = b.getTime() - a.getTime();
        var oDiff = new Object();

        oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
        nTotalDiff -= oDiff.days*1000*60*60*24;

        oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
        nTotalDiff -= oDiff.hours*1000*60*60;

        oDiff.minutes = Math.floor(nTotalDiff/1000/60);
        nTotalDiff -= oDiff.minutes*1000*60;

        oDiff.seconds = Math.floor(nTotalDiff/1000);

        return oDiff;
    };

    var loadJSONFile =  function(fileName) {
        var obj = {content:null};
        $http.get(fileName).success(function(data) {
            obj.content = data;
        });
        return obj;
    }

    var getRandomUUID = function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    var decColor2hex = function (color){
        // input:   (String) decimal color (i.e. 16711680)
        // returns: (String) hex color (i.e. 0xFF0000)
        var colorNumber = new Number(color);
        var colArr = colorNumber.toString(16).toUpperCase().split('');
        var numChars = colArr.length;
        for(var a=0;a<(6-numChars);a++){colArr.unshift("0");}
        var result = '#' + colArr.join('');
        if(colorsUsed.indexOf(result) == -1)
            colorsUsed.push(result);
        return result;
    }

    return {
        timeConverter : timeConverter,
        timeConverterShort : timeConverterShort,
        timeConverterDateToUnix : timeConverterDateToUnix,
        tDiff : tDiff,
        loadJSONFile: loadJSONFile,
        getRandomUUID: getRandomUUID,
        decColor2hex : decColor2hex,
        tDiffMoment: tDiffMoment,
        loadJSONFile: loadJSONFile,
        colorsUsed: colorsUsed
    }
});


//  Place a tag called <markdown></markdown> in a html file and this directive will convert any contained plain text to markup.
iObserveApp.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var htmlText = converter.makeHtml(element.text());
            element.html(htmlText)
        }
    }
})