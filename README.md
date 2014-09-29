# Getting started
Simple AngularJS audio player that could be used in your project.

# Basic example
```bash
bower install angular-player
```

Layout `index.html`:
```html
<!doctype html>
<html lang="en" ng-app="Example">
<head>
  <meta charset="UTF-8">
  <title>AngularJS Player</title>
  <link rel="stylesheet" href="bower_components/angular-player/dist/player.min.css" />
</head>
<body ng-controller="ExampleCtrl">

  <!-- player directive -->
  <div player player-shortcuts><div>

  <!-- dependencies of simple player -->
  <script src="bower_components/jquery/dist/jquery.min.js"></script>
  <script src="bower_components/angular/angular.min.js"></script></script>

  <script src="bower_components/jquery-ui/ui/minified/core.min.js"></script>
  <script src="bower_components/jquery-ui/ui/minified/widget.min.js"></script>
  <script src="bower_components/jquery-ui/ui/minified/mouse.min.js"></script>
  <script src="bower_components/jquery-ui/ui/minified/slider.min.js"></script>

  <script src="bower_components/angular-player/dist/player.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

Basic `app.js`
```js
angular.module('Example', ['Player'])
  .controller('ExampleCtrl', ['$scope', '$http', 'Playlist',
                    function ( $scope,   $http,   Playlist ) {

    $http.get('data.json').then(function (response) {
      Playlist.add('default', response.data);
    });
  }]);
```

Track format example:
```json
{
  "url": "http://upload.wikimedia.org/wikipedia/en/5/5e/U2_One.ogg",
  "artist": "U2",
  "title": "One"
}
```
