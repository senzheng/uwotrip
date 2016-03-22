//This is template that can 

angular.module('tempOne',['ui.bootstrap'])
       .factory('friendData',['$http' ,function ($http){
            var baseUrl = "/getFriend" ;
            var friendData = {};

            friendData.getFriendsList = function (){
               return $http.get(baseUrl);
            };

            return friendData;
       }])
      .controller("chatCtrl", function ($scope, $http, $uibModal, friendData, $interval){
                    $scope.friendList = list;
                    $scope.grouplist =  groups;
                    $scope.test = list[0].name;
                    $scope.testOne =  groups[0]._id;
                    $scope.user_id = list[0].name;
                    //console.log(list);
                    var message = [];
                    var outgoingmessage = [];
                    var socket = io();
                    
                    var groupMessage = [];
                    
                    var messager = [];
                     $scope.number = [];
                    var content = null;
                    $scope.show = true;
                    for(var i = 0; i < groups[0].contact.length; i++){
                       messager[groups[0].contact[i]._id] = [];
                       
                    }

                    for(var i = 0; i < list[0].list.length; i++){
                      messager[list[0].list[i]._id] = [];
                      
                    }

                   socket.on('test_connection' , function (data){
                      messager["test_connection"] = [{name: data.sender, message: data.message}]
                  });

                    
                   socket.on(list[0]._id , function (data){
                       messager[data.sender].push({
                            "name" : data.sender,
                            "message" : data.message
                       });
                        

                  });
                  
                  socket.on(groups[0]._id, function (data){
                          groupMessage.push({
                            "name" : data.sender,
                            "message" : data.message
                       });


                        
                    });
                 


                   
                   
                   $interval(function(){
                 loadMessage();
                 //changeStatus();
               },1000)
               
             function loadMessage() {
                   $scope.socket = content;
                   console.log(content);
                   for(var i = 0 ; i < 1; i++){
                    $scope.number[groups[0]._id] = groupMessage.length;
                   }

                   for(var i = 0; i < groups[0].contact.length; i++){
                    $scope.number[groups[0].contact[i]._id] = messager[groups[0].contact[i]._id].length;
                   }

                   for(var i = 0; i < list[0].list.length; i++){
                      $scope.number[list[0].list[i]._id] = messager[list[0].list[i]._id].length;
                      
                    }
             }

              
                  
           
         
         $scope.mes = message;
             
         
           //changeStatus();
         $scope.Reciver = "Chat Here"
         $scope.deletes = false;
         $scope.send = function (messages,reciever) {
             socket.emit('server', {"reciever" : reciever , "message" : {"sender": list[0]._id ,"message": messages}});
             console.log(messages);
             messager[reciever].push({
                            "name" : list[0]._id,
                            "message" : messages
                       });

            
             
         }

          
         $scope.delete = function (){
            $scope.deletes = true;
         }

         $scope.recover = function(){
          $scope.deletes = false;
         }
          
         $scope.DeleteItem = function(friend){
           friendData.DeleteFriend(friend).success(function (data){
             
         });

           friendData.getFriendsList().success(function (data){
                     $scope.friends = data[0].friends;
                  });
         };



         $scope.chat = function (friend){
          content = null;
            $scope.Reciver = friend.name;
            $scope.groupNumber = null;
            $scope.group_id = friend._id;
            content = messager[friend._id];
             $scope.show = false;
         }

         $scope.chatGroup = function (friend) {
          content = null;
            $scope.Reciver = friend.trip_name;
            $scope.groupNumber = "(" + friend.member.length + ")";
            $scope.group_id = friend._id;
            content = groupMessage;
            $scope.show = false;
         }
  

           
          $scope.open = function () {

                var modalInstance = $uibModal.open({
                  //animation: $scope.animationsEnabled,
                  templateUrl: 'addfriend.html',
                  controller: 'addFriendCtrl',
                  //size: 'sm',
             });


                modalInstance.result.then(function () {
                    friendData.getFriendsList().success(function (data){
                     $scope.friends = data[0].friends;
                  });
                  }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                  });
          };


     })
     .controller('addFriendCtrl', function ($scope, $http, friendData, $interval, $uibModalInstance){
          $scope.show = true;
          


          $scope.add = function (friend){

              $http.get('/check' + friend).success(function (data){
                 if(data.length == 0){
                   $scope.message = "The username is not existed";
                  $scope.show = false;
                 }else{
                   $http.put('/addfriends/' + friend).success(function (data){});
                   $scope.message = friend + "has in your chatting list press <cancel> and start to chat";
                   $scope.show = false;
                   $uibModalInstance.close();
                 }
                 
                   
              });

              
          };
           
          $scope.cancel = function () {
               $uibModalInstance.dismiss('cancel');
            };
            
         
     });


