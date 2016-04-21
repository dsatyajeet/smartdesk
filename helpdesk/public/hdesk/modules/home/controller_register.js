/**
 *
 * Created by satyajeet on 22/12/15.
 */

'use strict';

angular.module('HDRegistration',['ngRoute', 'ngCookies'])

    .controller('RegisterController',
    ['$scope', '$rootScope', '$location', '$window','$cookieStore','$http','RegisterService',
        function ($scope, $rootScope, $location, $window,$cookieStore,$http, RegisterService) {
            // reset login status
$scope.register_flag=false;
            $scope.resData={};
            if ($rootScope.globals && $rootScope.globals.currentUser) {
                $window.location.href ="http://localhost:3000/home";
            }

            //HDAuthenticationService.ClearCredentials();
            $scope.register = function () {
                RegisterService.register($scope.resData).success(function (data) {
                    $scope.register_flag=true;
                    $scope.error_flag=false;
                    console.log("registration succeeded.");
                }).error(function (response) {
                    $scope.error_flag=true;
                    $scope.error_message=response;
                    console.log("registration failed.");
                });
            };
        }]);

