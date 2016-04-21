/**
 * Created by satyajeet on 19/12/15.
 */
var app = angular.module('plunker', ['ngRoute', 'ui.bootstrap']);
app.controller('Nav', function($scope) {
});

app.controller('ModalCtrl', function($scope,  $modal) {

    $scope.name = 'theNameHasBeenPassed';

    $scope.showModal = function() {

        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'modalContent.html',
            controller : ModalInstanceCtrl,
            resolve: {} // empty storage
        };


        $scope.opts.resolve.item = function() {
            return angular.copy({name:$scope.name}); // pass name to Dialog
        }

        var modalInstance = $modal.open($scope.opts);

        modalInstance.result.then(function(){
            //on ok button press
        },function(){
            //on cancel button press
            console.log("Modal Closed");
        });
    };
})

var ModalInstanceCtrl = function($scope, $modalInstance, $modal, item) {

    $scope.item = item;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
