angular.module('uworeview',['customFilters','ui.bootstrap'])
       .controller('uworeviewCtrl', function ($scope, $http){
          
          (function (num) {
            
                    reviews = JSON.parse(JSON.stringify(review[0].reviews));
                       for(var i = 0; i < reviews.length; i++){
                        for(var j = 0; j < reviews[i].content.length; j++){
                               if(reviews[i].content[j].status != num){
                                reviews[i].content.splice(j, 1);
                                j = j - 1;
                               }
                        }
                           if(reviews[i].content.length == 0){
                             $scope.tripItem = true;
                           }
                        
                       }

                       $scope.review = reviews;
                   })();


       	  $scope.user_id = me.first_name;
          
          $scope.review = null;
          $scope.test = reviews[0];
          $scope.max = 5;
          $scope.isReadonly = false;
          $scope.tripItem = true;
          $scope.details = true;
		  $scope.x = null;
		  $scope.$watch('rating', function(newVal) {
		    $scope.max += 1;
		  });

      
          
          
          $scope.back = function () {
             $scope.tripItem = true;
             $scope.details = true;
          }

          $scope.chooseTrip = function (id) {

          	$scope.tripItem = false;
          	for(var i = 0; i < reviews.length; i++){
          		if(reviews[i].trip_id == id){
          			$scope.item = reviews[i].content;
          		}
          	}
          	$scope.trip = id;
           $scope.tripItem = false;
          $scope.details = true;
          }
  
         
         $scope.select = function (num) {
  
         	reviews = JSON.parse(JSON.stringify(review[0].reviews));
             for(var i = 0; i < reviews.length; i++){
             	for(var j = 0; j < reviews[i].content.length; j++){
                     if(reviews[i].content[j].status != num){
                     	reviews[i].content.splice(j, 1);
                     	j = j - 1;
                     }
             	}
                 if(reviews[i].content.length == 0){
                 	 $scope.tripItem = true;
                 }
             	
             }

             $scope.review = reviews;
         }



       	  $scope.tripItem =  false;
       	  $scope.reviewD = false;
          $scope.reviewsDetails = false;
       	  
          $scope.hideReview = function (){
             $scope.tripItem = false;
             $scope.reviewsDetails = true;
          }

       	  $scope.backtoList = function () {
       	  	$scope.tripItem = false;
       	  }

       	  $scope.showReviews = function (items, id) {
            $scope.details = false;
            $scope.tripItem = false;
            $scope.guidelist = false;
       	  	$scope.reviewD = true;
             console.log(items);
             console.log("id" + id);
             $scope.name = items.name;
             $scope.place = items.place_name;
             $scope.id = id;
             $scope.content = items.details;
             $scope.rating = items.rating;
             $scope.x = items.rating;
       	  }

       	  //$scope.switches = $scope.tripItem && $scope.reviewD;

       });