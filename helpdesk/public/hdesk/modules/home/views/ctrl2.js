'use strict';

angular.module('HDHome', ['ngRoute', 'ngCookies','ngAnimate', 'ui.bootstrap'])

    .controller('HDHomeController',
    ['$scope', '$rootScope','$cookieStore', 'HDHomeService','HDUserService','HDUtilService',
        function ($scope, $rootScope, $cookieStore,HDHomeService,HDUserService,HDUtilService) {

            if($cookieStore.get('globals')) {
                $rootScope.appConfig = {
                    headers: {
                        'Authorization': 'Bearer ' + $cookieStore.get('globals').currentUser.authdata,
                        'Accept': 'application/json;'
                    }
                };
            }

            $rootScope.$on('whatevereventnameyouwant', function(event, data) { console.log('ROOT::::EMIT'+data); });
            $rootScope.ErrorPoint = {};
            $rootScope.MessageCSS={};
            $rootScope.MessageCSS.error='danger';
            $rootScope.MessageCSS.success='success';

            $rootScope.logout=function(){
                HDHomeService.logout();
            };

            $rootScope.resetMessagePoint = function () {
                //                MessagePoint.type;
                //                MessagePoint.message;
                $rootScope.MessagePoint = {};
            };

            $rootScope.isSupportUser = function(){
                return HDUserService.hasRole('Support', $rootScope.userProfile.roles);
            };

            $rootScope.isTicketAssignable = function(ticketObj){
                if(!$rootScope.isSupportUser()) {

                    console.log('support user returning false ...');
                    return false;
                }
                /*
                 if($rootScope.isTicketAssigned(ticketObj)){
                 console.log('tkt assigned returning false ...');
                 return false;
                 }*/
                var chkAssign=$rootScope.isCategoryMatched($rootScope.userProfile.supportType.categoryId,ticketObj.type.categoryId);
                console.log('category.match returning...#'+chkAssign);
                return chkAssign;
            };

            $rootScope.isTicketAssigned = function (ticketObj) {
                return ticketObj.assignedTo;
            }

            $rootScope.isCategoryMatched = function (userCategoryId,ticketCategoryId) {
                return userCategoryId==ticketCategoryId;
            }

            $rootScope.formErrorMessagePoint = function (code, message) {
                $rootScope.MessagePoint.code = code;
                $rootScope.MessagePoint.message = message;
                $rootScope.MessagePoint.flag=true;
                $rootScope.MessagePoint.type='error';
                $rootScope.MessagePoint.cssType=$rootScope.MessageCSS.error;
            };

            $rootScope.formSuccessMessagePoint = function (code, message) {
                $rootScope.MessagePoint.code = code;
                $rootScope.MessagePoint.message = message;
                $rootScope.MessagePoint.flag=true;
                $rootScope.MessagePoint.type='success';
                $rootScope.MessagePoint.cssType=$rootScope.MessageCSS.success;
            };

            $rootScope.setMsgTrue = function () {
                $rootScope.rtMsg = true;
            }

            $rootScope.setMsgFalse = function () {
                $rootScope.rtMsg = false;
            }

            HDHomeService.myProfile().then(function successCallback(response) {
                console.log(' profile user: ' + response);
                $rootScope.userProfile = response.data;
                $rootScope.roleBasedLinks=HDUtilService.getRoleBasedArrayLinks2($rootScope.userProfile.roles);
                $rootScope.roleColors=HDUtilService.getRoleColors();
                $scope.getRoleColor=function(rolename){
                    return $rootScope.roleColors[rolename];
                };
            }, function errorCallback(response) {
                $rootScope.userProfile = {};
                console.log('error in getting my profile..' + response);
            });
        }]);
var mainApp = angular.module("HDHome");

mainApp.controller('AddStudentController', function ($scope) {
    $scope.message = "This page will be used to display add student form";
});

mainApp.controller('ViewStudentsController', function ($scope) {
    $scope.message = "This page will be used to display all the students";
});

mainApp.controller('UserListController', ['$scope', 'HDUserService', function ($scope, HDUserService) {
    $scope.hasRole = function (rolename, roles) {
        return HDUserService.hasRole(rolename, roles);
    };
    HDUserService.getAll().success(function (userList) {
        $scope.userList = userList;
    }).error(function (errResponse) {
        console.log('error to view userList: ' + errResponse);
    });
}]);

