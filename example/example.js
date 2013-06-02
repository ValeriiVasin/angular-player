;(function () {
    'use strict';

    var app = angular.module('Example', ['Player']);

    app.controller('ExampleCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.songs = [];

        $http
            .get('data.json')
            .success(function (songs) {
                $scope.songs = songs;
            });
    }]);
}());
