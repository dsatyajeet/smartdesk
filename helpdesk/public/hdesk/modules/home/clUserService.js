var mainApp = angular.module("HDHome");
mainApp
    .factory('HDUserService', ['$http', '$cookieStore', '$rootScope', function ($http, $cookieStore, $rootScope) {
        function formRoleString(userData, roleAdmin, roleSupport, roleCustomer) {
            userData.roles = null;
            if (roleCustomer) {
                userData.roles = 'Customer';
            }
            if (roleAdmin) {
                if (userData.roles) {
                    userData.roles = userData.roles + ',Admin'
                }
                else {
                    userData.roles = 'Admin';
                }
            }
            if (roleSupport) {
                if (userData.roles) {
                    userData.roles = userData.roles + ',Support'
                }
                else {
                    userData.roles = 'Support';
                }
            }
            if (!userData.roles)
                userData.roles = "";
            console.log('role string: ' + userData.roles);
        }

        var service = {};

        service.addUser = function (userData, roleAdmin, roleSupport, roleCustomer) {
            console.log('add token: '+$cookieStore.get('globals').currentUser.authdata);
            formRoleString(userData, roleAdmin, roleSupport, roleCustomer);
            userData.username = userData.email;
            if(userData.supportType) {
                userData.supportTypeId = userData.supportType.categoryId;
            }
            userData.password = userData.firstname;
            userData.role = null;
            if(userData._id){
                userData.userId=userData._id;
                return $http.post('users/update', userData, $rootScope.appConfig);
            }
            return $http.post('users/add', userData, $rootScope.appConfig);
        }

        service.getAll = function () {
            console.log('token: '+$cookieStore.get('globals').currentUser.authdata);
            return $http.get('users/list', $rootScope.appConfig);
        }

        service.getGroupMembers = function (categoryId) {
            return $http.get(('/ticket/groupMembers/'+categoryId),$rootScope.appConfig);
        };


        service.getUserById = function (userId) {
            return $http.get('users/user/' + userId);
        }

        service.hasRole = function (rolename,roles) {
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].name == rolename)
                    return true;
            }
            return false;
        }
        return service;
    }]);

