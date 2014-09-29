(function(module) {
try {
  module = angular.module('Player.Templates');
} catch (e) {
  module = angular.module('Player.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('player.html',
    '<div class="b-player"><div class="b-player__controls__info"><div class="b-player__controls__info__artist" ng-bind="player.currentSong.artist"></div><div class="b-player__controls__info__title" ng-bind="player.currentSong.title"></div></div><div class="b-player__controls__navigation"><div class="b-player__controls__navigation__prev"><div class="b-player__controls__navigation__prev-btn" ng-click="player.controls.prev()"></div></div><div class="b-player__controls__navigation__play"><div ng-click="player.controls.togglePause()" ng-show="player.state.paused" class="b-player__controls__navigation__play__play"></div><div ng-click="player.controls.togglePause()" ng-hide="player.state.paused" class="b-player__controls__navigation__play__pause"></div></div><div class="b-player__controls__navigation__next"><div class="b-player__controls__navigation__next-btn" ng-click="player.controls.next()"></div></div></div><div class="clear"></div><div class="b-player__controls__splitter"></div><div class="b-player__controls__playback"><div slider="player.time" slider-update="player.setTime(progress)" slider-max="player.duration" slider-preload="player.downloadProgress" class="slider b-player__controls__playback__progress"><div class="b-player__controls__playback__progress__download" ng-style="player.downloadProgress"></div></div><div ng-class="{\n' +
    '        \'b-player__controls__playback__time--left\': player.state.elapsed\n' +
    '      }" class="b-player__controls__playback__time"><div ng-bind="player.time | duration" ng-click="player.showTimeElapsed(true)" class="b-player__controls__playback__time__elapsed"></div><div ng-bind="(player.time - player.duration) | duration" ng-click="player.showTimeElapsed(false)" class="b-player__controls__playback__time__left"></div></div></div><ul class="b-player__controls__buttons"><li ng-click="player.controls.toggleLoop()" ng-class="{\n' +
    '        \'b-player__controls__buttons__loop--active\': player.state.loop,\n' +
    '        \'b-player__controls__buttons__loop\': !player.state.loop\n' +
    '      }"></li></ul><div class="b-player__controls__volume"><div class="b-player__controls__volume__low"></div><div slider="player.volume" class="b-player__controls__volume__progress slider"></div><div class="b-player__controls__volume__high"></div></div><div class="clear"></div><div class="b-player-search"><input type="search" name="search" class="b-player-search-dialog" autocomplete="off"></div><div class="clear"></div><ul class="b-player-playlist"><li ng-class="{\n' +
    '        \'playing\':  player.isCurrentSong(song),\n' +
    '        \'selected\': player.isSelected($index),\n' +
    '        \'queued\':   player.positionInsideQueue(song)\n' +
    '      }" ng-dblclick="player.playSong(song)" ng-click="player.setSelected($index)" ng-repeat="song in player.songs" class="b-player-playlist-item"><div class="b-player-playlist-item-inner b-state"><span ng-bind="player.positionInsideQueue(song)"></span></div><div class="b-player-playlist-item-inner b-position" ng-bind="$index + 1"></div><div class="b-player-playlist-item-inner b-song" ng-bind="song.artist + \' - \' + song.title"></div><div class="b-player-playlist-item-inner b-duration" ng-if="song.duration" ng-bind="song.duration | duration"></div></li></ul></div>');
}]);
})();

/**
 * Audio element abstraction
 * http://www.w3schools.com/tags/ref_av_dom.asp
 */
