angular.module('guide',['ui.bootstrap'])
        .controller('guideCtrl', function ($scope){
             $scope.max = 5;
             $scope.total = 4;

             $scope.pic = guide[0].photos[0];

        });