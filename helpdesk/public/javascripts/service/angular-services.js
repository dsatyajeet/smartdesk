/**
 * Created by keyurvekariya on 12/2/15.
 */


var services = angular.module('helpDeskApp.services', []);

services.factory('ticketService', ['$http', function ($http) {
    return {
        get: function (id) {
            return $http.get('/ticket/get/' + id);
        },
        create: function (ticketData) {
            return $http.post('/ticket/add', ticketData);
        },
        delete: function (id) {
            return $http.delete('/ticket/delete/' + id);
        },
        getAll: function () {
            return $http.get('/ticket/getAll');
        },
    }
}]);


services.factory('userService', ['$http', function ($http) {
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
}]);