angular.module('Player.Audio', [])
  .factory('Audio', ['$rootScope', function ($rootScope) {
    var player = new Audio(),

        props = {
          src:    null,
          time:   0,
          volume: localStorage.getItem('volume'),

          // currently playing song duration
          duration: 0,

          // initial value: "not playing"
          paused: true,
          muted:  false,
          ended:  false,
          loop:   false
        },

        // last progress range
        // see: http://www.sitepoint.com/essential-audio-and-video-events-for-html5
        // `start` and `end` - seconds
        progress = { start: 0, end: 0 },

        floor = Math.floor,

        factory = {
          play:        play,
          time:        time,
          prop:        prop,
          volume:      volume,
          getProgress: getProgress,
          togglePause: togglePause
        };

    // set initial volume
    volume( props.volume ? Number(props.volume) : 100 );

    /**
     * Get / set music source
     * @private
     */
    function _source(src) {
      if (typeof src === 'undefined') {
        return src;
      }

      player.src = props.src = src;

      // reset progress
      progress = { start: 0, end: 0 };
    }

    /**
     * Get / set volume level: [0..100]
     */
    function volume(vol) {
      if (typeof vol === 'undefined') {
        return props.volume;
      }

      props.volume  = vol;
      player.volume = vol / 100;
      localStorage.setItem('volume', vol);
    }

    function play(src) {
      if (typeof src !== 'undefined') {
        _source(src);
      }

      props.paused = props.ended = false;
      player.play();
    }

    function pause() {
      props.paused = true;
      player.pause();
    }

    /**
     * Toggle pause state
     * @param  {Boolean} state Pause or not. If true: pause
     */
    function togglePause(state) {
      if (typeof state === 'undefined') {
        state = !props.paused;
      }

      if (state) {
        pause();
      } else {
        play();
      }
    }

    /**
     * Get / set time
     */
    function time(value) {
      if (typeof value === 'undefined') {
        return props.time;
      }

      // We could not change time if duration is Infinite
      // Notice: it's for online streams
      if ( prop('duration') === Infinity ) {
        return;
      }

      player.currentTime = props.time = value;
    }

    $(player)

      // preload=auto is needed for progress event
      .attr('preload', 'auto')

      // observe events
      .on({
        timeupdate: function () {
          props.time = floor(player.currentTime);
          $rootScope.$apply();
        },

        ended: function () {
          prop('ended', true);
          $rootScope.$apply();
        },

        durationchange: function () {
          prop('duration', player.duration);
          $rootScope.$apply();
        },

        progress: function () {
          var buffered = player.buffered,
              last     = buffered.length - 1;

          // sometimes nothing is loaded at the moment
          if (buffered.length === 0) {
            return;
          }

          progress = {
            start: buffered.start(last),
            end:   buffered.end(last)
          };

          $rootScope.$apply();
        }
      });

    // props getter/setter
    function prop(name, value) {
      if ( !props.hasOwnProperty(name) ) {
        throw new Error('prop `'+ name +'` does not exist');
      }

      // getter
      if (typeof value === 'undefined') {
        return props[name];
      }

      // setter
      props[name] = value;

      switch (name) {
        case 'loop':
          player.loop = Boolean(value);
          break;
      }
    }

    function getProgress() {
      return progress;
    }

    return factory;
  }]);

angular.module('Player.Duration', [])
  .factory('Utils', function() {
    /**
     * Add leading zeros to number until it will have correct length
     * @param {Number/String} value   Any number or stringified number
     * @param {Number}        length  Needed length
     * @param {String}        symbol  Symbol for padding
     * @return {String}               Value with leading zeros
     */

    function pad(value, length, symbol) {
      length = length || 2;
      symbol = symbol || '0';

      value = value.toString();
      while (value.length < length) {
        value = symbol + value;
      }

      return value;
    }

    return {
      pad: pad
    };
  })

  .filter('duration', ['Utils', function (Utils) {
      return function(duration) {
        if (duration === 0) {
          return '00:00';
        }

        if ( duration === -Infinity || duration === Infinity ) {
          return '∞';
        }

        var result = duration < 0 ? '-' : '';
        duration = Math.abs(duration);
        var minutes = Utils.pad(Math.floor(duration / 60));
        var seconds = Utils.pad(duration % 60);

        result = result + minutes + ':' + seconds;

        return result;
      };
    }
  ]);

angular.module('Player.Navigation', ['Player.Playlist'])
  .factory('Navigation', ['Playlist', function (Playlist) {
    var factory  = {
      next:  next,
      prev:  prev,
      set:   set,
      reset: reset,
      index: 0
    };

    /**
     * Set current index
     * @param {Number} index Playlist index
     */
    function set(index) {
      factory.index = index;
    }

    function reset() {
      factory.index = 0;
    }

    function next() {
      factory.index = Playlist.nextIndex(factory.index);
    }

    function prev() {
      factory.index = Playlist.prevIndex(factory.index);
    }

    return factory;
  }]);

/**
 * @example
 *   // Get url before play:
 *   Playlist.beforePlay = function (song) {
 *
 *     // request some remote server for song url
 *     VK.Api.call('audio.search', {q: song.title}, function (response) {
 *       song.url = response[1].url;
 *     });
 *   };
 */
