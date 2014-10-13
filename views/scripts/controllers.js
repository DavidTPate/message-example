'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('ChatCtrl', ['$scope', '$http', function ($scope, $http) {
                    $scope.chatMessage = '';
                    $http.get('messages').success(function (data) {
                        $scope.messages = data;
                    });

                    $scope.sendMessage = function() {
                        var msg = { content: $scope.chatMessage };
                      $http.post('messages', msg).success(function() {
                          $scope.messages.push(msg);
                          $scope.chatMessage = '';
                      });
                    };
                }]);