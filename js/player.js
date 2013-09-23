/**
 * @author Valerii Vasin (valerii.vasin@gmail.com)
 * @description AngularJS directive that allows to simply create HTML5 audio player
 *
 * Item format:
 *  - artist: String
 *  - title: String
 *  - duration: Number (seconds)
 *  - url: String
 *
 * @example
 * <ng-player></ng-player>
 */

angular.module('Player', [
  'Player.Slider',
  'Player.Duration',
  'Player.Queue',
  'Player.Navigation',
  'Player.Audio',
  'Player.Playlist',
  'Player.Templates',
  'Player.Shortcuts'
])
.directive('ngPlayer', ['Queue', 'Audio', 'Playlist', 'Navigation',
              function ( Queue,   Audio,   Playlist,   Navigation ) {

    return {
      restrict: 'E',
      templateUrl: 'player.html',
      link: function(scope) {
        // time show mode
        scope.showTimeLeft = false;

        scope.$watch(function() {
          return Playlist.currentSong;
        }, function(current, prev) {
          if (prev === current) {
            return;
          }

          // save current song params
          scope.duration = current.duration;
          scope.currentSong = current;
        });

        // update time from song progress slider
        scope.update = function(time) {
          Audio.time(time);
        };

        // watch volume changes
        scope.volume = Audio.volume();
        scope.$watch('volume', function(value, old) {
          if (value === old) {
            return;
          }
          Audio.volume(value);
        });

        // watch and update current time
        scope.time = 0;
        scope.$watch(function () {
          return Audio.time();
        }, function (value) {
          scope.time = value;
        });

        // watch when ended
        scope.$watch(function () {
          return Audio.prop('ended');
        }, function (value) {
          if (value) {
            scope.controls.next();
            Audio.prop('ended', false);
          }
        });

        // watch pause changes
        scope.isPaused = Audio.prop('paused');
        scope.$watch(function () {
          return Audio.prop('paused');
        }, function (value) {
          scope.isPaused = value;
        });

        // watch loop changes
        scope.loop = Audio.prop('loop');
        scope.$watch(function () {
          return Audio.prop('loop');
        }, function (value) {
          scope.loop = value;
        });

        // watch progress
        scope.downloadProgress = { left: 0, width: 0 };
        scope.$watch(function () {
          return Audio.getProgress();
        }, function (value, oldValue) {
          if (value === oldValue) {
            return;
          }

          // convert progress seconds to width
          var end = Math.floor( (value.end / scope.duration) * 100 );

          scope.downloadProgress = {
            left: 0,
            width: end + '%'
          };
        });

        // currently selected song
        scope.selected = 0;
        scope.$watch(function () {
          return Navigation.index;
        }, function (value, old) {
          if (value === old) {
            return;
          }
          scope.selected = value;
        });

        scope.isSelected = function(index) {
          return index === scope.selected;
        };

        scope.setSelected = function(index) {
          Navigation.set(index);
        };

        /**
         * Queue position to display
         * @param  {Object}        index  Song
         * @return {Number|String}        Position in queue or empty string
         */
        scope.positionInsideQueue = function (song) {
          var position = Queue.position(song._index);

          return typeof position === 'number' ? position + 1 : '';
        };

        scope.playSong = function(song) {
          Queue.prev(song._index);
          Playlist.play(song);
        };

        scope.isCurrentSong = function(song) {
          return scope.currentSong === song;
        };

        // controls
        scope.controls = {};
        scope.controls.toggle = Audio.togglePause;
        scope.toggleLoop = function () {
          Audio.prop('loop', !scope.loop);
        };

        scope.controls.next = Playlist.next;
        scope.controls.prev = Playlist.prev;
      }
    };
  }
]);
