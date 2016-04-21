'use strict';

angular.module('HDAuthentication',[])

    .controller('HDLoginController',
    ['$scope', '$rootScope', '$location',
        function ($scope, $rootScope, $location) {
            // reset login status
            console.log('in ng controller..##');
            $scope.myval = 'satya';
            $scope.login = function () {
                console.log('i wanna log..');
            };
        }]);