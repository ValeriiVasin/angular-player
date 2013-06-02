;(function () {
    'use strict';

    var app = angular.module('Example', ['Player']);

    app.controller('ExampleCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.songs = [];

        $http
            .get('mp3/data.json')
            .success(function (songs) {
                $scope.songs = songs;
            });
    }]);
}());