mainApp.controller('TicketListController', ['$scope', '$rootScope', '$routeParams', 'HDTicketService', 'HDUtilService',
    function ($scope, $rootScope, $routeParams, HDTicketService, HDUtilService) {
        $rootScope.resetMessagePoint();
        if ($routeParams.mode == 3) {
            HDTicketService.myRaised().success(function (ticketList) {
                $scope.ticketList = ticketList;
            }).error(function (errResponse) {
                console.log('error to view my raised ticketList: ' + errResponse);
                $rootScope.formErrorMessagePoint(404, errResponse);
            });
        }
        else{
            if ($routeParams.mode == 2) {
                HDTicketService.own().success(function (ticketList) {
                    $scope.ticketList = ticketList;
                }).error(function (errResponse) {
                    console.log('error to view my ticketList: ' + errResponse);
                    $rootScope.formErrorMessagePoint(404, errResponse);
                });
            } else {
                if ($routeParams.mode == 1) {
                    HDTicketService.getMyCategorised().success(function (ticketList) {
                        $scope.ticketList = ticketList;
                    }).error(function (errResponse) {
                        console.log('error to view ticketList: ' + errResponse);
                        $rootScope.formErrorMessagePoint(404, errResponse);
                    });
                } else {
                    HDTicketService.getAll().success(function (ticketList) {
                        $scope.ticketList = ticketList;
                    }).error(function (errResponse) {
                        console.log('error to view ticketList: ' + errResponse);
                    });
                }
            }}
    }]);

mainApp.controller('UserController', ['$scope', '$rootScope', '$location', '$routeParams', 'HDUserService', 'HDUtilService',
    function ($scope, $rootScope, $location, $routeParams, HDUserService, HDUtilService) {
        console.log('Current Location:::'+$location.path());
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
        if ($routeParams.userId) {
            $scope.myparam = $routeParams.userId;
            HDUserService.getUserById($routeParams.userId).success(function (resData) {
                console.log('user viewed successfully..' + resData);
                if (resData.email) {
                    $scope.resData = resData;
                    $scope.roleAdmin = HDUserService.hasRole('Admin', resData.roles);
                    $scope.roleSupport = HDUserService.hasRole('Support', resData.roles);
                    $scope.roleCustomer = HDUserService.hasRole('Customer', resData.roles);
                }
                else {
                    $scope.resData.rcvd = 'false';
                }

            }).error(function (resData) {
                console.log('user view failed..' + resData);
            });
        }
        else {
            $scope.myparam = 'not present';
        }


        $scope.addUser = function () {
            $rootScope.resetMessagePoint();
            HDUserService.addUser($scope.resData, $scope.roleAdmin, $scope.roleSupport, $scope.roleCustomer).success(function (resData) {
                console.log('user added successfully..' + resData);
                $location.path('/userView/' + resData._id);
            }).error(function (resData) {
                $rootScope.formErrorMessagePoint(404, resData.errorMessage);
                console.log('user added failed..' + resData);
            });

        }

    }]);

//Ticket controller
mainApp.controller('TicketController',
    ['$scope', '$rootScope','$location', '$routeParams', 'HDTicketService', 'HDUtilService','HDUserService',
        function ($scope,$rootScope, $location, $routeParams, HDTicketService, HDUtilService,HDUserService) {
            $scope.myCount=1;

            $scope.isTicketEditable=function(){
                return HDTicketService.isTicketEditable($scope.resData);
            }

            $scope.$on('MyEvent', function() {
                $scope.myCount++;
            });

            $scope.$on('whatevereventnameyouwant', function(event, data) { console.log('ONNNNNNEMITXX'+data); });
            $scope.isTicketAssignable=function(){
                return $rootScope.isTicketAssignable($scope.resData);
            }
            $scope.showAssignBox=true;
            $scope.flagOff =function(){
                $scope.showAssignBox=false;
            }

            $scope.flagOn =function(){
                $scope.showAssignBox=true;
            }


            $scope.assignTicketForMe=function(){
                HDTicketService.assignTicketMySelf($scope.resData._id).success(function(data){
                    $scope.resData=data;
                    $rootScope.formSuccessMessagePoint('200','Ticket assigned successfully.')
                }).error(function(errData){
                    $rootScope.formErrorMessagePoint(404, errData);
                    console.log('ticket assigning failed...' + errData);
                });
            }
            $scope.resData = {};
            if ($routeParams.ticketId) {
                $scope.myparam = $routeParams.ticketId;
                HDTicketService.getTicketById($routeParams.ticketId).success(function (resData) {



                    HDUserService.getGroupMembers(resData.type.categoryId).success(function (response) {
                        $scope.groupMembers = response;
                        console.log('ticket viewed successfully..' + resData);
                        $scope.resData = resData;
                        $scope.resData.typeId = resData.type.categoryId;

                        $scope.alreadyAssignedTo={};
                        if(resData.assignedTo){
                            $scope.alreadyAssignedTo=resData.assignTo;
                        }

                        console.log('CHK equality:: '+($scope.alreadyAssignedTo._id==resData.user._id));
                    }).error(function (err) {
                        console.log('error on loadin members..' + err);

                    });








                }).error(function (resData) {
                    console.log('ticket view failed..' + resData);
                });
            }
            else {
                $scope.myparam = 'not present';
            }


            $scope.addTicket = function () {
                HDTicketService.addTicket($scope.resData).success(function (response) {
                    console.log('ticket added');
                    $location.path('/ticketView/' + response._id);
                }).error(function (errResponse) {
                    console.error('error in addin tkt: ' + errResponse);
                });
            };

            HDUtilService.getCategories().success(function (response) {
                $scope.categories = response;
            }).error(function (err) {
                console.log('error on loadin categories..' + err);
            });

            /* HDUserService.getGroupMembers().success(function (response) {
             $scope.groupMembers = response;
             }).error(function (err) {
             console.log('error on loadin members..' + err);
             });*/



        }]);


