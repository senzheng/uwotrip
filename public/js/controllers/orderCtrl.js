angular.module('orderview',['customFilters','ui.bootstrap'])
       .constant('itemPerpage', 7)
       .controller('orderCtrl', function ($scope, $http){
          
          
         $scope.hightlightnumber = null;
       $scope.item = [];
       $scope.preview = false;
       $scope.dispu = false;
       var	data = orders;
         $scope.totalItem = data.length;
         $scope.pageNumber = data.length / 7;
         $scope.select = function (num) {
                     $scope.item.length = 0;
                     for(var i = 0; i < data.length; i++){
                         if(num === 0){
                             $scope.before = false;
                              $scope.after = false;
                               $scope.all = true;

                           $scope.item.push(data[i]);
                         }else if(data[i].status === num){
                            $scope.item.push(data[i]);
                            if(data[i].status === 1){
                              $scope.before = true;
                              $scope.after = false;
                              $scope.all = false;
                            }else{
                              $scope.before = false;
                              $scope.after = true;
                              $scope.all = false; }       
                          }
                        }

                        $scope.preview = false;
         	
         }


         $scope.chooseTrip = function (id, item){
            $scope.hightlightnumber = null;
            $scope.name = name;
            $scope.orderID = item._id;
            $scope.payment = item.payment_status;
            $scope.status = item.order_status;
            $scope.paid = item.paid;
            $scope.preview = true;
            $scope.hightlightnumber = id;
         }


         $scope.dispute = function (){
            $scope.dispu = true;
            $scope.preview = false;
         }

         $scope.back = function(){
            $scope.dispu = false;
         }

       	  //$scope.switches = $scope.tripItem && $scope.reviewD;

       });