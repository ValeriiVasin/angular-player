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

  app.factory('Library', function() {
    var currentSongId = null,
      songs = [],
      lib = {};

    lib = {
      isCurrentSong: function(index) {
        return currentSongId === index;
      },

      currentSong: function() {
        return songs[currentSongId];
      },

      setCurrentSong: function(index) {
        currentSongId = index;
      },

      getCurrentSong: function() {
        return currentSongId;
      },

      songs: function() {
        return songs;
      },

      reset: function(data) {
        songs = data;
        currentSongId = 0;
      }
    };

    return lib;
  });

  app.factory('Queue', function() {
    var next = [],
      prev = [];

    return {
      addToNext: function(index) {
        next.push(index);
      },

      /**
       * Remove from next queue
       * @param   {Number} index Index of song inside of the playlist
       */
      removeFromNext: function(index) {
        next = next.filter(function(_index) {
          return index !== _index;
        });
      },

      /**
       * Add or remove from next queue
       */
      toggleNext: function(index) {
        if (next.indexOf(index) === -1) {
          this.addToNext(index);
        } else {
          this.removeFromNext(index);
        }
      },

      /**
       * Position in the next queue
       * @return {Number|null} Position inside the next queue or null, if is not in queue
       */
      position: function(index) {
        var position = next.indexOf(index);

        return position > -1 ? position : null;
      },

      addToPrev: function(index) {
        prev.push(index);
      },

      next: function() {
        return next.shift();
      },

      prev: function() {
        return prev.shift();
      },

      getNextQueue: function() {
        return Array.prototype.slice.call(next, 0);
      },

      getPrevQueue: function() {
        return Array.prototype.slice.call(prev, 0);
      },

      reset: function() {
        next = [];
        prev = [];
      }
    };
  });

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

            element.slider('option', 'max', current);
          });
        }
      };
    }
  ]);

  app.directive('ngPlayer', ['Library', 'Queue', 'Audio',
                   function ( Library,   Queue,   Audio ) {

      return {
        restrict: 'E',
        templateUrl: function(element, attrs) {
          return attrs.view || 'views/player.html';
        },
        scope: {
          songs: '='
        },
        link: function(scope) {
          // time show mode
          scope.showTimeLeft = false;

          scope.$watch('songs', function(newSongs) {
            Library.reset(newSongs);
          });

          scope.$watch(function() {
            return Library.currentSong();
          }, function(current, prev) {
            if (prev === current) {
              return;
            }

            // save current song params
            scope.duration = current.duration;
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


          // currently selected song
          scope.selected = 0;

          scope.isSelected = function(id) {
            return id === scope.selected;
          };

          scope.setSelected = function(id) {
            scope.selected = id;
          };

          scope.selectNext = function() {
            var next = scope.selected + 1;
            if (next >= Library.songs().length) {
              next = 0;
            }
            scope.selected = next;
          };

          scope.selectPrev = function() {
            var prev = scope.selected - 1;
            if (prev < 0) {
              prev = Library.songs().length - 1;
            }
            scope.selected = prev;
          };

          scope.playSelected = function() {
            scope.playSong(scope.selected);
          };

          /**
           * Add or remove selected song in next queue
           */
          scope.toggleSelectedInQueue = function() {
            Queue.toggleNext(scope.selected);
          };

          /**
           * Queue position to display
           * @param  {Number}      index Song index
           * @return {Number|String}      Position in queue or empty string
           */
          scope.positionInsideQueue = function(index) {
            var position = Queue.position(index);
            return typeof position === 'number' ? position + 1 : '';
          };

          scope.songs = function() {
            return Library.songs();
          };

          scope.currentSong = function() {
            return Library.currentSong();
          };

          scope.playSong = function(index, skipQueue) {
            if (!skipQueue) {
              Queue.addToPrev(Library.getCurrentSong());
            }
            Library.setCurrentSong(index);
            Audio.play(
              Library.currentSong().url
            );
          };

          scope.isCurrentSong = function(id) {
            return Library.isCurrentSong(id);
          };

          // controls
          scope.controls = {};
          scope.controls.toggle = Audio.togglePause;
          scope.toggleLoop = function () {
            Audio.prop('loop', !scope.loop);
          };

          scope.controls.next = function() {
            var index = Queue.next();

            if (typeof index === 'undefined') {
              index = Library.getCurrentSong() + 1;
              if (index > Library.songs().length - 1) {
                index = 0;
              }
            }

            scope.playSong(index);
          };

          scope.controls.prev = function() {
            var index = Queue.prev();

            if (typeof index === 'undefined') {
              index = Library.getCurrentSong() - 1;
              if (index < 0) {
                index = Library.songs().length - 1;
              }
            }

            scope.playSong(index, true);
          };

          // keyboard shortcuts
          angular.element(document)
            .bind('keydown', function(e) {
              scope.$apply(function() {
                switch (e.which) {
                  case 81:
                    // Q - queue
                    scope.toggleSelectedInQueue();
                    e.preventDefault();
                    break;
                  case 32:
                    // Space - pause/unpause current song
                    e.preventDefault();
                    break;
                  case 40:
                    // Down - select next item in the list
                    scope.selectNext();
                    e.preventDefault();
                    break;
                  case 38:
                    // Up - select prev item in the list
                    scope.selectPrev();
                    e.preventDefault();
                    break;
                  case 13:
                    // Enter - play currently selected item
                    scope.playSelected();
                    e.preventDefault();
                    break;
                  case 84:
                    // T - search box
                    break;

                    // no defaults
                }
              });
            });
        }
      };
    }
  ]);

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

    // observe events
    $(player).on({
      timeupdate: function () {
        $timeout(function () {
          props.time = floor(player.currentTime);
        });
      },

      ended: function () {
        $timeout(function () {
          prop('ended', true);
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

    return {
      play:        play,
      time:        time,
      prop:        prop,
      volume:      volume,
      togglePause: togglePause
    };
  }]);

}());
