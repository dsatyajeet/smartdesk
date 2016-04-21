'use strict';
 
angular.module('HDAuthentication',['ngRoute', 'ngCookies'])
 
.controller('HDLoginController',
    ['$scope', '$rootScope', '$location', '$window','$cookieStore','$http','HDAuthenticationService',
    function ($scope, $rootScope, $location, $window,$cookieStore,$http, HDAuthenticationService) {
        // reset login status
        console.log('in ng controller..##');
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        if ($rootScope.globals.currentUser) {
            $window.location.href ="http://localhost:3000/home";
        }

        //HDAuthenticationService.ClearCredentials();
        $scope.myval='satya';
        $scope.login = function () {
            $scope.dataLoading = true;
            HDAuthenticationService.Login($scope.username, $scope.password).success(function (data) {
                HDAuthenticationService.SetToken($scope.username,data.access_token);
                //$location.path('/');
                $window.location.href ="http://localhost:3000/home";

            }).error(function (response) {
                response.message='Username or password invalid !';
                $scope.error = response.message;
                $scope.dataLoading = false;
                console.log("logged in not successfully");
            });
        };
    }]);