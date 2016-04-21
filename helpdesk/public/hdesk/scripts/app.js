'use strict';

// declare modules
angular.module('HDAuthentication', []);
angular.module('HDHome', []);

angular.module('HDApplication', [
    'HDAuthentication',
    'HDHome',
    'ngRoute',
    'ngCookies'
])
 
.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/login', {
            controller: 'HDLoginController',
            templateUrl: 'hdesk/modules/authentication/views/login2.html',
            hideMenus: true
        })
 
        .when('/', {
            controller: 'HDHomeController',
            templateUrl: 'hdesk/modules/home/views/home.html'
        })
 
        .otherwise({ redirectTo: '/login' });
}])
 
.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);