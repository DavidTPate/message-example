'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
]).
    config(['$routeProvider', function ($routeProvider) {
               $routeProvider.
                   when('/chat', {
                            templateUrl: 'partials/chat.html',
                            controller: 'ChatCtrl'
                        }).
                   otherwise({
                                 redirectTo: '/chat'
                             });
           }]
);
