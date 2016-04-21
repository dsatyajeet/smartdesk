/**
 * Created by satyajeet on 12/12/15.
 */
var mainApp = angular.module("HDHome");
mainApp
    .factory('HDUtilService', ['$http', '$rootScope',function ($http, $rootScope) {
        var service = {};
        //var config = $rootScope.appConfig;
        var configLinks = {'Admin':['a1','a2','a3'],'Support':['b1','b2','b3'],'Customer':['c1','c2']};
        var roleColors={};
        roleColors.Admin='cadetblue';
        roleColors.Customer='yellow';
        roleColors.Support='black';

        service.getRoleColors=function(){
            return roleColors;
        };
        var configLinks2 = {
            'Admin':[
                {'name':'View Users','link':'userList'},
                {'name':'Add User','link':'userAdd'},
                {'name':'View all tickets','link':'ticketList'}]
            ,'Support':[
                {'name':'Applicable Tickets','link':'ticketList/1'},
                {'name':'My assigned tickets','link':'ticketList/2'}]
            ,'Customer':[
                {'name':'My Tickets','link':'ticketList/3'},
                {'name':'Raise Ticket','link':'ticketAdd'}]
        };

        service.getRoleBasedJsonLinks=function(roles){
            var roleBaseLinks={};
            for(var i=0;i<roles.length;i++){
                var role=roles[i].name;
                roleBaseLinks[role]=configLinks[role];
            }
            return roleBaseLinks;
        }

        service.getRoleBasedArrayLinks=function(roles){
            var roleBaseLinks=[];
            for(var i=0;i<roles.length;i++){
                var role=roles[i].name;
                for(var j=0;j<configLinks[role].length;j++){
                    var config={};
                    config.role=role;
                    config.link=configLinks[role][j];
                    roleBaseLinks.push(config);
                }
                roleBaseLinks[role]=configLinks[role];
            }
            return roleBaseLinks;
        }

        service.getRoleBasedArrayLinks2=function(roles){
            var roleBaseLinks=[];
            for(var i=0;i<roles.length;i++){
                var role=roles[i].name;
                console.log('role: xx'+role+'   cnflink role: '+configLinks2[role]);
                for(var j=0;j<configLinks2[role].length;j++){
                    var config={};
                    config.role=role;
                    config.hlink=configLinks2[role][j].link;
                    console.log('role link: '+configLinks2[role][j].name);
                    config.hname=configLinks2[role][j].name;
                    roleBaseLinks.push(config);
                }
              //  roleBaseLinks[role]=configLinks[role];
            }
            return roleBaseLinks;
        }

        service.getCategories = function () {
            return $http.get('category/list', $rootScope.appConfig);
        };

        service.getConfigLinks=function(){
            return configLinks;
        }
        return service;
    }]);


