'use strict';

angular.module('HDAuthentication')

    .factory('HDAuthenticationService',
    [ '$http', '$cookieStore', '$rootScope', '$timeout',
        function ( $http, $cookieStore, $rootScope, $timeout) {
            var service = {};
            var config = {
                headers: {
                    'Authorization': 'Basic aWhlbHA6aXNlY3JldA==',
                    'Accept': 'application/json;'
                }
            };
            /*   services.factory('userService', ['$http', function ($http) {
             var config = {
             headers: {
             'Authorization': 'Basic aWhlbHA6aXNlY3JldA==',
             'Accept': 'application/json;'
             }
             };
             return {
             register: function (userData) {
             return $http.post('/users/add', userData, config);
             },
             login: function (userData) {
             return $http.post('/users/oauth/token', userData, config);
             },
             getProfile: function (userName) {
             return $http.post('/users/oauth/token', userData, config);
             }

             }
             }]);*/

            service.Loginex = function (username, password, callback) {

                /* Dummy authentication for testing, uses $timeout to simulate api call
                 ----------------------------------------------*/
                $timeout(function () {
                    var response = {success: username === 'test' && password === 'test'};
                    if (!response.success) {
                        response.message = 'Username or password is incorrect';
                    }
                    callback(response);
                }, 1000);


                /* Use this for real authentication
                 ----------------------------------------------*/
                //$http.post('/api/authenticate', { username: username, password: password })
                //    .success(function (response) {
                //        callback(response);
                //    });

            };

            service.Login = function (username, password, callback) {
                var userData = {};
                userData.username = username;
                userData.password = password;
                userData.grant_type = 'password';
            return $http.post('/users/oauth/token', userData, config);


                /* Use this for real authentication
                 ----------------------------------------------*/
                //$http.post('/api/authenticate', { username: username, password: password })
                //    .success(function (response) {
                //        callback(response);
                //    });

            };

            service.SetToken = function (username,token) {

                $rootScope.globals = {
                    currentUser: {
                        username: username,
                        authdata: token
                    }
                };
                $cookieStore.put('globals', $rootScope.globals);
            };

            service.ClearCredentials = function () {
                $rootScope.globals = {};
                $cookieStore.remove('globals');
            };

            return service;
        }]);