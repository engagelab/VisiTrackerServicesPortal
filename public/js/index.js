iObserveApp.controller('NavCtrl', function($scope, iObserveUser) {

    $scope.showingSplashScreen = {showing: false};

    $scope.showHideNavTabs = function(loginState) {
        if(loginState) {
            $scope.tabs = [
                { title:"Profile", content:"", page: 'partial/profile.html' },
                { title:"Studies", content:"", page: 'partial/studies.html' },
                { title:"Statistics", content:"", page: 'partial/statistics.html' },
                { title:"About", content:"", page: 'partial/about.html', active: true },
                { title:"Logout", content:"", page: '' }
            ];
        }
        else {
            $scope.tabs = [
                { title:"About", content:"", page: 'partial/about.html', active: true },
                { title:"Login", content:"", page: 'partial/login.html' },
                { title:"Register", content:"", page: 'partial/register.html'}
            ];
        }
    };

    $scope.checkSelectedTab = function(title) {
        $scope.showingSplashScreen = false;
        if(title == "Logout") {
            $scope.logout();
        }
    };

    $scope.activeTab = function() {
        if($scope.showingSplashScreen.showing)
            return { title:"VisiTracker", content:"", page: 'partial/splash.html', active: true };
        else {
            return $scope.tabs.filter(function(tab){
                return tab.active;
            })[0];
        }
    };

    $scope.logout = function() {
        iObserveUser.doUserLogout();
        $scope.showHideNavTabs(false);
    };

    function init() {
        iObserveUser.setShowHideNavTabsFn($scope.showHideNavTabs);
        if(iObserveUser.doGetLoginState() && iObserveUser.startLogoutTimer()) {
            $scope.showHideNavTabs(true);
        }
        else
            $scope.showHideNavTabs(false);
    }
    init();
});


iObserveApp.controller('RegisterCtrl', function($scope, iObserveUser) {

    $scope.registerMe = function($event) {
        if(registrationValidated()) {
            var data = {last_name : $scope.user.lastName, first_name: $scope.user.firstName, email: $scope.user.email, password : $scope.user.password};
            iObserveUser.doUserRegistration(data).then(function(resultData) {
                $scope.resultData = resultData[0];
                var data = {email : $scope.resultData.email, password: $scope.resultData.password};
                iObserveUser.doUserLogin(data, null).then(function(resultData) {
                    if(iObserveUser.getLoginState()) {
                        $scope.showHideNavTabs(true);
                    }
                });
            });
        }
    }

    function registrationValidated() {
        return true;
    }

});


iObserveApp.controller('AboutCtrl', function($scope, iObserveUser) {

    $scope.getLoginState = function () {
        return iObserveUser.doGetLoginState();
    }

});


iObserveApp.controller('LoginCtrl', function($scope, iObserveUser, iObserveUtilities) {

    $scope.logMeIn = function() {

        if(loginValidated()) {
            var data = {email : $scope.email, password: $scope.password};
            var promise = iObserveUser.doUserLogin(data);
            promise.then(function(data) {
                if(iObserveUser.getLoginState()) {
                    $scope.showHideNavTabs(true);
                }
            });
        }
    };

    function loginValidated() {
        return true;
    }

});

iObserveApp.controller('ProfileCtrl', function($scope, iObserveUser) {

    $scope.userEdit = [{key:"first_name", name: "First Name", value:""},{key:"last_name", name: "Last Name", value:""},{key:"email", name: "Email", value:""},{key:"password", name: "Password", value:""}]

    function getProfile() {
        iObserveUser.doGetProfile().then(function(resultData) {
            $scope.user = resultData[0];
            $scope.userEdit[0].value = $scope.user.first_name;
            $scope.userEdit[1].value = $scope.user.last_name;
            $scope.userEdit[2].value = $scope.user.email;
            $scope.userEdit[3].value = $scope.user.password;
        });
    }

    $scope.updateProfile = function($event) {
            var data = {_id : iObserveUser.getUserId(), first_name: $scope.user.first_name, last_name: $scope.user.last_name, email: $scope.user.email, password: $scope.user.password};
            iObserveUser.doUpdateProfile(data).then(function(resultData) {
                $scope.user = resultData[0].user;
            });
    };


    if($scope.user == null) {
        getProfile();
    }

});

iObserveApp.controller('ModalCtrl', function($scope, $modal, $log, iObserveUser) {

    $scope.open = function() {

        var modalInstance = $modal.open({
            templateUrl: 'LogoutWarningModal.html',
            controller: 'ModalInstanceCtrl',
            backdrop: 'static'
        });

        modalInstance.result.then(function(command) {
            if(command == "extend") {
                iObserveUser.doUserRenewLogin();
            }
            }, function() {
                $scope.logout();
        });
    };

    iObserveUser.setShowTimerModal($scope.open);
});

iObserveApp.controller('ModalInstanceCtrl', function($scope, $timeout, $modalInstance, iObserveConfig) {

    var timer;
    var timeCounter = Math.round(iObserveConfig.logoutModalDuration / 1000);
    $scope.counter = timeCounter.toString();

    $scope.extend = function() {
        $timeout.cancel(timer);
        $modalInstance.close('extend');
    };
    $scope.logout = function() {
        $timeout.cancel(timer);
        $modalInstance.dismiss('cancel');
    };

    function onSecondTimeout() {
        timeCounter--;
        $scope.counter = timeCounter.toString();
        if(timeCounter == 0) {
            $timeout.cancel(timer);
            $modalInstance.dismiss('cancel');
        }
        else
            startSecondTimer();
    }

    function startSecondTimer() {
        timer = $timeout(onSecondTimeout, 1000);
    }
    startSecondTimer();

});

iObserveApp.controller('UserEditorController', function($scope) {

    $scope.isCollapsed = true;
    $scope.isNotCollapsed = false;

    // Some code taken from the 'todos' AngularJS example
    $scope.editorEnabled = true;

    $scope.enableEditor = function() {
   //     $scope.editorEnabled = true;
        $scope.editValue = $scope.itemToEdit.value;
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.isNotCollapsed = !$scope.isCollapsed;
    }

    $scope.disableEditor = function() {
  //    $scope.editorEnabled = false;
        $scope.isCollapsed = !$scope.isCollapsed;
        $scope.isNotCollapsed = !$scope.isCollapsed;
    }

    $scope.retain = function() {
        if ($scope.editValue == "") {
            return false;
        }
        $scope.itemToEdit.value = $scope.editValue;
      //  angular.element("updateBtn").$setValidity(true);
      //  $scope.updateBtn.$setValidity('updateBtn', true);

        $scope.disableEditor();
    }
});