/**
 * Created by satyajeet on 12/12/15.
 */
var mainApp = angular.module("HDHome");
mainApp
    .factory('HDTicketService', ['$http', '$cookieStore','$rootScope', function ($http, $cookieStore,$rootScope) {
        console.log('I am in Ticket service ');
        var service = {};
        var config = $rootScope.appConfig;

        service.addTicket = function (ticketData) {
            ticketData.typeId=ticketData.type.categoryId;
            if(ticketData._id){
                ticketData.ticketId=ticketData._id;
                return $http.post('ticket/update', ticketData, config);
            }
            return $http.post('ticket/add', ticketData, config);
        }

        service.getAll = function () {
            return $http.get('ticket/list', config);
        }

        service.getSortedStatus = function () {
            return $http.get('ticket/status/all', config);
        }

        service.getMyCategorised = function () {
            return $http.get('ticket/list/applicable', config);
        }

        service.own = function () {
            return $http.get('ticket/list/my', config);
        }

        service.myRaised = function () {
            return $http.get('ticket/list/myRaised', config);
        }

        service.getTicketById = function (ticketId) {
            return $http.get('ticket/' + ticketId,config);
        }

        service.getTicketFlow = function (ticketId) {
            return $http.get('ticket/logs/' + ticketId,config);
        }

        service.assignTicketMySelf = function (ticketId) {
            var data={};
            var localConfig = {
                headers: {
                    'Authorization': 'Bearer ' + $cookieStore.get('globals').currentUser.authdata
                }
            };

            data.ticketId=ticketId;
            return $http.put('ticket/assignMe',data,localConfig);
        }


        service.assignTicket = function (ticketId,assignedToId) {
            var data={};
            data.ticketId=ticketId;
            data.assignedToId=assignedToId;
            return $http.put('ticket/assign',data,$rootScope.appConfig);
        };

        service.changeStatus = function (ticketId,fromStatusId,mode,comment) {
            var data={};
            data.ticketId=ticketId;
            data.fromStatusId=fromStatusId;
            data.mode=mode;
            data.comment=comment;
            return $http.put('ticket/changeStatus',data,$rootScope.appConfig);
        };

        service.isTicketEditable=function(ticket){
            return ((ticket.user._id==$rootScope.userProfile._id) && (ticket.status.statusId<1));
        }

        return service;
    }]);


