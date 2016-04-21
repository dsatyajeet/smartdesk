/**
 * Created by satyajeet on 22/12/15.
 */

var mainApp = angular.module("HDHome");

mainApp.controller('ProfileController', ['$scope', '$rootScope', '$location', '$routeParams', 'HDUserService', 'HDUtilService', 'HDHomeService',
    function ($scope, $rootScope, $location, $routeParams, HDUserService, HDUtilService, HDHomeService) {
        console.log('Current Location:::' + $location.path());
        $scope.resData = {};

        HDUtilService.getCategories().success(function (response) {
            $scope.categories = response;
            var obj = {};
            var undf;
            obj.categoryId = undf;
            obj.name = 'none';
            $scope.categories.unshift(obj);
        }).error(function (err) {
            console.log('error on loading categories..' + err);
        });

        HDHomeService.myProfile().then(function successCallback(resData) {
                $scope.resData = resData.data;

        }, function errorCallback(resData) {
            console.log('user view failed..' + resData);
        });
    }]);


