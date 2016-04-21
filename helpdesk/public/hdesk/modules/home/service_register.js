'use strict'

angular.module('HDRegistration')
    .factory('RegisterService', ['$http', function ($http) {
        var service = {};
        service.register = function (userData) {
            return $http.post('users/register', userData);
        }
        return service;
    }]);