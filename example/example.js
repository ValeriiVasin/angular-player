;(function () {
  'use strict';

  angular.module('Example', ['Player'])

    .controller('ExampleCtrl', ['$scope', '$http', 'Playlist',
                      function ( $scope,   $http,   Playlist ) {

      $http.get('data.json').then(function (response) {
        Playlist.add('default', response.data);
      });
    }]);
}());
