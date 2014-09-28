/**
 * @author Valerii Vasin (valerii.vasin@gmail.com)
 * @description AngularJS directive that allows to simply create HTML5 audio player
 *
 * Item format:
 *  - artist: String
 *  - title: String
 *  - [duration]: Number (seconds)
 *  - url: String
 *
 * @example
 *   <div player></div>
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
.directive('player', ['Queue', 'Audio', 'Playlist', 'Navigation',
            function ( Queue,   Audio,   Playlist,   Navigation ) {

    return {
      restrict: 'A',
      templateUrl: 'player.html',
      scope: true,
      controllerAs: 'player',
      controller: ['$scope', function ($scope) {
        var that = this;

        this.state = {

          // show elapsed time
          elapsed: false,

          paused: Audio.prop('paused'),

          loop: Audio.prop('loop')
        };

        this.showTimeElapsed = function (state) {

          // do not show elapsed time for continuous playing streams
          // like radiostations
          if ( state ) {
            if ( Audio.prop('duration') !== Infinity ) {
              that.state.elapsed = true;
            }

            return;
          }

          that.state.elapsed = false;
        };

        // update time from song progress slider
        that.setTime = function(time) {
          Audio.time(time);
        };

        // watch pause changes
        $scope.$watch(function () {
          return Audio.prop('paused');
        }, function (value) {
          that.state.paused = value;
        });

        // watch playlist change
        $scope.$watchCollection(function () {
          return Playlist.current.songs;
        }, function (songs) {
          that.songs = songs;
        });

        $scope.$watch(function() {
          return Playlist.currentSong;
        }, function(current) {
          // save current song params
          that.currentSong = current;
        });

        // watch loop changes
        $scope.$watch(function () {
          return Audio.prop('loop');
        }, function (value) {
          that.state.loop = value;
        });

        // watch and update current time
        this.time = 0;
        $scope.$watch(function () {
          return Audio.time();
        }, function (value) {
          that.time = value;
        });

        // watch volume changes
        this.volume = Audio.volume();
        $scope.$watch(function () {
          return that.volume;
        }, function(value) {
          Audio.volume(value);
        });

        // watch when ended
        $scope.$watch(function () {
          return Audio.prop('ended');
        }, function (value) {
          if (value) {
            that.controls.next();
            Audio.prop('ended', false);
          }
        });

        this.duration = 0;
        $scope.$watch(function () {
          return Audio.prop('duration');
        }, function (duration) {
          that.duration = duration;
        });

        // watch progress
        this.downloadProgress = { left: 0, width: 0 };
        $scope.$watch(function () {
          return Audio.getProgress();
        }, function (value, oldValue) {
          if (value === oldValue) {
            return;
          }

          // convert progress seconds to width
          var end = Math.floor(
            (value.end / Audio.prop('duration')) * 100
          );

          that.downloadProgress.left = 0;
          that.downloadProgress.width = end + '%';
        });

        // currently selected song
        that.selected = 0;
        $scope.$watch(function () {
          return Navigation.index;
        }, function (value, old) {
          if (value === old) {
            return;
          }

          that.selected = value;
        });

        this.isSelected = function(index) {
          return this.selected === index;
        };

        this.setSelected = function(index) {
          Navigation.set(index);
        };

        /**
         * Queue position to display
         * @param  {Object}        index  Song
         * @return {Number|String}        Position in queue or empty string
         */
        this.positionInsideQueue = function (song) {
          var position = Queue.position(song._index);

          return typeof position === 'number' ? position + 1 : '';
        };

        this.playSong = function(song) {
          Queue.prev(song._index);
          Playlist.play(song);
        };

        this.isCurrentSong = function(song) {
          return this.currentSong === song;
        };

        // controls
        this.controls = {};
        this.controls.togglePause = Audio.togglePause;

        this.controls.toggleLoop = function () {
          Audio.prop('loop', !Audio.prop('loop'));
        };

        this.controls.next = Playlist.next;
        this.controls.prev = Playlist.prev;
      }]
    };
  }
]);