angular.module('Player.Playlist', ['Player.Audio', 'Player.Queue'])
  .factory('Playlist', ['$q', 'Audio', 'Queue',
              function ( $q,   Audio,   Queue ) {

    var _playlists = {};

    // all songs array
    var _songsMap  = [];

    // playlists counter
    var count = 0;

    var current = { songs: [], name: null };

    var factory = {
      add: add,
      use: use,
      has: has,

      // current: {name, songs, length}
      current: current,

      // currently playing song
      currentSong: null,
      getSong: getSong,

      prevIndex: prevIndex,
      nextIndex: nextIndex,

      play: play,
      next: next,
      prev: prev,
      playByPosition: playByPosition
    };

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     */
    function add(name, songs) {
      if ( has(name) ) {
        throw new Error('Playlist with name `' + name + '` exists');
      }

      songs = angular.copy(songs);

      // add index
      songs.forEach(function (song) {
        var length = _songsMap.push(song);

        // save index into song instance
        song._index = length - 1;
      });

      _playlists[name] = songs;
      count += 1;

      // if it's first playlist - use it
      if ( count === 1 ) {
        use(name);
      }

      return factory;
    }

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     * @return {Boolean}      Return result:
     *                        true if playlist exist and could be used, otherwise: false
     */
    function use(name) {
      if ( !has(name) ) {
        return false;
      }

      // playlist is currently in use
      if ( current.name === name ) {
        return;
      }

      current.name = name,
      current.songs = _playlists[name];
      current.length = _playlists[name].length;
      factory.currentSong = getSong(0);

      return true;
    }

    /**
     * Check playlist existance
     * @param  {String}  name Playlist name
     * @return {Boolean}      Result: true if playlist exist, otherwise: false
     */
    function has(name) {
      return _playlists.hasOwnProperty(name);
    }

    //
    // Playing interface
    //

    function getSong(position) {
      return current.songs[position];
    }

    function nextIndex(index) {
      var next;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);

        if (index === -1) {
          index = 0;
        }
      }

      next = index + 1;
      return next < current.length ? next : 0;
    }

    function prevIndex(index) {
      var prev;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);
        if (index === -1) {
          index = 0;
        }
      }

      prev = index - 1;
      return prev >= 0 ? prev : current.length - 1;
    }

    // Play song
    function play(song) {

      // @todo: is this really used
      if (typeof song === 'number') {
        song = _songsMap[song];
      }

      if ( typeof factory.beforePlay === 'function' ) {

        // wrap to promise if non-promise value is returned
        $q.when( factory.beforePlay(song) )
          .then(function () {
            factory.currentSong = song;
            Audio.play( song.url );
          });
      } else {
        factory.currentSong = song;
        Audio.play( song.url );
      }
    }

    function playByPosition(position) {
      var song = getSong(position);

      Queue.prev(song._index);
      play( song );
    }

    /**
     * Play next song
     */
    function next() {
      var index = Queue.next(),
          song;

      // next queue is empty
      if (typeof index === 'undefined') {
        song = getSong( nextIndex() );

        // save to prev queue
        Queue.prev(song._index);
        play( song );
        return;
      }

      Queue.prev(index);
      play(index);
    }

    /**
     * Play prev song
     */
    function prev() {
      var index = Queue.prev(),
          song;

      if (typeof index === 'undefined') {
        // prev queue is empty
        song = getSong( prevIndex() );

        play( song );
        return;
      }

      play(index);
    }

    return factory;
  }]);

