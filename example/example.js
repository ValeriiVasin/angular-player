;(function () {
    'use strict';

    var app = angular.module('Example', ['Player', 'ngSanitize']);

    app.controller('ExampleCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.songs = [];

        $http.get('data.json').then(function (response) {
            $scope.songs = response.data;
        });
    }]);
}());
