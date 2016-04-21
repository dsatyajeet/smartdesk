var mainApp = angular.module("HDHome");
/*
 Router >>>>>>>>>>>>
 */
mainApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.

        when('/addStudent', {
            templateUrl: 'hdesk/modules/home/views/tables2.html',
            controller: 'AddStudentController'
        }).

        when('/viewStudents', {
            templateUrl: 'hdesk/modules/home/views/table.html',
            controller: 'ViewStudentsController'
        }).

        when('/userAdd', {
            templateUrl: 'hdesk/modules/home/views/userAdd.html',
            controller: 'UserController'
        }).

        when('/userView/:userId', {
            templateUrl: 'hdesk/modules/home/views/userView.html',
            controller: 'UserController'
        }).

        when('/userList', {
            templateUrl: 'hdesk/modules/home/views/userList.html',
            controller: 'UserListController'
        }).

        when('/userEdit/:userId', {
            templateUrl: 'hdesk/modules/home/views/userAdd.html',
            controller: 'UserController'
        }).

        when('/ticketAdd', {
            templateUrl: 'hdesk/modules/home/views/ticketAdd.html',
            controller: 'TicketController'
        }).

        when('/ticketEdit/:ticketId', {
            templateUrl: 'hdesk/modules/home/views/ticketAdd.html',
            controller: 'TicketController'
        }).

        when('/ticketView/:ticketId', {
            templateUrl: 'hdesk/modules/home/views/ticketView.html'//,
            //controller: 'TicketController'
        }).

        when('/ticketFlow/:ticketId', {
            templateUrl: 'hdesk/modules/home/views/ticketFlow2.html',
            controller: 'TicketFlowController'
        }).

        when('/ticketList', {
            templateUrl: 'hdesk/modules/home/views/ticketList.html',
            controller: 'TicketListController'
        }).

        when('/ticketList/:mode', {
            templateUrl: 'hdesk/modules/home/views/ticketList.html',
            controller: 'TicketListController'
        }).

        when('/profileView', {
            templateUrl: 'hdesk/modules/home/views/profileView.html',
            controller: 'ProfileController'
        }).

        otherwise({
            redirectTo: '/profileView'
        });
}]);