angular.module('Player.Queue', [])
  .factory('Queue', [function () {
    var _next = [], // FIFO
        _prev = []; // LIFO

    /**
     * Getter setter of next song
     * @param {Number} [index] If provided, index is added to next queue,
     *                         otherwise: retrieve index from next queue
     */
    function next(index) {
      if (typeof index === 'undefined') {
        return _next.shift();
      }

      _next.push(index);
    }

    /**
     * Add to next queue / or remove from it
     * @param  {Number} index Song uniq index
     */
    function toggleNext(index) {
      if ( _isInNextQueue(index) ) {
        removeFromNext(index);
      } else {
        next(index);
      }
    }

    /**
     * Remove from next queue
     * @param   {Number} index  Song uniq index
     */
    function removeFromNext(index) {
      if ( _isInNextQueue(index) ) {
        _next.splice( position(index) , 1);
      }
    }

    /**
     * Position in the next queue
     * @return {Number|null} Position inside the next queue or null, if is not in queue
     */
    function position(index) {
      var _position = _next.indexOf(index);

      return _position === -1 ? null : _position;
    }

    /**
     * Check song presence in next queue
     *
     * @param  {Number}  index Song uniq index
     * @return {Boolean}       Result of check
     */
    function _isInNextQueue(index) {
      return _next.indexOf(index) !== -1;
    }

    /**
     * Get / add to prev queue
     */
    function prev(index) {
      if (typeof index === 'undefined') {
        return _prev.pop();
      }

      _prev.push(index);
    }

    // reset queue
    function reset() {
      _next = [];
      _prev = [];
    }

    return {
      addToNext: next,
      next: next,
      position: position,
      removeFromNext: removeFromNext,
      toggleNext: toggleNext,
      addToPrev: prev,
      prev: prev,
      reset: reset
    };
  }]);

// keyboard shortcuts for the player
angular.module('Player.Shortcuts', [
  'Player.Audio',
  'Player.Navigation',
  'Player.Queue',
  'Player.Playlist'
])
.directive('playerShortcuts', ['$document', 'Audio', 'Navigation', 'Queue', 'Playlist',
                     function ( $document,   Audio,   Navigation,   Queue,   Playlist ) {

  return  {
    restrict: 'A',
    link: function ($scope) {
      function onKeydown(e) {
        var song;

        switch (e.which) {
          case 81:
            // Q - queue
            Queue.toggleNext(
              Playlist.getSong(Navigation.index)._index
            );
            e.preventDefault();
            break;
          case 32:
            // Space - pause/unpause current song
            Audio.togglePause();
            e.preventDefault();
            break;
          case 40:
            // Down - select next item in the list
            Navigation.next();
            e.preventDefault();
            break;
          case 38:
            // Up - select prev item in the list
            Navigation.prev();
            e.preventDefault();
            break;
          case 13:
            // Enter - play currently selected item
            song = Playlist.getSong(Navigation.index);
            Queue.prev(song._index);
            Playlist.play( song );

            e.preventDefault();
            break;
          case 84:
            // T - search box
            break;

            // no defaults
        }

        $scope.$apply();
      }

      $document.on('keydown', onKeydown);
      $scope.$on('$destroy', function () {
        $document.off('keydown', onKeydown);
      });
    }
  };
}]);

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
        this.controls.togglePause = function () {
          // start playing current song if source
          // has not been set before (initial state)
          if ( !Audio.prop('src') ) {
            that.playSong(that.currentSong);
          } else {
            Audio.togglePause();
          }
        };

        this.controls.toggleLoop = function () {
          Audio.prop('loop', !Audio.prop('loop'));
        };

        this.controls.next = Playlist.next;
        this.controls.prev = Playlist.prev;
      }]
    };
  }
]);

//
// <span slider="mymodel" sliderUpdate="fn(progress)" />
//
angular.module('Player.Slider', [])
  .directive('slider', ['$timeout', function ($timeout) {
      return {
        scope: {
          slider: '=',
          update: '&sliderUpdate',
          max: '=sliderMax'
        },
        link: function(scope, element, attrs) {
          // prevent applying time changes while user sliding
          var preventChanges = false;

          // update model on the fly, without passing value to update func
          var directApply = (typeof attrs.sliderUpdate === 'undefined');

          element.slider({
            range: 'min',
            start: function() {
              preventChanges = true;
            },
            slide: function(event, ui) {
              if (!directApply) {
                return;
              }

              $timeout(function() {
                scope.slider = ui.value;
              });
            },
            stop: function(event, ui) {
              $timeout(function() {
                preventChanges = false;
                if (directApply) {
                  return;
                }
                scope.update({
                  progress: ui.value
                });
              });
            }
          });

          scope.$watch('slider', function(value) {
            if (preventChanges) {
              return;
            }

            element.slider('option', 'value', value);
          });

          scope.$watch('max', function(current, prev) {
            if (current === prev) {
              return;
            }

            if ( current === Infinity ) {
              element.slider('disable');
            } else {
              element.slider('enable');

              // reset slider value to 0 after enabling
              element.slider('option', 'value', 0);
            }

            element.slider('option', 'max', current);
          });
        }
      };
    }
  ]);
