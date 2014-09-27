;(function () {
    'use strict';

    var app = angular.module('Example', ['Player', 'ngSanitize']);

    app.controller('ExampleCtrl', ['$scope', '$http', 'Playlist',
                         function ( $scope,   $http,   Playlist ) {

        $http.get('data.json').then(function (response) {
            Playlist.add('default', response.data);
        });
    }]);
}());