mainApp.controller('AssignTicketCtrl', function ($scope, $uibModal, $log,HDUserService,HDTicketService) {
    $scope.resData1={};
    //$scope.assignDisabled=false;
    $scope.$emit('whatevereventnameyouwantb', 'Hello1');
    $scope.$on('whatevereventnameyouwant', function(event, data) { console.log('ONNNNNNEMIT'+data); });
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.items2 = ['item1-2', 'item2-2', 'item3-2'];
    console.log('RES DATA::: '+$scope.resData.subject);
    /* HDUserService.getGroupMembers($scope.$parent.resData.type.categoryId).success(function (response) {
     $scope.groupMembers = response;
     }).error(function (err) {
     console.log('error on loadin members..' + err);
     });*/
    //$scope.groupMembers = {};
    console.log('CCHKK PRNT data:'+$scope.resData._id);

    $scope.animationsEnabled = true;

    $scope.open = function (ticketId) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'assignTicketModel.html',
            controller: 'AssignModalInstanceCtrl',
            resolve: {
                groupMembers: function () {
                    return $scope.$parent.groupMembers;

                },
                assignData: function () {
                    return $scope.$parent.resData;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.$parent.resData.assignedTo=selectedItem;
            //$scope.selected = selectedItem;
            //console.log('>>>>>>>>>>>>>'+$scope.resData1.assignedTo.firstname);
            $scope.$emit('MyEvent');

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

mainApp.controller('AssignModalInstanceCtrl', function ($scope, $uibModalInstance,$rootScope,HDTicketService,groupMembers,assignData) {
    $scope.$emit('whatevereventnameyouwant', 'Hello2');
    $scope.groupMembers2=groupMembers;
    $scope.assignData=assignData;
    $scope.resData1={};
    $scope.assignDisabled=true;
    $scope.validateAssignee=function(){

        $scope.assignDisabled=((assignData.assignedTo && assignData.assignedTo._id) && (assignData.assignedTo._id==$scope.resData1.assignedTo._id));
        console.log('triggered...'+$scope.assignDisabled+'    new assignee..'+$scope.resData1.assignedTo._id);

    };

    if(assignData.assignedTo){
        $scope.resData1.assignedTo= assignData.assignedTo;
        $scope.validateAssignee();
    }
    $scope.assignTicket=function(){

    }

    $scope.ok = function () {
        $rootScope.resetMessagePoint();
        console.log('INSTANCE VALL :'+$scope.resData1.assignedTo.firstname)
        HDTicketService.assignTicket($scope.assignData._id,$scope.resData1.assignedTo._id).success(function(data){
            $scope.resData=data;
            $rootScope.formSuccessMessagePoint('200','Ticket assigned successfully.');
            $uibModalInstance.close($scope.resData1.assignedTo);
        }).error(function(errData){
            $rootScope.formErrorMessagePoint(404, errData.errorMessage);
            console.log('ticket assigning failed...' + errData);
        });



        //  $uibModalInstance.close('hello.123.');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});