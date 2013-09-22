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
 * <ng-player songs='songs'></ng-player>
 */

;(function() {
  'use strict';

  var app = angular.module('Player', []);

  //
  // Services
  //
  app.factory('Utils', function() {
    /**
     * Add leading zeros to number until it will have correct length
     * @param   {Number/String} value Any number or stringified number
     * @param {Number} length Needed length
     * @param {String} symbol Symbol for padding
     * @return {String}         Value with leading zeros
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
  });

  app.factory('Playlist', ['Audio', 'Queue', function (Audio, Queue) {
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
      if (typeof song === 'number') {
        song = _songsMap[song];
      }

      factory.currentSong = song;
      Audio.play( song.url );
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

  app.factory('Queue', [function () {
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

  //
  // Filters
  //
  app.filter('duration', ['Utils',
    function(Utils) {
      return function(duration) {
        if (duration === 0) {
          return '00:00';
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

  //
  // Directives
  //

  //
  // <span slider="mymodel" sliderUpdate="fn(progress)" />
  //
  app.directive('slider', ['$timeout',
    function($timeout) {
      return {
        scope: {
          slider: '=',
          update: '&sliderUpdate',
          max: '=sliderMax',

          /**
           * @todo Think how to remove downloading progress from slider
           */
          preload: '=sliderPreload'
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

            element.slider('option', 'max', current);
          });
        }
      };
    }
  ]);

  app.directive('ngPlayer', ['Queue', 'Audio', 'Playlist', 'Navigation',
                   function ( Queue,   Audio,   Playlist,   Navigation ) {

      return {
        restrict: 'E',
        templateUrl: function(element, attrs) {
          return attrs.view || 'views/player.html';
        },
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

  app.directive('shortcuts', ['Audio', 'Navigation', 'Queue', 'Playlist',
                    function ( Audio,   Navigation,   Queue,   Playlist ) {

    // keyboard shortcuts
    return function link(scope) {
      angular.element(document)
        .on('keydown', function(e) {
          scope.$apply(function() {
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
          });
        });
    };
  }]);

  app.factory('Navigation', ['Playlist', function (Playlist) {
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
   * Audio element abstraction
   * http://www.w3schools.com/tags/ref_av_dom.asp
   */
  app.factory('Audio', ['$timeout', function ($timeout) {
    var player = document.createElement('audio'),

        props = {
          src:    null,
          time:   null,
          volume: localStorage.getItem('volume'),

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

        floor = Math.floor;

    angular.element('body').append(player);

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

      player.currentTime = props.time = value;
    }

    $(player)

      // preload=auto is needed for progress event
      .attr('preload', 'auto')

      // observe events
      .on({
        timeupdate: function () {
          $timeout(function () {
            props.time = floor(player.currentTime);
          });
        },

        ended: function () {
          $timeout(function () {
            prop('ended', true);
          });
        },

        progress: function () {
          var buffered = player.buffered,
              last     = buffered.length - 1;

          // sometimes nothing is loaded at the moment
          if (buffered.length === 0) {
            return;
          }

          $timeout(function () {
            progress = {
              start: buffered.start(last),
              end: buffered.end(last)
            };
          });
        }
      });

    // props getter
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

    return {
      play:        play,
      time:        time,
      prop:        prop,
      volume:      volume,
      getProgress: getProgress,
      togglePause: togglePause
    };
  }]);

}());
